import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminAccessGate from "@/components/AdminAccessGate";
import AdminSidebar from "@/components/AdminSidebar";
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
      className={`${dashboardFont.className} min-h-screen bg-[#edebeb]`}
    >
      <AdminSidebar profile={profile} />

      <main className="md:ml-80">
        <AdminAccessGate profile={profile}>
          {children}
        </AdminAccessGate>
      </main>
    </div>
  );
}