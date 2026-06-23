"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Globe, Languages, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { revalidatePublicMenu } from "@/lib/revalidate-public-menu";
import {
  LANGUAGES,
  getLanguage,
  normalizeEnabledLanguages,
} from "@/lib/i18n";

export default function LanguagesForm({ menu }) {
  const router = useRouter();
  const supabase = createClient();

  const initialEnabledLanguages = useMemo(() => {
    const normalized = normalizeEnabledLanguages(menu.enabled_languages);

    if (!normalized.includes("ar")) {
      return ["ar", ...normalized];
    }

    return normalized;
  }, [menu.enabled_languages]);

  const initialDefaultLanguage = useMemo(() => {
    const safeDefault = menu.default_language || "ar";

    return initialEnabledLanguages.includes(safeDefault)
      ? safeDefault
      : initialEnabledLanguages[0];
  }, [menu.default_language, initialEnabledLanguages]);

  const [enabledLanguages, setEnabledLanguages] = useState(
    initialEnabledLanguages
  );
  const [defaultLanguage, setDefaultLanguage] = useState(
    initialDefaultLanguage
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hasChanges =
    JSON.stringify(enabledLanguages) !==
      JSON.stringify(initialEnabledLanguages) ||
    defaultLanguage !== initialDefaultLanguage;

  function clearAlerts() {
    setMessage("");
    setError("");
  }

  function toggleLanguage(languageCode) {
    clearAlerts();

    // Arabic stays enabled because it is our safe fallback language.
    if (languageCode === "ar") return;

    setEnabledLanguages((current) => {
      const exists = current.includes(languageCode);

      let next;

      if (exists) {
        next = current.filter((code) => code !== languageCode);
      } else {
        next = [...current, languageCode];
      }

      if (!next.includes("ar")) {
        next = ["ar", ...next];
      }

      if (!next.includes(defaultLanguage)) {
        setDefaultLanguage(next[0]);
      }

      return next;
    });
  }

  function changeDefaultLanguage(languageCode) {
    clearAlerts();

    if (!enabledLanguages.includes(languageCode)) {
      setEnabledLanguages((current) => [...current, languageCode]);
    }

    setDefaultLanguage(languageCode);
  }

  function discardChanges() {
    setEnabledLanguages(initialEnabledLanguages);
    setDefaultLanguage(initialDefaultLanguage);
    setMessage("");
    setError("");
  }

  async function saveLanguages() {
    setSaving(true);
    setMessage("");
    setError("");

    const finalEnabledLanguages = enabledLanguages.includes(defaultLanguage)
      ? enabledLanguages
      : [...enabledLanguages, defaultLanguage];

    const { error: updateError } = await supabase
      .from("menus")
      .update({
        enabled_languages: finalEnabledLanguages,
        default_language: defaultLanguage,
      })
      .eq("id", menu.id);

    if (updateError) {
      setSaving(false);
      setError(updateError.message);
      return;
    }

    await revalidatePublicMenu(menu.id);

    setSaving(false);
    setMessage("تم حفظ إعدادات اللغات.");
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
                  <Languages size={26} />
                </div>

                <p className="text-sm font-black uppercase tracking-[0.3em] text-white/35">
                  Languages
                </p>

                <h1 className="mt-2 text-3xl font-black sm:text-5xl">
                  لغات القائمة
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                  اختر اللغات التي تظهر للزبائن في القائمة العامة. العربية تبقى
                  مفعّلة دائماً لأنها لغة الرجوع الاحتياطية إذا لم تكن الترجمة
                  موجودة.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs font-black text-white/35">القائمة</p>
                <p className="mt-1 text-lg font-black">{menu.name}</p>
                <p dir="ltr" className="mt-1 text-sm text-white/40">
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

            <section>
              <div className="mb-4">
                <h2 className="text-2xl font-black">اللغات المفعّلة</h2>
                <p className="mt-1 text-sm text-white/45">
                  هذه هي اللغات التي سيستطيع الزبون الاختيار بينها في القائمة.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {LANGUAGES.map((language) => {
                  const active = enabledLanguages.includes(language.code);
                  const locked = language.code === "ar";

                  return (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => toggleLanguage(language.code)}
                      className={`group rounded-[1.5rem] border p-5 text-start transition ${
                        active
                          ? "border-white bg-white text-black"
                          : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                      } ${locked ? "cursor-not-allowed opacity-90" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div
                          className={`grid h-11 w-11 place-items-center rounded-2xl ${
                            active
                              ? "bg-black text-white"
                              : "bg-white/10 text-white"
                          }`}
                        >
                          <Globe size={20} />
                        </div>

                        <div
                          className={`grid h-7 w-7 place-items-center rounded-full border ${
                            active
                              ? "border-black bg-black text-white"
                              : "border-white/20 bg-transparent text-transparent"
                          }`}
                        >
                          <Check size={15} />
                        </div>
                      </div>

                      <div className="mt-5">
                        <p
                          dir={language.dir}
                          className="text-2xl font-black leading-none"
                        >
                          {language.label}
                        </p>

                        <p className="mt-2 text-sm font-bold opacity-55">
                          {language.code.toUpperCase()}
                          {locked ? " · لغة أساسية" : ""}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-white/10 bg-black/30 p-5">
              <div className="mb-4">
                <h2 className="text-2xl font-black">اللغة الافتراضية</h2>
                <p className="mt-1 text-sm text-white/45">
                  هذه اللغة تظهر أولاً للزائر إذا لم يكن اختار لغة من قبل.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {enabledLanguages.map((languageCode) => {
                  const language = getLanguage(languageCode);
                  const active = defaultLanguage === languageCode;

                  return (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => changeDefaultLanguage(language.code)}
                      className={`rounded-2xl border px-4 py-4 text-start transition ${
                        active
                          ? "border-white bg-white text-black"
                          : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                      }`}
                    >
                      <p
                        dir={language.dir}
                        className="text-xl font-black leading-none"
                      >
                        {language.label}
                      </p>

                      <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] opacity-45">
                        {active ? "Default" : "Choose"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-orange-400/20 bg-orange-400/10 p-5">
              <h2 className="text-xl font-black text-orange-100">
                ملاحظة مهمة
              </h2>

              <p className="mt-2 text-sm leading-6 text-orange-100/70">
                تفعيل اللغة هنا يجعل زر اللغة يظهر في القائمة العامة. لكن النصوص
                نفسها تحتاج نضيف لها ترجمة من صفحات التفاصيل والأقسام والأصناف.
                إذا الترجمة ناقصة، القائمة ستعرض العربية تلقائياً.
              </p>
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
              {enabledLanguages.length} لغات مفعّلة
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
              onClick={saveLanguages}
              disabled={!hasChanges || saving}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              حفظ اللغات
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}