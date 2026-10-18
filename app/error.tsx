"use client";

import { t } from "@/lib/i18n";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="text-2xl font-bold text-ink">{t("system.error.title")}</h1>
      <p className="mt-2 text-sm text-ink/60">{t("system.error.subtitle")}</p>
      <button
        onClick={reset}
        className="mt-6 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
      >
        {t("system.error.cta")}
      </button>
    </div>
  );
}
