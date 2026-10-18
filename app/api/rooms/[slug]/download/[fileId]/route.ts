import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string; fileId: string } }
) {
  const supabase = createServiceSupabase();

  const { data: room } = await supabase
    .from("rooms")
    .select("id, status, expires_at, allow_download")
    .eq("slug", params.slug)
    .single();

  if (!room || room.status === "disabled" || !room.allow_download) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (room.expires_at && new Date(room.expires_at) < new Date()) {
    return NextResponse.json({ error: "expired" }, { status: 410 });
  }

  const { data: file } = await supabase
    .from("room_files")
    .select("id, storage_path, original_name")
    .eq("id", params.fileId)
    .eq("room_id", room.id)
    .single();

  if (!file) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: signed, error } = await supabase.storage
    .from("deliveries")
    .createSignedUrl(file.storage_path, 60, { download: file.original_name });

  if (error || !signed) {
    return NextResponse.json({ error: "sign_failed" }, { status: 500 });
  }

  await supabase.from("room_events").insert({
    room_id: room.id,
    file_id: file.id,
    type: "downloaded_file",
  });

  return NextResponse.redirect(signed.signedUrl);
}
