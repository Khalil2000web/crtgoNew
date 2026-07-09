"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Clock,
  Check,
  Languages,
  MapPin,
  Menu,
  Phone,
  Search,
  Store,
  X,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";

import { getBranchHref } from "@/app/m/_lib/publicMenuData";
import { withLanguageParam } from "../../_components/menuUtils";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import {
  getLanguageDirection,
  getLanguageFontClass,
} from "@/app/fonts";
import TemplateFooter from "../_shared/TemplateFooter";

const LANGUAGE_META = {
  ar: {
    code: "ar",
    short: "AR",
    label: "العربية",
    dir: "rtl",
  },
  he: {
    code: "he",
    short: "HE",
    label: "עברית",
    dir: "rtl",
  },
  en: {
    code: "en",
    short: "EN",
    label: "English",
    dir: "ltr",
  },
};

const UI = {
  ar: {
    digitalMenu: "القائمة الرقمية",
    search: "ابحث في القائمة...",
    menu: "القائمة",
    today: "اليوم",
    openNow: "مفتوح الآن",
    closedNow: "مغلق الآن",
    closedToday: "مغلق اليوم",
    workingHours: "ساعات العمل",
    allHours: "كل ساعات العمل",
    branches: "الفروع",
    currentBranch: "الفرع الحالي",
    switchBranch: "تغيير الفرع",
    contact: "تواصل معنا",
    call: "اتصال",
    whatsapp: "واتساب",
    instagram: "إنستغرام",
    facebook: "فيسبوك",
    tiktok: "تيك توك",
    noItems: "لا توجد نتائج",
    noItemsText: "جرّب البحث عن شيء آخر.",
    poweredBy: "مدعوم بواسطة CRTGO",
    days: {
      sunday: "الأحد",
      monday: "الإثنين",
      tuesday: "الثلاثاء",
      wednesday: "الأربعاء",
      thursday: "الخميس",
      friday: "الجمعة",
      saturday: "السبت",
    },
  },
  he: {
    digitalMenu: "תפריט דיגיטלי",
    search: "חפש בתפריט...",
    menu: "תפריט",
    today: "היום",
    openNow: "פתוח עכשיו",
    closedNow: "סגור עכשיו",
    closedToday: "סגור היום",
    workingHours: "שעות פעילות",
    allHours: "כל שעות הפעילות",
    branches: "סניפים",
    currentBranch: "הסניף הנוכחי",
    switchBranch: "החלף סניף",
    contact: "צור קשר",
    call: "התקשר",
    whatsapp: "וואטסאפ",
    instagram: "אינסטגרם",
    facebook: "פייסבוק",
    tiktok: "טיקטוק",
    noItems: "לא נמצאו פריטים",
    noItemsText: "נסה לחפש משהו אחר.",
    poweredBy: "מופעל על ידי CRTGO",
    days: {
      sunday: "ראשון",
      monday: "שני",
      tuesday: "שלישי",
      wednesday: "רביעי",
      thursday: "חמישי",
      friday: "שישי",
      saturday: "שבת",
    },
  },
  en: {
    digitalMenu: "Digital Menu",
    search: "Search menu...",
    menu: "Menu",
    today: "Today",
    openNow: "Open now",
    closedNow: "Closed now",
    closedToday: "Closed today",
    workingHours: "Working hours",
    allHours: "All working hours",
    branches: "Branches",
    currentBranch: "Current branch",
    switchBranch: "Switch branch",
    contact: "Contact",
    call: "Call",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    noItems: "No items found",
    noItemsText: "Try searching for something else.",
    poweredBy: "Powered by CRTGO",
    days: {
      sunday: "Sunday",
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
    },
  },
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

const SHORT_DAY_KEYS = {
  sunday: "sun",
  monday: "mon",
  tuesday: "tue",
  wednesday: "wed",
  thursday: "thu",
  friday: "fri",
  saturday: "sat",
};

export default function ClassicTemplate({
  business,
  branch,
  menu,
  sections = [],
  branches = [],
  language = "ar",
  setLanguage,
  enabledLanguages = ["ar"],
  theme = {
    primary: "#ff7a00",
    background: "#ffffff",
    text: "#000000",
  },
}) {

  const [searchQuery, setSearchQuery] = useState("");

  const lang = LANGUAGE_META[language] ? language : "ar";

  const fontClassName = getLanguageFontClass(language);
const dir = getLanguageDirection(language);


  function changeLanguage(nextLanguage) {
    if (!LANGUAGE_META[nextLanguage]) return;
    if (!enabledLanguages.includes(nextLanguage)) return;

    setLanguage?.(nextLanguage);
  }

  const businessName = pickText(business, "name", "name_i18n", lang);
  const branchName = pickText(branch, "name", "name_i18n", lang);
  const branchAddress = pickText(branch, "address", "address_i18n", lang);
  const description = pickText(menu, "description_ar", "description_i18n", lang);

  
  const logo = menu.logo_url || business.logo_url;
  const cover = menu.cover_url;

  const today = getTodayWorkingHours(branch.working_hours, lang);
  const fullHours = getFullWorkingHours(branch.working_hours, lang);

  const socialLinks = buildSocialLinks(branch, lang);

  const visibleBranches = useMemo(() => {
    return (branches || [])
      .filter((item) => item?.slug && item.status !== "archived")
      .sort((a, b) => Number(b.is_main) - Number(a.is_main));
  }, [branches]);

  return (
<main
  dir={dir}
  lang={language}
  className={`${fontClassName} min-h-screen overflow-x-hidden bg-[#f3f5e0] text-[#141513]`}
>

<header className="relative flex h-[400px] w-full items-center justify-center overflow-hidden bg-white">
  <div className="absolute inset-0">
    {cover ? (
      <TemplateImage
        src={cover}
        alt={businessName}
        priority
        sizes="100vw"
        className="opacity-60"
      />
    ) : (
      <div className="h-full w-full bg-black" />
    )}
  </div>

  <div className="absolute inset-0 bg-black/20" />

  <div className="relative z-10 flex flex-col gap-2 items-center justify-center px-4 text-center">
    <h2 className="text-5xl font-black text-white">
      {businessName}
    </h2>
    {description && (
  <p className="text-lg font-bold text-center text-white/85">
  {description}
  </p>
)}
  </div>
</header>

<section className="fixed top-0 left-0 right-0 my-5 w-full max-w-6xl px-4 sm:px-6 z-20">
  <div className="flex w-full items-center gap-4">

    <button className="shrink-0 bg-white rounded-2xl cursor-pointer rounded-2xl p-2 text-black">
      <Menu />
    </button>

    <div className="min-w-0 flex-1">
      <ClassicSearchBox
        value={searchQuery}
        onChange={setSearchQuery}
        language={language}
      />
    </div>

  </div>
</section>

<section className="mx-auto mt-6 w-full max-w-6xl gap-6 px-4 sm:px-6">
  <div className="min-w-0 rounded-2xl bg-black/5 px-5 py-12 text-black/40">
    <div className="flex items-center justify-center gap-3">
      <div className="flex items-center justify-center flex-col gap-3 w-[70%]">
        {branchAddress && (
          <span className="w-[100%] flex items-center justify-between font-black text-black border-b border-black/10 pb-4">
            <MapPin size={19} />
            <p className="text-sm font-black">{branchAddress}</p>
          </span>
        )}

        <div className="w-[100%] flex items-center justify-between font-black text-black">
          <Clock size={19} />
            <p className="text-sm font-black">
              {today.dayLabel}: {today.label}
            </p>
        </div>

        <div className="w-[100%] flex items-center justify-center pt-12 font-black text-black">
          {socialLinks.length > 0 && (
            <div className="flex flex-row items-center justify-between w-full">
              {socialLinks.map((link) => (
                <HeroSocialLink key={link.key} link={link} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  </div>
</section>
 


<section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
  <div className="min-w-0">
    <ClassicSectionTabs
      sections={sections}
      language={language}
      searchQuery={searchQuery}
    />
  </div>
</section>

<TemplateFooter
  business={business}
  branch={branch}
  language={lang}
  variant="classic"
/>

<ClassicBottomNav
  business={business}
  branch={branch}
  branches={visibleBranches}
  language={lang}
  setLanguage={setLanguage}
  enabledLanguages={enabledLanguages}
  today={today}
  fullHours={fullHours}
  theme={theme}
/>
</main>
  );
}


function HeroSocialLink({ link }) {
  return (
    <a
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noreferrer" : undefined}
      className="items-center rounded-2xl border border-black/10 bg-black/10 p-3 text-sm font-black text-black/80 backdrop-blur-xl transition hover:bg-black/15 hover:text-black"
    >
      {socialIcon(link.key)}
    </a>
  );
}


function TemplateImage({
  src,
  alt = "",
  priority = false,
  sizes = "100vw",
  className = "",
}) {
  if (!src) return null;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={`pointer-events-none select-none object-cover ${className}`}
    />
  );
}

function t(language, key) {
  return UI[language]?.[key] || UI.ar[key] || key;
}

function dayLabel(language, dayKey) {
  return UI[language]?.days?.[dayKey] || UI.ar.days[dayKey] || dayKey;
}

function pickText(record, baseKey, i18nKey, language) {
  const translated = record?.[i18nKey]?.[language];

  if (typeof translated === "string" && translated.trim()) {
    return translated.trim();
  }

  const base = record?.[baseKey];

  if (typeof base === "string" && base.trim()) {
    return base.trim();
  }

  return "";
}

function formatPrice(value) {
  return `₪${Number(value || 0).toFixed(2)}`;
}

function scrollToSection(sectionId) {
  const element = document.getElementById(`section-${sectionId}`);

  if (!element) return;

  element.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function getDayData(workingHours, dayKey) {
  if (!workingHours) return null;

  return workingHours[dayKey] || workingHours[SHORT_DAY_KEYS[dayKey]] || null;
}

function normalizeDay(data) {
  if (!data) {
    return {
      isOpenDay: false,
      from: "",
      to: "",
      label: "",
    };
  }

  const closed =
    data.closed === true ||
    data.is_open === false ||
    data.open === false ||
    data.enabled === false;

  const from =
    data.from ||
    data.open_time ||
    data.start ||
    data.opens ||
    (typeof data.open === "string" ? data.open : "");

  const to =
    data.to ||
    data.close_time ||
    data.end ||
    data.closes ||
    (typeof data.close === "string" ? data.close : "");

  const isOpenDay = !closed && Boolean(from && to);

  return {
    isOpenDay,
    from,
    to,
    label: isOpenDay ? `${from} - ${to}` : "",
  };
}

function timeToMinutes(value) {
  const [hours, minutes] = String(value || "")
    .split(":")
    .map((part) => Number(part));

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  return hours * 60 + minutes;
}

function isNowInsideRange(from, to) {
  const start = timeToMinutes(from);
  const end = timeToMinutes(to);

  if (start === null || end === null) return false;

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();

  if (end < start) {
    return current >= start || current < end;
  }

  return current >= start && current < end;
}

function getTodayWorkingHours(workingHours, language) {
  const now = new Date();
  const dayKey = DAY_KEYS[now.getDay()];
  const day = normalizeDay(getDayData(workingHours, dayKey));

  if (!workingHours || !day.isOpenDay) {
    return {
      dayKey,
      dayLabel: dayLabel(language, dayKey),
      label: t(language, "closedToday"),
      isOpenNow: false,
      isOpenDay: false,
    };
  }

  return {
    dayKey,
    dayLabel: dayLabel(language, dayKey),
    label: day.label,
    isOpenNow: isNowInsideRange(day.from, day.to),
    isOpenDay: true,
  };
}

function getFullWorkingHours(workingHours, language) {
  const todayKey = DAY_KEYS[new Date().getDay()];

  return DAY_KEYS.map((dayKey) => {
    const day = normalizeDay(getDayData(workingHours, dayKey));

    return {
      dayKey,
      dayLabel: dayLabel(language, dayKey),
      label: day.isOpenDay ? day.label : t(language, "closedToday"),
      isOpenDay: day.isOpenDay,
      isToday: dayKey === todayKey,
    };
  });
}

function getWhatsAppLink(value) {
  const clean = String(value || "").replace(/[^\d]/g, "");

  if (!clean) return null;

  return `https://wa.me/${clean}`;
}

function getInstagramLink(value) {
  if (!value) return null;

  if (value.startsWith("http")) return value;

  return `https://instagram.com/${value.replace("@", "")}`;
}

function getTikTokLink(value) {
  if (!value) return null;

  if (value.startsWith("http")) return value;

  return `https://tiktok.com/@${value.replace("@", "")}`;
}

function getFacebookLink(value) {
  if (!value) return null;

  if (value.startsWith("http")) return value;

  return `https://facebook.com/${value}`;
}

function buildSocialLinks(branch, language) {
  const links = [];

  if (branch.phone) {
    links.push({
      key: "phone",
      label: t(language, "call"),
      href: `tel:${branch.phone}`,
      external: false,
    });
  }

  const whatsapp = getWhatsAppLink(branch.whatsapp);
  if (whatsapp) {
    links.push({
      key: "whatsapp",
      label: t(language, "whatsapp"),
      href: whatsapp,
      external: true,
    });
  }

  const instagram = getInstagramLink(branch.instagram);
  if (instagram) {
    links.push({
      key: "instagram",
      label: t(language, "instagram"),
      href: instagram,
      external: true,
    });
  }

  const facebook = getFacebookLink(branch.facebook);
  if (facebook) {
    links.push({
      key: "facebook",
      label: t(language, "facebook"),
      href: facebook,
      external: true,
    });
  }

  const tiktok = getTikTokLink(branch.tiktok);
  if (tiktok) {
    links.push({
      key: "tiktok",
      label: t(language, "tiktok"),
      href: tiktok,
      external: true,
    });
  }

  return links;
}

function socialIcon(key) {
  if (key === "phone") return <Phone size={18} />;
  if (key === "whatsapp") return <FaWhatsapp size={18} />;
  if (key === "instagram") return <FaInstagram size={18} />;
  if (key === "facebook") return <FaFacebookF size={18} />;
  if (key === "tiktok") return <FaTiktok size={18} />;

  return <ArrowUpRight size={16} />;
}

const CLASSIC_UI = {
  ar: {
    searchPlaceholder: "ابحث في القائمة...",
  },
  en: {
    searchPlaceholder: "Search the menu...",
  },
  he: {
    searchPlaceholder: "חפש בתפריט...",
  },
};

function getClassicUi(language, key) {
  const cleanLanguage = String(language || "ar").toLowerCase();

  return (
    CLASSIC_UI[cleanLanguage]?.[key] ||
    CLASSIC_UI.ar?.[key] ||
    CLASSIC_UI.en?.[key] ||
    key
  );
}

function ClassicSearchBox({ value, onChange, language }) {
  const isRtl = language !== "en";

  return (
    <div className="relative w-full rounded-2xl bg-transparent shadow-[0_10px_30px_-10px_rgba(0,0,0,0.75)]">
      <Search
        size={16}
        className={`pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-black ${
          isRtl ? "right-4" : "left-4"
        }`}
      />

      <input
        dir={isRtl ? "rtl" : "ltr"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={getClassicUi(language, "searchPlaceholder")}
        className={`block min-h-10 w-full appearance-none rounded-2xl bg-white text-sm font-bold text-black outline-none placeholder:text-black/35 transition focus:ring-2 focus:ring-black/10 ${
          isRtl ? "pr-11 pl-5" : "pl-11 pr-5"
        }`}
      />
    </div>
  );
}


function ClassicSectionTabs({ sections = [], language, searchQuery = "" }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const cleanSearch = searchQuery.trim().toLowerCase();

  useEffect(() => {
    if (!selectedItem) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setSelectedItem(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItem]);

  const visibleSections = sections
    .map((section) => {
      const items = section.items || [];

      const visibleItems = items.filter((item) => {
        if (item.is_available === false) return false;

        const name =
          pickText(item, "name_ar", "name_i18n", language) || item.name_ar || "";

        const description =
          pickText(item, "description_ar", "description_i18n", language) ||
          item.description_ar ||
          "";

        if (!cleanSearch) return true;

        return `${name} ${description}`.toLowerCase().includes(cleanSearch);
      });

      return {
        ...section,
        visibleItems,
      };
    })
    .filter((section) => section.visibleItems.length > 0);

  if (!visibleSections.length) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-[28px] bg-white p-8 text-center shadow-[0_20px_60px_-35px_rgba(0,0,0,0.65)]">
          <p className="text-sm font-black text-black/45">
            {language === "ar"
              ? "لا توجد نتائج مطابقة."
              : language === "he"
                ? "לא נמצאו תוצאות."
                : "No matching items found."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <TabGroup>
          <TabList className="flex items-center justify-center gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visibleSections.map((section) => {
              const sectionName =
                pickText(section, "name_ar", "name_i18n", language) ||
                section.name_ar ||
                "Section";

              return (
                <Tab
                  key={section.id}
                  className={({ selected }) =>
                    [
                      "shrink-0 cursor-pointer border-b-[3px] px-3 py-2 text-sm font-black outline-none transition",
                      selected
                        ? "border-black text-black"
                        : "border-transparent text-black/65 hover:border-black/50 hover:text-black",
                    ].join(" ")
                  }
                >
                  {sectionName}
                </Tab>
              );
            })}
          </TabList>

          <TabPanels className="mt-5">
            {visibleSections.map((section) => {
              const sectionName =
                pickText(section, "name_ar", "name_i18n", language) ||
                section.name_ar ||
                "Section";

              return (
                <TabPanel key={section.id} className="pt-5 outline-none">
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div className="flex min-w-0 w-full items-center justify-center">
                      <h2 className="mt-1 text-center text-3xl font-bold text-black">
                        {sectionName}
                      </h2>
                    </div>

                    <p className="rounded-full bg-black/5 px-4 py-2 text-xs font-black text-black/40">
                      {section.visibleItems.length}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {section.visibleItems.map((item) => (
                      <ClassicItemCard
                        key={item.id}
                        item={item}
                        language={language}
                        onOpen={() => setSelectedItem(item)}
                      />
                    ))}
                  </div>
                </TabPanel>
              );
            })}
          </TabPanels>
        </TabGroup>
      </section>

      <ClassicItemModal
        item={selectedItem}
        language={language}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}

function ClassicItemCard({ item, language, onOpen }) {
  const name =
    pickText(item, "name_ar", "name_i18n", language) || item.name_ar || "Item";

  const description =
    pickText(item, "description_ar", "description_i18n", language) ||
    item.description_ar ||
    "";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group cursor-pointer overflow-hidden rounded-[28px] bg-white text-start shadow-[0_18px_45px_-30px_rgba(0,0,0,0.75)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_55px_-30px_rgba(0,0,0,0.85)]"
    >
      {item.image_url ? (
        <div className="aspect-square overflow-hidden bg-black/5">
          <Image
            width={800}
            height={800}
            src={item.image_url}
            alt={name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="grid aspect-square place-items-center bg-black/5 text-black/25">
          <Menu size={34} />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-black leading-5 text-black">{name}</h3>

          {item.price !== null && item.price !== undefined && (
            <p className="shrink-0 rounded-full bg-black px-3 py-1 text-xs font-black text-white">
              {formatPrice(item.price)}
            </p>
          )}
        </div>

        {description && (
          <p className="mt-2 line-clamp-2 text-xs font-bold leading-5 text-black/45">
            {description}
          </p>
        )}
      </div>
    </button>
  );
}


function ClassicItemModal({ item, language, onClose }) {
  if (!item) return null;

  const name =
    pickText(item, "name_ar", "name_i18n", language) || item.name_ar || "Item";

  const description =
    pickText(item, "description_ar", "description_i18n", language) ||
    item.description_ar ||
    "";

  const isRtl = language !== "en";

  return (
    <div
      className="fixed inset-0 z-[999] bg-black text-black"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0">
        {item.image_url ? (
          <Image
            width={800}
            height={800}
            src={item.image_url}
            alt={name}
            loading="eager"
            className="h-full w-full object-cover pointer-events-none select-none opacity-60"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-[#f3f5e0] text-black/20">
            <Menu size={80} />
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-black/25" />

      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="absolute inset-x-0 bottom-7 z-10 p-4 sm:p-6"
      >
        <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-[34px] border border-white/55 bg-white/45 p-5 shadow-[0_20px_80px_-25px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="hidden text-xs font-black uppercase tracking-[0.2em] text-black/35">
                CRTGO MENU
              </p>

              <h2 className="mt-2 text-3xl font-black leading-tight tracking-[-0.07em] text-black sm:text-5xl">
                {name}
              </h2>
            </div>

            {item.price !== null && item.price !== undefined && (
              <p className="shrink-0 rounded-full px-4 py-2 text-xl font-black text-black">
                {formatPrice(item.price)}
              </p>
            )}
          </div>

          {description && (
            <p className="mt-4 text-sm font-bold leading-7 text-black/60 sm:text-base">
              {description}
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-6 min-h-12 w-full cursor-pointer rounded-full bg-black text-sm font-black text-white transition hover:bg-black/85"
          >
            {language === "ar"
              ? "إغلاق"
              : language === "he"
                ? "סגור"
                : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}



function ClassicBottomNav({
  business,
  branch,
  branches = [],
  language,
  setLanguage,
  enabledLanguages = ["ar"],
  today,
  fullHours = [],
  theme,
}) {
  const [openPanel, setOpenPanel] = useState(null);

  const hasManyBranches = branches.length > 1;
  const isBranchesOpen = openPanel === "branches";
  const isHoursOpen = openPanel === "hours";
  const isLanguageOpen = openPanel === "language";

  useEffect(() => {
    if (!openPanel) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpenPanel(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openPanel]);

  function togglePanel(panel) {
    setOpenPanel((current) => (current === panel ? null : panel));
  }

  return (
    <>
      {openPanel && (
        <button
          type="button"
          aria-label="Close panel"
          onClick={() => setOpenPanel(null)}
          className="fixed inset-0 z-[80] cursor-default bg-black/10 backdrop-blur-[2px]"
        />
      )}

      <div className="fixed inset-x-0 top-5 z-[90] px-4 sm:px-6">
        <div className="mx-auto w-full max-w-md">
          {isBranchesOpen && (
            <ClassicBottomSheet
              title={t(language, "branches")}
              subtitle={t(language, "switchBranch")}
              icon={<Store size={18} />}
              onClose={() => setOpenPanel(null)}
            >
              <div className="grid gap-2">
                {branches.map((item) => {
                  const active = item.id === branch.id;
                  const label = pickText(item, "name", "name_i18n", language);

                  return (
                    <Link
                      key={item.id}
                      href={withLanguageParam(
                        getBranchHref(business.slug, item.slug),
                        language
                      )}
                      onClick={() => setOpenPanel(null)}
                      className={[
                        "flex min-h-14 items-center justify-between gap-3 rounded-[22px] border px-4 text-sm font-black transition",
                        active
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-white/70 text-black/65 hover:bg-white hover:text-black",
                      ].join(" ")}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={[
                            "grid h-9 w-9 shrink-0 place-items-center rounded-2xl",
                            active ? "bg-white/15" : "bg-black/5",
                          ].join(" ")}
                        >
                          <Store size={16} />
                        </span>

                        <span className="truncate">{label}</span>
                      </span>

                      {active ? (
                        <Check size={17} />
                      ) : (
                        <ArrowUpRight size={17} />
                      )}
                    </Link>
                  );
                })}
              </div>
            </ClassicBottomSheet>
          )}

          {isHoursOpen && (
            <ClassicBottomSheet
              title={t(language, "workingHours")}
              subtitle={`${today.dayLabel}: ${today.label}`}
              icon={<Clock size={18} />}
              onClose={() => setOpenPanel(null)}
            >
              <div className="mb-4 rounded-2xl border border-black/10 bg-black p-4 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                      {t(language, "today")}
                    </p>

                    <p className="mt-1 text-lg font-black">
                      {today.dayLabel}
                    </p>
                  </div>

                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-black",
                      today.isOpenNow
                        ? "bg-white text-black"
                        : "bg-white/10 text-white/60",
                    ].join(" ")}
                  >
                    {today.isOpenNow
                      ? t(language, "openNow")
                      : t(language, "closedNow")}
                  </span>
                </div>

                <p className="mt-3 text-sm font-bold text-white/60">
                  {today.label}
                </p>
              </div>

              <div className="grid gap-2">
                {fullHours.map((day) => (
                  <div
                    key={day.dayKey}
                    className={[
                      "flex min-h-12 items-center justify-between gap-4 rounded-[18px] border px-4 text-sm font-bold",
                      day.isToday
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-white/65 text-black/65",
                    ].join(" ")}
                  >
                    <span className={day.isToday ? "font-black" : ""}>
                      {day.dayLabel}
                    </span>

                    <span
                      className={[
                        "text-end",
                        day.isOpenDay ? "" : "opacity-40",
                      ].join(" ")}
                    >
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            </ClassicBottomSheet>
          )}

         {isLanguageOpen && (
  <ClassicBottomSheet
    title="Language"
    subtitle={LANGUAGE_META[language]?.label || language}
    icon={<Languages size={18} />}
    onClose={() => setOpenPanel(null)}
  >
    <div className="grid gap-2">
      {enabledLanguages.map((code) => {
        const meta = LANGUAGE_META[code];
        if (!meta) return null;

        const active = code === language;

        return (
          <button
            key={code}
            type="button"
            onClick={() => {
              setLanguage?.(code);
              setOpenPanel(null);
            }}
            className={[
              "flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-[22px] border px-4 text-sm font-black transition",
              active
                ? "border-black bg-black text-white"
                : "border-black/10 bg-white/70 text-black/65 hover:bg-white hover:text-black",
            ].join(" ")}
          >
            <span className="flex items-center gap-3">
              <span
                className={[
                  "grid h-9 w-9 place-items-center rounded-xl text-xs",
                  active ? "bg-white/15" : "bg-black/5",
                ].join(" ")}
              >
                {meta.short}
              </span>

              {meta.label}
            </span>

            {active && <Check size={17} />}
          </button>
        );
      })}
    </div>
  </ClassicBottomSheet>
)}
        </div>
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 pt-3 sm:px-6">
        <div className="mx-auto max-w-md">
          <div className="relative overflow-hidden rounded-[34px] border border-white/65 bg-white/70 p-2 shadow-[0_20px_80px_-28px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/80 via-white/35 to-white/10" />
            <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-black/10" />

            <div className="relative grid grid-cols-3 gap-2">
              <ClassicNavButton
                icon={<Store size={20} />}
                label={t(language, "branches")}
                active={isBranchesOpen}
                disabled={!hasManyBranches}
                onClick={() => hasManyBranches && togglePanel("branches")}
              />

              <ClassicNavButton
                icon={<Clock size={20} />}
                label={t(language, "workingHours")}
                active={isHoursOpen}
                status={today?.isOpenNow ? t(language, "openNow") : null}
                onClick={() => togglePanel("hours")}
              />

              <ClassicNavButton
                icon={<Languages size={20} />}
                label={LANGUAGE_META[language]?.short || "AR"}
                active={isLanguageOpen}
                onClick={() => togglePanel("language")}
              />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

function ClassicNavButton({
  icon,
  label,
  active = false,
  disabled = false,
  status = null,
  onClick,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "group relative min-h-16 cursor-pointer overflow-hidden rounded-[26px] px-3 py-2 text-center transition disabled:cursor-not-allowed disabled:opacity-35",
        active
          ? "bg-black text-white shadow-[0_18px_35px_-22px_rgba(0,0,0,1)]"
          : "bg-black/[0.035] text-black/55 hover:bg-black/[0.07] hover:text-black",
      ].join(" ")}
    >
      {active && (
        <>
          <span className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
          <span className="absolute left-1/2 top-1 h-1 w-10 -translate-x-1/2 rounded-full bg-white/80" />
          <span className="absolute inset-x-4 bottom-1 h-5 rounded-full bg-white/15 blur-xl" />
        </>
      )}

      <span className="relative z-10 flex flex-col items-center justify-center gap-1">
        <span
          className={[
            "grid h-7 w-7 place-items-center rounded-2xl transition",
            active
              ? "bg-white text-black"
              : "bg-white/50 text-black/60 group-hover:text-black",
          ].join(" ")}
        >
          {icon}
        </span>

        <span className="max-w-full truncate text-[11px] font-black leading-none">
          {label}
        </span>

        {status && (
          <span
            className={[
              "mt-0.5 h-1.5 w-1.5 rounded-full",
              active ? "bg-white" : "bg-black/35",
            ].join(" ")}
          />
        )}
      </span>
    </button>
  );
}

function ClassicBottomSheet({ title, subtitle, icon, children, onClose }) {
  return (
    <section className="animate-[classicSheetIn_0.22s_ease-out] overflow-hidden rounded-[34px] border border-white/65 bg-white/80 p-3 text-black shadow-[0_24px_90px_-30px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
      <div className="mb-3 flex items-center justify-between gap-3 rounded-[26px] bg-black/[0.04] p-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-black text-white">
            {icon}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-lg font-black tracking-[-0.04em]">
              {title}
            </h2>

            {subtitle && (
              <p className="truncate text-xs font-bold text-black/45">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl bg-white text-black/55 transition hover:bg-black hover:text-white"
        >
          <X size={19} />
        </button>
      </div>

      <div className="max-h-[52vh] overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
}