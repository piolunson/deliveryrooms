"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { t } from "@/lib/i18n";

type Room = {
  id: string;
  title: string;
  client_name: string;
  status: "draft" | "active" | "disabled";
  expires_at: string | null;
  created_at: string;
  room_files: { id: string }[];
};

export default function DashboardPage() {
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((d) => setRooms(d.rooms ?? []));
  }, []);

  const filtered = useMemo(() => {
    if (!rooms) return [];
    const q = query.toLowerCase().trim();
    if (!q) return rooms;
    return rooms.filter(
      (r) => r.title.toLowerCase().includes(q) || r.client_name?.toLowerCase().includes(q)
    );
  }, [rooms, query]);

  function statusLabel(room: Room) {
    if (room.status === "disabled") return t("dashboard.status.disabled");
    if (room.status === "draft") return t("dashboard.status.draft");
    if (room.expires_at && new Date(room.expires_at) < new Date()) return t("dashboard.status.expired");
    return t("dashboard.status.active");
  }

  function statusColor(room: Room) {
    if (room.status === "disabled") return "bg-black/10 text-ink/50";
    if (room.status === "draft") return "bg-amber/15 text-amber";
    if (room.expires_at && new Date(room.expires_at) < new Date()) return "bg-danger/10 text-danger";
    return "bg-success/10 text-success";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-ink">{t("dashboard.heading")}</h1>
        <Link
          href="/app/pokoje/nowy"
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          <Plus size={16} /> {t("dashboard.newRoom")}
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm">
        <Search size={15} className="text-ink/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("dashboard.search")}
          className="flex-1 outline-none"
        />
      </div>

      {rooms === null && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-card bg-black/5" />
          ))}
        </div>
      )}

      {rooms !== null && filtered.length === 0 && (
        <div className="mt-16 flex flex-col items-center text-center">
          <h2 className="text-lg font-semibold text-ink">{t("dashboard.empty.title")}</h2>
          <p className="mt-2 max-w-sm text-sm text-ink/60">{t("dashboard.empty.subtitle")}</p>
          <Link
            href="/app/pokoje/nowy"
            className="mt-5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            {t("dashboard.empty.cta")}
          </Link>
        </div>
      )}

      {rooms !== null && filtered.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((room) => (
            <Link
              key={room.id}
              href={`/app/pokoje/${room.id}`}
              className="block rounded-card border border-black/5 bg-white p-4 transition hover:shadow-md"
            >
              <div className="flex aspect-video items-center justify-center rounded-tile bg-ink/5 text-xs text-ink/30">
                {room.room_files?.length ?? 0} plików
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-ink">{room.title || "Bez tytułu"}</h3>
                  <p className="text-xs text-ink/50">{room.client_name || "—"}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusColor(room)}`}>
                  {statusLabel(room)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
