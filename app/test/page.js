"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { FaInstagram, FaFacebook, FaTiktok, FaPhoneAlt } from "react-icons/fa";
import { RiTimeLine } from "react-icons/ri";
import { X } from "lucide-react";
import { Noto_Sans_Arabic } from "next/font/google";

const notoArabic = Noto_Sans_Arabic({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["arabic"],
  display: "swap",
});

const translations = {
  ar: {
    workingHours: "ساعات العمل",
    close: "إغلاق",
    terms: "شروط الاستخدام",
    allrights: "جميع الحقوق محفوظة",
    notAvailable: "غير متوفر",
    days: {
      sunday: "الأحد",
      monday: "الاثنين",
      tuesday: "الثلاثاء",
      wednesday: "الأربعاء",
      thursday: "الخميس",
      friday: "الجمعة",
      saturday: "السبت",
    },
  },
  he: {
    workingHours: "שעות פתיחה",
    close: "סגור",
    terms: "תנאי שימוש",
    allrights: "כל הזכויות שמורות",
    notAvailable: "לא זמין",
    days: {
      sunday: "יום ראשון",
      monday: "יום שני",
      tuesday: "יום שלישי",
      wednesday: "יום רביעי",
      thursday: "יום חמישי",
      friday: "יום שישי",
      saturday: "שבת",
    },
  },
};

const data = {
  name: {
    ar: "مطعم CRTGO",
    he: "מסעדת CRTGO",
  },
  logo: "/logo.png",
  headerimg: "/cover.jpg",
  instagram: "https://instagram.com",
  facebook: "",
  tiktok: "",
  phone: "0500000000",
  hours: {
    sunday: "10:00 - 22:00",
    monday: "10:00 - 22:00",
    tuesday: "10:00 - 22:00",
    wednesday: "10:00 - 22:00",
    thursday: "10:00 - 22:00",
    friday: "10:00 - 23:00",
    saturday: "10:00 - 23:00",
  },
  sections: [
    {
      id: "burgers",
      type: "menu",
      image: "/cover.jpg",
      title: {
        ar: "برغر",
        he: "המבורגר",
      },
      items: [
        {
          name: {
            ar: "برغر كلاسيك",
            he: "המבורגר קלאסי",
          },
          desc: {
            ar: "برغر لحم مع خضار وصوص خاص.",
            he: "המבורגר עם ירקות ורוטב מיוחד.",
          },
          price: 45,
          img: "/cover.jpg",
          available: true,
          spicy: false,
        },
        {
          name: {
            ar: "برغر حار",
            he: "המבורגר חריף",
          },
          desc: {
            ar: "برغر مع صوص حار.",
            he: "המבורגר עם רוטב חריף.",
          },
          price: 50,
          img: "/cover.jpg",
          available: true,
          spicy: true,
        },
      ],
    },
  ],
};

function SpicyIcon() {
  return <span className="text-sm">🌶️</span>;
}

