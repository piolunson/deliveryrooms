"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { t } from "@/lib/i18n";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (authError || !data.user) {
      setError(true);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("must_change_password, role")
      .eq("id", data.user.id)
      .single();

    if (profile?.must_change_password) {
      router.push("/login/ustaw-haslo");
    } else if (profile?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/app");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <form onSubmit={submit} className="w-full max-w-sm">
        <h1 className="text-2xl font-extrabold text-ink">{t("auth.login.title")}</h1>
        <p className="mt-1 text-sm text-ink/60">{t("auth.login.subtitle")}</p>

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

        <label className="mt-4 block text-sm font-medium text-ink/80">
          {t("auth.login.password")}
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </label>

        {error && (
          <p className="mt-3 text-sm text-danger">{t("auth.login.error")}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
        >
          {t("auth.login.submit")}
        </button>

        <div className="mt-4 flex justify-between text-sm">
          <a href="/login/reset" className="text-accent hover:underline">
            {t("auth.login.forgot")}
          </a>
        </div>
        <p className="mt-6 text-center text-xs text-ink/40">
          {t("auth.login.noAccount")}
        </p>
      </form>
    </main>
  );
}
