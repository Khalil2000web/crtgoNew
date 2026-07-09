import { Fredoka, Noto_Kufi_Arabic, Noto_Sans_Hebrew } from "next/font/google";

export const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const notoSansHebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export function getLanguageFont(language) {
  const cleanLanguage = String(language || "ar").toLowerCase();

  if (cleanLanguage === "he") {
    return notoSansHebrew;
  }

  if (cleanLanguage === "en") {
    return fredoka;
  }

  return notoKufiArabic;
}

export function getLanguageFontClass(language) {
  return getLanguageFont(language).className;
}

export function getLanguageFontStyle(language) {
  return getLanguageFont(language).style;
}

export function getLanguageDirection(language) {
  const cleanLanguage = String(language || "ar").toLowerCase();

  if (cleanLanguage === "en") return "ltr";

  return "rtl";
}