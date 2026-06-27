"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Inter, Noto_Sans_Arabic, Heebo } from "next/font/google";
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Code2,
  Globe2,
  Languages,
  LayoutDashboard,
  Menu,
  MousePointer2,
  Palette,
  QrCode,
  Rocket,
  ShieldCheck,
  Sparkles,
  Store,
  X,
  Zap,
} from "lucide-react";

import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const arabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const CRTGO_LOGO =
  "https://cdn.sanity.io/images/gcqd797l/production/b37fe145147e56bf8907cd6006e8f6c3f28a1461-4096x2048.png";

const LANGUAGES = {
  ar: {
    code: "ar",
    label: "العربية",
    short: "AR",
    dir: "rtl",
    font: arabic.className,
  },
  he: {
    code: "he",
    label: "עברית",
    short: "HE",
    dir: "rtl",
    font: heebo.className,
  },
  en: {
    code: "en",
    label: "English",
    short: "EN",
    dir: "ltr",
    font: inter.className,
  },
};

const COPY = {
  ar: {
    nav: {
      services: "الخدمات",
      menus: "القوائم",
      process: "الطريقة",
      start: "ابدأ الآن",
    },
    hero: {
      eyebrow: "CRTGO Web Services",
      title: "نصنع حضورك الرقمي بشكل أذكى.",
      text: "مواقع، قوائم رقمية، صفحات أعمال، وأنظمة ويب مصممة لتبدو احترافية وتعمل بسرعة على كل جهاز.",
      primary: "ابدأ مشروعك",
      secondary: "استكشف القوائم الرقمية",
      badge1: "تصميم فاخر",
      badge2: "تجربة سريعة",
      badge3: "جاهز للموبايل",
    },
    mockup: {
      label: "Live SaaS Product",
      title: "CRTGO Menus",
      text: "قوائم رقمية للمتاجر، المطاعم والكافيهات مع QR، قوالب، فروع، لغات، ولوحة تحكم.",
      button: "فتح لوحة التحكم",
    },
    sections: {
      services: "ماذا نقدم؟",
      servicesText: "خدمات ويب مبنية لتخدم مشروعك، وليس فقط لتبدو جميلة.",
      menusTitle: "منتجنا الأساسي",
      menusText: "CRTGO Menus هو نظام SaaS لإنشاء قوائم رقمية احترافية.",
      process: "طريقة العمل",
      processText: "نبدأ بالفكرة، نبنيها بشكل نظيف، ثم نسلّم تجربة حقيقية قابلة للاستخدام.",
      why: "لماذا CRTGO؟",
      whyText: "لأن التصميم، السرعة، والنظام مهمين بنفس الدرجة.",
      ctaTitle: "جاهز تبني تجربة رقمية قوية؟",
      ctaText: "ابدأ مع CRTGO Web Services وخلي مشروعك يظهر بشكل أذكى وأكثر احترافية.",
    },
    services: [
      {
        title: "Digital Menus",
        text: "قوائم QR رقمية للمطاعم والكافيهات مع قوالب، صور، لغات، وفروع.",
      },
      {
        title: "Business Websites",
        text: "مواقع تعريفية للشركات والمتاجر والأشخاص بتجربة موبايل ممتازة.",
      },
      {
        title: "Web Applications",
        text: "لوحات تحكم، أنظمة إدارة، صفحات دخول، وقواعد بيانات حسب الحاجة.",
      },
      {
        title: "Landing Pages",
        text: "صفحات إطلاق وبيع مصممة لتشرح الخدمة وتقنع الزبون بسرعة.",
      },
    ],
    features: [
      "تصميم متجاوب لكل الأجهزة",
      "تجربة سريعة ونظيفة",
      "لوحة تحكم سهلة",
      "روابط و QR جاهزة",
      "دعم العربية والعبرية والإنجليزية",
      "قابلية للتوسع مستقبلاً",
    ],
    process: [
      {
        title: "نفهم المشروع",
        text: "نحدد الهدف، الجمهور، الصفحات، والوظائف المطلوبة.",
      },
      {
        title: "نصمم التجربة",
        text: "نرتب شكل الموقع أو النظام بطريقة واضحة ومناسبة للعلامة.",
      },
      {
        title: "نبني ونطلق",
        text: "نطوّر المشروع، نختبره، ثم نجهزه للنشر والاستخدام.",
      },
    ],
    stats: [
      ["3", "لغات مدعومة"],
      ["QR", "روابط جاهزة"],
      ["SaaS", "نظام قابل للتوسع"],
    ],
  },

  he: {
    nav: {
      services: "שירותים",
      menus: "תפריטים",
      process: "תהליך",
      start: "התחל עכשיו",
    },
    hero: {
      eyebrow: "CRTGO Web Services",
      title: "בונים נוכחות דיגיטלית חכמה יותר.",
      text: "אתרים, תפריטים דיגיטליים, דפי עסק ומערכות ווב שנראות מקצועיות ועובדות מהר בכל מכשיר.",
      primary: "התחל פרויקט",
      secondary: "גלה תפריטים דיגיטליים",
      badge1: "עיצוב פרימיום",
      badge2: "חוויה מהירה",
      badge3: "מותאם למובייל",
    },
    mockup: {
      label: "Live SaaS Product",
      title: "CRTGO Menus",
      text: "תפריטים דיגיטליים למסעדות, בתי קפה ועסקים עם QR, תבניות, סניפים, שפות ולוח ניהול.",
      button: "פתח דשבורד",
    },
    sections: {
      services: "מה אנחנו מציעים?",
      servicesText: "שירותי ווב שנבנים כדי לשרת את העסק, לא רק להיראות יפה.",
      menusTitle: "המוצר המרכזי שלנו",
      menusText: "CRTGO Menus היא מערכת SaaS ליצירת תפריטים דיגיטליים מקצועיים.",
      process: "תהליך העבודה",
      processText: "מתחילים מהרעיון, בונים אותו נקי, ואז משיקים מוצר אמיתי לשימוש.",
      why: "למה CRTGO?",
      whyText: "כי עיצוב, מהירות ומערכת מסודרת חשובים באותה מידה.",
      ctaTitle: "מוכן לבנות חוויה דיגיטלית חזקה?",
      ctaText: "התחל עם CRTGO Web Services ותן לעסק שלך להיראות חכם ומקצועי יותר.",
    },
    services: [
      {
        title: "Digital Menus",
        text: "תפריטי QR דיגיטליים למסעדות ובתי קפה עם תבניות, תמונות, שפות וסניפים.",
      },
      {
        title: "Business Websites",
        text: "אתרי תדמית לעסקים, חנויות ואנשים עם חוויית מובייל מעולה.",
      },
      {
        title: "Web Applications",
        text: "דשבורדים, מערכות ניהול, כניסה למשתמשים ומסדי נתונים לפי הצורך.",
      },
      {
        title: "Landing Pages",
        text: "דפי נחיתה שמסבירים את השירות ומשכנעים את הלקוח מהר.",
      },
    ],
    features: [
      "עיצוב רספונסיבי לכל מכשיר",
      "חוויה מהירה ונקייה",
      "לוח ניהול פשוט",
      "קישורים ו־QR מוכנים",
      "תמיכה בערבית, עברית ואנגלית",
      "בנוי להתרחבות בעתיד",
    ],
    process: [
      {
        title: "מבינים את הפרויקט",
        text: "מגדירים את המטרה, הקהל, העמודים והפונקציות.",
      },
      {
        title: "מעצבים את החוויה",
        text: "מסדרים את האתר או המערכת בצורה ברורה ומתאימה למותג.",
      },
      {
        title: "בונים ומשיקים",
        text: "מפתחים, בודקים, ואז מכינים לפרסום ושימוש.",
      },
    ],
    stats: [
      ["3", "שפות נתמכות"],
      ["QR", "קישורים מוכנים"],
      ["SaaS", "מערכת מתרחבת"],
    ],
  },

  en: {
    nav: {
      services: "Services",
      menus: "Menus",
      process: "Process",
      start: "Start now",
    },
    hero: {
      eyebrow: "CRTGO Web Services",
      title: "Building smarter digital presence.",
      text: "Websites, digital menus, business pages, and web systems designed to look premium and work fast on every device.",
      primary: "Start your project",
      secondary: "Explore digital menus",
      badge1: "Premium design",
      badge2: "Fast experience",
      badge3: "Mobile ready",
    },
    mockup: {
      label: "Live SaaS Product",
      title: "CRTGO Menus",
      text: "Digital menus for restaurants, cafés, and stores with QR links, templates, branches, languages, and a real dashboard.",
      button: "Open dashboard",
    },
    sections: {
      services: "What we build",
      servicesText: "Web services built to serve your business, not just look good.",
      menusTitle: "Our core product",
      menusText: "CRTGO Menus is a SaaS system for creating premium digital menus.",
      process: "The process",
      processText: "We start from the idea, shape it cleanly, then launch something real and usable.",
      why: "Why CRTGO?",
      whyText: "Because design, speed, and structure all matter.",
      ctaTitle: "Ready to build a stronger digital experience?",
      ctaText: "Start with CRTGO Web Services and make your project look smarter and more professional.",
    },
    services: [
      {
        title: "Digital Menus",
        text: "QR digital menus for restaurants and cafés with templates, images, languages, and branches.",
      },
      {
        title: "Business Websites",
        text: "Modern websites for businesses, shops, and personal brands with excellent mobile experience.",
      },
      {
        title: "Web Applications",
        text: "Dashboards, management systems, login flows, and database-backed tools.",
      },
      {
        title: "Landing Pages",
        text: "Launch and sales pages designed to explain your service and convert quickly.",
      },
    ],
    features: [
      "Responsive design for every device",
      "Fast and clean user experience",
      "Simple dashboard",
      "Ready links and QR codes",
      "Arabic, Hebrew, and English support",
      "Built to scale later",
    ],
    process: [
      {
        title: "Understand the project",
        text: "We define the goal, audience, pages, and needed features.",
      },
      {
        title: "Design the experience",
        text: "We shape the website or system in a clear way that fits the brand.",
      },
      {
        title: "Build and launch",
        text: "We develop, test, and prepare the project for real use.",
      },
    ],
    stats: [
      ["3", "Supported languages"],
      ["QR", "Ready links"],
      ["SaaS", "Scalable system"],
    ],
  },
};

