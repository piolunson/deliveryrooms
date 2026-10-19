import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  storageLimitGb: z.number().min(1).max(1000).default(10),
});

function generateTempPassword() {
  // 12 znaków, czytelne (bez mylących podobnie O/0, l/1 itd.)
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req: NextRequest) {
  // Sprawdź, że wywołujący jest zalogowanym adminem (sesja z cookies).
  const sessionSupabase = createServerSupabase();
  const {
    data: { user },
  } = await sessionSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: callerProfile } = await sessionSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (callerProfile?.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { email, displayName, storageLimitGb } = parsed.data;

  const admin = createServiceSupabase();
  const tempPassword = generateTempPassword();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message ?? "create_failed" },
      { status: 400 }
    );
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    role: "creator",
    display_name: displayName,
    storage_limit_bytes: storageLimitGb * 1024 * 1024 * 1024,
    must_change_password: true,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // W produkcji: wyślij tempPassword mailem przez Resend zamiast zwracać
  // go w odpowiedzi API (tu zwracamy, żeby admin mógł od razu skopiować
  // i przekazać koledze osobiście — zgodnie z tekstem "Konto utworzone...").
  return NextResponse.json({
    ok: true,
    email,
    tempPassword,
  });
}
