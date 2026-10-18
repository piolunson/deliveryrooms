import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

// Uwaga: dodaj "bcryptjs" i "@types/bcryptjs" do package.json przed wdrożeniem
// (pominięte w zależnościach startowych, żeby nie komplikować instalacji).

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { password } = await req.json();
  const supabase = createServiceSupabase();

  const { data: room } = await supabase
    .from("rooms")
    .select("id, password_hash, status, expires_at")
    .eq("slug", params.slug)
    .single();

  if (!room || room.status === "disabled") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (room.expires_at && new Date(room.expires_at) < new Date()) {
    return NextResponse.json({ error: "expired" }, { status: 410 });
  }
  if (!room.password_hash) {
    return NextResponse.json({ ok: true });
  }

  const valid = await bcrypt.compare(password ?? "", room.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  // Krótkotrwały cookie dostępu, ograniczony do tego pokoju.
  res.cookies.set(`room_access_${params.slug}`, "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 6, // 6 godzin
    path: `/d/${params.slug}`,
  });
  return res;
}
