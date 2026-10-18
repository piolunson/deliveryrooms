import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";

const schema = z.object({
  roomId: z.string().uuid(),
  fileName: z.string().min(1).max(255),
});

// Zwraca podpisany URL do wysyłki PLIKU PRZEZ PRZEGLĄDARKĘ bezpośrednio do
// Supabase Storage (nigdy przez tę funkcję — to tylko wydaje "przepustkę").
export async function POST(req: NextRequest) {
  const sessionSupabase = createServerSupabase();
  const {
    data: { user },
  } = await sessionSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { roomId, fileName } = parsed.data;

  // Pokój musi należeć do zalogowanego twórcy.
  const { data: room } = await sessionSupabase
    .from("rooms")
    .select("id, owner_id")
    .eq("id", roomId)
    .eq("owner_id", user.id)
    .single();
  if (!room) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // Sprawdź limit miejsca.
  const { data: profile } = await sessionSupabase
    .from("profiles")
    .select("storage_used_bytes, storage_limit_bytes")
    .eq("id", user.id)
    .single();
  if (profile && profile.storage_used_bytes >= profile.storage_limit_bytes) {
    return NextResponse.json({ error: "storage_limit_reached" }, { status: 413 });
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${user.id}/${roomId}/${Date.now()}-${safeName}`;

  const service = createServiceSupabase();
  const { data, error } = await service.storage
    .from("deliveries")
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: "sign_failed" }, { status: 500 });
  }

  return NextResponse.json({
    path: data.path,
    token: data.token,
    signedUrl: data.signedUrl,
  });
}