export default function Page() {
  const [lang, setLang] = useState("ar");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const sections = data.sections || [];
  const t = translations[lang];

  useEffect(() => {
    document.body.style.backgroundColor = "#091413";

    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      <main
        className={`${notoArabic.className} min-h-screen bg-[#091413] text-[#B0E4CC] scroll-smooth`}
        dir="rtl"
      >
        <header
          dir="ltr"
          className="relative h-[420px] w-full border-b border-white/20 flex items-center justify-center text-center overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-center bg-cover opacity-30"
            style={{ backgroundImage: `url(${data.headerimg})` }}
          />

          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
            <div className="w-[190px] h-[190px] rounded-full overflow-hidden border border-white relative">
              <Image
                src={data.logo}
                alt="logo"
                fill
                className="object-cover pointer-events-none"
              />
            </div>

            <h1 className="text-lg text-white font-bold p-3">
              {data.name?.[lang]}
            </h1>

            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center justify-center rounded-full text-sm cursor-pointer p-2 hover:bg-white hover:text-black transition border font-bold"
            >
              <RiTimeLine className="text-lg" />
              <span className="pl-2 text-sm">{t.workingHours}</span>
            </button>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              {data.instagram && (
                <Link href={data.instagram} target="_blank" className="icon">
                  <FaInstagram />
                </Link>
              )}

              {data.facebook && (
                <Link href={data.facebook} target="_blank" className="icon">
                  <FaFacebook />
                </Link>
              )}

              {data.tiktok && (
                <Link href={data.tiktok} target="_blank" className="icon">
                  <FaTiktok />
                </Link>
              )}

              {data.phone && (
                <Link href={`tel:${data.phone}`} className="icon">
                  <FaPhoneAlt />
                </Link>
              )}
            </div>

            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setLang("ar")}
                className={`px-3 py-1 cursor-pointer rounded border ${
                  lang === "ar" ? "bg-white text-black cursor-default" : ""
                }`}
              >
                عربي
              </button>

              <button
                onClick={() => setLang("he")}
                className={`px-3 py-1 cursor-pointer rounded border ${
                  lang === "he" ? "bg-white text-black cursor-default" : ""
                }`}
              >
                עברית
              </button>
            </div>
          </div>
        </header>

        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-[9999]">
          <div className="fixed inset-0 bg-black/40" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="bg-white text-black p-6 rounded-md w-[90vw] max-w-md min-h-[350px] shadow-lg flex flex-col">
              <DialogTitle className="text-xl pb-3 text-right font-bold">
                {t.workingHours}
              </DialogTitle>

              <ul className="space-y-1 text-gray-700">
                {Object.entries(data.hours || {}).map(([day, time]) => (
                  <li key={day} className="flex justify-between">
                    <span className="font-bold">{time}</span>
                    <span className="font-bold">{t.days[day]}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex justify-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 transition font-bold border border-gray-400 flex items-center gap-2"
                >
                  <X size={18} /> {t.close}
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        <Dialog
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          className="relative z-[9999]"
        >
          <div className="fixed inset-0 bg-black/70" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="bg-white rounded-lg w-[90vw] max-w-md overflow-hidden shadow-xl">
              {selectedItem && (
                <>
                  <div className="relative w-full h-[250px]">
                    <Image
                      src={selectedItem.img}
                      alt={selectedItem.name?.[lang] || "item"}
                      fill
                      className="object-cover pointer-events-none"
                    />
                  </div>

                  <div className="p-4 text-black">
                    <DialogTitle className="flex items-center justify-end gap-2 text-lg text-right font-bold">
                      {selectedItem.spicy && <SpicyIcon />}
                      {selectedItem.name?.[lang]}
                    </DialogTitle>

                    {selectedItem.desc && (
                      <p className="text-sm text-right text-gray-600 mt-2">
                        {selectedItem.desc?.[lang]}
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-4 font-bold">
                      <button
                        onClick={() => setSelectedItem(null)}
                        className="cursor-pointer px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-2 transition border border-gray-900"
                      >
                        <X size={18} /> {t.close}
                      </button>

                      <span>₪{selectedItem.price}</span>
                    </div>
                  </div>
                </>
              )}
            </DialogPanel>
          </div>
        </Dialog>

        <div className="flex flex-wrap justify-center gap-5 py-6 mt-3">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="relative border border-white rounded-full cursor-pointer w-[110px] h-[110px] flex items-center justify-center font-bold px-4 py-2 transition-transform hover:scale-105 text-white overflow-hidden"
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-50"
                style={{ backgroundImage: `url(${section.image})` }}
              />
              <span className="relative z-10">{section.title?.[lang]}</span>
            </button>
          ))}
        </div>

        {sections.map((section) => {
          if (section.type !== "menu") return null;

          return (
            <section key={section.id} id={section.id} className="scroll-mt-20 w-full py-8">
              <h2 className="text-center text-white font-bold text-xl mb-5 md:text-3xl">
                {section.title?.[lang]}
              </h2>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-5">
                {(section.items || []).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedItem(item)}
                    disabled={!item.available}
                    className={`relative w-full text-left transition ${
                      item.available
                        ? "cursor-pointer hover:scale-105"
                        : "cursor-not-allowed"
                    }`}
                  >
                    {!item.available && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-bold z-20 pointer-events-none">
                        {t.notAvailable}
                      </div>
                    )}

                    <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={item.img}
                        alt={item.name?.[lang] || "item"}
                        fill
                        className="object-cover"
                      />

                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-sm flex justify-between items-center px-3 py-2 h-[40px]">
                        <div className="flex items-center gap-1 font-semibold text-right">
                          <span className="font-bold">{item.name?.[lang]}</span>
                          {item.spicy && <SpicyIcon />}
                        </div>

                        <span className="font-bold">₪{item.price}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          );
        })}

        <footer className="mt-12 mb-3 border border-gray-600/40 rounded w-[95%] md:w-[70%] lg:w-[60%] mx-auto text-center flex flex-col gap-4 items-center justify-center py-8">
          <div className="w-[70%] md:w-[45%] lg:w-[40%] mx-auto flex flex-wrap justify-between mt-2">
            {data.instagram && (
              <Link href={data.instagram} target="_blank" className="footerIcon">
                <FaInstagram />
              </Link>
            )}

            {data.facebook && (
              <Link href={data.facebook} target="_blank" className="footerIcon">
                <FaFacebook />
              </Link>
            )}

            {data.tiktok && (
              <Link href={data.tiktok} target="_blank" className="footerIcon">
                <FaTiktok />
              </Link>
            )}

            {data.phone && (
              <Link href={`tel:${data.phone}`} className="footerIcon">
                <FaPhoneAlt />
              </Link>
            )}
          </div>

          <Link
            className="p-3 underline underline-offset-2 hover:bg-white hover:text-black rounded font-bold transition"
            href="/terms"
          >
            {t.terms}
          </Link>

          <p className="text-white" dir="ltr">
            &copy; {new Date().getFullYear()} CRTGO & {data.name?.[lang]}
          </p>

          <p className="text-white">{t.allrights}</p>

          <p className="text-white" dir="ltr">
            CREATED BY <Link href="/">CRTGO, WEB SERVICES ❤️</Link>
          </p>
        </footer>
      </main>

      <Script
        src="https://cdn.jsdelivr.net/npm/sienna-accessibility@latest/dist/sienna-accessibility.umd.js"
        strategy="afterInteractive"
      />
    </>
  );
}