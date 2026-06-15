import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import MenuTabs from "./menu-tabs";

export default async function MenuLayout({ children, params }) {
  const { menuId } = await params;

  const supabase = await createClient();

  const { data: menu } = await supabase
    .from("menus")
    .select("*")
    .eq("id", menuId)
    .single();

  if (!menu) notFound();

  const links = [
    {
      label: "نظرة عامة",
      href: `/admin/menus/${menuId}`,
    },
    {
      label: "المعلومات",
      href: `/admin/menus/${menuId}/details`,
    },
    {
      label: "المظهر",
      href: `/admin/menus/${menuId}/appearance`,
    },
    {
      label: "ساعات العمل",
      href: `/admin/menus/${menuId}/hours`,
    },
    {
      label: "الأقسام",
      href: `/admin/menus/${menuId}/sections`,
    },
    {
      label: "الإعدادات",
      href: `/admin/menus/${menuId}/settings`,
    },
  ];

  return (
    <div dir="rtl" className="min-h-screen">
      <div className="border-b border-white/10">
        <section className="mx-auto max-w-6xl p-5">
          
          <div className="flex flex-col items-start text-sm">
          <h1 className="text-3xl font-bold uppercase">{menu.name}</h1>
          <a
  href={`https://crtgo.com/m/${menu.subdomain}`}
  target="_blank"
  rel="noopener noreferrer"
  className="block text-left text-sm text-white/60 hover:text-white hover:underline hover:bg-white/10 rounded-md p-2 transition"
>
  crtgo.com/m/{menu.subdomain}
</a>
</div>

          <MenuTabs links={links} />
        </section>
      </div>

      <main className="min-w-0">{children}</main>
    </div>
  );
}