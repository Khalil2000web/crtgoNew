import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { Noto_Kufi_Arabic } from "next/font/google";

export const notoKufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["100","200","300","400","500","600","700","800","900"],
  variable: "--font-kufi",
  display: "swap",
});

export const metadata = {
  title: "CRTRGO",
  description: "DIGITAL MENUS SERVICES",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={notoKufi.variable + " min-h-full flex flex-col"}>
        <main>
        {children}
        </main>
        <Analytics/>
      </body>
    </html>
  );
}
