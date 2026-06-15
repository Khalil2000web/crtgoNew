import Link from "next/link";

export const metadata = {
  title: "CRTGO Commerce",
  description: "Custom Shopify stores powered by Next.js.",
};

export default function CommerceLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f5f1eb] text-black" dir="ltr">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f1eb]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-xl font-black">
            CRTGO Commerce
          </Link>

          <nav className="flex items-center gap-3 text-sm font-bold">
            <Link href="/commerce#packages">Packages</Link>
            <Link
              href="/commerce#contact"
              className="rounded-full bg-black px-5 py-2.5 text-white"
            >
              Request Store
            </Link>
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}