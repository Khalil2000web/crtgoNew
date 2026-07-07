export const LANGUAGE_META = {
  ar: {
    code: "ar",
    label: "العربية",
    short: "AR",
    dir: "rtl",
  },
  he: {
    code: "he",
    label: "עברית",
    short: "HE",
    dir: "rtl",
  },
  en: {
    code: "en",
    label: "English",
    short: "EN",
    dir: "ltr",
  },
};

export const UI_TEXT = {
  ar: {
    digitalMenu: "القائمة الرقمية",
    searchPlaceholder: "ابحث في القائمة...",
    workingHours: "ساعات العمل",
    today: "اليوم",
    openNow: "مفتوح الآن",
    closedNow: "مغلق الآن",
    closedToday: "مغلق اليوم",
    noHours: "ساعات العمل غير متوفرة",
    call: "اتصال",
    whatsapp: "واتساب",
    instagram: "إنستغرام",
    facebook: "فيسبوك",
    tiktok: "تيك توك",
    noItems: "لا توجد عناصر",
    noItemsText: "جرّب البحث عن شيء آخر.",
    poweredBy: "مدعوم بواسطة CRTGO",
    menu: "القائمة",
    address: "العنوان",
    branches: "الفروع",
    chooseBranch: "اختر الفرع",
    openBranch: "افتح الفرع",
    language: "اللغة",
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
    searchPlaceholder: "חפש בתפריט...",
    workingHours: "שעות פעילות",
    today: "היום",
    openNow: "פתוח עכשיו",
    closedNow: "סגור עכשיו",
    closedToday: "סגור היום",
    noHours: "אין שעות פעילות",
    call: "התקשר",
    whatsapp: "וואטסאפ",
    instagram: "אינסטגרם",
    facebook: "פייסבוק",
    tiktok: "טיקטוק",
    noItems: "לא נמצאו פריטים",
    noItemsText: "נסה לחפש משהו אחר.",
    poweredBy: "מופעל על ידי CRTGO",
    menu: "תפריט",
    address: "כתובת",
    branches: "סניפים",
    chooseBranch: "בחר סניף",
    openBranch: "פתח סניף",
    language: "שפה",
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
    searchPlaceholder: "Search menu...",
    workingHours: "Working Hours",
    today: "Today",
    openNow: "Open now",
    closedNow: "Closed now",
    closedToday: "Closed today",
    noHours: "Working hours unavailable",
    call: "Call",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    noItems: "No items found",
    noItemsText: "Try searching for something else.",
    poweredBy: "Powered by CRTGO",
    menu: "Menu",
    address: "Address",
    branches: "Branches",
    chooseBranch: "Choose branch",
    openBranch: "Open branch",
    language: "Language",
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

export function normalizeLanguageCode(value) {
  const code = String(value || "").toLowerCase();

  return LANGUAGE_META[code] ? code : "ar";
}

export function getUi(language, key) {
  const cleanLanguage = normalizeLanguageCode(language);

  return UI_TEXT[cleanLanguage]?.[key] || UI_TEXT.ar[key] || key;
}

export function getDayLabel(language, dayKey) {
  const cleanLanguage = normalizeLanguageCode(language);

  return (
    UI_TEXT[cleanLanguage]?.days?.[dayKey] ||
    UI_TEXT.ar.days[dayKey] ||
    dayKey
  );
}

export function isRtl(language) {
  return LANGUAGE_META[normalizeLanguageCode(language)]?.dir === "rtl";
}

export function getTextDirection(language) {
  return isRtl(language) ? "rtl" : "ltr";
}

export function normalizeEnabledLanguages(menu) {
  const enabled = Array.isArray(menu?.enabled_languages)
    ? menu.enabled_languages
    : ["ar"];

  const cleaned = enabled
    .map(normalizeLanguageCode)
    .filter((code) => LANGUAGE_META[code]);

  const unique = [...new Set(cleaned)];

  return unique.length ? unique : ["ar"];
}

export function getDefaultLanguage(menu, enabledLanguages) {
  const fallback = enabledLanguages?.[0] || "ar";

  if (
    menu?.default_language &&
    enabledLanguages.includes(menu.default_language)
  ) {
    return menu.default_language;
  }

  return fallback;
}

export function getRequestedLanguage(searchParams, enabledLanguages) {
  const requested = normalizeLanguageCode(
    searchParams?.lang || searchParams?.language
  );

  if (enabledLanguages?.includes(requested)) {
    return requested;
  }

  return enabledLanguages?.[0] || "ar";
}

export function withLanguageParam(href, language) {
  const cleanLanguage = normalizeLanguageCode(language);

  if (!href || cleanLanguage === "ar") return href;

  const separator = href.includes("?") ? "&" : "?";

  return `${href}${separator}lang=${cleanLanguage}`;
}

export function getTheme(menu) {
  return {
    primary: menu?.primary_color || "#ff7a00",
    background: menu?.background_color || "#090909",
    text: menu?.text_color || "#ffffff",
  };
}

export function pickText(record, baseKey, i18nKey, language) {
  const cleanLanguage = normalizeLanguageCode(language);

  const translated = record?.[i18nKey]?.[cleanLanguage];

  if (typeof translated === "string" && translated.trim()) {
    return translated.trim();
  }

  const base = record?.[baseKey];

  if (typeof base === "string" && base.trim()) {
    return base.trim();
  }

  return "";
}

export function formatPrice(value) {
  return `₪${Number(value || 0).toFixed(2)}`;
}

function cleanPhone(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

export function getWhatsAppLink(value) {
  const clean = cleanPhone(value);

  if (!clean) return null;

  return `https://wa.me/${clean}`;
}

export function getInstagramLink(value) {
  if (!value) return null;
  if (value.startsWith("http")) return value;

  return `https://instagram.com/${value.replace("@", "")}`;
}

export function getTikTokLink(value) {
  if (!value) return null;
  if (value.startsWith("http")) return value;

  return `https://tiktok.com/@${value.replace("@", "")}`;
}

export function buildSocialLinks(branch, language) {
  const links = [];

  if (branch.phone) {
    links.push({
      key: "phone",
      label: getUi(language, "call"),
      href: `tel:${branch.phone}`,
    });
  }

  const whatsapp = getWhatsAppLink(branch.whatsapp);
  if (whatsapp) {
    links.push({
      key: "whatsapp",
      label: getUi(language, "whatsapp"),
      href: whatsapp,
    });
  }

  const instagram = getInstagramLink(branch.instagram);
  if (instagram) {
    links.push({
      key: "instagram",
      label: getUi(language, "instagram"),
      href: instagram,
    });
  }

  if (branch.facebook) {
    links.push({
      key: "facebook",
      label: getUi(language, "facebook"),
      href: branch.facebook,
    });
  }

  const tiktok = getTikTokLink(branch.tiktok);
  if (tiktok) {
    links.push({
      key: "tiktok",
      label: getUi(language, "tiktok"),
      href: tiktok,
    });
  }

  return links;
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

function isNowInsideRange(from, to, now = new Date()) {
  const start = timeToMinutes(from);
  const end = timeToMinutes(to);

  if (start === null || end === null) return false;

  const current = now.getHours() * 60 + now.getMinutes();

  if (end < start) {
    return current >= start || current < end;
  }

  return current >= start && current < end;
}

export function getTodayWorkingHours(workingHours, language) {
  const now = new Date();
  const dayKey = DAY_KEYS[now.getDay()];
  const day = normalizeDay(getDayData(workingHours, dayKey));

  if (!day.isOpenDay) {
    return {
      dayKey,
      dayLabel: getDayLabel(language, dayKey),
      label: getUi(language, "closedToday"),
      isOpenNow: false,
      hasHours: Boolean(workingHours),
    };
  }

  return {
    dayKey,
    dayLabel: getDayLabel(language, dayKey),
    label: day.label,
    isOpenNow: isNowInsideRange(day.from, day.to, now),
    hasHours: true,
  };
}

export function getFullWorkingHours(workingHours, language) {
  return DAY_KEYS.map((dayKey) => {
    const day = normalizeDay(getDayData(workingHours, dayKey));

    return {
      dayKey,
      dayLabel: getDayLabel(language, dayKey),
      label: day.isOpenDay ? day.label : getUi(language, "closedToday"),
      isOpenDay: day.isOpenDay,
    };
  });
}

export function filterSections(sections, query, language) {
  const q = query.trim().toLowerCase();

  if (!q) return sections;

  return sections
    .map((section) => {
      const sectionName = pickText(section, "name_ar", "name_i18n", language);

      const items = section.items.filter((item) => {
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

export function scrollToSection(sectionId) {
  const element = document.getElementById(`section-${sectionId}`);

  if (!element) return;

  element.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}