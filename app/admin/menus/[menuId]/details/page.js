import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DetailsForm from "./details-form";

export const metadata = {
  title: "Menu Details",
};

export default async function DetailsPage({ params }) {
  const { menuId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/start");
  }

  const { data: menu, error } = await supabase
    .from("menus")
    .select(
      `
      id,
      owner_id,
      name,
      subdomain,
      description_ar,
      location,
      phone,
      whatsapp,
      instagram,
      tiktok,
      facebook,
      enabled_languages,
      default_language,
      name_i18n,
      description_i18n,
      location_i18n
    `
    )
    .eq("id", menuId)
    .eq("owner_id", user.id)
    .single();

  if (error || !menu) {
    notFound();
  }

  return <DetailsForm menu={menu} />;
}