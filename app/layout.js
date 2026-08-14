import "./globals.css";

export const metadata = {
  title: "CRTRGO Menu",
  description: "Digital menus powered by CRTRGO.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar">
      <body>{children}</body>
    </html>
  );
}