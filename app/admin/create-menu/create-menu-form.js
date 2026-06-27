"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  ImageIcon,
  Loader2,
  Palette,
  Plus,
  Save,
  Sparkles,
  Store,
  Upload,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const MENU_PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_MENU_URL || "https://menu.crtgo.com";

const TEMPLATES = [
  {
    id: "classic",
    title: "Classic",
    description: "تصميم واضح وسريع مناسب لأي قائمة.",
  },
  {
    id: "luxury",
    title: "Luxury",
    description: "تصميم فاخر وحديث للمطاعم والكافيهات الراقية.",
  },
];

function normalizeSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isValidSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function buildPublicMenuUrl(slug) {
  if (!slug) return "";

  const cleanBase = MENU_PUBLIC_BASE_URL.replace(/\/+$/, "");

  return `${cleanBase}/${slug}`;
}

function getDisplayPublicUrl(url) {
  return String(url || "").replace(/^https?:\/\//, "");
}

function isTrialActive(profile) {
  return (
    profile?.trial_ends_at &&
    new Date(profile.trial_ends_at).getTime() > Date.now()
  );
}

function isPaidActive(profile) {
  const plan = String(profile?.plan || "free").toLowerCase();

  const paypalStatus = String(
    profile?.paypal_subscription_status || ""
  ).toUpperCase();

  const subscriptionStatus = String(
    profile?.subscription_status || ""
  ).toUpperCase();

  return (
    plan === "pro" &&
    (paypalStatus === "ACTIVE" ||
      subscriptionStatus === "ACTIVE" ||
      paypalStatus === "APPROVED" ||
      subscriptionStatus === "APPROVED")
  );
}

function getMenuLimit(profile) {
  if (isPaidActive(profile)) return 5;
  if (isTrialActive(profile)) return 1;

  return 0;
}

export default function CreateMenuForm() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    name: "",
    subdomain: "",
    description_ar: "",
    phone: "",
    template_id: "classic",
    status: "active",
  });

  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const cleanPreviewSlug = normalizeSlug(form.subdomain);
  const publicUrl = cleanPreviewSlug ? buildPublicMenuUrl(cleanPreviewSlug) : "";
  const publicPath = publicUrl ? getDisplayPublicUrl(publicUrl) : "";

  const selectedTemplate = useMemo(() => {
    return (
      TEMPLATES.find((template) => template.id === form.template_id) ||
      TEMPLATES[0]
    );
  }, [form.template_id]);

  function clearAlerts() {
    setMessage("");
    setError("");
  }

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    clearAlerts();
  }

  function handleNameChange(value) {
    setForm((current) => {
      const shouldAutoFillSlug = !current.subdomain;

      return {
        ...current,
        name: value,
        subdomain: shouldAutoFillSlug
          ? normalizeSlug(value)
          : current.subdomain,
      };
    });

    clearAlerts();
  }

  async function uploadFavicon(menuId) {
    if (!faviconFile) return null;

    const fileExt = faviconFile.name.split(".").pop() || "png";
    const filePath = `favicons/${menuId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(filePath, faviconFile, {
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("menu-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function copyPublicLink() {
    if (!publicUrl) {
      setError("اكتب رابط القائمة أولاً.");
      setMessage("");
      return;
    }

    try {
      await navigator.clipboard.writeText(publicUrl);
      setMessage("تم نسخ رابط القائمة.");
      setError("");
    } catch {
      setError("لم يتم نسخ الرابط. انسخه يدوياً من المعاينة.");
      setMessage("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (saving) return;

    setSaving(true);
    clearAlerts();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/start");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, plan, trial_ends_at, subscription_status, paypal_subscription_status"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const limit = getMenuLimit(profile);

      if (limit <= 0) {
        throw new Error(
          "انتهت الفترة التجريبية أو الحساب غير مفعّل. فعّل الخطة من صفحة الحساب."
        );
      }

      const { count, error: countError } = await supabase
        .from("menus")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id);

      if (countError) throw countError;

      if ((count || 0) >= limit) {
        throw new Error(
          `وصلت للحد الأقصى من القوائم في خطتك الحالية (${limit}).`
        );
      }

      const cleanSubdomain = normalizeSlug(form.subdomain);

      if (!form.name.trim()) {
        throw new Error("اكتب اسم القائمة.");
      }

      if (!cleanSubdomain) {
        throw new Error("اكتب رابطًا صالحًا للقائمة.");
      }

      if (!isValidSlug(cleanSubdomain)) {
        throw new Error(
          "الرابط يجب أن يحتوي على حروف إنجليزية صغيرة، أرقام، أو شرطة فقط."
        );
      }

      setCheckingSlug(true);

      const { data: existingMenu, error: slugError } = await supabase
        .from("menus")
        .select("id")
        .eq("subdomain", cleanSubdomain)
        .maybeSingle();

      setCheckingSlug(false);

      if (slugError) throw slugError;

      if (existingMenu) {
        throw new Error("هذا الرابط مستخدم من قائمة أخرى. جرّب رابطاً مختلفاً.");
      }

      const { data: menu, error: menuError } = await supabase
        .from("menus")
        .insert({
          owner_id: user.id,
          name: form.name.trim(),
          subdomain: cleanSubdomain,
          description_ar: form.description_ar.trim(),
          phone: form.phone.trim(),
          template_id: form.template_id,
          status: form.status,
        })
        .select("id")
        .single();

      if (menuError) throw menuError;

      const faviconUrl = await uploadFavicon(menu.id);

      if (faviconUrl) {
        const { error: faviconError } = await supabase
          .from("menus")
          .update({ favicon_url: faviconUrl })
          .eq("id", menu.id)
          .eq("owner_id", user.id);

        if (faviconError) throw faviconError;
      }

      router.push(`/admin/menus/${menu.id}`);
      router.refresh();
    } catch (err) {
      setCheckingSlug(false);
      setError(err.message || "حدث خطأ غير متوقع.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#cfc6b8] px-4 pb-32 pt-4 text-[#1b1712] sm:px-5 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
          <button
            type="button"
            onClick={() => router.push("/admin/menus")}
            className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-2 text-xs font-black text-[#1b1712]/65 transition hover:bg-[#d1c5b4] hover:text-[#1b1712] active:scale-[0.98]"
          >
            <ArrowRight size={15} />
            الرجوع للقوائم
          </button>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Create Menu
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#1b1712] sm:text-4xl">
                إنشاء قائمة رقمية
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1b1712]/58">
                جهّز أساس القائمة: الاسم، الرابط، القالب، والوصف. يمكنك تعديل كل شيء لاحقًا من لوحة التحكم.
              </p>
            </div>

            <div className="rounded-2xl border border-[#8f806c]/45 bg-[#ded4c5] p-3">
              <p className="text-xs font-black text-[#1b1712]/45">
                رابط الزبائن
              </p>

              <p
                dir="ltr"
                className="mt-2 break-all text-left text-sm font-black text-[#1b1712]/65"
              >
                {publicPath || "menu.crtgo.com/your-link"}
              </p>

              <button
                type="button"
                onClick={copyPublicLink}
                disabled={!publicUrl}
                className="mt-3 inline-flex min-h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#d1c5b4] px-3 py-2 text-sm font-black text-[#1b1712]/70 transition hover:bg-[#cfc3b2] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Copy size={15} />
                نسخ الرابط
              </button>
            </div>
          </div>
        </header>

        {(message || error) && (
          <div className="mt-3 grid gap-2">
            {message && <Alert type="success">{message}</Alert>}
            {error && <Alert type="error">{error}</Alert>}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]"
        >
          <div className="grid gap-5">
            <Panel
              eyebrow="Basic info"
              title="معلومات القائمة"
              description="هذه البيانات تظهر للزبائن في القائمة العامة."
              icon={<Store size={19} />}
            >
              <div className="grid gap-4">
                <Field label="اسم المطعم / الكافيه">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="مثال: Burger House"
                    className="min-h-11 w-full rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] px-3 py-2.5 text-sm font-black text-[#1b1712] outline-none transition placeholder:text-[#1b1712]/30 focus:border-[#1b1712]"
                  />
                </Field>

                <Field
                  label="رابط القائمة"
                  hint="استخدم حروف إنجليزية صغيرة، أرقام، وشرطة فقط. مثال: burger-house"
                >
                  <div
                    dir="ltr"
                    className="grid overflow-hidden rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] focus-within:border-[#1b1712] sm:grid-cols-[minmax(0,1fr)_auto]"
                  >
                    <input
                      required
                      dir="ltr"
                      value={form.subdomain}
                      onChange={(e) =>
                        updateField("subdomain", normalizeSlug(e.target.value))
                      }
                      placeholder="burger-house"
                      className="min-h-11 min-w-0 bg-transparent px-3 py-2.5 text-left text-sm font-black text-[#1b1712] outline-none placeholder:text-[#1b1712]/30"
                    />

                    <span className="border-t border-[#8f806c]/45 px-3 py-2.5 text-left text-sm font-black text-[#1b1712]/45 sm:border-r sm:border-t-0">
                      {getDisplayPublicUrl(MENU_PUBLIC_BASE_URL)}
                    </span>
                  </div>
                </Field>

                <Field label="وصف قصير">
                  <textarea
                    value={form.description_ar}
                    onChange={(e) =>
                      updateField("description_ar", e.target.value)
                    }
                    placeholder="مثال: برجر طازج، وجبات، ومشروبات باردة"
                    rows={4}
                    className="w-full resize-none rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] px-3 py-2.5 text-sm font-bold leading-6 text-[#1b1712] outline-none transition placeholder:text-[#1b1712]/30 focus:border-[#1b1712]"
                  />
                </Field>

                <Field label="رقم الهاتف الأساسي">
                  <input
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="0500000000"
                    dir="ltr"
                    className="min-h-11 w-full rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] px-3 py-2.5 text-left text-sm font-black text-[#1b1712] outline-none transition placeholder:text-[#1b1712]/30 focus:border-[#1b1712]"
                  />
                </Field>
              </div>
            </Panel>

            <Panel
              eyebrow="Appearance"
              title="القالب"
              description="اختر التصميم الأولي للقائمة. يمكن تغييره لاحقاً."
              icon={<Palette size={19} />}
            >
              <div className="grid gap-2 md:grid-cols-2">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => updateField("template_id", template.id)}
                    className={`cursor-pointer rounded-xl border p-3 text-right transition active:scale-[0.99] ${
                      form.template_id === template.id
                        ? "border-[#1b1712] bg-[#1b1712] text-[#efe7da]"
                        : "border-[#8f806c]/50 bg-[#ded4c5] text-[#1b1712] hover:border-[#796a58]/75 hover:bg-[#d1c5b4]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-black">
                        {template.title}
                      </h3>

                      {form.template_id === template.id && (
                        <CheckCircle2 size={18} />
                      )}
                    </div>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        form.template_id === template.id
                          ? "text-[#efe7da]/60"
                          : "text-[#1b1712]/52"
                      }`}
                    >
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel
              eyebrow="Visibility"
              title="حالة النشر"
              description="يمكنك جعل القائمة مخفية مؤقتاً أثناء التجهيز."
              icon={<Sparkles size={19} />}
            >
              <div className="grid gap-2 md:grid-cols-2">
                <StatusOption
                  title="مفعلة"
                  description="القائمة تظهر للزبائن ويمكن فتح الرابط العام."
                  active={form.status === "active"}
                  tone="green"
                  onClick={() => updateField("status", "active")}
                />

                <StatusOption
                  title="مؤرشفة"
                  description="القائمة محفوظة، لكنها لا تظهر للزبائن حالياً."
                  active={form.status === "archived"}
                  tone="yellow"
                  onClick={() => updateField("status", "archived")}
                />
              </div>
            </Panel>

            <Panel
              eyebrow="Icon"
              title="أيقونة القائمة"
              description="اختياري. تظهر كأيقونة للمتصفح أو عند حفظ الرابط."
              icon={<ImageIcon size={19} />}
            >
              <div className="overflow-hidden rounded-xl border border-[#8f806c]/50 bg-[#ded4c5]">
                <div className="relative flex h-36 items-center justify-center bg-[#d1c5b4]">
                  {faviconPreview ? (
                    <img
                      src={faviconPreview}
                      alt="Favicon preview"
                      className="h-full w-full object-contain p-5"
                    />
                  ) : (
                    <div className="text-center">
                      <ImageIcon
                        size={34}
                        className="mx-auto text-[#1b1712]/28"
                      />

                      <p className="mt-2 text-sm font-bold text-[#1b1712]/40">
                        لا توجد أيقونة
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid gap-px bg-[#8f806c]/35 sm:grid-cols-2">
                  <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 bg-[#ded4c5] px-4 py-2.5 text-sm font-black text-[#1b1712]/70 transition hover:bg-[#d1c5b4]">
                    <Upload size={16} />
                    {faviconPreview ? "تغيير الأيقونة" : "رفع أيقونة"}

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (!file) return;

                        setFaviconFile(file);
                        setFaviconPreview(URL.createObjectURL(file));
                        clearAlerts();
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setFaviconFile(null);
                      setFaviconPreview("");
                      clearAlerts();
                    }}
                    disabled={!faviconPreview}
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 bg-[#ded4c5] px-4 py-2.5 text-sm font-black text-red-900 transition hover:bg-red-700/12 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <X size={16} />
                    حذف
                  </button>
                </div>
              </div>
            </Panel>
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-24 lg:h-fit">
            <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Preview
              </p>

              <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                معاينة سريعة
              </h2>

              <div className="mt-4 overflow-hidden rounded-2xl border border-[#8f806c]/45 bg-[#ded4c5]">
                <div className="relative h-32 bg-[#d1c5b4]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(27,23,18,0.16),transparent_28%),linear-gradient(135deg,#ded4c5,#cfc6b8)]" />

                  <div className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-[#efe7da]/80 bg-[#ded4c5] shadow-lg shadow-black/10">
                    {faviconPreview ? (
                      <img
                        src={faviconPreview}
                        alt="Icon"
                        className="h-full w-full object-contain p-1.5"
                      />
                    ) : (
                      <Store size={22} className="text-[#1b1712]/38" />
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <p className="truncate text-xl font-black text-[#1b1712]">
                    {form.name || "اسم القائمة"}
                  </p>

                  <p className="mt-2 line-clamp-2 text-sm font-bold leading-6 text-[#1b1712]/52">
                    {form.description_ar ||
                      "وصف قصير عن المطعم أو الكافيه سيظهر هنا."}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[#8f806c]/45 bg-[#d1c5b4] px-2.5 py-1 text-xs font-black text-[#1b1712]/55">
                      {selectedTemplate.title}
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-black ${
                        form.status === "active"
                          ? "border-green-900/25 bg-green-800/12 text-green-950"
                          : "border-yellow-900/25 bg-yellow-700/15 text-yellow-950"
                      }`}
                    >
                      {form.status === "active" ? "مفعلة" : "مؤرشفة"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d1c5b4] p-4 shadow-sm shadow-black/5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Create
              </p>

              <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                جاهز للإنشاء؟
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#1b1712]/55">
                بعد الإنشاء، سيتم فتح صفحة إدارة القائمة لإضافة الأقسام والأصناف والصور.
              </p>

              <button
                type="submit"
                disabled={saving || checkingSlug}
                className="mt-4 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] px-4 py-2.5 text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving || checkingSlug ? (
                  <Loader2 className="animate-spin" size={17} />
                ) : (
                  <Plus size={17} />
                )}

                {checkingSlug
                  ? "جارٍ فحص الرابط..."
                  : saving
                    ? "جارٍ الإنشاء..."
                    : "إنشاء القائمة"}
              </button>
            </section>
          </aside>
        </form>
      </section>
    </main>
  );
}

