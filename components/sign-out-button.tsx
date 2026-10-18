"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { t } from "@/lib/i18n";

export default function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      className="ml-2 flex items-center gap-1.5 rounded-lg px-3 py-2 text-ink/70 hover:bg-black/5"
    >
      <LogOut size={15} /> {t("auth.signOut")}
    </button>
  );
}
