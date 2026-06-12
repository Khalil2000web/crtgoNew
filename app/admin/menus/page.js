import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminMenusPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: menus } = await supabase
    .from("menus")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main dir="rtl" className="px-5 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-black/50">القوائم</p>
            <h1 className="mt-2 text-4xl font-bold">قوائمك الرقمية</h1>
          </div>

          <Link
            href="/admin/create-menu"
            className="rounded-2xl bg-black px-5 py-3 font-bold text-white"
          >
            إنشاء قائمة
          </Link>
        </div>

        <div className="mt-10 grid gap-4">
          {!menus?.length && (
            <p className="rounded-3xl bg-white p-6 text-black/50">
              لا توجد قوائم بعد.
            </p>
          )}

          {menus?.map((menu) => (
            <Link
              key={menu.id}
              href={`/admin/menus/${menu.id}`}
              className="rounded-3xl bg-white p-5 transition hover:bg-black hover:text-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{menu.name}</h2>

                  <p dir="ltr" className="mt-1 text-left text-sm opacity-60">
                    m.crtgo.com/{menu.subdomain}
                  </p>
                </div>

                <div className="text-left text-sm opacity-60">
                  <p>{menu.status}</p>
                  <p>{menu.template_id}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}