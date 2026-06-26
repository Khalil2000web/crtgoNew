import { notFound } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

import ClassicTemplate from "@/components/templates/ClassicTemplate";
import LuxuryTemplate from "@/components/templates/LuxuryTemplate";
import { getPublicMenu } from "@/lib/public-menu";

function hasAccess(profile) {
  if (!profile) return false;

  const plan = String(profile.plan || "free").toLowerCase();

  const subscriptionStatus = String(
    profile.paypal_subscription_status ||
      profile.subscription_status ||
      ""
  ).toUpperCase();

  const trialActive =
    profile.trial_ends_at &&
    new Date(profile.trial_ends_at) > new Date();

  const proActive =
    plan === "pro" &&
    ["ACTIVE", "APPROVED"].includes(subscriptionStatus);

  return proActive || trialActive;
}

function renderTemplate(menu) {
  const templateId = String(menu?.template_id || "classic").toLowerCase();

  if (templateId === "luxury" || templateId === "luxurytemplate") {
    return <LuxuryTemplate menu={menu} />;
  }

  return <ClassicTemplate menu={menu} />;
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
    <main className="flex min-h-screen items-center justify-center bg-[#cfc6b8] p-5 text-[#1b1712]">
      <div className="max-w-md text-center">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-black">
          This menu is unavailable <CircleAlert />
        </h1>

        <p className="mt-3 text-sm font-bold text-[#1b1712]/55">
          The owner needs to activate their account or restore this menu.
        </p>
      </div>
    </main>
  );
}

export default async function PublicMenuPage({ params }) {
  const { handle } = await params;

  const menu = await getPublicMenu(handle);

  if (!menu) notFound();

  if (menu.status && menu.status !== "active") {
    return <MenuUnavailable />;
  }

  const supabase = await createClient();

  const { data: owner } = await supabase
    .from("profiles")
    .select(
      "id, plan, trial_ends_at, subscription_status, paypal_subscription_status"
    )
    .eq("id", menu.owner_id)
    .single();

  if (!hasAccess(owner)) {
    return <MenuUnavailable />;
  }

  return renderTemplate(menu);
}