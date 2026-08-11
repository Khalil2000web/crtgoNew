"use client";

import Image from "next/image";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Check,
  ChevronDown,
  Clock3,
  Languages as LanguagesIcon,
  MapPin,
  Maximize2,
  Phone,
  Search,
  Share2,
  Star,
  X,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";

import RatingBox from "./RatingBox";
import { SECTION_ICONS } from "./sectionIcons";
import { PUBLIC_FONT_CLASS } from "./publicFonts";


const PublicLanguageContext =
  createContext(null);


const PUBLIC_LANGUAGES = {
  ar: {
    code: "ar",
    name: "العربية",
    shortName: "ع",
    dir: "rtl",
    locale: "ar-IL",
  },

  en: {
    code: "en",
    name: "English",
    shortName: "EN",
    dir: "ltr",
    locale: "en-IL",
  },

  he: {
    code: "he",
    name: "עברית",
    shortName: "עב",
    dir: "rtl",
    locale: "he-IL",
  },
};


const PUBLIC_COPY = {
  ar: {
    language:
      "اللغة",

    restaurantFallback:
      "اسم المطعم",

    workingHours:
      "ساعات العمل",

    weeklyHours:
      "أوقات العمل لهذا الأسبوع",

    openNow:
      "مفتوح الآن",

    closedNow:
      "مغلق الآن",

    closedToday:
      "مغلق اليوم",

    search:
      "بحث",

    share:
      "مشاركة",

    clearSearch:
      "مسح البحث",

    searchPlaceholder:
      "ابحث في القائمة...",

    sectionFallback:
      "قسم",

    menuFallback:
      "القائمة",

    itemFallback:
      "منتج",

    noProducts:
      "لا توجد منتجات بعد",

    noProductsHint:
      "ستظهر أقسام القائمة هنا.",

    showAll:
      "عرض الكل",

    noProductsInSection:
      "لا توجد منتجات في هذا القسم حالياً.",

    noResults:
      "لم نجد نتائج",

    noResultsHint:
      "جرّب البحث عن منتج آخر.",

    available:
      "متوفر",

    unavailable:
      "غير متوفر",

    availableNow:
      "متوفر حالياً",

    unavailableNow:
      "غير متوفر حالياً",

    close:
      "إغلاق",

    today:
      "اليوم",

    closed:
      "مغلق",

    call:
      "اتصال",

    menuShare:
      "شاهد قائمة {name}",

    footerDescription:
      "مواقع وقوائم رقمية أسرع وأبسط للشركات والمطاعم.",

    footerExplore:
      "استكشف",

    footerInformation:
      "معلومات",

    footerWebsite:
      "CRTGO",

    footerWebServices:
      "خدمات الويب",

    footerTerms:
      "الشروط والأحكام",

    footerPrivacy:
      "سياسة الخصوصية",

    footerContact:
      "تواصل معنا",

    footerCopyright:
      "جميع الحقوق محفوظة.",

    days: {
      sunday:
        "الأحد",

      monday:
        "الاثنين",

      tuesday:
        "الثلاثاء",

      wednesday:
        "الأربعاء",

      thursday:
        "الخميس",

      friday:
        "الجمعة",

      saturday:
        "السبت",
    },
  },


  en: {
    language:
      "Language",

    restaurantFallback:
      "Restaurant",

    workingHours:
      "Working hours",

    weeklyHours:
      "Opening hours for this week",

    openNow:
      "Open now",

    closedNow:
      "Closed now",

    closedToday:
      "Closed today",

    search:
      "Search",

    share:
      "Share",

    clearSearch:
      "Clear search",

    searchPlaceholder:
      "Search the menu...",

    sectionFallback:
      "Section",

    menuFallback:
      "Menu",

    itemFallback:
      "Item",

    noProducts:
      "No products yet",

    noProductsHint:
      "Menu sections will appear here.",

    showAll:
      "View all",

    noProductsInSection:
      "There are currently no products in this section.",

    noResults:
      "No results found",

    noResultsHint:
      "Try searching for another product.",

    available:
      "Available",

    unavailable:
      "Unavailable",

    availableNow:
      "Currently available",

    unavailableNow:
      "Currently unavailable",

    close:
      "Close",

    today:
      "Today",

    closed:
      "Closed",

    call:
      "Call",

    menuShare:
      "View {name}'s menu",

    footerDescription:
      "Faster, simpler digital websites and menus for businesses and restaurants.",

    footerExplore:
      "Explore",

    footerInformation:
      "Information",

    footerWebsite:
      "CRTGO",

    footerWebServices:
      "Web Services",

    footerTerms:
      "Terms",

    footerPrivacy:
      "Privacy",

    footerContact:
      "Contact",

    footerCopyright:
      "All rights reserved.",

    days: {
      sunday:
        "Sunday",

      monday:
        "Monday",

      tuesday:
        "Tuesday",

      wednesday:
        "Wednesday",

      thursday:
        "Thursday",

      friday:
        "Friday",

      saturday:
        "Saturday",
    },
  },


  he: {
    language:
      "שפה",

    restaurantFallback:
      "מסעדה",

    workingHours:
      "שעות פתיחה",

    weeklyHours:
      "שעות הפתיחה השבוע",

    openNow:
      "פתוח עכשיו",

    closedNow:
      "סגור עכשיו",

    closedToday:
      "סגור היום",

    search:
      "חיפוש",

    share:
      "שיתוף",

    clearSearch:
      "נקה חיפוש",

    searchPlaceholder:
      "חיפוש בתפריט...",

    sectionFallback:
      "קטגוריה",

    menuFallback:
      "תפריט",

    itemFallback:
      "פריט",

    noProducts:
      "אין מוצרים עדיין",

    noProductsHint:
      "קטגוריות התפריט יופיעו כאן.",

    showAll:
      "הצג הכל",

    noProductsInSection:
      "אין כרגע מוצרים בקטגוריה זו.",

    noResults:
      "לא נמצאו תוצאות",

    noResultsHint:
      "נסה לחפש מוצר אחר.",

    available:
      "זמין",

    unavailable:
      "לא זמין",

    availableNow:
      "זמין כרגע",

    unavailableNow:
      "לא זמין כרגע",

    close:
      "סגור",

    today:
      "היום",

    closed:
      "סגור",

    call:
      "התקשר",

    menuShare:
      "צפה בתפריט של {name}",

    footerDescription:
      "אתרים ותפריטים דיגיטליים מהירים ופשוטים יותר לעסקים ומסעדות.",

    footerExplore:
      "גלו",

    footerInformation:
      "מידע",

    footerWebsite:
      "CRTGO",

    footerWebServices:
      "שירותי אינטרנט",

    footerTerms:
      "תנאים",

    footerPrivacy:
      "פרטיות",

    footerContact:
      "יצירת קשר",

    footerCopyright:
      "כל הזכויות שמורות.",

    days: {
      sunday:
        "יום ראשון",

      monday:
        "יום שני",

      tuesday:
        "יום שלישי",

      wednesday:
        "יום רביעי",

      thursday:
        "יום חמישי",

      friday:
        "יום שישי",

      saturday:
        "שבת",
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
  sunday:
    "sun",

  monday:
    "mon",

  tuesday:
    "tue",

  wednesday:
    "wed",

  thursday:
    "thu",

  friday:
    "fri",

  saturday:
    "sat",
};


function getNestedValue(
  object,
  path
) {
  return path
    .split(".")
    .reduce(
      (
        current,
        key
      ) =>
        current?.[
          key
        ],
      object
    );
}


function getPublicCopy(
  language,
  key,
  variables = {}
) {
  const selected =
    getNestedValue(
      PUBLIC_COPY[
        language
      ],
      key
    );

  const english =
    getNestedValue(
      PUBLIC_COPY.en,
      key
    );

  let value =
    selected ??
    english ??
    key;

  if (
    typeof value !==
    "string"
  ) {
    return value;
  }

  for (
    const [
      variable,
      replacement,
    ] of Object.entries(
      variables
    )
  ) {
    value =
      value.replaceAll(
        `{${variable}}`,
        String(
          replacement ??
            ""
        )
      );
  }

  return value;
}


function normalizeLanguages(
  value
) {
  if (
    !Array.isArray(
      value
    )
  ) {
    return [
      "ar",
    ];
  }

  const valid =
    value
      .map(
        (
          code
        ) =>
          String(
            code ||
              ""
          )
            .trim()
            .toLowerCase()
      )
      .filter(
        (
          code
        ) =>
          Boolean(
            PUBLIC_LANGUAGES[
              code
            ]
          )
      );

  return valid.length
    ? [
        ...new Set(
          valid
        ),
      ]
    : [
        "ar",
      ];
}


function toArray(
  value
) {
  return Array.isArray(
    value
  )
    ? value
    : [];
}


function safeText(
  value,
  fallback = ""
) {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  if (
    typeof value ===
      "string" ||
    typeof value ===
      "number"
  ) {
    const text =
      String(
        value
      ).trim();

    return (
      text ||
      fallback
    );
  }

  if (
    typeof value ===
    "boolean"
  ) {
    return value
      ? "true"
      : "false";
  }

  if (
    typeof value ===
    "object"
  ) {
    const possibleValues = [
      value.text,
      value.label,
      value.name,
      value.address,
      value.value,
      value.title,
      value.default,
    ];

    for (
      const item of
      possibleValues
    ) {
      if (
        typeof item ===
          "string" ||
        typeof item ===
          "number"
      ) {
        const text =
          String(
            item
          ).trim();

        if (text) {
          return text;
        }
      }
    }
  }

  return fallback;
}


function getTranslations(
  entity,
  field
) {
  if (!entity) {
    return {};
  }

  const translations =
    entity[
      `${field}_i18n`
    ] ||
    entity[
      `${field}I18n`
    ];

  if (
    translations &&
    typeof translations ===
      "object" &&
    !Array.isArray(
      translations
    )
  ) {
    return translations;
  }

  return {};
}


function getLocalizedField(
  entity,
  field,
  language,
  fallback = ""
) {
  if (!entity) {
    return fallback;
  }

  const translations =
    getTranslations(
      entity,
      field
    );

  const translated =
    safeText(
      translations[
        language
      ]
    );

  if (translated) {
    return translated;
  }

  const directLanguageValue =
    safeText(
      entity[
        `${field}_${language}`
      ]
    );

  if (
    directLanguageValue
  ) {
    return directLanguageValue;
  }

  return (
    safeText(
      entity[
        field
      ]
    ) ||
    fallback
  );
}


function getImageUrl(
  value
) {
  if (!value) {
    return null;
  }

  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  if (
    typeof value ===
    "object"
  ) {
    const possibleUrls = [
      value.url,
      value.src,
      value.publicUrl,
      value.public_url,
      value.image_url,
    ];

    for (
      const url of
      possibleUrls
    ) {
      if (
        typeof url ===
          "string" &&
        url.trim()
      ) {
        return url;
      }
    }
  }

  return null;
}


function getContrastTextColor(
  color
) {
  let value =
    String(
      color ||
        ""
    )
      .trim()
      .replace(
        "#",
        ""
      );

  if (
    value.length ===
    3
  ) {
    value =
      value
        .split("")
        .map(
          (
            character
          ) =>
            `${character}${character}`
        )
        .join("");
  }

  if (
    !/^[0-9a-fA-F]{6}$/.test(
      value
    )
  ) {
    return "#ffffff";
  }

  const red =
    parseInt(
      value.slice(
        0,
        2
      ),
      16
    );

  const green =
    parseInt(
      value.slice(
        2,
        4
      ),
      16
    );

  const blue =
    parseInt(
      value.slice(
        4,
        6
      ),
      16
    );

  const brightness =
    (
      red *
        299 +
      green *
        587 +
      blue *
        114
    ) /
    1000;

  return brightness >
    170
    ? "#111111"
    : "#ffffff";
}


function formatPrice(
  value,
  language
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number =
    Number(
      value
    );

  if (
    !Number.isFinite(
      number
    )
  ) {
    const text =
      safeText(
        value
      );

    return (
      text ||
      null
    );
  }

  const locale =
    PUBLIC_LANGUAGES[
      language
    ]?.locale ||
    "en-IL";

  return new Intl.NumberFormat(
    locale,
    {
      maximumFractionDigits:
        2,
    }
  ).format(
    number
  );
}


function timeToMinutes(
  value
) {
  if (
    !value ||
    typeof value !==
      "string"
  ) {
    return null;
  }

  const parts =
    value.split(
      ":"
    );

  if (
    parts.length <
    2
  ) {
    return null;
  }

  const hours =
    Number(
      parts[
        0
      ]
    );

  const minutes =
    Number(
      parts[
        1
      ]
    );

  if (
    Number.isNaN(
      hours
    ) ||
    Number.isNaN(
      minutes
    )
  ) {
    return null;
  }

  return (
    hours *
      60 +
    minutes
  );
}


function getDayData(
  workingHours,
  dayKey
) {
  if (
    !workingHours ||
    typeof workingHours !==
      "object"
  ) {
    return null;
  }

  return (
    workingHours[
      dayKey
    ] ||
    workingHours[
      SHORT_DAY_KEYS[
        dayKey
      ]
    ] ||
    null
  );
}


function normalizeDay(
  data
) {
  if (
    !data ||
    typeof data !==
      "object"
  ) {
    return {
      isOpenDay:
        false,

      from:
        "",

      to:
        "",
    };
  }

  const closed =
    data.closed ===
      true ||
    data.is_open ===
      false ||
    data.open ===
      false ||
    data.enabled ===
      false;

  const from =
    safeText(
      data.from
    ) ||
    safeText(
      data.open_time
    ) ||
    safeText(
      data.start
    ) ||
    safeText(
      data.opens
    ) ||
    (
      typeof data.open ===
      "string"
        ? data.open
        : ""
    );

  const to =
    safeText(
      data.to
    ) ||
    safeText(
      data.close_time
    ) ||
    safeText(
      data.end
    ) ||
    safeText(
      data.closes
    ) ||
    (
      typeof data.close ===
      "string"
        ? data.close
        : ""
    );

  return {
    isOpenDay:
      !closed &&
      Boolean(
        from &&
          to
      ),

    from,

    to,
  };
}


function isNowInsideRange(
  from,
  to
) {
  const start =
    timeToMinutes(
      from
    );

  const end =
    timeToMinutes(
      to
    );

  if (
    start === null ||
    end === null
  ) {
    return false;
  }

  const now =
    new Date();

  const current =
    now.getHours() *
      60 +
    now.getMinutes();

  if (
    end <
    start
  ) {
    return (
      current >=
        start ||
      current <
        end
    );
  }

  return (
    current >=
      start &&
    current <
      end
  );
}


function getTodayWorkingHours(
  workingHours
) {
  const now =
    new Date();

  const dayKey =
    DAY_KEYS[
      now.getDay()
    ];

  const data =
    getDayData(
      workingHours,
      dayKey
    );

  const day =
    normalizeDay(
      data
    );

  return {
    dayKey,

    isOpenDay:
      day.isOpenDay,

    from:
      day.from,

    to:
      day.to,

    isOpenNow:
      day.isOpenDay
        ? isNowInsideRange(
            day.from,
            day.to
          )
        : false,
  };
}


function getSectionId(
  section
) {
  return `section-${
    section?.id ||
    section?.slug ||
    "menu"
  }`;
}


function getItemCountText(
  count,
  language
) {
  if (
    language ===
    "en"
  ) {
    return `${count} ${
      count === 1
        ? "item"
        : "items"
    }`;
  }

  if (
    language ===
    "he"
  ) {
    return `${count} פריטים`;
  }

  return `${count} منتج`;
}


function usePublicLanguage() {
  const context =
    useContext(
      PublicLanguageContext
    );

  if (!context) {
    throw new Error(
      "usePublicLanguage must be used inside StandardWebsite"
    );
  }

  return context;
}


function AnimatedDialog({
  open,
  onClose,
  children,
  align = "bottom",
  panelClassName = "",
}) {
  const dialogRef =
    useRef(
      null
    );

  const closeTimerRef =
    useRef(
      null
    );

  const previousOverflowRef =
    useRef(
      ""
    );

  const [
    visible,
    setVisible,
  ] =
    useState(
      false
    );


  useEffect(() => {
    const dialog =
      dialogRef.current;

    if (
      !dialog ||
      !open
    ) {
      return;
    }

    if (
      closeTimerRef.current
    ) {
      window.clearTimeout(
        closeTimerRef.current
      );

      closeTimerRef.current =
        null;
    }

    previousOverflowRef.current =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    if (
      !dialog.open
    ) {
      dialog.showModal();
    }

    const frame =
      requestAnimationFrame(
        () => {
          setVisible(
            true
          );
        }
      );

    return () => {
      cancelAnimationFrame(
        frame
      );
    };
  }, [
    open,
  ]);


  useEffect(() => {
    return () => {
      if (
        closeTimerRef.current
      ) {
        window.clearTimeout(
          closeTimerRef.current
        );
      }

      document.body.style.overflow =
        previousOverflowRef.current;
    };
  }, []);


  function requestClose() {
    if (
      closeTimerRef.current
    ) {
      return;
    }

    setVisible(
      false
    );

    closeTimerRef.current =
      window.setTimeout(
        () => {
          const dialog =
            dialogRef.current;

          if (
            dialog?.open
          ) {
            dialog.close();
          }

          document.body.style.overflow =
            previousOverflowRef.current;

          closeTimerRef.current =
            null;

          onClose();
        },
        220
      );
  }


  return (
    <dialog
      ref={
        dialogRef
      }
      onCancel={(
        event
      ) => {
        event.preventDefault();

        requestClose();
      }}
      className="m-0 h-dvh w-screen max-w-none overflow-hidden bg-transparent p-0"
    >
      <div
        className={`flex h-full w-full bg-black/55 backdrop-blur-[5px] transition-all duration-200 ${
          visible
            ? "opacity-100"
            : "opacity-0"
        } ${
          align ===
          "center"
            ? "items-center justify-center p-4 sm:p-6"
            : "items-end justify-center sm:items-center sm:p-6"
        }`}
        onMouseDown={(
          event
        ) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            requestClose();
          }
        }}
      >
        <div
          className={`w-full transition-all duration-200 ease-out ${
            visible
              ? "translate-y-0 scale-100 opacity-100"
              : align ===
                  "center"
                ? "translate-y-3 scale-[0.97] opacity-0"
                : "translate-y-10 scale-[0.985] opacity-0"
          } ${panelClassName}`}
          onMouseDown={(
            event
          ) =>
            event.stopPropagation()
          }
        >
          {children({
            close:
              requestClose,
          })}
        </div>
      </div>
    </dialog>
  );
}


