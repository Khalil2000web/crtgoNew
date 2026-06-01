import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Settings } from "lucide-react";

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

  const { data: menus } = await supabase
    .from("menus")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="px-5 py-8">
      <section className="mx-auto max-w-5xl">
<div className="flex items-center justify-between">
        <h1 className="hidden mt-3 text-4xl font-black">
          أهلاً {profile?.display_name || "بك"}
        </h1>




        <p className="mt-4 hidden">
          خطتك الحالية: {profile?.plan || "basic"}
        </p>

</div>

        <div className="mt-8">
          <Link
            href="/admin/create-menu"
            className="flex items-center justify-center mt-7 rounded-lg border border-black px-6 py-3 font-bold text-black text-center hover:bg-black hover:text-white transition"
          >
            إنشاء قائمة رقمية جديدة
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
              className="flex items-start justify-between rounded-2xl border border-black p-5 transition hover:bg-black hover:text-white"
            >
              <h3 className="text-lg font-bold uppercase">{menu.name}</h3>
              <div className="text-left flex flex-col items-end gap-1">
                <p className="text-sm">crtgo.com/m/{menu.subdomain}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(menu.created_at).toLocaleDateString()}
                </p>
                <p dir="ltr" className="text-sm">Template: {menu.template_id}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}