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
  FolderOpen,
  Globe,
  ImageIcon,
  MapPin,
  Package,
  Palette,
  Pencil,
  Phone,
  Settings,
  Sparkles,
} from "lucide-react";

import {
  AdminButton,
  AdminChip,
  AdminLinkButton,
  AdminMetricRail,
  AdminModule,
  AdminPageShell,
  AdminProgressLine,
  AdminResourceRow,
  AdminSidePanel,
  AdminTopBar,
  AdminWorkspace,
} from "@/components/admin/AdminUI";

function statusTone(status) {
  return status === "archived" ? "yellow" : "green";
}

function statusLabel(status) {
  return status === "archived" ? "مؤرشفة" : "مفعلة";
}

function templateLabel(template) {
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
  const [copied, setCopied] = useState(false);

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

  const availableItems = sections.reduce((total, section) => {
    return (
      total +
      (section.items || []).filter((item) => item.is_available !== false).length
    );
  }, 0);

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

    setTimeout(() => setCopied(false), 1600);
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

  return (
    <AdminPageShell>
      <AdminTopBar
        backHref="/admin/menus"
        backLabel="الرجوع للقوائم"
        eyebrow="Menu Command Center"
        title={menu.name || "قائمة بدون اسم"}
        description="مركز تحكم القائمة: عدّل المحتوى، افتح الرابط، راقب الجاهزية، وادخل لكل جزء من مكان واضح."
        primaryAction={
          <AdminLinkButton href={`/admin/menus/${menu.id}/details`} variant="primary">
            <Pencil size={18} />
            تعديل المعلومات
          </AdminLinkButton>
        }
        secondaryAction={
          publicPath ? (
            <AdminLinkButton href={publicPath} target="_blank" variant="secondary">
              <ExternalLink size={18} />
              فتح للزبائن
            </AdminLinkButton>
          ) : (
            <AdminLinkButton href={`/admin/menus/${menu.id}/settings`} variant="warning">
              إعداد الرابط
            </AdminLinkButton>
          )
        }
        meta={
          <>
            <AdminChip tone={statusTone(menu.status)}>
              {statusLabel(menu.status)}
            </AdminChip>

            <AdminChip>{templateLabel(menu.template_id)}</AdminChip>

            {publicPath && (
              <AdminChip dir="ltr">
                <Globe size={12} />
                {publicPath}
              </AdminChip>
            )}
          </>
        }
      />

      <section className="mt-4 overflow-hidden rounded-[2rem] border border-[#20160d]/10 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[360px_1fr]">
          <div className="relative min-h-[230px] bg-[#f3eadc] lg:min-h-[300px]">
            {menu.cover_url ? (
              <Image
                src={menu.cover_url}
                alt={menu.name || "Cover"}
                fill
                sizes="(max-width: 1024px) 100vw, 360px"
                className="pointer-events-none object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[230px] items-center justify-center">
                <ImageIcon size={42} className="text-[#15120d]/25" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/40 bg-white shadow-xl">
                {menu.logo_url ? (
                  <Image
                    src={menu.logo_url}
                    alt={menu.name || "Logo"}
                    fill
                    sizes="64px"
                    className="pointer-events-none object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon size={24} className="text-[#15120d]/30" />
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/30 bg-white/85 px-3 py-2 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#15120d]/45">
                  Preview
                </p>
                <p className="max-w-[180px] truncate text-sm font-black text-[#15120d]">
                  {menu.name || "Menu"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 lg:p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <PreviewInfo
                label="الأقسام"
                value={sections.length}
                hint="مجموع الأقسام"
                icon={<FolderOpen size={18} />}
              />

              <PreviewInfo
                label="الأصناف"
                value={itemsCount}
                hint={`${availableItems} متوفر`}
                icon={<Package size={18} />}
              />

              <PreviewInfo
                label="الجاهزية"
                value={`${readyCount}/${readyChecks.length}`}
                hint="نقاط مكتملة"
                icon={<CheckCircle2 size={18} />}
              />
            </div>

            <div className="mt-5 grid gap-3">
              {menu.description_ar && (
                <p className="rounded-2xl border border-[#20160d]/10 bg-[#f8efe1] p-4 text-sm leading-7 text-[#15120d]/60">
                  {menu.description_ar}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {menu.location && (
                  <AdminChip>
                    <MapPin size={12} />
                    {menu.location}
                  </AdminChip>
                )}

                {menu.phone && (
                  <AdminChip>
                    <Phone size={12} />
                    {menu.phone}
                  </AdminChip>
                )}

                {publicPath && (
                  <button
                    type="button"
                    onClick={copyPublicLink}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#20160d]/10 bg-[#f3eadc] px-2.5 py-1 text-xs font-black text-[#15120d]/60 transition hover:bg-[#ead9bd] active:scale-[0.98]"
                  >
                    <Copy size={12} />
                    {copied ? "تم النسخ" : "نسخ الرابط"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AdminMetricRail
        metrics={[
          {
            label: "جاهزية القائمة",
            value: `${readyCount}/${readyChecks.length}`,
            hint: "كلما زادت، القائمة أفضل",
            icon: <CheckCircle2 size={19} />,
          },
          {
            label: "الأصناف المتوفرة",
            value: availableItems,
            hint: `${itemsCount - availableItems} غير متوفر`,
            icon: <Package size={19} />,
          },
          {
            label: "الرابط",
            value: menu.subdomain ? "جاهز" : "ناقص",
            hint: publicPath || "أضف رابط من الإعدادات",
            icon: <Globe size={19} />,
          },
        ]}
      />

      <AdminWorkspace
        sidebar={
          <>
            <AdminSidePanel title="جاهزية القائمة" description="بدل كروت الحالة، هاي قائمة واضحة للأشياء الناقصة.">
              <div className="grid gap-2">
                {readyChecks.map((item) => (
                  <ReadyRow key={item.label} done={item.done} label={item.label} />
                ))}
              </div>
            </AdminSidePanel>

            <AdminSidePanel title="تقدم المحتوى">
              <div className="grid gap-3">
                <AdminProgressLine
                  label="الأقسام التي فيها أصناف"
                  value={sections.filter((section) => section.items?.length).length}
                  max={Math.max(sections.length, 1)}
                  hint="القسم الفارغ لا يفيد الزبون"
                />

                <AdminProgressLine
                  label="الأصناف المتوفرة"
                  value={availableItems}
                  max={Math.max(itemsCount, 1)}
                  hint="اخفِ الأصناف غير المتاحة"
                />
              </div>
            </AdminSidePanel>

            <AdminSidePanel tone="dark" title="أفضل ترتيب للتعديل">
              <div className="grid gap-2">
                <DarkLink href={`/admin/menus/${menu.id}/details`} title="1. المعلومات" />
                <DarkLink href={`/admin/menus/${menu.id}/sections`} title="2. الأقسام والأصناف" />
                <DarkLink href={`/admin/menus/${menu.id}/appearance`} title="3. المظهر" />
                <DarkLink href={`/admin/menus/${menu.id}/settings`} title="4. الرابط والحالة" />
              </div>
            </AdminSidePanel>
          </>
        }
      >
        <AdminModule
          eyebrow="Manage"
          title="إدارة القائمة"
          description="كل جزء من القائمة له صفحة واضحة بدل صفحة واحدة مزعجة."
        >
          <div className="grid gap-2 md:grid-cols-2">
            <ManageBlock
              href={`/admin/menus/${menu.id}/details`}
              title="المعلومات"
              description="الاسم، الوصف، الموقع، وروابط التواصل."
              icon={<Pencil size={20} />}
              primary
            />

            <ManageBlock
              href={`/admin/menus/${menu.id}/sections`}
              title="الأقسام والأصناف"
              description="المنتجات، الأسعار، الصور، والتوفر."
              icon={<FolderOpen size={20} />}
            />

            <ManageBlock
              href={`/admin/menus/${menu.id}/appearance`}
              title="المظهر"
              description="القالب، الغلاف، الشعار، والألوان."
              icon={<Palette size={20} />}
            />

            <ManageBlock
              href={`/admin/menus/${menu.id}/hours`}
              title="ساعات العمل"
              description="الأيام المفتوحة والمغلقة."
              icon={<Clock size={20} />}
            />

            <ManageBlock
              href={`/admin/menus/${menu.id}/settings`}
              title="الإعدادات"
              description="الرابط العام، الأرشفة، والحذف."
              icon={<Settings size={20} />}
            />
          </div>
        </AdminModule>

        <AdminModule
          eyebrow="Sections"
          title="الأقسام"
          description="نظرة مباشرة على أقسام القائمة بدون كروت كبيرة."
          action={
            <AdminLinkButton
              href={`/admin/menus/${menu.id}/sections`}
              variant="secondary"
              className="min-h-10 px-3 py-2"
            >
              إدارة الأقسام
            </AdminLinkButton>
          }
        >
          {!sections.length ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#20160d]/18 bg-[#f3eadc] p-6 text-center">
              <FolderOpen className="mx-auto text-[#15120d]/25" size={36} />

              <h3 className="mt-3 text-xl font-black text-[#15120d]">
                لا توجد أقسام
              </h3>

              <p className="mt-2 text-sm text-[#15120d]/50">
                أضف أول قسم وابدأ بتعبئة الأصناف.
              </p>

              <AdminLinkButton
                href={`/admin/menus/${menu.id}/sections`}
                variant="primary"
                className="mt-5"
              >
                إضافة أقسام
              </AdminLinkButton>
            </div>
          ) : (
            <div className="grid gap-2">
              {sections.slice(0, 6).map((section) => (
                <AdminResourceRow
                  key={section.id}
                  icon={<FolderOpen size={20} />}
                  title={section.name_ar || "قسم بدون اسم"}
                  description="افتح القسم لإدارة الأصناف داخله."
                  meta={
                    <>
                      <AdminChip>
                        <Package size={12} />
                        {(section.items || []).length} أصناف
                      </AdminChip>

                      {(section.items || []).length === 0 && (
                        <AdminChip tone="yellow">فارغ</AdminChip>
                      )}
                    </>
                  }
                  actions={
                    <AdminLinkButton
                      href={`/admin/menus/${menu.id}/sections/${section.id}`}
                      variant="secondary"
                      className="min-h-10 px-3 py-2"
                    >
                      فتح
                      <ArrowLeft size={15} />
                    </AdminLinkButton>
                  }
                />
              ))}
            </div>
          )}
        </AdminModule>
      </AdminWorkspace>
    </AdminPageShell>
  );
}

function PreviewInfo({ label, value, hint, icon }) {
  return (
    <div className="rounded-2xl border border-[#20160d]/10 bg-[#fffaf2] p-4">
      <div className="flex items-center justify-between text-[#15120d]/40">
        <p className="text-xs font-black">{label}</p>
        {icon}
      </div>

      <p className="mt-2 text-3xl font-black text-[#15120d]">{value}</p>
      <p className="mt-1 text-xs font-bold text-[#15120d]/40">{hint}</p>
    </div>
  );
}

function ReadyRow({ done, label }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#20160d]/10 bg-[#f3eadc] p-3">
      <span className="text-sm font-black text-[#15120d]/65">{label}</span>

      {done ? (
        <CheckCircle2 size={18} className="text-green-800" />
      ) : (
        <AlertCircle size={18} className="text-yellow-950" />
      )}
    </div>
  );
}

function ManageBlock({ href, title, description, icon, primary }) {
  return (
    <Link
      href={href}
      className={`cursor-pointer rounded-[1.5rem] border p-4 transition active:scale-[0.99] ${
        primary
          ? "border-[#15120d] bg-[#15120d] text-white hover:bg-[#2b2117]"
          : "border-[#20160d]/10 bg-[#fffaf2] text-[#15120d] hover:border-[#20160d]/25 hover:bg-[#fff1d6]"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
          primary ? "bg-white/10 text-white" : "bg-[#f3eadc] text-[#15120d]"
        }`}
      >
        {icon}
      </div>

      <h3 className="mt-3 text-lg font-black">{title}</h3>

      <p className={`mt-1 text-sm leading-6 ${primary ? "text-white/60" : "text-[#15120d]/50"}`}>
        {description}
      </p>
    </Link>
  );
}

function DarkLink({ href, title }) {
  return (
    <Link
      href={href}
      className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/10 p-3 text-sm font-black text-white transition hover:bg-white/15"
    >
      {title}
      <ArrowLeft size={15} className="text-white/40" />
    </Link>
  );
}