export default function StandardWebsite({
  website,
}) {
  const [
    query,
    setQuery,
  ] =
    useState(
      ""
    );

  const [
    workingHoursOpen,
    setWorkingHoursOpen,
  ] =
    useState(
      false
    );


  const enabledLanguages =
    useMemo(
      () =>
        normalizeLanguages(
          website?.enabledLanguages ??
            website?.enabled_languages
        ),
      [
        website?.enabledLanguages,
        website?.enabled_languages,
      ]
    );


  const requestedDefault =
    safeText(
      website?.defaultLanguage ??
        website?.default_language
    );


  const defaultLanguage =
    enabledLanguages.includes(
      requestedDefault
    )
      ? requestedDefault
      : enabledLanguages[
          0
        ];


  const storageKey =
    `crtgo-public-language:${
      website?.id ||
      website?.slug ||
      "website"
    }`;


  const [
    language,
    setLanguageState,
  ] =
    useState(
      defaultLanguage
    );


  const [
    languageReady,
    setLanguageReady,
  ] =
    useState(
      false
    );


  useEffect(() => {
    let nextLanguage =
      defaultLanguage;

    try {
      const saved =
        window.localStorage.getItem(
          storageKey
        );

      if (
        saved &&
        enabledLanguages.includes(
          saved
        )
      ) {
        nextLanguage =
          saved;
      }
    } catch {
      // Storage unavailable.
    }

    setLanguageState(
      nextLanguage
    );

    setLanguageReady(
      true
    );
  }, [
    storageKey,
    defaultLanguage,
    enabledLanguages,
  ]);


  useEffect(() => {
    if (
      !languageReady
    ) {
      return;
    }

    if (
      !enabledLanguages.includes(
        language
      )
    ) {
      setLanguageState(
        defaultLanguage
      );

      return;
    }

    try {
      window.localStorage.setItem(
        storageKey,
        language
      );
    } catch {
      // Storage unavailable.
    }
  }, [
    language,
    languageReady,
    enabledLanguages,
    defaultLanguage,
    storageKey,
  ]);


  function setLanguage(
    code
  ) {
    if (
      !enabledLanguages.includes(
        code
      )
    ) {
      return;
    }

    setLanguageState(
      code
    );

    setQuery(
      ""
    );
  }


  const languageMeta =
    PUBLIC_LANGUAGES[
      language
    ] ||
    PUBLIC_LANGUAGES.ar;


  const contextValue = {
    language,

    dir:
      languageMeta.dir,

    enabledLanguages,

    setLanguage,

    t: (
      key,
      variables
    ) =>
      getPublicCopy(
        language,
        key,
        variables
      ),

    text: (
      entity,
      field,
      fallback = ""
    ) =>
      getLocalizedField(
        entity,
        field,
        language,
        fallback
      ),
  };


  const sections =
    useMemo(
      () =>
        toArray(
          website?.sections
        ),
      [
        website?.sections,
      ]
    );


  const backgroundColor =
    safeText(
      website?.backgroundColor
    ) ||
    safeText(
      website?.colors
        ?.background
    ) ||
    "#f7f7f7";


  const textColor =
    safeText(
      website?.textColor
    ) ||
    safeText(
      website?.colors
        ?.text
    ) ||
    "#111111";


  const primaryColor =
    safeText(
      website?.primaryColor
    ) ||
    safeText(
      website?.colors
        ?.primary
    ) ||
    "#e32b2b";


  const onPrimaryColor =
    getContrastTextColor(
      primaryColor
    );


  const fontClass =
    PUBLIC_FONT_CLASS[
      language
    ] ||
    PUBLIC_FONT_CLASS.ar;


  return (
    <PublicLanguageContext.Provider
      value={
        contextValue
      }
    >
      <main
        dir={
          languageMeta.dir
        }
        lang={
          language
        }
        className={`${fontClass} relative min-h-screen overflow-x-hidden`}
        style={{
          backgroundColor,

          color:
            textColor,

          "--crtgo-primary":
            primaryColor,

          "--crtgo-on-primary":
            onPrimaryColor,

          "--crtgo-primary-soft":
            `color-mix(in srgb, ${primaryColor} 10%, white)`,

          "--crtgo-primary-soft-2":
            `color-mix(in srgb, ${primaryColor} 16%, white)`,

          "--crtgo-primary-border":
            `color-mix(in srgb, ${primaryColor} 32%, transparent)`,

          "--crtgo-primary-shadow":
            `color-mix(in srgb, ${primaryColor} 18%, transparent)`,
        }}
      >
        <RestaurantCover
          website={
            website
          }
          onOpenWorkingHours={() =>
            setWorkingHoursOpen(
              true
            )
          }
        />


        <div
          className="second-layer relative -mt-10 rounded-t-[34px] border-t border-white/70 pb-10 pt-[450px] shadow-[0_-14px_60px_rgba(0,0,0,0.06)] sm:-mt-24 sm:rounded-t-[42px] sm:pt-[350px]"
          style={{
            backgroundColor,
          }}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <MenuSearch
              query={
                query
              }
              setQuery={
                setQuery
              }
            />

            <SectionNavigation
              sections={
                sections
              }
            />

            <MenuSections
              sections={
                sections
              }
              query={
                query
              }
            />
          </div>
        </div>


        <RestaurantFloatingCard
          website={
            website
          }
          onOpenWorkingHours={() =>
            setWorkingHoursOpen(
              true
            )
          }
        />


        <Footer />


        <WorkingHoursModal
          open={
            workingHoursOpen
          }
          website={
            website
          }
          onClose={() =>
            setWorkingHoursOpen(
              false
            )
          }
        />
      </main>
    </PublicLanguageContext.Provider>
  );
}


