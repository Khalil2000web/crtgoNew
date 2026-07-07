"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock,
  Grid2X2,
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

import {
  getBranchHref,
  getSectionHref,
} from "@/app/m/_lib/publicMenuData";
import { getMenuFont } from "@/app/fonts";
import { withLanguageParam } from "../_components/menuUtils";

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
    menu: "القائمة",
    search: "بحث",
    searchPlaceholder: "ابحث...",
    hours: "الساعات",
    branches: "الفروع",
    contact: "تواصل",
    chooseSection: "اختر القسم",
    viewSection: "عرض القسم",
    backToMenu: "رجوع للقائمة",
    today: "اليوم",
    openNow: "مفتوح الآن",
    closedNow: "مغلق الآن",
    closedToday: "مغلق اليوم",
    workingHours: "ساعات العمل",
    noItems: "لا توجد نتائج",
    noItemsText: "جرّب البحث عن شيء آخر.",
    call: "اتصال",
    whatsapp: "واتساب",
    instagram: "إنستغرام",
    facebook: "فيسبوك",
    tiktok: "تيك توك",
    poweredBy: "مدعوم بواسطة CRTGO",
    currentBranch: "الفرع الحالي",
    itemDetails: "تفاصيل الصنف",
    items: "أصناف",
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
    menu: "תפריט",
    search: "חיפוש",
    searchPlaceholder: "חפש...",
    hours: "שעות",
    branches: "סניפים",
    contact: "צור קשר",
    chooseSection: "בחר קטגוריה",
    viewSection: "פתח קטגוריה",
    backToMenu: "חזרה לתפריט",
    today: "היום",
    openNow: "פתוח עכשיו",
    closedNow: "סגור עכשיו",
    closedToday: "סגור היום",
    workingHours: "שעות פעילות",
    noItems: "לא נמצאו תוצאות",
    noItemsText: "נסה לחפש משהו אחר.",
    call: "התקשר",
    whatsapp: "וואטסאפ",
    instagram: "אינסטגרם",
    facebook: "פייסבוק",
    tiktok: "טיקטוק",
    poweredBy: "מופעל על ידי CRTGO",
    currentBranch: "הסניף הנוכחי",
    itemDetails: "פרטי פריט",
    items: "פריטים",
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
    menu: "Menu",
    search: "Search",
    searchPlaceholder: "Search...",
    hours: "Hours",
    branches: "Branches",
    contact: "Contact",
    chooseSection: "Choose section",
    viewSection: "View section",
    backToMenu: "Back to menu",
    today: "Today",
    openNow: "Open now",
    closedNow: "Closed now",
    closedToday: "Closed today",
    workingHours: "Working hours",
    noItems: "No results",
    noItemsText: "Try searching for something else.",
    call: "Call",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    poweredBy: "Powered by CRTGO",
    currentBranch: "Current branch",
    itemDetails: "Item details",
    items: "items",
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

