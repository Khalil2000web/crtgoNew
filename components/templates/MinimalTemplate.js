import MenuCover from "@/components/MenuCover";

export default function MinimalTemplate({ menu }) {
  const sections = [...(menu.sections || [])].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  return (
    <main dir="rtl" className="min-h-screen bg-white text-black">
      <MenuCover menu={menu} />

      <section className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="text-4xl font-black">{menu.name}</h1>

        {menu.description_ar && (
          <p className="mt-3 text-black/50">{menu.description_ar}</p>
        )}

        <div className="mt-10 space-y-12">
          {sections.map((section) => (
            <section key={section.id}>
              <h2 className="text-lg font-black">{section.name_ar}</h2>

              <div className="mt-4 divide-y divide-black/10">
                {(section.items || []).map((item) => (
                  <article key={item.id} className="py-4">
                    <div className="flex justify-between gap-5">
                      <h3 className="font-bold">{item.name_ar}</h3>
                      <p className="font-bold">₪{item.price}</p>
                    </div>

                    {item.description_ar && (
                      <p className="mt-1 text-sm text-black/50">
                        {item.description_ar}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}