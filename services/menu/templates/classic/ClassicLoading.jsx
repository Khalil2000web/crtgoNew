export default function ClassicLoading() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-6 text-black">
      <section className="mx-auto max-w-4xl animate-pulse">
        <div className="overflow-hidden rounded-[34px] bg-white shadow-sm">
          <div className="h-64 bg-black/10" />

          <div className="p-5">
            <div className="h-16 w-16 rounded-3xl bg-black/10" />

            <div className="mt-5 h-8 w-52 rounded-full bg-black/10" />
            <div className="mt-3 h-4 w-72 rounded-full bg-black/10" />

            <div className="mt-6 grid gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[24px] border border-black/5 bg-black/[0.03] p-4"
                >
                  <div className="h-5 w-40 rounded-full bg-black/10" />
                  <div className="mt-3 h-4 w-full rounded-full bg-black/10" />
                  <div className="mt-2 h-4 w-2/3 rounded-full bg-black/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}