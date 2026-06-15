import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminAccessGate from "@/components/AdminAccessGate";
import AdminSidebar from "@/components/AdminSidebar";
import TrialNotice from "@/components/TrialNotice";
import AdminBackground from "./AdminBackground";
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
    <div
      className={`${dashboardFont.className} min-h-screen text-white bg-[#0f0f0f]`}
    >
    <AdminBackground />
      <AdminSidebar profile={profile} />

      <main className="md:ml-80">
        <TrialNotice profile={profile} />
        <AdminAccessGate profile={profile}>
          {children}
        </AdminAccessGate>
      </main>
    </div>
  );
}