"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Clock,
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
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

import { getLanguageDirection, getLanguageFontClass } from "@/app/fonts";
import { getBranchHref } from "@/app/m/_lib/publicMenuData";
import { withLanguageParam } from "../../_components/menuUtils";
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
    menuIntro: "تصفّح الأصناف واختر ما يناسبك",
    viewMenu: "عرض القائمة",
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
    close: "إغلاق",
    language: "اللغة",
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
    menuIntro: "עיין בפריטים ובחר את מה שמתאים לך",
    viewMenu: "הצג תפריט",
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
    close: "סגור",
    language: "שפה",
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
    search: "Search the menu...",
    menu: "Menu",
    menuIntro: "Browse the menu and discover your next choice",
    viewMenu: "View menu",
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
    close: "Close",
    language: "Language",
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
    primary: "#183d35",
    background: "#f3f1eb",
    text: "#171815",
  },
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const lang = LANGUAGE_META[language] ? language : "ar";
  const fontClassName = getLanguageFontClass(lang);
  const dir = getLanguageDirection(lang);

  const businessName =
    pickText(business, "name", "name_i18n", lang) || business?.name || "Restaurant";
  const branchName = pickText(branch, "name", "name_i18n", lang);
  const branchAddress = pickText(branch, "address", "address_i18n", lang);
  const description = pickText(
    menu,
    "description_ar",
    "description_i18n",
    lang,
  );

  const logo = menu?.logo_url || business?.logo_url || null;
  const cover = menu?.cover_url || null;

  const today = getTodayWorkingHours(branch?.working_hours, lang);
  const fullHours = getFullWorkingHours(branch?.working_hours, lang);
  const socialLinks = buildSocialLinks(branch || {}, lang);

  const visibleBranches = useMemo(() => {
    return (branches || [])
      .filter((item) => item?.slug && item.status !== "archived")
      .sort((a, b) => Number(b.is_main) - Number(a.is_main));
  }, [branches]);

  const primary = theme?.primary || "#183d35";
  const background = theme?.background || "#f3f1eb";
  const text = theme?.text || "#171815";
  const onPrimary = getReadableTextColor(primary);

  function scrollToMenu() {
    document.getElementById("classic-menu")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <main
      dir={dir}
      lang={lang}
      style={{
        "--classic-primary": primary,
        "--classic-on-primary": onPrimary,
        "--classic-bg": background,
        "--classic-text": text,
      }}
      className={`${fontClassName} min-h-screen overflow-x-hidden bg-[var(--classic-bg)] text-[var(--classic-text)]`}
    >
      <ClassicHero
        businessName={businessName}
        branchName={branchName}
        branchAddress={branchAddress}
        description={description}
        logo={logo}
        cover={cover}
        today={today}
        socialLinks={socialLinks}
        language={lang}
        onViewMenu={scrollToMenu}
      />

      <section
        id="classic-menu"
        className="scroll-mt-4 pb-10 pt-5 sm:pb-14 sm:pt-8 lg:pt-12"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-5 sm:mb-8">


            <span className="hidden rounded-full border border-black/10 bg-white/65 px-4 py-2 text-xs font-black text-black/45 sm:block">
              {sections.reduce(
                (total, section) =>
                  total +
                  (section.items || []).filter((item) => item.is_available !== false)
                    .length,
                0,
              )}
            </span>
          </div>

          <div className="sticky top-3 z-40 mb-5 rounded-[24px] border border-black/10 bg-white/85 p-2 shadow-[0_18px_55px_-34px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:mb-7">
            <ClassicSearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              language={lang}
            />
          </div>

          <ClassicSectionTabs
            sections={sections}
            language={lang}
            searchQuery={searchQuery}
          />
        </div>
      </section>

      <TemplateFooter
        business={business}
        branch={branch}
        menu={menu}
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
      />
    </main>
  );
}

