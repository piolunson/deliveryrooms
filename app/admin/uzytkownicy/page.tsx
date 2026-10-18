"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { t } from "@/lib/i18n";

type Profile = {
  id: string;
  display_name: string;
  role: string;
  storage_used_bytes: number;
  storage_limit_bytes: number;
  is_active: boolean;
};

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [storageLimitGb, setStorageLimitGb] = useState(10);
  const [createdInfo, setCreatedInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data ?? []);
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      body: JSON.stringify({ email, displayName, storageLimitGb }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      alert(data.error ?? "Nie udało się utworzyć konta.");
      return;
    }

    setCreatedInfo(
      t("admin.users.created").replace("{email}", data.email).replace("{password}", data.tempPassword)
    );
    setEmail("");
    setDisplayName("");
    setShowForm(false);
    load();
  }

  async function toggleActive(user: Profile) {
    await supabase.from("profiles").update({ is_active: !user.is_active }).eq("id", user.id);
    load();
  }

  function gb(bytes: number) {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">{t("admin.users.heading")}</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          {t("admin.users.add")}
        </button>
      </div>

      {createdInfo && (
        <div className="mt-4 rounded-lg border border-success/30 bg-success/5 p-4 text-sm text-ink">
          {createdInfo}
        </div>
      )}

      {showForm && (
        <form onSubmit={createUser} className="mt-4 flex flex-wrap items-end gap-3 rounded-card border border-black/5 bg-white p-4">
          <label className="text-sm font-medium text-ink/80">
            {t("admin.users.name")}
            <input
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block rounded-lg border border-black/10 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-medium text-ink/80">
            {t("admin.users.email")}
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block rounded-lg border border-black/10 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-medium text-ink/80">
            {t("admin.users.storageLimit")}
            <input
              type="number"
              min={1}
              value={storageLimitGb}
              onChange={(e) => setStorageLimitGb(Number(e.target.value))}
              className="mt-1 block w-24 rounded-lg border border-black/10 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {t("admin.users.generatePassword")}
          </button>
        </form>
      )}

      <div className="mt-6 overflow-hidden rounded-card border border-black/5 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-black/[0.03] text-left text-xs font-semibold uppercase text-ink/40">
            <tr>
              <th className="px-4 py-2.5">Imię</th>
              <th className="px-4 py-2.5">Rola</th>
              <th className="px-4 py-2.5">Miejsce</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <tr key={u.id} className="border-t border-black/5">
                <td className="px-4 py-2.5 font-medium text-ink">{u.display_name}</td>
                <td className="px-4 py-2.5 text-ink/60">{u.role}</td>
                <td className="px-4 py-2.5 text-ink/60">
                  {gb(u.storage_used_bytes)} / {gb(u.storage_limit_bytes)} GB
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      u.is_active ? "bg-success/10 text-success" : "bg-black/10 text-ink/50"
                    }`}
                  >
                    {u.is_active ? "Aktywny" : "Nieaktywny"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  {u.role !== "admin" && (
                    <button
                      onClick={() => toggleActive(u)}
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      {u.is_active ? t("admin.users.deactivate") : "Aktywuj"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
