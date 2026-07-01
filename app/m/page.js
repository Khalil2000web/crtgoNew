export default function MenuHomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090909] px-4 text-white">
      <section className="max-w-md text-center">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ff7a00]">
          CRTGO Menus
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-[-0.06em]">
          Open a menu link
        </h1>

        <p className="mt-3 text-sm font-bold leading-6 text-white/45">
          Scan a QR code or open a restaurant menu link to view its digital menu.
        </p>
      </section>
    </main>
  );
}