export default function TemplateCleanCards({
  mode = "home",
  business,
  branch,
  menu,
  sections = [],
  branches = [],
  selectedSection = null,
  language = "ar",
  setLanguage,
  enabledLanguages = ["ar"],
  theme,
}) {
  const accent = theme?.primary || menu.primary_color || "#ff7a00";
  const activeLanguage = LANGUAGE_META[language] ? language : "ar";
  const dir = LANGUAGE_META[activeLanguage]?.dir || "rtl";

  const [mounted, setMounted] = useState(false);
  const [sheet, setSheet] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function changeLanguage(nextLanguage) {
    if (!LANGUAGE_META[nextLanguage]) return;
    if (!enabledLanguages.includes(nextLanguage)) return;

    setLanguage?.(nextLanguage);
  }

  const businessName = pickText(
    business,
    "name",
    "name_i18n",
    activeLanguage
  );
  const branchName = pickText(branch, "name", "name_i18n", activeLanguage);
  const branchAddress = pickText(
    branch,
    "address",
    "address_i18n",
    activeLanguage
  );

  const logo = menu.logo_url || business.logo_url;
  const cover = menu.cover_url || getSectionImage(sections?.[0]);

  const today = mounted
    ? getTodayWorkingHours(branch.working_hours, activeLanguage)
    : null;

  const socialLinks = buildSocialLinks(branch, activeLanguage);

  const activeBranches = useMemo(() => {
    return [...(branches || [])]
      .filter((item) => item.status !== "archived")
      .sort((a, b) => Number(b.is_main) - Number(a.is_main));
  }, [branches]);

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return sections;

    return sections.filter((section) => {
      const sectionName = pickText(
        section,
        "name_ar",
        "name_i18n",
        activeLanguage
      );

      const itemText = (section.items || [])
        .map((item) =>
          [
            pickText(item, "name_ar", "name_i18n", activeLanguage),
            pickText(
              item,
              "description_ar",
              "description_i18n",
              activeLanguage
            ),
          ]
            .filter(Boolean)
            .join(" ")
        )
        .join(" ");

      return `${sectionName} ${itemText}`.toLowerCase().includes(q);
    });
  }, [sections, query, activeLanguage]);

  const visibleItems = useMemo(() => {
    const baseItems = selectedSection?.items || [];
    const q = query.trim().toLowerCase();

    if (!q) return baseItems;

    return baseItems.filter((item) => {
      const name = pickText(item, "name_ar", "name_i18n", activeLanguage);
      const description = pickText(
        item,
        "description_ar",
        "description_i18n",
        activeLanguage
      );

      return `${name} ${description} ${item.price}`.toLowerCase().includes(q);
    });
  }, [selectedSection, query, activeLanguage]);

  return (
    <main
      dir={dir}
      className="min-h-screen bg-[#f7f4ef] pb-24 text-black"
      style={{
        fontFamily: getMenuFont("clean"),
      }}
    >
      {mode === "home" ? (
        <HomeView
          business={business}
          branch={branch}
          businessName={businessName}
          branchName={branchName}
          branchAddress={branchAddress}
          logo={logo}
          cover={cover}
          today={today}
          accent={accent}
          language={activeLanguage}
          enabledLanguages={enabledLanguages}
          changeLanguage={changeLanguage}
          sections={sections}
        />
      ) : (
        <SectionView
          business={business}
          branch={branch}
          section={selectedSection}
          items={visibleItems}
          accent={accent}
          language={activeLanguage}
          query={query}
          setQuery={setQuery}
          openItem={(item) => setSelectedItem(item)}
        />
      )}

      <BottomNav
        mode={mode}
        language={activeLanguage}
        accent={accent}
        business={business}
        branch={branch}
        showBranches={activeBranches.length > 1}
        onSearch={() => setSheet("search")}
        onHours={() => setSheet("hours")}
        onBranches={() => setSheet("branches")}
        onContact={() => setSheet("contact")}
      />

      <BottomSheet
        open={sheet === "search"}
        title={t(activeLanguage, "search")}
        onClose={() => setSheet(null)}
      >
        <SearchPanel
          mode={mode}
          business={business}
          branch={branch}
          sections={filteredSections}
          items={visibleItems}
          selectedSection={selectedSection}
          language={activeLanguage}
          query={query}
          setQuery={setQuery}
          accent={accent}
          openItem={(item) => {
            setSelectedItem(item);
            setSheet(null);
          }}
        />
      </BottomSheet>

      <BottomSheet
        open={sheet === "hours"}
        title={t(activeLanguage, "workingHours")}
        onClose={() => setSheet(null)}
      >
        <WorkingHoursPanel
          workingHours={branch.working_hours}
          language={activeLanguage}
          accent={accent}
        />
      </BottomSheet>

      <BottomSheet
        open={sheet === "branches"}
        title={t(activeLanguage, "branches")}
        onClose={() => setSheet(null)}
      >
        <BranchPanel
          business={business}
          currentBranch={branch}
          branches={activeBranches}
          language={activeLanguage}
          accent={accent}
        />
      </BottomSheet>

      <BottomSheet
        open={sheet === "contact"}
        title={t(activeLanguage, "contact")}
        onClose={() => setSheet(null)}
      >
        <ContactPanel
          socialLinks={socialLinks}
          branchAddress={branchAddress}
          language={activeLanguage}
        />
      </BottomSheet>

      <BottomSheet
        open={Boolean(selectedItem)}
        title={t(activeLanguage, "itemDetails")}
        onClose={() => setSelectedItem(null)}
      >
        {selectedItem && (
          <ItemDetails
            item={selectedItem}
            language={activeLanguage}
            accent={accent}
          />
        )}
      </BottomSheet>

      <style>{`
        @keyframes crtgoRise {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes crtgoSheet {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .crtgo-rise {
          animation: crtgoRise .42s ease both;
        }

        .crtgo-sheet {
          animation: crtgoSheet .22s ease both;
        }
      `}</style>
    </main>
  );
}

