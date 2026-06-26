"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Archive,
  ArrowRight,
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  Globe,
  LinkIcon,
  Loader2,
  RotateCcw,
  Save,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { revalidatePublicMenu } from "@/lib/revalidate-public-menu";

function normalizeSlug(value) {
  return value
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

const MENU_PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_MENU_URL || "https://m.crtgo.com";

function buildPublicMenuUrl(slug) {
  if (!slug) return "";

  const cleanBase = MENU_PUBLIC_BASE_URL.replace(/\/+$/, "");

  return `${cleanBase}/${slug}`;
}

function getDisplayPublicUrl(url) {
  return String(url || "").replace(/^https?:\/\//, "");
}

function getInitialSettings(menu) {
  return {
    subdomain: menu.subdomain || "",
    status: menu.status || "active",
  };
}

export default function SettingsForm({ menu }) {
  const router = useRouter();
  const supabase = createClient();

  const [initialSettings, setInitialSettings] = useState(() =>
    getInitialSettings(menu)
  );

  const [settings, setSettings] = useState(() => getInitialSettings(menu));

  const [savingKey, setSavingKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hasChanges = useMemo(() => {
    return (
      settings.subdomain !== initialSettings.subdomain ||
      settings.status !== initialSettings.status
    );
  }, [settings, initialSettings]);

const cleanPreviewSlug = normalizeSlug(settings.subdomain);
const hasPublicLink = Boolean(cleanPreviewSlug);
const publicUrl = hasPublicLink ? buildPublicMenuUrl(cleanPreviewSlug) : "";
const publicPath = hasPublicLink ? getDisplayPublicUrl(publicUrl) : "";

  const sectionsCount = (menu.sections || []).length;
  const isArchived = settings.status === "archived";

  function clearAlerts() {
    setMessage("");
    setError("");
  }

  function updateField(key, value) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    clearAlerts();
  }

  function discardChanges() {
    if (!hasChanges || savingKey) return;

    const sure = confirm("هل تريد التراجع عن التغييرات غير المحفوظة؟");
    if (!sure) return;

    setSettings(initialSettings);
    setMessage("تم التراجع عن التغييرات.");
    setError("");
  }

  async function copyPublicLink() {
    if (!publicUrl) {
      setError("أضف رابط القائمة أولاً، ثم انسخه.");
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

  async function saveSettings() {
    const cleanSubdomain = normalizeSlug(settings.subdomain);

    if (!cleanSubdomain) {
      setError("رابط القائمة مطلوب.");
      return;
    }

    if (!isValidSlug(cleanSubdomain)) {
      setError("الرابط يجب أن يحتوي على حروف إنجليزية صغيرة، أرقام، أو شرطة فقط.");
      return;
    }

    setSavingKey("save-settings");
    clearAlerts();

    const { data: existingMenu, error: checkError } = await supabase
      .from("menus")
      .select("id")
      .eq("subdomain", cleanSubdomain)
      .neq("id", menu.id)
      .maybeSingle();

    if (checkError) {
      setSavingKey("");
      setError(checkError.message);
      return;
    }

    if (existingMenu) {
      setSavingKey("");
      setError("هذا الرابط مستخدم من قائمة أخرى. جرّب رابطاً مختلفاً.");
      return;
    }

    const nextSettings = {
      subdomain: cleanSubdomain,
      status: settings.status,
    };

    const { error: updateError } = await supabase
      .from("menus")
      .update(nextSettings)
      .eq("id", menu.id)
      .eq("owner_id", menu.owner_id);

    if (updateError) {
      setSavingKey("");
      setError(updateError.message);
      return;
    }

    await revalidatePublicMenu(menu.id, cleanSubdomain, menu.subdomain);

    setSettings(nextSettings);
    setInitialSettings(nextSettings);

    setSavingKey("");
    setMessage("تم حفظ إعدادات القائمة.");
    router.refresh();
  }

  async function deleteMenu() {
    const firstConfirm = confirm(
      "هل أنت متأكد؟ سيتم حذف القائمة وكل الأقسام والأصناف داخلها."
    );

    if (!firstConfirm) return;

    const secondConfirm = confirm(
      "هذا الإجراء لا يمكن التراجع عنه. هل تريد الحذف نهائياً؟"
    );

    if (!secondConfirm) return;

    setSavingKey("delete-menu");
    clearAlerts();

    const sectionIds = (menu.sections || []).map((section) => section.id);

    if (sectionIds.length > 0) {
      const { error: itemsError } = await supabase
        .from("items")
        .delete()
        .in("section_id", sectionIds);

      if (itemsError) {
        setSavingKey("");
        setError(itemsError.message);
        return;
      }
    }

    const { error: sectionsError } = await supabase
      .from("sections")
      .delete()
      .eq("menu_id", menu.id);

    if (sectionsError) {
      setSavingKey("");
      setError(sectionsError.message);
      return;
    }

    await revalidatePublicMenu(menu.id, menu.subdomain);

    const { error: menuError } = await supabase
      .from("menus")
      .delete()
      .eq("id", menu.id)
      .eq("owner_id", menu.owner_id);

    setSavingKey("");

    if (menuError) {
      setError(menuError.message);
      return;
    }

    router.push("/admin");
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
                Menu Settings
              </p>

              <h1 className="mt-1 text-2xl font-black text-[#1b1712] sm:text-3xl">
                إعدادات القائمة
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1b1712]/58">
                تحكم برابط القائمة، حالة الظهور، وخيارات الحذف الحساسة.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <SaveBadge hasChanges={hasChanges} />

              {hasPublicLink ? (
                <span
                  dir="ltr"
                  className="hidden items-center gap-2 rounded-full border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-1.5 text-xs font-black text-[#1b1712]/60"
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
            icon={<Globe size={18} />}
            label="الرابط"
            value={settings.subdomain || "غير محدد"}
            hint={hasPublicLink ? "جاهز للنسخ" : "مطلوب قبل النشر"}
            alert={!hasPublicLink}
          />

          <MetricBox
            icon={<CheckCircle2 size={18} />}
            label="الحالة"
            value={isArchived ? "مؤرشفة" : "مفعلة"}
            hint={isArchived ? "مخفية عن الزبائن" : "تظهر للزبائن"}
            alert={isArchived}
          />

          <MetricBox
            icon={<Archive size={18} />}
            label="الأقسام"
            value={sectionsCount}
            hint="داخل القائمة"
          />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-5">
            <Panel
              eyebrow="Public link"
              title="رابط القائمة"
              description="هذا هو الرابط الذي سيفتحه الزبائن عن طريق QR أو المشاركة."
              icon={<LinkIcon size={19} />}
            >
              <label className="grid gap-2">
                <span className="text-sm font-black text-[#1b1712]/60">
                  رابط القائمة
                </span>

                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <input
                    value={settings.subdomain}
                    onChange={(e) =>
                      updateField("subdomain", normalizeSlug(e.target.value))
                    }
                    placeholder="مثال: shawarma-haifa"
                    dir="ltr"
                    className="min-h-11 w-full rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] px-3 py-2.5 text-left text-sm font-black text-[#1b1712] outline-none transition placeholder:text-[#1b1712]/30 focus:border-[#1b1712]"
                  />

                  <button
                    type="button"
                    onClick={copyPublicLink}
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#d1c5b4] px-4 py-2.5 text-sm font-black text-[#1b1712]/70 transition hover:bg-[#cfc3b2] active:scale-[0.98]"
                  >
                    <Copy size={16} />
                    نسخ الرابط
                  </button>
                </div>

                <p className="text-xs font-bold leading-5 text-[#1b1712]/45">
                  استخدم حروف إنجليزية صغيرة، أرقام، وشرطة فقط. مثال:
                  <span dir="ltr" className="mx-1 font-black text-[#1b1712]/65">
                    shawarma-haifa
                  </span>
                </p>
              </label>
            </Panel>

            <Panel
              eyebrow="Visibility"
              title="حالة القائمة"
              description="يمكنك إخفاء القائمة مؤقتاً بدون حذفها."
              icon={<Archive size={19} />}
            >
              <div className="grid gap-2 md:grid-cols-2">
                <StatusOption
                  title="مفعلة"
                  description="القائمة تظهر للزبائن ويمكن فتح الرابط العام."
                  active={settings.status === "active"}
                  tone="green"
                  onClick={() => updateField("status", "active")}
                />

                <StatusOption
                  title="مؤرشفة"
                  description="القائمة تبقى محفوظة، لكنها لا تظهر للزبائن."
                  active={settings.status === "archived"}
                  tone="yellow"
                  onClick={() => updateField("status", "archived")}
                />
              </div>
            </Panel>

            <section className="rounded-2xl border border-red-900/25 bg-red-700/12 p-4 shadow-sm shadow-black/5">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-700 text-white">
                  <AlertTriangle size={19} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-black text-red-950">
                    منطقة خطيرة
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-red-950/70">
                    حذف القائمة سيحذف الأقسام والأصناف نهائياً. لا تستخدم هذا الخيار إلا إذا كنت متأكداً.
                  </p>

                  <button
                    type="button"
                    onClick={deleteMenu}
                    disabled={savingKey === "delete-menu"}
                    className="mt-4 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingKey === "delete-menu" ? (
                      <Loader2 className="animate-spin" size={17} />
                    ) : (
                      <Trash2 size={17} />
                    )}
                    حذف القائمة نهائياً
                  </button>
                </div>
              </div>
            </section>
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-24 lg:h-fit">
            <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Public preview
              </p>

              <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                رابط الزبائن
              </h2>

              <div className="mt-4 rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] px-3 py-3">
                <p
                  dir="ltr"
                  className="break-all text-left text-sm font-bold text-[#1b1712]/60"
                >
                  {publicUrl || "Add a public link first"}
                </p>
              </div>

              <div className="mt-3 grid gap-2">
                {hasPublicLink ? (
                  <Link
  href={publicUrl}
  target="_blank"
                    className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] px-4 py-2.5 text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] active:scale-[0.98]"
                  >
                    <ExternalLink size={16} />
                    فتح القائمة
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex min-h-10 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#1b1712]/40 px-4 py-2.5 text-sm font-black text-[#efe7da]/60"
                  >
                    <ExternalLink size={16} />
                    فتح القائمة
                  </button>
                )}

                <button
                  type="button"
                  onClick={copyPublicLink}
                  className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#ded4c5] px-4 py-2.5 text-sm font-black text-[#1b1712]/70 transition hover:bg-[#cfc3b2] active:scale-[0.98]"
                >
                  <Copy size={16} />
                  نسخ الرابط
                </button>
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
                احفظ التغييرات لتطبيق رابط القائمة وحالة الظهور.
              </p>
            </section>
          </aside>
        </section>
      </section>

      <SaveBar
        hasChanges={hasChanges}
        saving={savingKey === "save-settings"}
        onDiscard={discardChanges}
        onSave={saveSettings}
      />
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

function SaveBar({ hasChanges, saving, onDiscard, onSave }) {
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
              احفظ التغييرات لتطبيق رابط القائمة وحالة الظهور.
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

              {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}