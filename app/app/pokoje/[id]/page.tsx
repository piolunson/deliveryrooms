"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { t } from "@/lib/i18n";

type Tab = "activity" | "comments" | "stats";

export default function RoomDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [room, setRoom] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>("activity");

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    const { data: roomData } = await supabase
      .from("rooms")
      .select("*, room_files(id)")
      .eq("id", id)
      .single();
    setRoom(roomData);

    const { data: eventsData } = await supabase
      .from("room_events")
      .select("*")
      .eq("room_id", id)
      .order("created_at", { ascending: false })
      .limit(50);
    setEvents(eventsData ?? []);

    const { data: commentsData } = await supabase
      .from("file_comments")
      .select("*")
      .eq("room_id", id)
      .order("created_at", { ascending: false });
    setComments(commentsData ?? []);
  }

  async function patch(body: Record<string, unknown>) {
    await fetch(`/api/rooms/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    load();
  }

  async function deleteRoom() {
    if (!confirm(t("roomDetails.deleteConfirm.title"))) return;
    await fetch(`/api/rooms/${id}`, { method: "DELETE" });
    router.push("/app");
  }

  async function duplicateRoom() {
    if (!room) return;
    const res = await fetch("/api/rooms", {
      method: "POST",
      body: JSON.stringify({ title: `${room.title} (kopia)` }),
    });
    const { room: copy } = await res.json();
    router.push(`/app/pokoje/${copy.id}`);
  }

  if (!room) return <div className="animate-pulse text-sm text-ink/40">Ładowanie…</div>;

  const openedCount = events.filter((e) => e.type === "opened").length;
  const zipCount = events.filter((e) => e.type === "downloaded_zip").length;
  const fileCount = events.filter((e) => e.type === "downloaded_file").length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">{room.title || "Bez tytułu"}</h1>
          <p className="text-sm text-ink/50">{room.client_name}</p>
        </div>
        <a
          href={`/d/${room.slug}`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-full border border-black/10 px-4 py-2 text-xs font-semibold hover:bg-black/5"
        >
          Otwórz pokój ↗
        </a>
      </div>

      <div className="mt-6 flex gap-1 border-b border-black/5">
        {(["activity", "comments", "stats"] as Tab[]).map((tKey) => (
          <button
            key={tKey}
            onClick={() => setTab(tKey)}
            className={`px-4 py-2 text-sm font-medium ${
              tab === tKey ? "border-b-2 border-accent text-accent" : "text-ink/50"
            }`}
          >
            {t(`roomDetails.tabs.${tKey}`)}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "activity" && (
          <ul className="space-y-2">
            {events.length === 0 && <p className="text-sm text-ink/40">{t("roomDetails.notOpenedYet")}</p>}
            {events.map((e) => (
              <li key={e.id} className="rounded-lg border border-black/5 bg-white px-4 py-2.5 text-sm">
                <span className="font-medium text-ink">{eventLabel(e.type)}</span>
                {e.actor_name && <span className="text-ink/50"> — {e.actor_name}</span>}
                <span className="float-right text-xs text-ink/30">
                  {new Date(e.created_at).toLocaleString("pl-PL")}
                </span>
              </li>
            ))}
          </ul>
        )}

        {tab === "comments" && (
          <ul className="space-y-2">
            {comments.length === 0 && <p className="text-sm text-ink/40">{t("room.comments.empty")}</p>}
            {comments.map((c) => (
              <li key={c.id} className="rounded-lg border border-black/5 bg-white px-4 py-3 text-sm">
                <p className="font-medium text-ink">{c.author_name}</p>
                <p className="mt-1 text-ink/70">{c.body}</p>
                <span className="text-xs text-ink/30">{new Date(c.created_at).toLocaleString("pl-PL")}</span>
              </li>
            ))}
          </ul>
        )}

        {tab === "stats" && (
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Otwarcia" value={openedCount} />
            <Stat label="Pobrania ZIP" value={zipCount} />
            <Stat label="Pobrania plików" value={fileCount} />
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-t border-black/5 pt-6">
        <select
          defaultValue=""
          onChange={(e) => {
            if (!e.target.value) return;
            patch({ expiresInDays: e.target.value === "none" ? null : Number(e.target.value) });
          }}
          className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold"
        >
          <option value="">{t("roomDetails.actions.changeExpiry")}</option>
          <option value={7}>7 dni</option>
          <option value={14}>14 dni</option>
          <option value={30}>30 dni</option>
          <option value="none">Bez limitu</option>
        </select>

        <button
          onClick={() => patch({ status: room.status === "disabled" ? "active" : "disabled" })}
          className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold hover:bg-black/5"
        >
          {room.status === "disabled" ? t("roomDetails.actions.enableLink") : t("roomDetails.actions.disableLink")}
        </button>

        <button
          onClick={duplicateRoom}
          className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold hover:bg-black/5"
        >
          {t("roomDetails.actions.duplicate")}
        </button>

        <button
          onClick={deleteRoom}
          className="rounded-full border border-danger/30 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/5"
        >
          {t("roomDetails.actions.deleteRoom")}
        </button>
      </div>
    </div>
  );
}

function eventLabel(type: string) {
  const map: Record<string, string> = {
    opened: "Pokój otwarty",
    downloaded_file: "Pobrano plik",
    downloaded_zip: "Pobrano ZIP",
    approved: "Plik zaakceptowany",
    changes_requested: "Zgłoszono poprawki",
    commented: "Nowy komentarz",
    reviewed_all: "Wszystko zaakceptowane 🎉",
  };
  return map[type] ?? type;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-black/5 bg-white p-4 text-center">
      <div className="text-2xl font-extrabold text-ink">{value}</div>
      <div className="text-xs text-ink/50">{label}</div>
    </div>
  );
}
