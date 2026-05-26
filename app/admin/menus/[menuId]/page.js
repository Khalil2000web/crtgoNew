import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MenuEditor from "./menu-editor";

export default async function MenuAdminPage({ params }) {
  const { menuId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/start");

  const { data: menu } = await supabase
    .from("menus")
    .select(`
      *,
      sections (
        *,
        items (*)
      )
    `)
    .eq("id", menuId)
    .eq("owner_id", user.id)
    .single();

  if (!menu) notFound();

  return <MenuEditor menu={menu} />;
}