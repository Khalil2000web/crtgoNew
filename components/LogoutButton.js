"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton({ className = "" }) {
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
      className={`${className}`}
    >
      تسجيل الخروج
    </button>
  );
}