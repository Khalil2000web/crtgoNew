import { notFound } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

import ClassicTemplate from "@/components/templates/ClassicTemplate";
import { getPublicMenu } from "@/lib/public-menu";

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

export async function generateMetadata({ params }) {
  const { handle } = await params;

  const menu = await getPublicMenu(handle);

  if (!menu) {
    return {
      title: "Menu unavailable",
      description: "This digital menu is unavailable.",
    };
  }

  return {
    title: menu.name || "Menu",
    description: menu.description_ar || "Digital menu powered by CRTGO.",
    openGraph: {
      title: menu.name || "Menu",
      description: menu.description_ar || "Digital menu powered by CRTGO.",
      images: menu.cover_url || menu.logo_url ? [menu.cover_url || menu.logo_url] : [],
    },
  };
}

function MenuUnavailable() {
  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div className="max-w-md text-center">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-black">
          This menu is unavailable <CircleAlert />
        </h1>
      </div>
    </main>
  );
}

export default async function PublicMenuPage({ params }) {
  const { handle } = await params;

  const menu = await getPublicMenu(handle);

  if (!menu) notFound();

  const supabase = await createClient();

  const { data: owner } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", menu.owner_id)
    .single();

  if (!hasAccess(owner)) {
    return <MenuUnavailable />;
  }

  return <ClassicTemplate menu={menu} />;
}