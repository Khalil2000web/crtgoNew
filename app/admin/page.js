import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/start");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: menus } = await supabase
    .from("menus")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main dir="rtl" className="min-h-screen bg-black px-5 py-8 text-white">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm text-white/50">لوحة التحكم</p>

        <h1 className="mt-3 text-4xl font-black">
          أهلاً {profile?.display_name || "بك"}
        </h1>

        <p className="mt-4 text-white/60">
          خطتك الحالية: {profile?.plan || "basic"}
        </p>

        <div className="mt-8">
          <Link
            href="/admin/create-menu"
            className="inline-flex rounded-full bg-white px-6 py-3 font-bold text-black"
          >
            إنشاء قائمة رقمية
          </Link>
        </div>

        <div className="mt-10 space-y-4">
          <h2 className="text-xl font-bold">قوائمك الرقمية</h2>

          {!menus?.length && (
            <p className="rounded-2xl border border-white/10 p-5 text-white/50">
              لا توجد قوائم بعد.
            </p>
          )}

          {menus?.map((menu) => (
            <Link
              key={menu.id}
              href={`/admin/menus/${menu.id}`}
              className="block rounded-2xl border border-white/10 p-5 transition hover:bg-white/5"
            >
              <h3 className="text-lg font-bold">{menu.name}</h3>
              <p dir="ltr" className="mt-2 text-left text-sm text-white/50">
                {menu.subdomain}.crtgo.com
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}