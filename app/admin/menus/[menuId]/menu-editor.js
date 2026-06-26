"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  FolderOpen,
  Globe,
  ImageIcon,
  Languages,
  Layers3,
  MapPin,
  Package,
  Palette,
  Phone,
  Settings,
  Store,
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

function getSectionCounts(section) {
  const items = section.items || [];
  const availableItems = items.filter((item) => item.is_available !== false);

  return {
    items: items.length,
    availableItems: availableItems.length,
  };
}

export default function MenuEditor({ menu }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const sections = useMemo(() => {
    return [...(menu.sections || [])].sort(
      (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
    );
  }, [menu.sections]);

  const itemsCount = sections.reduce((total, section) => {
    return total + (section.items?.length || 0);
  }, 0);

  const availableItems = sections.reduce((total, section) => {
    return (
      total +
      (section.items || []).filter((item) => item.is_available !== false).length
    );
  }, 0);

  const emptySections = sections.filter((section) => {
    return !section.items || section.items.length === 0;
  });

  const publicPath = menu.subdomain ? `/m/${menu.subdomain}` : null;

  const publicUrl = publicPath
    ? origin
      ? `${origin}${publicPath}`
      : publicPath
    : "";

  async function copyPublicLink() {
    if (!publicUrl) return;

    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);

    setTimeout(() => setCopied(false), 1400);
  }

  const readyChecks = [
    { label: "اسم القائمة", done: Boolean(menu.name) },
    { label: "رابط عام", done: Boolean(menu.subdomain) },
    { label: "شعار", done: Boolean(menu.logo_url) },
    { label: "غلاف", done: Boolean(menu.cover_url) },
    { label: "أقسام", done: sections.length > 0 },
    { label: "أصناف", done: itemsCount > 0 },
  ];

  const readyCount = readyChecks.filter((item) => item.done).length;
  const isReady = readyCount === readyChecks.length;

  return (
    <section dir="rtl" className="min-h-screen px-4 pb-32 pt-4 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="overflow-hidden rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] shadow-sm shadow-black/5">
          <div className="grid gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div className="relative min-h-[150px] border-b border-[#8f806c]/45 bg-[#d1c5b4] lg:border-b-0 lg:border-l">
              {menu.cover_url ? (
                <Image
                  src={menu.cover_url}
                  alt={menu.name || "Cover"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 260px"
                  className="pointer-events-none object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[150px] items-center justify-center">
                  <ImageIcon size={34} className="text-[#1b1712]/30" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-[#efe7da]/60 bg-[#ded4c5] shadow-lg shadow-black/15">
                  {menu.logo_url ? (
                    <Image
                      src={menu.logo_url}
                      alt={menu.name || "Logo"}
                      fill
                      sizes="48px"
                      className="pointer-events-none object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Store size={22} className="text-[#1b1712]/40" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <Link
                    href="/admin/menus"
                    className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-2 text-xs font-black text-[#1b1712]/65 transition hover:bg-[#d1c5b4] hover:text-[#1b1712] active:scale-[0.98]"
                  >
                    <ArrowLeft size={14} />
                    الرجوع للقوائم
                  </Link>

                  <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                    Menu Workspace
                  </p>

                  <h1 className="mt-1 truncate text-2xl font-black text-[#1b1712] sm:text-3xl">
                    {menu.name || "قائمة بدون اسم"}
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1b1712]/58">
                    صفحة إدارة مختصرة للقائمة: المحتوى، المظهر، الرابط، والجاهزية قبل تسليم العميل.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge status={menu.status} />
                    <MiniTag>{getTemplateLabel(menu.template_id)}</MiniTag>

                    {publicPath ? (
                      <MiniTag dir="ltr">
                        <Globe size={12} />
                        {publicPath}
                      </MiniTag>
                    ) : (
                      <WarningBadge>بدون رابط</WarningBadge>
                    )}

                    {isReady ? (
                      <SuccessBadge>جاهزة</SuccessBadge>
                    ) : (
                      <WarningBadge>{readyCount}/{readyChecks.length} جاهزية</WarningBadge>
                    )}
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[290px]">
                  <PrimaryLink href={`/admin/menus/${menu.id}/details`}>
                    <FileText size={17} />
                    تعديل المعلومات
                  </PrimaryLink>

                  {publicPath ? (
                    <SoftLink href={publicPath} target="_blank">
                      <ExternalLink size={17} />
                      فتح للزبائن
                    </SoftLink>
                  ) : (
                    <WarningLink href={`/admin/menus/${menu.id}/settings`}>
                      إعداد الرابط
                    </WarningLink>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricBox
            label="الأقسام"
            value={sections.length}
            hint={`${emptySections.length} فارغة`}
            icon={<FolderOpen size={18} />}
            alert={emptySections.length > 0 && sections.length > 0}
          />

          <MetricBox
            label="الأصناف"
            value={itemsCount}
            hint={`${availableItems} متوفر`}
            icon={<Package size={18} />}
            alert={itemsCount === 0}
          />

          <MetricBox
            label="الرابط"
            value={menu.subdomain ? "جاهز" : "ناقص"}
            hint={publicPath || "أضف رابط قبل الطباعة"}
            icon={<Globe size={18} />}
            alert={!menu.subdomain}
          />

          <MetricBox
            label="الجاهزية"
            value={`${readyCount}/${readyChecks.length}`}
            hint={isReady ? "جاهزة للتسليم" : "راجع الناقص"}
            icon={<CheckCircle2 size={18} />}
            alert={!isReady}
          />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="grid gap-5">
            <Panel
              eyebrow="Manage"
              title="إدارة القائمة"
              action={
                publicPath ? (
                  <button
                    type="button"
                    onClick={copyPublicLink}
                    className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-2 text-sm font-black text-[#1b1712]/70 transition hover:bg-[#d1c5b4] hover:text-[#1b1712] active:scale-[0.98]"
                  >
                    <Copy size={15} />
                    {copied ? "تم النسخ" : "نسخ الرابط"}
                  </button>
                ) : null
              }
            >
              <div className="grid gap-2 md:grid-cols-2">
                <ToolCard
                  href={`/admin/menus/${menu.id}/details`}
                  icon={<FileText size={19} />}
                  title="معلومات القائمة"
                  text="الاسم، الوصف، الهاتف، الموقع، وروابط التواصل."
                  primary
                />

                <ToolCard
                  href={`/admin/menus/${menu.id}/sections`}
                  icon={<Layers3 size={19} />}
                  title="الأقسام والأصناف"
                  text="إدارة المنتجات، الأسعار، الصور، والتوفر."
                />

                <ToolCard
                  href={`/admin/menus/${menu.id}/appearance`}
                  icon={<Palette size={19} />}
                  title="المظهر"
                  text="الشعار، الغلاف، القالب، وطريقة عرض القائمة."
                />

                <ToolCard
                  href={`/admin/menus/${menu.id}/hours`}
                  icon={<Clock size={19} />}
                  title="ساعات العمل"
                  text="الأيام، الأوقات، وحالة الفتح والإغلاق."
                />

                <ToolCard
                  href={`/admin/menus/${menu.id}/languages`}
                  icon={<Languages size={19} />}
                  title="اللغات"
                  text="إعداد لغات القائمة للعميل."
                />

                <ToolCard
                  href={`/admin/menus/${menu.id}/settings`}
                  icon={<Settings size={19} />}
                  title="الإعدادات"
                  text="الرابط، حالة القائمة، والأرشفة أو الحذف."
                />
              </div>
            </Panel>

            <Panel
              eyebrow="Sections"
              title="الأقسام"
              action={
                <SoftLink href={`/admin/menus/${menu.id}/sections`} small>
                  إدارة الأقسام
                </SoftLink>
              }
            >
              {!sections.length ? (
                <EmptySections menuId={menu.id} />
              ) : (
                <div className="grid gap-2">
                  {sections.slice(0, 7).map((section) => {
                    const counts = getSectionCounts(section);
                    const isEmpty = counts.items === 0;

                    return (
                      <SectionRow
                        key={section.id}
                        menuId={menu.id}
                        section={section}
                        counts={counts}
                        isEmpty={isEmpty}
                      />
                    );
                  })}

                  {sections.length > 7 && (
                    <div className="rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] px-3 py-2 text-center text-sm font-black text-[#1b1712]/55">
                      + {sections.length - 7} أقسام أخرى
                    </div>
                  )}
                </div>
              )}
            </Panel>
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-24 lg:h-fit">
            <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Readiness
              </p>

              <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                جاهزية التسليم
              </h2>

              <div className="mt-4 grid gap-2">
                {readyChecks.map((item) => (
                  <ReadyRow key={item.label} done={item.done} label={item.label} />
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d1c5b4] p-4 shadow-sm shadow-black/5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Public link
              </p>

              <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                رابط الزبائن
              </h2>

              <div className="mt-4 rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] px-3 py-3">
                <p
                  dir="ltr"
                  className="break-all text-left text-sm font-bold text-[#1b1712]/60"
                >
                  {publicUrl || "No public link yet"}
                </p>
              </div>

              <div className="mt-3 grid gap-2">
                {publicPath ? (
                  <>
                    <PrimaryLink href={publicPath} target="_blank">
                      <ExternalLink size={17} />
                      فتح القائمة
                    </PrimaryLink>

                    <button
                      type="button"
                      onClick={copyPublicLink}
                      className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#ded4c5] px-4 py-2.5 text-sm font-black text-[#1b1712]/70 transition hover:bg-[#cfc3b2] hover:text-[#1b1712] active:scale-[0.98]"
                    >
                      <Copy size={16} />
                      {copied ? "تم النسخ" : "نسخ الرابط"}
                    </button>
                  </>
                ) : (
                  <WarningLink href={`/admin/menus/${menu.id}/settings`}>
                    إعداد الرابط
                  </WarningLink>
                )}
              </div>
            </section>

            {(menu.location || menu.phone) && (
              <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                  Client info
                </p>

                <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                  معلومات ظاهرة
                </h2>

                <div className="mt-4 grid gap-2">
                  {menu.phone && (
                    <InfoLine icon={<Phone size={16} />} text={menu.phone} />
                  )}

                  {menu.location && (
                    <InfoLine icon={<MapPin size={16} />} text={menu.location} />
                  )}
                </div>
              </section>
            )}
          </aside>
        </section>
      </div>
    </section>
  );
}

function Panel({ eyebrow, title, action, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] shadow-sm shadow-black/5">
      <div className="flex items-center justify-between gap-3 border-b border-[#8f806c]/45 bg-[#d1c5b4] px-4 py-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
            {eyebrow}
          </p>

          <h2 className="mt-0.5 text-lg font-black text-[#1b1712]">
            {title}
          </h2>
        </div>

        {action}
      </div>

      <div className="p-3">{children}</div>
    </section>
  );
}

function ToolCard({ href, icon, title, text, primary }) {
  return (
    <Link
      href={href}
      className={`cursor-pointer rounded-xl border p-3 transition active:scale-[0.99] ${
        primary
          ? "border-[#1b1712] bg-[#1b1712] text-[#efe7da] hover:bg-[#332a22]"
          : "border-[#8f806c]/50 bg-[#ded4c5] text-[#1b1712] hover:border-[#796a58]/75 hover:bg-[#d1c5b4]"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          primary
            ? "bg-[#efe7da]/10 text-[#efe7da]"
            : "border border-[#8f806c]/45 bg-[#d1c5b4] text-[#1b1712]/70"
        }`}
      >
        {icon}
      </div>

      <h3 className="mt-3 text-sm font-black">{title}</h3>

      <p
        className={`mt-1 text-xs leading-5 ${
          primary ? "text-[#efe7da]/60" : "text-[#1b1712]/50"
        }`}
      >
        {text}
      </p>
    </Link>
  );
}

function SectionRow({ menuId, section, counts, isEmpty }) {
  return (
    <div className="grid gap-3 rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] p-3 transition hover:border-[#796a58]/75 hover:bg-[#d1c5b4] sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-black text-[#1b1712]">
            {section.name_ar || "قسم بدون اسم"}
          </h3>

          {isEmpty && <WarningBadge>فارغ</WarningBadge>}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <MiniTag>
            <Package size={12} />
            {counts.items} أصناف
          </MiniTag>

          <MiniTag>{counts.availableItems} متوفر</MiniTag>
        </div>
      </div>

      <SoftLink href={`/admin/menus/${menuId}/sections/${section.id}`} small>
        فتح
        <ArrowLeft size={15} />
      </SoftLink>
    </div>
  );
}

function ReadyRow({ done, label }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] px-3 py-2.5">
      {done ? (
        <CheckCircle2 size={17} className="shrink-0 text-green-950" />
      ) : (
        <AlertCircle size={17} className="shrink-0 text-yellow-950" />
      )}

      <span className="text-sm font-bold text-[#1b1712]/70">{label}</span>
    </div>
  );
}

function MetricBox({ icon, label, value, hint, alert }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3 shadow-sm shadow-black/5 ${
        alert
          ? "border-yellow-900/25 bg-yellow-700/15"
          : "border-[#8f806c]/55 bg-[#d8cebe]"
      }`}
    >
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

function InfoLine({ icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] px-3 py-2.5">
      <span className="text-[#1b1712]/55">{icon}</span>
      <span className="text-sm font-bold text-[#1b1712]/70">{text}</span>
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

function SuccessBadge({ children }) {
  return (
    <span className="rounded-full border border-green-900/25 bg-green-800/12 px-2.5 py-1 text-xs font-black text-green-950">
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

function EmptySections({ menuId }) {
  return (
    <div className="rounded-xl border border-dashed border-[#8f806c]/65 bg-[#ded4c5] p-6 text-center">
      <FolderOpen className="mx-auto text-[#1b1712]/30" size={34} />

      <h3 className="mt-3 text-lg font-black text-[#1b1712]">
        لا توجد أقسام
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#1b1712]/55">
        أضف أول قسم، ثم ابدأ بتعبئة الأصناف داخله.
      </p>

      <div className="mt-4 flex justify-center">
        <PrimaryLink href={`/admin/menus/${menuId}/sections`}>
          إضافة أقسام
        </PrimaryLink>
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