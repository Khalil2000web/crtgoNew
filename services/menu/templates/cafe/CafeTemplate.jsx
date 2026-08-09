"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Clock,
  Coffee,
  Languages,
  MapPin,
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

import {
  getLanguageDirection,
  getLanguageFontClass,
} from "@/app/fonts";
import { getBranchHref } from "@/services/menu/publicMenuData";
import { withLanguageParam } from "../../../../../../services/menu/menuUtils";

/*
  Headless café template:
  - Keeps all data, interactions and backend-facing props.
  - Uses plain semantic class names instead of a finished design.
  - Add your own CSS/Tailwind using the class names below.
*/

const LANGUAGE_META = {
  ar: { short: "AR", label: "العربية", dir: "rtl" },
  he: { short: "HE", label: "עברית", dir: "rtl" },
  en: { short: "EN", label: "English", dir: "ltr" },
};

const UI = {
  ar: {
    digitalMenu: "قائمة المقهى",
    menu: "القائمة",
    menuIntro: "قهوة، حلويات وأكثر — كل شيء في مكان واحد.",
    browseMenu: "تصفّح القائمة",
    search: "ابحث عن مشروب أو صنف...",
    openNow: "مفتوح الآن",
    closedNow: "مغلق الآن",
    closedToday: "مغلق اليوم",
    workingHours: "ساعات العمل",
    branches: "الفروع",
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
    openNow: "פתוח עכשיו",
    closedNow: "סגור עכשיו",
    closedToday: "סגור היום",
    workingHours: "שעות פעילות",
    branches: "סניפים",
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
    openNow: "Open now",
    closedNow: "Closed now",
    closedToday: "Closed today",
    workingHours: "Working hours",
    branches: "Branches",
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
  theme = {},
}) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openPanel, setOpenPanel] = useState(null);

  useEffect(() => setMounted(true), []);

  const lang = LANGUAGE_META[language] ? language : "ar";
  const dir = getLanguageDirection(lang);
  const fontClassName = getLanguageFontClass(lang);

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

  const primary =
  theme?.primary ||
  menu?.primary_color ||
  "#74533f";

const background =
  theme?.background ||
  menu?.background_color ||
  "#f6efdf";

const text =
  theme?.text ||
  menu?.text_color ||
  "#2a211b";

