"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Globe,
  Languages,
  Loader2,
  RotateCcw,
  Save,
  TriangleAlert,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { revalidatePublicMenu } from "@/lib/revalidate-public-menu";
import {
  LANGUAGES,
  getLanguage,
  normalizeEnabledLanguages,
} from "@/lib/i18n";

function getInitialLanguages(menu) {
  const normalized = normalizeEnabledLanguages(menu.enabled_languages);

  if (!normalized.includes("ar")) {
    return ["ar", ...normalized];
  }

  return normalized;
}

function getInitialDefaultLanguage(menu, enabledLanguages) {
  const safeDefault = menu.default_language || "ar";

  return enabledLanguages.includes(safeDefault)
    ? safeDefault
    : enabledLanguages[0] || "ar";
}

export default function LanguagesForm({ menu }) {
  const router = useRouter();
  const supabase = createClient();

  const safeInitialLanguages = useMemo(() => {
    return getInitialLanguages(menu);
  }, [menu]);

  const safeInitialDefault = useMemo(() => {
    return getInitialDefaultLanguage(menu, safeInitialLanguages);
  }, [menu, safeInitialLanguages]);

  const [initialEnabledLanguages, setInitialEnabledLanguages] =
    useState(safeInitialLanguages);

  const [initialDefaultLanguage, setInitialDefaultLanguage] =
    useState(safeInitialDefault);

  const [enabledLanguages, setEnabledLanguages] =
    useState(safeInitialLanguages);

  const [defaultLanguage, setDefaultLanguage] = useState(safeInitialDefault);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hasChanges =
    JSON.stringify(enabledLanguages) !==
      JSON.stringify(initialEnabledLanguages) ||
    defaultLanguage !== initialDefaultLanguage;

  const publicPath = menu.subdomain ? `m.crtgo.com/${menu.subdomain}` : null;

  const defaultLanguageData = getLanguage(defaultLanguage);

  const disabledLanguages = LANGUAGES.filter((language) => {
    return !enabledLanguages.includes(language.code);
  });

  function clearAlerts() {
    setMessage("");
    setError("");
  }

  function toggleLanguage(languageCode) {
    clearAlerts();

    // Arabic stays enabled because it is the fallback language.
    if (languageCode === "ar") return;

    setEnabledLanguages((current) => {
      const exists = current.includes(languageCode);

      let next = exists
        ? current.filter((code) => code !== languageCode)
        : [...current, languageCode];

      if (!next.includes("ar")) {
        next = ["ar", ...next];
      }

      if (!next.includes(defaultLanguage)) {
        setDefaultLanguage("ar");
      }

      return next;
    });
  }

  function changeDefaultLanguage(languageCode) {
    clearAlerts();

    if (!enabledLanguages.includes(languageCode)) {
      setEnabledLanguages((current) => {
        const next = current.includes(languageCode)
          ? current
          : [...current, languageCode];

        return next.includes("ar") ? next : ["ar", ...next];
      });
    }

    setDefaultLanguage(languageCode);
  }

  function discardChanges() {
    if (!hasChanges || saving) return;

    setEnabledLanguages(initialEnabledLanguages);
    setDefaultLanguage(initialDefaultLanguage);
    setMessage("");
    setError("");
  }

  async function saveLanguages() {
    setSaving(true);
    setMessage("");
    setError("");

    let finalEnabledLanguages = enabledLanguages.includes("ar")
      ? enabledLanguages
      : ["ar", ...enabledLanguages];

    if (!finalEnabledLanguages.includes(defaultLanguage)) {
      finalEnabledLanguages = [...finalEnabledLanguages, defaultLanguage];
    }

    const finalDefaultLanguage = finalEnabledLanguages.includes(defaultLanguage)
      ? defaultLanguage
      : "ar";

    const { error: updateError } = await supabase
      .from("menus")
      .update({
        enabled_languages: finalEnabledLanguages,
        default_language: finalDefaultLanguage,
      })
      .eq("id", menu.id)
      .eq("owner_id", menu.owner_id);

    if (updateError) {
      setSaving(false);
      setError(updateError.message);
      return;
    }

    await revalidatePublicMenu(menu.id);

    setEnabledLanguages(finalEnabledLanguages);
    setDefaultLanguage(finalDefaultLanguage);
    setInitialEnabledLanguages(finalEnabledLanguages);
    setInitialDefaultLanguage(finalDefaultLanguage);

    setSaving(false);
    setMessage("تم حفظ إعدادات اللغات.");
    router.refresh();
  }

  return (
    <main dir="rtl" className="min-h-screen px-4 pb-32 pt-4 sm:px-5 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                href={`/admin/menus/${menu.id}`}
                className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-2 text-xs font-black text-[#1b1712]/65 transition hover:bg-[#d1c5b4] hover:text-[#1b1712] active:scale-[0.98]"
              >
                <ArrowRight size={15} />
                الرجوع للقائمة
              </Link>

              <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Languages
              </p>

              <h1 className="mt-1 text-2xl font-black text-[#1b1712] sm:text-3xl">
                لغات القائمة
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1b1712]/58">
                اختر اللغات التي تظهر للزبائن. العربية تبقى مفعّلة دائماً لأنها لغة الرجوع إذا الترجمة ناقصة.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <SaveBadge hasChanges={hasChanges} />

            
            </div>
          </div>
        </header>

        {(message || error) && (
          <div className="mt-3 grid gap-2">
            {message && <Alert type="success">{message}</Alert>}
            {error && <Alert type="error">{error}</Alert>}
          </div>
        )}

        <section className="mt-3 grid gap-3 sm:grid-cols-3">
          <MetricBox
            icon={<Languages size={18} />}
            label="لغات مفعّلة"
            value={enabledLanguages.length}
            hint="تظهر للزبائن"
          />

          <MetricBox
            icon={<Globe size={18} />}
            label="اللغة الافتراضية"
            value={defaultLanguageData.shortLabel || defaultLanguage}
            hint={defaultLanguageData.label}
          />

          <MetricBox
            icon={<TriangleAlert size={18} />}
            label="لغات غير مفعّلة"
            value={disabledLanguages.length}
            hint="مخفية من القائمة"
            alert={disabledLanguages.length > 0}
          />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="grid gap-5">
            <Panel
              eyebrow="Enabled languages"
              title="اللغات المفعّلة"
              description="هذه اللغات سيستطيع الزبون الاختيار بينها في القائمة العامة."
            >
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {LANGUAGES.map((language) => {
                  const active = enabledLanguages.includes(language.code);
                  const locked = language.code === "ar";
                  const isDefault = defaultLanguage === language.code;

                  return (
                    <LanguageCard
                      key={language.code}
                      language={language}
                      active={active}
                      locked={locked}
                      isDefault={isDefault}
                      onClick={() => toggleLanguage(language.code)}
                    />
                  );
                })}
              </div>
            </Panel>

            <Panel
              eyebrow="Default language"
              title="اللغة الافتراضية"
              description="هذه اللغة تظهر أولاً للزائر إذا لم يكن اختار لغة من قبل."
            >
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {enabledLanguages.map((languageCode) => {
                  const language = getLanguage(languageCode);
                  const active = defaultLanguage === languageCode;

                  return (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => changeDefaultLanguage(language.code)}
                      className={`cursor-pointer rounded-xl border p-3 text-start transition active:scale-[0.99] ${
                        active
                          ? "border-[#1b1712] bg-[#1b1712] text-[#efe7da]"
                          : "border-[#8f806c]/50 bg-[#ded4c5] text-[#1b1712] hover:border-[#796a58]/75 hover:bg-[#d1c5b4]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                            active
                              ? "bg-[#efe7da]/10 text-[#efe7da]"
                              : "border border-[#8f806c]/45 bg-[#d1c5b4] text-[#1b1712]/70"
                          }`}
                        >
                          <Globe size={17} />
                        </div>

                        {active && (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#efe7da] text-[#1b1712]">
                            <Check size={15} />
                          </span>
                        )}
                      </div>

                      <p
                        dir={language.dir}
                        className="mt-3 text-base font-black"
                      >
                        {language.label}
                      </p>

                      <p
                        className={`mt-1 text-xs font-black uppercase tracking-[0.14em] ${
                          active ? "text-[#efe7da]/55" : "text-[#1b1712]/45"
                        }`}
                      >
                        {active ? "Default" : "Choose"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </Panel>

            <section className="rounded-2xl border border-yellow-900/25 bg-yellow-700/15 p-4">
              <div className="flex gap-3">
                <TriangleAlert
                  size={19}
                  className="mt-1 shrink-0 text-yellow-950"
                />

                <div>
                  <h2 className="text-base font-black text-yellow-950">
                    ملاحظة مهمة
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-yellow-950/70">
                    تفعيل اللغة هنا يُظهر زر اللغة في القائمة العامة. لكن النصوص نفسها تُترجم من صفحات المعلومات، الأقسام، والأصناف. إذا الترجمة ناقصة، ستظهر العربية تلقائياً.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-24 lg:h-fit">
            <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Summary
              </p>

              <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                ملخص اللغات
              </h2>

              <div className="mt-4 grid gap-2">
                <SummaryRow
                  label="مفعّلة"
                  value={enabledLanguages
                    .map((code) => getLanguage(code).shortLabel)
                    .join(" / ")}
                />

                <SummaryRow
                  label="الافتراضية"
                  value={defaultLanguageData.label}
                />

                <SummaryRow
                  label="العربية"
                  value="دائماً مفعّلة"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d1c5b4] p-4 shadow-sm shadow-black/5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Save status
              </p>

              <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                حالة التعديلات
              </h2>

              <div className="mt-4">
                <SaveBadge hasChanges={hasChanges} large />
              </div>

              <p className="mt-3 text-xs font-bold leading-5 text-[#1b1712]/48">
                بعد الحفظ، القائمة العامة ستتحدث وتظهر اللغات الجديدة.
              </p>
            </section>
          </aside>
        </section>
      </section>

      <SaveBar
        hasChanges={hasChanges}
        saving={saving}
        enabledCount={enabledLanguages.length}
        onDiscard={discardChanges}
        onSave={saveLanguages}
      />
    </main>
  );
}

function LanguageCard({ language, active, locked, isDefault, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={`cursor-pointer rounded-xl border p-3 text-start transition active:scale-[0.99] disabled:cursor-not-allowed ${
        active
          ? "border-[#1b1712] bg-[#1b1712] text-[#efe7da]"
          : "border-[#8f806c]/50 bg-[#ded4c5] text-[#1b1712] hover:border-[#796a58]/75 hover:bg-[#d1c5b4]"
      } ${locked ? "opacity-95" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            active
              ? "bg-[#efe7da]/10 text-[#efe7da]"
              : "border border-[#8f806c]/45 bg-[#d1c5b4] text-[#1b1712]/70"
          }`}
        >
          <Globe size={17} />
        </div>

        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full border ${
            active
              ? "border-[#efe7da] bg-[#efe7da] text-[#1b1712]"
              : "border-[#8f806c]/55 bg-transparent text-transparent"
          }`}
        >
          <Check size={15} />
        </span>
      </div>

      <p
        dir={language.dir}
        className="mt-3 text-base font-black leading-none"
      >
        {language.label}
      </p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <MiniBadge active={active}>{language.code.toUpperCase()}</MiniBadge>

        {locked && <MiniBadge active={active}>أساسية</MiniBadge>}

        {isDefault && <MiniBadge active={active}>Default</MiniBadge>}
      </div>
    </button>
  );
}

function Panel({ eyebrow, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] shadow-sm shadow-black/5">
      <div className="border-b border-[#8f806c]/45 bg-[#d1c5b4] px-4 py-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
          {eyebrow}
        </p>

        <h2 className="mt-0.5 text-lg font-black text-[#1b1712]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-[#1b1712]/52">
            {description}
          </p>
        )}
      </div>

      <div className="p-3">{children}</div>
    </section>
  );
}

function MetricBox({ icon, label, value, hint, alert }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3 shadow-sm shadow-black/5 ${
        alert
          ? "border-yellow-900/25 bg-yellow-700/15"
          : "border-[#8f806c]/55 bg-[#d8cebe]"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] text-[#1b1712]/70">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-black text-[#1b1712]/45">{label}</p>
        <p className="truncate text-xl font-black text-[#1b1712]">{value}</p>
        <p className="truncate text-xs font-bold text-[#1b1712]/42">{hint}</p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] px-3 py-2.5">
      <span className="text-sm font-black text-[#1b1712]/55">{label}</span>

      <span className="truncate text-sm font-black text-[#1b1712]">
        {value}
      </span>
    </div>
  );
}

function MiniBadge({ children, active }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${
        active
          ? "border-[#efe7da]/20 bg-[#efe7da]/10 text-[#efe7da]/65"
          : "border-[#8f806c]/45 bg-[#d1c5b4] text-[#1b1712]/45"
      }`}
    >
      {children}
    </span>
  );
}

function SaveBadge({ hasChanges, large }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${
        hasChanges
          ? "border-yellow-900/25 bg-yellow-700/15 text-yellow-950"
          : "border-green-900/25 bg-green-800/12 text-green-950"
      } ${large ? "w-full justify-center py-3" : ""}`}
    >
      <Circle size={8} fill="currentColor" />
      {hasChanges ? "تغييرات غير محفوظة" : "كل شيء محفوظ"}
    </div>
  );
}

function Alert({ type, children }) {
  const styles =
    type === "success"
      ? "border-green-900/25 bg-green-800/12 text-green-950"
      : "border-red-900/25 bg-red-700/12 text-red-950";

  return (
    <p className={`rounded-xl border p-3 text-sm font-bold leading-6 ${styles}`}>
      {children}
    </p>
  );
}

function SaveBar({ hasChanges, saving, enabledCount, onDiscard, onSave }) {
  return (
    <div className="fixed bottom-24 md:bottom-4 left-4 right-4 z-[80]">
      <div className="mx-auto max-w-7xl rounded-2xl border border-[#8f806c]/60 bg-[#d8cebe]/95 p-3 shadow-2xl shadow-black/25 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className={`text-sm font-black ${
                hasChanges ? "text-yellow-950" : "text-green-950"
              }`}
            >
              {hasChanges ? "لديك تغييرات غير محفوظة" : "كل شيء محفوظ"}
            </p>

            <p className="mt-1 text-xs font-bold text-[#1b1712]/45">
              {enabledCount} لغات مفعّلة
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={onDiscard}
              disabled={!hasChanges || saving}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-2 text-sm font-black text-[#1b1712]/70 transition hover:bg-[#cfc3b2] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={17} />
              تراجع
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={!hasChanges || saving}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] px-3 py-2 text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Save size={17} />
              )}

              {saving ? "جارٍ الحفظ..." : "حفظ اللغات"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}