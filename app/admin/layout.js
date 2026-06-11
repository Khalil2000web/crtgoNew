import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import AdminAccessGate from "@/components/AdminAccessGate";
import { Settings, CreditCard } from "lucide-react";

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
    <div className="min-h-screen">
      <header className="border-b border-black/10 md:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-2 py-4">
          <nav className="flex items-center gap-4">
            
            <Link
              prefetch
              href="/admin/settings"
              className="cursor-pointer rounded-full p-3 text-md hover:bg-black/10"
            >
              <Settings />
            </Link>

<Link
  prefetch
  href="/admin/billing"
  className="cursor-pointer rounded-full p-3 text-md hover:bg-black/10"
>
  <CreditCard />
</Link>

            <LogoutButton />
          </nav>

          <div className="flex flex-col items-start justify-center pl-3" dir="ltr">
            <p className="text-xs text-black/70">DASHBOARD</p>
            <h1 className="font-black">@{profile?.display_name || "CRTGO"}</h1>
          </div>
        </div>
      </header>

      <aside className="fixed left-0 top-0 hidden h-screen w-70 flex-col items-center justify-between border-r border-black/10 p-2 md:flex">
        <div className="flex w-full items-center justify-between pt-2">
          <Link
            prefetch
            href="/admin/settings"
            className="cursor-pointer rounded-full p-3 text-md hover:bg-black/10"
          >
            <Settings />
          </Link>

          <div className="flex flex-col items-start justify-center pl-3" dir="ltr">
            <p className="text-xs text-black/70">DASHBOARD</p>
            <h1 className="font-black">@{profile?.display_name || "CRTGO"}</h1>
          </div>
        </div>

        <div className="flex w-full items-center justify-center">
          <LogoutButton className="w-full" />
        </div>
      </aside>

      <main className="md:ml-70">
        <AdminAccessGate profile={profile}>{children}</AdminAccessGate>
      </main>
    </div>
  );
}