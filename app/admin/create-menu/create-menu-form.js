"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function makeSubdomain(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [faviconPreview, setFaviconPreview] = useState(null);

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleNameChange(value) {
    updateField("name", value);

    if (!form.subdomain) {
      updateField("subdomain", makeSubdomain(value));
    }
  }

  async function uploadFavicon(menuId) {
    if (!faviconFile) return null;

    const fileExt = faviconFile.name.split(".").pop();
    const filePath = `favicons/${menuId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(filePath, faviconFile);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("menu-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

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
  .select("plan_id, subscription_status, trial_ends_at")
  .eq("id", user.id)
  .single();

if (profileError) throw profileError;

const { count, error: countError } = await supabase
  .from("menus")
  .select("*", { count: "exact", head: true })
  .eq("owner_id", user.id);

if (countError) throw countError;

const menuLimits = {
  trial: 1,
  basic: 1,
  pro: 5,
  business: Infinity,
};

const plan = profile?.plan_id || "trial";
const limit = menuLimits[plan] ?? 1;

if (count >= limit) {
  throw new Error("وصلت للحد الأقصى من القوائم في خطتك الحالية.");
}





      const cleanSubdomain = makeSubdomain(form.subdomain || form.name);

      if (!cleanSubdomain) {
        throw new Error("اكتب رابطًا فرعيًا صالحًا.");
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
        .select()
        .single();

      if (menuError) throw menuError;

      const faviconUrl = await uploadFavicon(menu.id);

      if (faviconUrl) {
        const { error: faviconError } = await supabase
          .from("menus")
          .update({ favicon_url: faviconUrl })
          .eq("id", menu.id);

        if (faviconError) throw faviconError;
      }

      router.push(`/admin/menus/${menu.id}`);
      router.refresh();
    } catch (err) {
      setError(err.message || "حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-black px-5 py-8 text-white">
      <section className="mx-auto max-w-2xl">
        <p className="text-sm text-white/50">CRTGO</p>

        <h1 className="mt-3 text-4xl font-black">إنشاء قائمة رقمية</h1>

        <p className="mt-4 text-white/60">
          جهّز الصفحة الأساسية للقائمة من البداية. يمكن تعديل كل شيء لاحقًا.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-white/60">
              اسم المطعم / الكافيه
            </label>

            <input
              required
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="مثال: كافيه الريف"
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 outline-none focus:border-white"
            />
          </div>

          <div dir="ltr">
            <label className="mb-2 block text-sm text-white/60">
              الرابط الفرعي
            </label>

            <div className="flex overflow-hidden rounded-2xl border border-white/15 bg-white/5">
              <input
                required
                dir="ltr"
                value={form.subdomain}
                onChange={(e) =>
                  updateField("subdomain", makeSubdomain(e.target.value))
                }
                placeholder="alreef"
                className="min-w-0 flex-1 bg-transparent px-4 py-4 text-left outline-none"
              />

              <span className="border-r border-white/15 px-3 py-4 text-left text-white/40">
                .crtgo.com
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/60">
              وصف قصير
            </label>

            <textarea
              value={form.description_ar}
              onChange={(e) => updateField("description_ar", e.target.value)}
              placeholder="مثال: قهوة مختصة وحلويات يومية"
              rows={3}
              className="w-full resize-none rounded-2xl border border-white/15 bg-white/5 px-4 py-4 outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/60">
              رقم الهاتف الأساسي
            </label>

            <input
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="0500000000"
              dir="ltr"
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-left outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/60">
              تصميم القائمة
            </label>

            <select
              value={form.template_id}
              onChange={(e) => updateField("template_id", e.target.value)}
              className="w-full rounded-2xl border border-white/15 bg-black px-4 py-4 outline-none focus:border-white"
            >
              <option value="classic">Classic</option>
              <option value="luxury">Luxury</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/60">
              حالة النشر
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateField("status", "active")}
                className={`rounded-2xl border px-4 py-4 font-bold ${
                  form.status === "active"
                    ? "border-white bg-white text-black"
                    : "border-white/15 text-white/60"
                }`}
              >
                عامة
              </button>

              <button
                type="button"
                onClick={() => updateField("status", "archived")}
                className={`rounded-2xl border px-4 py-4 font-bold ${
                  form.status === "archived"
                    ? "border-white bg-white text-black"
                    : "border-white/15 text-white/60"
                }`}
              >
                خاصة
              </button>
            </div>

            <p className="mt-2 text-sm text-white/40">
              الخاصة لن تظهر للزوار حتى تجعلها عامة.
            </p>
          </div>

<div className="rounded-3xl border border-white/10 p-5">
  <h2 className="text-lg font-bold">
    أيقونة الموقع (Favicon)
  </h2>

  <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5">

    {faviconPreview ? (
      <img
        src={faviconPreview}
        alt="Favicon"
        className="h-32 w-full object-contain bg-black/30 p-4"
      />
    ) : (
      <div className="flex h-32 items-center justify-center bg-black/30 text-sm text-white/30">
        لا توجد أيقونة
      </div>
    )}

    <label className="block cursor-pointer border-t border-white/10 px-4 py-4 text-center text-sm text-white/70">
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
        }}
      />
    </label>

    {faviconPreview && (
      <button
        type="button"
        onClick={() => {
          setFaviconFile(null);
          setFaviconPreview(null);
        }}
        className="w-full border-t border-white/10 bg-red-600 px-4 py-4 text-sm font-bold text-black"
      >
        حذف الأيقونة
      </button>
    )}

  </div>
</div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-white px-4 py-4 font-bold text-black disabled:opacity-50"
          >
            {loading ? "جارٍ الإنشاء..." : "إنشاء القائمة"}
          </button>
        </form>
      </section>
    </div>
  );
}