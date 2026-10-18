import Link from "next/link";
import { Box, LayoutGrid, Palette, Settings, LogOut } from "lucide-react";
import { t } from "@/lib/i18n";
import SignOutButton from "@/components/sign-out-button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/app" className="flex items-center gap-2 font-extrabold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
              <Box size={16} />
            </span>
            {process.env.NEXT_PUBLIC_APP_NAME || "DeliveryRooms"}
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium text-ink/70">
            <Link href="/app" className="flex items-center gap-1.5 rounded-lg px-3 py-2 hover:bg-black/5">
              <LayoutGrid size={15} /> {t("dashboard.nav.rooms")}
            </Link>
            <Link href="/app/marka" className="flex items-center gap-1.5 rounded-lg px-3 py-2 hover:bg-black/5">
              <Palette size={15} /> {t("dashboard.nav.brand")}
            </Link>
            <Link href="/app/ustawienia" className="flex items-center gap-1.5 rounded-lg px-3 py-2 hover:bg-black/5">
              <Settings size={15} /> {t("dashboard.nav.settings")}
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
