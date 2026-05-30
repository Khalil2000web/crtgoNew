import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "404",
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <p className="mb-6 text-xs uppercase tracking-[0.5em] opacity-50">
          Error 404
        </p>

        <h1 className="mb-8 text-4xl md:text-6xl font-semibold leading-tight">
          الصفحة غير موجودة
        </h1>

        <p className="mb-12 text-sm md:text-base opacity-70 leading-relaxed">
          يبدو أن الصفحة التي تبحث عنها غير متوفرة أو ربما تم نقلها إلى مكان
          آخر.
        </p>

        <div className="flex flex-col items-center gap-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 text-sm uppercase tracking-[0.3em]"
          >
            <span>العودة للرئيسية</span>

            <span className="transition-transform duration-300 group-hover:-translate-x-3">
              <ArrowLeft size={18} />
            </span>
          </Link>

          <div className="h-px w-24 bg-current opacity-20" />
        </div>
      </div>
    </main>
  );
}