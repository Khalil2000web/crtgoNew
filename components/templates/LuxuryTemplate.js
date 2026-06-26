"use client";

import Image from "next/image";
import { Noto_Kufi_Arabic } from "next/font/google";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Clock3,
  ImageIcon,
  Languages,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaPhoneAlt,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";
import Footer from "./Footer";

const luxuryFont = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

const LANGUAGE_LABELS = {
  ar: { label: "العربية", short: "AR", dir: "rtl" },
  en: { label: "English", short: "EN", dir: "ltr" },
  he: { label: "עברית", short: "HE", dir: "rtl" },
};

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const DAY_LABELS = {
  ar: {
    sunday: "الأحد",
    monday: "الإثنين",
    tuesday: "الثلاثاء",
    wednesday: "الأربعاء",
    thursday: "الخميس",
    friday: "الجمعة",
    saturday: "السبت",
  },
  en: {
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
  },
  he: {
    sunday: "ראשון",
    monday: "שני",
    tuesday: "שלישי",
    wednesday: "רביעי",
    thursday: "חמישי",
    friday: "שישי",
    saturday: "שבת",
  },
};

function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [];
}

function getEnabledLanguages(menu) {
  const raw = asArray(menu?.enabled_languages);

  const clean = raw
    .map((item) => {
      if (typeof item === "string") return item;
      return item?.code || item?.id || item?.value;
    })
    .filter(Boolean);

  return clean.length ? clean : ["ar"];
}

function getLanguageMeta(code) {
  const fallbackDir = RTL_LANGUAGES.includes(code) ? "rtl" : "ltr";

  return (
    LANGUAGE_LABELS[code] || {
      label: code?.toUpperCase() || "AR",
      short: code?.toUpperCase() || "AR",
      dir: fallbackDir,
    }
  );
}

function getTranslated(value, languageCode, fallback = "") {
  if (!value) return fallback;

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return (
      value[languageCode] ||
      value.ar ||
      value.en ||
      value.he ||
      Object.values(value).find(Boolean) ||
      fallback
    );
  }

  return fallback;
}

function sortByOrder(list) {
  return [...asArray(list)].sort((a, b) => {
    const first = Number(a?.sort_order ?? 9999);
    const second = Number(b?.sort_order ?? 9999);
    return first - second;
  });
}

function getMenuName(menu, languageCode) {
  return getTranslated(menu?.name_i18n, languageCode, menu?.name || "Menu");
}

function getMenuDescription(menu, languageCode) {
  return getTranslated(
    menu?.description_i18n,
    languageCode,
    menu?.description_ar || menu?.description || ""
  );
}

function getSectionName(section, languageCode) {
  return getTranslated(
    section?.name_i18n,
    languageCode,
    section?.name_ar || section?.name || "قسم"
  );
}

function getItemName(item, languageCode) {
  return getTranslated(
    item?.name_i18n,
    languageCode,
    item?.name_ar || item?.name || "صنف"
  );
}

function getItemDescription(item, languageCode) {
  return getTranslated(
    item?.description_i18n,
    languageCode,
    item?.description_ar || item?.description || ""
  );
}

function getCoverImages(menu) {
  const images = [];

  if (Array.isArray(menu?.cover_images)) {
    for (const image of menu.cover_images) {
      if (typeof image === "string") images.push(image);
      else if (image?.url) images.push(image.url);
      else if (image?.publicUrl) images.push(image.publicUrl);
      else if (image?.public_url) images.push(image.public_url);
    }
  }

  if (menu?.cover_url) images.push(menu.cover_url);
  if (menu?.logo_url) images.push(menu.logo_url);

  return [...new Set(images.filter(Boolean))];
}

function formatPrice(value) {
  const number = Number(value || 0);

  try {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      maximumFractionDigits: number % 1 ? 1 : 0,
    }).format(number);
  } catch {
    return `₪${number}`;
  }
}

function getTodayHours(workingHours, languageCode) {
  const todayKey = DAY_KEYS[new Date().getDay()];
  const labels = DAY_LABELS[languageCode] || DAY_LABELS.ar;
  const today = workingHours?.[todayKey];

  if (!today || today.enabled === false) {
    return {
      day: labels[todayKey],
      text: languageCode === "en" ? "Closed today" : "مغلق اليوم",
    };
  }

  return {
    day: labels[todayKey],
    text: `${today.from || "--:--"} - ${today.to || "--:--"}`,
  };
}

