import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";

// Wywoływane codziennie przez Vercel Cron (patrz vercel.json).
// Zabezpieczone nagłówkiem Authorization z CRON_SECRET.

const GRACE_DAYS = 14; // ile dni po wygaśnięciu pokoju trzymamy jeszcze pliki

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceSupabase();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - GRACE_DAYS);

  const { data: expiredRooms } = await supabase
    .from("rooms")
    .select("id, owner_id, room_files(id, storage_path, size_bytes)")
    .lt("expires_at", cutoff.toISOString())
    .eq("status", "active");

  let deletedFiles = 0;

  for (const room of expiredRooms ?? []) {
    const paths = (room.room_files ?? []).map((f: any) => f.storage_path).filter(Boolean);
    if (paths.length) {
      await supabase.storage.from("deliveries").remove(paths);
      deletedFiles += paths.length;
    }
    await supabase.from("room_files").delete().eq("room_id", room.id);
    await supabase.from("rooms").update({ status: "disabled" }).eq("id", room.id);
  }

  return NextResponse.json({
    ok: true,
    roomsProcessed: expiredRooms?.length ?? 0,
    deletedFiles,
  });
}
