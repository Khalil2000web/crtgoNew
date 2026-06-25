import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./settings-form";

import {
  AdminBackLink,
  AdminHero,
  AdminPageShell,
} from "@/components/admin/AdminUI";

export const metadata = {
  title: "Account Settings",
};

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
    <AdminPageShell max="max-w-5xl">
      <AdminBackLink href="/admin">الرجوع للوحة التحكم</AdminBackLink>

      <div className="mt-5">
        <AdminHero
          eyebrow="Account"
          title="إعدادات الحساب"
          description="عدّل معلومات الحساب، غيّر كلمة المرور، وراجع حالة الاشتراك من مكان واحد."
        />
      </div>

      <SettingsForm user={user} profile={profile} />
    </AdminPageShell>
  );
}