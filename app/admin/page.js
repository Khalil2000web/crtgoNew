import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { count: menuCount } = await supabase
    .from("menus")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id);

  return (
    <main dir="rtl" className="px-5 py-8">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm text-black/50">لوحة التحكم</p>

        <h1 className="mt-2 text-4xl font-black">
          أهلاً {profile?.display_name || "بك"}
        </h1>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-black/15 p-5">
            <p className="text-sm text-black/50">عدد القوائم</p>
            <h2 className="mt-2 text-2xl font-black">{menuCount || 0}</h2>
          </div>

          <div className="rounded-3xl border border-black/15 p-5">
            <p className="text-sm text-black/50">الخطة</p>
            <h2 className="mt-2 text-2xl font-black uppercase">
              {profile?.plan_id || "trial"}
            </h2>
          </div>

          <div className="rounded-3xl border border-black/15 p-5">
            <p className="text-sm text-black/50">الحالة</p>
            <h2 className="mt-2 text-2xl font-black uppercase">
              {profile?.subscription_status || "unknown"}
            </h2>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Link
            href="/admin/menus"
            className="rounded-3xl bg-black p-6 text-white transition hover:opacity-90"
          >
            <h2 className="text-xl font-black">إدارة القوائم</h2>
            <p className="mt-2 text-white/60">
              عرض وتعديل جميع القوائم الرقمية.
            </p>
          </Link>

          <Link
            href="/admin/create-menu"
            className="rounded-3xl border border-black/15 p-6 transition hover:bg-black hover:text-white"
          >
            <h2 className="text-xl font-black">إنشاء قائمة جديدة</h2>
            <p className="mt-2 opacity-60">
              ابدأ قائمة رقمية جديدة لمطعم أو كافيه.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}