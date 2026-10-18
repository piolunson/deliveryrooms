import { notFound } from "next/navigation";
import { createServiceSupabase } from "@/lib/supabase/server";
import RoomClient, { RoomData, RoomFile } from "./room-client";
import { t } from "@/lib/i18n";
import PasswordGate from "./password-gate";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

async function loadRoom(slug: string) {
  const supabase = createServiceSupabase();

  const { data: room } = await supabase
    .from("rooms")
    .select("*, room_files(*)")
    .eq("slug", slug)
    .single();

  if (!room) return { room: null as null, files: [] as RoomFile[] };

  const { data: reviews } = await supabase
    .from("file_reviews")
    .select("*")
    .in(
      "file_id",
      (room.room_files ?? []).map((f: any) => f.id)
    );

  const reviewByFile = new Map((reviews ?? []).map((r: any) => [r.file_id, r]));

  const files: RoomFile[] = (room.room_files ?? [])
    .filter((f: any) => !f.is_deleted)
    .sort((a: any, b: any) => a.position - b.position)
    .map((f: any) => ({
      id: f.id,
      name: f.original_name,
      kind: f.mime?.startsWith("video") ? "video" : f.mime?.startsWith("image") ? "image" : "other",
      // W produkcji: signed URL z supabase.storage.from('deliveries').createSignedUrl(f.thumb_path, 60)
      thumbUrl: f.thumb_path ?? "/placeholder-thumb.jpg",
      status: reviewByFile.get(f.id)?.status ?? "pending",
      commentCount: 0,
    }));

  return { room, files };
}

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { pw?: string };
}) {
  const { room, files } = await loadRoom(params.slug);

  if (!room) notFound();

  if (room.status === "disabled") {
    return <StatusScreen title={t("room.disabled.title")} />;
  }

  if (room.expires_at && new Date(room.expires_at) < new Date()) {
    return <StatusScreen title={t("room.expired.title")} subtitle={t("room.expired.subtitle")} />;
  }

  if (room.password_hash) {
    // W produkcji: weryfikacja hasła w route handlerze (bcrypt.compare) +
    // krótkotrwały podpisany cookie dostępu. Tu: prosta brama po stronie klienta,
    // uzupełnij właściwą weryfikację serwerową przed wdrożeniem produkcyjnym.
    return <PasswordGate slug={params.slug} />;
  }

  const coverFile = files.find((f) => f.id === room.cover_file_id) ?? files[0];
  const brand = room.brand_snapshot ?? {};

  const data: RoomData = {
    title: room.title,
    clientName: room.client_name,
    creators:
      Array.isArray(room.co_creators) && room.co_creators.length
        ? room.co_creators.map((c: any) => c.name)
        : ["Twórca"],
    coverUrl: coverFile?.thumbUrl ?? "/placeholder-cover.jpg",
    accentColor: brand.accent_color ?? "#2F6FEB",
    backgroundClass: brand.background_value ?? "aurora-amber",
    files,
    allowZip: room.allow_zip,
    hidePoweredBy: room.hide_powered_by ?? false,
  };

  return <RoomClient room={data} slug={params.slug} />;
}

function StatusScreen({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-white">
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="mt-2 text-white/60">{subtitle}</p>}
    </div>
  );
}
