"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AdminOverview() {
  const supabase = createClient();
  const [stats, setStats] = useState<{ users: number; rooms: number; pendingTestimonials: number } | null>(
    null
  );

  useEffect(() => {
    (async () => {
      const [{ count: users }, { count: rooms }, { count: pending }] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("rooms").select("id", { count: "exact", head: true }),
        supabase
          .from("testimonials")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);
      setStats({ users: users ?? 0, rooms: rooms ?? 0, pendingTestimonials: pending ?? 0 });
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">Panel admina</h1>
      {!stats ? (
        <div className="mt-6 h-24 animate-pulse rounded-card bg-black/5" />
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <Stat label="Użytkownicy" value={stats.users} href="/admin/uzytkownicy" />
          <Stat label="Pokoje" value={stats.rooms} />
          <Stat label="Opinie do zatwierdzenia" value={stats.pendingTestimonials} href="/admin/opinie" />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href?: string }) {
  const content = (
    <div className="rounded-card border border-black/5 bg-white p-5 text-center transition hover:shadow-md">
      <div className="text-3xl font-extrabold text-ink">{value}</div>
      <div className="mt-1 text-sm text-ink/50">{label}</div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
