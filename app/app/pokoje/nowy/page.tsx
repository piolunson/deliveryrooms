"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { UploadCloud, Copy, Mail, QrCode as QrCodeIcon, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { t } from "@/lib/i18n";

type UploadItem = {
  id: string; // tymczasowe id lokalne
  file: File;
  progress: number;
  status: "queued" | "uploading" | "done" | "error";
  fileRow?: { id: string };
};

const STEPS = ["Pliki", "Szczegóły", "Wygląd", "Gotowe"];
const BACKGROUND_PRESETS = [
  { key: "aurora-amber", label: "Bursztynowa aurora" },
  { key: "aurora-blue", label: "Niebieska mgła" },
  { key: "aurora-violet", label: "Fioletowa poświata" },
];

export default function NewRoomWizard() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [expiryDays, setExpiryDays] = useState<number | null>(14);
  const [password, setPassword] = useState("");
  const [allowZip, setAllowZip] = useState(true);
  const [hideBranding, setHideBranding] = useState(false);

  const [accentColor, setAccentColor] = useState("#2F6FEB");
  const [background, setBackground] = useState("aurora-amber");

  const [saving, setSaving] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Krok 0: utwórz pokój roboczy od razu, żeby mieć roomId do uploadu.
  useEffect(() => {
    fetch("/api/rooms", { method: "POST", body: JSON.stringify({ title: "" }) })
      .then((r) => r.json())
      .then((d) => {
        setRoomId(d.room.id);
        setSlug(d.room.slug);
      });
  }, []);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || !roomId) return;
    const newItems: UploadItem[] = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: "queued",
    }));
    setItems((prev) => [...prev, ...newItems]);

    for (const item of newItems) {
      await uploadOne(item);
    }
  }

  async function uploadOne(item: UploadItem) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "uploading" } : i)));

    try {
      const signRes = await fetch("/api/upload-sign", {
        method: "POST",
        body: JSON.stringify({ roomId, fileName: item.file.name }),
      });
      if (!signRes.ok) throw new Error("sign_failed");
      const { path, token } = await signRes.json();

      const { error: uploadError } = await supabase.storage
        .from("deliveries")
        .uploadToSignedUrl(path, token, item.file);
      if (uploadError) throw uploadError;

      let width: number | undefined;
      let height: number | undefined;
      if (item.file.type.startsWith("image/")) {
        const dims = await readImageDimensions(item.file).catch(() => null);
        if (dims) {
          width = dims.width;
          height = dims.height;
        }
      }

      const registerRes = await fetch(`/api/rooms/${roomId}/files`, {
        method: "POST",
        body: JSON.stringify({
          storagePath: path,
          originalName: item.file.name,
          mime: item.file.type || "application/octet-stream",
          sizeBytes: item.file.size,
          width,
          height,
          position: items.length,
        }),
      });
      if (!registerRes.ok) throw new Error("register_failed");
      const { file } = await registerRes.json();

      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "done", progress: 100, fileRow: file } : i))
      );
      setCoverId((prev) => prev ?? file.id);
    } catch {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "error" } : i)));
    }
  }

  function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  async function saveDetailsAndContinue() {
    if (!title.trim()) {
      alert(t("wizard.errors.noTitle"));
      return;
    }
    if (items.length === 0) {
      alert(t("wizard.errors.noFiles"));
      return;
    }
    setStep(2);
  }

  async function finishAndPublish() {
    if (!roomId || !slug) return;
    setSaving(true);

    await fetch(`/api/rooms/${roomId}`, {
      method: "PATCH",
      body: JSON.stringify({
        title,
        clientName,
        clientEmail: clientEmail || "",
        message,
        expiresInDays: expiryDays,
        password,
        allowZip,
        allowDownload: true,
        hidePoweredBy: hideBranding,
        coverFileId: coverId ?? undefined,
        brandSnapshot: { accent_color: accentColor, background_value: background, theme: "dark" },
      }),
    });

    await fetch(`/api/rooms/${roomId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "active" }),
    });

    const siteUrl = window.location.origin;
    const roomUrl = `${siteUrl}/d/${slug}`;
    const qr = await QRCode.toDataURL(roomUrl, { width: 240, margin: 1, color: { dark: "#1A1A1A" } });
    setQrDataUrl(qr);

    setSaving(false);
    setStep(3);
  }

  const roomUrl = slug ? `${typeof window !== "undefined" ? window.location.origin : ""}/d/${slug}` : "";

  async function copyLink() {
    await navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* stepper */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                i <= step ? "bg-accent text-white" : "bg-black/10 text-ink/40"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-xs font-medium ${i <= step ? "text-ink" : "text-ink/40"}`}>{label}</span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-black/10" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <section>
          <h2 className="text-lg font-bold text-ink">{t("wizard.step1.title")}</h2>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
            className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed border-black/15 bg-white py-14 text-center hover:border-accent"
          >
            <UploadCloud className="text-ink/30" size={32} />
            <p className="mt-3 text-sm font-medium text-ink">{t("wizard.step1.dropzone")}</p>
            <p className="mt-1 text-xs text-ink/40">{t("wizard.step1.limit")}</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {items.length > 0 && (
            <ul className="mt-4 space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-black/5 bg-white px-3 py-2 text-sm"
                >
                  <span className="truncate">{item.file.name}</span>
                  <span
                    className={
                      item.status === "done"
                        ? "text-success"
                        : item.status === "error"
                        ? "text-danger"
                        : "text-ink/40"
                    }
                  >
                    {item.status === "uploading" && t("wizard.step1.uploading").replace("{n}", "…")}
                    {item.status === "done" && <Check size={16} />}
                    {item.status === "error" &&
                      t("wizard.errors.uploadFailed").replace("{name}", item.file.name)}
                    {item.status === "queued" && "…"}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={() => setStep(1)}
            disabled={items.length === 0 || items.some((i) => i.status === "uploading")}
            className="mt-6 w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            Dalej
          </button>
        </section>
      )}

      {step === 1 && (
        <section>
          <h2 className="text-lg font-bold text-ink">{t("wizard.step2.title")}</h2>
          <div className="mt-4 space-y-4">
            <Field label={t("wizard.step2.deliveryTitle")}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("wizard.step2.deliveryTitlePlaceholder")}
                className="input"
              />
            </Field>
            <Field label={t("wizard.step2.clientName")}>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={t("wizard.step2.clientNamePlaceholder")}
                className="input"
              />
            </Field>
            <Field label={t("wizard.step2.clientEmail")}>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="input"
              />
            </Field>
            <Field label={t("wizard.step2.message")}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("wizard.step2.messagePlaceholder")}
                rows={3}
                className="input"
              />
            </Field>
            <Field label={t("wizard.step2.expiry")}>
              <select
                value={expiryDays ?? "none"}
                onChange={(e) => setExpiryDays(e.target.value === "none" ? null : Number(e.target.value))}
                className="input"
              >
                <option value={7}>7 dni</option>
                <option value={14}>14 dni</option>
                <option value={30}>30 dni</option>
                <option value="none">Bez limitu</option>
              </select>
            </Field>
            <Field label={t("wizard.step2.password")}>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </Field>
            <Toggle label={t("wizard.step2.allowZip")} checked={allowZip} onChange={setAllowZip} />
            <Toggle label={t("wizard.step2.hideBranding")} checked={hideBranding} onChange={setHideBranding} />
          </div>

          <div className="mt-6 flex gap-2">
            <button onClick={() => setStep(0)} className="flex-1 rounded-full border border-black/10 py-2.5 text-sm font-semibold">
              Wstecz
            </button>
            <button
              onClick={saveDetailsAndContinue}
              className="flex-1 rounded-full bg-accent py-2.5 text-sm font-semibold text-white"
            >
              Dalej
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <h2 className="text-lg font-bold text-ink">{t("wizard.step3.title")}</h2>
          <div className="mt-4 space-y-5">
            <Field label={t("wizard.step3.background")}>
              <div className="flex gap-2">
                {BACKGROUND_PRESETS.map((bg) => (
                  <button
                    key={bg.key}
                    onClick={() => setBackground(bg.key)}
                    className={`h-12 flex-1 rounded-lg border-2 ${
                      background === bg.key ? "border-accent" : "border-transparent"
                    } bg-gradient-to-br from-orange-500 via-black to-slate-900`}
                    title={bg.label}
                  />
                ))}
              </div>
            </Field>
            <Field label={t("wizard.step3.accentColor")}>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-10 w-20 rounded-lg border border-black/10"
              />
            </Field>
          </div>

          <div className="mt-8 overflow-hidden rounded-card">
            <div
              className="p-8 text-white"
              style={{ background: "linear-gradient(135deg,#e8831f,#0c0b16 70%)" }}
            >
              <p className="text-xs text-white/60">Podgląd</p>
              <h3 className="mt-2 font-serif text-3xl font-bold uppercase">
                {title || "Tytuł dostawy"}
              </h3>
              <button
                className="mt-4 rounded-lg px-4 py-2 text-xs font-semibold text-white"
                style={{ backgroundColor: accentColor }}
              >
                Pobierz wszystkie pliki
              </button>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 rounded-full border border-black/10 py-2.5 text-sm font-semibold">
              Wstecz
            </button>
            <button
              onClick={finishAndPublish}
              disabled={saving}
              className="flex-1 rounded-full bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Publikuję…" : "Opublikuj pokój"}
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="text-center">
          <h2 className="text-xl font-bold text-ink">{t("wizard.step4.title")}</h2>
          <p className="mt-1 text-sm text-ink/60">{t("wizard.step4.subtitle")}</p>

          <div className="mx-auto mt-6 max-w-xs rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-ink/70">
            {roomUrl}
          </div>

          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="Kod QR" className="mx-auto mt-4 h-40 w-40 rounded-lg border border-black/10" />
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
            >
              <Copy size={14} /> {copied ? t("wizard.toasts.linkCopied") : t("wizard.step4.copyLink")}
            </button>
            {clientEmail && (
              <a
                href={`mailto:${clientEmail}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(roomUrl)}`}
                className="flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold"
              >
                <Mail size={14} /> {t("wizard.step4.sendEmail")}
              </a>
            )}
          </div>

          <button
            onClick={() => router.push("/app/pokoje/nowy")}
            className="mt-8 text-sm font-semibold text-accent hover:underline"
          >
            {t("wizard.step4.createAnother")}
          </button>
          <div>
            <button onClick={() => router.push("/app")} className="mt-2 text-sm text-ink/50 hover:underline">
              Wróć do listy pokoi
            </button>
          </div>
        </section>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
          padding: 0.6rem 0.75rem;
          font-size: 0.875rem;
          margin-top: 0.375rem;
        }
        .input:focus {
          outline: none;
          box-shadow: 0 0 0 2px #2f6feb;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-ink/80">
      {label}
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between text-sm font-medium text-ink/80">
      {label}
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
    </label>
  );
}
