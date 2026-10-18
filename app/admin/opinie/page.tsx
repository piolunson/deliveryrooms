"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { t } from "@/lib/i18n";

type Testimonial = {
  id: string;
  rating: number;
  body: string;
  author_name: string;
  author_role: string | null;
  consent_public: boolean;
  status: string;
  created_at: string;
};

export default function AdminTestimonialsPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Testimonial[] | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
  }

  async function moderate(id: string, status: "approved" | "rejected" | "hidden") {
    await supabase.from("testimonials").update({ status, moderated_at: new Date().toISOString() }).eq("id", id);
    load();
  }

  const pending = items?.filter((i) => i.status === "pending") ?? [];
  const other = items?.filter((i) => i.status !== "pending") ?? [];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">{t("admin.testimonials.heading")}</h1>

      {items === null && <div className="mt-6 h-24 animate-pulse rounded-card bg-black/5" />}

      {items !== null && pending.length === 0 && (
        <p className="mt-6 text-sm text-ink/40">{t("admin.testimonials.empty")}</p>
      )}

      <div className="mt-6 space-y-3">
        {pending.map((item) => (
          <div key={item.id} className="rounded-card border border-black/5 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex gap-0.5 text-star text-sm">{"★★★★★".slice(0, item.rating)}</div>
                <p className="mt-2 text-sm text-ink/80">{item.body}</p>
                <p className="mt-2 text-xs font-semibold text-ink/60">
                  {item.author_name}
                  {item.author_role && <span className="font-normal"> — {item.author_role}</span>}
                  {!item.consent_public && (
                    <span className="ml-2 rounded-full bg-amber/15 px-2 py-0.5 text-[10px] text-amber">
                      brak zgody na publikację
                    </span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => moderate(item.id, "approved")}
                  className="rounded-full bg-success px-3 py-1.5 text-xs font-semibold text-white"
                >
                  {t("admin.testimonials.approve")}
                </button>
                <button
                  onClick={() => moderate(item.id, "rejected")}
                  className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold"
                >
                  {t("admin.testimonials.reject")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {other.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-ink/50">Historia</h2>
          <div className="mt-3 space-y-2">
            {other.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-black/5 bg-white px-4 py-2.5 text-sm">
                <span className="truncate text-ink/70">
                  {item.author_name}: &ldquo;{item.body.slice(0, 60)}&rdquo;
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs font-medium text-ink/40">{item.status}</span>
                  {item.status === "approved" && (
                    <button
                      onClick={() => moderate(item.id, "hidden")}
                      className="text-xs font-semibold text-danger hover:underline"
                    >
                      {t("admin.testimonials.hide")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