function createPhoneLink(value) {
  if (!value) return "";
  return `tel:${String(value).replace(/\s/g, "")}`;
}

function createWhatsappLink(value) {
  if (!value) return "";

  const clean = String(value).replace(/[^\d]/g, "");
  if (!clean) return "";

  return `https://wa.me/${clean}`;
}

function createSocialUrl(value, type) {
  if (!value) return "";

  const clean = String(value).trim();
  if (!clean) return "";

  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }

  const username = clean.replace("@", "");

  if (type === "instagram") return `https://instagram.com/${username}`;
  if (type === "facebook") return `https://facebook.com/${username}`;
  if (type === "tiktok") return `https://tiktok.com/@${username}`;

  return clean;
}

function sectionId(section) {
  return `luxury-section-${section.id}`;
}

export default function LuxuryTemplate({ menu }) {
  const enabledLanguages = getEnabledLanguages(menu);

  const defaultLanguage =
    menu?.default_language && enabledLanguages.includes(menu.default_language)
      ? menu.default_language
      : enabledLanguages[0];

  const [languageCode, setLanguageCode] = useState(defaultLanguage || "ar");
  const [query, setQuery] = useState("");
  const [showHours, setShowHours] = useState(false);

  const languageMeta = getLanguageMeta(languageCode);
  const isRtl = languageMeta.dir === "rtl";

  const menuName = getMenuName(menu, languageCode);
  const menuDescription = getMenuDescription(menu, languageCode);
  const todayHours = getTodayHours(menu?.working_hours || {}, languageCode);

  const coverImages = getCoverImages(menu);
  const heroImage = coverImages[0];

  const sections = useMemo(() => {
    return sortByOrder(menu?.sections).map((section) => {
      const items = sortByOrder(section?.items).map((item) => ({
        ...item,
        displayName: getItemName(item, languageCode),
        displayDescription: getItemDescription(item, languageCode),
      }));

      return {
        ...section,
        displayName: getSectionName(section, languageCode),
        items,
      };
    });
  }, [menu, languageCode]);

  const allItems = sections.flatMap((section) => section.items || []);

  const filteredSections = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    if (!cleanQuery) return sections;

    return sections
      .map((section) => {
        const items = section.items.filter((item) => {
          const searchText = [
            item.displayName,
            item.displayDescription,
            section.displayName,
            item.price,
          ]
            .join(" ")
            .toLowerCase();

          return searchText.includes(cleanQuery);
        });

        return {
          ...section,
          items,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [sections, query]);

const contactLinks = [
  menu?.phone && {
    label: languageCode === "en" ? "Call" : "اتصال",
    href: createPhoneLink(menu.phone),
    icon: <FaPhoneAlt />,
    featured: true,
  },
  menu?.whatsapp && {
    label: "WhatsApp",
    href: createWhatsappLink(menu.whatsapp),
    icon: <FaWhatsapp />,
    featured: true,
  },
  menu?.instagram && {
    label: "Instagram",
    href: createSocialUrl(menu.instagram, "instagram"),
    icon: <FaInstagram />,
  },
  menu?.facebook && {
    label: "Facebook",
    href: createSocialUrl(menu.facebook, "facebook"),
    icon: <FaFacebookF />,
  },
  menu?.tiktok && {
    label: "TikTok",
    href: createSocialUrl(menu.tiktok, "tiktok"),
    icon: <FaTiktok />,
  },
].filter(Boolean);

  const pageStyle = {
    "--bg": menu?.background_color || "#0b0907",
    "--panel": "rgba(255, 250, 241, 0.08)",
    "--panel2": "rgba(255, 250, 241, 0.12)",
    "--text": menu?.text_color || "#fff7ec",
    "--muted": "rgba(255, 247, 236, 0.62)",
    "--line": "rgba(255, 247, 236, 0.15)",
    "--accent": menu?.primary_color || "#d8b56d",
    "--accentSoft": "rgba(216, 181, 109, 0.16)",
    //fontFamily: menu?.font_family || undefined,
  };

  return (
<main
  dir={isRtl ? "rtl" : "ltr"}
  style={pageStyle}
  className={`${luxuryFont.className} min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-black`}
>
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="absolute inset-0">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={menuName}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-35"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_25%_20%,rgba(216,181,109,0.2),transparent_28%),linear-gradient(135deg,#0b0907,#1b1510,#0b0907)]" />
          )}

          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,9,7,0.3),var(--bg)_95%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <header className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-15 w-15 shrink-0 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
                {menu?.logo_url ? (
                  <Image
                    src={menu.logo_url}
                    alt={menuName}
                    fill
                    priority
                    sizes="68px"
                    className="object-cover pointer-events-none"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Star size={19} className="text-[var(--accent)]" />
                  </div>
                )}
              </div>
            </div>

            {enabledLanguages.length > 1 && (
              <div className="flex items-center gap-1 rounded-full border border-[var(--line)] bg-black/25 p-1 backdrop-blur-xl">
                <Languages size={14} className="mx-2 text-[var(--accent)]" />

                {enabledLanguages.map((code) => {
                  const meta = getLanguageMeta(code);
                  const active = code === languageCode;

                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLanguageCode(code)}
                      className={`h-8 cursor-pointer rounded-full px-3 text-xs font-black transition ${
                        active
                          ? "bg-[var(--text)] text-black"
                          : "text-[var(--muted)] hover:bg-white/10 hover:text-[var(--text)]"
                      }`}
                    >
                      {meta.short}
                    </button>
                  );
                })}
              </div>
            )}
          </header>

          <div className="grid gap-7 py-12 md:grid-cols-[minmax(0,1fr)_320px] md:items-end md:py-16">
            <div>

              <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl md:text-7xl">
                {menuName}
              </h1>

              {menuDescription && (
                <p className="mt-5 max-w-2xl text-sm font-bold leading-7 text-[var(--muted)] sm:text-base">
                  {menuDescription}
                </p>
              )}

