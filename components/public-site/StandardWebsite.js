"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import RatingBox from "./RatingBox";
import {
  Clock3,
  Search,
  Share2,
  Star,
  X,
  Maximize2,
  MapPin,
  Phone,
} from "lucide-react";


import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";

import {
  FaXTwitter,
} from "react-icons/fa6";

import {
  SECTION_ICONS,
} from "./sectionIcons";

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

const DAY_NAMES = {
  sunday: "الأحد",
  monday: "الاثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
  saturday: "السبت",
};

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeText(value, fallback = "") {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    const text = String(value).trim();
    return text || fallback;
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "object") {
    const possibleValues = [
      value.ar,
      value.arabic,
      value.text,
      value.label,
      value.name,
      value.address,
      value.value,
      value.title,
      value.default,
    ];

    for (const item of possibleValues) {
      if (
        typeof item === "string" ||
        typeof item === "number"
      ) {
        const text = String(item).trim();

        if (text) {
          return text;
        }
      }
    }
  }

  return fallback;
}

function getImageUrl(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    const possibleUrls = [
      value.url,
      value.src,
      value.publicUrl,
      value.public_url,
      value.image_url,
    ];

    for (const url of possibleUrls) {
      if (typeof url === "string" && url.trim()) {
        return url;
      }
    }
  }

  return null;
}

function formatPrice(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    const text = safeText(value);

    return text || null;
  }

  return new Intl.NumberFormat("he-IL", {
    maximumFractionDigits: 2,
  }).format(number);
}

