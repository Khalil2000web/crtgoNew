"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import MenuCover from "@/components/MenuCover";
import {
  Clock,
  MapPin,
  Phone,
  X,
  ChevronLeft,
  Search,
  ImageIcon,
  Globe,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaWhatsapp,
  FaPhoneAlt,
} from "react-icons/fa";

const DAY_KEYS = [
  { key: "sunday", label: "الأحد", jsDay: 0 },
  { key: "monday", label: "الإثنين", jsDay: 1 },
  { key: "tuesday", label: "الثلاثاء", jsDay: 2 },
  { key: "wednesday", label: "الأربعاء", jsDay: 3 },
  { key: "thursday", label: "الخميس", jsDay: 4 },
  { key: "friday", label: "الجمعة", jsDay: 5 },
  { key: "saturday", label: "السبت", jsDay: 6 },
];

function getFontFamily(font) {
  const fonts = {
    tajawal: "var(--font-tajawal), Arial, sans-serif",
    ibm: "var(--font-ibm-arabic), Arial, sans-serif",
    baloo: "var(--font-baloo), Arial, sans-serif",
  };

  return fonts[font] || fonts.tajawal;
}

function normalizeUrl(value, type) {
  if (!value) return null;

  const clean = String(value).trim();

  if (type === "phone") return `tel:${clean}`;

  if (type === "whatsapp") {
    if (clean.startsWith("http")) return clean;
    const digits = clean.replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}` : null;
  }

  if (type === "instagram") {
    if (clean.startsWith("http")) return clean;
    return `https://instagram.com/${clean.replace("@", "")}`;
  }

  if (type === "facebook") {
    if (clean.startsWith("http")) return clean;
    return `https://facebook.com/${clean}`;
  }

  if (type === "tiktok") {
    if (clean.startsWith("http")) return clean;
    return `https://tiktok.com/@${clean.replace("@", "")}`;
  }

  return clean;
}

function priceLabel(price) {
  if (price === null || price === undefined || price === "") return "";

  const number = Number(price);

  if (Number.isNaN(number)) return `₪${price}`;

  return `₪${Number.isInteger(number) ? number : number.toFixed(1)}`;
}

function getTodayHours(workingHours) {
  const now = new Date();
  const today = DAY_KEYS.find((day) => day.jsDay === now.getDay());
  const hours = workingHours?.[today?.key];

  return { today, hours };
}

function isOpenNow(workingHours) {
  const { hours } = getTodayHours(workingHours);

  if (!hours?.enabled) return false;
  if (!hours.from || !hours.to) return false;

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();

  const [fromHour, fromMinute] = hours.from.split(":").map(Number);
  const [toHour, toMinute] = hours.to.split(":").map(Number);

  const from = fromHour * 60 + fromMinute;
  const to = toHour * 60 + toMinute;

  if (from <= to) {
    return current >= from && current <= to;
  }

  return current >= from || current <= to;
}

function hasWorkingHours(workingHours) {
  return DAY_KEYS.some((day) => workingHours?.[day.key]);
}

