export default function ClassicTemplate({ menu }) {
  const sections = [...(menu.sections || [])].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  return (
    <main dir="rtl" className="min-h-screen bg-black text-white">
      {menu.cover_url && (
        <img src={menu.cover_url} alt={menu.name} className="h-56 w-full object-cover" />
      )}

      <section className="mx-auto max-w-3xl px-5 py-8">
        {menu.logo_url && (
          <img src={menu.logo_url} alt={menu.name} className="mb-5 h-24 w-24 rounded-3xl object-cover" />
        )}

        <h1 className="text-4xl font-black">{menu.name}</h1>
        {menu.description_ar && <p className="mt-4 text-white/60">{menu.description_ar}</p>}

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.id}>
              <h2 className="text-2xl font-black">{section.name_ar}</h2>

              <div className="mt-4 space-y-4">
                {(section.items || []).map((item) => (
                  <article key={item.id} className="grid grid-cols-[90px_1fr] gap-4 rounded-3xl border border-white/10 p-4">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name_ar} className="h-24 w-24 rounded-2xl object-cover" />
                    ) : (
                      <div className="h-24 w-24 rounded-2xl bg-white/5" />
                    )}

                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-bold">{item.name_ar}</h3>
                        <p className="shrink-0 font-bold">₪{item.price}</p>
                      </div>

                      {item.description_ar && (
                        <p className="mt-2 text-sm text-white/50">{item.description_ar}</p>
                      )}
                    </div>
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