export default function TenantNotFound() {
  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-black"
    >
      <div>
        <p className="text-sm text-neutral-500">CRTGO</p>

        <h1 className="mt-3 text-2xl font-semibold">القائمة غير متوفرة</h1>

        <p className="mt-2 text-sm text-neutral-500">
          قد يكون الرابط غير صحيح أو أن القائمة غير منشورة حالياً.
        </p>
      </div>
    </main>
  );
}
