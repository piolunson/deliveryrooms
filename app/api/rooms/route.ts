import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("*, room_files(id)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rooms });
}

const createSchema = z.object({
  title: z.string().min(1).max(200).default("Nowa dostawa"),
});

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => ({})));
  const title = parsed.success ? parsed.data.title : "Nowa dostawa";

  const { data: room, error } = await supabase
    .from("rooms")
    .insert({
      slug: nanoid(12),
      owner_id: user.id,
      title,
      client_name: "",
      status: "draft",
      allow_zip: true,
      allow_download: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ room });
}
