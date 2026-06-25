import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  CirclePlus,
  FolderOpen,
  ExternalLink,
  LayoutGrid,
  Archive,
  CheckCircle2,
  ImageIcon,
  ArrowLeft,
  Search,
} from "lucide-react";

import {
  AdminPageShell,
  AdminHero,
  AdminRow,
  AdminStatStrip,
  AdminLinkButton,
} from "@/components/admin/AdminUI";

function getStatusLabel(status) {
  if (status === "archived") return "مؤرشفة";
  if (status === "active") return "مفعلة";
  return "غير محددة";
}

function getStatusClass(status) {
  if (status === "archived") {
    return "border-yellow-700/20 bg-yellow-600/15 text-yellow-900";
  }

  if (status === "active") {
    return "border-green-700/20 bg-green-700/10 text-green-800";
  }

  return "border-[#241b12]/12 bg-[#f4ecdc] text-[#15120d]/55";
}

function getTemplateLabel(template) {
  const labels = {
    classic: "Classic",
    luxury: "Luxury",
    minimal: "Minimal",
    starter: "Starter",
  };

  return labels[template] || template || "Default";
}

export default async function AdminMenusPage({ searchParams }) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const search = resolvedSearchParams?.search?.trim() || "";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/start");

  const { data: menus } = await supabase
    .from("menus")
    .select(
      `
      id,
      name,
      description_ar,
      subdomain,
      status,
      template_id,
      logo_url,
      created_at
    `
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const menuList = menus || [];

  const filteredMenus = search
    ? menuList.filter((menu) => {
        const searchText = [
          menu.name,
          menu.description_ar,
          menu.subdomain,
          menu.status,
          menu.template_id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchText.includes(search.toLowerCase());
      })
    : menuList;

  const activeMenus = menuList.filter((menu) => menu.status !== "archived");
  const archivedMenus = menuList.filter((menu) => menu.status === "archived");
  const menusWithLogo = menuList.filter((menu) => menu.logo_url);

  return (
    <AdminPageShell>
      <AdminHero
        eyebrow="DIGITAL MENUS"
        title="قوائمك الرقمية"
        description="كل القوائم في مكان واحد. افتح القائمة العامة أو ادخل لإدارة التصميم والأقسام والأصناف."
        action={
          <AdminLinkButton href="/admin/create-menu" variant="primary">
            <CirclePlus size={19} />
            إنشاء قائمة
          </AdminLinkButton>
        }
      />

      <div className="mt-4">
        <AdminStatStrip
          stats={[
            {
              icon: <LayoutGrid size={20} />,
              label: "كل القوائم",
              value: menuList.length,
              hint: "الموجودة في حسابك",
            },
            {
              icon: <CheckCircle2 size={20} />,
              label: "مفعلة",
              value: activeMenus.length,
              hint: "تظهر للزبائن",
            },
            {
              icon: <Archive size={20} />,
              label: "مؤرشفة",
              value: archivedMenus.length,
              hint: "مخفية ومحفوظة",
            },
          ]}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold text-[#15120d]/45">
            {search ? "نتائج البحث" : "قائمة القوائم"}
          </p>

          <h2 className="mt-1 text-2xl font-black text-[#15120d] sm:text-3xl">
            {search ? `بحث: ${search}` : "كل القوائم"}
          </h2>

          <p className="mt-2 text-sm text-[#15120d]/45">
            {menusWithLogo.length} من {menuList.length} قوائم لديها شعار
          </p>
        </div>

        {search && (
          <AdminLinkButton
            href="/admin/menus"
            variant="secondary"
            className="min-h-10 px-4 py-2"
          >
            إزالة البحث
          </AdminLinkButton>
        )}
      </div>

      {!filteredMenus.length && (
        <section className="mt-5 rounded-3xl border border-[#241b12]/12 bg-white p-8 text-center shadow-sm">
          {search ? (
            <Search className="mx-auto text-[#15120d]/25" size={44} />
          ) : (
            <FolderOpen className="mx-auto text-[#15120d]/25" size={44} />
          )}

          <h3 className="mt-4 text-2xl font-black text-[#15120d]">
            {search ? "لا توجد نتائج" : "لا توجد قوائم بعد"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#15120d]/50">
            {search
              ? "جرّب كلمة بحث مختلفة أو ارجع لعرض كل القوائم."
              : "أنشئ أول قائمة رقمية، ثم أضف الأقسام والأصناف وصمّم الصفحة العامة."}
          </p>

          {!search && (
            <AdminLinkButton
              href="/admin/create-menu"
              variant="primary"
              className="mt-5"
            >
              <CirclePlus size={18} />
              إنشاء أول قائمة
            </AdminLinkButton>
          )}
        </section>
      )}

      <div className="mt-5 grid gap-3">
        {filteredMenus.map((menu) => {
          const publicPath = menu.subdomain ? `/m/${menu.subdomain}` : null;

          return (
            <AdminRow key={menu.id}>
              <div className="grid gap-4 lg:grid-cols-[1fr_240px] lg:items-center">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#241b12]/12 bg-[#f4ecdc]">
                    {menu.logo_url ? (
                      <Image
                        src={menu.logo_url}
                        alt={menu.name || "Logo"}
                        fill
                        sizes="56px"
                        className="pointer-events-none object-cover"
                      />
                    ) : (
                      <ImageIcon size={22} className="text-[#15120d]/30" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-xl font-black text-[#15120d]">
                        {menu.name || "قائمة بدون اسم"}
                      </h3>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                          menu.status
                        )}`}
                      >
                        {getStatusLabel(menu.status)}
                      </span>
                    </div>

                    {menu.description_ar && (
                      <p className="mt-1 line-clamp-1 text-sm text-[#15120d]/45">
                        {menu.description_ar}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span
                        dir="ltr"
                        className="rounded-full border border-[#241b12]/10 bg-[#f4ecdc] px-3 py-1 text-xs font-bold text-[#15120d]/45"
                      >
                        {publicPath || "/m/not-set"}
                      </span>

                      <span className="rounded-full border border-[#241b12]/10 bg-[#f4ecdc] px-3 py-1 text-xs font-bold text-[#15120d]/45">
                        {getTemplateLabel(menu.template_id)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <AdminLinkButton
                    href={`/admin/menus/${menu.id}`}
                    variant="primary"
                    className="min-h-11 px-4 py-3"
                  >
                    إدارة القائمة
                    <ArrowLeft size={16} />
                  </AdminLinkButton>

                  {publicPath ? (
                    <AdminLinkButton
                      href={publicPath}
                      target="_blank"
                      variant="secondary"
                      className="min-h-11 px-4 py-3"
                    >
                      <ExternalLink size={16} />
                      فتح
                    </AdminLinkButton>
                  ) : (
                    <AdminLinkButton
                      href={`/admin/menus/${menu.id}/settings`}
                      variant="warning"
                      className="min-h-11 px-4 py-3"
                    >
                      إعداد الرابط
                    </AdminLinkButton>
                  )}
                </div>
              </div>
            </AdminRow>
          );
        })}
      </div>
    </AdminPageShell>
  );
}