"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { t } from "@/lib/i18n";

export default function SettingsPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
    })();
  }, []);

  async function updateNotif(key: string, value: boolean) {
    const updated = { ...profile, [key]: value };
    setProfile(updated);
    await supabase.from("profiles").update({ [key]: value }).eq("id", profile.id);
  }

  async function changePassword() {
    if (newPassword.length < 10) {
      alert(t("auth.firstLogin.errorTooShort"));
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) {
      setNewPassword("");
      setSavedMsg("Hasło zmienione.");
      setTimeout(() => setSavedMsg(null), 2500);
    }
  }

  if (!profile) return <div className="animate-pulse text-sm text-ink/40">Ładowanie…</div>;

  return (
    <div className="max-w-lg space-y-8">
      <section>
        <h2 className="text-lg font-bold text-ink">{t("settings.emailNotifications")}</h2>
        <div className="mt-3 space-y-3 rounded-card border border-black/5 bg-white p-5">
          <ToggleRow
            label={t("settings.onOpen")}
            checked={profile.notify_email}
            onChange={(v) => updateNotif("notify_email", v)}
          />
          <ToggleRow
            label={t("settings.digest")}
            checked={profile.notify_digest}
            onChange={(v) => updateNotif("notify_digest", v)}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-ink">{t("settings.changePassword")}</h2>
        <div className="mt-3 flex gap-2">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t("auth.firstLogin.newPassword")}
            className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <button
            onClick={changePassword}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            Zapisz
          </button>
        </div>
        {savedMsg && <p className="mt-2 text-sm text-success">{savedMsg}</p>}
      </section>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between text-sm text-ink/80">
      {label}
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
    </label>
  );
}
