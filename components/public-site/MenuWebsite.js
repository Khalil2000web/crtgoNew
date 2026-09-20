'use client';

import { useEffect, useMemo, useState } from "react";
import {
  Globe2,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";

import { PUBLIC_FONT_CLASS } from "./publicFonts";

const LANGUAGE_LABELS = {
  ar: "العربية",
  he: "עברית",
  en: "English",
};

const EMPTY_LABELS = {
  ar: "لا توجد عناصر في القائمة بعد.",
  he: "עדיין אין פריטים בתפריט.",
  en: "There are no menu items yet.",
};

const SEARCH_LABELS = {
  ar: {
    placeholder: "ابحث في القائمة...",
    noResults: "لم نجد أي نتائج.",
  },
  he: {
    placeholder: "חיפוש בתפריט...",
    noResults: "לא נמצאו תוצאות.",
  },
  en: {
    placeholder: "Search the menu...",
    noResults: "No results found.",
  },
};

export default function MenuWebsite({ website }) {
  const enabledLanguages = useMemo(() => {
    const clean = Array.isArray(website?.enabledLanguages)
      ? website.enabledLanguages.filter((language) => LANGUAGE_LABELS[language])
      : [];

    return clean.length ? [...new Set(clean)] : [website?.defaultLanguage || "ar"];
  }, [website]);

  const initialLanguage = enabledLanguages.includes(website?.defaultLanguage)
    ? website.defaultLanguage
    : enabledLanguages[0] || "ar";

  const [language, setLanguage] = useState(initialLanguage);
  const [languagePreferenceReady, setLanguagePreferenceReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const sections = useMemo(
    () => (Array.isArray(website?.sections) ? website.sections : []),
    [website]
  );

  const visibleSections = useMemo(() => {
    const query = normalizeSearch(searchQuery);

    if (!query) return sections;

    return sections
      .map((section) => {
        const sectionName = localized(
          section.nameI18n,
          section.name,
          language,
          website?.defaultLanguage
        );
        const sectionDescription = localized(
          section.descriptionI18n,
          section.description,
          language,
          website?.defaultLanguage
        );

        const sectionMatches = normalizeSearch(
          `${sectionName} ${sectionDescription}`
        ).includes(query);

        const items = Array.isArray(section.items) ? section.items : [];
        const filteredItems = sectionMatches
          ? items
          : items.filter((item) => {
              const itemName = localized(
                item.nameI18n,
                item.name,
                language,
                website?.defaultLanguage
              );
              const itemDescription = localized(
                item.descriptionI18n,
                item.description,
                language,
                website?.defaultLanguage
              );

              return normalizeSearch(
                `${itemName} ${itemDescription}`
              ).includes(query);
            });

        return {
          ...section,
          items: filteredItems,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [language, searchQuery, sections, website?.defaultLanguage]);

  const [activeSection, setActiveSection] = useState(sections[0]?.id || null);

  const direction = language === "en" ? "ltr" : "rtl";
  const fontClass = PUBLIC_FONT_CLASS[language] || PUBLIC_FONT_CLASS.en;
  const palette = useMemo(() => buildPalette(website), [website]);

  const restaurantName = localized(
    website?.nameI18n,
    website?.name,
    language,
    website?.defaultLanguage
  );
  const restaurantDescription = localized(
    website?.descriptionI18n,
    website?.description,
    language,
    website?.defaultLanguage
  );
  const location = localized(
    website?.locationI18n,
    website?.location,
    language,
    website?.defaultLanguage
  );

  useEffect(() => {
    if (!enabledLanguages.includes(language)) {
      setLanguage(enabledLanguages[0] || "ar");
    }
  }, [enabledLanguages, language]);

  useEffect(() => {
    try {
      const storageKey = `crtgo:menu-language:${website?.slug || "default"}`;
      const savedLanguage = window.localStorage.getItem(storageKey);

      if (savedLanguage && enabledLanguages.includes(savedLanguage)) {
        setLanguage(savedLanguage);
      }
    } catch {
      // Local storage may be unavailable in private/restricted browser contexts.
    } finally {
      setLanguagePreferenceReady(true);
    }
  }, [enabledLanguages, website?.slug]);

  useEffect(() => {
    if (!languagePreferenceReady) return;

    try {
      const storageKey = `crtgo:menu-language:${website?.slug || "default"}`;
      window.localStorage.setItem(storageKey, language);
    } catch {
      // Keep language switching functional even when storage is unavailable.
    }
  }, [language, languagePreferenceReady, website?.slug]);

  useEffect(() => {
    if (!visibleSections.length) {
      setActiveSection(null);
      return undefined;
    }

    setActiveSection((current) =>
      visibleSections.some((section) => section.id === current)
        ? current
        : visibleSections[0].id
    );

    const nodes = visibleSections
      .map((section) => document.getElementById(sectionAnchor(section.id)))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.dataset?.sectionId) {
          setActiveSection(visible[0].target.dataset.sectionId);
        }
      },
      {
        rootMargin: "-140px 0px -62% 0px",
        threshold: [0.01, 0.1, 0.25],
      }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [visibleSections, language]);

  function scrollToSection(id) {
    const node = document.getElementById(sectionAnchor(id));
    if (!node) return;

    setActiveSection(id);
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main
      dir={direction}
      className={`${fontClass} min-h-screen antialiased`}
      style={{
        backgroundColor: palette.background,
        color: palette.text,
      }}
    >
      <header>
        <div
          className="relative h-44 overflow-hidden sm:h-56 lg:h-64"
          style={{ backgroundColor: palette.heroFallback }}
        >
          {website?.coverUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={website.coverUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 to-transparent" />
            </>
          ) : (
            <div
              className="absolute inset-0 opacity-90"
              style={{
                background: `radial-gradient(circle at 15% 20%, ${palette.accentSoft}, transparent 40%), radial-gradient(circle at 85% 80%, ${palette.accentSoft}, transparent 38%), ${palette.heroFallback}`,
              }}
            />
          )}
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-12 flex items-end justify-between gap-4">
            <div
              className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[28px] border-4 shadow-xl sm:h-28 sm:w-28"
              style={{
                backgroundColor: palette.surfaceStrong,
                borderColor: palette.background,
              }}
            >
              {website?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={website.logoUrl}
                  alt={restaurantName || "Restaurant logo"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UtensilsCrossed size={34} style={{ color: palette.accent }} />
              )}
            </div>

            {enabledLanguages.length > 1 && (
              <div
                className="mb-1 flex max-w-[68%] items-center gap-1 overflow-x-auto rounded-2xl border p-1 shadow-sm"
                style={{
                  backgroundColor: palette.surfaceStrong,
                  borderColor: palette.border,
                }}
              >
                <Globe2 size={16} className="mx-1 shrink-0 opacity-50" />
                {enabledLanguages.map((item) => {
                  const selected = item === language;
                  return (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setLanguage(item)}
                      className="shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition"
                      style={
                        selected
                          ? { backgroundColor: palette.accent, color: palette.accentText }
                          : { color: palette.muted }
                      }
                    >
                      {LANGUAGE_LABELS[item]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pb-6 pt-5 sm:pb-8">
            <h1 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              {restaurantName}
            </h1>

            {restaurantDescription && (
              <p
                className="mt-3 max-w-2xl text-sm font-medium leading-7 sm:text-base"
                style={{ color: palette.muted }}
              >
                {restaurantDescription}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {location && <InfoPill icon={MapPin} text={location} palette={palette} />}
              {website?.phone && (
                <InfoPill
                  icon={Phone}
                  text={website.phone}
                  href={`tel:${String(website.phone).replace(/[^+\d]/g, "")}`}
                  palette={palette}
                />
              )}
              {website?.whatsapp && (
                <InfoPill
                  icon={MessageCircle}
                  text="WhatsApp"
                  href={whatsappHref(website.whatsapp)}
                  palette={palette}
                />
              )}
              {website?.instagram && (
                <InfoPill
                  icon={FaInstagram}
                  text="Instagram"
                  href={instagramHref(website.instagram)}
                  palette={palette}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {sections.length > 0 && (
        <div className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
          <div
            className="flex items-center gap-3 rounded-2xl border px-4 py-3"
            style={{
              backgroundColor: palette.surfaceStrong,
              borderColor: palette.border,
            }}
          >
            <Search size={18} style={{ color: palette.muted }} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={
                SEARCH_LABELS[language]?.placeholder ||
                SEARCH_LABELS.en.placeholder
              }
              aria-label={
                SEARCH_LABELS[language]?.placeholder ||
                SEARCH_LABELS.en.placeholder
              }
              className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:opacity-60"
              style={{ color: palette.text }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full transition hover:opacity-70"
                style={{ backgroundColor: palette.surface }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      {visibleSections.length > 0 && (
        <nav
          className="sticky top-0 z-30 border-y backdrop-blur-xl"
          style={{
            backgroundColor: withAlpha(palette.background, 0.94),
            borderColor: palette.border,
          }}
          aria-label="Menu categories"
        >
          <div className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
            {visibleSections.map((section) => {
              const selected = activeSection === section.id;
              const title = localized(
                section.nameI18n,
                section.name,
                language,
                website?.defaultLanguage
              );

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className="shrink-0 rounded-full border px-4 py-2 text-sm font-extrabold transition"
                  style={
                    selected
                      ? {
                          backgroundColor: palette.accent,
                          borderColor: palette.accent,
                          color: palette.accentText,
                        }
                      : {
                          backgroundColor: palette.surface,
                          borderColor: palette.border,
                          color: palette.text,
                        }
                  }
                >
                  {title}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        {visibleSections.length ? (
          <div className="space-y-12 sm:space-y-14">
            {visibleSections.map((section) => {
              const sectionName = localized(
                section.nameI18n,
                section.name,
                language,
                website?.defaultLanguage
              );
              const sectionDescription = localized(
                section.descriptionI18n,
                section.description,
                language,
                website?.defaultLanguage
              );
              const items = Array.isArray(section.items) ? section.items : [];

              return (
                <section
                  key={section.id}
                  id={sectionAnchor(section.id)}
                  data-section-id={section.id}
                  className="scroll-mt-28"
                >
                  <div className="mb-5 sm:mb-6">
                    <h2 className="text-2xl font-black tracking-[-0.035em] sm:text-3xl">
                      {sectionName}
                    </h2>
                    {sectionDescription && (
                      <p
                        className="mt-2 max-w-2xl text-sm leading-6"
                        style={{ color: palette.muted }}
                      >
                        {sectionDescription}
                      </p>
                    )}
                  </div>

                  {items.length ? (
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                      {items.map((item) => (
                        <MenuItem
                          key={item.id}
                          item={item}
                          language={language}
                          defaultLanguage={website?.defaultLanguage}
                          currency={website?.currency || "ILS"}
                          palette={palette}
                        />
                      ))}
                    </div>
                  ) : (
                    <div
                      className="rounded-3xl border p-6 text-sm font-semibold"
                      style={{
                        backgroundColor: palette.surface,
                        borderColor: palette.border,
                        color: palette.muted,
                      }}
                    >
                      {EMPTY_LABELS[language] || EMPTY_LABELS.en}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          <div
            className="rounded-[28px] border p-8 text-center text-sm font-semibold"
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.border,
              color: palette.muted,
            }}
          >
            {searchQuery
              ? SEARCH_LABELS[language]?.noResults || SEARCH_LABELS.en.noResults
              : EMPTY_LABELS[language] || EMPTY_LABELS.en}
          </div>
        )}
      </div>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-9 pt-3 sm:px-6 lg:px-8">
        <div
          className="border-t pt-6 text-center text-xs font-bold tracking-[0.18em]"
          style={{ borderColor: palette.border, color: palette.muted }}
        >
          POWERED BY CRTGO
        </div>
      </footer>
    </main>
  );
}

function MenuItem({ item, language, defaultLanguage, currency, palette }) {
  const name = localized(item.nameI18n, item.name, language, defaultLanguage);
  const description = localized(
    item.descriptionI18n,
    item.description,
    language,
    defaultLanguage
  );

  return (
    <article
      className="flex min-h-32 overflow-hidden rounded-[24px] border shadow-[0_8px_30px_rgba(0,0,0,0.035)]"
      style={{ backgroundColor: palette.surfaceStrong, borderColor: palette.border }}
    >
      <div className="min-w-0 flex-1 p-4 sm:p-5">
        <div className="flex h-full flex-col">
          <h3 className="text-base font-black leading-6 sm:text-lg">{name}</h3>

          {description && (
            <p className="mt-1.5 text-sm leading-6" style={{ color: palette.muted }}>
              {description}
            </p>
          )}

          <div className="mt-auto pt-4 text-sm font-black" style={{ color: palette.accent }}>
            {formatPrice(item.price, currency, language)}
          </div>
        </div>
      </div>

      {item.imageUrl && (
        <div className="w-28 shrink-0 sm:w-36">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={name || ""}
            loading="lazy"
            className="h-full min-h-32 w-full object-cover"
          />
        </div>
      )}
    </article>
  );
}

function InfoPill({ icon: Icon, text, href, palette }) {
  const classes = "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold";
  const style = {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    color: palette.muted,
  };

  if (href) {
    return (
      <a className={classes} style={style} href={href} target="_blank" rel="noreferrer">
        <Icon size={14} />
        <span>{text}</span>
      </a>
    );
  }

  return (
    <span className={classes} style={style}>
      <Icon size={14} />
      <span>{text}</span>
    </span>
  );
}

function normalizeSearch(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase()
    .normalize("NFKD");
}

function localized(translations, fallback, language, defaultLanguage) {
  const current = String(translations?.[language] || "").trim();
  if (current) return current;

  const preferredFallback = String(translations?.[defaultLanguage] || "").trim();
  if (preferredFallback) return preferredFallback;

  return String(fallback || "").trim();
}

function formatPrice(value, currency, language) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";

  const locale = language === "ar" ? "ar-IL" : language === "he" ? "he-IL" : "en-IL";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "ILS",
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency || "ILS"}`;
  }
}

function whatsappHref(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : undefined;
}

function instagramHref(value) {
  const raw = String(value || "").trim();
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://instagram.com/${raw.replace(/^@/, "")}`;
}

function sectionAnchor(id) {
  return `menu-section-${String(id)}`;
}

function buildPalette(website) {
  const background = normalizeHex(website?.backgroundColor, "#f7f7f5");
  const text = normalizeHex(website?.textColor, isDark(background) ? "#ffffff" : "#171717");
  const accent = normalizeHex(website?.primaryColor, "#ff7a00");
  const dark = isDark(background);

  return {
    background,
    text,
    accent,
    accentText: isDark(accent) ? "#ffffff" : "#111111",
    accentSoft: withAlpha(accent, 0.23),
    muted: mixHex(text, background, dark ? 0.42 : 0.48),
    surface: mixHex(background, text, dark ? 0.045 : 0.025),
    surfaceStrong: mixHex(background, text, dark ? 0.075 : 0.01),
    border: withAlpha(text, dark ? 0.14 : 0.1),
    heroFallback: mixHex(background, accent, dark ? 0.22 : 0.1),
  };
}

function normalizeHex(value, fallback) {
  const raw = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(raw) ? raw.toLowerCase() : fallback;
}

function hexToRgb(hex) {
  const clean = normalizeHex(hex, "#000000").slice(1);
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function mixHex(first, second, secondWeight = 0.5) {
  const a = hexToRgb(first);
  const b = hexToRgb(second);
  const weight = Math.max(0, Math.min(1, secondWeight));
  const channel = (x, y) => Math.round(x * (1 - weight) + y * weight);

  return `#${[channel(a.r, b.r), channel(a.g, b.g), channel(a.b, b.b)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isDark(hex) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.48;
}
