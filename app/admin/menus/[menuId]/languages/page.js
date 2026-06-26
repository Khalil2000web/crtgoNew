import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LanguagesForm from "./languages-form";

export const metadata = {
  title: "Languages",
};

export default async function LanguagesPage({ params }) {
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
    .select("id, owner_id, name, subdomain, enabled_languages, default_language")
    .eq("id", menuId)
    .eq("owner_id", user.id)
    .single();

  if (error || !menu) {
    notFound();
  }

  return <LanguagesForm menu={menu} />;
}