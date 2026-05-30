"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();

    router.push("/start");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-full cursor-pointer border border-black/15 px-4 py-2 text-sm font-bold hover:bg-black/5 transition"
    >
      تسجيل الخروج
    </button>
  );
}