"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  Copy,
  Settings,
  Clock,
  Palette,
  FolderOpen,
  Package,
  ImageIcon,
  MapPin,
  Phone,
  Globe,
  CheckCircle2,
  AlertCircle,
  Archive,
  Pencil,
  LayoutGrid,
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

export default function MenuEditor({ menu }) {
  const [origin, setOrigin] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const sections = useMemo(() => {
    return [...(menu.sections || [])].sort(
      (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
    );
  }, [menu.sections]);

  const itemsCount = sections.reduce(
    (total, section) => total + (section.items?.length || 0),
    0
  );

  const emptySections = sections.filter(
    (section) => !section.items?.length
  ).length;

  const availableItems = sections.reduce((total, section) => {
    return (
      total +
      (section.items || []).filter((item) => item.is_available !== false).length
    );
  }, 0);

  const unavailableItems = itemsCount - availableItems;

  const publicPath = menu.subdomain ? `/m/${menu.subdomain}` : null;
  const publicUrl = publicPath
    ? origin
      ? `${origin}${publicPath}`
      : publicPath
    : null;

  async function copyPublicLink() {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setMessage("تم نسخ رابط القائمة.");
    } catch {
      setMessage("لم يتم نسخ الرابط. انسخه يدوياً.");
    }
  }

  return (
    <main dir="rtl" className="min-h-screen px-5 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <Link
          href="/admin/menus"
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowRight size={18} />
          الرجوع للقوائم
        </Link>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-2xl shadow-black/20">
          <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
            <div className="relative min-h-[240px] border-b border-white/10 bg-white/[0.03] lg:border-b-0 lg:border-l">
              {menu.cover_url ? (
                <Image
                  src={menu.cover_url}
                  alt={menu.name || "Cover"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 260px"
                  className="object-cover opacity-80 pointer-events-none"
                />
              ) : (
                <div className="flex h-full min-h-[240px] items-center justify-center text-white/25">
                  <ImageIcon size={44} />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

              <div className="absolute bottom-5 right-5 flex items-center gap-3">
                <div className="relative flex h-16 w-16 overflow-hidden rounded-2xl border border-white/15 bg-[#0f0f0f]">
                  {menu.logo_url ? (
                    <Image
                      src={menu.logo_url}
                      alt={menu.name || "Logo"}
                      fill
                      sizes="64px"
                      className="object-cover pointer-events-none"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon size={24} className="text-white/30" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                        menu.status
                      )}`}
                    >
                      {getStatusLabel(menu.status)}
                    </span>

                    <span className="rounded-full bg-white/[0.05] px-3 py-1 text-xs font-bold text-white/45">
                      {getTemplateLabel(menu.template_id)}
                    </span>
                  </div>

                  <h1 className="mt-4 text-5xl font-black text-white">
                    {menu.name || "قائمة بدون اسم"}
                  </h1>

                  {menu.description_ar && (
                    <p className="mt-3 max-w-2xl leading-7 text-white/45">
                      {menu.description_ar}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {menu.location && (
                      <InfoPill icon={<MapPin size={15} />} text={menu.location} />
                    )}

                    {menu.phone && (
                      <InfoPill icon={<Phone size={15} />} text={menu.phone} />
                    )}

                    {menu.subdomain && (
                      <InfoPill
                        icon={<Globe size={15} />}
                        text={`/m/${menu.subdomain}`}
                        ltr
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/menus/${menu.id}/details`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-extrabold text-black transition hover:bg-white/90"
                  >
                    <Pencil size={18} />
                    تعديل المعلومات
                  </Link>

                  {publicPath ? (
                    <Link
                      href={publicPath}
                      target="_blank"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4 font-extrabold text-white transition hover:bg-white/10"
                    >
                      <ExternalLink size={18} />
                      فتح للزبائن
                    </Link>
                  ) : (
                    <Link
                      href={`/admin/menus/${menu.id}/settings`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-4 font-extrabold text-yellow-300 transition hover:bg-yellow-500/15"
                    >
                      إعداد الرابط
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <p className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
            {message}
          </p>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard
            icon={<FolderOpen size={22} />}
            label="الأقسام"
            value={sections.length}
            hint={`${emptySections} أقسام فارغة`}
          />

          <StatCard
            icon={<Package size={22} />}
            label="الأصناف"
            value={itemsCount}
            hint={`${availableItems} متوفر`}
          />

          <StatCard
            icon={<AlertCircle size={22} />}
            label="غير متوفر"
            value={unavailableItems}
            hint="أصناف مخفية أو غير متاحة"
          />

          <StatCard
            icon={<Archive size={22} />}
            label="الحالة"
            value={getStatusLabel(menu.status)}
            hint={menu.status || "active"}
          />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 shadow-xl shadow-black/10">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-white/45">إدارة القائمة</p>

                  <h2 className="mt-1 text-3xl font-black text-white">
                    اختصارات التحرير
                  </h2>

                  <p className="mt-2 text-sm text-white/45">
                    كل جزء من القائمة له صفحة خاصة حتى يكون التعديل أوضح وأسهل.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <ActionCard
                  href={`/admin/menus/${menu.id}/details`}
                  icon={<Pencil size={22} />}
                  title="المعلومات"
                  description="اسم القائمة، الوصف، الموقع، وطرق التواصل."
                  primary
                />

                <ActionCard
                  href={`/admin/menus/${menu.id}/sections`}
                  icon={<FolderOpen size={22} />}
                  title="الأقسام والأصناف"
                  description="إدارة أقسام القائمة وكل الأصناف داخلها."
                />

                <ActionCard
                  href={`/admin/menus/${menu.id}/appearance`}
                  icon={<Palette size={22} />}
                  title="المظهر"
                  description="القالب، الألوان، الخط، صور الغلاف، وطريقة العرض."
                />

                <ActionCard
                  href={`/admin/menus/${menu.id}/hours`}
                  icon={<Clock size={22} />}
                  title="ساعات العمل"
                  description="الأيام المفتوحة والمغلقة وأوقات العمل."
                />

                <ActionCard
                  href={`/admin/menus/${menu.id}/settings`}
                  icon={<Settings size={22} />}
                  title="الإعدادات"
                  description="الرابط، حالة القائمة، والحذف النهائي."
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 shadow-xl shadow-black/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white/45">الأقسام</p>

                  <h2 className="mt-1 text-3xl font-black text-white">
                    نظرة سريعة
                  </h2>
                </div>

                <Link
                  href={`/admin/menus/${menu.id}/sections`}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  إدارة الأقسام
                </Link>
              </div>

              {!sections.length && (
                <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-6 text-center">
                  <FolderOpen className="mx-auto text-white/25" size={38} />

                  <h3 className="mt-3 text-xl font-bold text-white">
                    لا توجد أقسام بعد
                  </h3>

                  <p className="mt-2 text-sm text-white/45">
                    أضف أول قسم من صفحة الأقسام.
                  </p>
                </div>
              )}

              {sections.length > 0 && (
                <div className="mt-6 grid gap-3">
                  {sections.slice(0, 5).map((section) => (
                    <Link
                      key={section.id}
                      href={`/admin/menus/${menu.id}/sections/${section.id}`}
                      className="rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-black text-white">
                            {section.name_ar || "قسم بدون اسم"}
                          </h3>

                          <p className="mt-1 text-sm text-white/40">
                            {(section.items || []).length} أصناف
                          </p>
                        </div>

                        <ExternalLink size={17} className="text-white/35" />
                      </div>
                    </Link>
                  ))}

                  {sections.length > 5 && (
                    <Link
                      href={`/admin/menus/${menu.id}/sections`}
                      className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center text-sm font-bold text-white/60 transition hover:bg-white/[0.07]"
                    >
                      عرض كل الأقسام
                    </Link>
                  )}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 shadow-xl shadow-black/10">
              <p className="text-sm text-white/45">الرابط العام</p>

              <h2 className="mt-2 text-2xl font-black text-white">
                رابط القائمة
              </h2>

              <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p dir="ltr" className="break-all text-left text-sm text-white/70">
                  {publicUrl || "لم يتم إعداد الرابط بعد"}
                </p>
              </div>

              <div className="mt-4 grid gap-2">
                {publicPath ? (
                  <>
                    <Link
                      href={publicPath}
                      target="_blank"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-extrabold text-black transition hover:bg-white/90"
                    >
                      <ExternalLink size={18} />
                      فتح القائمة
                    </Link>

                    <button
                      type="button"
                      onClick={copyPublicLink}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4 font-extrabold text-white transition hover:bg-white/10"
                    >
                      <Copy size={18} />
                      نسخ الرابط
                    </button>
                  </>
                ) : (
                  <Link
                    href={`/admin/menus/${menu.id}/settings`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-extrabold text-black transition hover:bg-white/90"
                  >
                    <Settings size={18} />
                    إعداد الرابط
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 shadow-xl shadow-black/10">
              <p className="text-sm text-white/45">جاهزية القائمة</p>

              <h2 className="mt-2 text-2xl font-black text-white">
                ماذا ينقص؟
              </h2>

              <div className="mt-5 space-y-3">
                <ChecklistItem
                  done={Boolean(menu.name)}
                  text="اسم القائمة موجود"
                />

                <ChecklistItem
                  done={Boolean(menu.subdomain)}
                  text="رابط القائمة جاهز"
                />

                <ChecklistItem
                  done={Boolean(menu.logo_url)}
                  text="تم إضافة شعار"
                />

                <ChecklistItem
                  done={Boolean(menu.cover_url)}
                  text="تم إضافة صورة غلاف"
                />

                <ChecklistItem
                  done={sections.length > 0}
                  text="تم إضافة أقسام"
                />

                <ChecklistItem
                  done={itemsCount > 0}
                  text="تم إضافة أصناف"
                />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function InfoPill({ icon, text, ltr }) {
  return (
    <span
      dir={ltr ? "ltr" : "rtl"}
      className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-3 py-2 text-sm text-white/45"
    >
      {icon}
      <span className="break-all">{text}</span>
    </span>
  );
}

function StatCard({ icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-5 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between gap-3 text-white/45">
        <span>{label}</span>
        {icon}
      </div>

      <p className="mt-4 text-3xl font-black text-white">{value}</p>

      <p className="mt-2 text-sm text-white/35">{hint}</p>
    </div>
  );
}

function ActionCard({ href, icon, title, description, primary }) {
  return (
    <Link
      href={href}
      className={`block rounded-2xl border p-5 transition ${
        primary
          ? "border-white bg-white text-black hover:bg-white/90"
          : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"
      }`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
          primary ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        {icon}
      </div>

      <h3 className="mt-4 text-xl font-black">{title}</h3>

      <p className={`mt-2 text-sm ${primary ? "text-black/55" : "text-white/45"}`}>
        {description}
      </p>
    </Link>
  );
}

function ChecklistItem({ done, text }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <span className="text-sm font-bold text-white/70">{text}</span>

      {done ? (
        <CheckCircle2 size={18} className="text-green-300" />
      ) : (
        <AlertCircle size={18} className="text-yellow-300" />
      )}
    </div>
  );
}