function timeToMinutes(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const parts = value.split(":");

  if (parts.length < 2) {
    return null;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function getDayData(workingHours, dayKey) {
  if (
    !workingHours ||
    typeof workingHours !== "object"
  ) {
    return null;
  }

  return (
    workingHours[dayKey] ||
    workingHours[SHORT_DAY_KEYS[dayKey]] ||
    null
  );
}

function normalizeDay(data) {
  if (!data || typeof data !== "object") {
    return {
      isOpenDay: false,
      from: "",
      to: "",
    };
  }

  const closed =
    data.closed === true ||
    data.is_open === false ||
    data.open === false ||
    data.enabled === false;

  const from =
    safeText(data.from) ||
    safeText(data.open_time) ||
    safeText(data.start) ||
    safeText(data.opens) ||
    (typeof data.open === "string"
      ? data.open
      : "");

  const to =
    safeText(data.to) ||
    safeText(data.close_time) ||
    safeText(data.end) ||
    safeText(data.closes) ||
    (typeof data.close === "string"
      ? data.close
      : "");

  return {
    isOpenDay: !closed && Boolean(from && to),
    from,
    to,
  };
}

function isNowInsideRange(from, to) {
  const start = timeToMinutes(from);
  const end = timeToMinutes(to);

  if (start === null || end === null) {
    return false;
  }

  const now = new Date();

  const current =
    now.getHours() * 60 +
    now.getMinutes();

  if (end < start) {
    return current >= start || current < end;
  }

  return current >= start && current < end;
}

function getTodayWorkingHours(workingHours) {
  const now = new Date();

  const dayKey = DAY_KEYS[now.getDay()];

  const data = getDayData(
    workingHours,
    dayKey
  );

  const day = normalizeDay(data);

  if (!day.isOpenDay) {
    return {
      dayKey,
      dayName: DAY_NAMES[dayKey],
      label: "مغلق اليوم",
      isOpenNow: false,
      isOpenDay: false,
    };
  }

  return {
    dayKey,
    dayName: DAY_NAMES[dayKey],
    label: `${day.from} - ${day.to}`,
    isOpenNow: isNowInsideRange(
      day.from,
      day.to
    ),
    isOpenDay: true,
  };
}

function getSectionId(section) {
  return `section-${section?.id || section?.slug || "menu"}`;
}

export default function StandardWebsite({
  website,
}) {
  const [query, setQuery] = useState("");
  const [workingHoursOpen, setWorkingHoursOpen] = useState(false);

  const sections = useMemo(() => {
    return toArray(website?.sections);
  }, [website?.sections]);

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden"
      style={{
        backgroundColor:
          safeText(website?.backgroundColor) ||
          "#ffffff",

        color:
          safeText(website?.textColor) ||
          "#111111",

        "--crtgo-primary":
          safeText(website?.primaryColor) ||
          "#e32b2b",
      }}
    >
<RestaurantHeader
  website={website}
  onOpenWorkingHours={() => setWorkingHoursOpen(true)}
/>

      <div
        className="relative z-[1] pt-90 -mt-80 rounded-t-3xl bg-red-800"
        style={{
          backgroundColor:
            safeText(
              website?.backgroundColor
            ) || "#ffffff",
        }}
      >
        <MenuSearch
          query={query}
          setQuery={setQuery}
        />

        <SectionNavigation
          sections={sections}
        />

        <MenuSections
          sections={sections}
          query={query}
        />
      </div>



      {workingHoursOpen && (
  <div
    className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4"
    onClick={() => setWorkingHoursOpen(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full rounded-t-[28px] bg-white p-5 text-black shadow-2xl sm:max-w-md sm:rounded-[28px]"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black">
            ساعات العمل
          </h2>

          <p className="mt-1 text-sm font-medium text-neutral-500">
            أوقات العمل لهذا الأسبوع
          </p>
        </div>

        <button
          type="button"
          onClick={() => setWorkingHoursOpen(false)}
          className="flex cursor-pointer h-10 w-10 items-center justify-center rounded-full bg-neutral-100 transition hover:bg-neutral-200"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-5">
        <WorkingHours hours={website.workingHours} />
      </div>
    </div>
  </div>
)}
    </main>
  );
}

function RestaurantHeader({
  website,
  onOpenWorkingHours,
}) {
const phone =
  safeText(website?.phone);

const whatsapp =
  safeText(website?.whatsapp);

const instagram =
  safeText(website?.instagram);

const facebook =
  safeText(website?.facebook);

const tiktok =
  safeText(website?.tiktok);

  const explicitHours =
    safeText(
      website?.workingHoursText
    ) ||
    safeText(
      website?.working_hours_text
    );

  const workingHours =
    website?.workingHours ||
    website?.working_hours ||
    null;

  const [today, setToday] = useState({
    dayName: "",
    label:
      explicitHours ||
      "ساعات العمل",
    isOpenNow: null,
    isOpenDay: true,
  });

  useEffect(() => {
    if (explicitHours) {
      setToday({
        dayName: "",
        label: explicitHours,
        isOpenNow: null,
        isOpenDay: true,
      });

      return;
    }

    if (
      workingHours &&
      typeof workingHours === "object"
    ) {
      setToday(
        getTodayWorkingHours(
          workingHours
        )
      );
      return;
    }

    setToday({
      dayName: "",
      label: "ساعات العمل",
      isOpenNow: null,
      isOpenDay: true,
    });
  }, [
    explicitHours,
    workingHours,
  ]);

  const cover =
    getImageUrl(
      website?.coverUrl
    ) ||
    getImageUrl(
      website?.cover_url
    ) ||
    getImageUrl(
      website?.cover
    );

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
    safeText(
      website?.name
    ) ||
    safeText(
      website?.displayName
    ) ||
    safeText(
      website?.display_name
    ) ||
    "اسم المطعم";

  const location =
    safeText(
      website?.location
    ) ||
    safeText(
      website?.address
    );

  const description =
    safeText(
      website?.description
    );

  const rating =
    safeText(
      website?.rating,
      "4.2"
    );

  const reviews =
    safeText(
      website?.reviewsCount
    ) ||
    safeText(
      website?.reviews_count
    ) ||
    safeText(
      website?.reviews,
      "1000+"
    );

  const deliveryTime =
    safeText(
      website?.deliveryTime
    ) ||
    safeText(
      website?.delivery_time
    ) ||
    "35-45 د";

  const minimumOrderValue =
    website?.minimumOrder ??
    website?.minimum_order ??
    null;

  const formattedMinimum =
    formatPrice(
      minimumOrderValue
    );

  const minimumOrder =
    formattedMinimum
      ? `₪${formattedMinimum}`
      : "₪17";

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
    today.isOpenNow ??
    false;

  async function handleShare() {
    if (typeof window === "undefined") {
      return;
    }

    const shareData = {
      title: name,
      text: `شاهد قائمة ${name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
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
      // Share cancelled
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
      behavior: "smooth",
      block: "center",
    });

    setTimeout(() => {
      input.focus();
    }, 350);
  }

  return (
    <header
      dir="rtl"
      className="relative"
    >
      {/* COVER */}
      <section className="relative h-[300px] overflow-hidden sm:h-[360px]">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-red-700 to-orange-500" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 to-black/50" />

        {/* TOP BUTTONS */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-5 sm:px-6">
          <button
            type="button"
            onClick={onOpenWorkingHours}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white text-neutral-950 shadow-lg transition active:scale-95"
            aria-label="working hours"
          >
            <Clock3
              className="size-6"
              strokeWidth={2}
            />
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSearch}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/25 text-white shadow-sm backdrop-blur-xl transition hover:bg-black/35 active:scale-95"
              aria-label="بحث"
            >
              <Search className="size-5" />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/25 text-white shadow-sm backdrop-blur-xl transition hover:bg-black/35 active:scale-95"
              aria-label="مشاركة"
            >
              <Share2 className="size-5" />
            </button>
          </div>
        </div>
      </section>



<div className="absolute flex items-center justify-around w-full top-[160] left-1/2 -translate-x-1/2">
<SocialLinksRow
  phone={phone}
  whatsapp={whatsapp}
  instagram={instagram}
  facebook={facebook}
  tiktok={tiktok}
/>
</div>



      {/* FLOATING CARD */}
      <div className="relative z-10 -mt-20 px-5 sm:px-5">
        <div className="relative mx-auto max-w-5xl rounded-[2rem] bg-white px-5 pb-6 pt-5 shadow-2xl sm:px-8 sm:pb-8 sm:pt-20">
          
          <div className="flex items-center jusitify-between">
          
          {/* LOGO */}
            <div className="relative size-28 overflow-hidden rounded-full border-[5px] border-white bg-neutral-100 shadow-xl sm:size-32 md:absolute md:left-5 md:top-[-60px]">
              {logo ? (
                <Image
                  src={logo}
                  alt={name}
                  fill
                  sizes="128px"
                  className="object-cover pointer-events-none"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-4xl font-black text-neutral-300">
                  {name.charAt(0)}
                </div>
              )}
            </div>

<div className="flex flex-col flex-1 items-center justify-end md:justify-center md:w-[90%] gap-2">
          {/* NAME */}
          <div>
            <h1 className="max-w-[90%] md:w-[90%] md:max-w-full text-right md:text-center text-[28px] font-black sm:text-4xl">
              {name}
            </h1>

            {location && (
              <div className="mt-3 flex items-start gap-1.5 text-neutral-500">
                <MapPin className="mt-1 size-4 shrink-0" />

                <p className="text-sm font-medium leading-6 sm:text-[15px]">
                  {location}
                </p>
              </div>
            )}
</div>
</div>
            <div className="mt-4">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
                  isOpen
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                <span
                  className={`size-[6px] rounded-full ${
                    isOpen
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
                />

                {isOpen
                  ? "مفتوح الآن"
                  : "مغلق الآن"}
              </span>

</div>
</div>
          {description && (
            <p className="pt-8 mx-auto w-[90%] max-w-2xl text-center text-sm font-medium leading-7 text-neutral-500 sm:text-[15px]">
              {description}
            </p>
          )}

<div className="w-[98%] mx-auto bg-neutral-400 my-4 h-[1px]"></div>

          {/* STATS */}
          <div className="mt-7 flex items-center justify-around">
            {/* RATING */}
            <div className="flex w-[150px] transition hover:bg-neutral-100 cursor-pointer flex-col items-center rounded-2xl border border-neutral-100 bg-neutral-50/80 px-2 py-4 text-center sm:rounded-[24px] sm:py-5">
              <div className="flex size-10 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                <Star className="size-5 fill-current" />
              </div>

                    <div className="mt-2 cusror-ointer">
  <RatingBox
    projectId={website.id}
  />
</div>
            </div>

            {/* HOURS */}
<button
  type="button"
  onClick={onOpenWorkingHours}
  className="flex w-[150px] cursor-pointer flex-col items-center rounded-2xl border border-neutral-100 bg-neutral-50/80 px-2 py-4 text-center transition hover:bg-neutral-100 active:scale-[0.98] sm:rounded-[24px] sm:py-5"
>
  <div className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-500">
    <Clock3 className="size-5" />
  </div>

  <strong
    dir="ltr"
    className="mt-2 max-w-full truncate text-[12px] font-black sm:text-base"
  >
    {today.label}
  </strong>

  <span className="mt-0.5 text-[11px] font-medium text-neutral-500 sm:text-sm">
    {today.dayName || "ساعات العمل"}
  </span>
</button>

            {/* DELIVERY 
            <div className="flex min-w-0 flex-col items-center rounded-2xl border border-neutral-100 bg-neutral-50/80 px-2 py-4 text-center sm:rounded-[24px] sm:py-5">
              <div className="flex size-10 items-center justify-center rounded-full bg-red-50 text-red-500">
                <Bike className="size-5" />
              </div>

              <strong className="mt-2 whitespace-nowrap text-[13px] font-black sm:text-base">
                {deliveryTime}
              </strong>

              <span className="mt-0.5 max-w-full truncate text-[11px] font-medium text-neutral-500 sm:text-sm">
                الحد الأدنى {minimumOrder}
              </span>
            </div>
            */}
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuSearch({
  query,
  setQuery,
}) {
  return (
    <div className="mx-auto mt-2 max-w-5xl px-4 sm:px-5">
      <div className="relative">
        <Search className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-neutral-400" />

        <input
          id="menu-search"
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(
              event.target.value
            )
          }
          placeholder="البحث عن منتجات"
          className="h-14 w-full rounded-2xl border border-neutral-300 bg-neutral-100 pr-12 pl-4 text-sm font-medium text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-200 focus:bg-white focus:shadow-sm"
        />
      </div>
    </div>
  );
}

function SectionNavigation({
  sections,
}) {
  if (!sections.length) {
    return null;
  }

  function scrollToSection(
    section
  ) {
    const element =
      document.getElementById(
        getSectionId(section)
      );

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="mx-auto mt-5 max-w-5xl">
      <div className="flex gap-2 overflow-x-auto px-4 py-8 sm:px-5 [&::-webkit-scrollbar]:hidden">
        {sections.map(
          (section) => {
            const name =
              safeText(
                section?.name_ar
              ) ||
              safeText(
                section?.name
              ) ||
              safeText(
                section?.name_i18n
              ) ||
              "قسم";

            return (
<button
  key={
    section?.id ||
    section?.slug ||
    name
  }
  type="button"
  onClick={() =>
    scrollToSection(section)
  }
  className="flex shrink-0 items-center gap-2 rounded-full border-4 border-white bg-orange-200/30 px-5 py-2.5 text-sm font-bold text-neutral-700 shadow-xl cursor-pointer transition hover:bg-neutral-200 active:scale-95"
>
  <div className="rounded-full w-9 h-9 flex items-center justify-center bg-orange-200">
  <SectionIcon
    section={section}
    size={15}
  />
</div>
  <span>{name}</span>
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
  const [selectedItem, setSelectedItem] =
    useState(null);

  const [
    expandedSection,
    setExpandedSection,
  ] = useState(null);

  const normalizedQuery =
    query.trim().toLowerCase();

  const modalOpen =
    Boolean(selectedItem) ||
    Boolean(expandedSection);

  /*
   * Lock background scrolling whenever
   * one of the menu modals is open.
   */
  useEffect(() => {
    if (!modalOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(event) {
      if (event.key !== "Escape") {
        return;
      }

      /*
       * Close item modal first if it
       * was opened from the section modal.
       */
      if (selectedItem) {
        setSelectedItem(null);
        return;
      }

      setExpandedSection(null);
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    modalOpen,
    selectedItem,
  ]);

  if (!sections.length) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-5">
        <p className="text-lg font-black text-neutral-950">
          لا توجد منتجات بعد
        </p>

        <p className="mt-2 text-sm font-medium text-neutral-500">
          ستظهر أقسام القائمة هنا.
        </p>
      </div>
    );
  }

  let searchHasResults = false;

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 sm:px-5">
        {sections.map(
          (section) => {
            const sectionName =
              safeText(
                section?.name_ar
              ) ||
              safeText(
                section?.name
              ) ||
              safeText(
                section?.name_i18n
              ) ||
              "القائمة";

            const items =
              toArray(
                section?.items
              );

            const filteredItems =
              normalizedQuery
                ? items.filter(
                    (item) =>
                      itemMatchesQuery(
                        item,
                        normalizedQuery
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
                id={getSectionId(
                  section
                )}
                className="scroll-mt-6 py-7"
              >
                {/* SECTION HEADER */}
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <SectionIcon
                        section={
                          section
                        }
                        size={23}
                      />

                      <h2 className="truncate text-2xl font-black tracking-[-0.04em] text-neutral-950 sm:text-3xl">
                        {
                          sectionName
                        }
                      </h2>
                    </div>

                    {section.description && (
                      <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-neutral-500">
                        {
                          section.description
                        }
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-xs font-bold text-neutral-400">
                    {
                      filteredItems.length
                    }{" "}
                    منتج
                  </span>
                </div>

                {filteredItems.length >
                0 ? (
                  <>
                    {/*
                     * 2 columns on mobile
                     * 3 on medium+
                     * maximum 4 on XL.
                     */}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
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
                              index >= 1
                                ? "hidden sm:block"
                                : ""
                            }
                          >
                            <MenuItem
                              item={
                                item
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

                    {/*
                     * MOBILE ONLY:
                     * first 8 products +
                     * full section button.
                     */}
                    {hasMoreOnMobile && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSection(
                            {
                              section,
                              sectionName,
                              items:
                                filteredItems,
                            }
                          )
                        }
                        className="mt-4 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-2xl border border-neutral-200 bg-white px-5 text-sm font-black text-neutral-950 transition active:scale-[0.99] sm:hidden"
                      >
                        عرض الكل{" "}
                        (
                        {
                          filteredItems.length
                        }
                        )
                      </button>
                    )}
                  </>
                ) : (
                  <div className="rounded-2xl bg-neutral-50 px-5 py-8 text-center">
                    <p className="text-sm font-medium text-neutral-500">
                      لا توجد منتجات
                      في هذا القسم
                      حالياً.
                    </p>
                  </div>
                )}
              </section>
            );
          }
        )}

        {normalizedQuery &&
          !searchHasResults && (
            <div className="py-20 text-center">
              <Search className="mx-auto size-7 text-neutral-300" />

              <h3 className="mt-4 text-lg font-black text-neutral-950">
                لم نجد نتائج
              </h3>

              <p className="mt-1 text-sm font-medium text-neutral-500">
                جرّب البحث عن
                منتج آخر.
              </p>
            </div>
          )}
      </div>

      {/* FULL SECTION MODAL */}
      {expandedSection && (
        <SectionItemsModal
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
      )}

      {/* ITEM DETAILS MODAL */}
      {selectedItem && (
        <ItemDetailsModal
          item={
            selectedItem
          }
          onClose={() =>
            setSelectedItem(
              null
            )
          }
        />
      )}
    </>
  );
}

function itemMatchesQuery(
  item,
  normalizedQuery
) {
  const name =
    safeText(
      item?.name_ar
    ) ||
    safeText(
      item?.name
    ) ||
    safeText(
      item?.name_i18n
    );

  const description =
    safeText(
      item?.description_ar
    ) ||
    safeText(
      item?.description
    ) ||
    safeText(
      item?.description_i18n
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
}) {
  const name =
    safeText(
      item?.name_ar
    ) ||
    safeText(
      item?.name
    ) ||
    safeText(
      item?.name_i18n
    ) ||
    "منتج";

  const description =
    safeText(
      item?.description_ar
    ) ||
    safeText(
      item?.description
    ) ||
    safeText(
      item?.description_i18n
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
      item?.price
    );

  const available =
    item?.is_available !==
      false &&
    item?.available !==
      false;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group cursor-pointer flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-neutral-100 bg-white text-right shadow-[0_5px_24px_rgba(0,0,0,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(0,0,0,0.08)] active:scale-[0.99]"
    >
      {/* IMAGE */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-neutral-300">
            CRTGO
          </div>
        )}

        {!available && (
          <span className="absolute right-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black text-neutral-500 shadow-sm">
            غير متوفر
          </span>
        )}

        <span className="absolute bottom-2 left-2 flex size-8 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-sm backdrop-blur">
          <Maximize2 className="size-3.5" />
        </span>
      </div>

      {/* INFO */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-black leading-5 text-neutral-950 sm:text-base sm:leading-6">
          {name}
        </h3>

        {description && (
          <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-5 text-neutral-500 sm:text-sm">
            {description}
          </p>
        )}

        <div className="mt-auto pt-4">
          {price !== null && (
            <strong className="text-sm font-black text-[var(--crtgo-primary)] sm:text-base">
              ₪{price}
            </strong>
          )}
        </div>
      </div>
    </button>
  );
}



function SectionItemsModal({
  section,
  onClose,
  onOpenItem,
}) {
  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[1100] overflow-y-auto overscroll-contain bg-white text-neutral-950"
    >
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-20 border-b border-neutral-100 bg-white/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <SectionIcon
                section={
                  section.section
                }
                size={20}
              />

              <h2 className="truncate text-xl font-black">
                {
                  section.sectionName
                }
              </h2>
            </div>

            <p className="mt-1 text-xs font-semibold text-neutral-400">
              {
                section.items
                  .length
              }{" "}
              منتج
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="flex size-11 cursor-pointer shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-800 transition active:scale-95"
          >
            <X className="size-5" />
          </button>
        </div>
      </header>

      {/* ONE COLUMN */}
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 px-4 py-5 pb-12">
        {section.items.map(
          (item, index) => (
            <SectionListItem
              key={
                item?.id ||
                item?.slug ||
                index
              }
              item={item}
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
  );
}



function SectionListItem({
  item,
  onOpen,
}) {
  const name =
    safeText(
      item?.name_ar
    ) ||
    safeText(
      item?.name
    ) ||
    safeText(
      item?.name_i18n
    ) ||
    "منتج";

  const description =
    safeText(
      item?.description_ar
    ) ||
    safeText(
      item?.description
    ) ||
    safeText(
      item?.description_i18n
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
      item?.price
    );

  const available =
    item?.is_available !==
      false &&
    item?.available !==
      false;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full cursor-pointer gap-4 rounded-[22px] border border-neutral-100 bg-white p-3 text-right shadow-[0_4px_18px_rgba(0,0,0,0.035)] transition active:scale-[0.99]"
    >
      <div className="relative size-28 shrink-0 overflow-hidden rounded-[18px] bg-neutral-100 sm:size-32">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="128px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-black text-neutral-300">
            CRTGO
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col py-1">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-black leading-6 text-neutral-950">
              {name}
            </h3>

            {price !== null && (
              <strong className="shrink-0 text-sm font-black text-[var(--crtgo-primary)]">
                ₪{price}
              </strong>
            )}
          </div>

          {description && (
            <p className="mt-2 text-sm font-medium leading-6 text-neutral-500">
              {description}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          {!available ? (
            <span className="text-xs font-black text-neutral-400">
              غير متوفر
            </span>
          ) : (
            <span className="text-xs font-bold text-emerald-600">
              متوفر
            </span>
          )}

          <Maximize2 className="size-4 text-neutral-300" />
        </div>
      </div>
    </button>
  );
}


function ItemDetailsModal({
  item,
  onClose,
}) {
  const name =
    safeText(
      item?.name_ar
    ) ||
    safeText(
      item?.name
    ) ||
    safeText(
      item?.name_i18n
    ) ||
    "منتج";

  const description =
    safeText(
      item?.description_ar
    ) ||
    safeText(
      item?.description
    ) ||
    safeText(
      item?.description_i18n
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
      item?.price
    );

  const available =
    item?.is_available !==
      false &&
    item?.available !==
      false;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/45 backdrop-blur-[3px] sm:items-center sm:p-5 no-scrollbar"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <article className="relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-[30px] bg-white text-neutral-950 shadow-2xl sm:max-w-xl sm:rounded-[30px]">
        {/* MOBILE HANDLE */}
        <div className="sticky top-0 z-30 flex h-0 justify-center sm:hidden">
          <span className="mt-3 h-1 w-10 rounded-full bg-white/80 shadow" />
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute cursor-pointer left-4 top-4 z-30 flex size-11 items-center justify-center rounded-full bg-white/95 text-neutral-950 shadow-md backdrop-blur transition active:scale-95"
        >
          <X className="size-5" />
        </button>

        {image && (
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 sm:aspect-[16/10]">
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, 576px"
              className="object-cover"
            />
          </div>
        )}

        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-5">
            <h2 className="text-2xl font-black leading-tight tracking-[-0.04em] sm:text-3xl">
              {name}
            </h2>

            {price !== null && (
              <strong className="shrink-0 text-xl font-black text-[var(--crtgo-primary)]">
                ₪{price}
              </strong>
            )}
          </div>

          {description && (
            <p className="mt-4 whitespace-pre-line text-[15px] font-medium leading-7 text-neutral-500">
              {description}
            </p>
          )}

          <div className="mt-6 border-t border-neutral-100 pt-5">
            {available ? (
              <div className="flex items-center gap-2 text-sm font-black text-emerald-600">
                <span className="size-2 rounded-full bg-emerald-500" />
                متوفر حالياً
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm font-black text-neutral-400">
                <span className="size-2 rounded-full bg-neutral-300" />
                غير متوفر حالياً
              </div>
            )}
          </div>
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
  const links = [];

  const cleanPhone =
    String(phone || "").trim();

  const cleanWhatsapp =
    String(whatsapp || "")
      .replace(/\D/g, "");

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

  if (cleanPhone) {
    links.push({
      key: "phone",
      label: "اتصال",
      href: `tel:${cleanPhone}`,
      icon: Phone,
    });
  }

  if (cleanWhatsapp) {
    links.push({
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/${cleanWhatsapp}`,
      icon: FaWhatsapp,
      external: true,
    });
  }

  if (instagramUrl) {
    links.push({
      key: "instagram",
      label: "Instagram",
      href: instagramUrl,
      icon: FaInstagram,
      external: true,
    });
  }

  if (facebookUrl) {
    links.push({
      key: "facebook",
      label: "Facebook",
      href: facebookUrl,
      icon: FaFacebookF,
      external: true,
    });
  }

  if (tiktokUrl) {
    links.push({
      key: "tiktok",
      label: "TikTok",
      href: tiktokUrl,
      icon: FaTiktok,
      external: true,
    });
  }

  if (!links.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map((link) => {
        const Icon =
          link.icon;

        return (
          <a
            key={link.key}
            href={link.href}
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
            title={link.label}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition hover:bg-neutral-950 hover:text-white active:scale-95"
          >
            <Icon className="size-[18px]" />
          </a>
        );
      })}
    </div>
  );
}

function makeSocialUrl(
  value,
  base
) {
  const clean =
    String(value || "").trim();

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


function WorkingHours({ hours }) {
  const now = new Date();
  const todayKey = DAY_KEYS[now.getDay()];

  return (
    <div className="grid">
      {DAY_KEYS.map((dayKey) => {
        const rawDay = getDayData(hours, dayKey);
        const day = normalizeDay(rawDay);
        const isToday = dayKey === todayKey;

        return (
          <div
            key={dayKey}
            className={`flex min-h-14 items-center justify-between gap-5 border-b border-black/10 px-2 text-sm last:border-b-0 ${
              isToday ? "font-black" : "font-bold"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{DAY_NAMES[dayKey]}</span>

              {isToday && (
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] font-black text-neutral-500">
                  اليوم
                </span>
              )}
            </div>

            <span
              dir="ltr"
              className={
                day.isOpenDay
                  ? "font-black text-neutral-700"
                  : "font-black text-red-500"
              }
            >
              {day.isOpenDay
                ? `${day.from} — ${day.to}`
                : "مغلق"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ContactSection({
  website,
  phone,
  whatsapp,
  instagram,
  facebook,
  tiktok,
}) {
  if (
    !phone &&
    !whatsapp &&
    !instagram &&
    !facebook &&
    !tiktok &&
    !website.location
  ) {
    return null;
  }

  return (
    <section className="border-t border-black/10 py-10">
      <p className="text-xs font-black uppercase tracking-[0.18em] opacity-30">
        CONTACT
      </p>

      <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
        تواصل معنا
      </h2>

      <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {phone && (
          <ContactLink
            href={`tel:${phone}`}
            label="الهاتف"
            value={website.phone}
          />
        )}

        {whatsapp && (
          <ContactLink
            href={`https://wa.me/${whatsapp}`}
            label="WhatsApp"
            value={
              website.whatsapp
            }
            external
          />
        )}

        {instagram && (
          <ContactLink
            href={instagram}
            label="Instagram"
            value={
              website.instagram
            }
            external
          />
        )}

        {facebook && (
          <ContactLink
            href={facebook}
            label="Facebook"
            value={
              website.facebook
            }
            external
          />
        )}

        {tiktok && (
          <ContactLink
            href={tiktok}
            label="TikTok"
            value={website.tiktok}
            external
          />
        )}

        {website.location && (
          <div className="rounded-[22px] border border-black/10 p-4">
            <p className="text-xs font-black uppercase opacity-30">
              LOCATION
            </p>

            <p className="mt-2 text-sm font-bold">
              {website.location}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ContactLink({
  href,
  label,
  value,
  external = false,
}) {
  return (
    <a
      href={href}
      target={
        external
          ? "_blank"
          : undefined
      }
      rel={
        external
          ? "noreferrer"
          : undefined
      }
      className="rounded-[22px] border border-black/10 p-4 transition hover:-translate-y-0.5"
    >
      <p className="text-xs font-black uppercase opacity-30">
        {label}
      </p>

      <p
        className="mt-2 truncate text-sm font-bold"
        dir="ltr"
      >
        {value}
      </p>
    </a>
  );
}

function Footer() {
  return (
    <footer className="border-t border-black/10 py-10 text-center">
      <a
        href="https://crtgo.com"
        target="_blank"
        rel="noreferrer"
        className="text-xs font-black uppercase tracking-[0.18em] opacity-30 transition hover:opacity-100"
      >
        Powered by CRTGO
      </a>
    </footer>
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
    type === "none"
  ) {
    return null;
  }

  if (type === "emoji") {
    return (
      <span
        className="shrink-0 leading-none"
        style={{
          fontSize: size,
        }}
      >
        {value}
      </span>
    );
  }

  if (type === "lucide") {
    const Icon =
      SECTION_ICONS[value];

    if (!Icon) {
      return null;
    }

    return (
      <Icon
        size={size}
        strokeWidth={2}
        className="shrink-0"
      />
    );
  }

  return null;
}


