"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { t } from "@/lib/i18n";

export default function BrandPage() {
  const supabase = createClient();
  const [preset, setPreset] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("brand_presets")
        .select("*")
        .eq("owner_id", user.id)
        .eq("is_default", true)
        .maybeSingle();
      setPreset(
        data ?? {
          name: "Domyślny styl",
          accent_color: "#2F6FEB",
          font_key: "garamond",
          theme: "dark",
          background_value: "aurora-amber",
          layout: "grid",
        }
      );
    })();
  }, []);

  async function save() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (preset.id) {
      await supabase.from("brand_presets").update(preset).eq("id", preset.id);
    } else {
      const { data } = await supabase
        .from("brand_presets")
        .insert({ ...preset, owner_id: user.id, is_default: true })
        .select()
        .single();
      setPreset(data);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!preset) return <div className="animate-pulse text-sm text-ink/40">Ładowanie…</div>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-extrabold text-ink">{t("brand.heading")}</h1>
      <p className="mt-1 text-sm text-ink/60">{t("brand.subtitle")}</p>

      <div className="mt-6 space-y-4 rounded-card border border-black/5 bg-white p-5">
        <label className="block text-sm font-medium text-ink/80">
          {t("wizard.step3.accentColor")}
          <input
            type="color"
            value={preset.accent_color}
            onChange={(e) => setPreset({ ...preset, accent_color: e.target.value })}
            className="mt-1.5 h-10 w-20 rounded-lg border border-black/10"
          />
        </label>

        <label className="block text-sm font-medium text-ink/80">
          {t("wizard.step3.font")}
          <select
            value={preset.font_key}
            onChange={(e) => setPreset({ ...preset, font_key: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          >
            <option value="garamond">Cormorant Garamond</option>
            <option value="playfair">Playfair Display</option>
            <option value="inter">Inter</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-ink/80">
          {t("wizard.step3.theme")}
          <select
            value={preset.theme}
            onChange={(e) => setPreset({ ...preset, theme: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          >
            <option value="dark">Ciemny</option>
            <option value="light">Jasny</option>
          </select>
        </label>
      </div>

      <button
        onClick={save}
        className="mt-5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
      >
        {saved ? "Zapisano ✓" : "Zapisz"}
      </button>
    </div>
  );
}
