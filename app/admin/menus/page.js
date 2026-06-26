import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  CirclePlus,
  ExternalLink,
  FolderOpen,
  Globe,
  ImageIcon,
  Layers3,
  MenuSquare,
  Package,
  Search,
  TriangleAlert,
} from "lucide-react";

function getStatusLabel(status) {
  if (status === "archived") return "مؤرشفة";
  if (status === "active") return "مفعلة";
  return "غير محددة";
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

function getMenuCounts(menu) {
  const sections = menu.sections || [];

  const items = sections.reduce((total, section) => {
    return total + (section.items?.length || 0);
  }, 0);

  const availableItems = sections.reduce((total, section) => {
    return (
      total +
      (section.items || []).filter((item) => item.is_available !== false).length
    );
  }, 0);

  return {
    sections: sections.length,
    items,
    availableItems,
  };
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
      created_at,
      sections (
        id,
        items (
          id,
          is_available
        )
      )
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
  const menusWithoutLinks = menuList.filter((menu) => !menu.subdomain);
  const menusWithItems = menuList.filter((menu) => getMenuCounts(menu).items > 0);

  const totalItems = menuList.reduce((total, menu) => {
    return total + getMenuCounts(menu).items;
  }, 0);

  return (
    <main dir="rtl" className="min-h-screen px-4 pb-32 pt-4 sm:px-5 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Menu Library
              </p>

              <h1 className="mt-1 text-2xl font-black text-[#1b1712] sm:text-3xl">
                القوائم الرقمية
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1b1712]/58">
                كل قوائم العملاء في مكان واحد. راقب الرابط، المحتوى، الحالة، وافتح صفحة الإدارة بسرعة.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 md:min-w-[300px]">
              <PrimaryLink href="/admin/create-menu">
                <CirclePlus size={17} />
                قائمة جديدة
              </PrimaryLink>

              {search ? (
                <SoftLink href="/admin/menus">
                  <Search size={17} />
                  إزالة البحث
                </SoftLink>
              ) : (
                <SoftLink href="/admin">
                  <ArrowLeft size={17} />
                  الرئيسية
                </SoftLink>
              )}
            </div>
          </div>

          {search && (
            <div className="mt-4 rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] px-3 py-2">
              <p className="text-sm font-bold text-[#1b1712]/65">
                نتائج البحث عن:{" "}
                <span className="font-black text-[#1b1712]">{search}</span>
              </p>
            </div>
          )}
        </header>

        <section className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricBox
            icon={<MenuSquare size={18} />}
            label="كل القوائم"
            value={menuList.length}
            hint={`${filteredMenus.length} ظاهرة الآن`}
          />

          <MetricBox
            icon={<CheckCircle2 size={18} />}
            label="مفعلة"
            value={activeMenus.length}
            hint="تظهر للزبائن"
          />

          <MetricBox
            icon={<Archive size={18} />}
            label="مؤرشفة"
            value={archivedMenus.length}
            hint="مخفية ومحفوظة"
          />

          <MetricBox
            icon={<Package size={18} />}
            label="الأصناف"
            value={totalItems}
            hint={`${menusWithItems.length} قوائم فيها محتوى`}
          />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="overflow-hidden rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] shadow-sm shadow-black/5">
            <div className="flex items-center justify-between gap-3 border-b border-[#8f806c]/45 bg-[#d1c5b4] px-4 py-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                  Resources
                </p>

                <h2 className="mt-0.5 text-lg font-black text-[#1b1712]">
                  {search ? "نتائج البحث" : "كل القوائم"}
                </h2>
              </div>

              <span className="rounded-full border border-[#8f806c]/45 bg-[#ded4c5] px-3 py-1 text-xs font-black text-[#1b1712]/60">
                {filteredMenus.length} قائمة
              </span>
            </div>

            <div className="p-3">
              {!filteredMenus.length ? (
                <EmptyMenus search={search} />
              ) : (
                <div className="grid gap-2">
                  {filteredMenus.map((menu) => {
                    const publicPath = menu.subdomain ? `/m/${menu.subdomain}` : null;
                    const counts = getMenuCounts(menu);
                    const needsLink = !menu.subdomain;
                    const isEmpty = counts.items === 0;

                    return (
                      <MenuResourceRow
                        key={menu.id}
                        menu={menu}
                        publicPath={publicPath}
                        counts={counts}
                        needsLink={needsLink}
                        isEmpty={isEmpty}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-24 lg:h-fit">
            <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Readiness
              </p>

              <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                جاهزية القوائم
              </h2>

              <div className="mt-4 grid gap-2">
                <CheckRow
                  done={menusWithoutLinks.length === 0}
                  text={`${menusWithoutLinks.length} قوائم بدون رابط`}
                />

                <CheckRow
                  done={menusWithLogo.length === menuList.length || menuList.length === 0}
                  text={`${menusWithLogo.length} من ${menuList.length} لديها شعار`}
                />

                <CheckRow
                  done={menusWithItems.length === menuList.length || menuList.length === 0}
                  text={`${menusWithItems.length} من ${menuList.length} فيها أصناف`}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d1c5b4] p-4 shadow-sm shadow-black/5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Client handoff
              </p>

              <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                قبل تسليم QR
              </h2>

              <div className="mt-4 grid gap-2 text-sm leading-6 text-[#1b1712]/62">
                <p>1. تأكد أن الرابط موجود.</p>
                <p>2. افتح القائمة من زر “فتح”.</p>
                <p>3. افحصها من الجوال.</p>
                <p>4. بعدها اطبع QR للعميل.</p>
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function MenuResourceRow({ menu, publicPath, counts, needsLink, isEmpty }) {
  return (
    <div className="grid gap-3 rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] p-3 transition hover:border-[#796a58]/75 hover:bg-[#d1c5b4] lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#8f806c]/50 bg-[#d1c5b4]">
          {menu.logo_url ? (
            <Image
              src={menu.logo_url}
              alt={menu.name || "Logo"}
              fill
              sizes="48px"
              className="pointer-events-none object-cover"
            />
          ) : (
            <ImageIcon size={21} className="text-[#1b1712]/35" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-black text-[#1b1712]">
              {menu.name || "قائمة بدون اسم"}
            </h3>

            <StatusBadge status={menu.status} />

            {needsLink && <WarningBadge>بدون رابط</WarningBadge>}
            {isEmpty && <WarningBadge>فارغة</WarningBadge>}
          </div>

          {menu.description_ar && (
            <p className="mt-1 line-clamp-1 text-sm text-[#1b1712]/50">
              {menu.description_ar}
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-1.5">
            <MiniTag dir="ltr">{publicPath || "/m/not-set"}</MiniTag>
            <MiniTag>{getTemplateLabel(menu.template_id)}</MiniTag>
            <MiniTag>
              <FolderOpen size={12} />
              {counts.sections} أقسام
            </MiniTag>
            <MiniTag>
              <Package size={12} />
              {counts.items} أصناف
            </MiniTag>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex lg:min-w-[230px]">
        <PrimaryLink href={`/admin/menus/${menu.id}`} small>
          إدارة
          <ArrowLeft size={15} />
        </PrimaryLink>

        {publicPath ? (
          <SoftLink href={publicPath} target="_blank" small>
            <ExternalLink size={15} />
            فتح
          </SoftLink>
        ) : (
          <WarningLink href={`/admin/menus/${menu.id}/settings`} small>
            الرابط
          </WarningLink>
        )}
      </div>
    </div>
  );
}

function MetricBox({ icon, label, value, hint }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-3 shadow-sm shadow-black/5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] text-[#1b1712]/70">
        {icon}
      </div>

      <div>
        <p className="text-xs font-black text-[#1b1712]/45">{label}</p>
        <p className="text-xl font-black text-[#1b1712]">{value}</p>
        <p className="text-xs font-bold text-[#1b1712]/42">{hint}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "archived") {
    return (
      <span className="rounded-full border border-yellow-900/25 bg-yellow-700/15 px-2.5 py-1 text-xs font-black text-yellow-950">
        {getStatusLabel(status)}
      </span>
    );
  }

  if (status === "active") {
    return (
      <span className="rounded-full border border-green-900/25 bg-green-800/12 px-2.5 py-1 text-xs font-black text-green-950">
        {getStatusLabel(status)}
      </span>
    );
  }

  return (
    <span className="rounded-full border border-[#8f806c]/45 bg-[#d1c5b4] px-2.5 py-1 text-xs font-black text-[#1b1712]/55">
      {getStatusLabel(status)}
    </span>
  );
}

function WarningBadge({ children }) {
  return (
    <span className="rounded-full border border-yellow-900/25 bg-yellow-700/15 px-2.5 py-1 text-xs font-black text-yellow-950">
      {children}
    </span>
  );
}

function MiniTag({ children, dir }) {
  return (
    <span
      dir={dir}
      className="inline-flex items-center gap-1 rounded-full border border-[#8f806c]/45 bg-[#d1c5b4] px-2.5 py-1 text-xs font-black text-[#1b1712]/55"
    >
      {children}
    </span>
  );
}

function CheckRow({ done, text }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] px-3 py-2.5">
      {done ? (
        <CheckCircle2 size={17} className="shrink-0 text-green-950" />
      ) : (
        <TriangleAlert size={17} className="shrink-0 text-yellow-950" />
      )}

      <span className="text-sm font-bold text-[#1b1712]/70">{text}</span>
    </div>
  );
}

function EmptyMenus({ search }) {
  return (
    <div className="rounded-xl border border-dashed border-[#8f806c]/65 bg-[#ded4c5] p-6 text-center">
      {search ? (
        <Search className="mx-auto text-[#1b1712]/30" size={34} />
      ) : (
        <FolderOpen className="mx-auto text-[#1b1712]/30" size={34} />
      )}

      <h3 className="mt-3 text-lg font-black text-[#1b1712]">
        {search ? "لا توجد نتائج" : "لا توجد قوائم بعد"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#1b1712]/55">
        {search
          ? "جرّب كلمة بحث مختلفة أو ارجع لعرض كل القوائم."
          : "أنشئ أول قائمة رقمية، ثم أضف الرابط والأقسام والأصناف."}
      </p>

      <div className="mt-4 flex justify-center">
        {search ? (
          <SoftLink href="/admin/menus">عرض كل القوائم</SoftLink>
        ) : (
          <PrimaryLink href="/admin/create-menu">
            <CirclePlus size={16} />
            إنشاء أول قائمة
          </PrimaryLink>
        )}
      </div>
    </div>
  );
}

function PrimaryLink({ href, children, small, ...props }) {
  return (
    <Link
      href={href}
      {...props}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] active:scale-[0.98] ${
        small ? "min-h-9 px-3 py-2" : "min-h-10 px-4 py-2.5"
      }`}
    >
      {children}
    </Link>
  );
}

function SoftLink({ href, children, small, ...props }) {
  return (
    <Link
      href={href}
      {...props}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#ded4c5] text-sm font-black text-[#1b1712]/70 transition hover:border-[#796a58]/70 hover:bg-[#d1c5b4] hover:text-[#1b1712] active:scale-[0.98] ${
        small ? "min-h-9 px-3 py-2" : "min-h-10 px-4 py-2.5"
      }`}
    >
      {children}
    </Link>
  );
}

function WarningLink({ href, children, small }) {
  return (
    <Link
      href={href}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-yellow-900/25 bg-yellow-700/15 text-sm font-black text-yellow-950 transition hover:bg-yellow-700/22 active:scale-[0.98] ${
        small ? "min-h-9 px-3 py-2" : "min-h-10 px-4 py-2.5"
      }`}
    >
      {children}
    </Link>
  );
}