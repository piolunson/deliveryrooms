import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";

const schema = z.object({
  storagePath: z.string().min(1),
  thumbPath: z.string().optional(),
  previewPath: z.string().optional(),
  originalName: z.string().min(1).max(255),
  mime: z.string().min(1),
  sizeBytes: z.number().min(0),
  width: z.number().optional(),
  height: z.number().optional(),
  durationSeconds: z.number().optional(),
  position: z.number().default(0),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: room } = await supabase
    .from("rooms")
    .select("id")
    .eq("id", params.id)
    .eq("owner_id", user.id)
    .single();
  if (!room) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const b = parsed.data;

  const { data: file, error } = await supabase
    .from("room_files")
    .insert({
      room_id: params.id,
      storage_path: b.storagePath,
      thumb_path: b.thumbPath ?? null,
      preview_path: b.previewPath ?? null,
      original_name: b.originalName,
      mime: b.mime,
      size_bytes: b.sizeBytes,
      width: b.width ?? null,
      height: b.height ?? null,
      duration_seconds: b.durationSeconds ?? null,
      position: b.position,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("file_reviews").insert({ file_id: file.id, status: "pending" });

  // Aktualizacja zużycia miejsca (prosty odczyt + zapis; przy dużym ruchu
  // równoległym rozważ docelowo funkcję SQL z atomowym increment).
  const { data: profile } = await supabase
    .from("profiles")
    .select("storage_used_bytes")
    .eq("id", user.id)
    .single();
  await supabase
    .from("profiles")
    .update({ storage_used_bytes: (profile?.storage_used_bytes ?? 0) + b.sizeBytes })
    .eq("id", user.id);

  return NextResponse.json({ file });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { fileId } = await req.json();

  const { data: file } = await supabase
    .from("room_files")
    .select("id, room_id, size_bytes, rooms!inner(owner_id)")
    .eq("id", fileId)
    .eq("room_id", params.id)
    .single();

  // @ts-expect-error - joined relation typing simplified for brevity
  if (!file || file.rooms.owner_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await supabase.from("room_files").update({ is_deleted: true }).eq("id", fileId);

  return NextResponse.json({ ok: true });
}
