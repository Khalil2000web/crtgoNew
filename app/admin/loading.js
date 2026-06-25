function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-[28px] border border-black/10 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="h-3 w-24 rounded-full bg-black/10" />
      <div className="mt-5 h-8 w-2/3 rounded-full bg-black/10" />
      <div className="mt-4 h-4 w-full rounded-full bg-black/10" />
      <div className="mt-2 h-4 w-4/5 rounded-full bg-black/10" />
    </div>
  );
}

export default function Loading() {
  return (
    <main dir="rtl" className="min-h-screen px-4 pb-28 pt-5 sm:px-5 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <SkeletonBlock className="min-h-[170px]" />

        <div className="mt-4 flex gap-3 overflow-hidden">
          <SkeletonBlock className="min-h-[105px] min-w-[220px] flex-1" />
          <SkeletonBlock className="hidden min-h-[105px] min-w-[220px] flex-1 sm:block" />
          <SkeletonBlock className="hidden min-h-[105px] min-w-[220px] flex-1 lg:block" />
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-3">
            <SkeletonBlock className="min-h-[92px]" />
            <SkeletonBlock className="min-h-[92px]" />
            <SkeletonBlock className="min-h-[92px]" />
          </div>

          <SkeletonBlock className="min-h-[310px]" />
        </div>
      </section>
    </main>
  );
}