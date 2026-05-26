import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StartForm from "./start-form";

export default async function StartPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/admin");
  }

  return <StartForm />;
}