function HomeView({
  business,
  branch,
  businessName,
  branchName,
  branchAddress,
  logo,
  cover,
  today,
  accent,
  language,
  enabledLanguages,
  changeLanguage,
  sections,
}) {
  return (
    <>
      <header className="px-4 pb-3 pt-4">
        <section className="relative mx-auto max-w-5xl overflow-hidden rounded-[34px] bg-black text-white shadow-sm">
          <div className="relative min-h-[330px]">
            {cover ? (
              <Image
                src={cover}
                alt={businessName}
                fill
                priority
                sizes="100vw"
                className="pointer-events-none select-none object-cover opacity-70"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at top, ${accent}55, transparent 55%), #111`,
                }}
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

            <div className="relative z-10 flex min-h-[330px] flex-col justify-between p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-white/65 backdrop-blur-xl">
                  CRTGO
                </div>

                <LanguageSwitcher
                  enabledLanguages={enabledLanguages}
                  language={language}
                  changeLanguage={changeLanguage}
                  accent={accent}
                />
              </div>

              <div>
                <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[24px] border border-white/15 bg-white/15 backdrop-blur-xl">
                  {logo ? (
                    <Image
                      src={logo}
                      alt={businessName}
                      fill
                      priority
                      sizes="80px"
                      className="pointer-events-none object-cover"
                    />
                  ) : (
                    <Store size={30} />
                  )}
                </div>

                <h1 className="mt-4 text-5xl font-black tracking-[-0.07em]">
                  {businessName}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-white/65">
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

                {today && (
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-3 py-1.5 text-xs font-black"
                      style={{
                        backgroundColor: today.isOpenNow
                          ? accent
                          : "rgba(255,255,255,.15)",
                        color: today.isOpenNow ? "#000" : "#fff",
                      }}
                    >
                      {today.isOpenNow
                        ? t(language, "openNow")
                        : t(language, "closedNow")}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white/75">
                      {today.dayLabel}: {today.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-5">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p
              className="text-xs font-black uppercase tracking-[0.2em] text-black/35"
              dir="ltr"
            >
              {t(language, "menu")}
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-[-0.05em]">
              {t(language, "chooseSection")}
            </h2>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {(sections || []).map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              business={business}
              branch={branch}
              language={language}
              accent={accent}
              index={index}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function SectionView({
  business,
  branch,
  section,
  items,
  accent,
  language,
  query,
  setQuery,
  openItem,
}) {
  const sectionName = pickText(section, "name_ar", "name_i18n", language);
  const image = getSectionImage(section);

  return (
    <>
      <header className="px-4 pb-3 pt-4">
        <section className="mx-auto max-w-4xl">
          <Link
            prefetch={true}
            href={withLanguageParam(
              getBranchHref(business.slug, branch.slug),
              language
            )}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-black shadow-sm"
          >
            <ArrowLeft size={16} />
            {t(language, "backToMenu")}
          </Link>

          <div className="relative overflow-hidden rounded-[34px] bg-black text-white">
            <div className="relative min-h-[230px]">
              {image ? (
                <Image
                  src={image}
                  alt={sectionName}
                  fill
                  priority
                  sizes="100vw"
                  className="pointer-events-none object-cover opacity-70"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at top, ${accent}55, transparent 55%), #111`,
                  }}
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

              <div className="relative z-10 flex min-h-[230px] flex-col justify-end p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">
                  {t(language, "menu")}
                </p>

                <h1 className="mt-2 text-5xl font-black tracking-[-0.07em]">
                  {sectionName}
                </h1>

                <p className="mt-2 text-sm font-bold text-white/55">
                  {items.length} {t(language, "items")}
                </p>
              </div>
            </div>
          </div>

          <label className="mt-4 flex min-h-12 items-center gap-3 rounded-2xl bg-white px-4 shadow-sm">
            <Search size={18} className="text-black/35" />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(language, "searchPlaceholder")}
              className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-black/35"
            />
          </label>
        </section>
      </header>

      <section className="mx-auto max-w-4xl px-4 pb-6 pt-2">
        {items.length ? (
          <div className="grid gap-3">
            {items.map((item, index) => (
              <ItemRow
                key={item.id}
                item={item}
                language={language}
                accent={accent}
                index={index}
                onClick={() => openItem(item)}
              />
            ))}
          </div>
        ) : (
          <EmptyState language={language} />
        )}
      </section>
    </>
  );
}

function SectionCard({ section, business, branch, language, accent, index }) {
  const name = pickText(section, "name_ar", "name_i18n", language);
  const image = getSectionImage(section);

  return (
    <Link
      prefetch={true}
      href={withLanguageParam(
        getSectionHref(business.slug, branch.slug, section.slug),
        language
      )}
      className="crtgo-rise group overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      style={{
        animationDelay: `${index * 55}ms`,
      }}
    >
      <div className="relative aspect-[16/10] bg-black/5">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="pointer-events-none object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <Grid2X2 size={36} className="opacity-25" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-2xl font-black tracking-[-0.05em]">
            {name}
          </h3>

          <p className="mt-1 text-sm font-bold text-black/40">
            {(section.items || []).length} {t(language, "items")}
          </p>
        </div>

        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
          style={{
            backgroundColor: accent,
            color: "#000",
          }}
        >
          <ArrowUpRight size={18} />
        </span>
      </div>
    </Link>
  );
}

function ItemRow({ item, language, accent, index, onClick }) {
  const name = pickText(item, "name_ar", "name_i18n", language);
  const description = pickText(
    item,
    "description_ar",
    "description_i18n",
    language
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="crtgo-rise grid min-h-[96px] w-full grid-cols-[76px_1fr] gap-3 rounded-[24px] border border-black/10 bg-white p-3 text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      style={{
        animationDelay: `${index * 45}ms`,
      }}
    >
      <div className="relative overflow-hidden rounded-[18px] bg-black/5">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={name}
            fill
            sizes="76px"
            className="pointer-events-none object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <Menu size={24} className="opacity-25" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-center">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-lg font-black leading-6">
            {name}
          </h3>

          <p
            className="shrink-0 rounded-full px-3 py-1 text-sm font-black"
            style={{
              backgroundColor: `${accent}20`,
              color: accent,
            }}
          >
            {priceLabel(item.price)}
          </p>
        </div>

        {description && (
          <p className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-black/45">
            {description}
          </p>
        )}
      </div>
    </button>
  );
}

