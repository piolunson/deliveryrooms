"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, X, Check, MessageCircle, Play } from "lucide-react";
import { t } from "@/lib/i18n";
import TestimonialModal from "./testimonial-modal";

export type RoomFile = {
  id: string;
  name: string;
  kind: "image" | "video" | "other";
  thumbUrl: string;
  status: "pending" | "approved" | "changes_requested";
  commentCount: number;
};

export type RoomData = {
  title: string;
  clientName: string;
  creators: string[];
  coverUrl: string;
  accentColor: string;
  backgroundClass: string;
  files: RoomFile[];
  allowZip: boolean;
  hidePoweredBy: boolean;
};

const NAME_KEY = "delivery_room_visitor_name";

export default function RoomClient({ room, slug }: { room: RoomData; slug: string }) {
  const [files, setFiles] = useState<RoomFile[]>(room.files);
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const [visitorName, setVisitorName] = useState<string | null>(null);
  const [showTestimonial, setShowTestimonial] = useState(false);
  const [testimonialDone, setTestimonialDone] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/rooms/${slug}/opened`, { method: "POST" }).catch(() => {});
    const saved = localStorage.getItem(NAME_KEY);
    if (saved) setVisitorName(saved);
  }, [slug]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function getOrAskName(): string | null {
    if (visitorName) return visitorName;
    const name = window.prompt(t("room.comments.askName"));
    if (!name || !name.trim()) return null;
    localStorage.setItem(NAME_KEY, name.trim());
    setVisitorName(name.trim());
    return name.trim();
  }

  const approvedCount = useMemo(
    () => files.filter((f) => f.status === "approved").length,
    [files]
  );

  async function setStatus(id: string, status: RoomFile["status"]) {
    const name = getOrAskName();
    if (!name) return;

    const prev = files;
    setFiles((p) => p.map((f) => (f.id === id ? { ...f, status } : f)));

    const res = await fetch(`/api/rooms/${slug}/review`, {
      method: "POST",
      body: JSON.stringify({ fileId: id, status, reviewerName: name }),
    });

    if (!res.ok) {
      setFiles(prev);
      showToast(t("wizard.errors.generic"));
      return;
    }

    showToast(
      status === "approved" ? t("room.toasts.fileApproved") : t("room.toasts.changesRequested")
    );

    const willAllBeApproved =
      status === "approved" &&
      files.filter((f) => f.id !== id).every((f) => f.status === "approved") &&
      files.length > 0;
    if (willAllBeApproved && !testimonialDone) {
      setTimeout(() => setShowTestimonial(true), 600);
    }
  }

  async function approveAll() {
    if (!confirm(t("room.progress.approveAllConfirm"))) return;
    const name = getOrAskName();
    if (!name) return;

    const pendingOrChanges = files.filter((f) => f.status !== "approved");
    setFiles((p) => p.map((f) => ({ ...f, status: "approved" })));

    await Promise.all(
      pendingOrChanges.map((f) =>
        fetch(`/api/rooms/${slug}/review`, {
          method: "POST",
          body: JSON.stringify({ fileId: f.id, status: "approved", reviewerName: name }),
        })
      )
    );

    if (!testimonialDone) setTimeout(() => setShowTestimonial(true), 600);
  }

  function downloadAll() {
    window.location.href = `/api/rooms/${slug}/zip`;
    if (!testimonialDone) setTimeout(() => setShowTestimonial(true), 2000);
  }

  function downloadFile(fileId: string) {
    window.location.href = `/api/rooms/${slug}/download/${fileId}`;
  }

  const active = files.find((f) => f.id === lightboxId) ?? null;

  return (
    <div className={`min-h-screen text-white ${room.backgroundClass}`}>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-black/20 px-6 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-white/20" />
          <div className="leading-tight">
            <div className="text-xs font-semibold">{room.creators[0] ?? "Twórca"}</div>
            <div className="text-[9px] tracking-[0.15em] text-white/50">
              {t("room.topbar.label")}
            </div>
          </div>
        </div>
        {!room.hidePoweredBy && (
          <div className="text-[10px] font-medium text-white/40">
            {t("room.topbar.poweredBy").replace(
              "{APP_NAME}",
              process.env.NEXT_PUBLIC_APP_NAME || "DeliveryRooms"
            )}
          </div>
        )}
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pb-16 pt-16 md:grid-cols-2 md:items-end">
        <div className="order-2 md:order-1">
          <p className="text-sm text-white/70">
            {t("room.hero.preparedFor").replace("{client}", room.clientName)}
          </p>
          <p className="mt-1 text-sm text-white/70">
            {t("room.hero.deliveredBy").replace("{creators}", room.creators.join(" i "))}
          </p>
          <h1 className="mt-4 font-serif text-6xl font-bold uppercase leading-[1.02] md:text-7xl">
            {room.title.split(" ").map((w, i) => (
              <span key={i} className="block">
                {w}
              </span>
            ))}
          </h1>
          {room.allowZip && (
            <button
              onClick={downloadAll}
              className="mt-6 flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-black/80"
            >
              <Download size={16} />
              {t("room.hero.downloadAll").replace("{n}", String(files.length))}
            </button>
          )}
        </div>
        <div className="order-1 overflow-hidden rounded-card shadow-2xl md:order-2">
          <img src={room.coverUrl} alt={room.title} className="aspect-square w-full object-cover" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-10">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <span>{t("room.filesHeading")}</span>
          <span style={{ color: room.accentColor }}>{files.length}</span>
        </div>

        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4">
          {files.map((f) => (
            <FileTile
              key={f.id}
              file={f}
              onOpen={() => setLightboxId(f.id)}
              onStatus={setStatus}
              onDownload={() => downloadFile(f.id)}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
          <div className="text-sm text-white/70">
            {t("room.progress.label")
              .replace("{n}", String(approvedCount))
              .replace("{m}", String(files.length))}
          </div>
          <button
            onClick={approveAll}
            className="rounded-full px-5 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: room.accentColor }}
          >
            {t("room.progress.approveAll")}
          </button>
        </div>
      </div>

      <div className="py-10 text-center text-xs text-white/30">{t("room.footer")}</div>

      {active && (
        <Lightbox
          file={active}
          accent={room.accentColor}
          slug={slug}
          getOrAskName={getOrAskName}
          onClose={() => setLightboxId(null)}
          onStatus={(s) => setStatus(active.id, s)}
          onDownload={() => downloadFile(active.id)}
        />
      )}

      {showTestimonial && !testimonialDone && (
        <TestimonialModal
          slug={slug}
          defaultName={visitorName ?? ""}
          accent={room.accentColor}
          onDone={() => {
            setTestimonialDone(true);
            setShowTestimonial(false);
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink/90 px-4 py-2 text-xs font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function FileTile({
  file,
  onOpen,
  onStatus,
  onDownload,
}: {
  file: RoomFile;
  onOpen: () => void;
  onStatus: (id: string, status: RoomFile["status"]) => void;
  onDownload: () => void;
}) {
  return (
    <div className="group relative aspect-[4/5] cursor-pointer overflow-hidden" onClick={onOpen}>
      <img src={file.thumbUrl} alt={file.name} className="h-full w-full object-cover" />
      {file.kind === "video" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Play size={28} className="text-white drop-shadow" />
        </div>
      )}

      <div
        className={`absolute right-0 top-0 flex h-7 w-7 items-start justify-end rounded-bl-md p-1 ${
          file.status === "approved"
            ? "bg-success"
            : file.status === "changes_requested"
            ? "bg-danger"
            : "bg-amber"
        }`}
        title={
          file.status === "approved"
            ? t("room.ribbonTooltips.approved")
            : file.status === "changes_requested"
            ? t("room.ribbonTooltips.changesRequested")
            : t("room.ribbonTooltips.pending")
        }
      >
        {file.status === "approved" && <Check size={14} className="text-white" />}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDownload();
        }}
        title="Pobierz"
        aria-label="Pobierz plik"
        className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-white/70 bg-black/20 text-white opacity-0 transition hover:bg-black/40 group-hover:opacity-100"
      >
        <Download size={12} />
      </button>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/80 via-black/10 to-transparent p-2 pt-6">
        <span className="truncate text-[10px] font-bold text-white">{file.name}</span>
        <div className="flex shrink-0 gap-1">
          <TileAction
            active={file.status === "changes_requested"}
            activeColor="bg-danger"
            label={t("room.tileTooltips.requestChanges")}
            onClick={(e) => {
              e.stopPropagation();
              onStatus(file.id, "changes_requested");
            }}
          >
            <X size={13} />
          </TileAction>
          <TileAction
            active={file.status === "approved"}
            activeColor="bg-success"
            label={t("room.tileTooltips.approve")}
            onClick={(e) => {
              e.stopPropagation();
              onStatus(file.id, "approved");
            }}
          >
            <Check size={13} />
          </TileAction>
          <TileAction
            active={file.commentCount > 0}
            activeColor="bg-accent"
            label={t("room.tileTooltips.comment")}
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
          >
            <MessageCircle size={13} />
          </TileAction>
        </div>
      </div>
    </div>
  );
}

function TileAction({
  children,
  active,
  activeColor,
  label,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  activeColor: string;
  label: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-6 w-6 items-center justify-center rounded-full border border-white/70 text-white transition ${
        active ? activeColor : "bg-black/20 hover:bg-black/40"
      }`}
    >
      {children}
    </button>
  );
}

