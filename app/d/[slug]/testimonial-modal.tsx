"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { t } from "@/lib/i18n";

export default function TestimonialModal({
  slug,
  defaultName,
  accent,
  onDone,
}: {
  slug: string;
  defaultName: string;
  accent: string;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState(defaultName);
  const [role, setRole] = useState("");
  const [body, setBody] = useState("");
  const [consent, setConsent] = useState(true);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;
    setSending(true);
    await fetch(`/api/rooms/${slug}/testimonials`, {
      method: "POST",
      body: JSON.stringify({
        rating,
        body: body.trim(),
        authorName: name.trim(),
        authorRole: role.trim() || undefined,
        consentPublic: consent,
      }),
    });
    setSending(false);
    setSent(true);
    setTimeout(onDone, 1600);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-sm rounded-card bg-white p-6 text-ink">
        <button
          onClick={onDone}
          className="absolute right-4 top-4 text-ink/40 hover:text-ink"
          aria-label="Zamknij"
        >
          <X size={18} />
        </button>

        {sent ? (
          <p className="py-8 text-center text-sm font-medium">{t("testimonial.success")}</p>
        ) : (
          <form onSubmit={submit}>
            <h2 className="text-lg font-bold">{t("testimonial.heading")}</h2>
            <p className="mt-1 text-sm text-ink/60">{t("testimonial.subtitle")}</p>

            <div className="mt-4 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRating(n)}
                  aria-label={`${n} gwiazdek`}
                  className="text-star"
                >
                  <Star size={24} fill={n <= rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>

            <label className="mt-4 block text-xs font-medium text-ink/70">
              {t("testimonial.name")}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>

            <label className="mt-3 block text-xs font-medium text-ink/70">
              {t("testimonial.role")}
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>

            <label className="mt-3 block text-xs font-medium text-ink/70">
              {t("testimonial.body")}
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={3}
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>

            <label className="mt-3 flex items-start gap-2 text-xs text-ink/70">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5"
              />
              {t("testimonial.consent")}
            </label>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={onDone}
                className="flex-1 rounded-full border border-black/10 py-2 text-sm font-semibold"
              >
                {t("testimonial.skip")}
              </button>
              <button
                type="submit"
                disabled={sending}
                style={{ backgroundColor: accent }}
                className="flex-1 rounded-full py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {t("testimonial.submit")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
