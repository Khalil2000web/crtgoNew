"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Globe,
  Info,
  Languages,
  Loader2,
  MapPin,
  Phone,
} from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";

import { createClient } from "@/lib/supabase/client";
import { revalidatePublicMenu } from "@/lib/revalidate-public-menu";
import {
  getLanguage,
  getTranslatedText,
  LANGUAGES,
  normalizeEnabledLanguages,
  setTranslatedText,
} from "@/lib/i18n";

export default function DetailsForm({ menu }) {
  const router = useRouter();
  const supabase = createClient();

  const enabledLanguages = useMemo(() => {
    return normalizeEnabledLanguages(menu.enabled_languages);
  }, [menu.enabled_languages]);

  const firstLanguage = enabledLanguages.includes(menu.default_language)
    ? menu.default_language
    : enabledLanguages[0];

  const [activeLanguage, setActiveLanguage] = useState(firstLanguage);

  const [form, setForm] = useState({
    name_i18n: {
      ...(menu.name_i18n || {}),
      ar: getTranslatedText(menu.name_i18n, "ar", menu.name || ""),
    },
    description_i18n: {
      ...(menu.description_i18n || {}),
      ar: getTranslatedText(
        menu.description_i18n,
        "ar",
        menu.description_ar || ""
      ),
    },
    location_i18n: {
      ...(menu.location_i18n || {}),
      ar: getTranslatedText(menu.location_i18n, "ar", menu.location || ""),
    },
    phone: menu.phone || "",
    whatsapp: menu.whatsapp || "",
    instagram: menu.instagram || "",
    tiktok: menu.tiktok || "",
    facebook: menu.facebook || "",
  });

  const [initialForm, setInitialForm] = useState(form);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeLanguageData = getLanguage(activeLanguage);

  const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm);

  function clearAlerts() {
    setMessage("");
    setError("");
  }

  function updateTranslatedField(field, value) {
    clearAlerts();

    setForm((current) => ({
      ...current,
      [field]: setTranslatedText(current[field], activeLanguage, value),
    }));
  }

  function updateField(field, value) {
    clearAlerts();

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function discardChanges() {
    setForm(initialForm);
    setMessage("");
    setError("");
  }

  async function saveDetails() {
    setSaving(true);
    setMessage("");
    setError("");

    const arabicName = getTranslatedText(
      form.name_i18n,
      "ar",
      menu.name || ""
    ).trim();

    const arabicDescription = getTranslatedText(
      form.description_i18n,
      "ar",
      menu.description_ar || ""
    ).trim();

    const arabicLocation = getTranslatedText(
      form.location_i18n,
      "ar",
      menu.location || ""
    ).trim();

    if (!arabicName) {
      setSaving(false);
      setError("اسم القائمة بالعربية مطلوب لأنه لغة الرجوع الأساسية.");
      return;
    }

    const payload = {
      name: arabicName,
      description_ar: arabicDescription,
      location: arabicLocation,
      name_i18n: form.name_i18n,
      description_i18n: form.description_i18n,
      location_i18n: form.location_i18n,
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim(),
      instagram: form.instagram.trim(),
      tiktok: form.tiktok.trim(),
      facebook: form.facebook.trim(),
    };

    const { error: updateError } = await supabase
      .from("menus")
      .update(payload)
      .eq("id", menu.id);

    if (updateError) {
      setSaving(false);
      setError(updateError.message);
      return;
    }

    await revalidatePublicMenu(menu.id);

    const nextForm = {
      ...form,
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim(),
      instagram: form.instagram.trim(),
      tiktok: form.tiktok.trim(),
      facebook: form.facebook.trim(),
    };

    setForm(nextForm);
    setInitialForm(nextForm);
    setSaving(false);
    setMessage("تم حفظ معلومات القائمة.");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl pb-32">
        <div className="mb-6">
          <Link
            href={`/admin/menus/${menu.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-black text-white/70 transition hover:bg-white hover:text-black"
          >
            <ArrowRight size={16} />
            رجوع للقائمة
          </Link>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl">
          <div className="border-b border-white/10 bg-white/[0.03] p-5 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
                  <Info size={26} />
                </div>

                <p className="text-sm font-black uppercase tracking-[0.3em] text-white/35">
                  Details
                </p>

                <h1 className="mt-2 text-3xl font-black sm:text-5xl">
                  معلومات القائمة
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                  عدّل اسم القائمة والوصف والموقع بكل اللغات المفعّلة. إذا تركت
                  ترجمة فارغة، القائمة العامة سترجع للعربية تلقائياً.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs font-black text-white/35">الرابط العام</p>
                <p dir="ltr" className="mt-1 text-sm font-black text-white/70">
                  /m/{menu.subdomain}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-5 sm:p-7">
            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-200">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm font-bold text-green-200">
                {message}
              </div>
            )}

            <section className="rounded-[1.5rem] border border-white/10 bg-black/30 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <Languages size={20} className="text-white/45" />
                <div>
                  <h2 className="text-xl font-black">اللغة</h2>
                  <p className="mt-1 text-sm text-white/40">
                    اختر اللغة التي تريد تعديل نصوصها.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {enabledLanguages.map((languageCode) => {
                  const language = getLanguage(languageCode);
                  const active = activeLanguage === languageCode;

                  return (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => setActiveLanguage(language.code)}
                      className={`rounded-full cursor-pointer px-4 py-2 text-sm font-black transition ${
                        active
                          ? "bg-white text-black"
                          : "bg-white/[0.07] text-white hover:bg-white/[0.12]"
                      }`}
                    >
                      {language.shortLabel}
                    </button>
                  );
                })}
              </div>
            </section>

            <section
              dir={activeLanguageData.dir}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5"
            >
              <div className="mb-5">
                <p className="text-sm font-black text-white/35">
                  {activeLanguageData.label}
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  نصوص القائمة
                </h2>
              </div>

              <div className="grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-white/60">
                    اسم القائمة
                  </span>

                  <input
                    value={form.name_i18n?.[activeLanguage] || ""}
                    onChange={(e) =>
                      updateTranslatedField("name_i18n", e.target.value)
                    }
                    placeholder={
                      activeLanguage === "ar"
                        ? "مثلاً: كافيه خالد"
                        : "Translation..."
                    }
                    className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/20 focus:border-white/35"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black text-white/60">
                    وصف القائمة
                  </span>

                  <textarea
                    value={form.description_i18n?.[activeLanguage] || ""}
                    onChange={(e) =>
                      updateTranslatedField(
                        "description_i18n",
                        e.target.value
                      )
                    }
                    placeholder={
                      activeLanguage === "ar"
                        ? "وصف قصير يظهر في أعلى القائمة..."
                        : "Translation..."
                    }
                    rows={4}
                    className="resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/20 focus:border-white/35"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black text-white/60">
                    الموقع
                  </span>

                  <input
                    value={form.location_i18n?.[activeLanguage] || ""}
                    onChange={(e) =>
                      updateTranslatedField("location_i18n", e.target.value)
                    }
                    placeholder={
                      activeLanguage === "ar"
                        ? "مثلاً: شفاعمرو"
                        : "Translation..."
                    }
                    className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/20 focus:border-white/35"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <div className="mb-5 flex items-center gap-3">
                <Phone size={20} className="text-white/45" />
                <div>
                  <h2 className="text-2xl font-black">التواصل والسوشال</h2>
                  <p className="mt-1 text-sm text-white/40">
                    هذه الحقول لا تحتاج ترجمة لأنها روابط وأرقام.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-white/60">
                    رقم الهاتف
                  </span>

                  <input
                    dir="ltr"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="0500000000"
                    className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/20 focus:border-white/35"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="flex items-center gap-2 text-sm font-black text-white/60">
                    <FaWhatsapp />
                    واتساب
                  </span>

                  <input
                    dir="ltr"
                    value={form.whatsapp}
                    onChange={(e) => updateField("whatsapp", e.target.value)}
                    placeholder="972500000000"
                    className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/20 focus:border-white/35"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="flex items-center gap-2 text-sm font-black text-white/60">
                    <FaInstagram />
                    Instagram
                  </span>

                  <input
                    dir="ltr"
                    value={form.instagram}
                    onChange={(e) => updateField("instagram", e.target.value)}
                    placeholder="@username"
                    className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/20 focus:border-white/35"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="flex items-center gap-2 text-sm font-black text-white/60">
                    <FaTiktok />
                    TikTok
                  </span>

                  <input
                    dir="ltr"
                    value={form.tiktok}
                    onChange={(e) => updateField("tiktok", e.target.value)}
                    placeholder="@username"
                    className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/20 focus:border-white/35"
                  />
                </label>

                <label className="grid gap-2 sm:col-span-2">
                  <span className="flex items-center gap-2 text-sm font-black text-white/60">
                    <FaFacebook />
                    Facebook
                  </span>

                  <input
                    dir="ltr"
                    value={form.facebook}
                    onChange={(e) => updateField("facebook", e.target.value)}
                    placeholder="page-name أو رابط كامل"
                    className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/20 focus:border-white/35"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-orange-400/20 bg-orange-400/10 p-5">
              <div className="flex gap-3">
                <MapPin size={20} className="mt-1 shrink-0 text-orange-100" />

                <div>
                  <h2 className="text-xl font-black text-orange-100">
                    كيف يعمل الرجوع للعربية؟
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-orange-100/70">
                    إذا الزبون اختار Hebrew أو English وكان النص فارغاً، سيتم
                    عرض النص العربي تلقائياً بدلاً من ترك مكان فارغ في القائمة.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>

      <div className="fixed bottom-24 left-4 right-4 z-[80] md:left-[22rem]">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0f0f0f]/95 p-3 shadow-2xl backdrop-blur">
          <div>
            <p className="text-sm font-black text-white">
              {hasChanges ? "لديك تغييرات غير محفوظة" : "كل شيء محفوظ"}
            </p>

            <p className="mt-1 text-xs text-white/40">
              اللغة الحالية: {activeLanguageData.label}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={discardChanges}
              disabled={!hasChanges || saving}
              className="rounded-xl px-3 py-1 text-sm font-black text-white/55 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              تراجع
            </button>

            <button
              type="button"
              onClick={saveDetails}
              disabled={!hasChanges || saving}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              حفظ المعلومات
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}