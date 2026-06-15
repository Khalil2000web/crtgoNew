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
    <main dir="rtl" className="min-h-screen px-5 py-8 text-white">
      <section className="mx-auto max-w-5xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white/50 hover:bg-white/10"
        >
          الرجوع للوحة التحكم
          <span>←</span>
        </Link>

        <div className="mt-8">
          <p className="text-sm text-white/50">الحساب</p>
          <h1 className="mt-2 text-5xl font-bold">إعدادات الحساب</h1>
          <p className="mt-3 max-w-2xl text-white/50">
            عدّل معلومات الحساب، راقب حالة الاشتراك، وغيّر كلمة المرور.
          </p>
        </div>

        <SettingsForm user={user} profile={profile} />
      </section>
    </main>
  );
}