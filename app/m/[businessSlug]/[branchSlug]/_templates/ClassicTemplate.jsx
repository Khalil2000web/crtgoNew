"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Clock,
  Languages,
  MapPin,
  Menu,
  Phone,
  Search,
  Store,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";

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
  sections,
  branches = [],
  language,
  setLanguage,
  enabledLanguages,
  theme,
}) {
  const [query, setQuery] = useState("");
  const [activeSectionId, setActiveSectionId] = useState(sections?.[0]?.id || null);

  const lang = LANGUAGE_META[language] ? language : "ar";
  const dir = LANGUAGE_META[lang]?.dir || "rtl";

  const businessName = pickText(business, "name", "name_i18n", lang);
  const branchName = pickText(branch, "name", "name_i18n", lang);
  const branchAddress = pickText(branch, "address", "address_i18n", lang);
  const description = pickText(menu, "description_ar", "description_i18n", lang);

  const logo = menu.logo_url || business.logo_url;
  const cover = menu.cover_url;

  const today = getTodayWorkingHours(branch.working_hours, lang);
  const fullHours = getFullWorkingHours(branch.working_hours, lang);

  const socialLinks = buildSocialLinks(branch, lang);

  const filteredSections = useMemo(() => {
    return filterSections(sections || [], query, lang);
  }, [sections, query, lang]);

  const visibleBranches = useMemo(() => {
    return (branches || [])
      .filter((item) => item?.slug && item.status !== "archived")
      .sort((a, b) => Number(b.is_main) - Number(a.is_main));
  }, [branches]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.dataset?.sectionId) {
          setActiveSectionId(visible.target.dataset.sectionId);
        }
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5],
      }
    );

    const elements = document.querySelectorAll("[data-menu-section]");

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [filteredSections]);

  return (
    <main
      dir={dir}
      className="min-h-screen overflow-x-hidden"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          {cover ? (
            <TemplateImage
              src={cover}
              alt={businessName}
              priority
              sizes="100vw"
              className="opacity-80"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `radial-gradient(circle at 30% 0%, ${theme.primary}55, transparent 35rem), radial-gradient(circle at 80% 20%, rgba(255,255,255,.08), transparent 26rem), #0b0b0b`,
              }}
            />
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />

        <section className="relative mx-auto flex min-h-[470px] w-full max-w-6xl flex-col justify-between px-4 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div
              className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/75 backdrop-blur-xl"
              dir="ltr"
            >
              CRTGO
            </div>

            <LanguageSwitcher
              enabledLanguages={enabledLanguages}
              language={lang}
              setLanguage={setLanguage}
              theme={theme}
            />
          </div>

          <div className="pb-4 pt-20">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[36px] border border-white/15 bg-white/10 shadow-2xl shadow-black/40 backdrop-blur-xl">
                {logo ? (
                  <TemplateImage
                    src={logo}
                    alt={businessName}
                    priority
                    sizes="112px"
                  />
                ) : (
                  <Store size={38} />
                )}
              </div>

              <div className="min-w-0">
                <p
                  className="inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em]"
                  style={{
                    backgroundColor: `${theme.primary}22`,
                    color: theme.primary,
                  }}
                >
                  {t(lang, "digitalMenu")}
                </p>

                <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.08em] text-white sm:text-7xl">
                  {businessName}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-black text-white/70">
                  <span>{branchName}</span>

                  {branchAddress && (
                    <>
                      <span className="text-white/25">•</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={15} />
                        {branchAddress}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {description && (
              <p className="mt-6 max-w-2xl text-lg font-bold leading-8 text-white/75">
                {description}
              </p>
            )}

            <div className="mt-7 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <TodayStatusCard today={today} lang={lang} theme={theme} />

              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {socialLinks.slice(0, 4).map((link) => (
                    <HeroSocialLink key={link.key} link={link} theme={theme} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </header>

      <section className="sticky top-0 z-40 border-b border-white/10 bg-black/65 backdrop-blur-2xl">
        <div className="mx-auto grid max-w-6xl gap-3 px-4 py-3 sm:px-6">
          <SearchBox
            query={query}
            setQuery={setQuery}
            lang={lang}
          />

          <SectionNav
            sections={sections || []}
            activeSectionId={activeSectionId}
            language={lang}
            theme={theme}
          />
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid min-w-0 gap-10">
          {filteredSections.length ? (
            filteredSections.map((section) => (
              <section
                key={section.id}
                id={`section-${section.id}`}
                data-menu-section
                data-section-id={section.id}
                className="scroll-mt-36"
              >
                <div className="mb-4 flex items-end justify-between gap-4 border-b border-white/10 pb-3">
                  <div className="min-w-0">
                    <p
                      className="text-xs font-black uppercase tracking-[0.18em] opacity-35"
                      dir="ltr"
                    >
                      {t(lang, "menu")}
                    </p>

                    <h2 className="mt-1 text-4xl font-black tracking-[-0.07em]">
                      {pickText(section, "name_ar", "name_i18n", lang)}
                    </h2>
                  </div>

                  <span
                    className="shrink-0 rounded-full px-3 py-1 text-xs font-black"
                    style={{
                      backgroundColor: `${theme.primary}18`,
                      color: theme.primary,
                    }}
                  >
                    {(section.items || []).length}
                  </span>
                </div>

                <div className="grid gap-3">
                  {(section.items || []).map((item) => (
                    <TemplateOneItem
                      key={item.id}
                      item={item}
                      language={lang}
                      theme={theme}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <NoItems lang={lang} />
          )}
        </div>

        <aside className="grid h-fit gap-4 lg:sticky lg:top-32">
          {visibleBranches.length > 1 && (
            <BranchSwitcher
              business={business}
              currentBranch={branch}
              branches={visibleBranches}
              language={lang}
              theme={theme}
            />
          )}

          <WorkingHoursBlock
            today={today}
            fullHours={fullHours}
            language={lang}
            theme={theme}
          />

          {socialLinks.length > 0 && (
            <ContactBlock links={socialLinks} language={lang} theme={theme} />
          )}
        </aside>
      </section>

      <SharedFooter
        businessName={businessName}
        branchAddress={branchAddress}
        socialLinks={socialLinks}
        language={lang}
      />

      {socialLinks.length > 0 && (
        <MobileQuickActions links={socialLinks} language={lang} theme={theme} />
      )}
    </main>
  );
}

function TemplateOneItem({ item, language, theme }) {
  const name = pickText(item, "name_ar", "name_i18n", language);
  const description = pickText(
    item,
    "description_ar",
    "description_i18n",
    language
  );

  return (
    <article className="group grid min-w-0 gap-4 rounded-[30px] border border-white/10 bg-white/[0.045] p-3 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.065] sm:grid-cols-[132px_minmax(0,1fr)]">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[24px] bg-white/[0.045]">
        {item.image_url ? (
          <TemplateImage
            src={item.image_url}
            alt={name}
            sizes="132px"
          />
        ) : (
          <Menu size={30} className="opacity-25" />
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-center px-1 py-1 sm:px-2">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-2xl font-black leading-tight tracking-[-0.05em]">
              {name}
            </h3>

            {description && (
              <p className="mt-2 text-sm font-bold leading-7 opacity-55">
                {description}
              </p>
            )}
          </div>

          <p
            className="shrink-0 self-start rounded-2xl px-3 py-1.5 text-lg font-black"
            style={{
              backgroundColor: `${theme.primary}20`,
              color: theme.primary,
            }}
          >
            {formatPrice(item.price)}
          </p>
        </div>
      </div>
    </article>
  );
}

function SearchBox({ query, setQuery, lang }) {
  return (
    <div className="relative">
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
      />

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t(lang, "search")}
        className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.07] px-11 text-sm font-black text-white outline-none placeholder:text-white/35 transition focus:border-white/25"
      />
    </div>
  );
}

function SectionNav({ sections, activeSectionId, language, theme }) {
  if (!sections.length) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {sections.map((section) => {
        const active = String(activeSectionId) === String(section.id);
        const label = pickText(section, "name_ar", "name_i18n", language);

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollToSection(section.id)}
            className="inline-flex min-h-10 shrink-0 items-center rounded-2xl border px-4 text-sm font-black transition"
            style={{
              borderColor: active ? theme.primary : "rgba(255,255,255,.12)",
              backgroundColor: active ? theme.primary : "rgba(255,255,255,.06)",
              color: active ? "#000000" : "rgba(255,255,255,.75)",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function TodayStatusCard({ today, lang, theme }) {
  return (
    <div className="inline-flex max-w-full items-center gap-3 rounded-[24px] border border-white/10 bg-white/10 p-3 pr-4 text-white backdrop-blur-xl">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: `${theme.primary}22`,
          color: theme.primary,
        }}
      >
        <Clock size={20} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-white/40">
          {t(lang, "today")}
        </p>

        <p className="truncate text-sm font-black">
          {today.dayLabel}: {today.label}
        </p>
      </div>

      <span
        className="ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-black"
        style={{
          backgroundColor: today.isOpenNow
            ? `${theme.primary}28`
            : "rgba(255,255,255,.08)",
          color: today.isOpenNow ? theme.primary : "rgba(255,255,255,.65)",
        }}
      >
        {today.isOpenNow ? t(lang, "openNow") : t(lang, "closedNow")}
      </span>
    </div>
  );
}

function WorkingHoursBlock({ today, fullHours, language, theme }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] opacity-40">
            <Clock size={15} />
            {t(language, "workingHours")}
          </p>

          <h2 className="mt-3 text-2xl font-black tracking-[-0.05em]">
            {today.label}
          </h2>
        </div>

        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-black"
          style={{
            backgroundColor: today.isOpenNow
              ? `${theme.primary}22`
              : "rgba(255,255,255,.08)",
            color: today.isOpenNow ? theme.primary : "rgba(255,255,255,.55)",
          }}
        >
          {today.isOpenNow ? t(language, "openNow") : t(language, "closedNow")}
        </span>
      </div>

      <div className="mt-5 grid gap-2">
        {fullHours.map((day) => (
          <div
            key={day.dayKey}
            className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-bold ${
              day.isToday
                ? "border-white/20 bg-white/[0.08]"
                : "border-white/10 bg-black/20"
            }`}
          >
            <span className={day.isToday ? "font-black" : "opacity-70"}>
              {day.dayLabel}
            </span>

            <span className={day.isOpenDay ? "opacity-90" : "opacity-35"}>
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function BranchSwitcher({ business, currentBranch, branches, language, theme }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.18em] opacity-40">
        {t(language, "branches")}
      </p>

      <h2 className="mt-3 text-2xl font-black tracking-[-0.05em]">
        {t(language, "switchBranch")}
      </h2>

      <div className="mt-5 grid gap-2">
        {branches.map((item) => {
          const active = item.id === currentBranch.id;

          return (
            <Link
              key={item.id}
              href={getBranchHref(business.slug, item.slug)}
              className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border px-4 text-sm font-black transition"
              style={{
                borderColor: active ? theme.primary : "rgba(255,255,255,.1)",
                backgroundColor: active ? `${theme.primary}18` : "rgba(0,0,0,.18)",
                color: active ? theme.primary : "rgba(255,255,255,.7)",
              }}
            >
              <span>{pickText(item, "name", "name_i18n", language)}</span>

              {active ? (
                <span className="text-xs opacity-70">
                  {t(language, "currentBranch")}
                </span>
              ) : (
                <ArrowUpRight size={16} />
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ContactBlock({ links, language }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.18em] opacity-40">
        {t(language, "contact")}
      </p>

      <div className="mt-4 grid gap-2">
        {links.map((link) => (
          <ContactLink key={link.key} link={link} />
        ))}
      </div>
    </section>
  );
}

function HeroSocialLink({ link }) {
  return (
    <a
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noreferrer" : undefined}
      className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-black text-white/80 backdrop-blur-xl transition hover:bg-white/15 hover:text-white"
    >
      {socialIcon(link.key)}
      {link.label}
    </a>
  );
}

function ContactLink({ link }) {
  return (
    <a
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noreferrer" : undefined}
      className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm font-black opacity-75 transition hover:bg-white/[0.07] hover:opacity-100"
    >
      <span className="inline-flex items-center gap-2">
        {socialIcon(link.key)}
        {link.label}
      </span>

      <ArrowUpRight size={16} />
    </a>
  );
}

function SharedFooter({ businessName, branchAddress, socialLinks, language }) {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6 lg:pb-10">
      <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-[-0.05em]">
              {businessName}
            </h2>

            {branchAddress && (
              <p className="mt-2 text-sm font-bold opacity-45">
                {branchAddress}
              </p>
            )}
          </div>

          <p className="text-xs font-black uppercase tracking-[0.18em] opacity-35">
            {t(language, "poweredBy")}
          </p>
        </div>

        {socialLinks.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-5">
            {socialLinks.map((link) => (
              <HeroSocialLink key={link.key} link={link} />
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}

function MobileQuickActions({ links, language, theme }) {
  const primaryLinks = ["phone", "whatsapp", "instagram"]
    .map((key) => links.find((link) => link.key === key))
    .filter(Boolean)
    .slice(0, 3);

  if (!primaryLinks.length) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-50 lg:hidden">
      <div className="grid gap-2 rounded-[26px] border border-white/10 bg-black/75 p-2 shadow-2xl shadow-black/40 backdrop-blur-2xl" style={{
        gridTemplateColumns: `repeat(${primaryLinks.length}, minmax(0, 1fr))`,
      }}>
        {primaryLinks.map((link, index) => (
          <a
            key={link.key}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noreferrer" : undefined}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl text-xs font-black"
            style={{
              backgroundColor: index === 0 ? theme.primary : "rgba(255,255,255,.08)",
              color: index === 0 ? "#000" : "#fff",
            }}
          >
            {socialIcon(link.key)}
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function LanguageSwitcher({
  enabledLanguages,
  language,
  setLanguage,
  theme,
}) {
  if (!enabledLanguages || enabledLanguages.length <= 1) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 p-1 backdrop-blur-xl">
      <Languages size={15} className="mx-1 text-white/50" />

      {enabledLanguages.map((code) => {
        const meta = LANGUAGE_META[code];
        if (!meta) return null;

        const active = code === language;

        return (
          <button
            key={code}
            type="button"
            onClick={() => setLanguage(code)}
            className="min-h-8 rounded-full px-3 text-xs font-black transition"
            style={{
              backgroundColor: active ? theme.primary : "transparent",
              color: active ? "#000" : "rgba(255,255,255,.65)",
            }}
          >
            {meta.short}
          </button>
        );
      })}
    </div>
  );
}

function NoItems({ lang }) {
  return (
    <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-10 text-center">
      <h2 className="text-3xl font-black tracking-[-0.05em]">
        {t(lang, "noItems")}
      </h2>

      <p className="mt-2 text-sm font-bold opacity-45">
        {t(lang, "noItemsText")}
      </p>
    </div>
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

function filterSections(sections, query, language) {
  const q = query.trim().toLowerCase();

  if (!q) return sections;

  return sections
    .map((section) => {
      const sectionName = pickText(section, "name_ar", "name_i18n", language);

      const items = (section.items || []).filter((item) => {
        const itemName = pickText(item, "name_ar", "name_i18n", language);
        const itemDescription = pickText(
          item,
          "description_ar",
          "description_i18n",
          language
        );

        return [sectionName, itemName, itemDescription, item.price]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      });

      return {
        ...section,
        items,
      };
    })
    .filter((section) => section.items.length > 0);
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
  if (key === "phone") return <Phone size={16} />;
  if (key === "whatsapp") return <FaWhatsapp size={16} />;
  if (key === "instagram") return <FaInstagram size={16} />;
  if (key === "facebook") return <FaFacebookF size={15} />;
  if (key === "tiktok") return <FaTiktok size={15} />;

  return <ArrowUpRight size={16} />;
}

function getBranchHref(businessSlug, branchSlug) {
  const cleanLinks = process.env.NEXT_PUBLIC_MENU_CLEAN_LINKS === "true";

  if (cleanLinks) {
    return `/${businessSlug}/${branchSlug}`;
  }

  return `/m/${businessSlug}/${branchSlug}`;
}