function RestaurantCover({
  website,
  onOpenWorkingHours,
}) {
  const {
    dir,
    language,
    t,
    text,
  } =
    usePublicLanguage();


  const coverImages =
    toArray(
      website?.coverImages ??
        website?.cover_images
    );


  const cover =
    getImageUrl(
      website?.coverUrl
    ) ||
    getImageUrl(
      website?.cover_url
    ) ||
    getImageUrl(
      website?.cover
    ) ||
    getImageUrl(
      coverImages[
        0
      ]
    );


  const name =
    text(
      website,
      "name"
    ) ||
    t(
      "restaurantFallback"
    );


  async function handleShare() {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const shareData = {
      title:
        name,

      text:
        t(
          "menuShare",
          {
            name,
          }
        ),

      url:
        window.location.href,
    };

    try {
      if (
        navigator.share
      ) {
        await navigator.share(
          shareData
        );

        return;
      }

      if (
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(
          window.location.href
        );
      }
    } catch {
      // Share cancelled.
    }
  }


  function handleSearch() {
    const input =
      document.getElementById(
        "menu-search"
      );

    if (!input) {
      return;
    }

    input.scrollIntoView({
      behavior:
        "smooth",

      block:
        "center",
    });

    window.setTimeout(
      () => {
        input.focus();
      },
      280
    );
  }


  const actionClass =
    "flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/25 text-white shadow-lg backdrop-blur-xl transition duration-200 hover:scale-[1.04] hover:border-[var(--crtgo-primary)] hover:bg-[var(--crtgo-primary)] hover:text-[var(--crtgo-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crtgo-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 active:scale-95";


  return (
    <section
      dir={
        dir
      }
      lang={
        language
      }
      className="relative h-[360px] overflow-hidden sm:h-[430px]"
    >
      {cover ? (
        <Image
          src={
            cover
          }
          alt=""
          fill
          preload
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-800 to-neutral-600" />
      )}


      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/5 to-black/65" />


      <div className="absolute inset-x-0 top-0 mx-auto flex max-w-6xl items-center justify-between px-4 pt-5 sm:px-6 sm:pt-6">
        <button
          type="button"
          onClick={
            onOpenWorkingHours
          }
          aria-label={t(
            "workingHours"
          )}
          className={
            actionClass
          }
        >
          <Clock3 className="size-[19px]" />
        </button>


        <div className="flex items-center gap-2">
          <LanguageSwitcher />


          <button
            type="button"
            onClick={
              handleSearch
            }
            aria-label={t(
              "search"
            )}
            className={
              actionClass
            }
          >
            <Search className="size-[19px]" />
          </button>


          <button
            type="button"
            onClick={
              handleShare
            }
            aria-label={t(
              "share"
            )}
            className={
              actionClass
            }
          >
            <Share2 className="size-[19px]" />
          </button>
        </div>
      </div>
    </section>
  );
}


