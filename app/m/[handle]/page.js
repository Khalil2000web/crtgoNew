import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import ClassicTemplate from "@/components/templates/ClassicTemplate";
import LuxuryTemplate from "@/components/templates/LuxuryTemplate";
import MinimalTemplate from "@/components/templates/MinimalTemplate";

export default async function PublicMenuPage({ params }) {
  const { handle } = await params;
  const supabase = await createClient();

  const { data: menu } = await supabase
    .from("menus")
    .select(`
      *,
      sections (
        *,
        items (*)
      )
    `)
    .eq("subdomain", handle)
    .eq("status", "active")
    .single();

  if (!menu) notFound();

  if (menu.template_id === "luxury") {
    return <LuxuryTemplate menu={menu} />;
  }

  if (menu.template_id === "minimal") {
    return <MinimalTemplate menu={menu} />;
  }

  return <ClassicTemplate menu={menu} />;
}