import {
  IBM_Plex_Sans_Arabic,
  Tajawal,
  Noto_Sans_Arabic,
  Manrope,
} from "next/font/google";

export const ibmArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-arabic",
  display: "swap",
});

export const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-arabic",
  display: "swap",
});

export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const fontVariables = [
  ibmArabic.variable,
  tajawal.variable,
  notoArabic.variable,
  manrope.variable,
].join(" ");

export const MENU_FONTS = {
  clean: "var(--font-ibm-arabic), var(--font-noto-arabic), Arial, sans-serif",
  friendly: "var(--font-tajawal), var(--font-noto-arabic), Arial, sans-serif",
  modern: "var(--font-manrope), var(--font-noto-arabic), Arial, sans-serif",
};

export function getMenuFont(type = "clean") {
  return MENU_FONTS[type] || MENU_FONTS.clean;
}