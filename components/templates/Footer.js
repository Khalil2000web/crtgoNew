import { ExternalLink } from "lucide-react";
import Image from "next/image";

const CRTGO_LOGO_URL =
  "https://cdn.sanity.io/images/gcqd797l/production/b37fe145147e56bf8907cd6006e8f6c3f28a1461-4096x2048.png";

export default function Footer({ className = "" }) {
  const year = new Date().getFullYear();

  return (
    <footer
      dir="ltr"
      className={`bg-[#080808] text-white ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-white/35">
              Powered by
            </p>

            <a
              href="https://ws.crtgo.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open CRTGO Web Services"
              className="group mt-3 inline-flex max-w-full items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 transition hover:border-white/25 hover:bg-white/[0.08]"
            >
              <span className="relative block h-14 w-40 overflow-hidden sm:h-12 sm:w-48">
                <Image
                  src={CRTGO_LOGO_URL}
                  alt="CRTGO Web Services Logo"
                  fill
                  sizes="(max-width: 640px) 160px, 192px"
                  className="pointer-events-none object-contain object-left"
                  priority={false}
                />
              </span>

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/45 transition group-hover:border-white/25 group-hover:text-white">
                <ExternalLink size={16} />
              </span>
            </a>

            <p className="mt-4 max-w-md text-xs font-bold leading-6 text-white/38">
              Digital menus and web experiences crafted by CRTGO Web Services.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:min-w-[330px]">
            <p className="hidden text-[10px] font-black uppercase tracking-[0.28em] text-white/35">
              CRTGO
            </p>

            <p className="mt-2 text-sm font-bold text-white/70">
              © {year} CRTGO. All rights reserved.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <FooterLink href="https://ws.crtgo.com/terms-of-service">
                Terms
              </FooterLink>

              <FooterLink href="https://ws.crtgo.com/privacy-policy">
                Privacy
              </FooterLink>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-4">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.28em] text-white/25">
            CRTGO Web Services
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 px-3 text-center text-[11px] font-black uppercase tracking-[0.08em] text-white/45 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
    >
      {children}
    </a>
  );
}