import {
  Inter,
  Noto_Sans_Arabic,
  Noto_Sans_Hebrew,
} from "next/font/google";

export const englishFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-en",
});

export const arabicFont = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-public-ar",
});

export const hebrewFont = Noto_Sans_Hebrew({
  subsets: ["hebrew"],
  display: "swap",
  variable: "--font-public-he",
});

export const PUBLIC_FONT_CLASS = {
  ar: arabicFont.className,
  en: englishFont.className,
  he: hebrewFont.className,
};