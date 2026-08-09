export default function Loading() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-white"
    >
      <div className="mx-auto max-w-3xl px-5 py-8">
        <div className="h-20 animate-pulse rounded-2xl bg-neutral-100" />

        <div className="mt-8 space-y-3">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-neutral-100" />

          <div className="h-4 w-64 max-w-full animate-pulse rounded bg-neutral-100" />
        </div>

        <div className="mt-10 space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-neutral-100"
            />
          ))}
        </div>
      </div>
    </main>
  );
}