function Panel({ eyebrow, title, description, icon, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] shadow-sm shadow-black/5">
      <div className="flex gap-3 border-b border-[#8f806c]/45 bg-[#d1c5b4] px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] text-[#1b1712]/70">
          {icon}
        </div>

        <div>
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
      </div>

      <div className="p-3">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-[#1b1712]/60">{label}</span>

      {children}

      {hint && (
        <span className="text-xs font-bold leading-5 text-[#1b1712]/42">
          {hint}
        </span>
      )}
    </label>
  );
}

function StatusOption({ title, description, active, tone, onClick }) {
  const activeClass =
    tone === "green"
      ? "border-green-900/25 bg-green-800/12 text-green-950"
      : "border-yellow-900/25 bg-yellow-700/15 text-yellow-950";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-3 text-right transition active:scale-[0.99] ${
        active
          ? activeClass
          : "border-[#8f806c]/50 bg-[#ded4c5] text-[#1b1712] hover:border-[#796a58]/75 hover:bg-[#d1c5b4]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-black">{title}</h3>

        {active && <CheckCircle2 size={18} />}
      </div>

      <p
        className={`mt-2 text-sm leading-6 ${
          active ? "opacity-70" : "text-[#1b1712]/52"
        }`}
      >
        {description}
      </p>
    </button>
  );
}

function Alert({ type, children }) {
  const styles =
    type === "success"
      ? "border-green-900/25 bg-green-800/12 text-green-950"
      : "border-red-900/25 bg-red-700/12 text-red-950";

  const Icon = type === "success" ? CheckCircle2 : AlertTriangle;

  return (
    <p
      className={`flex items-start gap-2 rounded-xl border p-3 text-sm font-bold leading-6 ${styles}`}
    >
      <Icon size={17} className="mt-0.5 shrink-0" />
      {children}
    </p>
  );
}