function Lightbox({
  file,
  accent,
  slug,
  getOrAskName,
  onClose,
  onStatus,
  onDownload,
}: {
  file: RoomFile;
  accent: string;
  slug: string;
  getOrAskName: () => string | null;
  onClose: () => void;
  onStatus: (status: RoomFile["status"]) => void;
  onDownload: () => void;
}) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key.toLowerCase() === "a") onStatus("approved");
      if (e.key.toLowerCase() === "x") onStatus("changes_requested");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onStatus]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    const name = getOrAskName();
    if (!name) return;

    setSending(true);
    const res = await fetch(`/api/rooms/${slug}/comments`, {
      method: "POST",
      body: JSON.stringify({ fileId: file.id, authorName: name, body: comment.trim() }),
    });
    setSending(false);
    if (res.ok) {
      setComments((prev) => [...prev, comment.trim()]);
      setComment("");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4 md:flex-row md:p-10"
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        aria-label="Zamknij"
      >
        <X size={18} />
      </button>

      <div className="flex flex-1 items-center justify-center">
        <img src={file.thumbUrl} alt={file.name} className="max-h-[70vh] max-w-full rounded-tile object-contain" />
      </div>

      <div className="mt-4 flex w-full flex-col md:ml-6 md:mt-0 md:w-80">
        <div className="flex gap-2">
          <button
            onClick={() => onStatus("changes_requested")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/20 py-2 text-sm text-white hover:bg-white/10"
          >
            <X size={14} /> {t("room.tileTooltips.requestChanges")}
          </button>
          <button
            onClick={() => onStatus("approved")}
            style={{ backgroundColor: accent }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-white"
          >
            <Check size={14} /> {t("room.tileTooltips.approve")}
          </button>
          <button
            onClick={onDownload}
            className="flex items-center justify-center rounded-lg border border-white/20 px-3 text-white hover:bg-white/10"
            aria-label="Pobierz"
          >
            <Download size={14} />
          </button>
        </div>

        <div className="mt-6 flex-1 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-sm text-white/40">{t("room.comments.empty")}</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c, i) => (
                <li key={i} className="rounded-lg bg-white/5 p-3 text-sm text-white/90">
                  {c}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form className="mt-4 flex gap-2" onSubmit={submitComment}>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("room.comments.placeholder")}
            className="flex-1 rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={sending}
            style={{ backgroundColor: accent }}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {t("room.comments.send")}
          </button>
        </form>
      </div>
    </div>
  );
}
