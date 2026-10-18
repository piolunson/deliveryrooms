import Link from "next/link";
import { Box, Users, Star } from "lucide-react";
import SignOutButton from "@/components/sign-out-button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/admin" className="flex items-center gap-2 font-extrabold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-white">
              <Box size={16} />
            </span>
            Admin
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium text-ink/70">
            <Link href="/admin/uzytkownicy" className="flex items-center gap-1.5 rounded-lg px-3 py-2 hover:bg-black/5">
              <Users size={15} /> Użytkownicy
            </Link>
            <Link href="/admin/opinie" className="flex items-center gap-1.5 rounded-lg px-3 py-2 hover:bg-black/5">
              <Star size={15} /> Opinie
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
