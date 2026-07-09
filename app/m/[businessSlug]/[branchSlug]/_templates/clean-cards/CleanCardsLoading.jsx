export default function CleanCardsLoading() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-6 text-black">
      <section className="mx-auto max-w-6xl animate-pulse">
        <div className="overflow-hidden rounded-[34px] border border-black/10 bg-white shadow-sm">
          <div className="h-72 bg-black/10" />

          <div className="p-5">
            <div className="h-14 w-14 rounded-2xl bg-black/10" />
            <div className="mt-5 h-9 w-64 rounded-full bg-black/10" />
            <div className="mt-3 h-4 w-80 max-w-full rounded-full bg-black/10" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/3] rounded-[28px] border border-black/10 bg-white p-4 shadow-sm"
            >
              <div className="h-full rounded-[22px] bg-black/10" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}