function ClassicHero({
  businessName,
  branchName,
  branchAddress,
  description,
  logo,
  cover,
  today,
  socialLinks,
  language,
  onViewMenu,
}) {
  return (
    <header className="px-3 pt-3 sm:px-5 sm:pt-5 lg:px-8 lg:pt-8">
      <div className="mx-auto grid w-full max-w-7xl overflow-hidden rounded-[30px] bg-[var(--classic-primary)] text-[var(--classic-on-primary)] shadow-[0_35px_100px_-55px_rgba(0,0,0,0.95)] sm:rounded-[38px] lg:min-h-[clamp(34rem,72svh,48rem)] lg:grid-cols-[minmax(20rem,0.82fr)_minmax(0,1.18fr)]">
        <div className="order-2 flex min-w-0 flex-col justify-between p-5 sm:p-8 lg:order-1 lg:p-10 xl:p-12">
          <div>
            <div className="flex items-center justify-between gap-4">
              <div className="relative grid size-[clamp(4.5rem,10vw,6rem)] shrink-0 place-items-center overflow-hidden rounded-full border border-white/25 bg-white/95 text-black shadow-[0_18px_50px_-28px_rgba(0,0,0,0.9)]">
                {logo ? (
                  <Image
                    src={logo}
                    alt={businessName}
                    fill
                    priority
                    sizes="96px"
                    className="pointer-events-none select-none object-cover"
                  />
                ) : (
                  <Store size={28} />
                )}
              </div>

              <span className="rounded-full border border-current/20 bg-white/10 px-3 py-2 text-xs font-black backdrop-blur-xl">
                {t(language, "digitalMenu")}
              </span>
            </div>

            <div className="mt-8 sm:mt-10">
              {branchName && branchName !== businessName && (
                <p className="mb-3 text-sm font-black opacity-65">{branchName}</p>
              )}

              <h1 className="max-w-[12ch] text-[clamp(2.8rem,8vw,6.4rem)] font-black leading-[0.9] tracking-[-0.075em]">
                {businessName}
              </h1>

              {description && (
                <p className="mt-5 max-w-xl text-sm font-bold leading-7 opacity-70 sm:text-base sm:leading-8">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-9 space-y-5 lg:mt-12">
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {branchAddress && (
                <HeroInfoRow icon={<MapPin size={17} />}>
                  {branchAddress}
                </HeroInfoRow>
              )}

              <HeroInfoRow icon={<Clock size={17} />}>
                <span>{today.dayLabel}: {today.label}</span>
                <span
                  className={`size-2 shrink-0 rounded-full ${
                    today.isOpenNow ? "bg-emerald-300" : "bg-white/35"
                  }`}
                />
              </HeroInfoRow>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-current/15 pt-5">
              <button
                type="button"
                onClick={onViewMenu}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-black transition hover:bg-white/90 active:scale-[0.99]"
              >
                {t(language, "viewMenu")}
                <ArrowUpRight size={17} />
              </button>

              {socialLinks.length > 0 && (
                <div className="flex items-center gap-2">
                  {socialLinks.map((link) => (
                    <HeroSocialLink key={link.key} link={link} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative order-1 min-h-[48svh] overflow-hidden bg-black/10 lg:order-2 lg:min-h-full">
          {cover ? (
            <TemplateImage
              src={cover}
              alt={businessName}
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_36%),linear-gradient(145deg,rgba(255,255,255,0.12),transparent_55%)]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-black/15 lg:bg-gradient-to-r lg:from-black/15 lg:via-transparent lg:to-transparent" />

          <div className="absolute inset-x-4 bottom-4 flex justify-end sm:inset-x-6 sm:bottom-6">
            <span className="rounded-full border border-white/25 bg-black/25 px-4 py-2 text-xs font-black text-white backdrop-blur-xl">
              {today.isOpenNow ? t(language, "openNow") : t(language, "closedNow")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroInfoRow({ icon, children }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 rounded-[18px] border border-current/15 bg-white/[0.07] px-4 py-3 text-sm font-black backdrop-blur-xl">
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/12">
          {icon}
        </span>
        <span className="min-w-0 leading-5 opacity-80">{children}</span>
      </span>
    </div>
  );
}

function HeroSocialLink({ link }) {
  return (
    <a
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noreferrer" : undefined}
      aria-label={link.label}
      title={link.label}
      className="grid size-11 place-items-center rounded-full border border-current/20 bg-white/[0.08] text-current transition hover:bg-white hover:text-black"
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

function ClassicSearchBox({ value, onChange, language }) {
  const isRtl = language !== "en";

  return (
    <div className="relative w-full">
      <Search
        size={19}
        className={`pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-black/45 ${
          isRtl ? "right-4" : "left-4"
        }`}
      />

      <input
        dir={isRtl ? "rtl" : "ltr"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t(language, "search")}
        className={`block min-h-13 w-full appearance-none rounded-[18px] border border-transparent bg-black/[0.035] py-3.5 text-base font-bold text-black outline-none placeholder:text-black/35 transition focus:border-black/10 focus:bg-white ${
          isRtl ? "pr-12 pl-12" : "pl-12 pr-12"
        }`}
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={t(language, "close")}
          className={`absolute top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-black/5 text-black/45 transition hover:bg-black hover:text-white ${
            isRtl ? "left-2.5" : "right-2.5"
          }`}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

function ClassicSectionTabs({ sections = [], language, searchQuery = "" }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const cleanSearch = searchQuery.trim().toLowerCase();

  useEffect(() => {
    if (!selectedItem) return undefined;

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
          pickText(item, "name_ar", "name_i18n", language) ||
          item.name_ar ||
          "";
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
      <div className="rounded-[26px] border border-black/10 bg-white/70 px-6 py-14 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-black/5 text-black/35">
          <Search size={22} />
        </div>
        <h3 className="mt-5 text-lg font-black text-black">
          {t(language, "noItems")}
        </h3>
        <p className="mt-2 text-sm font-bold text-black/45">
          {t(language, "noItemsText")}
        </p>
      </div>
    );
  }

  return (
    <>
      <TabGroup>
        <TabList className="flex items-center justify-start gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                    "shrink-0 cursor-pointer rounded-full border px-4 py-2.5 text-sm font-black outline-none transition",
                    selected
                      ? "border-[var(--classic-primary)] bg-[var(--classic-primary)] text-[var(--classic-on-primary)]"
                      : "border-black/10 bg-white/60 text-black/55 hover:bg-white hover:text-black",
                  ].join(" ")
                }
              >
                {sectionName}
              </Tab>
            );
          })}
        </TabList>

        <TabPanels className="mt-5 sm:mt-7">
          {visibleSections.map((section) => {
            const sectionName =
              pickText(section, "name_ar", "name_i18n", language) ||
              section.name_ar ||
              "Section";

            return (
              <TabPanel key={section.id} className="outline-none">
                <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
                  <h3 className="text-2xl font-black tracking-[-0.04em] text-black sm:text-3xl">
                    {sectionName}
                  </h3>
                  <span className="rounded-full bg-black/5 px-3 py-1.5 text-xs font-black text-black/40">
                    {section.visibleItems.length}
                  </span>
                </div>

                <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
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
    pickText(item, "name_ar", "name_i18n", language) ||
    item.name_ar ||
    "Item";
  const description =
    pickText(item, "description_ar", "description_i18n", language) ||
    item.description_ar ||
    "";
  const hasPrice = item.price !== null && item.price !== undefined;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full cursor-pointer items-stretch gap-3 overflow-hidden rounded-[24px] border border-black/[0.07] bg-white/75 p-2.5 text-start shadow-[0_16px_45px_-36px_rgba(0,0,0,0.85)] transition hover:-translate-y-0.5 hover:border-black/15 hover:bg-white hover:shadow-[0_24px_55px_-36px_rgba(0,0,0,0.9)] sm:gap-4 sm:p-3"
    >
      <div className="relative aspect-square w-[clamp(5.75rem,22vw,8rem)] shrink-0 overflow-hidden rounded-[18px] bg-black/5 sm:rounded-[20px]">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={name}
            fill
            sizes="(max-width: 640px) 34vw, 144px"
            className="pointer-events-none select-none object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-black/22">
            <Menu size={28} />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
        <div className="min-w-0">
          <h4 className="text-base font-black leading-6 text-black sm:text-lg">
            {name}
          </h4>

          {description && (
            <p className="mt-1.5 line-clamp-2 text-xs font-bold leading-5 text-black/45 sm:text-sm sm:leading-6">
              {description}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          {hasPrice ? (
            <p className="text-sm font-black text-black sm:text-base">
              {formatPrice(item.price)}
            </p>
          ) : (
            <span />
          )}

          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-black/[0.045] text-black/45 transition group-hover:bg-[var(--classic-primary)] group-hover:text-[var(--classic-on-primary)]">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </button>
  );
}

function ClassicItemModal({ item, language, onClose }) {
  if (!item) return null;

  const name =
    pickText(item, "name_ar", "name_i18n", language) ||
    item.name_ar ||
    "Item";
  const description =
    pickText(item, "description_ar", "description_i18n", language) ||
    item.description_ar ||
    "";
  const hasPrice = item.price !== null && item.price !== undefined;
  const isRtl = language !== "en";

  return (
    <div
      className="fixed inset-0 z-[999] overflow-y-auto bg-black/70 sm:p-5 lg:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={name}
      dir={isRtl ? "rtl" : "ltr"}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="relative mx-auto grid min-h-dvh w-full overflow-hidden bg-white text-black sm:min-h-0 sm:max-w-5xl sm:rounded-[32px] sm:border sm:border-white/20 sm:shadow-[0_35px_120px_-45px_rgba(0,0,0,1)] lg:grid-cols-[minmax(0,1.12fr)_minmax(20rem,0.88fr)]">
        <button
          type="button"
          onClick={onClose}
          aria-label={t(language, "close")}
          className={`absolute top-4 z-30 grid size-11 cursor-pointer place-items-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-xl transition hover:bg-black sm:top-5 ${
            isRtl ? "left-4 sm:left-5" : "right-4 sm:right-5"
          }`}
        >
          <X size={20} />
        </button>

        <div className="relative min-h-[42dvh] overflow-hidden bg-[#ecece7] lg:min-h-[min(84dvh,760px)]">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="pointer-events-none select-none object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-black/20">
              <Menu size={64} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 lg:bg-gradient-to-r lg:from-transparent lg:to-black/5" />
        </div>

        <div className="flex min-w-0 flex-col justify-center p-5 sm:p-8 lg:max-h-[min(84dvh,760px)] lg:overflow-y-auto lg:p-10 xl:p-12">
          <p className="hidden text-xs font-black uppercase tracking-[0.2em] text-black/35">
            {t(language, "digitalMenu")}
          </p>

          <div className="mt-4 flex items-start justify-between gap-5">
            <h2 className="min-w-0 text-[clamp(2rem,6vw,4.6rem)] font-black leading-[0.95] tracking-[-0.065em] text-black">
              {name}
            </h2>

            {hasPrice && (
              <p className="shrink-0 rounded-full bg-[var(--classic-primary)] px-4 py-2 text-sm font-black text-[var(--classic-on-primary)] sm:text-base">
                {formatPrice(item.price)}
              </p>
            )}
          </div>

          {description && (
            <p className="mt-6 max-w-xl text-sm font-bold leading-7 text-black/55 sm:text-base sm:leading-8">
              {description}
            </p>
          )}
        </div>
      </section>
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
}) {
  const [openPanel, setOpenPanel] = useState(null);

  const hasManyBranches = branches.length > 1;
  const isBranchesOpen = openPanel === "branches";
  const isHoursOpen = openPanel === "hours";
  const isLanguageOpen = openPanel === "language";

  useEffect(() => {
    if (!openPanel) return undefined;

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
          aria-label={t(language, "close")}
          onClick={() => setOpenPanel(null)}
          className="fixed inset-0 z-[80] cursor-default bg-black/35 backdrop-blur-[2px]"
        />
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-[6.75rem] z-[90] px-3 sm:bottom-[7.25rem] sm:px-6">
        <div className="pointer-events-auto mx-auto w-full max-w-lg">
          {isBranchesOpen && (
            <ClassicBottomSheet
              title={t(language, "branches")}
              subtitle={t(language, "switchBranch")}
              icon={<Store size={18} />}
              onClose={() => setOpenPanel(null)}
            >
              <div className="grid gap-2">
                {branches.map((item) => {
                  const active = item.id === branch?.id;
                  const label = pickText(item, "name", "name_i18n", language);

                  return (
                    <Link
                      key={item.id}
                      href={withLanguageParam(
                        getBranchHref(business.slug, item.slug),
                        language,
                      )}
                      onClick={() => setOpenPanel(null)}
                      className={[
                        "flex min-h-14 items-center justify-between gap-3 rounded-[20px] border px-4 text-sm font-black transition",
                        active
                          ? "border-[var(--classic-primary)] bg-[var(--classic-primary)] text-[var(--classic-on-primary)]"
                          : "border-black/10 bg-white text-black/65 hover:border-black/20 hover:text-black",
                      ].join(" ")}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`grid size-9 shrink-0 place-items-center rounded-full ${
                            active ? "bg-white/15" : "bg-black/5"
                          }`}
                        >
                          <Store size={16} />
                        </span>
                        <span className="truncate">{label}</span>
                      </span>

                      {active ? <Check size={17} /> : <ArrowUpRight size={17} />}
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
              <div className="mb-3 rounded-[20px] bg-[var(--classic-primary)] p-4 text-[var(--classic-on-primary)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] opacity-50">
                      {t(language, "today")}
                    </p>
                    <p className="mt-1 text-lg font-black">{today.dayLabel}</p>
                  </div>

                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">
                    {today.isOpenNow
                      ? t(language, "openNow")
                      : t(language, "closedNow")}
                  </span>
                </div>

                <p className="mt-3 text-sm font-bold opacity-65">{today.label}</p>
              </div>

              <div className="grid gap-2">
                {fullHours.map((day) => (
                  <div
                    key={day.dayKey}
                    className={[
                      "flex min-h-12 items-center justify-between gap-4 rounded-[18px] border px-4 text-sm font-bold",
                      day.isToday
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-white text-black/60",
                    ].join(" ")}
                  >
                    <span className={day.isToday ? "font-black" : ""}>
                      {day.dayLabel}
                    </span>
                    <span className={`text-end ${day.isOpenDay ? "" : "opacity-40"}`}>
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            </ClassicBottomSheet>
          )}

          {isLanguageOpen && (
            <ClassicBottomSheet
              title={t(language, "language")}
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
                        "flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-[20px] border px-4 text-sm font-black transition",
                        active
                          ? "border-[var(--classic-primary)] bg-[var(--classic-primary)] text-[var(--classic-on-primary)]"
                          : "border-black/10 bg-white text-black/65 hover:border-black/20 hover:text-black",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`grid size-9 place-items-center rounded-full text-xs ${
                            active ? "bg-white/15" : "bg-black/5"
                          }`}
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

      <footer className="fixed inset-x-0 bottom-0 z-[100] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
        <div className="mx-auto max-w-md">
          <div className="rounded-[26px] border border-black/10 bg-white/88 p-1.5 shadow-[0_22px_70px_-32px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
            <div className="grid grid-cols-3 gap-1.5">
              <ClassicNavButton
                icon={<Store size={19} />}
                label={t(language, "branches")}
                active={isBranchesOpen}
                disabled={!hasManyBranches}
                onClick={() => hasManyBranches && togglePanel("branches")}
              />

              <ClassicNavButton
                icon={<Clock size={19} />}
                label={t(language, "workingHours")}
                active={isHoursOpen}
                status={today?.isOpenNow}
                onClick={() => togglePanel("hours")}
              />

              <ClassicNavButton
                icon={<Languages size={19} />}
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
  status = false,
  onClick,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "group relative min-h-14 cursor-pointer rounded-[20px] px-2 py-2 text-center transition disabled:cursor-not-allowed disabled:opacity-30",
        active
          ? "bg-[var(--classic-primary)] text-[var(--classic-on-primary)]"
          : "text-black/50 hover:bg-black/[0.045] hover:text-black",
      ].join(" ")}
    >
      <span className="flex flex-col items-center justify-center gap-1">
        <span className="relative grid size-7 place-items-center">
          {icon}
          {status && !active && (
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full border-2 border-white bg-emerald-500" />
          )}
        </span>
        <span className="max-w-full truncate text-[11px] font-black leading-none">
          {label}
        </span>
      </span>
    </button>
  );
}

function ClassicBottomSheet({ title, subtitle, icon, children, onClose }) {
  return (
    <section className="animate-[classicSheetIn_0.22s_ease-out] overflow-hidden rounded-[28px] border border-black/10 bg-[#f7f7f3] p-3 text-black shadow-[0_28px_100px_-38px_rgba(0,0,0,1)]">
      <div className="mb-3 flex items-center justify-between gap-3 px-1 py-1">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--classic-primary)] text-[var(--classic-on-primary)]">
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
          aria-label="Close"
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-black/5 text-black/50 transition hover:bg-black hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="max-h-[min(56dvh,34rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
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

function getReadableTextColor(color) {
  const value = String(color || "").trim().replace("#", "");
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((character) => character + character)
          .join("")
      : value;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return "#ffffff";

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

  return luminance > 165 ? "#111111" : "#ffffff";
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