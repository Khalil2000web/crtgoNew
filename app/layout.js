import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata = {
  title: "CRTGO Menu",
  description: "Digital menus powered by CRTGO.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar">
      <body className={fontVariables}>{children}</body>
    </html>
  );
}