function BottomNav({
  mode,
  language,
  accent,
  business,
  branch,
  showBranches,
  onSearch,
  onHours,
  onBranches,
  onContact,
}) {
  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 mx-auto max-w-md rounded-[26px] border border-black/10 bg-white/90 p-2 shadow-2xl shadow-black/15 backdrop-blur-2xl">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: showBranches
            ? "repeat(5, minmax(0, 1fr))"
            : "repeat(4, minmax(0, 1fr))",
        }}
      >
        <Link
          prefetch={true}
          href={withLanguageParam(
            getBranchHref(business.slug, branch.slug),
            language
          )}
          className="grid min-h-14 place-items-center rounded-2xl text-xs font-black text-black/55"
        >
          <Menu size={19} />
          {t(language, "menu")}
        </Link>

        <button
          type="button"
          onClick={onSearch}
          className="grid min-h-14 place-items-center rounded-2xl text-xs font-black text-black/55"
        >
          <Search size={19} />
          {t(language, "search")}
        </button>

        <button
          type="button"
          onClick={onHours}
          className="grid min-h-14 place-items-center rounded-2xl text-xs font-black"
          style={{
            backgroundColor: `${accent}18`,
            color: accent,
          }}
        >
          <Clock size={19} />
          {t(language, "hours")}
        </button>

        {showBranches && (
          <button
            type="button"
            onClick={onBranches}
            className="grid min-h-14 place-items-center rounded-2xl text-xs font-black text-black/55"
          >
            <Store size={19} />
            {t(language, "branches")}
          </button>
        )}

        <button
          type="button"
          onClick={onContact}
          className="grid min-h-14 place-items-center rounded-2xl text-xs font-black text-black/55"
        >
          <Phone size={19} />
          {t(language, "contact")}
        </button>
      </div>
    </nav>
  );
}

