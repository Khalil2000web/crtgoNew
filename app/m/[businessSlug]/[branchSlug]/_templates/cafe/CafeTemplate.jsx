"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Clock,
  Coffee,
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
    digitalMenu: "قائمة المقهى",
    menu: "القائمة",
    menuIntro: "قهوة، حلويات وأكثر — كل شيء في مكان واحد.",
    browseMenu: "تصفّح القائمة",
    search: "ابحث عن مشروب أو صنف...",
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
    itemDetails: "تفاصيل الصنف",
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
    digitalMenu: "תפריט בית הקפה",
    menu: "תפריט",
    menuIntro: "קפה, קינוחים ועוד — הכול במקום אחד.",
    browseMenu: "עיון בתפריט",
    search: "חפש משקה או פריט...",
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
    itemDetails: "פרטי הפריט",
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
    digitalMenu: "Cafe menu",
    menu: "Our menu",
    menuIntro: "Coffee, pastries and more — all in one place.",
    browseMenu: "Browse menu",
    search: "Search drinks or food...",
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
    itemDetails: "Item details",
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

export default function CafeTemplate({
  business,
  branch,
  menu,
  sections = [],
  branches = [],
  language = "ar",
  setLanguage,
  enabledLanguages = ["ar"],
  theme = {
    primary: "#74533f",
    background: "#f6efdf",
    text: "#2a211b",
  },
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const lang = LANGUAGE_META[language] ? language : "ar";
  const fontClassName = getLanguageFontClass(lang);
  const dir = getLanguageDirection(lang);

  const businessName =
    pickText(business, "name", "name_i18n", lang) || business?.name || "Cafe";
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

  const primary = theme?.primary || "#74533f";
  const background = theme?.background || "#f6efdf";
  const text = theme?.text || "#2a211b";
  const onPrimary = getReadableTextColor(primary);

  function scrollToMenu() {
    document.getElementById("cafe-menu")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <main
      dir={dir}
      lang={lang}
      style={{
        "--cafe-primary": primary,
        "--cafe-on-primary": onPrimary,
        "--cafe-source-bg": background,
        "--cafe-text": text,
        "--cafe-bg": `color-mix(in srgb, ${background} 38%, #f8efdc 62%)`,
        "--cafe-paper": `color-mix(in srgb, ${background} 18%, #fffaf0 82%)`,
        "--cafe-soft": `color-mix(in srgb, ${primary} 7%, #fffaf0 93%)`,
        "--cafe-border": `color-mix(in srgb, ${text} 12%, transparent)`,
      }}
      className={`${fontClassName} min-h-screen overflow-x-hidden bg-[var(--cafe-bg)] text-[var(--cafe-text)]`}
    >
      <CafeHero
        businessName={businessName}
        branchName={branchName}
        branchAddress={branchAddress}
        description={description}
        logo={logo}
        cover={cover}
        today={today}
        socialLinks={socialLinks}
        language={lang}
        onBrowseMenu={scrollToMenu}
      />

      <section
        id="cafe-menu"
        className="scroll-mt-4 pb-12 pt-8 sm:pb-16 sm:pt-12"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[var(--cafe-primary)]">
                <Coffee size={17} />
                <p className="text-xs font-black uppercase tracking-[0.2em]">
                  {t(lang, "digitalMenu")}
                </p>
              </div>

              <h2 className="mt-3 text-[clamp(2.25rem,7vw,4.5rem)] font-black leading-[0.95] tracking-[-0.065em] text-[var(--cafe-text)]">
                {t(lang, "menu")}
              </h2>

              <p className="mt-3 max-w-xl text-sm font-bold leading-6 text-[color-mix(in_srgb,var(--cafe-text)_55%,transparent)] sm:text-base sm:leading-7">
                {t(lang, "menuIntro")}
              </p>
            </div>
          </div>

          <div className="sticky top-3 z-40 mb-6 rounded-[24px] border border-[var(--cafe-border)] bg-[color-mix(in_srgb,var(--cafe-paper)_90%,transparent)] p-2 shadow-[0_18px_50px_-38px_rgba(61,40,26,0.8)] backdrop-blur-2xl sm:mb-8">
            <CafeSearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              language={lang}
            />
          </div>

          <CafeSectionTabs
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

      <CafeBottomNav
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

function CafeHero({
  businessName,
  branchName,
  branchAddress,
  description,
  logo,
  cover,
  today,
  socialLinks,
  language,
  onBrowseMenu,
}) {
  return (
    <header className="px-3 pt-3 sm:px-5 sm:pt-5 lg:px-8 lg:pt-8">
      <div className="mx-auto grid w-full max-w-7xl overflow-hidden rounded-[30px] border border-[var(--cafe-border)] bg-[var(--cafe-paper)] shadow-[0_30px_90px_-56px_rgba(73,48,31,0.95)] sm:rounded-[38px] lg:grid-cols-[minmax(0,1.08fr)_minmax(21rem,0.92fr)]">
        <div className="relative min-h-[clamp(22rem,58svh,42rem)] overflow-hidden bg-[var(--cafe-soft)]">
          {cover ? (
            <TemplateImage
              src={cover}
              alt={businessName}
              priority
              sizes="(max-width: 1024px) 100vw, 56vw"
            />
          ) : (
            <CafeCoverFallback />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/10" />

          <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3 sm:inset-x-6 sm:top-6">
            <span className="rounded-full border border-white/30 bg-black/20 px-3 py-2 text-xs font-black text-white backdrop-blur-xl">
              {today.isOpenNow ? t(language, "openNow") : t(language, "closedNow")}
            </span>

            <span className="grid size-10 place-items-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-xl">
              <Coffee size={18} />
            </span>
          </div>

          <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
            <div className="flex max-w-lg items-center gap-3 rounded-[22px] border border-white/25 bg-black/25 p-3 text-white backdrop-blur-xl">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15">
                <Clock size={17} />
              </span>

              <div className="min-w-0">
                <p className="text-xs font-bold text-white/60">
                  {today.dayLabel}
                </p>
                <p className="truncate text-sm font-black">{today.label}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex min-w-0 flex-col justify-between overflow-hidden p-5 sm:p-8 lg:p-10 xl:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full border border-[var(--cafe-border)] opacity-50" />
          <div className="pointer-events-none absolute -right-8 -top-8 size-36 rounded-full border border-[var(--cafe-border)] opacity-45" />

          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="relative grid size-[clamp(4.5rem,11vw,6rem)] shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--cafe-border)] bg-white text-[var(--cafe-primary)] shadow-[0_16px_45px_-30px_rgba(73,48,31,0.75)]">
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
                  <Coffee size={29} />
                )}
              </div>

              <span className="rounded-full border border-[var(--cafe-border)] bg-[var(--cafe-soft)] px-3 py-2 text-xs font-black text-[var(--cafe-primary)]">
                {t(language, "digitalMenu")}
              </span>
            </div>

            <div className="mt-8 sm:mt-10">
              {branchName && branchName !== businessName && (
                <p className="mb-3 text-sm font-black text-[color-mix(in_srgb,var(--cafe-text)_50%,transparent)]">
                  {branchName}
                </p>
              )}

              <h1 className="max-w-[12ch] text-[clamp(2.8rem,8vw,5.8rem)] font-black leading-[0.9] tracking-[-0.075em] text-[var(--cafe-text)]">
                {businessName}
              </h1>

              {description && (
                <p className="mt-5 max-w-xl text-sm font-bold leading-7 text-[color-mix(in_srgb,var(--cafe-text)_58%,transparent)] sm:text-base sm:leading-8">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="relative mt-9 space-y-5 lg:mt-12">
            {branchAddress && (
              <div className="flex min-h-12 items-center gap-3 border-y border-[var(--cafe-border)] py-4 text-sm font-black text-[color-mix(in_srgb,var(--cafe-text)_68%,transparent)]">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--cafe-soft)] text-[var(--cafe-primary)]">
                  <MapPin size={17} />
                </span>
                <span className="min-w-0 leading-6">{branchAddress}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={onBrowseMenu}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--cafe-primary)] px-5 text-sm font-black text-[var(--cafe-on-primary)] transition hover:brightness-95 active:scale-[0.99]"
              >
                {t(language, "browseMenu")}
                <ArrowDown size={17} />
              </button>

              {socialLinks.length > 0 && (
                <div className="flex items-center gap-2">
                  {socialLinks.map((link) => (
                    <CafeSocialLink key={link.key} link={link} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function CafeCoverFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--cafe-soft)]">
      <div className="absolute left-[12%] top-[14%] size-44 rounded-full border border-[var(--cafe-border)]" />
      <div className="absolute bottom-[10%] right-[8%] size-64 rounded-full border border-[var(--cafe-border)]" />
      <div className="absolute inset-0 grid place-items-center text-[var(--cafe-primary)]">
        <div className="grid size-32 place-items-center rounded-full border border-[var(--cafe-border)] bg-[var(--cafe-paper)]">
          <Coffee size={46} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}

function CafeSocialLink({ link }) {
  return (
    <a
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noreferrer" : undefined}
      aria-label={link.label}
      title={link.label}
      className="grid size-10 place-items-center rounded-full border border-[var(--cafe-border)] bg-[var(--cafe-soft)] text-[var(--cafe-primary)] transition hover:bg-[var(--cafe-primary)] hover:text-[var(--cafe-on-primary)]"
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

function CafeSearchBox({ value, onChange, language }) {
  const isRtl = language !== "en";

  return (
    <div className="relative w-full">
      <Search
        size={18}
        className={`pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-[color-mix(in_srgb,var(--cafe-text)_42%,transparent)] ${
          isRtl ? "right-4" : "left-4"
        }`}
      />

      <input
        dir={isRtl ? "rtl" : "ltr"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t(language, "search")}
        className={`block min-h-13 w-full appearance-none rounded-[18px] border border-transparent bg-[var(--cafe-soft)] py-3.5 text-base font-bold text-[var(--cafe-text)] outline-none placeholder:text-[color-mix(in_srgb,var(--cafe-text)_35%,transparent)] transition focus:border-[var(--cafe-border)] focus:bg-white ${
          isRtl ? "pr-12 pl-12" : "pl-12 pr-12"
        }`}
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={t(language, "close")}
          className={`absolute top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-[var(--cafe-paper)] text-[color-mix(in_srgb,var(--cafe-text)_50%,transparent)] transition hover:bg-[var(--cafe-primary)] hover:text-[var(--cafe-on-primary)] ${
            isRtl ? "left-2.5" : "right-2.5"
          }`}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

function CafeSectionTabs({ sections = [], language, searchQuery = "" }) {
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
      <div className="rounded-[28px] border border-[var(--cafe-border)] bg-[var(--cafe-paper)] px-6 py-14 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--cafe-soft)] text-[var(--cafe-primary)]">
          <Search size={22} />
        </div>
        <h3 className="mt-5 text-lg font-black text-[var(--cafe-text)]">
          {t(language, "noItems")}
        </h3>
        <p className="mt-2 text-sm font-bold text-[color-mix(in_srgb,var(--cafe-text)_45%,transparent)]">
          {t(language, "noItemsText")}
        </p>
      </div>
    );
  }

  return (
    <>
      <TabGroup>
        <div className="border-b border-[var(--cafe-border)]">
          <TabList className="flex items-center justify-start gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                      "relative shrink-0 cursor-pointer border-b-[3px] px-0 pb-3 pt-1 text-sm font-black outline-none transition sm:text-base",
                      selected
                        ? "border-[var(--cafe-primary)] text-[var(--cafe-text)]"
                        : "border-transparent text-[color-mix(in_srgb,var(--cafe-text)_48%,transparent)] hover:text-[var(--cafe-text)]",
                    ].join(" ")
                  }
                >
                  {sectionName}
                </Tab>
              );
            })}
          </TabList>
        </div>

        <TabPanels className="mt-7 sm:mt-9">
          {visibleSections.map((section) => {
            const sectionName =
              pickText(section, "name_ar", "name_i18n", language) ||
              section.name_ar ||
              "Section";

            return (
              <TabPanel key={section.id} className="outline-none">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h3 className="text-2xl font-black tracking-[-0.045em] text-[var(--cafe-text)] sm:text-3xl">
                    {sectionName}
                  </h3>

                  <span className="rounded-full bg-[var(--cafe-soft)] px-3 py-1.5 text-xs font-black text-[var(--cafe-primary)]">
                    {section.visibleItems.length}
                  </span>
                </div>

                <div className="grid gap-3 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-4">
                  {section.visibleItems.map((item) => (
                    <CafeItemCard
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

      <CafeItemModal
        item={selectedItem}
        language={language}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}

function CafeItemCard({ item, language, onOpen }) {
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
      className="group flex w-full cursor-pointer items-center gap-3 rounded-[24px] border border-[var(--cafe-border)] bg-[color-mix(in_srgb,var(--cafe-paper)_82%,transparent)] p-2.5 text-start transition hover:-translate-y-0.5 hover:bg-[var(--cafe-paper)] hover:shadow-[0_20px_48px_-40px_rgba(73,48,31,0.85)] sm:gap-4 sm:p-3"
    >
      <div className="relative aspect-square w-[clamp(5.25rem,21vw,7.25rem)] shrink-0 overflow-hidden rounded-[20px] bg-[var(--cafe-soft)]">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={name}
            fill
            sizes="(max-width: 640px) 34vw, 124px"
            className="pointer-events-none select-none object-cover transition duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-[var(--cafe-primary)] opacity-55">
            <Coffee size={29} strokeWidth={1.7} />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center py-1">
        <div className="flex items-start justify-between gap-3">
          <h4 className="min-w-0 text-base font-black leading-6 text-[var(--cafe-text)] sm:text-lg">
            {name}
          </h4>

          {hasPrice && (
            <p className="shrink-0 text-sm font-black text-[var(--cafe-primary)] sm:text-base">
              {formatPrice(item.price)}
            </p>
          )}
        </div>

        {description && (
          <p className="mt-1.5 line-clamp-2 text-xs font-bold leading-5 text-[color-mix(in_srgb,var(--cafe-text)_45%,transparent)] sm:text-sm sm:leading-6">
            {description}
          </p>
        )}
      </div>
    </button>
  );
}

function CafeItemModal({ item, language, onClose }) {
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
      className="fixed inset-0 z-[999] overflow-y-auto bg-black/55 sm:p-5 lg:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={name}
      dir={isRtl ? "rtl" : "ltr"}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="relative mx-auto grid min-h-dvh w-full overflow-hidden bg-[var(--cafe-paper)] text-[var(--cafe-text)] sm:min-h-0 sm:max-w-4xl sm:rounded-[32px] sm:border sm:border-white/20 sm:shadow-[0_34px_120px_-48px_rgba(0,0,0,1)] lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
        <button
          type="button"
          onClick={onClose}
          aria-label={t(language, "close")}
          className={`absolute top-4 z-30 grid size-11 cursor-pointer place-items-center rounded-full border border-white/35 bg-black/35 text-white backdrop-blur-xl transition hover:bg-black sm:top-5 ${
            isRtl ? "left-4 sm:left-5" : "right-4 sm:right-5"
          }`}
        >
          <X size={20} />
        </button>

        <div className="relative min-h-[42dvh] overflow-hidden bg-[var(--cafe-soft)] lg:min-h-[min(82dvh,720px)]">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 54vw"
              className="pointer-events-none select-none object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-[var(--cafe-primary)] opacity-50">
              <Coffee size={68} strokeWidth={1.4} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/22 via-transparent to-black/8" />
        </div>

        <div className="flex min-w-0 flex-col justify-center p-5 sm:p-8 lg:max-h-[min(82dvh,720px)] lg:overflow-y-auto lg:p-10 xl:p-12">
          <div className="flex items-center gap-2 text-[var(--cafe-primary)]">
            <Coffee size={16} />
            <p className="text-xs font-black uppercase tracking-[0.18em]">
              {t(language, "itemDetails")}
            </p>
          </div>

          <div className="mt-4 flex items-start justify-between gap-5">
            <h2 className="min-w-0 text-[clamp(2rem,6vw,4.2rem)] font-black leading-[0.95] tracking-[-0.065em] text-[var(--cafe-text)]">
              {name}
            </h2>

            {hasPrice && (
              <p className="shrink-0 rounded-full bg-[var(--cafe-primary)] px-4 py-2 text-sm font-black text-[var(--cafe-on-primary)] sm:text-base">
                {formatPrice(item.price)}
              </p>
            )}
          </div>

          {description && (
            <p className="mt-6 max-w-xl text-sm font-bold leading-7 text-[color-mix(in_srgb,var(--cafe-text)_56%,transparent)] sm:text-base sm:leading-8">
              {description}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function CafeBottomNav({
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
          className="fixed inset-0 z-[80] cursor-default bg-black/28 backdrop-blur-[2px]"
        />
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-[6.5rem] z-[90] px-3 sm:bottom-[7rem] sm:px-6">
        <div className="pointer-events-auto mx-auto w-full max-w-lg">
          {isBranchesOpen && (
            <CafeBottomSheet
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
                          ? "border-[var(--cafe-primary)] bg-[var(--cafe-primary)] text-[var(--cafe-on-primary)]"
                          : "border-[var(--cafe-border)] bg-[var(--cafe-paper)] text-[color-mix(in_srgb,var(--cafe-text)_65%,transparent)] hover:border-[var(--cafe-primary)] hover:text-[var(--cafe-text)]",
                      ].join(" ")}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`grid size-9 shrink-0 place-items-center rounded-full ${
                            active ? "bg-white/15" : "bg-[var(--cafe-soft)]"
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
            </CafeBottomSheet>
          )}

          {isHoursOpen && (
            <CafeBottomSheet
              title={t(language, "workingHours")}
              subtitle={`${today.dayLabel}: ${today.label}`}
              icon={<Clock size={18} />}
              onClose={() => setOpenPanel(null)}
            >
              <div className="mb-3 rounded-[20px] bg-[var(--cafe-primary)] p-4 text-[var(--cafe-on-primary)]">
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
                        ? "border-[var(--cafe-primary)] bg-[var(--cafe-primary)] text-[var(--cafe-on-primary)]"
                        : "border-[var(--cafe-border)] bg-[var(--cafe-paper)] text-[color-mix(in_srgb,var(--cafe-text)_60%,transparent)]",
                    ].join(" ")}
                  >
                    <span className={day.isToday ? "font-black" : ""}>
                      {day.dayLabel}
                    </span>
                    <span
                      className={`text-end ${day.isOpenDay ? "" : "opacity-40"}`}
                    >
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            </CafeBottomSheet>
          )}

          {isLanguageOpen && (
            <CafeBottomSheet
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
                          ? "border-[var(--cafe-primary)] bg-[var(--cafe-primary)] text-[var(--cafe-on-primary)]"
                          : "border-[var(--cafe-border)] bg-[var(--cafe-paper)] text-[color-mix(in_srgb,var(--cafe-text)_65%,transparent)] hover:border-[var(--cafe-primary)] hover:text-[var(--cafe-text)]",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`grid size-9 place-items-center rounded-full text-xs ${
                            active ? "bg-white/15" : "bg-[var(--cafe-soft)]"
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
            </CafeBottomSheet>
          )}
        </div>
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-[100] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
        <div className="mx-auto max-w-md">
          <div className="rounded-[26px] border border-[var(--cafe-border)] bg-[color-mix(in_srgb,var(--cafe-paper)_92%,transparent)] p-1.5 shadow-[0_22px_65px_-34px_rgba(73,48,31,0.95)] backdrop-blur-2xl">
            <div className="grid grid-cols-3 gap-1.5">
              <CafeNavButton
                icon={<Store size={19} />}
                label={t(language, "branches")}
                active={isBranchesOpen}
                disabled={!hasManyBranches}
                onClick={() => hasManyBranches && togglePanel("branches")}
              />

              <CafeNavButton
                icon={<Clock size={19} />}
                label={t(language, "workingHours")}
                active={isHoursOpen}
                status={today?.isOpenNow}
                onClick={() => togglePanel("hours")}
              />

              <CafeNavButton
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

function CafeNavButton({
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
          ? "bg-[var(--cafe-primary)] text-[var(--cafe-on-primary)]"
          : "text-[color-mix(in_srgb,var(--cafe-text)_50%,transparent)] hover:bg-[var(--cafe-soft)] hover:text-[var(--cafe-text)]",
      ].join(" ")}
    >
      <span className="flex flex-col items-center justify-center gap-1">
        <span className="relative grid size-7 place-items-center">
          {icon}
          {status && !active && (
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full border-2 border-[var(--cafe-paper)] bg-emerald-500" />
          )}
        </span>
        <span className="max-w-full truncate text-[11px] font-black leading-none">
          {label}
        </span>
      </span>
    </button>
  );
}

function CafeBottomSheet({ title, subtitle, icon, children, onClose }) {
  return (
    <section className="animate-[classicSheetIn_0.22s_ease-out] overflow-hidden rounded-[28px] border border-[var(--cafe-border)] bg-[var(--cafe-bg)] p-3 text-[var(--cafe-text)] shadow-[0_28px_100px_-42px_rgba(0,0,0,1)]">
      <div className="mb-3 flex items-center justify-between gap-3 px-1 py-1">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--cafe-primary)] text-[var(--cafe-on-primary)]">
            {icon}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-lg font-black tracking-[-0.04em]">
              {title}
            </h2>
            {subtitle && (
              <p className="truncate text-xs font-bold text-[color-mix(in_srgb,var(--cafe-text)_45%,transparent)]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-[var(--cafe-soft)] text-[color-mix(in_srgb,var(--cafe-text)_55%,transparent)] transition hover:bg-[var(--cafe-primary)] hover:text-[var(--cafe-on-primary)]"
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
  if (key === "phone") return <Phone size={17} />;
  if (key === "whatsapp") return <FaWhatsapp size={17} />;
  if (key === "instagram") return <FaInstagram size={17} />;
  if (key === "facebook") return <FaFacebookF size={16} />;
  if (key === "tiktok") return <FaTiktok size={16} />;

  return <ArrowUpRight size={16} />;
}