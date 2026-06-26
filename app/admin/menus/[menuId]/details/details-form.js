"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Globe,
  Info,
  Languages,
  Loader2,
  MapPin,
  Phone,
  RotateCcw,
  Save,
  TextCursorInput,
  TriangleAlert,
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
  normalizeEnabledLanguages,
  setTranslatedText,
} from "@/lib/i18n";

function getInitialForm(menu) {
  return {
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
  };
}

export default function DetailsForm({ menu }) {
  const router = useRouter();
  const supabase = createClient();

  const enabledLanguages = useMemo(() => {
    return normalizeEnabledLanguages(menu.enabled_languages);
  }, [menu.enabled_languages]);

  const firstLanguage = enabledLanguages.includes(menu.default_language)
    ? menu.default_language
    : enabledLanguages[0] || "ar";

  const [activeLanguage, setActiveLanguage] = useState(firstLanguage);

  const [form, setForm] = useState(() => getInitialForm(menu));
  const [initialForm, setInitialForm] = useState(() => getInitialForm(menu));

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeLanguageData = getLanguage(activeLanguage);

  const arabicName = getTranslatedText(form.name_i18n, "ar", menu.name || "");
  const publicPath = menu.subdomain ? `m.crtgo.com/${menu.subdomain}` : null;
  const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm);

  const filledTranslations = enabledLanguages.filter((languageCode) => {
    const name = getTranslatedText(form.name_i18n, languageCode, "").trim();
    const description = getTranslatedText(
      form.description_i18n,
      languageCode,
      ""
    ).trim();

    return name || description;
  });

  const contactCount = [
    form.phone,
    form.whatsapp,
    form.instagram,
    form.tiktok,
    form.facebook,
  ].filter((item) => item.trim()).length;

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
    if (!hasChanges || saving) return;

    setForm(initialForm);
    setMessage("");
    setError("");
  }

  async function saveDetails() {
    setSaving(true);
    setMessage("");
    setError("");

    const nextArabicName = getTranslatedText(
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

    if (!nextArabicName) {
      setSaving(false);
      setError("اسم القائمة بالعربية مطلوب لأنه لغة الرجوع الأساسية.");
      return;
    }

    const payload = {
      name: nextArabicName,
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
      .eq("id", menu.id)
      .eq("owner_id", menu.owner_id);

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
                Menu Details
              </p>

              <h1 className="mt-1 text-2xl font-black text-[#1b1712] sm:text-3xl">
                معلومات القائمة
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1b1712]/58">
                عدّل اسم القائمة، الوصف، الموقع، وأرقام التواصل. النص العربي هو لغة الرجوع إذا أي ترجمة ناقصة.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <SaveBadge hasChanges={hasChanges} />

              {publicPath ? (
                <span
                  dir="ltr"
                  className="inline-flex items-center gap-2 rounded-full border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-1.5 text-xs font-black text-[#1b1712]/60"
                >
                  <Globe size={13} />
                  {publicPath}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-yellow-900/25 bg-yellow-700/15 px-3 py-1.5 text-xs font-black text-yellow-950">
                  <TriangleAlert size={13} />
                  بدون رابط
                </span>
              )}
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
            label="اللغات"
            value={`${filledTranslations.length}/${enabledLanguages.length}`}
            hint="لغات فيها نصوص"
          />

          <MetricBox
            icon={<Phone size={18} />}
            label="التواصل"
            value={contactCount}
            hint="حقول مضافة"
          />

          <MetricBox
            icon={<Info size={18} />}
            label="الاسم العربي"
            value={arabicName.trim() ? "موجود" : "ناقص"}
            hint="مطلوب للحفظ"
            alert={!arabicName.trim()}
          />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="grid gap-5">
            <Panel
              eyebrow="Languages"
              title="اختيار اللغة"
              description="اختر اللغة التي تريد تعديل نصوصها. أي حقل فارغ يرجع للعربية في القائمة العامة."
            >
              <div className="flex flex-wrap gap-2">
                {enabledLanguages.map((languageCode) => {
                  const language = getLanguage(languageCode);
                  const active = activeLanguage === languageCode;
                  const hasText = Boolean(
                    getTranslatedText(form.name_i18n, languageCode, "").trim()
                  );

                  return (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => setActiveLanguage(language.code)}
                      className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition active:scale-[0.98] ${
                        active
                          ? "border-[#1b1712] bg-[#1b1712] text-[#efe7da]"
                          : "border-[#8f806c]/55 bg-[#ded4c5] text-[#1b1712]/65 hover:bg-[#d1c5b4] hover:text-[#1b1712]"
                      }`}
                    >
                      {language.shortLabel}

                      {hasText && (
                        <CheckCircle2
                          size={14}
                          className={active ? "text-[#efe7da]" : "text-green-950"}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </Panel>

            <Panel
              eyebrow={activeLanguageData.label}
              title="نصوص القائمة"
              description="هذه النصوص تظهر في أعلى القائمة العامة للزبائن."
            >
              <div dir={activeLanguageData.dir} className="grid gap-4">
                <TextInput
                  label="اسم القائمة"
                  value={form.name_i18n?.[activeLanguage] || ""}
                  onChange={(value) =>
                    updateTranslatedField("name_i18n", value)
                  }
                  placeholder={
                    activeLanguage === "ar"
                      ? "مثلاً: كافيه خالد"
                      : "Translation..."
                  }
                  required={activeLanguage === "ar"}
                />

                <TextArea
                  label="وصف القائمة"
                  value={form.description_i18n?.[activeLanguage] || ""}
                  onChange={(value) =>
                    updateTranslatedField("description_i18n", value)
                  }
                  placeholder={
                    activeLanguage === "ar"
                      ? "وصف قصير يظهر في أعلى القائمة..."
                      : "Translation..."
                  }
                />

                <TextInput
                  label="الموقع"
                  value={form.location_i18n?.[activeLanguage] || ""}
                  onChange={(value) =>
                    updateTranslatedField("location_i18n", value)
                  }
                  placeholder={
                    activeLanguage === "ar"
                      ? "مثلاً: شفاعمرو"
                      : "Translation..."
                  }
                />
              </div>
            </Panel>

            <Panel
              eyebrow="Contact"
              title="التواصل والسوشال"
              description="هذه الحقول أرقام وروابط، لذلك لا تحتاج ترجمة."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <ContactField
                  label="رقم الهاتف"
                  icon={<Phone size={16} />}
                  value={form.phone}
                  onChange={(value) => updateField("phone", value)}
                  placeholder="0500000000"
                />

                <ContactField
                  label="واتساب"
                  icon={<FaWhatsapp />}
                  value={form.whatsapp}
                  onChange={(value) => updateField("whatsapp", value)}
                  placeholder="972500000000"
                />

                <ContactField
                  label="Instagram"
                  icon={<FaInstagram />}
                  value={form.instagram}
                  onChange={(value) => updateField("instagram", value)}
                  placeholder="@username"
                />

                <ContactField
                  label="TikTok"
                  icon={<FaTiktok />}
                  value={form.tiktok}
                  onChange={(value) => updateField("tiktok", value)}
                  placeholder="@username"
                />

                <div className="sm:col-span-2">
                  <ContactField
                    label="Facebook"
                    icon={<FaFacebook />}
                    value={form.facebook}
                    onChange={(value) => updateField("facebook", value)}
                    placeholder="page-name أو رابط كامل"
                  />
                </div>
              </div>
            </Panel>

            <section className="rounded-2xl border border-yellow-900/25 bg-yellow-700/15 p-4">
              <div className="flex gap-3">
                <MapPin size={19} className="mt-1 shrink-0 text-yellow-950" />

                <div>
                  <h2 className="text-base font-black text-yellow-950">
                    كيف يعمل الرجوع للعربية؟
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-yellow-950/70">
                    إذا الزبون اختار Hebrew أو English وكان النص فارغاً، سيتم عرض النص العربي تلقائياً بدلاً من ترك مكان فارغ.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-24 lg:h-fit">
            <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Preview
              </p>

              <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                معاينة النصوص
              </h2>

              <div
                dir={activeLanguageData.dir}
                className="mt-4 rounded-2xl border border-[#8f806c]/55 bg-[#ded4c5] p-4"
              >
                <p className="text-xs font-black text-[#1b1712]/45">
                  {activeLanguageData.label}
                </p>

                <h3 className="mt-2 text-xl font-black text-[#1b1712]">
                  {form.name_i18n?.[activeLanguage] ||
                    form.name_i18n?.ar ||
                    "اسم القائمة"}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#1b1712]/58">
                  {form.description_i18n?.[activeLanguage] ||
                    form.description_i18n?.ar ||
                    "وصف القائمة يظهر هنا..."}
                </p>

                <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#8f806c]/45 bg-[#d1c5b4] px-3 py-1.5 text-xs font-black text-[#1b1712]/55">
                  <MapPin size={13} />
                  {form.location_i18n?.[activeLanguage] ||
                    form.location_i18n?.ar ||
                    "الموقع"}
                </p>
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
                اللغة الحالية: {activeLanguageData.label}
              </p>
            </section>
          </aside>
        </section>
      </section>

      <SaveBar
        hasChanges={hasChanges}
        saving={saving}
        activeLanguage={activeLanguageData.label}
        onDiscard={discardChanges}
        onSave={saveDetails}
      />
    </main>
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

function TextInput({ label, value, onChange, placeholder, required }) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center gap-2 text-sm font-black text-[#1b1712]/60">
        <TextCursorInput size={15} />
        {label}
        {required && (
          <span className="rounded-full bg-[#1b1712] px-2 py-0.5 text-[10px] text-[#efe7da]">
            مطلوب
          </span>
        )}
      </span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-11 rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] px-3 py-2.5 text-sm font-bold text-[#1b1712] outline-none transition placeholder:text-[#1b1712]/30 focus:border-[#1b1712]"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center gap-2 text-sm font-black text-[#1b1712]/60">
        <TextCursorInput size={15} />
        {label}
      </span>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="resize-none rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] px-3 py-2.5 text-sm font-bold leading-6 text-[#1b1712] outline-none transition placeholder:text-[#1b1712]/30 focus:border-[#1b1712]"
      />
    </label>
  );
}

function ContactField({ label, icon, value, onChange, placeholder }) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center gap-2 text-sm font-black text-[#1b1712]/60">
        {icon}
        {label}
      </span>

      <input
        dir="ltr"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-11 rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] px-3 py-2.5 text-left text-sm font-bold text-[#1b1712] outline-none transition placeholder:text-[#1b1712]/30 focus:border-[#1b1712]"
      />
    </label>
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

function SaveBar({ hasChanges, saving, activeLanguage, onDiscard, onSave }) {
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
              اللغة الحالية: {activeLanguage}
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

              {saving ? "جارٍ الحفظ..." : "حفظ المعلومات"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}