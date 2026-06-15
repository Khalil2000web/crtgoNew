import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppearanceEditor from "./appearance-editor";

export default async function AppearancePage({ params }) {
  const { menuId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: menu } = await supabase
    .from("menus")
    .select("*")
    .eq("id", menuId)
    .eq("owner_id", user.id)
    .single();

  if (!menu) notFound();

  return <AppearanceEditor menu={menu} />;
}