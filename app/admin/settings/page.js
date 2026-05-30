import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./settings-form";

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
        <Link href="/admin" className="text-sm text-black/50">
          ← الرجوع للوحة التحكم
        </Link>

        <h1 className="mt-8 text-4xl font-black">إعدادات الحساب</h1>

        <SettingsForm user={user} profile={profile} />
      </section>
    </div>
  );
}