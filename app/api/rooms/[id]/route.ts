import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";
import { sendEmail, emailTemplates } from "@/lib/email";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  clientName: z.string().min(1).max(200).optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  message: z.string().max(2000).optional(),
  coCreators: z.array(z.object({ name: z.string().min(1).max(80) })).max(3).optional(),
  expiresInDays: z.union([z.number(), z.null()]).optional(), // null = bez limitu
  password: z.string().max(100).optional().or(z.literal("")),
  allowZip: z.boolean().optional(),
  allowDownload: z.boolean().optional(),
  hidePoweredBy: z.boolean().optional(),
  coverFileId: z.string().uuid().optional(),
  brandSnapshot: z
    .object({
      accent_color: z.string().optional(),
      font_key: z.string().optional(),
      theme: z.string().optional(),
      background_type: z.string().optional(),
      background_value: z.string().optional(),
      layout: z.string().optional(),
    })
    .optional(),
  status: z.enum(["draft", "active", "disabled"]).optional(),
});

async function getOwnedRoom(supabase: ReturnType<typeof createServerSupabase>, id: string, userId: string) {
  const { data } = await supabase.from("rooms").select("*").eq("id", id).eq("owner_id", userId).single();
  return data;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const room = await getOwnedRoom(supabase, params.id, user.id);
  if (!room) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const body = parsed.data;

  const patch: Record<string, unknown> = {};
  if (body.title !== undefined) patch.title = body.title;
  if (body.clientName !== undefined) patch.client_name = body.clientName;
  if (body.clientEmail !== undefined) patch.client_email = body.clientEmail || null;
  if (body.message !== undefined) patch.message = body.message;
  if (body.coCreators !== undefined) patch.co_creators = body.coCreators;
  if (body.allowZip !== undefined) patch.allow_zip = body.allowZip;
  if (body.allowDownload !== undefined) patch.allow_download = body.allowDownload;
  if (body.hidePoweredBy !== undefined) patch.hide_powered_by = body.hidePoweredBy;
  if (body.coverFileId !== undefined) patch.cover_file_id = body.coverFileId;
  if (body.status !== undefined) {
    patch.status = body.status;
    if (body.status === "active" && !room.published_at) {
      patch.published_at = new Date().toISOString();
    }
  }

  if (body.expiresInDays !== undefined) {
    patch.expires_at =
      body.expiresInDays === null
        ? null
        : new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  }

  if (body.password !== undefined) {
    patch.password_hash = body.password ? await bcrypt.hash(body.password, 10) : null;
  }

  if (body.brandSnapshot !== undefined) {
    patch.brand_snapshot = { ...(room.brand_snapshot ?? {}), ...body.brandSnapshot };
  }

  const { data: updated, error } = await supabase
    .from("rooms")
    .update(patch)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const justPublished = body.status === "active" && room.status !== "active";
  if (justPublished && updated.client_email) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const service = createServiceSupabase();
    const { data: creatorProfile } = await service
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    const creatorName = creatorProfile?.display_name || "Twórca";
    const tpl = emailTemplates.deliveryReady({
      to: updated.client_email,
      clientName: updated.client_name,
      creatorName,
      title: updated.title,
      message: updated.message,
      expiresAt: updated.expires_at ? new Date(updated.expires_at).toLocaleDateString("pl-PL") : undefined,
      roomUrl: `${siteUrl}/d/${updated.slug}`,
    });
    await sendEmail({ to: updated.client_email, ...tpl });
  }

  return NextResponse.json({ room: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const room = await getOwnedRoom(supabase, params.id, user.id);
  if (!room) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const service = createServiceSupabase();
  const { data: files } = await service.from("room_files").select("storage_path").eq("room_id", params.id);
  const paths = (files ?? []).map((f) => f.storage_path).filter(Boolean);
  if (paths.length) await service.storage.from("deliveries").remove(paths);

  const { error } = await supabase.from("rooms").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