<div className="mt-5 flex flex-wrap gap-2">
  <button
    type="button"
    onClick={() => setShowHours(true)}
    className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-[var(--line)] bg-black/25 px-3 text-xs font-black text-[var(--muted)] backdrop-blur-xl transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-black active:scale-[0.98]"
  >
    <Clock3 size={14} />
    {todayHours.day} · {todayHours.text}
  </button>

  {menu?.location && (
    <InfoPill icon={<MapPin size={14} />}>
      {menu.location}
    </InfoPill>
  )}

</div>
</div>









<div className="rounded-[1.4rem] border border-[var(--line)] bg-black/20 p-3 backdrop-blur-xl">
  {contactLinks.length > 0 ? (
    <div className="flex items-center justify-center gap-5">
      {contactLinks.map((link) => (
        <a
          key={`${link.label}-${link.href}`}
          href={link.href}
          title={link.label}
          aria-label={link.label}
          target={link.href?.startsWith("http") ? "_blank" : undefined}
          rel={
            link.href?.startsWith("http")
              ? "noopener noreferrer"
              : undefined
          }
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--panel)] text-lg text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-black active:scale-95"
        >
          {link.icon}
        </a>
      ))}
    </div>
  ) : (
    <p className="text-center text-sm font-bold text-[var(--muted)]">
      لا توجد روابط تواصل مضافة.
    </p>
  )}
