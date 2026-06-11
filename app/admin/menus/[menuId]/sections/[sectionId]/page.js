import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SectionEditor from "./section-editor";

export default async function SectionPage({ params }) {
  const { menuId, sectionId } = await params;
  const supabase = await createClient();

  const { data: section } = await supabase
    .from("sections")
    .select(`
      *,
      items (*)
    `)
    .eq("id", sectionId)
    .eq("menu_id", menuId)
    .single();

  if (!section) notFound();

  return <SectionEditor section={section} menuId={menuId} />;
}