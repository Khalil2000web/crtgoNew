export default function LuxuryLoading() {
  return (
    <main className="min-h-screen bg-[#080604] px-4 py-8 text-[#f8efe3]">
      <section className="mx-auto max-w-5xl animate-pulse">
        <div className="rounded-[42px] border border-[#d6b16a]/20 bg-[#120d08] p-5 shadow-2xl shadow-black/40">
          <div className="h-[420px] rounded-[34px] bg-[#d6b16a]/10" />

          <div className="mx-auto mt-8 h-5 w-32 rounded-full bg-[#d6b16a]/15" />
          <div className="mx-auto mt-4 h-12 w-80 rounded-full bg-[#d6b16a]/15" />
          <div className="mx-auto mt-4 h-4 w-96 max-w-full rounded-full bg-[#d6b16a]/10" />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[30px] border border-[#d6b16a]/15 bg-[#d6b16a]/5 p-5"
              >
                <div className="h-6 w-44 rounded-full bg-[#d6b16a]/15" />
                <div className="mt-4 h-4 w-full rounded-full bg-[#d6b16a]/10" />
                <div className="mt-2 h-4 w-2/3 rounded-full bg-[#d6b16a]/10" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}