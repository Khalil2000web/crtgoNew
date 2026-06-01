"use client";

import MenuCover from "@/components/MenuCover";
import Image from "next/image";
import { CircleFadingPlus, Phone }  from "lucide-react";
import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaWhatsapp,
  FaPhone,
} from "react-icons/fa";

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

export default function ClassicTemplate({ menu }) {
  const sections = [...(menu.sections || [])].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  function scrollToSection(sectionId) {
    document.getElementById(`section-${sectionId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div dir="rtl" className="min-h-screen w-full bg-[#fefefe] text-[#877259]">
      <div className="relative h-[400px] w-full overflow-hidden border-b border-white/70">
        <MenuCover menu={menu} />

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <h1 className="text-center text-4xl font-black uppercase text-white">
            {menu.name}
          </h1>

          {menu.description_ar && (
            <p className="mt-1 text-center text-white/90">
              {menu.description_ar}
            </p>
          )}
        </div>
      </div>

      <section className="py-8">
        {menu.logo_url && (
          <Image
            width={100}
            height={100}
            src={menu.logo_url}
            alt={menu.name}
            className="mb-5 hidden h-24 w-24 rounded-3xl object-cover"
          />
        )}

        {sections.length > 0 && (
          <div className="sticky top-0 z-40 mb-8 flex w-full items-center justify-center overflow-x-auto border-b border-black/30 px-5 py-4 backdrop-blur-lg no-scrollbar">
            <div className="flex gap-3">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className="shrink-0 cursor-pointer rounded-md border border-black px-5 py-2 text-md font-bold transition"
                >
                  {section.name_ar}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 space-y-12">
          {sections.map((section) => (
            <section
              id={`section-${section.id}`}
              key={section.id}
              className="scroll-mt-24"
            >
              <h2 className="text-center text-2xl font-black text-black">
                {section.name_ar}
              </h2>

<div
  onWheelCapture={(e) => {
    const el = e.currentTarget;

    const canScrollLeft = el.scrollLeft > 0;
    const canScrollRight =
      el.scrollLeft < el.scrollWidth - el.clientWidth - 1;

    const scrollingDown = e.deltaY > 0;
    const scrollingUp = e.deltaY < 0;

    const shouldHandle =
      (scrollingDown && canScrollRight) || (scrollingUp && canScrollLeft);

    if (shouldHandle) {
      e.preventDefault();
      e.stopPropagation();
      el.scrollLeft += e.deltaY;
    }
  }}
  className="horizontal-scroll-lock mt-6 w-full overflow-x-auto overflow-y-hidden no-scrollbar"
>
                <div className="flex min-w-max">
                  {(section.items || []).map((item, index, arr) => (
                    <article
                      key={item.id}
                      className={`
                        flex w-[220px] shrink-0 flex-col items-center px-5 text-center
                        ${
                          index !== arr.length - 1
                            ? "border-l border-black/20"
                            : ""
                        }
                      `}
                    >
                      {item.image_url ? (
                        <Image
                          width={120}
                          height={120}
                          src={item.image_url}
                          alt={item.name_ar}
                          className="h-38 w-38 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-38 w-38 rounded-full bg-black/10" />
                      )}

                      <div className="mt-4 flex flex-col items-center gap-1">
                        <h3 className="font-bold text-black">
                          {item.name_ar}
                        </h3>

                        {item.description_ar && (
                          <p className="text-sm leading-5 text-black/50">
                            {item.description_ar}
                          </p>
                        )}

                        <p className="mt-1 font-bold text-black">
                          ₪{item.price}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </section>


      <Menu>
  <MenuButton className="fixed bottom-1 left-1 z-40 cursor-pointer p-5 text-black">
    <CircleFadingPlus />
  </MenuButton>

  <MenuItems
    anchor="bottom"
    className="flex max-w-[50px] flex-col gap-4 p-2"
  >
    {menu.phone && (
      <MenuItem>
        <a
          href={`tel:${menu.phone}`}
          className="block rounded-lg px-3 py-2 data-focus:bg-black/5"
        >
          <FaPhone />
        </a>
      </MenuItem>
    )}

    {menu.whatsapp && (
      <MenuItem>
        <a
          href={menu.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg px-3 py-2 data-focus:bg-black/5"
        >
          < FaWhatsapp />
        </a>
      </MenuItem>
    )}

    {menu.instagram && (
      <MenuItem>
        <a
          href={menu.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg px-3 py-2 data-focus:bg-black/5"
        >
          <FaInstagram />
        </a>
      </MenuItem>
    )}

    {menu.tiktok && (
      <MenuItem>
        <a
          href={menu.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg px-3 py-2 data-focus:bg-black/5"
        >
          <FaTiktok />
        </a>
      </MenuItem>
    )}

    {menu.facebook && (
      <MenuItem>
        <a
          href={menu.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg px-3 py-2 data-focus:bg-black/5"
        >
          <FaFacebook />
        </a>
      </MenuItem>
    )}
  </MenuItems>
</Menu>
    </div>
  );
}