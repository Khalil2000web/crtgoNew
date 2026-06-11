import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CircleAlert } from "lucide-react";

import ClassicTemplate from "@/components/templates/ClassicTemplate";
import LuxuryTemplate from "@/components/templates/LuxuryTemplate";
import MinimalTemplate from "@/components/templates/MinimalTemplate";

function hasAccess(profile) {
  if (!profile) return false;

  if (profile.subscription_status === "active") return true;

  if (
    profile.subscription_status === "trialing" &&
    profile.trial_ends_at &&
    new Date(profile.trial_ends_at) > new Date()
  ) {
    return true;
  }

  return false;
}

function MenuUnavailable() {
  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-black flex gap-2 items-center justify-center">This menu is unavailable <CircleAlert /></h1>

        <p className="mt-3 text-black/50 hidden">
          The subscription for this menu has expired
        </p>
      </div>
    </main>
  );
}

export default async function PublicMenuPage({ params }) {
  const { handle } = await params;
  const supabase = await createClient();

  const { data: menu } = await supabase
    .from("menus")
    .select(`
      *,
      sections (
        *,
        items (*)
      )
    `)
    .eq("subdomain", handle)
    .eq("status", "active")
    .single();

  if (!menu) notFound();

  const { data: owner } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", menu.owner_id)
    .single();

  if (!hasAccess(owner)) {
    return <MenuUnavailable />;
  }

  if (menu.template_id === "luxury") {
    return <LuxuryTemplate menu={menu} />;
  }

  if (menu.template_id === "minimal") {
    return <MinimalTemplate menu={menu} />;
  }

  return <ClassicTemplate menu={menu} />;
}