export default function ClassicTemplate({ menu }) {
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  const primaryColor = menu.primary_color || "#000000";
  const backgroundColor = menu.background_color || "#ffffff";
  const textColor = menu.text_color || "#000000";

  const layoutStyle = menu.layout_style || "classic";
  const sectionStyle = menu.section_style || "normal";
  const itemStyle = menu.item_style || "image-top";

  const sections = useMemo(() => {
    return [...(menu.sections || [])].sort(
      (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
    );
  }, [menu.sections]);

  useEffect(() => {
    setMounted(true);

    if (!activeSectionId && sections.length > 0) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  const socials = [
    {
      type: "phone",
      label: "اتصال",
      value: menu.phone,
      href: normalizeUrl(menu.phone, "phone"),
      icon: FaPhoneAlt,
    },
    {
      type: "whatsapp",
      label: "واتساب",
      value: menu.whatsapp,
      href: normalizeUrl(menu.whatsapp, "whatsapp"),
      icon: FaWhatsapp,
    },
    {
      type: "instagram",
      label: "إنستغرام",
      value: menu.instagram,
      href: normalizeUrl(menu.instagram, "instagram"),
      icon: FaInstagram,
    },
    {
      type: "facebook",
      label: "فيسبوك",
      value: menu.facebook,
      href: normalizeUrl(menu.facebook, "facebook"),
      icon: FaFacebook,
    },
    {
      type: "tiktok",
      label: "تيك توك",
      value: menu.tiktok,
      href: normalizeUrl(menu.tiktok, "tiktok"),
      icon: FaTiktok,
    },
  ].filter((social) => social.value && social.href);

  const filteredSections = useMemo(() => {
    if (!search.trim()) return sections;

    const query = search.trim().toLowerCase();

    return sections
      .map((section) => {
        const items = (section.items || []).filter((item) => {
          return (
            item.name_ar?.toLowerCase().includes(query) ||
            item.description_ar?.toLowerCase().includes(query) ||
            section.name_ar?.toLowerCase().includes(query)
          );
        });

        return { ...section, items };
      })
      .filter((section) => section.items.length > 0);
  }, [sections, search]);

  const activeSection =
    filteredSections.find((section) => section.id === activeSectionId) ||
    filteredSections[0];

  const openNow = mounted ? isOpenNow(menu.working_hours) : null;
  const todayHours = mounted ? getTodayHours(menu.working_hours) : null;

  const pageWidth =
    layoutStyle === "minimal"
      ? "max-w-3xl"
      : layoutStyle === "cards"
        ? "max-w-6xl"
        : "max-w-5xl";

  function scrollToSection(sectionId) {
    document.getElementById(`section-${sectionId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden"
      style={{
        background: backgroundColor,
        color: textColor,
        fontFamily: getFontFamily(menu.font_family),
      }}
    >
      <header className="relative min-h-[500px] overflow-hidden sm:min-h-[560px]">
        <div className="pointer-events-none absolute inset-0">
          <MenuCover menu={menu} />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/90" />

        <div className="relative z-10 mx-auto flex min-h-[500px] max-w-5xl flex-col justify-end px-4 pb-6 pt-10 sm:min-h-[560px] sm:px-5 sm:pb-8">
          <div className="rounded-[1.8rem] border border-white/15 bg-white/10 p-4 text-white shadow-2xl backdrop-blur-xl sm:rounded-[2rem] sm:p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.4rem] border border-white/20 bg-black/30 sm:h-24 sm:w-24 sm:rounded-[1.7rem]">
                  {menu.logo_url ? (
                    <Image
                      src={menu.logo_url}
                      alt={menu.name || "Logo"}
                      fill
                      sizes="96px"
                      className="pointer-events-none object-cover"
                    />
                  ) : (
                    <ImageIcon size={32} className="text-white/40" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-white/55 sm:text-sm">
                    CRTGO MENU
                  </p>

                  <h1 className="mt-2 break-words text-3xl font-black leading-tight sm:text-5xl">
                    {menu.name}
                  </h1>

                  {menu.description_ar && (
                    <p className="mt-2 line-clamp-3 max-w-2xl text-sm leading-6 text-white/70">
                      {menu.description_ar}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {mounted && (
                  <div
                    className={`rounded-full px-4 py-2 text-sm font-black ${
                      openNow
                        ? "bg-green-400 text-black"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {openNow ? "مفتوح الآن" : "مغلق الآن"}
                  </div>
                )}

                {hasWorkingHours(menu.working_hours) && (
                  <button
                    type="button"
                    onClick={() => setHoursOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black text-white transition hover:bg-white/25"
                  >
                    <CalendarDays size={16} />
                    ساعات العمل
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex flex-wrap gap-2">
                {todayHours?.hours?.enabled && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white">
                    <Clock size={16} />
                    اليوم: {todayHours.hours.from} - {todayHours.hours.to}
                  </div>
                )}

                {menu.location && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{menu.location}</span>
                  </div>
                )}

                {menu.phone && (
                  <a
                    href={`tel:${menu.phone}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/25"
                  >
                    <Phone size={16} />
                    اتصال
                  </a>
                )}
              </div>

              {socials.length > 0 && (
                <div className="flex flex-wrap justify-start gap-2 sm:justify-end">
                  {socials.map((social) => {
                    const Icon = social.icon;

                    return (
                      <a
                        key={social.type}
                        href={social.href}
                        target={social.type === "phone" ? undefined : "_blank"}
                        rel={social.type === "phone" ? undefined : "noreferrer"}
                        aria-label={social.label}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 hover:bg-white/90"
                      >
                        <Icon size={18} />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={`mx-auto ${pageWidth} px-4 py-6 sm:px-5 sm:py-8`}>
        <div className="sticky top-0 z-30 -mx-4 border-b border-black/10 bg-white/85 px-4 py-3 backdrop-blur-xl sm:-mx-5 sm:px-5 sm:py-4">
          <div className="mx-auto flex max-w-5xl flex-col gap-3">
            <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
              <Search size={18} className="text-black/40" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن صنف..."
                className="min-w-0 flex-1 bg-transparent text-black outline-none placeholder:text-black/35"
              />
            </label>

            {sections.length > 0 && (
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {sections.map((section) => {
                  const active =
                    sectionStyle === "tabs" && activeSection?.id === section.id;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => {
                        if (sectionStyle === "tabs") {
                          setActiveSectionId(section.id);
                        } else {
                          scrollToSection(section.id);
                        }
                      }}
                      className="shrink-0 rounded-full border px-4 py-2 text-sm font-black transition"
                      style={{
                        background: active ? primaryColor : "#ffffff",
                        color: active ? "#ffffff" : "#000000",
                        borderColor: `${primaryColor}33`,
                      }}
                    >
                      {section.name_ar}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {sectionStyle === "tabs" ? (
          <div className="mt-7">
            {activeSection ? (
              <MenuSection
                section={activeSection}
                itemStyle={itemStyle}
                primaryColor={primaryColor}
              />
            ) : (
              <EmptyState />
            )}
          </div>
        ) : sectionStyle === "accordion" ? (
          <div className="mt-7 grid gap-4">
            {filteredSections.map((section, index) => (
              <AccordionSection
                key={section.id}
                section={section}
                itemStyle={itemStyle}
                primaryColor={primaryColor}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="mt-7 grid gap-10">
            {filteredSections.map((section) => (
              <MenuSection
                key={section.id}
                section={section}
                itemStyle={itemStyle}
                primaryColor={primaryColor}
              />
            ))}
          </div>
        )}

        {filteredSections.length === 0 && <EmptyState />}
      </main>

      <footer className="mt-8 bg-[#080808] px-4 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-white/35">
                Powered by
              </p>

              <a
                href="https://crtgo.com"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-4xl font-black tracking-tight text-white transition hover:text-white/80"
              >
                CRTGO
                <ExternalLink size={20} />
              </a>

              <p className="mt-3 max-w-md text-sm leading-6 text-white/45">
                قائمة رقمية ذكية وسريعة للمطاعم والكافيهات. امسح، تصفّح، واطلب بسهولة.
              </p>

              <p dir="ltr" className="mt-3 text-sm font-bold text-white/35">
                crtgo.com
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              {socials.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.type}
                    href={social.href}
                    target={social.type === "phone" ? undefined : "_blank"}
                    rel={social.type === "phone" ? undefined : "noreferrer"}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black"
                  >
                    <Icon size={15} />
                    {social.label}
                  </a>
                );
              })}
            </div>
          </div>

          {hasWorkingHours(menu.working_hours) && (
            <button
              type="button"
              onClick={() => setHoursOpen(true)}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black"
            >
              <CalendarDays size={16} />
              عرض ساعات العمل كاملة
            </button>
          )}

          <div className="mt-8 border-t border-white/10 pt-5 text-xs text-white/30">
            © {new Date().getFullYear()} CRTGO. Digital menu experience.
          </div>
        </div>
      </footer>

      {hoursOpen && (
        <WorkingHoursModal
          workingHours={menu.working_hours}
          onClose={() => setHoursOpen(false)}
        />
      )}
    </div>
  );
}

function MenuSection({ section, itemStyle, primaryColor }) {
  const items = section.items || [];

  return (
    <section id={`section-${section.id}`} className="scroll-mt-36">
      <div className="mb-5">
        <p className="text-sm font-black opacity-45">
          {items.length} أصناف
        </p>

        <h2 className="mt-1 text-3xl font-black">
          {section.name_ar}
        </h2>
      </div>

      <div
        className={`grid gap-4 ${
          itemStyle === "image-side"
            ? "grid-cols-1"
            : "grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {items.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            itemStyle={itemStyle}
            primaryColor={primaryColor}
          />
        ))}
      </div>
    </section>
  );
}

function AccordionSection({ section, itemStyle, primaryColor, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      id={`section-${section.id}`}
      className="overflow-hidden rounded-3xl border border-black/10 bg-white text-black shadow-sm"
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 p-5 text-right"
      >
        <div>
          <p className="text-sm font-black opacity-45">
            {(section.items || []).length} أصناف
          </p>

          <h2 className="mt-1 text-2xl font-black">
            {section.name_ar}
          </h2>
        </div>

        <span
          className={`grid h-10 w-10 place-items-center rounded-full text-white transition ${
            open ? "rotate-90" : ""
          }`}
          style={{ background: primaryColor }}
        >
          <ChevronLeft size={20} />
        </span>
      </button>

      {open && (
        <div
          className={`grid gap-4 border-t border-black/10 p-5 ${
            itemStyle === "image-side"
              ? "grid-cols-1"
              : "grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {(section.items || []).map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              itemStyle={itemStyle}
              primaryColor={primaryColor}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MenuItem({ item, itemStyle, primaryColor }) {
  const available = item.is_available !== false;
  const showImage = itemStyle !== "no-image" && item.image_url;

  if (itemStyle === "image-side") {
    return (
      <article
        className={`grid overflow-hidden rounded-3xl border border-black/10 bg-white text-black shadow-sm transition ${
          available ? "" : "opacity-50"
        } ${showImage ? "grid-cols-[112px_1fr] sm:grid-cols-[140px_1fr]" : "grid-cols-1"}`}
      >
        {showImage && (
          <div className="relative aspect-square bg-black/5">
            <Image
              src={item.image_url}
              alt={item.name_ar || "Menu item"}
              fill
              sizes="140px"
              className="pointer-events-none object-cover"
            />
          </div>
        )}

        <div className="flex min-w-0 flex-col justify-center p-4">
          <ItemText item={item} primaryColor={primaryColor} available={available} />
        </div>
      </article>
    );
  }

  return (
    <article
      className={`overflow-hidden rounded-3xl border border-black/10 bg-white text-black shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        available ? "" : "opacity-50"
      }`}
    >
      {showImage ? (
        <div className="relative aspect-square bg-black/5">
          <Image
            src={item.image_url}
            alt={item.name_ar || "Menu item"}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="pointer-events-none object-cover"
          />
        </div>
      ) : (
        itemStyle !== "no-image" && (
          <div className="flex aspect-square items-center justify-center bg-black/5">
            <ImageIcon size={30} className="opacity-25" />
          </div>
        )
      )}

      <div className="p-3 sm:p-4">
        <ItemText item={item} primaryColor={primaryColor} available={available} />
      </div>
    </article>
  );
}

function ItemText({ item, primaryColor, available }) {
  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-base font-black leading-6 sm:text-lg">
          {item.name_ar}
        </h3>

        <p
          className="w-fit shrink-0 rounded-full px-3 py-1 text-sm font-black text-white"
          style={{ background: primaryColor }}
        >
          {priceLabel(item.price)}
        </p>
      </div>

      {item.description_ar && (
        <p className="mt-2 line-clamp-3 text-xs leading-5 opacity-60 sm:text-sm sm:leading-6">
          {item.description_ar}
        </p>
      )}

      {!available && (
        <p className="mt-3 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
          غير متوفر حالياً
        </p>
      )}
    </>
  );
}

function WorkingHoursModal({ workingHours, onClose }) {
  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-center bg-black/65 p-3 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[2rem] bg-white text-black shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-black/10 bg-white/90 p-5 backdrop-blur">
          <div>
            <p className="text-sm font-black opacity-45">القائمة</p>

            <h2 className="text-3xl font-black">ساعات العمل</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full bg-black text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-3 p-5">
          {DAY_KEYS.map((day) => {
            const hours = workingHours?.[day.key];

            return (
              <div
                key={day.key}
                className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-black/[0.03] p-4"
              >
                <p className="font-black">{day.label}</p>

                {hours?.enabled ? (
                  <p dir="ltr" className="text-sm font-black">
                    {hours.from} - {hours.to}
                  </p>
                ) : (
                  <p className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                    مغلق
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-8 rounded-3xl border border-black/10 bg-white p-8 text-center text-black shadow-sm">
      <Globe className="mx-auto opacity-25" size={42} />

      <h3 className="mt-4 text-2xl font-black">لا توجد نتائج</h3>

      <p className="mt-2 text-sm opacity-55">
        جرّب البحث عن صنف آخر أو اختر قسماً مختلفاً.
      </p>
    </div>
  );
}