function LanguageSwitcher() {
  const {
    language,
    enabledLanguages,
    setLanguage,
    t,
  } =
    usePublicLanguage();


  const containerRef =
    useRef(
      null
    );


  const [
    open,
    setOpen,
  ] =
    useState(
      false
    );


  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(
      event
    ) {
      if (
        !containerRef.current?.contains(
          event.target
        )
      ) {
        setOpen(
          false
        );
      }
    }

    function handleKeyDown(
      event
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setOpen(
          false
        );
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    open,
  ]);


  if (
    enabledLanguages.length <=
    1
  ) {
    return null;
  }


  const current =
    PUBLIC_LANGUAGES[
      language
    ];


  return (
    <div
      ref={
        containerRef
      }
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (
              value
            ) =>
              !value
          )
        }
        aria-label={t(
          "language"
        )}
        aria-expanded={
          open
        }
        className="flex h-11 cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3.5 text-sm font-bold text-white shadow-lg backdrop-blur-xl transition duration-200 hover:scale-[1.03] hover:border-[var(--crtgo-primary)] hover:bg-[var(--crtgo-primary)] hover:text-[var(--crtgo-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crtgo-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 active:scale-95"
      >
        <LanguagesIcon className="size-[18px]" />

        <span className="hidden sm:inline">
          {
            current?.name
          }
        </span>

        <span className="sm:hidden">
          {
            current?.shortName
          }
        </span>

        <ChevronDown
          className={`size-4 transition-transform duration-200 ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>


      <div
        className={`absolute end-0 top-[calc(100%+8px)] w-44 origin-top overflow-hidden rounded-[18px] border border-black/10 bg-white p-1.5 text-neutral-950 shadow-[0_18px_55px_rgba(0,0,0,0.20)] transition-all duration-150 ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-[0.97] opacity-0"
        }`}
      >
        {enabledLanguages.map(
          (
            code
          ) => {
            const item =
              PUBLIC_LANGUAGES[
                code
              ];

            if (!item) {
              return null;
            }

            const active =
              code ===
              language;

            return (
              <button
                key={
                  code
                }
                type="button"
                onClick={() => {
                  setLanguage(
                    code
                  );

                  setOpen(
                    false
                  );
                }}
                dir={
                  item.dir
                }
                className={`flex w-full cursor-pointer items-center justify-between rounded-[13px] px-3 py-2.5 text-sm font-bold transition duration-150 focus-visible:outline-none ${
                  active
                    ? "bg-[var(--crtgo-primary)] text-[var(--crtgo-on-primary)]"
                    : "text-neutral-700 hover:bg-[var(--crtgo-primary-soft)] hover:text-[var(--crtgo-primary)] focus-visible:bg-[var(--crtgo-primary-soft)] focus-visible:text-[var(--crtgo-primary)]"
                }`}
              >
                <span>
                  {
                    item.name
                  }
                </span>

                {active && (
                  <Check className="size-4" />
                )}
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}


function RestaurantFloatingCard({
  website,
  onOpenWorkingHours,
}) {
  const {
    t,
    text,
  } =
    usePublicLanguage();


  const phone =
    safeText(
      website?.phone
    );

  const whatsapp =
    safeText(
      website?.whatsapp
    );

  const instagram =
    safeText(
      website?.instagram
    );

  const facebook =
    safeText(
      website?.facebook
    );

  const tiktok =
    safeText(
      website?.tiktok
    );


  const workingHours =
    website?.workingHours ||
    website?.working_hours ||
    null;


  const explicitHours =
    safeText(
      website?.workingHoursText
    ) ||
    safeText(
      website?.working_hours_text
    );


  const [
    today,
    setToday,
  ] =
    useState(
      null
    );


  useEffect(() => {
    if (
      !workingHours ||
      typeof workingHours !==
        "object"
    ) {
      setToday(
        null
      );

      return;
    }

    setToday(
      getTodayWorkingHours(
        workingHours
      )
    );
  }, [
    workingHours,
  ]);


  const logo =
    getImageUrl(
      website?.logoUrl
    ) ||
    getImageUrl(
      website?.logo_url
    ) ||
    getImageUrl(
      website?.logo
    );


  const name =
    text(
      website,
      "name"
    ) ||
    safeText(
      website?.displayName
    ) ||
    safeText(
      website?.display_name
    ) ||
    t(
      "restaurantFallback"
    );


  const location =
    text(
      website,
      "location"
    ) ||
    safeText(
      website?.address
    );


  const description =
    text(
      website,
      "description"
    );


  const explicitOpen =
    typeof website?.isOpen ===
    "boolean"
      ? website.isOpen
      : typeof website?.is_open ===
          "boolean"
        ? website.is_open
        : null;


  const isOpen =
    explicitOpen ??
    today?.isOpenNow ??
    null;


  let hoursLabel =
    explicitHours ||
    t(
      "workingHours"
    );


  if (
    !explicitHours &&
    today
  ) {
    hoursLabel =
      today.isOpenDay
        ? `${today.from} - ${today.to}`
        : t(
            "closedToday"
          );
  }


  const dayLabel =
    today?.dayKey
      ? t(
          `days.${today.dayKey}`
        )
      : t(
          "workingHours"
        );


  return (
    <div className="pointer-events-none absolute inset-x-0 top-[250px] px-4 sm:top-[308px] sm:px-6">
      <article className="pointer-events-auto mx-auto max-w-5xl overflow-visible rounded-[32px] border border-black/[0.06] bg-white px-5 pb-6 shadow-[0_25px_80px_rgba(0,0,0,0.16)] sm:rounded-[38px] sm:px-8 sm:pb-8">
        <div className="mx-auto h-[3px] w-16 rounded-b-full bg-[var(--crtgo-primary)]" />


        <div className="flex justify-center">
          <div className="relative -mt-14 size-28 overflow-hidden rounded-full border-[6px] border-white bg-neutral-100 shadow-[0_14px_40px_rgba(0,0,0,0.20)] sm:-mt-16 sm:size-32">
            {logo ? (
              <Image
                src={
                  logo
                }
                alt={
                  name
                }
                fill
                loading="eager"
                fetchPriority="high"
                sizes="128px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl font-black text-[var(--crtgo-primary)]">
                {
                  name.charAt(
                    0
                  )
                }
              </div>
            )}
          </div>
        </div>


        <div className="mx-auto mt-4 max-w-2xl text-center">
          <h1 className="text-balance text-[29px] font-black leading-tight text-neutral-950 sm:text-[39px]">
            {
              name
            }
          </h1>


          {location && (
            <div className="mt-2 flex items-center justify-center gap-1.5 text-neutral-500">
              <MapPin className="size-4 shrink-0 text-[var(--crtgo-primary)]" />

              <p className="text-sm font-medium">
                {
                  location
                }
              </p>
            </div>
          )}


          {description && (
            <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-7 text-neutral-500 sm:text-[15px]">
              {
                description
              }
            </p>
          )}


          {isOpen !==
            null && (
            <div className="mt-4 flex justify-center">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-extrabold ${
                  isOpen
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : "border-red-100 bg-red-50 text-red-600"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    isOpen
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
                />

                {isOpen
                  ? t(
                      "openNow"
                    )
                  : t(
                      "closedNow"
                    )}
              </span>
            </div>
          )}
        </div>


        <SocialLinksRow
          phone={
            phone
          }
          whatsapp={
            whatsapp
          }
          instagram={
            instagram
          }
          facebook={
            facebook
          }
          tiktok={
            tiktok
          }
        />


        <div className="mx-auto mt-6 grid max-w-xl grid-cols-2 gap-3">
          <div className="group flex min-h-[102px] flex-col items-center justify-center rounded-[22px] border border-neutral-100 bg-neutral-50/80 px-3 py-4 text-center transition duration-200 hover:-translate-y-0.5 hover:border-[var(--crtgo-primary-border)] hover:bg-[var(--crtgo-primary-soft)] hover:shadow-[0_10px_30px_var(--crtgo-primary-shadow)]">
            <div className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Star className="size-[17px] fill-current" />
            </div>

            <div className="mt-2">
              <RatingBox
                projectId={
                  website.id
                }
              />
            </div>
          </div>


          <button
            type="button"
            onClick={
              onOpenWorkingHours
            }
            className="group flex min-h-[102px] cursor-pointer flex-col items-center justify-center rounded-[22px] border border-neutral-100 bg-neutral-50/80 px-3 py-4 text-center transition duration-200 hover:-translate-y-0.5 hover:border-[var(--crtgo-primary-border)] hover:bg-[var(--crtgo-primary-soft)] hover:shadow-[0_10px_30px_var(--crtgo-primary-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crtgo-primary)] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-[var(--crtgo-primary-soft-2)] text-[var(--crtgo-primary)] transition duration-200 group-hover:bg-[var(--crtgo-primary)] group-hover:text-[var(--crtgo-on-primary)]">
              <Clock3 className="size-[17px]" />
            </div>

            <strong
              dir="ltr"
              className="mt-2 max-w-full truncate text-sm font-black text-neutral-950 transition group-hover:text-[var(--crtgo-primary)]"
            >
              {
                hoursLabel
              }
            </strong>

            <span className="mt-0.5 max-w-full truncate text-xs font-semibold text-neutral-400">
              {
                dayLabel
              }
            </span>
          </button>
        </div>
      </article>
    </div>
  );
}


function SocialLinksRow({
  phone,
  whatsapp,
  instagram,
  facebook,
  tiktok,
}) {
  const {
    t,
  } =
    usePublicLanguage();


  const links =
    [];


  const cleanPhone =
    String(
      phone ||
        ""
    ).trim();


  const cleanWhatsapp =
    String(
      whatsapp ||
        ""
    ).replace(
      /\D/g,
      ""
    );


  const instagramUrl =
    makeSocialUrl(
      instagram,
      "https://instagram.com/"
    );


  const facebookUrl =
    makeSocialUrl(
      facebook,
      "https://facebook.com/"
    );


  const tiktokUrl =
    makeSocialUrl(
      tiktok,
      "https://tiktok.com/@"
    );


  if (
    cleanPhone
  ) {
    links.push({
      key:
        "phone",

      label:
        t(
          "call"
        ),

      href:
        `tel:${cleanPhone}`,

      icon:
        Phone,
    });
  }


  if (
    cleanWhatsapp
  ) {
    links.push({
      key:
        "whatsapp",

      label:
        "WhatsApp",

      href:
        `https://wa.me/${cleanWhatsapp}`,

      icon:
        FaWhatsapp,

      external:
        true,
    });
  }


  if (
    instagramUrl
  ) {
    links.push({
      key:
        "instagram",

      label:
        "Instagram",

      href:
        instagramUrl,

      icon:
        FaInstagram,

      external:
        true,
    });
  }


  if (
    facebookUrl
  ) {
    links.push({
      key:
        "facebook",

      label:
        "Facebook",

      href:
        facebookUrl,

      icon:
        FaFacebookF,

      external:
        true,
    });
  }


  if (
    tiktokUrl
  ) {
    links.push({
      key:
        "tiktok",

      label:
        "TikTok",

      href:
        tiktokUrl,

      icon:
        FaTiktok,

      external:
        true,
    });
  }


  if (
    !links.length
  ) {
    return null;
  }


  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      {links.map(
        (
          link
        ) => {
          const Icon =
            link.icon;

          return (
            <a
              key={
                link.key
              }
              href={
                link.href
              }
              target={
                link.external
                  ? "_blank"
                  : undefined
              }
              rel={
                link.external
                  ? "noopener noreferrer"
                  : undefined
              }
              aria-label={
                link.label
              }
              title={
                link.label
              }
              className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-neutral-100 bg-neutral-50 text-neutral-600 transition duration-200 hover:-translate-y-1 hover:border-[var(--crtgo-primary)] hover:bg-[var(--crtgo-primary)] hover:text-[var(--crtgo-on-primary)] hover:shadow-[0_10px_25px_var(--crtgo-primary-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crtgo-primary)] focus-visible:ring-offset-2 active:scale-95"
            >
              <Icon className="size-[18px]" />
            </a>
          );
        }
      )}
    </div>
  );
}


