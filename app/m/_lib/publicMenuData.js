import { supabasePublic } from "@/lib/supabasePublic";

export function getCleanLinksEnabled() {
  return process.env.NEXT_PUBLIC_MENU_CLEAN_LINKS === "true";
}

export function getBusinessHref(businessSlug) {
  if (getCleanLinksEnabled()) return `/${businessSlug}`;
  return `/m/${businessSlug}`;
}

export function getBranchHref(businessSlug, branchSlug) {
  if (getCleanLinksEnabled()) return `/${businessSlug}/${branchSlug}`;
  return `/m/${businessSlug}/${branchSlug}`;
}

export function getSectionHref(businessSlug, branchSlug, sectionSlug) {
  if (getCleanLinksEnabled()) {
    return `/${businessSlug}/${branchSlug}/${sectionSlug}`;
  }

  return `/m/${businessSlug}/${branchSlug}/${sectionSlug}`;
}

export function getSectionSlug(section) {
  return section?.slug || `section-${String(section?.id || "").slice(0, 8)}`;
}

export function cleanSections(menu) {
  return [...(menu?.sections || [])]
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((section) => ({
      ...section,
      slug: getSectionSlug(section),
      items: [...(section.items || [])]
        .filter((item) => item.is_available !== false)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    }))
    .filter((section) => section.items.length > 0);
}

export async function getBusinessPayload(businessSlug) {
  const { data, error } = await supabasePublic
    .from("businesses")
    .select(`
      id,
      name,
      name_i18n,
      slug,
      logo_url,
      description,
      description_i18n,
      status,
      landing_cover_url,
      landing_mode,
      branches (
        id,
        name,
        name_i18n,
        slug,
        address,
        address_i18n,
        status,
        is_main,
        menu_versions (
          id,
          status,
          logo_url,
          cover_url,
          primary_color,
          sections (
            id,
            sort_order,
            cover_url,
            items (
              id,
              image_url,
              is_available,
              sort_order
            )
          )
        )
      )
    `)
    .eq("slug", businessSlug)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  if (!data) return null;

  const branches = [...(data.branches || [])]
    .filter((branch) => branch.status === "active")
    .sort((a, b) => Number(b.is_main) - Number(a.is_main));

  return {
    business: data,
    branches,
  };
}

export async function getBranchMenuPayload(businessSlug, branchSlug) {
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
      is_main,
      business_id,
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
        enabled_languages,
        default_language,
        sections (
          id,
          slug,
          cover_url,
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

  const menu =
    data.menu_versions?.find((item) => item.status === "active") ||
    data.menu_versions?.[0] ||
    null;

  if (!menu) return null;

  const { data: allBranches, error: branchesError } = await supabasePublic
    .from("branches")
    .select(`
      id,
      name,
      name_i18n,
      slug,
      address,
      address_i18n,
      status,
      is_main,
      business_id
    `)
    .eq("business_id", data.business_id)
    .eq("status", "active");

  if (branchesError) {
    console.error(branchesError);
  }

  return {
    business: data.businesses,
    branch: data,
    menu,
    sections: cleanSections(menu),
    branches: [...(allBranches || [])].sort(
      (a, b) => Number(b.is_main) - Number(a.is_main)
    ),
  };
}