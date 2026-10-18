import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const cookieName = `opened_${params.slug}`;
  if (req.cookies.get(cookieName)) {
    return NextResponse.json({ ok: true, alreadyLogged: true });
  }

  const supabase = createServiceSupabase();
  const { data: room } = await supabase
    .from("rooms")
    .select("id, title, owner_id")
    .eq("slug", params.slug)
    .single();

  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName, "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: `/d/${params.slug}`,
  });

  if (!room) return res;

  await supabase.from("room_events").insert({ room_id: room.id, type: "opened" });

  const { data: profile } = await supabase
    .from("profiles")
    .select("notify_email")
    .eq("id", room.owner_id)
    .single();

  if (profile?.notify_email) {
    const { data: authUser } = await supabase.auth.admin.getUserById(room.owner_id);
    const creatorEmail = authUser?.user?.email;
    if (creatorEmail) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const tpl = emailTemplates.roomOpened({
        to: creatorEmail,
        title: room.title,
        when: new Date().toLocaleString("pl-PL"),
        activityUrl: `${siteUrl}/app/pokoje/${room.id}`,
      });
      await sendEmail({ to: creatorEmail, ...tpl });
    }
  }

  return res;
}
