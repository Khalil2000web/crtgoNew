"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { FaInstagram, FaFacebook, FaTiktok, FaPhoneAlt } from "react-icons/fa";
import { RiTimeLine } from "react-icons/ri";
import { Globe, X, MapPin } from "lucide-react";
import { Noto_Sans_Arabic } from "next/font/google";

const notoArabic = Noto_Sans_Arabic({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["arabic"],
  display: "swap",
});

const translations = {
  ar: {
    workingHours: "ساعات العمل",
    back: "العودة",
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
    back: "חזרה",
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
  mainDesc: {
    ar: "أشهى الوجبات والمشروبات",
    he: "מנות ומשקאות טעימים",
  },
  location: {
    ar: "شفا عمرو",
    he: "שפרעם",
  },
  logo: "/logo.png",
  headerImages: ["/cover.jpg", "/cover.jpg", "/cover.jpg"],
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
  const [index, setIndex] = useState(0);
  const [lang, setLang] = useState("ar");
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const t = translations[lang];
  const sections = data.sections || [];
  const headerImages = data.headerImages || [];

  useEffect(() => {
    document.body.style.backgroundColor = "#e2e2e2";

    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  useEffect(() => {
    if (headerImages.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % headerImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [headerImages.length]);

  return (
    <>
      <main
        className={`${notoArabic.className} min-h-screen bg-[#e2e2e2] text-black mx-auto scroll-smooth`}
        dir="rtl"
      >
        <div className="h-[340px] w-full md:w-[60%] mx-auto relative">
          {headerImages.map((src, i) => (
            <div
              key={i}
              className={`absolute inset-0 rounded-b-[20px] max-h-[220px] h-full w-full overflow-hidden transition-opacity duration-700 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>

        <div className="absolute z-10 h-[230px] top-[160px] left-1/2 -translate-x-1/2 flex flex-col pt-7 w-[85vw] md:w-[55%] bg-gray-100 border border-gray-300 rounded-[20px] items-center shadow-lg">
          <h1 className="text-xl text-black font-bold pt-7">
            {data.name?.[lang]}
          </h1>

          <p className="text-sm text-gray-600 mt-1">
            {data.mainDesc?.[lang]}
          </p>

          <p className="flex gap-2 items-center justify-center text-sm text-gray-600 mt-1">
            <MapPin size={18} />
            {data.location?.[lang]}
          </p>

          <div className="flex items-center justify-between flex-row w-full px-[10px] mt-8">
            <div className="flex items-center justify-center gap-2 relative">
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center text-black justify-center rounded-full text-sm cursor-pointer bg-[#bf3013]/30 hover:bg-white p-2 transition border font-bold border-black hover:text-black gap-2"
              >
                <RiTimeLine className="text-lg" />
              </button>

              <button
                onClick={() => setLangMenuOpen((prev) => !prev)}
                className="cursor-pointer flex items-center gap-2 text-gray-400 hover:text-black transition-colors"
              >
                <Globe size={20} />
                <span className="text-sm text-gray-600">
                  {lang === "ar" ? "ع" : "עב"}
                </span>
              </button>

              {langMenuOpen && (
                <div className="absolute top-full mt-2 bg-white border border-gray-200 p-2 min-w-[120px] flex flex-col gap-2 z-50">
                  <button
                    onClick={() => {
                      setLang("ar");
                      setLangMenuOpen(false);
                    }}
                    className={`px-3 py-1 border-gray-400 font-bold text-black border-2 cursor-pointer rounded w-full ${
                      lang === "ar" ? "bg-black text-white" : ""
                    }`}
                  >
                    عربي
                  </button>

                  <button
                    onClick={() => {
                      setLang("he");
                      setLangMenuOpen(false);
                    }}
                    className={`px-3 py-1 border-gray-400 font-bold text-black border-2 cursor-pointer rounded w-full ${
                      lang === "he" ? "bg-black text-white" : ""
                    }`}
                  >
                    עברית
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center flex-wrap text-black gap-2">
              {data.instagram && (
                <Link href={data.instagram} target="_blank" className="topIcon">
                  <FaInstagram />
                </Link>
              )}

              {data.facebook && (
                <Link href={data.facebook} target="_blank" className="topIcon">
                  <FaFacebook />
                </Link>
              )}

              {data.tiktok && (
                <Link href={data.tiktok} target="_blank" className="topIcon">
                  <FaTiktok />
                </Link>
              )}

              {data.phone && (
                <Link href={`tel:${data.phone}`} className="topIcon">
                  <FaPhoneAlt />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="absolute z-20 top-[110px] left-1/2 -translate-x-1/2 w-25 h-25 rounded-full overflow-hidden border-4 border-gray-100">
          <Image
            src={data.logo}
            alt="Logo"
            fill
            className="pointer-events-none object-cover block"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full md:w-[60%] mx-auto bg-gray-300 border border-gray-500/10 rounded-[20px] py-22">
          {sections.map((section, i) => (
            <button
              key={section.id || i}
              onClick={() => setActiveSection(section)}
              className="flex flex-col items-center cursor-pointer gap-3"
            >
              <div className="relative w-[120px] h-[120px] md:w-[140px] md:h-[140px]">
                <Image
                  src={section.image}
                  alt={section.title?.[lang] || "section"}
                  fill
                  className="object-cover rounded-full shadow-md"
                />
              </div>

              <span className="text-center font-semibold text-[18px] md:text-base">
                {section.title?.[lang]}
              </span>
            </button>
          ))}
        </div>

        <Dialog
          open={!!activeSection}
          onClose={() => setActiveSection(null)}
          className="relative z-[9999]"
        >
          <div className="fixed inset-0 bg-gray-200" />

          <div className="fixed inset-0 flex flex-col text-white">
            {activeSection && (
              <>
                <div className="text-center py-4 mt-2 border-b border-gray-700/30">
                  <DialogTitle className="text-lg font-bold text-black">
                    {activeSection.title?.[lang]}
                  </DialogTitle>
                </div>

                <div className="flex-1 overflow-y-auto p-4 pb-18 flex flex-col gap-6">
                  {(activeSection.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-start gap-4 relative"
                    >
                      {!item.available && (
                        <div className="absolute inset-0 bg-black/60 flex rounded-md items-center justify-center text-white text-lg font-bold z-[300]">
                          {t.notAvailable}
                        </div>
                      )}

                      <div className="relative w-[110px] h-[110px] flex-shrink-0">
                        <Image
                          src={item.img}
                          alt={item.name?.[lang] || "item"}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>

                      <div className="flex flex-col gap-1 text-black text-right">
                        <p className="font-semibold flex items-center justify-end gap-2">
                          {item.spicy && <SpicyIcon />}
                          {item.name?.[lang]}
                        </p>

                        <p className="font-bold">₪{item.price}</p>

                        <p className="text-sm text-gray-900">
                          {item.desc?.[lang]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="sticky bottom-0 w-full bg-gray-200 border-t border-gray-700 p-4 flex justify-center">
                  <button
                    onClick={() => setActiveSection(null)}
                    className="bg-black text-white px-6 py-2 rounded font-bold hover:bg-white cursor-pointer border border-white hover:border-black hover:text-black transition"
                  >
                    {t.back}
                  </button>
                </div>
              </>
            )}
          </div>
        </Dialog>

        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-[9999]">
          <div className="fixed inset-0 bg-black/60" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="bg-gray-300 text-white border-2 border-black p-6 rounded-md w-[90vw] max-w-md min-h-[350px] shadow-lg flex flex-col">
              <DialogTitle className="text-xl pb-3 text-right text-black font-bold">
                {t.workingHours}
              </DialogTitle>

              <ul className="space-y-1 text-gray-700">
                {Object.entries(data.hours || {}).map(([day, time]) => (
                  <li key={day} className="flex justify-between text-gray-900">
                    <span className="font-bold">{time}</span>
                    <span className="font-bold">{t.days[day]}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex justify-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-black hover:bg-white hover:text-black border border-white text-white hover:border-black p-2 rounded-full cursor-pointer transition font-bold"
                >
                  <X />
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        <footer className="text-black mt-12 mb-3 rounded-[20px] bg-gray-300 w-full md:w-[60%] mx-auto text-center flex flex-col gap-4 items-center justify-center py-8">
          <Link
            className="underline-offset-4 hover:underline p-2 rounded transition"
            href="/terms"
          >
            {t.terms}
          </Link>

          <p className="text-sm" dir="ltr">
            &copy; {new Date().getFullYear()} CRTGO & {data.name?.[lang]}
          </p>

          <p className="text-sm">{t.allrights}</p>

          <p className="text-sm" dir="ltr">
            CREATED BY{" "}
            <Link
              className="text-black font-bold hover:underline underline-offset-4"
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