const onPrimary = getReadableTextColor(primary);

  const today = mounted
    ? getTodayWorkingHours(branch?.working_hours, lang)
    : createInitialToday(lang);
  const fullHours = mounted
    ? getFullWorkingHours(branch?.working_hours, lang)
    : getInitialFullHours(lang);

  const socialLinks = buildSocialLinks(branch || {}, lang);

  const visibleBranches = useMemo(
    () =>
      (branches || [])
        .filter((item) => item?.slug && item.status !== "archived")
        .sort((a, b) => Number(b.is_main) - Number(a.is_main)),
    [branches],
  );

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return (sections || [])
      .map((section) => {
        const items = (section.items || []).filter(
          (item) => item.is_available !== false,
        );

        const visibleItems = query
          ? items.filter((item) => {
              const name =
                pickText(item, "name_ar", "name_i18n", lang) || "";
              const itemDescription =
                pickText(
                  item,
                  "description_ar",
                  "description_i18n",
                  lang,
                ) || "";

              return `${name} ${itemDescription} ${item.price ?? ""}`
                .toLowerCase()
                .includes(query);
            })
          : items;

        return { ...section, visibleItems };
      })
      .filter((section) => section.visibleItems.length > 0);
  }, [sections, searchQuery, lang]);

  useEffect(() => {
    const stillExists = filteredSections.some(
      (section) => String(section.id) === String(activeSectionId),
    );

    if (!stillExists) {
      setActiveSectionId(filteredSections[0]?.id ?? null);
    }
  }, [filteredSections, activeSectionId]);

  const activeSection =
    filteredSections.find(
      (section) => String(section.id) === String(activeSectionId),
    ) || filteredSections[0] || null;

  function scrollToMenu() {
    document.getElementById("cafe-menu")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function changeLanguage(code) {
    if (!LANGUAGE_META[code]) return;
    setLanguage?.(code);
    setOpenPanel(null);
  }



if (showIntro) {
  return (
    <CafeIntroScreen
      business={business}
      branch={branch}
      menu={menu}
      language={lang}
      direction={dir}
      fontClassName={fontClassName}
      theme={{
        primary,
        background,
        text,
        onPrimary,
      }}
      onOpenMenu={() => setShowIntro(false)}
    />
  );
}



  return (
    <main
      dir={dir}
      lang={lang}
      data-template="cafe-headless"
      className={`${fontClassName} cafe-template`}
      style={{
        "--cafe-primary": theme?.primary || menu?.primary_color || "#74533f",
        "--cafe-background":
          theme?.background || menu?.background_color || "#f6efdf",
        "--cafe-text": theme?.text || menu?.text_color || "#2a211b",
      }}
    >
      <header className="cafe-hero">
        {cover && (
          <div className="cafe-hero-cover">
            <Image
              src={cover}
              alt={businessName}
              width={1800}
              height={1200}
              priority
              sizes="100vw"
              className="cafe-hero-cover-image"
            />
          </div>
        )}

        <div className="cafe-hero-content">
          <div className="cafe-brand-row">
            {logo && (
              <Image
                src={logo}
                alt={businessName}
                width={96}
                height={96}
                priority
                className="cafe-logo"
              />
            )}
            <p className="cafe-kicker">{t(lang, "digitalMenu")}</p>
          </div>

          {branchName && branchName !== businessName && (
            <p className="cafe-branch-name">{branchName}</p>
          )}

          <h1 className="cafe-business-name">{businessName}</h1>

          {description && <p className="cafe-description">{description}</p>}

          <div className="cafe-business-meta">
            {branchAddress && (
              <div className="cafe-meta-row">
                <MapPin aria-hidden="true" />
                <span>{branchAddress}</span>
              </div>
            )}

            <div className="cafe-meta-row">
              <Clock aria-hidden="true" />
              <span>
                {today.dayLabel && `${today.dayLabel}: `}
                {today.label}
              </span>
              <span
                className="cafe-open-status"
                data-open={today.isOpenNow ? "true" : "false"}
              >
                {today.isOpenNow ? t(lang, "openNow") : t(lang, "closedNow")}
              </span>
            </div>
          </div>

          {socialLinks.length > 0 && (
            <nav className="cafe-social-links" aria-label={t(lang, "contact")}>
              {socialLinks.map((link) => (
                <SocialLink key={link.key} link={link} />
              ))}
            </nav>
          )}

          <button
            type="button"
            onClick={scrollToMenu}
            className="cafe-browse-button"
          >
            <Coffee aria-hidden="true" />
            <span>{t(lang, "browseMenu")}</span>
          </button>
        </div>
      </header>

      <section id="cafe-menu" className="cafe-menu">
        <header className="cafe-menu-header">
          <p className="cafe-menu-kicker">{t(lang, "digitalMenu")}</p>
          <h2 className="cafe-menu-title">{t(lang, "menu")}</h2>
          <p className="cafe-menu-intro">{t(lang, "menuIntro")}</p>
        </header>

        <form
          className="cafe-search"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="cafe-search-input" className="cafe-search-label">
            {t(lang, "search")}
          </label>

          <div className="cafe-search-control">
            <Search aria-hidden="true" />
            <input
              id="cafe-search-input"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t(lang, "search")}
              className="cafe-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label={t(lang, "close")}
                className="cafe-search-clear"
              >
                <X aria-hidden="true" />
              </button>
            )}
          </div>
        </form>

        {filteredSections.length ? (
          <>
            <nav className="cafe-section-tabs" aria-label={t(lang, "menu")}>
              {filteredSections.map((section) => {
                const sectionName =
                  pickText(section, "name_ar", "name_i18n", lang) ||
                  section.name_ar ||
                  "Section";
                const active =
                  String(section.id) === String(activeSection?.id);

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSectionId(section.id)}
                    className="cafe-section-tab"
                    data-active={active ? "true" : "false"}
                    aria-pressed={active}
                  >
                    {sectionName}
                  </button>
                );
              })}
            </nav>

            {activeSection && (
              <section className="cafe-section-panel">
                <header className="cafe-section-header">
                  <h3>
                    {pickText(
                      activeSection,
                      "name_ar",
                      "name_i18n",
                      lang,
                    ) || activeSection.name_ar}
                  </h3>
                  <span className="cafe-section-count">
                    {activeSection.visibleItems.length}
                  </span>
                </header>

                <div className="cafe-item-list">
                  {activeSection.visibleItems.map((item) => (
                    <CafeItem
                      key={item.id}
                      item={item}
                      language={lang}
                      onOpen={() => setSelectedItem(item)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="cafe-empty-state">
            <Search aria-hidden="true" />
            <h3>{t(lang, "noItems")}</h3>
            <p>{t(lang, "noItemsText")}</p>
          </div>
        )}
      </section>

      <nav className="cafe-utility-nav" aria-label="Cafe controls">
        <button
          type="button"
          onClick={() => setOpenPanel("branches")}
          disabled={visibleBranches.length <= 1}
          className="cafe-utility-button"
        >
          <Store aria-hidden="true" />
          <span>{t(lang, "branches")}</span>
        </button>

        <button
          type="button"
          onClick={() => setOpenPanel("hours")}
          className="cafe-utility-button"
        >
          <Clock aria-hidden="true" />
          <span>{t(lang, "workingHours")}</span>
        </button>

        <button
          type="button"
          onClick={() => setOpenPanel("language")}
          className="cafe-utility-button"
        >
          <Languages aria-hidden="true" />
          <span>{LANGUAGE_META[lang].short}</span>
        </button>
      </nav>

      <footer className="cafe-footer">
        <strong>{businessName}</strong>
        {branchName && branchName !== businessName && <span>{branchName}</span>}
      </footer>

      {selectedItem && (
        <ItemDialog
          item={selectedItem}
          language={lang}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {openPanel && (
        <UtilityDialog
          panel={openPanel}
          onClose={() => setOpenPanel(null)}
          business={business}
          branch={branch}
          branches={visibleBranches}
          language={lang}
          enabledLanguages={enabledLanguages}
          fullHours={fullHours}
          today={today}
          onLanguageChange={changeLanguage}
        />
      )}
    </main>
  );
}


function CafeIntroScreen({
  business,
  branch,
  menu,
  language,
  direction,
  fontClassName,
  theme,
  onOpenMenu,
}) {
  const businessName =
    pickText(business, "name", "name_i18n", language) ||
    business?.name ||
    "Cafe";

  const branchName = pickText(
    branch,
    "name",
    "name_i18n",
    language,
  );

  const logo = menu?.logo_url || business?.logo_url || null;
  const cover = menu?.cover_url || null;

  return (
    <main
      dir={direction}
      lang={language}
      className={`${fontClassName} relative min-h-[100svh] overflow-hidden`}
      style={{
        "--intro-primary": theme.primary,
        "--intro-background": theme.background,
        "--intro-text": theme.text,
        "--intro-on-primary": theme.onPrimary,
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      {/* Optional background image */}
      {cover && (
        <div className="absolute inset-0">
          <Image
            src={cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className="pointer-events-none select-none object-cover"
          />

          <div className="absolute inset-0 bg-black/35" />
        </div>
      )}

      {/* Add your own background/design elements here */}
      <div className="pointer-events-none absolute inset-0">
        {/* Example:
        <div className="absolute left-10 top-10 h-40 w-40 rounded-full border" />
        */}
      </div>

      <div className="relative z-10 flex min-h-[100svh] flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8">
        {/* Top area */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {logo && (
              <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-white">
                <Image
                  src={logo}
                  alt={businessName}
                  fill
                  priority
                  sizes="56px"
                  className="object-cover"
                />
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-lg font-bold">
                {businessName}
              </p>

              {branchName && branchName !== businessName && (
                <p className="truncate text-sm opacity-60">
                  {branchName}
                </p>
              )}
            </div>
          </div>

          {/* Add top buttons or icons here */}
          <div />
        </header>

        {/* Main intro content */}
        <section className="flex flex-1 flex-col justify-center py-12">
          {/* Add everything you want here */}

          <p className="text-sm font-semibold uppercase tracking-[0.18em] opacity-60">
            Cafe
          </p>

          <h1 className="mt-4 max-w-[12ch] text-[clamp(3rem,14vw,7rem)] font-black leading-[0.88] tracking-[-0.07em]">
            {businessName}
          </h1>

          {/* Example description, artwork, images, category names, etc. */}
          <div className="mt-8">
            {/* Your custom intro content goes here */}
          </div>
        </section>

        {/* Bottom action */}
        <footer>
          <button
            type="button"
            onClick={onOpenMenu}
            className="flex min-h-14 w-full cursor-pointer items-center justify-center rounded-full bg-[var(--intro-primary)] px-6 text-base font-black text-[var(--intro-on-primary)] transition active:scale-[0.98] sm:ml-auto sm:w-auto sm:min-w-52"
          >
            Open menu
          </button>
        </footer>
      </div>
    </main>
  );
}


function CafeItem({ item, language, onOpen }) {
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
    <article className="cafe-item" data-has-image={item.image_url ? "true" : "false"}>
      <button type="button" onClick={onOpen} className="cafe-item-button">
        {item.image_url && (
          <Image
            src={item.image_url}
            alt={name}
            width={240}
            height={240}
            sizes="240px"
            className="cafe-item-image"
          />
        )}

        <div className="cafe-item-content">
          <div className="cafe-item-heading">
            <h4 className="cafe-item-name">{name}</h4>
            {hasPrice && (
              <p className="cafe-item-price">{formatPrice(item.price)}</p>
            )}
          </div>
          {description && (
            <p className="cafe-item-description">{description}</p>
          )}
        </div>
      </button>
    </article>
  );
}

function ItemDialog({ item, language, onClose }) {
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
    <div
      className="cafe-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cafe-item-dialog-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="cafe-dialog-panel">
        <button
          type="button"
          onClick={onClose}
          aria-label={t(language, "close")}
          className="cafe-dialog-close"
        >
          <X aria-hidden="true" />
        </button>

        {item.image_url && (
          <Image
            src={item.image_url}
            alt={name}
            width={1000}
            height={1000}
            sizes="(max-width: 768px) 100vw, 700px"
            className="cafe-dialog-image"
          />
        )}

        <div className="cafe-dialog-content">
          <p className="cafe-dialog-kicker">{t(language, "itemDetails")}</p>
          <div className="cafe-dialog-title-row">
            <h2 id="cafe-item-dialog-title" className="cafe-dialog-title">
              {name}
            </h2>
            {hasPrice && (
              <p className="cafe-dialog-price">{formatPrice(item.price)}</p>
            )}
          </div>
          {description && (
            <p className="cafe-dialog-description">{description}</p>
          )}
        </div>
      </section>
    </div>
  );
}

function UtilityDialog({
  panel,
  onClose,
  business,
  branch,
  branches,
  language,
  enabledLanguages,
  fullHours,
  today,
  onLanguageChange,
}) {
  const title =
    panel === "branches"
      ? t(language, "branches")
      : panel === "hours"
        ? t(language, "workingHours")
        : t(language, "language");

  return (
    <div
      className="cafe-dialog cafe-utility-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cafe-utility-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="cafe-dialog-panel cafe-utility-panel">
        <header className="cafe-dialog-header">
          <h2 id="cafe-utility-title" className="cafe-dialog-title">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t(language, "close")}
            className="cafe-dialog-close"
          >
            <X aria-hidden="true" />
          </button>
        </header>

        {panel === "branches" && (
          <div className="cafe-branch-list">
            {branches.map((item) => {
              const active = String(item.id) === String(branch?.id);
              const label =
                pickText(item, "name", "name_i18n", language) ||
                item.name ||
                "Branch";

              return (
                <Link
                  key={item.id}
                  href={withLanguageParam(
                    getBranchHref(business.slug, item.slug),
                    language,
                  )}
                  onClick={onClose}
                  className="cafe-branch-link"
                  data-active={active ? "true" : "false"}
                >
                  <span>{label}</span>
                  {active ? (
                    <Check aria-hidden="true" />
                  ) : (
                    <ArrowUpRight aria-hidden="true" />
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {panel === "hours" && (
          <div className="cafe-hours">
            <div className="cafe-hours-today">
              <strong>{today.dayLabel}</strong>
              <span>{today.label}</span>
              <span data-open={today.isOpenNow ? "true" : "false"}>
                {today.isOpenNow
                  ? t(language, "openNow")
                  : t(language, "closedNow")}
              </span>
            </div>

            <div className="cafe-hours-list">
              {fullHours.map((day) => (
                <div
                  key={day.dayKey}
                  className="cafe-hours-row"
                  data-today={day.isToday ? "true" : "false"}
                  data-open={day.isOpenDay ? "true" : "false"}
                >
                  <span>{day.dayLabel}</span>
                  <span>{day.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {panel === "language" && (
          <div className="cafe-language-list">
            {(enabledLanguages || [])
              .filter((code) => LANGUAGE_META[code])
              .map((code) => {
                const active = code === language;
                const meta = LANGUAGE_META[code];

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => onLanguageChange(code)}
                    className="cafe-language-button"
                    data-active={active ? "true" : "false"}
                  >
                    <span>{meta.short}</span>
                    <span>{meta.label}</span>
                    {active && <Check aria-hidden="true" />}
                  </button>
                );
              })}
          </div>
        )}
      </section>
    </div>
  );
}

function SocialLink({ link }) {
  return (
    <a
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noreferrer" : undefined}
      aria-label={link.label}
      title={link.label}
      className="cafe-social-link"
      data-social={link.key}
    >
      {socialIcon(link.key)}
      <span>{link.label}</span>
    </a>
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
  if (typeof base === "string" && base.trim()) return base.trim();
  return "";
}

function formatPrice(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `₪${number.toFixed(2)}` : "";
}

function createInitialToday(language) {
  return {
    dayKey: "",
    dayLabel: "",
    label: t(language, "closedToday"),
    isOpenNow: false,
    isOpenDay: false,
  };
}

function getInitialFullHours(language) {
  return DAY_KEYS.map((dayKey) => ({
    dayKey,
    dayLabel: dayLabel(language, dayKey),
    label: t(language, "closedToday"),
    isOpenDay: false,
    isToday: false,
  }));
}

function getDayData(workingHours, dayKey) {
  if (!workingHours) return null;
  return workingHours[dayKey] || workingHours[SHORT_DAY_KEYS[dayKey]] || null;
}

function normalizeDay(data) {
  if (!data) return { isOpenDay: false, from: "", to: "", label: "" };

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
    .map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function isNowInsideRange(from, to) {
  const start = timeToMinutes(from);
  const end = timeToMinutes(to);
  if (start === null || end === null) return false;

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  if (end < start) return current >= start || current < end;
  return current >= start && current < end;
}

function getTodayWorkingHours(workingHours, language) {
  const dayKey = DAY_KEYS[new Date().getDay()];
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
  return clean ? `https://wa.me/${clean}` : null;
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


function getReadableTextColor(color) {
  const value = String(color || "")
    .trim()
    .replace("#", "");

  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((character) => character + character)
          .join("")
      : value;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return "#ffffff";
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  const brightness =
    (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 165 ? "#111111" : "#ffffff";
}



