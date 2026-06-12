import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SectionsPage({ params }) {
  const { menuId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: menu } = await supabase
    .from("menus")
    .select(`
      *,
      sections (
        *,
        items (
          id
        )
      )
    `)
    .eq("id", menuId)
    .eq("owner_id", user.id)
    .single();

  if (!menu) {
    notFound();
  }

  const sections =
    menu.sections?.sort(
      (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
    ) || [];

  return (
    <main dir="rtl" className="px-5 py-8">
      <section className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-black/50">الأقسام</p>

            <h1 className="mt-2 text-4xl font-bold">
              إدارة أقسام {menu.name}
            </h1>
          </div>

          <Link
            href={`/admin/menus/${menuId}`}
            className="rounded-2xl border border-black/15 bg-white px-5 py-3 font-bold text-black hover:bg-black hover:text-white"
          >
            رجوع
          </Link>
        </div>

        <div className="mt-8 grid gap-4">
          {sections.length === 0 && (
            <div className="rounded-3xl bg-white p-6 text-black/50">
              لا توجد أقسام بعد.
            </div>
          )}

          {sections.map((section) => (
            <Link
              key={section.id}
              href={`/admin/menus/${menuId}/sections/${section.id}`}
              className="rounded-3xl bg-white p-5 transition hover:bg-black hover:text-white"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{section.name_ar}</h2>

                  <p className="mt-1 text-sm opacity-60">
                    {(section.items || []).length} أصناف
                  </p>
                </div>

                <span className="text-2xl opacity-40">←</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}