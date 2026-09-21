import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";

function createPublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function normalizeLanguages(value, fallback = "ar") {
  const allowed = new Set(["ar", "he", "en"]);
  const rows = Array.isArray(value) ? value : [];
  const clean = [...new Set(rows.map((item) => String(item || "").toLowerCase()).filter((item) => allowed.has(item)))];
  return clean.length ? clean : [allowed.has(fallback) ? fallback : "ar"];
}

export async function getPublicProject(slug) {
  "use cache";

  const cleanSlug = String(slug || "").trim().toLowerCase();
  if (!cleanSlug) return null;

  cacheTag(`crtgo-menu-${cleanSlug}`);
  cacheLife({ stale: 60, revalidate: 60, expire: 300 });

  const supabase = createPublicSupabase();

  const { data: menu, error: menuError } = await supabase
    .from("menus")
    .select(`
      id,
      slug,
      business_name,
      description,
      logo_url,
      cover_url,
      phone,
      whatsapp,
      instagram,
      location,
      working_hours,
      currency,
      default_language,
      enabled_languages,
      name_i18n,
      description_i18n,
      location_i18n,
      accent_color,
      background_color,
      text_color,
      is_published,
      published_at
    `)
    .eq("slug", cleanSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (menuError) throw menuError;
  if (!menu) return null;

  const { data: categoryRows, error: categoryError } = await supabase
    .from("categories")
    .select("id, menu_id, name, description, name_i18n, description_i18n, sort_order, is_visible")
    .eq("menu_id", menu.id)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (categoryError) throw categoryError;

  const categories = categoryRows || [];
  const categoryIds = categories.map((row) => row.id);
  let itemRows = [];

  if (categoryIds.length) {
    const { data, error } = await supabase
      .from("items")
      .select("id, category_id, name, description, name_i18n, description_i18n, price, image_url, is_available, sort_order")
      .in("category_id", categoryIds)
      .eq("is_available", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    itemRows = data || [];
  }

  const sections = categories.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    coverUrl: null,
    iconType: "none",
    iconValue: null,
    sortOrder: category.sort_order,
    nameI18n: category.name_i18n || {},
    descriptionI18n: category.description_i18n || {},
    items: itemRows
      .filter((item) => item.category_id === category.id)
      .map((item) => ({
        id: item.id,
        sectionId: category.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.image_url,
        available: item.is_available,
        sortOrder: item.sort_order,
        nameI18n: item.name_i18n || {},
        descriptionI18n: item.description_i18n || {},
      })),
  }));

  const enabledLanguages = normalizeLanguages(menu.enabled_languages, menu.default_language || "ar");
  const defaultLanguage = enabledLanguages.includes(menu.default_language)
    ? menu.default_language
    : enabledLanguages[0];

  return {
    id: menu.id,
    name: menu.business_name,
    slug: menu.slug,
    status: "active",
    description: menu.description,
    logoUrl: menu.logo_url,
    faviconUrl: menu.logo_url,
    coverUrl: menu.cover_url,
    coverImages: menu.cover_url ? [menu.cover_url] : [],
    phone: menu.phone,
    whatsapp: menu.whatsapp,
    instagram: menu.instagram,
    tiktok: null,
    facebook: null,
    location: menu.location,
    workingHours: menu.working_hours || {},
    primaryColor: menu.accent_color || "#000000",
    backgroundColor: menu.background_color || "#ffffff",
    textColor: menu.text_color || "#000000",
    currency: menu.currency || "ILS",
    enabledLanguages,
    defaultLanguage,
    nameI18n: menu.name_i18n || {},
    descriptionI18n: menu.description_i18n || {},
    locationI18n: menu.location_i18n || {},
    sections,
  };
}

export const getPublicMenuData = getPublicProject;
