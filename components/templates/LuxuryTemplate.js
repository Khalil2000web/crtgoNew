import MenuCover from "@/components/MenuCover";

export default function LuxuryTemplate({ menu }) {
  const sections = [...(menu.sections || [])].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  return (
    <main dir="rtl" className="min-h-screen bg-[#080604] text-[#f5ead8]">
      <MenuCover menu={menu} />

      <section className="px-5 py-10">
        <div className="mx-auto max-w-5xl">
          {menu.logo_url && (
            <img
              src={menu.logo_url}
              alt={menu.name}
              className="mx-auto h-28 w-28 rounded-full object-cover"
            />
          )}

          <h1 className="mt-8 text-center text-5xl font-black tracking-tight">
            {menu.name}
          </h1>

          {menu.description_ar && (
            <p className="mx-auto mt-4 max-w-xl text-center text-[#f5ead8]/60">
              {menu.description_ar}
            </p>
          )}

          <div className="mt-12 space-y-16">
            {sections.map((section) => (
              <section key={section.id}>
                <h2 className="border-b border-[#f5ead8]/20 pb-4 text-3xl font-black">
                  {section.name_ar}
                </h2>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {(section.items || []).map((item) => (
                    <article
                      key={item.id}
                      className="rounded-[2rem] border border-[#f5ead8]/15 p-5"
                    >
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name_ar}
                          className="mb-4 h-52 w-full rounded-[1.5rem] object-cover"
                        />
                      )}

                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-bold">{item.name_ar}</h3>
                        <p className="font-black">₪{item.price}</p>
                      </div>

                      {item.description_ar && (
                        <p className="mt-3 text-sm text-[#f5ead8]/55">
                          {item.description_ar}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}