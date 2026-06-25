import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminAccessGate from "@/components/AdminAccessGate";
import AdminSidebar from "@/components/AdminSidebar";
import TrialNotice from "@/components/TrialNotice";
import { dashboardFont } from "./fonts";

export default async function AdminLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/start");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className={`${dashboardFont.className} min-h-screen bg-[#f6f4ef] text-[#171411]`}>
      <AdminSidebar profile={profile} />

      <main className="min-h-screen pb-24 md:ml-80 md:pb-0">
        <TrialNotice profile={profile} />

        <AdminAccessGate profile={profile}>{children}</AdminAccessGate>
      </main>
    </div>
  );
}