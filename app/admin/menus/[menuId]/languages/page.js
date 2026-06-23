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
    .select(
      "id, owner_id, name, subdomain, enabled_languages, default_language"
    )
    .eq("id", menuId)
    .single();

  if (error || !menu || menu.owner_id !== user.id) {
    notFound();
  }

  return <LanguagesForm menu={menu} />;
}