"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

export default function PasswordGate({ slug }: { slug: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch(`/api/rooms/${slug}/unlock`, {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-card border border-white/10 bg-white/5 p-8 text-center text-white"
      >
        <p className="text-sm text-white/70">{t("room.password.protected")}</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("room.password.placeholder")}
          className="mt-4 w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-center text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent"
          autoFocus
        />
        {error && <p className="mt-2 text-xs text-danger">{t("room.password.error")}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-accent py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {t("room.password.submit")}
        </button>
      </form>
    </div>
  );
}
