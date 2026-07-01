import { notFound } from "next/navigation";

import { supabasePublic } from "@/lib/supabasePublic";
import PublicMenuClient from "./PublicMenuClient";
import { pickText } from "./_components/menuUtils";

export const dynamic = "force-dynamic";

async function getPublicMenu(businessSlug, branchSlug) {
  const { data, error } = await supabasePublic
    .from("branches")
    .select(`
      id,
      name,
      name_i18n,
      slug,
      address,
      address_i18n,
      phone,
      whatsapp,
      instagram,
      facebook,
      tiktok,
      working_hours,
      status,
      businesses!inner (
        id,
        name,
        name_i18n,
        slug,
        logo_url,
        description,
        description_i18n,
        status
      ),
      menu_versions!inner (
        id,
        name,
        name_i18n,
        status,
        template_id,
        description_ar,
        description_i18n,
        logo_url,
        cover_url,
        primary_color,
        background_color,
        text_color,
        enabled_languages,
        default_language,
        sections (
          id,
          name_ar,
          name_i18n,
          sort_order,
          items (
            id,
            name_ar,
            name_i18n,
            description_ar,
            description_i18n,
            price,
            image_url,
            is_available,
            sort_order
          )
        )
      )
    `)
    .eq("slug", branchSlug)
    .eq("status", "active")
    .eq("businesses.slug", businessSlug)
    .eq("businesses.status", "active")
    .eq("menu_versions.status", "active")
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  if (!data) return null;

  const activeMenu =
    data.menu_versions?.find((menu) => menu.status === "active") ||
    data.menu_versions?.[0] ||
    null;

  if (!activeMenu) return null;

  const sections = [...(activeMenu.sections || [])]
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((section) => ({
      ...section,
      items: [...(section.items || [])]
        .filter((item) => item.is_available)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    }))
    .filter((section) => section.items.length > 0);

  return {
    branch: data,
    business: data.businesses,
    menu: activeMenu,
    sections,
  };
}

export async function generateMetadata({ params }) {
  const { businessSlug, branchSlug } = await params;

  const data = await getPublicMenu(businessSlug, branchSlug);

  if (!data) {
    return {
      title: "Menu not found | CRTGO",
      description: "This menu is not available.",
    };
  }

  const lang = data.menu.default_language || "ar";

  const businessName = pickText(data.business, "name", "name_i18n", lang);
  const menuDescription =
    pickText(data.menu, "description_ar", "description_i18n", lang) ||
    pickText(data.business, "description", "description_i18n", lang) ||
    `View the menu for ${businessName}.`;

  const image =
    data.menu.cover_url ||
    data.menu.logo_url ||
    data.business.logo_url ||
    "https://cdn.sanity.io/images/gcqd797l/production/673085cc5a599ee99c91a81b1d9a741588c6a943-3464x3464.png";

  return {
    title: `${businessName} Menu | CRTGO`,
    description: menuDescription,
    openGraph: {
      title: `${businessName} Menu | CRTGO`,
      description: menuDescription,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: businessName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${businessName} Menu | CRTGO`,
      description: menuDescription,
      images: [image],
    },
  };
}

export default async function PublicMenuPage({ params }) {
  const { businessSlug, branchSlug } = await params;

  const data = await getPublicMenu(businessSlug, branchSlug);

  if (!data) {
    notFound();
  }

  return (
    <PublicMenuClient
      business={data.business}
      branch={data.branch}
      menu={data.menu}
      sections={data.sections}
    />
  );
}