function makeSocialUrl(
  value,
  base
) {
  const clean =
    String(
      value ||
        ""
    ).trim();

  if (!clean) {
    return null;
  }

  if (
    clean.startsWith(
      "https://"
    ) ||
    clean.startsWith(
      "http://"
    )
  ) {
    return clean;
  }

  return `${base}${clean.replace(
    /^@/,
    ""
  )}`;
}


function MenuSearch({
  query,
  setQuery,
}) {
  const {
    dir,
    t,
  } =
    usePublicLanguage();


  return (
    <div className="mx-auto max-w-4xl">
      <div className="group relative overflow-hidden rounded-[22px] border border-black/[0.07] bg-white shadow-[0_8px_35px_rgba(0,0,0,0.055)] transition duration-200 focus-within:border-[var(--crtgo-primary)] focus-within:shadow-[0_12px_40px_var(--crtgo-primary-shadow)]">
        <Search
          className={`pointer-events-none absolute top-1/2 size-5 -translate-y-1/2 text-neutral-400 transition duration-200 group-focus-within:text-[var(--crtgo-primary)] ${
            dir ===
            "rtl"
              ? "right-5"
              : "left-5"
          }`}
        />


        <input
          id="menu-search"
          type="search"
          value={
            query
          }
          onChange={(
            event
          ) =>
            setQuery(
              event.target.value
            )
          }
          placeholder={t(
            "searchPlaceholder"
          )}
          className={`h-15 w-full bg-transparent text-sm font-semibold text-neutral-950 outline-none placeholder:font-medium placeholder:text-neutral-400 ${
            dir ===
            "rtl"
              ? "pr-13 pl-13 text-right"
              : "pl-13 pr-13 text-left"
          }`}
        />


        {query && (
          <button
            type="button"
            onClick={() =>
              setQuery(
                ""
              )
            }
            aria-label={t(
              "clearSearch"
            )}
            className={`absolute top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition duration-200 hover:bg-[var(--crtgo-primary)] hover:text-[var(--crtgo-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crtgo-primary)] ${
              dir ===
              "rtl"
                ? "left-3"
                : "right-3"
            }`}
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}


function SectionNavigation({
  sections,
}) {
  const {
    text,
    t,
  } =
    usePublicLanguage();


  const [
    activeSectionId,
    setActiveSectionId,
  ] =
    useState(
      sections[
        0
      ]
        ? getSectionId(
            sections[
              0
            ]
          )
        : ""
    );


  useEffect(() => {
    if (
      !sections.length
    ) {
      return;
    }

    const elements =
      sections
        .map(
          (
            section
          ) =>
            document.getElementById(
              getSectionId(
                section
              )
            )
        )
        .filter(
          Boolean
        );

    if (
      !elements.length
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (
          entries
        ) => {
          const visible =
            entries
              .filter(
                (
                  entry
                ) =>
                  entry.isIntersecting
              )
              .sort(
                (
                  a,
                  b
                ) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              )[
              0
            ];

          if (
            visible
          ) {
            setActiveSectionId(
              visible.target.id
            );
          }
        },
        {
          rootMargin:
            "-15% 0px -65% 0px",

          threshold: [
            0,
            0.1,
            0.25,
            0.5,
          ],
        }
      );

    for (
      const element of
      elements
    ) {
      observer.observe(
        element
      );
    }

    return () => {
      observer.disconnect();
    };
  }, [
    sections,
  ]);


  if (
    !sections.length
  ) {
    return null;
  }


  function scrollToSection(
    section
  ) {
    const id =
      getSectionId(
        section
      );

    const element =
      document.getElementById(
        id
      );

    if (!element) {
      return;
    }

    setActiveSectionId(
      id
    );

    element.scrollIntoView({
      behavior:
        "smooth",

      block:
        "start",
    });
  }


  return (
    <div className="-mx-4 mt-5 overflow-hidden sm:-mx-6">
      <div className="flex gap-2.5 overflow-x-auto px-4 py-3 sm:px-6 [&::-webkit-scrollbar]:hidden">
        {sections.map(
          (
            section
          ) => {
            const name =
              text(
                section,
                "name",
                t(
                  "sectionFallback"
                )
              );

            const id =
              getSectionId(
                section
              );

            const active =
              activeSectionId ===
              id;

            return (
              <button
                key={
                  section?.id ||
                  section?.slug ||
                  name
                }
                type="button"
                onClick={() =>
                  scrollToSection(
                    section
                  )
                }
                aria-current={
                  active
                    ? "true"
                    : undefined
                }
                className={`group flex shrink-0 cursor-pointer items-center gap-2 rounded-full border py-2 pe-4 ps-2 text-sm font-bold shadow-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crtgo-primary)] focus-visible:ring-offset-2 active:scale-95 ${
                  active
                    ? "border-[var(--crtgo-primary)] bg-[var(--crtgo-primary)] text-[var(--crtgo-on-primary)] shadow-[0_8px_24px_var(--crtgo-primary-shadow)]"
                    : "border-black/[0.07] bg-white text-neutral-700 hover:-translate-y-0.5 hover:border-[var(--crtgo-primary)] hover:text-[var(--crtgo-primary)] hover:shadow-md"
                }`}
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-full transition duration-200 ${
                    active
                      ? "bg-white/20 text-[var(--crtgo-on-primary)]"
                      : "bg-neutral-100 text-neutral-700 group-hover:bg-[var(--crtgo-primary-soft)] group-hover:text-[var(--crtgo-primary)]"
                  }`}
                >
                  <SectionIcon
                    section={
                      section
                    }
                    size={
                      16
                    }
                  />
                </span>

                <span>
                  {
                    name
                  }
                </span>
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}


function MenuSections({
  sections,
  query,
}) {
  const {
    language,
    text,
    t,
  } =
    usePublicLanguage();


  const [
    selectedItem,
    setSelectedItem,
  ] =
    useState(
      null
    );


  const [
    expandedSection,
    setExpandedSection,
  ] =
    useState(
      null
    );


  const normalizedQuery =
    query
      .trim()
      .toLowerCase();


  if (
    !sections.length
  ) {
    return (
      <EmptyState
        title={t(
          "noProducts"
        )}
        description={t(
          "noProductsHint"
        )}
      />
    );
  }


  let searchHasResults =
    false;


  return (
    <>
      <div className="mt-5 space-y-5 sm:mt-7 sm:space-y-7">
        {sections.map(
          (
            section,
            sectionIndex
          ) => {
            const sectionName =
              text(
                section,
                "name",
                t(
                  "menuFallback"
                )
              );


            const sectionDescription =
              text(
                section,
                "description"
              );


            const items =
              toArray(
                section?.items
              );


            const filteredItems =
              normalizedQuery
                ? items.filter(
                    (
                      item
                    ) =>
                      itemMatchesQuery(
                        item,
                        normalizedQuery,
                        language
                      )
                  )
                : items;


            if (
              filteredItems.length >
              0
            ) {
              searchHasResults =
                true;
            }


            if (
              normalizedQuery &&
              filteredItems.length ===
                0
            ) {
              return null;
            }


            const hasMoreOnMobile =
              !normalizedQuery &&
              filteredItems.length >
                8;


            return (
              <section
                key={
                  section?.id ||
                  section?.slug ||
                  sectionName
                }
                id={
                  getSectionId(
                    section
                  )
                }
                className="group/section scroll-mt-6 rounded-[28px] border border-black/[0.055] bg-white/60 p-3 shadow-[0_8px_35px_rgba(0,0,0,0.025)] transition duration-300 hover:border-[var(--crtgo-primary-border)] sm:rounded-[32px] sm:p-5"
              >
                <div className="mb-4 flex items-end justify-between gap-4 px-1 sm:mb-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-[15px] bg-[var(--crtgo-primary-soft)] text-[var(--crtgo-primary)] transition duration-200 group-hover/section:bg-[var(--crtgo-primary)] group-hover/section:text-[var(--crtgo-on-primary)]">
                        <SectionIcon
                          section={
                            section
                          }
                          size={
                            19
                          }
                        />
                      </span>


                      <div className="min-w-0">
                        <h2 className="truncate text-[23px] font-black leading-tight text-neutral-950 sm:text-[29px]">
                          {
                            sectionName
                          }
                        </h2>

                        <span className="mt-0.5 block text-[11px] font-bold text-neutral-400 sm:hidden">
                          {getItemCountText(
                            filteredItems.length,
                            language
                          )}
                        </span>
                      </div>
                    </div>


                    {sectionDescription && (
                      <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-neutral-500">
                        {
                          sectionDescription
                        }
                      </p>
                    )}
                  </div>


                  <span className="hidden shrink-0 rounded-full bg-[var(--crtgo-primary-soft)] px-3 py-1.5 text-[11px] font-bold text-[var(--crtgo-primary)] sm:inline-flex">
                    {getItemCountText(
                      filteredItems.length,
                      language
                    )}
                  </span>
                </div>


                {filteredItems.length >
                0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                      {filteredItems.map(
                        (
                          item,
                          index
                        ) => (
                          <div
                            key={
                              item?.id ||
                              item?.slug ||
                              `${sectionName}-${index}`
                            }
                            className={
                              hasMoreOnMobile &&
                              index >=
                                8
                                ? "hidden sm:block"
                                : ""
                            }
                          >
                            <MenuItem
                              item={
                                item
                              }
                              eager={
                                sectionIndex ===
                                  0 &&
                                index <
                                  4
                              }
                              onOpen={() =>
                                setSelectedItem(
                                  item
                                )
                              }
                            />
                          </div>
                        )
                      )}
                    </div>


                    {hasMoreOnMobile && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSection({
                            section,

                            items:
                              filteredItems,
                          })
                        }
                        className="mt-3 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-[17px] border border-[var(--crtgo-primary-border)] bg-[var(--crtgo-primary-soft)] px-5 text-sm font-black text-[var(--crtgo-primary)] shadow-sm transition duration-200 hover:bg-[var(--crtgo-primary)] hover:text-[var(--crtgo-on-primary)] hover:shadow-[0_10px_28px_var(--crtgo-primary-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crtgo-primary)] focus-visible:ring-offset-2 active:scale-[0.99] sm:hidden"
                      >
                        {t(
                          "showAll"
                        )}{" "}
                        (
                        {
                          filteredItems.length
                        }
                        )
                      </button>
                    )}
                  </>
                ) : (
                  <div className="rounded-[22px] bg-neutral-50 px-5 py-10 text-center">
                    <p className="text-sm font-medium text-neutral-500">
                      {t(
                        "noProductsInSection"
                      )}
                    </p>
                  </div>
                )}
              </section>
            );
          }
        )}


        {normalizedQuery &&
          !searchHasResults && (
            <EmptyState
              title={t(
                "noResults"
              )}
              description={t(
                "noResultsHint"
              )}
              icon={
                Search
              }
            />
          )}
      </div>


      <SectionItemsModal
        open={
          Boolean(
            expandedSection
          )
        }
        section={
          expandedSection
        }
        onClose={() =>
          setExpandedSection(
            null
          )
        }
        onOpenItem={(
          item
        ) =>
          setSelectedItem(
            item
          )
        }
      />


      <ItemDetailsModal
        open={
          Boolean(
            selectedItem
          )
        }
        item={
          selectedItem
        }
        onClose={() =>
          setSelectedItem(
            null
          )
        }
      />
    </>
  );
}


function EmptyState({
  title,
  description,
  icon: Icon,
}) {
  return (
    <div className="mx-auto my-12 max-w-md rounded-[26px] border border-black/[0.05] bg-white px-6 py-12 text-center shadow-sm">
      {Icon && (
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-[var(--crtgo-primary-soft)] text-[var(--crtgo-primary)]">
          <Icon className="size-5" />
        </div>
      )}

      <h3 className="mt-3 text-lg font-black text-neutral-950">
        {
          title
        }
      </h3>

      <p className="mt-1 text-sm font-medium leading-6 text-neutral-500">
        {
          description
        }
      </p>
    </div>
  );
}


function itemMatchesQuery(
  item,
  normalizedQuery,
  language
) {
  const name =
    getLocalizedField(
      item,
      "name",
      language
    );


  const description =
    getLocalizedField(
      item,
      "description",
      language
    );


  return (
    name
      .toLowerCase()
      .includes(
        normalizedQuery
      ) ||
    description
      .toLowerCase()
      .includes(
        normalizedQuery
      )
  );
}


function MenuItem({
  item,
  onOpen,
  eager = false,
}) {
  const {
    dir,
    language,
    text,
    t,
  } =
    usePublicLanguage();


  const name =
    text(
      item,
      "name",
      t(
        "itemFallback"
      )
    );


  const description =
    text(
      item,
      "description"
    );


  const image =
    getImageUrl(
      item?.image_url
    ) ||
    getImageUrl(
      item?.imageUrl
    ) ||
    getImageUrl(
      item?.image
    );


  const price =
    formatPrice(
      item?.price,
      language
    );


  const available =
    item?.is_available !==
      false &&
    item?.available !==
      false;


  return (
    <button
      type="button"
      onClick={
        onOpen
      }
      className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[21px] border border-black/[0.055] bg-white text-start shadow-[0_5px_22px_rgba(0,0,0,0.035)] transition duration-300 hover:-translate-y-1 hover:border-[var(--crtgo-primary)] hover:shadow-[0_18px_42px_var(--crtgo-primary-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crtgo-primary)] focus-visible:ring-offset-2 active:scale-[0.985] sm:rounded-[24px]"
    >
      <div className="relative aspect-[1/0.92] w-full overflow-hidden bg-neutral-100">
        {image ? (
          <Image
            src={
              image
            }
            alt={
              name
            }
            fill
            loading={
              eager
                ? "eager"
                : "lazy"
            }
            fetchPriority={
              eager
                ? "high"
                : "auto"
            }
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.055]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] font-black tracking-[0.14em] text-neutral-300">
            CRTGO
          </div>
        )}


        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />


        {!available && (
          <span
            className={`absolute top-2.5 rounded-full border border-white/60 bg-white/90 px-2.5 py-1 text-[10px] font-black text-neutral-500 shadow-sm backdrop-blur ${
              dir ===
              "rtl"
                ? "right-2.5"
                : "left-2.5"
            }`}
          >
            {t(
              "unavailable"
            )}
          </span>
        )}


        <span
          className={`absolute bottom-2.5 flex size-8 items-center justify-center rounded-full border border-white/70 bg-white/90 text-neutral-900 shadow-md backdrop-blur transition duration-200 group-hover:scale-110 group-hover:border-[var(--crtgo-primary)] group-hover:bg-[var(--crtgo-primary)] group-hover:text-[var(--crtgo-on-primary)] ${
            dir ===
            "rtl"
              ? "left-2.5"
              : "right-2.5"
          }`}
        >
          <Maximize2 className="size-3.5" />
        </span>
      </div>


      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-2 text-[14px] font-black leading-5 text-neutral-950 transition duration-200 group-hover:text-[var(--crtgo-primary)] sm:text-[16px] sm:leading-6">
          {
            name
          }
        </h3>


        {description && (
          <p className="mt-1.5 line-clamp-2 text-[11px] font-medium leading-[18px] text-neutral-500 sm:text-[13px] sm:leading-5">
            {
              description
            }
          </p>
        )}


        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          {price !==
            null ? (
            <strong className="rounded-full border border-[var(--crtgo-primary-border)] bg-[var(--crtgo-primary-soft)] px-2.5 py-1 text-[13px] font-black text-[var(--crtgo-primary)] transition duration-200 group-hover:bg-[var(--crtgo-primary)] group-hover:text-[var(--crtgo-on-primary)] sm:text-sm">
              ₪
              {
                price
              }
            </strong>
          ) : (
            <span />
          )}


          <span
            className={`size-2 rounded-full ${
              available
                ? "bg-emerald-400"
                : "bg-neutral-300"
            }`}
          />
        </div>
      </div>
    </button>
  );
}


function WorkingHoursModal({
  open,
  website,
  onClose,
}) {
  const {
    dir,
    t,
  } =
    usePublicLanguage();


  const hours =
    website?.workingHours ||
    website?.working_hours;


  return (
    <AnimatedDialog
      open={
        open
      }
      onClose={
        onClose
      }
      align="center"
      panelClassName="max-w-md"
    >
      {({
        close,
      }) => (
        <article
          dir={
            dir
          }
          className="w-full overflow-hidden rounded-[30px] bg-white text-neutral-950 shadow-[0_35px_120px_rgba(0,0,0,0.40)]"
        >
          <div className="h-1 w-full bg-[var(--crtgo-primary)]" />


          <header className="flex items-start justify-between gap-5 px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
            <div>
              <div className="flex size-11 items-center justify-center rounded-[15px] bg-[var(--crtgo-primary-soft)] text-[var(--crtgo-primary)]">
                <Clock3 className="size-5" />
              </div>

              <h2 className="mt-4 text-[22px] font-black">
                {t(
                  "workingHours"
                )}
              </h2>

              <p className="mt-1 text-sm font-medium text-neutral-500">
                {t(
                  "weeklyHours"
                )}
              </p>
            </div>


            <button
              type="button"
              onClick={
                close
              }
              aria-label={t(
                "close"
              )}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition duration-200 hover:bg-[var(--crtgo-primary)] hover:text-[var(--crtgo-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crtgo-primary)] active:scale-95"
            >
              <X className="size-[18px]" />
            </button>
          </header>


          <div className="border-t border-neutral-100 px-5 pb-5 sm:px-6">
            <WorkingHours
              hours={
                hours
              }
            />
          </div>
        </article>
      )}
    </AnimatedDialog>
  );
}


function WorkingHours({
  hours,
}) {
  const {
    language,
    t,
  } =
    usePublicLanguage();


  const now =
    new Date();


  const todayKey =
    DAY_KEYS[
      now.getDay()
    ];


  return (
    <div>
      {DAY_KEYS.map(
        (
          dayKey
        ) => {
          const rawDay =
            getDayData(
              hours,
              dayKey
            );


          const day =
            normalizeDay(
              rawDay
            );


          const isToday =
            dayKey ===
            todayKey;


          return (
            <div
              key={
                dayKey
              }
              className={`flex min-h-14 items-center justify-between gap-5 border-b border-neutral-100 text-sm last:border-b-0 ${
                isToday
                  ? "font-black"
                  : "font-semibold"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>
                  {t(
                    `days.${dayKey}`
                  )}
                </span>

                {isToday && (
                  <span className="rounded-full bg-[var(--crtgo-primary)] px-2 py-1 text-[9px] font-black text-[var(--crtgo-on-primary)]">
                    {t(
                      "today"
                    )}
                  </span>
                )}
              </div>


              <span
                dir="ltr"
                lang={
                  language
                }
                className={
                  day.isOpenDay
                    ? "font-black text-neutral-700"
                    : "font-black text-red-500"
                }
              >
                {day.isOpenDay
                  ? `${day.from} — ${day.to}`
                  : t(
                      "closed"
                    )}
              </span>
            </div>
          );
        }
      )}
    </div>
  );
}


function SectionItemsModal({
  open,
  section,
  onClose,
  onOpenItem,
}) {
  const {
    dir,
    language,
    text,
    t,
  } =
    usePublicLanguage();


  if (
    !section
  ) {
    return (
      <AnimatedDialog
        open={
          false
        }
        onClose={
          onClose
        }
      >
        {() =>
          null
        }
      </AnimatedDialog>
    );
  }


  const sectionName =
    text(
      section.section,
      "name",
      t(
        "sectionFallback"
      )
    );


  const description =
    text(
      section.section,
      "description"
    );


  return (
    <AnimatedDialog
      open={
        open
      }
      onClose={
        onClose
      }
      panelClassName="max-w-3xl"
    >
      {({
        close,
      }) => (
        <article
          dir={
            dir
          }
          className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[30px] bg-[#f7f7f7] text-neutral-950 shadow-[0_35px_120px_rgba(0,0,0,0.40)] sm:rounded-[32px]"
        >
          <div className="h-1 w-full shrink-0 bg-[var(--crtgo-primary)]" />


          <div className="flex justify-center bg-white pt-3 sm:hidden">
            <span className="h-1 w-10 rounded-full bg-neutral-200" />
          </div>


          <header className="shrink-0 border-b border-neutral-100 bg-white px-5 pb-5 pt-4 sm:px-6 sm:pt-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-[15px] bg-[var(--crtgo-primary-soft)] text-[var(--crtgo-primary)]">
                    <SectionIcon
                      section={
                        section.section
                      }
                      size={
                        19
                      }
                    />
                  </span>

                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-black">
                      {
                        sectionName
                      }
                    </h2>

                    <p className="mt-0.5 text-xs font-semibold text-[var(--crtgo-primary)]">
                      {getItemCountText(
                        section.items.length,
                        language
                      )}
                    </p>
                  </div>
                </div>


                {description && (
                  <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-neutral-500">
                    {
                      description
                    }
                  </p>
                )}
              </div>


              <button
                type="button"
                onClick={
                  close
                }
                aria-label={t(
                  "close"
                )}
                className="flex size-10 cursor-pointer shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition duration-200 hover:bg-[var(--crtgo-primary)] hover:text-[var(--crtgo-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crtgo-primary)] active:scale-95"
              >
                <X className="size-[18px]" />
              </button>
            </div>
          </header>


          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-10 sm:px-5">
            <div className="grid grid-cols-1 gap-3">
              {section.items.map(
                (
                  item,
                  index
                ) => (
                  <SectionListItem
                    key={
                      item?.id ||
                      item?.slug ||
                      index
                    }
                    item={
                      item
                    }
                    eager={
                      index <
                      4
                    }
                    onOpen={() =>
                      onOpenItem(
                        item
                      )
                    }
                  />
                )
              )}
            </div>
          </div>
        </article>
      )}
    </AnimatedDialog>
  );
}


function SectionListItem({
  item,
  onOpen,
  eager = false,
}) {
  const {
    language,
    text,
    t,
  } =
    usePublicLanguage();


  const name =
    text(
      item,
      "name",
      t(
        "itemFallback"
      )
    );


  const description =
    text(
      item,
      "description"
    );


  const image =
    getImageUrl(
      item?.image_url
    ) ||
    getImageUrl(
      item?.imageUrl
    ) ||
    getImageUrl(
      item?.image
    );


  const price =
    formatPrice(
      item?.price,
      language
    );


  const available =
    item?.is_available !==
      false &&
    item?.available !==
      false;


  return (
    <button
      type="button"
      onClick={
        onOpen
      }
      className="group flex w-full cursor-pointer gap-3 rounded-[22px] border border-black/[0.05] bg-white p-3 text-start shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--crtgo-primary)] hover:shadow-[0_12px_30px_var(--crtgo-primary-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crtgo-primary)] focus-visible:ring-offset-2 active:scale-[0.99] sm:gap-4"
    >
      <div className="relative size-27 shrink-0 overflow-hidden rounded-[17px] bg-neutral-100 sm:size-32">
        {image ? (
          <Image
            src={
              image
            }
            alt={
              name
            }
            fill
            loading={
              eager
                ? "eager"
                : "lazy"
            }
            fetchPriority={
              eager
                ? "high"
                : "auto"
            }
            sizes="128px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-black tracking-[0.12em] text-neutral-300">
            CRTGO
          </div>
        )}
      </div>


      <div className="flex min-w-0 flex-1 flex-col py-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-black leading-6 text-neutral-950 transition group-hover:text-[var(--crtgo-primary)] sm:text-base">
            {
              name
            }
          </h3>


          {price !==
            null && (
            <strong className="shrink-0 rounded-full bg-[var(--crtgo-primary-soft)] px-2.5 py-1 text-sm font-black text-[var(--crtgo-primary)]">
              ₪
              {
                price
              }
            </strong>
          )}
        </div>


        {description && (
          <p className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-5 text-neutral-500 sm:text-sm sm:leading-6">
            {
              description
            }
          </p>
        )}


        <div className="mt-auto flex items-center justify-between pt-3">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold ${
              available
                ? "text-emerald-600"
                : "text-neutral-400"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                available
                  ? "bg-emerald-500"
                  : "bg-neutral-300"
              }`}
            />

            {available
              ? t(
                  "available"
                )
              : t(
                  "unavailable"
                )}
          </span>


          <span className="flex size-8 items-center justify-center rounded-full bg-neutral-50 text-neutral-300 transition duration-200 group-hover:bg-[var(--crtgo-primary)] group-hover:text-[var(--crtgo-on-primary)]">
            <Maximize2 className="size-4" />
          </span>
        </div>
      </div>
    </button>
  );
}


function ItemDetailsModal({
  open,
  item,
  onClose,
}) {
  const {
    dir,
    language,
    text,
    t,
  } =
    usePublicLanguage();


  if (
    !item
  ) {
    return (
      <AnimatedDialog
        open={
          false
        }
        onClose={
          onClose
        }
      >
        {() =>
          null
        }
      </AnimatedDialog>
    );
  }


  const name =
    text(
      item,
      "name",
      t(
        "itemFallback"
      )
    );


  const description =
    text(
      item,
      "description"
    );


  const image =
    getImageUrl(
      item?.image_url
    ) ||
    getImageUrl(
      item?.imageUrl
    ) ||
    getImageUrl(
      item?.image
    );


  const price =
    formatPrice(
      item?.price,
      language
    );


  const available =
    item?.is_available !==
      false &&
    item?.available !==
      false;


  return (
    <AnimatedDialog
      open={
        open
      }
      onClose={
        onClose
      }
      align="center"
      panelClassName="max-w-xl"
    >
      {({
        close,
      }) => (
        <article
          dir={
            dir
          }
          className="max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-[30px] bg-white text-neutral-950 shadow-[0_35px_120px_rgba(0,0,0,0.45)] sm:rounded-[34px]"
        >
          {image ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[30px] bg-neutral-100 sm:aspect-[16/10] sm:rounded-t-[34px]">
              <Image
                src={
                  image
                }
                alt={
                  name
                }
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 640px) 100vw, 576px"
                className="object-cover"
              />


              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/35 to-transparent" />


              <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--crtgo-primary)]" />


              <button
                type="button"
                onClick={
                  close
                }
                aria-label={t(
                  "close"
                )}
                className={`absolute top-4 flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/60 bg-white/90 text-neutral-950 shadow-lg backdrop-blur-xl transition duration-200 hover:scale-105 hover:border-[var(--crtgo-primary)] hover:bg-[var(--crtgo-primary)] hover:text-[var(--crtgo-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crtgo-primary)] active:scale-95 ${
                  dir ===
                  "rtl"
                    ? "left-4"
                    : "right-4"
                }`}
              >
                <X className="size-5" />
              </button>
            </div>
          ) : (
            <div className="relative flex h-28 items-center justify-center rounded-t-[30px] border-b-[3px] border-[var(--crtgo-primary)] bg-[var(--crtgo-primary-soft)] sm:rounded-t-[34px]">
              <span className="text-xs font-black tracking-[0.15em] text-[var(--crtgo-primary)]">
                CRTGO
              </span>

              <button
                type="button"
                onClick={
                  close
                }
                aria-label={t(
                  "close"
                )}
                className={`absolute top-4 flex size-11 cursor-pointer items-center justify-center rounded-full bg-white text-neutral-950 shadow transition duration-200 hover:bg-[var(--crtgo-primary)] hover:text-[var(--crtgo-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crtgo-primary)] active:scale-95 ${
                  dir ===
                  "rtl"
                    ? "left-4"
                    : "right-4"
                }`}
              >
                <X className="size-5" />
              </button>
            </div>
          )}


          <div className="p-5 sm:p-7">
            <div className="flex items-start justify-between gap-5">
              <h2 className="text-balance text-[25px] font-black leading-tight text-neutral-950 sm:text-[31px]">
                {
                  name
                }
              </h2>


              {price !==
                null && (
                <strong className="shrink-0 rounded-full border border-[var(--crtgo-primary-border)] bg-[var(--crtgo-primary-soft)] px-3 py-1.5 text-lg font-black text-[var(--crtgo-primary)]">
                  ₪
                  {
                    price
                  }
                </strong>
              )}
            </div>


            {description && (
              <p className="mt-4 whitespace-pre-line text-[15px] font-medium leading-7 text-neutral-500">
                {
                  description
                }
              </p>
            )}


            <div className="mt-6 border-t border-neutral-100 pt-5">
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black ${
                  available
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-neutral-100 text-neutral-500"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    available
                      ? "bg-emerald-500"
                      : "bg-neutral-300"
                  }`}
                />

                {available
                  ? t(
                      "availableNow"
                    )
                  : t(
                      "unavailableNow"
                    )}
              </div>
            </div>
          </div>
        </article>
      )}
    </AnimatedDialog>
  );
}


function Footer() {
  const {
    t,
  } =
    usePublicLanguage();


  const year =
    new Date().getFullYear();


  return (
    <footer className="rounded-t-[34px] border-t border-black/[0.07] bg-white text-neutral-950">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr] md:gap-14">
          <div className="max-w-sm">
            <a
              href="https://ws.crtgo.com"
              target="_blank"
              rel="noreferrer"
              aria-label="CRTGO Web Services"
              className="group inline-block cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crtgo-primary)] focus-visible:ring-offset-4"
            >
              <Image
                src="https://cdn.sanity.io/images/gcqd797l/production/0c5e88596ed93c207cc800ed61eee3bc2a9f4d00-3750x3750.png"
                alt="CRTGO Web Services"
                width={
                  250
                }
                height={
                  250
                }
                loading="lazy"
                sizes="150px"
                className="h-auto w-[130px] object-contain transition duration-300 group-hover:scale-[1.035] sm:w-[150px]"
              />
            </a>


            <p className="mt-5 max-w-xs text-sm font-medium leading-6 text-neutral-500">
              {t(
                "footerDescription"
              )}
            </p>
          </div>


          <FooterNavigation
            title={t(
              "footerExplore"
            )}
            links={[
              {
                href:
                  "https://crtgo.com",

                label:
                  t(
                    "footerWebsite"
                  ),
              },

              {
                href:
                  "https://ws.crtgo.com",

                label:
                  t(
                    "footerWebServices"
                  ),
              },
            ]}
          />


          <FooterNavigation
            title={t(
              "footerInformation"
            )}
            links={[
              {
                href:
                  "https://crtgo.com/terms",

                label:
                  t(
                    "footerTerms"
                  ),
              },

              {
                href:
                  "https://crtgo.com/privacy",

                label:
                  t(
                    "footerPrivacy"
                  ),
              },

              {
                href:
                  "https://crtgo.com/contact",

                label:
                  t(
                    "footerContact"
                  ),
              },
            ]}
          />
        </div>


        <div className="mt-10 h-px w-full bg-black/[0.07]" />


        <div className="mt-5 flex flex-col gap-3 text-xs font-medium text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} CRTGO.{" "}
            {t(
              "footerCopyright"
            )}
          </p>


          <a
            href="https://ws.crtgo.com"
            target="_blank"
            rel="noreferrer"
            className="group flex w-fit cursor-pointer items-center gap-2 rounded-full px-2 py-1 font-bold text-neutral-500 transition duration-200 hover:bg-[var(--crtgo-primary-soft)] hover:text-[var(--crtgo-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crtgo-primary)]"
          >
            <span className="size-1.5 rounded-full bg-[var(--crtgo-primary)]" />

            CRTGO Web Services
          </a>
        </div>
      </div>
    </footer>
  );
}


function FooterNavigation({
  title,
  links,
}) {
  return (
    <nav>
      <p className="mb-4 text-[11px] font-black uppercase tracking-[0.14em] text-neutral-400">
        {
          title
        }
      </p>


      <div className="flex flex-col items-start gap-1">
        {links.map(
          (
            link
          ) => (
            <FooterLink
              key={
                link.href
              }
              href={
                link.href
              }
            >
              {
                link.label
              }
            </FooterLink>
          )
        )}
      </div>
    </nav>
  );
}


function FooterLink({
  href,
  children,
}) {
  return (
    <a
      href={
        href
      }
      target="_blank"
      rel="noreferrer"
      className="group relative cursor-pointer rounded-lg py-1.5 pe-3 ps-0 text-sm font-semibold text-neutral-600 transition duration-200 hover:ps-2 hover:text-[var(--crtgo-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crtgo-primary)]"
    >
      <span className="absolute start-0 top-1/2 h-0 w-[3px] -translate-y-1/2 rounded-full bg-[var(--crtgo-primary)] transition-all duration-200 group-hover:h-4" />

      {
        children
      }
    </a>
  );
}


function SectionIcon({
  section,
  size = 17,
}) {
  const type =
    section?.iconType ||
    section?.icon_type ||
    "none";


  const value =
    section?.iconValue ||
    section?.icon_value ||
    null;


  if (
    !value ||
    type ===
      "none"
  ) {
    return null;
  }


  if (
    type ===
    "emoji"
  ) {
    return (
      <span
        className="shrink-0 leading-none"
        style={{
          fontSize:
            size,
        }}
      >
        {
          value
        }
      </span>
    );
  }


  if (
    type ===
    "lucide"
  ) {
    const Icon =
      SECTION_ICONS[
        value
      ];

    if (!Icon) {
      return null;
    }

    return (
      <Icon
        size={
          size
        }
        strokeWidth={
          2
        }
        className="shrink-0"
      />
    );
  }


  return null;
}