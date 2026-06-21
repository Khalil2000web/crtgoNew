"use client";

import Image from "next/image";
import MenuCover from "@/components/MenuCover";

export default function TemplateStarter({ menu }) {
  const sections = [...(menu.sections || [])].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  function scrollToSection(sectionId) {
    document
      .getElementById(`section-${sectionId}`)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  const socials = [
    {
      type: "phone",
      value: menu.phone,
      href: menu.phone ? `tel:${menu.phone}` : null,
    },
    {
      type: "whatsapp",
      value: menu.whatsapp,
      href: menu.whatsapp,
    },
    {
      type: "instagram",
      value: menu.instagram,
      href: menu.instagram,
    },
    {
      type: "facebook",
      value: menu.facebook,
      href: menu.facebook,
    },
    {
      type: "tiktok",
      value: menu.tiktok,
      href: menu.tiktok,
    },
  ].filter((item) => item.value);

  return (
    <div
      dir="rtl"
      style={{
        background: menu.background_color || "#fff",
        color: menu.text_color || "#000",
      }}
    >
      {/* HEADER */}

      <header className="relative h-[400px] w-full">
        <MenuCover className="opacity-20" menu={menu} />

        <div className="absolute top-0 right-0 h-full w-full flex flex-col items-center justify-center">
          {menu.logo_url && (
            <Image
            width={100}
              height={100}
              src={menu.logo_url}
              alt={menu.name || "Logo"}
              className="rounded-full pointer-events-none w-26 h-26 object-cover border-2 border-white"
            />
          )}

          <h1 className="text-2xl py-2 font-bold">{menu.name}</h1>

          {menu.description_ar && (
            <p className="text-center text-sm">{menu.description_ar}</p>
          )}
        </div>
      </header>

      {/* SECTION NAVIGATION */}

      {sections.length > 0 && (
        <nav className="sticky top-0 backdrop-blur z-10 flex items-center justify-center gap-5 py-5 border-b border-black/10">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() =>
                scrollToSection(section.id)
              }
              className="text-sm font-medium border p-2 rounded cursor-pointer"
            >
              {section.name_ar}
            </button>
          ))}
        </nav>
      )}

      {/* SECTIONS */}

      <main className="p-5 max-w-3xl mx-auto">
        {sections.map((section) => (
          <section
            key={section.id}
            id={`section-${section.id}`}
            className="mb-10"
          >
            <h2 className="text-2xl font-bold py-3 text-center">{section.name_ar}</h2>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {(section.items || []).map((item) => (
                <article className="flex flex-col h-[290px] items-center border-b pb-2 " key={item.id}>
                  <div className="flex items-center justify-center border border-black/20 bg-black/2 rounded-full w-40 h-40 overflow-hidden mb-2">
                  {item.image_url && (
                    <Image
                    width={400}
                      height={400}
                      src={item.image_url}
                      alt={item.name_ar}
                    className="pointer-events-none rounded-full w-40 h-40 object-cover"
                    />
                  )}
                  </div>

                  <h3 className="text-center text-lg font-bold pt-5">{item.name_ar}</h3>

                  {item.description_ar && (
                    <p className="text-center text-sm mb-2 font-bold opacity-80 w-full">
                      {item.description_ar}
                    </p>
                  )}

                  <p className="text-center font-bold mb-2 text-md">
                    ₪{item.price}
                  </p>

                  {!item.is_available && (
                    <span>
                      غير متوفر حالياً
                    </span>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* SOCIALS */}

      {socials.length > 0 && (
        <footer className="flex w-full items-center justify-center gap-5 py-5 border-t border-black/20">
          {socials.map((social) => (
            <a
              key={social.type}
              href={social.href}
              target="_blank"
              rel="noreferrer"
            >
              {social.type}
            </a>
          ))}
        </footer>
      )}
    </div>
  );
}