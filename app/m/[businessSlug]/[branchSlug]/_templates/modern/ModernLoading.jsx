export default function ModernLoading() {
  return (
    <main className="min-h-screen bg-[#090909] px-4 py-6 text-white">
      <section className="mx-auto grid max-w-6xl animate-pulse gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="rounded-[34px] border border-white/10 bg-white/[0.04] p-5">
          <div className="h-64 rounded-[28px] bg-white/10" />

          <div className="mt-5 h-16 w-16 rounded-3xl bg-white/10" />
          <div className="mt-5 h-8 w-52 rounded-full bg-white/10" />
          <div className="mt-3 h-4 w-64 rounded-full bg-white/10" />

          <div className="mt-6 grid gap-2">
            <div className="h-11 rounded-2xl bg-white/10" />
            <div className="h-11 rounded-2xl bg-white/10" />
          </div>
        </aside>

        <section className="grid gap-4">
          <div className="h-14 rounded-[24px] bg-white/10" />

          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="h-6 w-44 rounded-full bg-white/10" />
              <div className="mt-4 h-4 w-full rounded-full bg-white/10" />
              <div className="mt-2 h-4 w-2/3 rounded-full bg-white/10" />
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}