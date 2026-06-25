import "./globals.css";

export const metadata = {
  title: {
    default: "CRTGO",
    template: "%s | CRTGO",
  },
  description: "DIGITAL MENUS SERVICES",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar">
      <body>{children}</body>
    </html>
  );
}