import Image from "next/image";
import { AlertCircle, Store } from "lucide-react";

export default function LuxuryUnavailable({
  title = "Menu unavailable",
  message = "This menu is currently unavailable.",
  logoUrl = null,
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#080604] px-4 py-10 text-[#f8efe3]">
      <section className="w-full max-w-md rounded-[38px] border border-[#d6b16a]/20 bg-[#120d08] p-6 text-center shadow-2xl shadow-black/50">
        <div className="mx-auto grid h-20 w-20 place-items-center overflow-hidden rounded-[28px] border border-[#d6b16a]/20 bg-[#d6b16a]/10 text-[#d6b16a]">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={title}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <Store size={32} />
          )}
        </div>

        <div className="mx-auto mt-5 grid h-12 w-12 place-items-center rounded-2xl bg-[#d6b16a]/15 text-[#d6b16a]">
          <AlertCircle size={24} />
        </div>

        <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-[#d6b16a]/45">
          CRTGO MENU
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-[-0.07em]">
          {title}
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-sm font-bold leading-7 text-[#f8efe3]/50">
          {message}
        </p>

        <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-[#d6b16a]/30">
          Powered by CRTGO
        </p>
      </section>
    </main>
  );
}