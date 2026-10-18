import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceSupabase } from "@/lib/supabase/server";
import { sendEmail, emailTemplates } from "@/lib/email";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().min(1).max(1000),
  authorName: z.string().min(1).max(80),
  authorRole: z.string().max(80).optional(),
  consentPublic: z.boolean(),
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
    .select("id, title, owner_id")
    .eq("slug", params.slug)
    .single();

  if (!room) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { rating, body, authorName, authorRole, consentPublic } = parsed.data;

  // Opinia trafia zawsze ze statusem "pending" — nigdy nie jest publikowana
  // automatycznie, nawet jeśli consentPublic = true. Publikację zatwierdza
  // wyłącznie admin w /admin/opinie.
  const { error } = await supabase.from("testimonials").insert({
    room_id: room.id,
    rating,
    body,
    author_name: authorName,
    author_role: authorRole ?? null,
    consent_public: consentPublic,
    status: "pending",
  });

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("notify_email")
    .eq("id", room.owner_id)
    .single();

  if (profile?.notify_email) {
    const { data: authUser } = await supabase.auth.admin.getUserById(room.owner_id);
    const creatorEmail = authUser?.user?.email;
    if (creatorEmail) {
      const tpl = emailTemplates.newTestimonial({
        to: creatorEmail,
        clientName: authorName,
        title: room.title,
        rating,
        body,
      });
      await sendEmail({ to: creatorEmail, ...tpl });
    }
  }

  return NextResponse.json({ ok: true });
}
