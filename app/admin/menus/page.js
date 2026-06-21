import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { CirclePlus } from 'lucide-react';

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
          <h1 className="mt-2 text-4xl font-bold">قوائمك الرقمية</h1>

          <Link
            href="/admin/create-menu"
            className="rounded-xl bg-white px-3 py-3 font-bold text-black flex items-center justify-center gap-3 hover:bg-white/90 transition"
          >
           <CirclePlus /> إنشاء قائمة
          </Link>
        </div>

        <div className="mt-15 grid gap-4">
          {!menus?.length && (
            <p className="rounded-3xl bg-white p-6 text-black/50">
              لا توجد قوائم بعد.
            </p>
          )}

          {menus?.map((menu) => (
            <Link
              key={menu.id}
              href={`/admin/menus/${menu.id}`}
              className="rounded-md p-4 transition border border-white/40 hover:bg-white/5"
              dir="ltr"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-row items-center gap-4">
                  
                  <div className="pointer-events-none">
                    <Image src={`${menu.logo_url}`} alt="Logo" width={80} height={80} className="rounded-full object-cover pointer-events-none w-12 h-12" />
                  </div>
                  
                  <div className="flex flex-col items-start">
                    <h2 className="text-2xl">{menu.name}</h2>
                    <p dir="ltr" className="text-left text-sm opacity-60">crtgo.com/m/{menu.subdomain}</p>
                  </div>

                </div>

              <div className="text-right text-sm opacity-60">
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