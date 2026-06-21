"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DetailsForm({ menu }) {
  const router = useRouter();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: menu.name || "",
    description_ar: menu.description_ar || "",
    location: menu.location || "",
    phone: menu.phone || "",
    whatsapp: menu.whatsapp || "",
    instagram: menu.instagram || "",
    tiktok: menu.tiktok || "",
    facebook: menu.facebook || "",
  });

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveDetails(e) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const { error } = await supabase
      .from("menus")
      .update({
        name: form.name.trim(),
        description_ar: form.description_ar.trim(),
        location: form.location.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim(),
        instagram: form.instagram.trim(),
        tiktok: form.tiktok.trim(),
        facebook: form.facebook.trim(),
      })
      .eq("id", menu.id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("تم حفظ معلومات القائمة.");
    router.refresh();
  }

  return (
    <main dir="rtl" className="min-h-screen px-5 py-8 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/50">المعلومات</p>

            <h1 className="mt-2 text-5xl font-bold">
              معلومات القائمة
            </h1>

            <p className="mt-3 max-w-2xl text-white/50">
              عدّل اسم القائمة، الوصف، الموقع، وطرق التواصل التي تظهر في الصفحة العامة.
            </p>
          </div>
        </div>

        {message && (
          <p className="mt-6 rounded-xl bg-green-500/10 p-4 text-sm text-green-300">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </p>
        )}

        <form onSubmit={saveDetails} className="mt-10 space-y-6">
          <section className="rounded-xl bg-black p-6">
            <div>
              <p className="text-sm text-white/50">Basic Information</p>
              <h2 className="mt-1 text-2xl font-bold">المعلومات الأساسية</h2>
            </div>

            <div className="mt-6 grid gap-5">
              <Field label="اسم القائمة" hint="هذا الاسم يظهر في أعلى القائمة العامة.">
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="مثال: مطعم كرتجو"
                  className="input"
                />
              </Field>

              <Field label="وصف قصير" hint="جملة قصيرة تشرح نوع المطعم أو الكافيه.">
                <textarea
                  value={form.description_ar}
                  onChange={(e) =>
                    updateField("description_ar", e.target.value)
                  }
                  placeholder="مثال: قهوة مختصة، حلويات يومية، ووجبات خفيفة"
                  rows={5}
                  className="input resize-none"
                />
              </Field>

              <Field label="الموقع / العنوان" hint="هذا يظهر للزبائن في صفحة القائمة.">
                <input
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="مثال: حيفا، شارع..."
                  className="input"
                />
              </Field>
            </div>
          </section>

          <section className="rounded-xl bg-black p-6">
            <div>
              <p className="text-sm text-white/50">Contact</p>
              <h2 className="mt-1 text-2xl font-bold">طرق التواصل</h2>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="رقم الهاتف">
                <input
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="0500000000"
                  dir="ltr"
                  className="input text-left"
                />
              </Field>

              <Field label="واتساب">
                <input
                  value={form.whatsapp}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                  placeholder="https://wa.me/972..."
                  dir="ltr"
                  className="input text-left"
                />
              </Field>

              <Field label="إنستغرام">
                <input
                  value={form.instagram}
                  onChange={(e) => updateField("instagram", e.target.value)}
                  placeholder="https://instagram.com/..."
                  dir="ltr"
                  className="input text-left"
                />
              </Field>

              <Field label="تيك توك">
                <input
                  value={form.tiktok}
                  onChange={(e) => updateField("tiktok", e.target.value)}
                  placeholder="https://tiktok.com/@..."
                  dir="ltr"
                  className="input text-left"
                />
              </Field>

              <Field label="فيسبوك">
                <input
                  value={form.facebook}
                  onChange={(e) => updateField("facebook", e.target.value)}
                  placeholder="https://facebook.com/..."
                  dir="ltr"
                  className="input text-left"
                />
              </Field>
            </div>
          </section>

          <section className="rounded-xl bg-black p-6 opacity-70">
            <div>
              <p className="text-sm text-white/50">Languages</p>
              <h2 className="mt-1 text-2xl font-bold">لغات القائمة</h2>
            </div>

            <p className="mt-3 text-sm text-white/50">
              حالياً اللغة الأساسية هي العربية. لاحقاً سنضيف تحكم كامل بالعبرية والإنجليزية.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <LanguageCard title="العربية" status="مفعلة" active />
              <LanguageCard title="العبرية" status="قريباً" />
              <LanguageCard title="الإنجليزية" status="قريباً" />
            </div>
          </section>

          <div className="sticky bottom-4 z-20 rounded-xl border border-white/10 bg-black/90 p-3 backdrop-blur">
            <button
              disabled={saving}
              className="w-full rounded-xl bg-white px-5 py-4 font-bold text-black disabled:opacity-50"
            >
              {saving ? "جارٍ الحفظ..." : "حفظ معلومات القائمة"}
            </button>
          </div>
        </form>
      </section>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          color: white;
          padding: 1rem;
          outline: none;
        }

        .input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }

        .input:focus {
          border-color: white;
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </main>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-bold text-white/50">{label}</p>

      {children}

      {hint && <p className="mt-2 text-xs text-white/35">{hint}</p>}
    </label>
  );
}

function LanguageCard({ title, status, active }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        active
          ? "border-white bg-white text-black"
          : "border-white/10 bg-white/5 text-white"
      }`}
    >
      <p className="font-bold">{title}</p>
      <p className="mt-1 text-xs opacity-60">{status}</p>
    </div>
  );
}