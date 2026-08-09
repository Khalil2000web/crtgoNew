import Image from "next/image";
import { AlertCircle, Store } from "lucide-react";

export default function CleanCardsUnavailable({
  title = "Menu unavailable",
  message = "This menu is currently unavailable.",
  logoUrl = null,
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f4ef] px-4 py-10 text-black">
      <section className="w-full max-w-md rounded-[34px] border border-black/10 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto grid h-20 w-20 place-items-center overflow-hidden rounded-[26px] border border-black/10 bg-black text-white">
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

        <div className="mx-auto mt-5 grid h-12 w-12 place-items-center rounded-2xl bg-[#ff7a00]/15 text-[#ff7a00]">
          <AlertCircle size={24} />
        </div>

        <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-black/35">
          CRTGO MENU
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-[-0.07em]">
          {title}
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-sm font-bold leading-7 text-black/55">
          {message}
        </p>

        <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-black/30">
          Powered by CRTGO
        </p>
      </section>
    </main>
  );
}