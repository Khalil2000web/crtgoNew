import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SectionsManager from "./sections-manager";

export const metadata = {
  title: "Menu Sections",
};

export default async function SectionsPage({ params }) {
  const { menuId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/start");
  }

  const { data: menu, error: menuError } = await supabase
    .from("menus")
    .select("id, owner_id, name, subdomain, enabled_languages, default_language")
    .eq("id", menuId)
    .eq("owner_id", user.id)
    .single();

  if (menuError || !menu) {
    notFound();
  }

  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select(
      `
      id,
      menu_id,
      name_ar,
      name_i18n,
      sort_order,
      items (
        id
      )
    `
    )
    .eq("menu_id", menu.id)
    .order("sort_order", { ascending: true });

  if (sectionsError) {
    throw new Error(sectionsError.message);
  }

  return <SectionsManager menu={menu} initialSections={sections || []} />;
}