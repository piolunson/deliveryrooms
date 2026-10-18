"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { t } from "@/lib/i18n";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login/ustaw-haslo`,
    });
    // Zawsze pokazujemy ten sam komunikat — nie zdradzamy, czy konto istnieje.
    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <form onSubmit={submit} className="w-full max-w-sm">
        <h1 className="text-2xl font-extrabold text-ink">{t("auth.reset.title")}</h1>
        <p className="mt-1 text-sm text-ink/60">{t("auth.reset.subtitle")}</p>

        {sent ? (
          <p className="mt-6 text-sm text-success">{t("auth.reset.success")}</p>
        ) : (
          <>
            <label className="mt-6 block text-sm font-medium text-ink/80">
              {t("auth.login.email")}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>
            <button
              type="submit"
              className="mt-6 w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              {t("auth.reset.submit")}
            </button>
          </>
        )}
      </form>
    </main>
  );
}
