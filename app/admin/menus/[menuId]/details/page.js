import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DetailsForm from "./details-form";

export default async function DetailsPage({ params }) {
  const { menuId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/start");

  const { data: menu } = await supabase
    .from("menus")
    .select("*")
    .eq("id", menuId)
    .eq("owner_id", user.id)
    .single();

  if (!menu) notFound();

  return <DetailsForm menu={menu} />;
}