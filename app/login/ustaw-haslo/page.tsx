"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { t } from "@/lib/i18n";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 10) {
      setError(t("auth.firstLogin.errorTooShort"));
      return;
    }
    if (password !== repeat) {
      setError("Hasła nie są identyczne.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError || !data.user) {
      setLoading(false);
      setError("Nie udało się zmienić hasła. Spróbuj ponownie.");
      return;
    }

    await supabase.from("profiles").update({ must_change_password: false }).eq("id", data.user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    setLoading(false);
    router.push(profile?.role === "admin" ? "/admin" : "/app");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <form onSubmit={submit} className="w-full max-w-sm">
        <h1 className="text-2xl font-extrabold text-ink">{t("auth.firstLogin.title")}</h1>
        <p className="mt-1 text-sm text-ink/60">{t("auth.firstLogin.subtitle")}</p>

        <label className="mt-6 block text-sm font-medium text-ink/80">
          {t("auth.firstLogin.newPassword")}
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-ink/80">
          {t("auth.firstLogin.repeatPassword")}
          <input
            type="password"
            required
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </label>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {t("auth.firstLogin.submit")}
        </button>
      </form>
    </main>
  );
}
