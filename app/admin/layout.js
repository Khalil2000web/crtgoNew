import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import { ChevronLeft, Settings } from "lucide-react";

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
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-2 py-4">

          <nav className="flex items-center gap-4">

            <Link href="/admin/settings" className="cursor-pointer text-md hover:bg-black/10 rounded-full p-3">
  <Settings />
</Link>

            <LogoutButton />
          </nav>

                    <div className="flex flex-col pl-3 justify-center items-start" dir="ltr">
            <p className="text-xs text-black/70">
              DASHBOARD
            </p>

            <h1 className="font-black">
              @{profile?.display_name || "CRTGO"}
            </h1>
          </div>
        </div>
      </header>

      <main>
        {children}
      </main>
    </div>
  );
}