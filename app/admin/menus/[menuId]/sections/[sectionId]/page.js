import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SectionEditor from "./section-editor";

export default async function SectionPage({ params }) {
  const { menuId, sectionId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/start");

  const { data: menu } = await supabase
    .from("menus")
    .select("id, name, owner_id")
    .eq("id", menuId)
    .eq("owner_id", user.id)
    .single();

  if (!menu) notFound();

  const { data: section } = await supabase
    .from("sections")
    .select(
      `
      *,
      items (*)
    `
    )
    .eq("id", sectionId)
    .eq("menu_id", menuId)
    .single();

  if (!section) notFound();

  return <SectionEditor section={section} menu={menu} menuId={menuId} />;
}