const SERVICE_ICONS = [QrCode, Store, LayoutDashboard, MousePointer2];
const PROCESS_ICONS = [Sparkles, Palette, Rocket];

export default function WSLandingClient() {
  const [language, setLanguage] = useState("ar");
  const [mobileOpen, setMobileOpen] = useState(false);

  const lang = LANGUAGES[language];
  const copy = COPY[language];

  const isRtl = lang.dir === "rtl";

  const pageClass = useMemo(() => {
    return `${lang.font} min-h-screen overflow-hidden bg-[#080808] text-white`;
  }, [lang.font]);

  return (
    <main dir={lang.dir} className={pageClass}>
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(217,191,143,0.16),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(180deg,#080808_0%,#0f0d0a_45%,#080808_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px] opacity-25" />
      </div>

      <div className="relative z-10">
        <Header
          language={language}
          setLanguage={setLanguage}
          copy={copy}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          isRtl={isRtl}
        />

        <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:px-8 lg:pt-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#d9bf8f] backdrop-blur-xl">
              <Sparkles size={14} />
              {copy.hero.eyebrow}
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.07em] sm:text-7xl lg:text-8xl">
              {copy.hero.title}
            </h1>

            <p className="mt-6 max-w-2xl text-base font-bold leading-8 text-white/58 sm:text-lg">
              {copy.hero.text}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/start"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-black transition hover:bg-[#d9bf8f] active:scale-[0.98]"
              >
                {copy.hero.primary}
                <ArrowUpRight size={17} />
              </Link>

              <Link
                href="/menus"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.06] px-6 text-sm font-black text-white transition hover:border-white/30 hover:bg-white/[0.1] active:scale-[0.98]"
              >
                {copy.hero.secondary}
                <ChevronRight
                  size={17}
                  className={isRtl ? "rotate-180" : ""}
                />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <HeroBadge>{copy.hero.badge1}</HeroBadge>
              <HeroBadge>{copy.hero.badge2}</HeroBadge>
              <HeroBadge>{copy.hero.badge3}</HeroBadge>
            </div>
          </div>

          <ProductCard copy={copy} isRtl={isRtl} />
        </section>

        <Stats stats={copy.stats} />

        <SectionHeader
          id="services"
          eyebrow="01"
          title={copy.sections.services}
          text={copy.sections.servicesText}
        />

        <section className="mx-auto grid max-w-7xl gap-3 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {copy.services.map((service, index) => {
            const Icon = SERVICE_ICONS[index] || Sparkles;

            return (
              <article
                key={service.title}
                className="group rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-5 transition hover:-translate-y-1 hover:border-[#d9bf8f]/45 hover:bg-white/[0.075]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-[#d9bf8f]">
                  <Icon size={22} />
                </div>

                <h3 className="mt-5 text-xl font-black tracking-[-0.04em]">
                  {service.title}
                </h3>

                <p className="mt-3 text-sm font-bold leading-7 text-white/52">
                  {service.text}
                </p>
              </article>
            );
          })}
        </section>

        <section
          id="menus"
          className="mx-auto mt-20 grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:px-8"
        >
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d9bf8f]">
              CRTGO Menus
            </p>

            <h2 className="mt-3 text-4xl font-black leading-none tracking-[-0.06em] sm:text-6xl">
              {copy.sections.menusTitle}
            </h2>

            <p className="mt-5 max-w-2xl text-sm font-bold leading-8 text-white/55 sm:text-base">
              {copy.sections.menusText}
            </p>

            <div className="mt-7 grid gap-2 sm:grid-cols-2">
              {copy.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm font-black text-white/70"
                >
                  <Check size={16} className="shrink-0 text-[#d9bf8f]" />
                  {feature}
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/start"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#d9bf8f] px-5 text-sm font-black text-black transition hover:bg-white"
              >
                {copy.nav.start}
              </Link>

              <Link
                href="/menus"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] px-5 text-sm font-black text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                CRTGO Menus
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            <MiniPreview
              title="menu.crtgo.com/burger-house/haifa"
              icon={<Globe2 size={18} />}
            />
            <MiniPreview title="QR Menu Link" icon={<QrCode size={18} />} />
            <MiniPreview title="Branch Switcher" icon={<Store size={18} />} />
            <MiniPreview title="Admin Dashboard" icon={<LayoutDashboard size={18} />} />
          </div>
        </section>

        <SectionHeader
          id="process"
          eyebrow="02"
          title={copy.sections.process}
          text={copy.sections.processText}
        />

        <section className="mx-auto grid max-w-7xl gap-3 px-4 pb-20 sm:px-6 md:grid-cols-3 lg:px-8">
          {copy.process.map((step, index) => {
            const Icon = PROCESS_ICONS[index] || BadgeCheck;

            return (
              <article
                key={step.title}
                className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-[#d9bf8f]">
                    <Icon size={20} />
                  </div>

                  <span className="text-4xl font-black tracking-[-0.08em] text-white/10">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-black tracking-[-0.04em]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm font-bold leading-7 text-white/52">
                  {step.text}
                </p>
              </article>
            );
          })}
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(217,191,143,0.18),rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#d9bf8f]">
                  CRTGO
                </p>

                <h2 className="mt-3 max-w-3xl text-4xl font-black leading-none tracking-[-0.06em] sm:text-6xl">
                  {copy.sections.ctaTitle}
                </h2>

                <p className="mt-5 max-w-2xl text-sm font-bold leading-8 text-white/58 sm:text-base">
                  {copy.sections.ctaText}
                </p>
              </div>

              <Link
                href="/start"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-black transition hover:bg-[#d9bf8f] active:scale-[0.98]"
              >
                {copy.nav.start}
                <Rocket size={17} />
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}

function Header({
  language,
  setLanguage,
  copy,
  mobileOpen,
  setMobileOpen,
  isRtl,
}) {
  const navItems = [
    { label: copy.nav.services, href: "#services" },
    { label: copy.nav.menus, href: "#menus" },
    { label: copy.nav.process, href: "#process" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080808]/75 backdrop-blur-2xl">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="relative h-12 w-36 shrink-0">
          <Image
            src={CRTGO_LOGO}
            alt="CRTGO Web Services"
            fill
            priority
            sizes="144px"
            className="object-contain object-left"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-black text-white/55 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitch language={language} setLanguage={setLanguage} />

          <Link
            href="/start"
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-white px-4 text-sm font-black text-black transition hover:bg-[#d9bf8f]"
          >
            {copy.nav.start}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white md:hidden"
        >
          {mobileOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#080808] px-4 py-4 md:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black text-white/70"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <LanguageSwitch language={language} setLanguage={setLanguage} />

            <Link
              href="/start"
              className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full bg-white px-4 text-sm font-black text-black"
            >
              {copy.nav.start}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function LanguageSwitch({ language, setLanguage }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] p-1">
      <Languages size={15} className="mx-2 text-[#d9bf8f]" />

      {Object.values(LANGUAGES).map((lang) => {
        const active = lang.code === language;

        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            className={`h-8 cursor-pointer rounded-full px-3 text-xs font-black transition ${
              active
                ? "bg-white text-black"
                : "text-white/45 hover:bg-white/10 hover:text-white"
            }`}
          >
            {lang.short}
          </button>
        );
      })}
    </div>
  );
}

function ProductCard({ copy, isRtl }) {
  return (
    <aside className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-3 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="overflow-hidden rounded-[1.55rem] border border-white/10 bg-[#0d0d0d]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
            <span className="h-3 w-3 rounded-full bg-green-400/80" />
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/28">
            ws.crtgo.com
          </p>
        </div>

        <div className="p-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#d9bf8f]/20 bg-[#d9bf8f]/10 px-3 py-1.5 text-xs font-black text-[#d9bf8f]">
            <Zap size={13} />
            {copy.mockup.label}
          </p>

          <h2 className="mt-5 text-4xl font-black leading-none tracking-[-0.06em]">
            {copy.mockup.title}
          </h2>

          <p className="mt-3 text-sm font-bold leading-7 text-white/52">
            {copy.mockup.text}
          </p>

          <div className="mt-5 grid gap-2">
            <MockRow icon={<QrCode size={16} />} text="menu.crtgo.com/brand/branch" />
            <MockRow icon={<Palette size={16} />} text="Classic / Luxury templates" />
            <MockRow icon={<ShieldCheck size={16} />} text="Trial + Pro access system" />
            <MockRow icon={<Code2 size={16} />} text="Next.js + Supabase SaaS" />
          </div>

          <Link
            href="/admin"
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-black text-black transition hover:bg-[#d9bf8f]"
          >
            {copy.mockup.button}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </aside>
  );
}

function HeroBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-xs font-black text-white/55">
      <BadgeCheck size={14} className="text-[#d9bf8f]" />
      {children}
    </span>
  );
}

function MockRow({ icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 text-sm font-black text-white/65">
      <span className="text-[#d9bf8f]">{icon}</span>
      <span dir="ltr" className="truncate">
        {text}
      </span>
    </div>
  );
}

function Stats({ stats }) {
  return (
    <section className="mx-auto grid max-w-7xl gap-3 px-4 pb-20 sm:px-6 md:grid-cols-3 lg:px-8">
      {stats.map(([value, label]) => (
        <div
          key={label}
          className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5"
        >
          <p className="text-4xl font-black tracking-[-0.08em] text-[#d9bf8f]">
            {value}
          </p>

          <p className="mt-2 text-sm font-black text-white/50">{label}</p>
        </div>
      ))}
    </section>
  );
}

function SectionHeader({ id, eyebrow, title, text }) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-[#d9bf8f]">
        {eyebrow}
      </p>

      <h2 className="mt-3 max-w-3xl text-4xl font-black leading-none tracking-[-0.06em] sm:text-6xl">
        {title}
      </h2>

      <p className="mt-4 max-w-2xl text-sm font-bold leading-7 text-white/55 sm:text-base">
        {text}
      </p>
    </section>
  );
}

function MiniPreview({ icon, title }) {
  return (
    <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-[#d9bf8f]">
        {icon}
      </div>

      <p dir="ltr" className="truncate text-sm font-black text-white/65">
        {title}
      </p>
    </div>
  );
}