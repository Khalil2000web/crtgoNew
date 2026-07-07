import { supabasePublic } from "@/lib/supabasePublic";

const PUBLIC_BLOCKED_STATUSES = new Set([
  "past_due",
  "paused",
  "canceled",
]);

const SUPPORTED_LANGUAGES = ["ar", "he", "en"];

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

export function normalizeTemplateId(value) {
  const template = String(value || "classic").toLowerCase();

  if (template === "modern") return "modern";
  if (template === "luxury") return "luxury";

  if (
    ["clean", "clean_cards", "clean-cards", "template_clean_cards"].includes(
      template
    )
  ) {
    return "clean_cards";
  }

  return "classic";
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeLanguages(value) {
  const languages = Array.isArray(value) ? value : ["ar"];

  const clean = unique(
    languages
      .map((language) => String(language || "").toLowerCase())
      .filter((language) => SUPPORTED_LANGUAGES.includes(language))
  );

  return clean.length ? clean : ["ar"];
}

function normalizeTemplates(value) {
  const templates = Array.isArray(value) ? value : ["classic"];

  const clean = unique(templates.map(normalizeTemplateId));

  return clean.length ? clean : ["classic"];
}

function normalizeLimitNumber(value) {
  if (value === null || value === undefined || value === "") return null;

  if (String(value).toLowerCase() === "unlimited") return null;

  const number = Number(value);

  if (!Number.isFinite(number)) return null;

  return Math.max(0, Math.floor(number));
}

function getLimitNumber(value) {
  const clean = normalizeLimitNumber(value);

  if (clean === null) return Infinity;

  return clean;
}

export function normalizePlanLimits(rawLimits) {
  const source =
    rawLimits && typeof rawLimits === "object" && !Array.isArray(rawLimits)
      ? rawLimits
      : {};

  return {
    ...source,
    max_branches: normalizeLimitNumber(source.max_branches),
    max_items: normalizeLimitNumber(source.max_items),
    templates: normalizeTemplates(source.templates),
    custom_cover: source.custom_cover === true,
    section_pages: source.section_pages !== false,
    languages: normalizeLanguages(source.languages),
    qr_codes: source.qr_codes !== false,
  };
}

export function getPublicBillingState(subscription, fallbackPlan = null) {
  const status = subscription?.status || "active";
  const plan = subscription?.billing_plans || fallbackPlan || null;

  const planMissing = !plan;
  const planInactive = Boolean(plan && plan.is_active === false);
  const subscriptionBlocked = PUBLIC_BLOCKED_STATUSES.has(status);

  const limits = normalizePlanLimits(plan?.limits);

  return {
    subscription,
    status,
    plan,
    limits,
    isAvailable: !planMissing && !planInactive && !subscriptionBlocked,
    unavailableReason: planMissing
      ? "plan_missing"
      : planInactive
        ? "plan_inactive"
        : subscriptionBlocked
          ? status
          : null,
  };
}

async function getFallbackPublicPlan() {
  const { data, error } = await supabasePublic
    .from("billing_plans")
    .select(`
      id,
      name,
      description,
      monthly_price,
      currency,
      is_active,
      limits
    `)
    .eq("id", "free")
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data || null;
}

async function getBusinessBilling(businessId) {
  if (!businessId) {
    const fallbackPlan = await getFallbackPublicPlan();
    return getPublicBillingState(null, fallbackPlan);
  }

  const [{ data, error }, fallbackPlan] = await Promise.all([
    supabasePublic
      .from("business_subscriptions")
      .select(`
        business_id,
        plan_id,
        status,
        current_period_end,
        billing_plans (
          id,
          name,
          description,
          monthly_price,
          currency,
          is_active,
          limits
        )
      `)
      .eq("business_id", businessId)
      .maybeSingle(),

    getFallbackPublicPlan(),
  ]);

  if (error) {
    console.error(error);
    return getPublicBillingState(null, fallbackPlan);
  }

  return getPublicBillingState(data || null, fallbackPlan);
}

export function getSafeTemplateId(menu, billing) {
  const wantedTemplate = normalizeTemplateId(menu?.template_id || "classic");
  const limits = normalizePlanLimits(billing?.limits);
  const allowedTemplates = normalizeTemplates(limits.templates);

  if (wantedTemplate === "clean_cards" && limits.section_pages === false) {
    return "classic";
  }

  if (allowedTemplates.includes(wantedTemplate)) {
    return wantedTemplate;
  }

  return "classic";
}

function getSafeEnabledLanguages(menu, billing) {
  const limits = normalizePlanLimits(billing?.limits);

  const planLanguages = normalizeLanguages(limits.languages);
  const menuLanguages = normalizeLanguages(menu?.enabled_languages);

  const enabledLanguages = menuLanguages.filter((language) =>
    planLanguages.includes(language)
  );

  return enabledLanguages.length ? enabledLanguages : [planLanguages[0] || "ar"];
}

function applyPublicMenuPlan(menu, billing) {
  const enabledLanguages = getSafeEnabledLanguages(menu, billing);

  const defaultLanguage = enabledLanguages.includes(menu?.default_language)
    ? menu.default_language
    : enabledLanguages[0];

  return {
    ...menu,
    template_id: getSafeTemplateId(menu, billing),
    cover_url: billing?.limits?.custom_cover ? menu.cover_url : null,
    enabled_languages: enabledLanguages,
    default_language: defaultLanguage,
  };
}

function sortBranches(branches = []) {
  return [...branches]
    .filter((branch) => branch.status === "active")
    .sort((a, b) => Number(b.is_main) - Number(a.is_main));
}

function limitBranches(branches = [], billing) {
  const sorted = sortBranches(branches);
  const maxBranches = getLimitNumber(billing?.limits?.max_branches);

  if (!Number.isFinite(maxBranches)) return sorted;

  return sorted.slice(0, maxBranches);
}

export function cleanSections(menu, billing = null) {
  const maxItems = getLimitNumber(billing?.limits?.max_items);
  let usedItems = 0;

  return [...(menu?.sections || [])]
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((section) => {
      let items = [...(section.items || [])]
        .filter((item) => item.is_available !== false)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      if (Number.isFinite(maxItems)) {
        const remaining = Math.max(0, maxItems - usedItems);
        items = items.slice(0, remaining);
        usedItems += items.length;
      }

      return {
        ...section,
        slug: getSectionSlug(section),
        items,
      };
    })
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
          name,
          name_i18n,
          status,
          logo_url,
          cover_url,
          primary_color,
          background_color,
          text_color,
          template_id,
          description_ar,
          description_i18n,
          enabled_languages,
          default_language,
          sections (
            id,
            slug,
            sort_order,
            cover_url,
            name_ar,
            name_i18n,
            items (
              id,
              name_ar,
              name_i18n,
              description_ar,
              description_i18n,
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

  const billing = await getBusinessBilling(data.id);
  const branches = limitBranches(data.branches || [], billing);

  return {
    business: data,
    branches,
    billing,
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
        background_color,
        text_color,
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

  const billing = await getBusinessBilling(data.business_id);

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

  const branches = limitBranches(allBranches || [], billing);

  const branchAllowed = branches.some(
    (branchItem) => String(branchItem.id) === String(data.id)
  );

  if (!branchAllowed) return null;

  const safeMenu = applyPublicMenuPlan(menu, billing);

  return {
    business: data.businesses,
    branch: data,
    menu: safeMenu,
    sections: cleanSections(safeMenu, billing),
    branches,
    billing,
  };
}