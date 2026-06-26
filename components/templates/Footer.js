import { ExternalLink } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
      <footer dir="ltr" className="mt-8 bg-[#080808] py-10 text-white font-[Arial] pb-10">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-xs px-4 tracking-[0.35em] text-white/35">
                Powered by
              </p>

              <a
                href="https://ws.crtgo.com"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center text-4xl font-black tracking-tight text-white transition hover:text-white/80"
              >
                <div className="flex items-start">
                <Image
                width="4096"
                height="2048"
                alt="CRTGO Web Services Logo"
                src="https://cdn.sanity.io/images/gcqd797l/production/b37fe145147e56bf8907cd6006e8f6c3f28a1461-4096x2048.png"
                className="pointer-events-none w-50"
                />
                </div>
                <ExternalLink size={20} />
              </a>

          
            </div>

          <div className="px-4 border-t border-white/20 pt-5">
            <p className="text-lg text-white/80 py-2">© {new Date().getFullYear()} CRTGO</p>

            <div className="flex items-center justify-between w-full">
                <a className="uppercase text-sm text-center text-white/40 hover:text-white hover:underline" href="https://ws.crtgo.com/terms-of-service">TERMS OF SERVICE</a>
                <a className="uppercase text-sm text-center text-white/40 hover:text-white hover:underline" href="https://ws.crtgo.com/privacy-policy">PRIVACY POLICY</a>
            </div>
          </div>
        </div>
      </footer>
      );
    }