function BottomSheet({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-end bg-black/45 p-3">
      <div className="crtgo-sheet max-h-[86vh] w-full overflow-hidden rounded-[30px] bg-[#f7f4ef] text-black shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-black/10 bg-[#f7f4ef]/90 p-4 backdrop-blur-xl">
          <h2 className="text-2xl font-black tracking-[-0.05em]">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full bg-black text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[calc(86vh-76px)] overflow-y-auto p-4 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function SearchPanel({
  mode,
  business,
  branch,
  sections,
  items,
  language,
  query,
  setQuery,
  accent,
  openItem,
}) {
  return (
    <div>
      <label className="flex min-h-12 items-center gap-3 rounded-2xl bg-white px-4 shadow-sm">
        <Search size={18} className="text-black/35" />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(language, "searchPlaceholder")}
          autoFocus
          className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-black/35"
        />
      </label>

      {mode === "home" ? (
        <div className="mt-4 grid gap-3">
          {sections.length ? (
            sections.map((section, index) => (
              <SectionCard
                key={section.id}
                section={section}
                business={business}
                branch={branch}
                language={language}
                accent={accent}
                index={index}
              />
            ))
          ) : (
            <EmptyState language={language} />
          )}
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {items.length ? (
            items.map((item, index) => (
              <ItemRow
                key={item.id}
                item={item}
                language={language}
                accent={accent}
                index={index}
                onClick={() => openItem(item)}
              />
            ))
          ) : (
            <EmptyState language={language} />
          )}
        </div>
      )}
    </div>
  );
}

function WorkingHoursPanel({ workingHours, language, accent }) {
  const today = getTodayWorkingHours(workingHours, language);
  const hours = getFullWorkingHours(workingHours, language);

  return (
    <div>
      <div className="rounded-[24px] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-black/35">
              {t(language, "today")}
            </p>

            <h3 className="mt-1 text-2xl font-black tracking-[-0.05em]">
              {today.dayLabel}
            </h3>

            <p className="mt-1 text-sm font-bold text-black/45">
              {today.label}
            </p>
          </div>

          <span
            className="rounded-full px-3 py-1.5 text-xs font-black"
            style={{
              backgroundColor: today.isOpenNow ? accent : "#111",
              color: today.isOpenNow ? "#000" : "#fff",
            }}
          >
            {today.isOpenNow
              ? t(language, "openNow")
              : t(language, "closedNow")}
          </span>
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        {hours.map((day) => (
          <div
            key={day.dayKey}
            className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 text-sm font-bold shadow-sm"
          >
            <span className={day.isToday ? "font-black" : "text-black/60"}>
              {day.dayLabel}
            </span>

            <span className={day.isOpenDay ? "text-black" : "text-black/35"}>
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BranchPanel({ business, currentBranch, branches, language, accent }) {
  return (
    <div className="grid gap-2">
      {branches.map((branch) => {
        const active = branch.id === currentBranch.id;

        return (
          <Link
            prefetch={true}
            key={branch.id}
            href={withLanguageParam(
              getBranchHref(business.slug, branch.slug),
              language
            )}
            className="flex min-h-14 items-center justify-between gap-4 rounded-2xl bg-white px-4 text-sm font-black shadow-sm"
            style={{
              color: active ? accent : "#000",
            }}
          >
            <span>{pickText(branch, "name", "name_i18n", language)}</span>

            {active ? (
              <span className="rounded-full bg-black/5 px-3 py-1 text-xs">
                {t(language, "currentBranch")}
              </span>
            ) : (
              <ArrowUpRight size={17} />
            )}
          </Link>
        );
      })}
    </div>
  );
}

function ContactPanel({ socialLinks, branchAddress, language }) {
  return (
    <div className="grid gap-2">
      {branchAddress && (
        <div className="rounded-2xl bg-white p-4 text-sm font-bold text-black/60 shadow-sm">
          <MapPin size={17} className="mb-2 text-black" />
          {branchAddress}
        </div>
      )}

      {socialLinks.length ? (
        socialLinks.map((link) => (
          <a
            key={link.key}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noreferrer" : undefined}
            className="flex min-h-14 items-center justify-between gap-4 rounded-2xl bg-white px-4 text-sm font-black shadow-sm"
          >
            <span className="inline-flex items-center gap-2">
              {socialIcon(link.key)}
              {link.label}
            </span>

            <ArrowUpRight size={17} />
          </a>
        ))
      ) : (
        <EmptyState language={language} />
      )}
    </div>
  );
}

function ItemDetails({ item, language, accent }) {
  const name = pickText(item, "name_ar", "name_i18n", language);
  const description = pickText(
    item,
    "description_ar",
    "description_i18n",
    language
  );

  return (
    <article>
      <div className="relative aspect-[16/11] overflow-hidden rounded-[24px] bg-white shadow-sm">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={name}
            fill
            sizes="100vw"
            className="pointer-events-none object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <Menu size={38} className="opacity-25" />
          </div>
        )}
      </div>

      <div className="mt-4 rounded-[24px] bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-3xl font-black tracking-[-0.06em]">{name}</h3>

          <p
            className="shrink-0 rounded-full px-3 py-1 text-sm font-black"
            style={{
              backgroundColor: `${accent}20`,
              color: accent,
            }}
          >
            {priceLabel(item.price)}
          </p>
        </div>

        {description && (
          <p className="mt-3 text-sm font-bold leading-7 text-black/55">
            {description}
          </p>
        )}
      </div>
    </article>
  );
}

function LanguageSwitcher({
  enabledLanguages,
  language,
  changeLanguage,
  accent,
}) {
  if (!enabledLanguages || enabledLanguages.length <= 1) return null;

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-white/15 p-1 backdrop-blur-xl">
      <Languages size={15} className="mx-1 text-white/60" />

      {enabledLanguages.map((code) => {
        const active = code === language;
        const meta = LANGUAGE_META[code];

        if (!meta) return null;

        return (
          <button
            key={code}
            type="button"
            onClick={() => changeLanguage(code)}
            className="min-h-8 rounded-full px-3 text-xs font-black"
            style={{
              backgroundColor: active ? "#fff" : "transparent",
              color: active ? "#000" : "rgba(255,255,255,.75)",
            }}
          >
            {meta.short}
          </button>
        );
      })}
    </div>
  );
}

function EmptyState({ language }) {
  return (
    <div className="rounded-[24px] bg-white p-8 text-center shadow-sm">
      <Search className="mx-auto text-black/25" size={38} />

      <h3 className="mt-4 text-2xl font-black tracking-[-0.05em]">
        {t(language, "noItems")}
      </h3>

      <p className="mt-2 text-sm font-bold text-black/45">
        {t(language, "noItemsText")}
      </p>
    </div>
  );
}

function t(language, key) {
  return UI[language]?.[key] || UI.ar[key] || key;
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

function priceLabel(price) {
  const number = Number(price || 0);

  if (Number.isInteger(number)) return `₪${number}`;

  return `₪${number.toFixed(1)}`;
}

function getSectionImage(section) {
  return (
    section?.cover_url ||
    section?.items?.find((item) => item.image_url)?.image_url ||
    null
  );
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

  return current >= start && current <= end;
}

function getTodayWorkingHours(workingHours, language) {
  const now = new Date();
  const dayKey = DAY_KEYS[now.getDay()];
  const day = normalizeDay(getDayData(workingHours, dayKey));

  if (!day.isOpenDay) {
    return {
      dayKey,
      dayLabel: UI[language]?.days?.[dayKey] || dayKey,
      label: t(language, "closedToday"),
      isOpenNow: false,
      isOpenDay: false,
    };
  }

  return {
    dayKey,
    dayLabel: UI[language]?.days?.[dayKey] || dayKey,
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
      dayLabel: UI[language]?.days?.[dayKey] || dayKey,
      label: day.isOpenDay ? day.label : t(language, "closedToday"),
      isOpenDay: day.isOpenDay,
      isToday: dayKey === todayKey,
    };
  });
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

function buildSocialLinks(branch, language) {
  const links = [
    {
      key: "phone",
      label: t(language, "call"),
      href: normalizeUrl(branch.phone, "phone"),
      external: false,
    },
    {
      key: "whatsapp",
      label: t(language, "whatsapp"),
      href: normalizeUrl(branch.whatsapp, "whatsapp"),
      external: true,
    },
    {
      key: "instagram",
      label: t(language, "instagram"),
      href: normalizeUrl(branch.instagram, "instagram"),
      external: true,
    },
    {
      key: "facebook",
      label: t(language, "facebook"),
      href: normalizeUrl(branch.facebook, "facebook"),
      external: true,
    },
    {
      key: "tiktok",
      label: t(language, "tiktok"),
      href: normalizeUrl(branch.tiktok, "tiktok"),
      external: true,
    },
  ];

  return links.filter((link) => link.href);
}

function socialIcon(key) {
  if (key === "phone") return <Phone size={16} />;
  if (key === "whatsapp") return <FaWhatsapp size={17} />;
  if (key === "instagram") return <FaInstagram size={17} />;
  if (key === "facebook") return <FaFacebookF size={16} />;
  if (key === "tiktok") return <FaTiktok size={16} />;

  return <ArrowUpRight size={16} />;
}