import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./settings-form";
import { ChevronLeft } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/start");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div dir="rtl" className="min-h-screen px-5 py-8">
      <section className="mx-auto max-w-3xl">
        <Link href="/admin" className="text-left w-full text-sm flex items-center justify-end gap-2 text-black/50">
           الرجوع للإعدادات <ChevronLeft />
        </Link>

        <h1 className="mt-8 text-4xl font-black">إعدادات الحساب</h1>

        <SettingsForm user={user} profile={profile} />
      </section>
    </div>
  );
}