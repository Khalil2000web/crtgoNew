import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateMenuForm from "./create-menu-form";

export const metadata = {
  title: "Create Menu | CRTGO Web Services",
};

export default async function CreateMenuPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/start");
  }

  return <CreateMenuForm />;
}