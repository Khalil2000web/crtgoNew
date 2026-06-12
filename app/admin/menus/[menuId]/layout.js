import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function MenuLayout({
  children,
  params,
}) {
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
    <div dir="rtl" className="flex">
      <aside className="sticky top-0 hidden h-screen w-72 border-l border-black/10 bg-white p-4 lg:block">
        <p className="text-sm text-black/50">
          القائمة الرقمية
        </p>

        <h1 className="mt-1 text-2xl font-bold">
          {menu.name}
        </h1>

        <div className="mt-8 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-black/5"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}