import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MenuEditor from "./menu-editor";

export const metadata = {
  title: "Menu Dashboard",
};

export default async function MenuAdminPage({ params }) {
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
        *,
        items (*)
      )
    `
    )
    .eq("id", menuId)
    .eq("owner_id", user.id)
    .single();

  if (error || !menu) notFound();

  return <MenuEditor menu={menu} />;
}