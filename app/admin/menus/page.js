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
} from "lucide-react";

function getStatusLabel(status) {
  if (status === "archived") return "مؤرشفة";
  if (status === "active") return "مفعلة";
  return "غير محددة";
}

function getStatusClass(status) {
  if (status === "archived") {
    return "bg-yellow-500/15 text-yellow-300";
  }

  if (status === "active") {
    return "bg-green-500/15 text-green-300";
  }

  return "bg-white/[0.06] text-white/50";
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

export default async function AdminMenusPage() {
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

  const activeMenus = menuList.filter((menu) => menu.status !== "archived");
  const archivedMenus = menuList.filter((menu) => menu.status === "archived");
  const menusWithLogo = menuList.filter((menu) => menu.logo_url);

  return (
    <main dir="rtl" className="min-h-screen px-5 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/50">
                <FolderOpen size={16} />
                القوائم الرقمية
              </div>

              <h1 className="mt-5 text-5xl font-black text-white">
                قوائمك الرقمية
              </h1>

              <p className="hidden mt-3 max-w-2xl text-white/45">
                اعرض كل القوائم الخاصة بك، افتح القائمة العامة، أو ادخل لإدارة التصميم والأقسام والأصناف.
              </p>
            </div>

            <Link
              href="/admin/create-menu"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-extrabold text-black transition hover:bg-white/90"
            >
              <CirclePlus size={20} />
              إنشاء قائمة
            </Link>
          </div>
        </div>

        <div className="hidden mt-6 grid gap-4 md:grid-cols-3">
          <StatCard
            icon={<LayoutGrid size={22} />}
            label="عدد القوائم"
            value={menuList.length}
            hint="كل القوائم الموجودة في حسابك"
          />

          <StatCard
            icon={<CheckCircle2 size={22} />}
            label="القوائم المفعلة"
            value={activeMenus.length}
            hint="القوائم التي تظهر للزبائن"
          />

          <StatCard
            icon={<Archive size={22} />}
            label="القوائم المؤرشفة"
            value={archivedMenus.length}
            hint="قوائم محفوظة لكنها مخفية"
          />
        </div>

        <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="hidden text-sm text-white/45">قائمة القوائم</p>
            <h2 className="hidden mt-1 text-4xl font-black text-white">
              كل القوائم
            </h2>
          </div>

          <p className="text-sm text-white/35">
            {menusWithLogo.length} من {menuList.length} قوائم لديها شعار
          </p>
        </div>

        {!menuList.length && (
          <section className="mt-6 rounded-2xl border border-white/10 bg-[#0f0f0f] p-10 text-center shadow-xl shadow-black/10">
            <FolderOpen className="mx-auto text-white/25" size={50} />

            <h3 className="mt-4 text-3xl font-black text-white">
              لا توجد قوائم بعد
            </h3>

            <p className="mx-auto mt-2 max-w-md text-white/45">
              أنشئ أول قائمة رقمية، ثم أضف الأقسام والأصناف وصمّم الصفحة العامة.
            </p>

            <Link
              href="/admin/create-menu"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-extrabold text-black transition hover:bg-white/90"
            >
              <CirclePlus size={20} />
              إنشاء أول قائمة
            </Link>
          </section>
        )}

        <div className="mt-6 grid gap-4">
          {menuList.map((menu) => {
            const publicPath = menu.subdomain ? `/m/${menu.subdomain}` : null;

            return (
              <article
                key={menu.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-xl shadow-black/10 transition hover:border-white/20 hover:bg-white/[0.03]"
              >
                <div className="grid gap-5 p-5 lg:grid-cols-[1fr_260px] lg:items-center">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                      {menu.logo_url ? (
                        <Image
                          src={menu.logo_url}
                          alt={menu.name || "Logo"}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <ImageIcon size={24} className="text-white/30" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-2xl font-black text-white">
                          {menu.name || "قائمة بدون اسم"}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                            menu.status
                          )}`}
                        >
                          {getStatusLabel(menu.status)}
                        </span>
                      </div>

                      {menu.description_ar && (
                        <p className="mt-2 line-clamp-1 text-sm text-white/40">
                          {menu.description_ar}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          dir="ltr"
                          className="rounded-full bg-white/[0.04] px-3 py-1 text-xs font-bold text-white/40"
                        >
                          {publicPath || "/m/not-set"}
                        </span>

                        <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs font-bold text-white/40">
                          {getTemplateLabel(menu.template_id)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-1">
                    <Link
                      href={`/admin/menus/${menu.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-4 font-extrabold text-black transition hover:bg-white/90"
                    >
                      إدارة القائمة
                      <ArrowLeft size={17} />
                    </Link>

                    {publicPath ? (
                      <Link
                        href={publicPath}
                        target="_blank"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 font-extrabold text-white transition hover:bg-white/10"
                      >
                        <ExternalLink size={17} />
                        فتح
                      </Link>
                    ) : (
                      <Link
                        href={`/admin/menus/${menu.id}/settings`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-4 font-extrabold text-yellow-300 transition hover:bg-yellow-500/15"
                      >
                        إعداد الرابط
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function StatCard({ icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-5 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between gap-3 text-white/45">
        <span>{label}</span>
        {icon}
      </div>

      <p className="mt-4 text-4xl font-black text-white">{value}</p>

      <p className="mt-2 text-sm text-white/35">{hint}</p>
    </div>
  );
}