"use client";

import { useState } from "react";
import MenuCover from "@/components/MenuCover";
import Image from "next/image";
import { MapPin, Globe, X } from "lucide-react";
import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaWhatsapp,
  FaPhone,
} from "react-icons/fa";

export default function TemplateStarter({ menu }) {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [...(menu.sections || [])].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  const socials = [
    { type: "phone", value: menu.phone, href: menu.phone ? `tel:${menu.phone}` : null },
    { type: "whatsapp", value: menu.whatsapp, href: menu.whatsapp },
    { type: "instagram", value: menu.instagram, href: menu.instagram },
    { type: "facebook", value: menu.facebook, href: menu.facebook },
    { type: "tiktok", value: menu.tiktok, href: menu.tiktok },
  ].filter((item) => item.value);

  const socialIcons = {
    phone: FaPhone,
    whatsapp: FaWhatsapp,
    instagram: FaInstagram,
    facebook: FaFacebook,
    tiktok: FaTiktok,
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full pb-10"
      style={{
        background: menu.background_color || "#fff",
        color: menu.text_color || "#000",
      }}
    >
      <header className="relative mb-28 flex h-[330px] w-full items-center justify-center">
        <div className="absolute left-0 top-0 h-[320px] w-full overflow-hidden rounded-b-2xl">
          <MenuCover menu={menu} />
        </div>

        {menu.logo_url && (
          <div className="absolute top-46 left-1/2 z-20 -translate-x-1/2">
            <Image
              width={100}
              height={100}
              className="pointer-events-none rounded-full border border-black/20 object-cover"
              src={menu.logo_url}
              alt={menu.name}
            />
          </div>
        )}

        <div className="absolute top-60 left-1/2 z-10 flex min-h-[250px] w-[85%] -translate-x-1/2 flex-col items-center justify-between rounded-2xl bg-white p-4 shadow-lg">
          <div className="flex flex-col items-center justify-center pt-12">
            <h1 className="text-center text-2xl font-bold uppercase">
              {menu.name}
            </h1>

            {menu.description_ar && (
              <p className="mt-1 text-center text-md">{menu.description_ar}</p>
            )}

            {menu.location && (
              <div className="flex items-center justify-center gap-2 pt-3 opacity-70">
                <MapPin size={20} />
                <p className="text-center text-md">{menu.location}</p>
              </div>
            )}
          </div>

          <div className="flex w-full items-center justify-between py-2">
            <button type="button">
              <Globe size={22} />
            </button>

            {socials.length > 0 && (
              <div className="flex items-center justify-center gap-4">
                {socials.map((social) => {
                  const Icon = socialIcons[social.type];

                  return (
                    <a
                      key={social.type}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-8 w-8 items-center justify-center transition hover:scale-110"
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-[92%] rounded-3xl bg-gray-200 p-5">
        {sections.length > 0 && (
          <nav className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section)}
                className="flex aspect-square items-center justify-center rounded-2xl border border-gray-300 bg-white p-4 text-center text-lg font-bold shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {section.name_ar}
              </button>
            ))}
          </nav>
        )}
      </main>

      {activeSection && (
        <div className="fixed inset-0 z-[999] flex items-end justify-center bg-black/60 p-3 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl no-scrollbar sm:p-8">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white pb-4">
              <div>
                <p className="text-sm opacity-50">القسم</p>
                <h2 className="text-3xl font-bold">{activeSection.name_ar}</h2>
              </div>

              <button
                type="button"
                onClick={() => setActiveSection(null)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {(activeSection.items || []).map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-black/10 bg-white"
                >
                  {item.image_url && (
                    <div className="relative h-44 w-full">
                      <Image
                        src={item.image_url}
                        alt={item.name_ar}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-bold">{item.name_ar}</h3>

                      <p className="shrink-0 font-bold">₪{item.price}</p>
                    </div>

                    {item.description_ar && (
                      <p className="mt-2 text-sm leading-6 opacity-60">
                        {item.description_ar}
                      </p>
                    )}

                    {!item.is_available && (
                      <span className="mt-3 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                        غير متوفر حالياً
                      </span>
                    )}
                  </div>
                </article>
              ))}

              {(!activeSection.items || activeSection.items.length === 0) && (
                <p className="rounded-2xl border border-black/10 p-5 text-center opacity-50 sm:col-span-2">
                  لا توجد أصناف داخل هذا القسم.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}