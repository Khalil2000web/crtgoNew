import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ItemsForm from "./items-form";
import {
  ArrowRight,
  Building2,
  FolderOpen,
  Layers3,
  Package,
} from "lucide-react";

export const metadata = {
  title: "Menu Items",
};

export default async function ItemsPage({ params }) {
  const { menuId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/start");

  const { data: menu, error } = await supabase
    .from("menus")
    .select("id, owner_id, name, subdomain")
    .eq("id", menuId)
    .eq("owner_id", user.id)
    .single();

  if (error || !menu) notFound();

  const { data: branches } = await supabase
    .from("branches")
    .select(
      `
      *,
      categories (*)
    `
    )
    .eq("menu_id", menu.id)
    .order("created_at", { ascending: true });

  const branchList = branches || [];

  const categoriesCount = branchList.reduce((total, branch) => {
    return total + (branch.categories?.length || 0);
  }, 0);

  return (
    <main dir="rtl" className="min-h-screen px-4 pb-32 pt-4 sm:px-5 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                href={`/admin/menus/${menu.id}`}
                className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-2 text-xs font-black text-[#1b1712]/65 transition hover:bg-[#d1c5b4] hover:text-[#1b1712] active:scale-[0.98]"
              >
                <ArrowRight size={15} />
                الرجوع للقائمة
              </Link>

              <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Items Workspace
              </p>

              <h1 className="mt-1 text-2xl font-black text-[#1b1712] sm:text-3xl">
                التصنيفات والأصناف
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1b1712]/58">
                ابدأ بتنظيم القائمة حسب الفروع، ثم أضف التصنيفات مثل المشروبات، الوجبات، الحلويات.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {menu.subdomain && (
                <span
                  dir="ltr"
                  className="inline-flex items-center gap-2 rounded-full border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-1.5 text-xs font-black text-[#1b1712]/60"
                >
                  /m/{menu.subdomain}
                </span>
              )}
            </div>
          </div>
        </header>

        <section className="mt-3 grid gap-3 sm:grid-cols-3">
          <MetricBox
            icon={<Building2 size={18} />}
            label="الفروع"
            value={branchList.length}
            hint="داخل هذه القائمة"
          />

          <MetricBox
            icon={<FolderOpen size={18} />}
            label="التصنيفات"
            value={categoriesCount}
            hint="مثل مشروبات ووجبات"
          />

          <MetricBox
            icon={<Package size={18} />}
            label="الخطوة الحالية"
            value="تنظيم"
            hint="قبل إضافة الأصناف"
          />
        </section>

        <ItemsForm menuId={menu.id} branches={branchList} />
      </section>
    </main>
  );
}

function MetricBox({ icon, label, value, hint }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-3 shadow-sm shadow-black/5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] text-[#1b1712]/70">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-black text-[#1b1712]/45">{label}</p>
        <p className="truncate text-xl font-black text-[#1b1712]">{value}</p>
        <p className="truncate text-xs font-bold text-[#1b1712]/42">{hint}</p>
      </div>
    </div>
  );
}