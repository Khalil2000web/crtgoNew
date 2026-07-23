import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Globe2,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";

const FOOTER_UI = {
  ar: {
    poweredBy: "مدعوم بواسطة",
    crtgo: "CRTGO",
    webServices: "خدمات CRTGO الرقمية",
    terms: "الشروط",
    privacy: "الخصوصية",
    restaurantLinks: "روابط المطعم",
    visitWebsite: "زيارة الموقع",
    call: "اتصال",
    whatsapp: "واتساب",
    instagram: "إنستغرام",
    facebook: "فيسبوك",
    tiktok: "تيك توك",
    address: "العنوان",
  },
  he: {
    poweredBy: "מופעל על ידי",
    crtgo: "CRTGO",
    webServices: "שירותי הדיגיטל של CRTGO",
    terms: "תנאים",
    privacy: "פרטיות",
    restaurantLinks: "קישורי העסק",
    visitWebsite: "בקר באתר",
    call: "התקשר",
    whatsapp: "וואטסאפ",
    instagram: "אינסטגרם",
    facebook: "פייסבוק",
    tiktok: "טיקטוק",
    address: "כתובת",
  },
  en: {
    poweredBy: "Powered by",
    crtgo: "CRTGO",
    webServices: "CRTGO Web Services",
    terms: "Terms",
    privacy: "Privacy",
    restaurantLinks: "Restaurant links",
    visitWebsite: "Visit website",
    call: "Call",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    address: "Address",
  },
};

const CRTGO_LINKS = {
  home: "https://crtgo.com",
  webServices: "https://ws.crtgo.com/",
  terms: "https://crtgo.com/terms",
  privacy: "https://crtgo.com/privacy",
};