</div>








          </div>
        </div>
      </section>

      <section className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(11,9,7,0.50)] backdrop-blur-2xl">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="grid gap-3 md:grid-cols-[300px_minmax(0,1fr)] md:items-center">
            <div className="relative">
              <Search
                size={16}
                className="absolute start-4 top-1/2 -translate-y-1/2 text-[var(--accent)]"
              />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  languageCode === "en" ? "Search..." : "ابحث عن صنف..."
                }
                className="h-11 w-full rounded-full border border-[var(--line)] bg-[var(--panel)] px-10 text-sm font-bold outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute end-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-white/10 hover:text-[var(--text)]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <nav className="flex gap-2 overflow-x-auto mt-2 pb-1 md:justify-end">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${sectionId(section)}`}
                  className="shrink-0 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-[15px] font-black text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)]"
                >
                  {section.displayName}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {filteredSections.length ? (
          <div className="space-y-10">
            {filteredSections.map((section) => (
              <section
                key={section.id}
                id={sectionId(section)}
                className="scroll-mt-32"
              >
                <div className="mb-4 flex items-end justify-between gap-4 border-b border-[var(--line)] pb-3">
                  <div>
                    <h2 className="text-2xl font-black tracking-[-0.03em] sm:text-3xl">
                      {section.displayName}
                    </h2>

                    <p className="mt-1 text-xs font-bold text-[var(--muted)]">
                      {section.items.length} أصناف
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {section.items.map((item) => (
                    <LuxuryItem key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.7rem] border border-[var(--line)] bg-[var(--panel)] p-8 text-center">
            <Search size={34} className="mx-auto text-[var(--accent)]" />

            <h2 className="mt-4 text-2xl font-black">لا توجد نتائج</h2>

            <p className="mt-2 text-sm font-bold text-[var(--muted)]">
              جرّب كلمة بحث مختلفة.
            </p>
          </div>
        )}
      </section>

{showHours && (
  <WorkingHoursModal
    workingHours={menu?.working_hours || {}}
    languageCode={languageCode}
    onClose={() => setShowHours(false)}
  />
)}

<Footer />
    </main>
  );
}

function InfoPill({ icon, children }) {
  return (
    <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--line)] bg-black/25 px-3 text-xs font-black text-[var(--muted)] backdrop-blur-xl">
      <span className="text-[var(--accent)]">{icon}</span>
      {children}
    </span>
  );
}

function LuxuryItem({ item }) {
  const unavailable = item.is_available === false;

  return (
    <article
      id={`item-${item.id}`}
      className={`group overflow-hidden rounded-[1.4rem] border border-[var(--line)] bg-[var(--panel)] transition hover:border-[var(--accent)] hover:bg-[var(--panel2)] ${
        unavailable ? "opacity-50 grayscale" : ""
      }`}
    >
      <div className="grid grid-cols-[120px_minmax(0,1fr)] sm:grid-cols-[112px_minmax(0,1fr)]">
        <div className="relative min-h-30 bg-black/20">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.displayName}
              fill
              sizes="(max-width: 710px) 120px, 160px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full min-h-28 w-full items-center justify-center">
              <ImageIcon size={26} className="text-[var(--accent)]" />
            </div>
          )}

          {unavailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55">
              <span className="rounded-full bg-black/50 px-2 py-1 text-[10px] font-black text-white">
                غير متوفر
              </span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col justify-between p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start justify-between">
              <h3 className="min-w-0 text-base font-black leading-tight sm:text-lg">
                {item.displayName}
              </h3>

            {item.displayDescription && (
              <p className="mt-2 line-clamp-2 text-xs font-bold leading-5 text-[var(--muted)] sm:text-sm sm:leading-6">
                {item.displayDescription}
              </p>
            )}

            </div>

<p className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-[16px] font-black text-black">
                {formatPrice(item.price)}
              </p>
            
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] font-black text-[var(--accent)]">
              {unavailable ? "غير متوفر" : "متوفر"}
            </span>

            <Sparkles
              size={14}
              className="text-[var(--accent)] opacity-45 transition group-hover:opacity-100"
            />
          </div>
        </div>
      </div>
    </article>
  );
}


function WorkingHoursModal({ workingHours, languageCode, onClose }) {
  const labels = DAY_LABELS[languageCode] || DAY_LABELS.ar;

  function formatHours(day) {
    if (!day || day.enabled === false) {
      return languageCode === "en" ? "Closed" : "مغلق";
    }

    return `${day.from || "--:--"} - ${day.to || "--:--"}`;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-[1.7rem] border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--panel)] p-4">
          <div>
            <p className="text-xs font-black text-[var(--accent)]">
              ساعات العمل
            </p>

            <h2 className="mt-1 text-xl font-black">
              أوقات الدوام
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] bg-black/20 text-[var(--muted)] transition hover:bg-[var(--accent)] hover:text-black active:scale-95"
          >
            <X size={17} />
          </button>
        </div>

        <div className="grid gap-2 p-4">
          {DAY_KEYS.map((dayKey) => {
            const day = workingHours?.[dayKey];
            const closed = !day || day.enabled === false;

            return (
              <div
                key={dayKey}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3"
              >
                <span className="text-sm font-black">
                  {labels[dayKey]}
                </span>

                <span
                  className={`text-sm font-black ${
                    closed ? "text-red-200/80" : "text-[var(--accent)]"
                  }`}
                >
                  {formatHours(day)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}