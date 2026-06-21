"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { FaInstagram, FaFacebook, FaTiktok, FaPhoneAlt } from "react-icons/fa";
import { RiTimeLine } from "react-icons/ri";
import { Globe } from "lucide-react";
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
  templateConfig: {
    template3: {
      headerImages: ["/cover.jpg", "/cover.jpg", "/cover.jpg"],
    },
  },
  sections: [
    {
      id: "burgers",
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
  const [openIndex, setOpenIndex] = useState([]);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const t = translations[lang];
  const sections = data.sections || [];
  const headerImages = data.templateConfig?.template3?.headerImages || [];

  useEffect(() => {
    document.body.style.backgroundColor = "#101820";

    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <>
      <main
        className={`${notoArabic.className} min-h-screen bg-[#101820] text-[#f2aa4c] scroll-smooth`}
        dir="rtl"
      >
        <div className="fixed top-0 right-0 w-full flex z-[1000] items-center justify-start gap-3 p-5">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center rounded-full text-sm cursor-pointer bg-[#f2aa4c] text-black hover:bg-white p-2 hover:border-[#f2aa4c] transition border-2 font-bold border-white gap-2"
          >
            <RiTimeLine className="text-lg" />
          </button>

          <div className="relative inline-block">
            <button
              onClick={() => setLangMenuOpen((prev) => !prev)}
              className="cursor-pointer flex items-center gap-2 text-gray-400 hover:text-[#f2aa4c] transition-colors"
            >
              <Globe size={20} />
              <span className="text-sm text-white">
                {lang === "ar" ? "ع" : "עב"}
              </span>
            </button>

            {langMenuOpen && (
              <div className="absolute top-full mt-2 bg-white border border-gray-200 p-2 min-w-[120px] flex flex-col gap-2">
                <button
                  onClick={() => {
                    setLang("ar");
                    setLangMenuOpen(false);
                  }}
                  className={`px-3 py-1 font-bold text-black border-2 cursor-pointer rounded w-full ${
                    lang === "ar" ? "bg-[#f2aa4c]" : "border-black"
                  }`}
                >
                  عربي
                </button>

                <button
                  onClick={() => {
                    setLang("he");
                    setLangMenuOpen(false);
                  }}
                  className={`px-3 py-1 font-bold text-black border-2 cursor-pointer rounded w-full ${
                    lang === "he" ? "bg-[#f2aa4c]" : "border-black"
                  }`}
                >
                  עברית
                </button>
              </div>
            )}
          </div>
        </div>

        <div dir="ltr" className="overflow-hidden w-full h-[320px] relative mb-6">
          <div className="flex w-max animate-header-scroll absolute">
            {[...headerImages, ...headerImages].map((src, i) => (
              <div key={i} className="flex-none w-[350px] h-[320px] relative">
                <Image
                  src={src}
                  alt=""
                  fill
                  className="pointer-events-none block object-cover"
                />
              </div>
            ))}
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white relative">
              <Image
                src={data.logo}
                alt="Logo"
                fill
                className="pointer-events-none object-cover"
              />
            </div>

            <h1 className="text-xl text-[#f2aa4c] font-bold mt-4">
              {data.name?.[lang]}
            </h1>
          </div>
        </div>

        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-[9999]">
          <div className="fixed inset-0 bg-black/40" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="bg-[#101820] text-white border border-[#f2aa4c] p-6 rounded-md w-[90vw] max-w-md min-h-[350px] shadow-lg flex flex-col">
              <DialogTitle className="text-xl pb-3 text-right font-bold">
                {t.workingHours}
              </DialogTitle>

              <ul className="space-y-1">
                {Object.entries(data.hours || {}).map(([day, time]) => (
                  <li key={day} className="flex justify-between text-gray-300">
                    <span className="font-bold">{time}</span>
                    <span className="font-bold">{t.days[day]}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex justify-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-[#f2aa4c] hover:bg-white hover:text-black border-2 text-black hover:border-[#f2aa4c] px-3 py-1 rounded cursor-pointer transition font-bold"
                >
                  {t.close}
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        <div className="flex flex-col fixed right-[20px] bottom-[20px] z-[100] items-center justify-center gap-1">
          {data.instagram && (
            <Link href={data.instagram} target="_blank" className="socialIcon">
              <FaInstagram />
            </Link>
          )}

          {data.facebook && (
            <Link href={data.facebook} target="_blank" className="socialIcon">
              <FaFacebook />
            </Link>
          )}

          {data.tiktok && (
            <Link href={data.tiktok} target="_blank" className="socialIcon">
              <FaTiktok />
            </Link>
          )}

          {data.phone && (
            <Link href={`tel:${data.phone}`} className="socialIcon">
              <FaPhoneAlt />
            </Link>
          )}
        </div>

        {sections.map((section, i) => {
          const sectionOpen = openIndex.includes(i);

          return (
            <section
              key={section.id || i}
              className={`flex flex-col gap-5 p-3 w-[90%] md:w-[65%] mx-auto overflow-hidden rounded-md transition ${
                sectionOpen ? "border mb-12 border-gray-400" : ""
              }`}
            >
              <button
                onClick={() =>
                  setOpenIndex((prev) =>
                    prev.includes(i)
                      ? prev.filter((index) => index !== i)
                      : [...prev, i]
                  )
                }
                className="relative flex items-center w-full h-[190px] px-4 overflow-hidden cursor-pointer rounded-[4px] transition border border-gray-300/30"
              >
                <div className="absolute left-0 top-0 h-full w-[45%]">
                  <Image
                    src={section.image}
                    alt="Section Image"
                    fill
                    className="object-cover pointer-events-none"
                    style={{
                      maskImage: "linear-gradient(to right, black 60%, transparent)",
                      WebkitMaskImage:
                        "linear-gradient(to right, black 10%, transparent)",
                    }}
                  />
                </div>

                <span className="relative z-10 text-right font-semibold">
                  {section.title?.[lang]}
                </span>
              </button>

              <div
                className={`transition-all duration-300 gap-6 overflow-hidden ${
                  sectionOpen ? "max-h-[1600px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="flex flex-col gap-6 p-4">
                  {(section.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="relative flex items-start justify-between gap-4"
                    >
                      {!item.available && (
                        <div className="absolute inset-0 bg-black/60 flex rounded-md items-center justify-center text-white text-lg font-bold z-[300]">
                          {t.notAvailable}
                        </div>
                      )}

                      <div className="flex flex-col gap-1">
                        <p className="text-right text-md flex flex-row items-center gap-2">
                          {item.name?.[lang]}
                          {item.spicy && <SpicyIcon />}
                        </p>

                        <p className="text-md font-bold">₪{item.price}</p>

                        <p className="text-sm text-gray-400">
                          {item.desc?.[lang]}
                        </p>
                      </div>

                      <div className="relative w-[140px] h-[140px] md:w-[180px] md:h-[180px] flex-shrink-0">
                        <Image
                          src={item.img}
                          alt={item.name?.[lang] || "item"}
                          fill
                          className="object-cover rounded-md pointer-events-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        <footer className="mt-12 mb-3 border border-gray-600/40 rounded w-[95%] md:w-[70%] lg:w-[60%] mx-auto text-center flex flex-col gap-4 items-center justify-center py-8">
          <Link
            className="underline underline-offset-4 hover:bg-white hover:border-[#f2aa4c] border-2 border-transparent hover:text-black p-2 rounded transition"
            href="/terms"
          >
            {t.terms}
          </Link>

          <p className="text-white" dir="ltr">
            &copy; {new Date().getFullYear()} CRTGO & {data.name?.[lang]}
          </p>

          <p className="text-white">{t.allrights}</p>

          <p className="text-white" dir="ltr">
            CREATED BY{" "}
            <Link
              className="text-[#f2aa4c] hover:underline underline-offset-4"
              href="/"
            >
              CRTGO, WEB SERVICES ❤️
            </Link>
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