function t(language, key) {
  const cleanLanguage = String(language || "ar").toLowerCase();

  return FOOTER_UI[cleanLanguage]?.[key] || FOOTER_UI.ar[key] || key;
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

function getWhatsAppLink(value) {
  const clean = String(value || "").replace(/[^\d]/g, "");
  if (!clean) return null;

  return `https://wa.me/${clean}`;
}

function getInstagramLink(value) {
  if (!value) return null;
  if (value.startsWith("http")) return value;

  return `https://instagram.com/${String(value).replace("@", "")}`;
}

function getTikTokLink(value) {
  if (!value) return null;
  if (value.startsWith("http")) return value;

  return `https://tiktok.com/@${String(value).replace("@", "")}`;
}

function getFacebookLink(value) {
  if (!value) return null;
  if (value.startsWith("http")) return value;

  return `https://facebook.com/${value}`;
}

function buildRestaurantLinks(branch, language) {
  const links = [];

  if (branch?.phone) {
    links.push({
      key: "phone",
      label: t(language, "call"),
      href: `tel:${branch.phone}`,
      external: false,
      icon: <Phone size={15} />,
    });
  }

  const whatsapp = getWhatsAppLink(branch?.whatsapp);
  if (whatsapp) {
    links.push({
      key: "whatsapp",
      label: t(language, "whatsapp"),
      href: whatsapp,
      external: true,
      icon: <FaWhatsapp size={15} />,
    });
  }

  const instagram = getInstagramLink(branch?.instagram);
  if (instagram) {
    links.push({
      key: "instagram",
      label: t(language, "instagram"),
      href: instagram,
      external: true,
      icon: <FaInstagram size={15} />,
    });
  }

  const facebook = getFacebookLink(branch?.facebook);
  if (facebook) {
    links.push({
      key: "facebook",
      label: t(language, "facebook"),
      href: facebook,
      external: true,
      icon: <FaFacebookF size={14} />,
    });
  }

  const tiktok = getTikTokLink(branch?.tiktok);
  if (tiktok) {
    links.push({
      key: "tiktok",
      label: t(language, "tiktok"),
      href: tiktok,
      external: true,
      icon: <FaTiktok size={14} />,
    });
  }

  return links;
}

function getVariantClasses(variant) {
  if (variant === "modern") {
    return {
      footer: "text-white",
      card: "border-white/10 bg-white/[0.045] shadow-[0_24px_80px_-45px_rgba(0,0,0,0.95)]",
      logo: "border-white/15 bg-white/[0.06] text-white",
      eyebrow: "text-white/30",
      title: "text-white",
      muted: "text-white/45",
      divider: "border-white/10",
      chip: "border-white/10 bg-white/[0.055] text-white/55 hover:bg-white/[0.09] hover:text-white",
      primaryChip: "bg-white text-black hover:bg-white/90",
      crtgo: "text-white",
    };
  }

  if (variant === "luxury") {
    return {
      footer: "text-[#f8efe3]",
      card: "border-[#d6b16a]/20 bg-[#120d08]/95 shadow-[0_24px_90px_-45px_rgba(0,0,0,1)]",
      logo: "border-[#d6b16a]/25 bg-[#d6b16a]/10 text-[#d6b16a]",
      eyebrow: "text-[#d6b16a]/45",
      title: "text-[#f8efe3]",
      muted: "text-[#f8efe3]/45",
      divider: "border-[#d6b16a]/15",
      chip: "border-[#d6b16a]/15 bg-[#d6b16a]/10 text-[#f8efe3]/60 hover:bg-[#d6b16a]/15 hover:text-[#f8efe3]",
      primaryChip: "bg-[#d6b16a] text-black hover:bg-[#e8c77e]",
      crtgo: "text-[#d6b16a]",
    };
  }

  return {
    footer: "text-black",
    card: "border-black/10 bg-white/75 shadow-[0_22px_80px_-45px_rgba(0,0,0,0.9)]",
    logo: "border-black/10 bg-black text-white",
    eyebrow: "text-black/35",
    title: "text-black",
    muted: "text-black/45",
    divider: "border-black/10",
    chip: "border-black/10 bg-black/[0.035] text-black/50 hover:bg-black/[0.07] hover:text-black",
    primaryChip: "bg-black text-white hover:bg-black/85",
    crtgo: "text-black",
  };
}

export default function TemplateFooter({
  business,
  branch,
  menu,
  language = "ar",
  variant = "classic",
}) {
  const styles = getVariantClasses(variant);
  const dir = language === "en" ? "ltr" : "rtl";

  const businessName =
    pickText(business, "name", "name_i18n", language) ||
    business?.name ||
    "CRTGO";

  const branchAddress =
    pickText(branch, "address", "address_i18n", language) ||
    branch?.address ||
    "";

  const logoUrl = menu?.logo_url || business?.logo_url || null;
  const restaurantLinks = buildRestaurantLinks(branch, language);

  return (
    <footer
      dir={dir}
      className={`mx-auto w-full max-w-6xl px-4 pb-32 pt-4 sm:px-6 mt-10 lg:pb-10 ${styles.footer}`}
    >
      <div
        className={`relative overflow-hidden rounded-[36px] border p-5 backdrop-blur-2xl ${styles.card}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-transparent opacity-70" />
        <div className="pointer-events-none absolute -bottom-20 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-black/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="hidden min-w-0 items-start gap-4">
              <div
                className={`relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border ${styles.logo}`}
              >
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={businessName}
                    fill
                    sizes="64px"
                    className="object-cover pointer-events-none select-none"
                  />
                ) : (
                  <Store size={25} />
                )}
              </div>

              <div className="min-w-0">

                <h2
                  className={`mt-1 truncate text-2xl font-black tracking-[-0.05em] ${styles.title}`}
                >
                  {businessName}
                </h2>

                {branchAddress && (
                  <p
                    className={`mt-2 flex items-center gap-2 text-sm font-bold leading-6 ${styles.muted}`}
                  >
                    <MapPin size={15} className="shrink-0" />
                    <span className="min-w-0 truncate">{branchAddress}</span>
                  </p>
                )}
              </div>
            </div>

            <Link
              href="/"
              className={`group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-black transition ${styles.primaryChip}`}
            >
              <Sparkles size={15} />
              <span>{t(language, "poweredBy")}</span>
              <span className="text-[#ff6a00] font-[Arial]">{t(language, "crtgo")}</span>
              <ArrowUpRight
                size={15}
                className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>

          {restaurantLinks.length > 0 && (
            <div className={`hidden mt-5 border-t pt-5 ${styles.divider}`}>
              <div className="flex flex-wrap gap-2">
                {restaurantLinks.map((link) => (
                  <a
                    key={link.key}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                    className={`group inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-xs font-black transition ${styles.chip}`}
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-current/10">
                      {link.icon}
                    </span>

                    <span>{link.label}</span>

                    {link.external && (
                      <ArrowUpRight
                        size={13}
                        className="opacity-45 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                      />
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className={`mt-5 border-t pt-5 ${styles.divider}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <FooterSmallLink
                  href={CRTGO_LINKS.webServices}
                  label="CRTGO Web Services"
                  icon={<Globe2 size={14} />}
                  className={styles.chip}
                />

                <FooterSmallLink
                  href={CRTGO_LINKS.terms}
                  label={t(language, "terms")}
                  icon={<ShieldCheck size={14} />}
                  className={styles.chip}
                />

                <FooterSmallLink
                  href={CRTGO_LINKS.privacy}
                  label={t(language, "privacy")}
                  icon={<ShieldCheck size={14} />}
                  className={styles.chip}
                />
              </div>

              <p className={`text-xs font-black uppercase tracking-[0.16em] ${styles.eyebrow}`}>
                © {new Date().getFullYear()} CRTGO
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterSmallLink({ href, label, icon, className }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`group inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-black transition ${className}`}
    >
      {icon}
      <span>{label}</span>
      <ArrowUpRight
        size={12}
        className="opacity-45 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
      />
    </Link>
  );
}