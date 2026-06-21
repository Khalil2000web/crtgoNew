import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { Noto_Kufi_Arabic } from "next/font/google";

export const notoKufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["100","200","300","400","500","600","700","800","900"],
  variable: "--font-kufi",
  display: "swap",
});



import {
  Tajawal,
  IBM_Plex_Sans_Arabic,
  Baloo_Bhaijaan_2,
} from "next/font/google";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

const ibmArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-arabic",
  display: "swap",
});

const baloo = Baloo_Bhaijaan_2({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
});


export const metadata = {
  title: {
    default: "CRTGO",
    template: "%s | CRTGO",
  },
  description: "DIGITAL MENUS SERVICES",
};

export default function RootLayout({ children }) {
  return (
    <html
  lang="ar"
  dir="rtl"
  className={`${tajawal.variable} ${ibmArabic.variable} ${baloo.variable}`}
>
      <body className="min-h-full flex flex-col">
        <main>
        {children}
        </main>
        <Analytics/>
      </body>
    </html>
  );
}
