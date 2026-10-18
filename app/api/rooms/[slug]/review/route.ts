import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceSupabase } from "@/lib/supabase/server";
import { sendEmail, emailTemplates } from "@/lib/email";

const schema = z.object({
  fileId: z.string().uuid(),
  status: z.enum(["approved", "changes_requested", "pending"]),
  reviewerName: z.string().min(1).max(80),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { fileId, status, reviewerName } = parsed.data;
  const supabase = createServiceSupabase();

  // Zweryfikuj, że plik faktycznie należy do pokoju o tym slugu (ochrona IDOR).
  const { data: room } = await supabase
    .from("rooms")
    .select("id, status, expires_at")
    .eq("slug", params.slug)
    .single();

  if (!room || room.status === "disabled") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (room.expires_at && new Date(room.expires_at) < new Date()) {
    return NextResponse.json({ error: "expired" }, { status: 410 });
  }

  const { data: file } = await supabase
    .from("room_files")
    .select("id")
    .eq("id", fileId)
    .eq("room_id", room.id)
    .single();

  if (!file) return NextResponse.json({ error: "file_not_in_room" }, { status: 404 });

  await supabase.from("file_reviews").upsert({
    file_id: fileId,
    status,
    reviewer_name: reviewerName,
    updated_at: new Date().toISOString(),
  });

  await supabase.from("room_events").insert({
    room_id: room.id,
    file_id: fileId,
    type: status === "approved" ? "approved" : "changes_requested",
    actor_name: reviewerName,
  });

  await notifyCreator(supabase, room.id, status, reviewerName);

  return NextResponse.json({ ok: true });
}

async function notifyCreator(
  supabase: ReturnType<typeof createServiceSupabase>,
  roomId: string,
  status: "approved" | "changes_requested" | "pending",
  reviewerName: string
) {
  const { data: roomFull } = await supabase
    .from("rooms")
    .select("id, title, slug, owner_id, room_files(id)")
    .eq("id", roomId)
    .single();
  if (!roomFull) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("notify_email")
    .eq("id", roomFull.owner_id)
    .single();
  if (!profile?.notify_email) return;

  const { data: authUser } = await supabase.auth.admin.getUserById(roomFull.owner_id);
  const creatorEmail = authUser?.user?.email;
  if (!creatorEmail) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const roomUrl = `${siteUrl}/app/pokoje/${roomId}`;

  if (status === "changes_requested") {
    const { count } = await supabase
      .from("file_reviews")
      .select("file_id", { count: "exact", head: true })
      .eq("status", "changes_requested");
    const tpl = emailTemplates.changesRequested({
      to: creatorEmail,
      title: roomFull.title,
      count: count ?? 1,
      roomUrl,
    });
    await sendEmail({ to: creatorEmail, ...tpl });
    return;
  }

  if (status === "approved") {
    const fileIds = (roomFull.room_files ?? []).map((f: any) => f.id);
    const { data: reviews } = await supabase
      .from("file_reviews")
      .select("status")
      .in("file_id", fileIds);
    const allApproved =
      fileIds.length > 0 && (reviews ?? []).every((r) => r.status === "approved");
    if (allApproved) {
      const tpl = emailTemplates.fullyApproved({
        to: creatorEmail,
        clientName: reviewerName,
        title: roomFull.title,
        roomUrl,
      });
      await sendEmail({ to: creatorEmail, ...tpl });
      await supabase.from("room_events").insert({ room_id: roomId, type: "reviewed_all", actor_name: reviewerName });
    }
  }
}
