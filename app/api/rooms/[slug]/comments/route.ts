import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceSupabase } from "@/lib/supabase/server";

const schema = z.object({
  fileId: z.string().uuid(),
  authorName: z.string().min(1).max(80),
  body: z.string().min(1).max(2000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const supabase = createServiceSupabase();

  const { data: room } = await supabase
    .from("rooms")
    .select("id, status")
    .eq("slug", params.slug)
    .single();

  if (!room || room.status === "disabled") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { fileId, authorName, body } = parsed.data;

  // Sanityzacja: usuwamy znaczniki HTML, żeby komentarz nie wykonał się jako kod
  // w panelu twórcy (podstawowa ochrona przed XSS; render i tak powinien
  // escapować tekst po stronie Reacta, co robi domyślnie).
  const clean = body.replace(/<[^>]*>/g, "").trim();

  const { error } = await supabase.from("file_comments").insert({
    room_id: room.id,
    file_id: fileId,
    author_type: "client",
    author_name: authorName,
    body: clean,
  });

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  await supabase.from("room_events").insert({
    room_id: room.id,
    file_id: fileId,
    type: "commented",
    actor_name: authorName,
  });

  return NextResponse.json({ ok: true });
}
