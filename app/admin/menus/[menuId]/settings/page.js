import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./settings-form";

export const metadata = {
  title: "Menu Settings",
};

export default async function MenuSettingsPage({ params }) {
  const { menuId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/start");

  const { data: menu, error } = await supabase
    .from("menus")
    .select(
      `
      *,
      sections (
        id
      )
    `
    )
    .eq("id", menuId)
    .eq("owner_id", user.id)
    .single();

  if (error || !menu) notFound();

  return <SettingsForm menu={menu} />;
}