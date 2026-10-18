import { NextRequest } from "next/server";
import archiver from "archiver";
import { PassThrough } from "stream";
import { createServiceSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60; // sekundy — limit funkcji na planie Vercel Pro

// Powyżej tej łącznej wielkości proponujemy pobieranie pojedynczych plików
// zamiast jednego wielkiego ZIP-a (ograniczenie czasu wykonania funkcji).
const SAFE_ZIP_BYTES = 1.5 * 1024 * 1024 * 1024; // ~1,5 GB

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createServiceSupabase();

  const { data: room } = await supabase
    .from("rooms")
    .select("id, title, status, expires_at, allow_zip, room_files(*)")
    .eq("slug", params.slug)
    .single();

  if (!room || room.status === "disabled" || !room.allow_zip) {
    return new Response("not_found", { status: 404 });
  }
  if (room.expires_at && new Date(room.expires_at) < new Date()) {
    return new Response("expired", { status: 410 });
  }

  const files = (room.room_files ?? []).filter((f: any) => !f.is_deleted);
  const totalBytes = files.reduce((sum: number, f: any) => sum + (f.size_bytes ?? 0), 0);

  if (totalBytes > SAFE_ZIP_BYTES) {
    return Response.json(
      {
        error: "too_large",
        message:
          "Ta dostawa jest zbyt duża na jeden plik ZIP. Pobierz pliki pojedynczo.",
        totalBytes,
      },
      { status: 413 }
    );
  }

  const archive = archiver("zip", { zlib: { level: 6 } });
  const stream = new PassThrough();
  archive.pipe(stream);

  (async () => {
    for (const file of files) {
      const { data } = await supabase.storage
        .from("deliveries")
        .download(file.storage_path);
      if (data) {
        const buf = Buffer.from(await data.arrayBuffer());
        archive.append(buf, { name: file.original_name });
      }
    }
    archive.finalize();
  })().catch((err) => {
    console.error("Błąd generowania ZIP:", err);
    archive.abort();
  });

  await supabase.from("room_events").insert({ room_id: room.id, type: "downloaded_zip" });

  const fileName = `${room.title.replace(/[^a-zA-Z0-9-_]/g, "-")}.zip`;

  // @ts-expect-error - Node Readable is a valid BodyInit at runtime on Vercel
  return new Response(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
