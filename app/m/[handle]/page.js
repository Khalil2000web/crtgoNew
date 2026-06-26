import { notFound } from "next/navigation";
import { CircleAlert } from "lucide-react";

import { supabaseAdmin } from "@/lib/supabase/admin";
import ClassicTemplate from "@/components/templates/ClassicTemplate";
import LuxuryTemplate from "@/components/templates/LuxuryTemplate";
import { getPublicMenu } from "@/lib/public-menu";

export const dynamic = "force-dynamic";

function hasAccess(profile) {
  if (!profile) return false;

  const plan = String(profile.plan || "free").toLowerCase();

  const paypalStatus = String(
    profile.paypal_subscription_status || ""
  ).toUpperCase();

  const subscriptionStatus = String(
    profile.subscription_status || ""
  ).toUpperCase();

  const trialActive =
    profile.trial_ends_at &&
    new Date(profile.trial_ends_at).getTime() > Date.now();

  const proActive =
    plan === "pro" &&
    (paypalStatus === "ACTIVE" ||
      subscriptionStatus === "ACTIVE" ||
      paypalStatus === "APPROVED" ||
      subscriptionStatus === "APPROVED");

  return proActive || trialActive;
}

function isMenuActive(menu) {
  const status = String(menu?.status || "active").toLowerCase();

  return status === "active";
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

  if (!menu || !isMenuActive(menu)) {
    return {
      title: "Menu unavailable",
      description: "This digital menu is unavailable.",
    };
  }

  const image = menu.cover_url || menu.logo_url || null;

  return {
    title: menu.name || "Menu",
    description: menu.description_ar || "Digital menu powered by CRTGO.",
    openGraph: {
      title: menu.name || "Menu",
      description: menu.description_ar || "Digital menu powered by CRTGO.",
      images: image ? [image] : [],
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

  if (!isMenuActive(menu)) {
    return <MenuUnavailable />;
  }

  const { data: owner, error: ownerError } = await supabaseAdmin
    .from("profiles")
    .select(
      "id, plan, trial_ends_at, subscription_status, paypal_subscription_status"
    )
    .eq("id", menu.owner_id)
    .maybeSingle();

  if (ownerError) {
    console.error("Public menu owner check failed:", ownerError);
    return <MenuUnavailable />;
  }

  if (!hasAccess(owner)) {
    console.log("Public menu blocked:", {
      handle,
      menuId: menu.id,
      ownerId: menu.owner_id,
      owner,
    });

    return <MenuUnavailable />;
  }

  return renderTemplate(menu);
}