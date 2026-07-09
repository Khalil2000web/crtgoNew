import "./globals.css";

export const metadata = {
  title: "CRTGO Menu",
  description: "Digital menus powered by CRTGO.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar">
      <body>{children}</body>
    </html>
  );
}