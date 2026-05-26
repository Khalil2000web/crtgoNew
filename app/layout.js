import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "CRTRGO",
  description: "DIGITAL MENUS SERVICES",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-full flex flex-col">
        <main>
        {children}
        </main>
      </body>
    </html>
  );
}
