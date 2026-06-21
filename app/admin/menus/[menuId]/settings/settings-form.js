"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  Save,
  Loader2,
  RotateCcw,
  Copy,
  ExternalLink,
  Trash2,
  Archive,
  CheckCircle2,
  LinkIcon,
  AlertTriangle,
  Globe,
} from "lucide-react";

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

export default function SettingsForm({ menu }) {
  const router = useRouter();
  const supabase = createClient();

  const initialSettings = {
    subdomain: menu.subdomain || "",
    status: menu.status || "active",
  };

  const [settings, setSettings] = useState(initialSettings);
  const [savingKey, setSavingKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [origin, setOrigin] = useState("");

useEffect(() => {
  setOrigin(window.location.origin);
}, []);

  const publicPath = settings.subdomain
    ? `/m/${settings.subdomain}`
    : "/m/your-menu";

    const publicUrl = origin ? `${origin}${publicPath}` : publicPath;

  const hasChanges = useMemo(() => {
    return (
      settings.subdomain !== initialSettings.subdomain ||
      settings.status !== initialSettings.status
    );
  }, [settings.subdomain, settings.status]);

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
    if (!hasChanges) return;

    const sure = confirm("هل تريد التراجع عن التغييرات غير المحفوظة؟");
    if (!sure) return;

    setSettings(initialSettings);
    setMessage("تم التراجع عن التغييرات.");
    setError("");
  }

async function copyPublicLink() {
  const url = origin ? `${origin}${publicPath}` : publicPath;

  try {
    await navigator.clipboard.writeText(url);
    setMessage("تم نسخ رابط القائمة.");
    setError("");
  } catch {
    setError("لم يتم نسخ الرابط. انسخه يدوياً من المعاينة.");
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

    const { error } = await supabase
      .from("menus")
      .update({
        subdomain: cleanSubdomain,
        status: settings.status,
      })
      .eq("id", menu.id)
      .eq("owner_id", menu.owner_id);

    setSavingKey("");

    if (error) {
      setError(error.message);
      return;
    }

    setSettings({
      subdomain: cleanSubdomain,
      status: settings.status,
    });

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
    <main dir="rtl" className="min-h-screen px-5 py-8 pb-36 text-white">
      <section className="mx-auto max-w-6xl">
        <Link
          href={`/admin/menus/${menu.id}`}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowRight size={18} />
          الرجوع للقائمة
        </Link>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_320px]">
          <section className="rounded-xl border border-white/10 bg-[#0f0f0f] p-6 shadow-2xl shadow-black/20">
            <p className="text-sm text-white/45">الإعدادات</p>

            <h1 className="mt-2 text-5xl font-bold text-white">
              إعدادات القائمة
            </h1>

            <p className="mt-3 max-w-2xl text-white/45">
              تحكم برابط القائمة، حالة الظهور، والإعدادات الحساسة الخاصة بهذه القائمة.
            </p>
          </section>

          <section className="grid gap-3">
            <StatusCard
              icon={<Globe size={20} />}
              label="الرابط الحالي"
              value={settings.subdomain || "غير محدد"}
            />

            <StatusCard
              icon={<CheckCircle2 size={20} />}
              label="حالة القائمة"
              value={settings.status === "active" ? "مفعلة" : "مؤرشفة"}
            />

            <StatusCard
              icon={<Archive size={20} />}
              label="عدد الأقسام"
              value={(menu.sections || []).length}
            />
          </section>
        </div>

        {message && (
          <p className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 shadow-xl shadow-black/10">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                  <LinkIcon size={22} />
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-white">
                    رابط القائمة
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/45">
                    هذا الرابط هو الذي يفتحه الزبائن للوصول إلى القائمة العامة.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="block">
                  <p className="mb-2 text-sm font-bold text-white/45">
                    رابط القائمة
                  </p>

                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <input
                      value={settings.subdomain}
                      onChange={(e) =>
                        updateField("subdomain", normalizeSlug(e.target.value))
                      }
                      placeholder="مثال: test-menu"
                      dir="ltr"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left text-white outline-none transition placeholder:text-white/25 focus:border-white/40 focus:bg-white/[0.07]"
                    />

                    <button
                      type="button"
                      onClick={copyPublicLink}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4 font-extrabold text-white transition hover:bg-white/10"
                    >
                      <Copy size={18} />
                      نسخ الرابط
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-white/35">
                    استخدم حروف إنجليزية صغيرة، أرقام، وشرطة فقط. مثال:
                    <span dir="ltr" className="mx-1 text-white/60">
                      shawarma-haifa
                    </span>
                  </p>
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 shadow-xl shadow-black/10">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                  <Archive size={22} />
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-white">
                    حالة القائمة
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/45">
                    عند أرشفة القائمة، يمكنك إخفاؤها من الزبائن بدون حذفها.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => updateField("status", "active")}
                  className={`rounded-xl border p-5 text-right transition ${
                    settings.status === "active"
                      ? "border-green-400/30 bg-green-500/15"
                      : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
                  }`}
                >
                  <p className="text-lg font-extrabold text-white">مفعلة</p>

                  <p className="mt-2 text-sm text-white/45">
                    القائمة تظهر للزبائن ويمكن فتح الرابط العام.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => updateField("status", "archived")}
                  className={`rounded-xl border p-5 text-right transition ${
                    settings.status === "archived"
                      ? "border-yellow-400/30 bg-yellow-500/15"
                      : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
                  }`}
                >
                  <p className="text-lg font-extrabold text-white">مؤرشفة</p>

                  <p className="mt-2 text-sm text-white/45">
                    القائمة تبقى محفوظة، لكنها لا تظهر للزبائن.
                  </p>
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 shadow-xl shadow-black/10">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
                  <AlertTriangle size={22} />
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-white">
                    منطقة خطيرة
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-red-100/70">
                    حذف القائمة سيحذف الأقسام والأصناف نهائياً. لا تستخدم هذا الخيار إلا إذا كنت متأكداً.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={deleteMenu}
                disabled={savingKey === "delete-menu"}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-4 font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingKey === "delete-menu" ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Trash2 size={18} />
                )}
                حذف القائمة نهائياً
              </button>
            </div>
          </section>

          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 shadow-xl shadow-black/10">
              <p className="text-sm text-white/45">معاينة الرابط</p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                رابط الزبائن
              </h2>

              <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p dir="ltr" className="break-all text-left text-sm text-white/70">
                  {publicUrl}
                </p>
              </div>

              <div className="mt-4 grid gap-2">
                <Link
                  href={publicPath}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-extrabold text-black transition hover:bg-white/90"
                >
                  <ExternalLink size={18} />
                  فتح القائمة
                </Link>

                <button
                  type="button"
                  onClick={copyPublicLink}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4 font-extrabold text-white transition hover:bg-white/10"
                >
                  <Copy size={18} />
                  نسخ الرابط
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <div className="fixed bottom-24 left-4 right-4 z-[80] md:left-[22rem]">
        <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-[#0f0f0f]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p
                className={`text-sm font-bold ${
                  hasChanges ? "text-yellow-300" : "text-green-300"
                }`}
              >
                {hasChanges ? "لديك تغييرات غير محفوظة" : "كل شيء محفوظ"}
              </p>

              <p className="mt-1 text-xs text-white/40">
                احفظ التغييرات لتطبيق رابط القائمة وحالة الظهور.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 md:flex">
              <button
                type="button"
                onClick={discardChanges}
                disabled={!hasChanges || savingKey === "save-settings"}
                className="inline-flex items-center text-sm justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1 font-extrabold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw size={18} />
                تراجع
              </button>

              <button
                type="button"
                onClick={saveSettings}
                disabled={!hasChanges || savingKey === "save-settings"}
                className="inline-flex items-center text-sm justify-center gap-2 rounded-xl bg-white px-3 py-2 font-extrabold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {savingKey === "save-settings" ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {savingKey === "save-settings" ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-5 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between gap-3 text-white/45">
        <span>{label}</span>
        {icon}
      </div>

      <p className="mt-3 break-all text-2xl font-bold text-white">{value}</p>
    </div>
  );
}