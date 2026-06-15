"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check, Plus, X } from "lucide-react";

export default function MenuEditor({ menu }) {
  const router = useRouter();
  const supabase = createClient();

  const sections = [...(menu.sections || [])].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  const itemsCount = sections.reduce(
    (total, section) => total + (section.items?.length || 0),
    0
  );

  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [modalField, setModalField] = useState(null);

  const [details, setDetails] = useState({
    name: menu.name || "",
    description_ar: menu.description_ar || "",
    location: menu.location || "",
    phone: menu.phone || "",
    whatsapp: menu.whatsapp || "",
    instagram: menu.instagram || "",
    tiktok: menu.tiktok || "",
    facebook: menu.facebook || "",
  });

  const fields = {
    phone: {
      title: "رقم الهاتف",
      placeholder: "0500000000",
      type: "text",
    },
    whatsapp: {
      title: "واتساب",
      placeholder: "https://wa.me/972...",
      type: "url",
    },
    instagram: {
      title: "إنستغرام",
      placeholder: "https://instagram.com/...",
      type: "url",
    },
    tiktok: {
      title: "تيك توك",
      placeholder: "https://tiktok.com/@...",
      type: "url",
    },
    facebook: {
      title: "فيسبوك",
      placeholder: "https://facebook.com/...",
      type: "url",
    },
  };

  function updateDetail(key, value) {
    setDetails((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveDetails() {
    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("menus")
      .update(details)
      .eq("id", menu.id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  async function addSection() {
    const name = prompt("اسم القسم الجديد");
    if (!name?.trim()) return;

    setActionLoading("add-section");
    setError("");

    const { error } = await supabase.from("sections").insert({
      menu_id: menu.id,
      name_ar: name.trim(),
      sort_order: sections.length,
    });

    setActionLoading("");

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <main dir="rtl" className="min-h-screen px-5 py-8 text-white pb-30">
      <section className="mx-auto max-w-6xl">
        <Link
          href="/admin/menus"
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white/50 hover:bg-white/10"
        >
          الرجوع للقوائم
          <span>←</span>
        </Link>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          

          <button
            onClick={saveDetails}
            disabled={saving}
            className="rounded-2xl cursor-pointer bg-white px-6 py-4 font-bold text-black disabled:opacity-50 hover:bg-white/90"
          >
            {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>

        {error && (
          <p className="mt-6 rounded-2xl bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </p>
        )}

<div className="mt-10 flex flex-row items-center justify-around gap-3 border-b border-white/10 pb-10">
  <StatCard title="الأقسام" value={sections.length} />
  <StatCard title="الأصناف" value={itemsCount} />
  <StatCard title="الحالة" value={menu.status || "active"} />
</div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="rounded-md bg-black p-6">
              <h2 className="text-2xl font-bold">معلومات القائمة</h2>

              <div className="mt-6 grid gap-4">
                <Field label="اسم القائمة">
                  <input
                    value={details.name}
                    onChange={(e) => updateDetail("name", e.target.value)}
                    placeholder="اسم القائمة"
                    className="input"
                  />
                </Field>

                <InfoButton
                  title="الوصف"
                  value={details.description_ar}
                  emptyText="إضافة وصف قصير"
                  onClick={() => setModalField("description_ar")}
                />

                <InfoButton
                  title="الموقع / العنوان"
                  value={details.location}
                  emptyText="إضافة موقع أو عنوان"
                  onClick={() => setModalField("location")}
                />
              </div>
            </div>

            <div className="rounded-md bg-black p-6">
              <h2 className="text-2xl font-bold">التواصل</h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {Object.entries(fields).map(([key, field]) => (
                  <SocialCard
                    key={key}
                    title={field.title}
                    value={details[key]}
                    onClick={() => setModalField(key)}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-md bg-black p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">الأقسام</h2>
                  <p className="mt-2 text-sm text-white/50">
                    اضغط على أي قسم لتعديل الأصناف داخله.
                  </p>
                </div>

                <button
                  onClick={addSection}
                  disabled={actionLoading === "add-section"}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-black disabled:opacity-50 hover:bg-white/90"
                >
                  <span><Plus /></span>
                  {actionLoading === "add-section" ? "جارٍ الإضافة..." : "قسم جديد"}
                </button>
              </div>

              <div className="mt-6 grid gap-3">
                {!sections.length && (
                  <div className="rounded-2xl border border-white/10 p-5 text-white/50">
                    لا توجد أقسام بعد.
                  </div>
                )}

                {sections.map((section) => (
                  <Link
                    key={section.id}
                    href={`/admin/menus/${menu.id}/sections/${section.id}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 p-5 transition hover:bg-white hover:text-black"
                  >
                    <div>
                      <h3 className="text-xl font-bold">{section.name_ar}</h3>
                      <p className="mt-1 text-sm opacity-60">
                        {(section.items || []).length} أصناف
                      </p>
                    </div>

                    <span>←</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="hidden rounded-3xl bg-black p-6 text-white">
              <p className="text-sm text-white/50">الرابط العام</p>

              <h2 dir="ltr" className="mt-3 break-all text-2xl font-bold">
                crtgo.com/m/{menu.subdomain}
              </h2>

              <a
                href={`/m/${menu.subdomain}`}
                target="_blank"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-black"
              >
                فتح القائمة
                <span>↗</span>
              </a>
            </div>

            <div className="rounded-md bg-black p-6">
              <h2 className="text-2xl font-bold">لغات القائمة</h2>

              <p className="mt-3 text-sm text-white/50">
                قريباً ستتمكن من اختيار لغات القائمة العامة.
              </p>

              <div className="mt-5 space-y-3">
                <LanguagePlaceholder label="العربية" active />
                <LanguagePlaceholder label="العبرية" />
                <LanguagePlaceholder label="الإنجليزية" />
              </div>
            </div>
          </aside>
        </div>
      </section>

      {modalField && (
        <EditFieldModal
          fieldKey={modalField}
          value={details[modalField]}
          field={fields[modalField]}
          onClose={() => setModalField(null)}
          onSave={(value) => {
            updateDetail(modalField, value);
            setModalField(null);
          }}
        />
      )}

  
    </main>
  );
}

function InfoButton({ title, value, emptyText, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-white/10 bg-white/5 p-5 text-right transition hover:bg-white/10"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-white/50">{title}</p>
          <h3 className="mt-1 line-clamp-2 font-bold">
            {value || emptyText}
          </h3>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl font-black text-black">
          {value ? <Check /> : <Plus color="black" />}
        </div>
      </div>
    </button>
  );
}

function SocialCard({ title, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-white/10 bg-white/5 p-5 text-right transition hover:bg-white/10"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-white/50">{title}</p>
          <p
            dir="ltr"
            className="mt-1 truncate text-left text-sm font-bold text-white"
          >
            {value || "غير مضاف"}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black">
          <span className="text-xl font-black">{value ? <Check /> : <Plus />}</span>
        </div>
      </div>
    </button>
  );
}

function EditFieldModal({ fieldKey, field, value, onSave, onClose }) {
  const [input, setInput] = useState(value || "");

  const isLong = fieldKey === "description_ar";

  const title =
    fieldKey === "description_ar"
      ? "الوصف"
      : fieldKey === "location"
      ? "الموقع / العنوان"
      : field?.title;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-md bg-[#111] p-5 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/50">تعديل</p>
            <h2 className="mt-1 text-2xl font-bold">{title}</h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-2xl hover:bg-white/20"
          >
            <X />
          </button>
        </div>

        <div className="mt-6">
          {isLong ? (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={5}
              placeholder="اكتب هنا..."
              className="modal-input resize-none"
            />
          ) : (
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={field?.placeholder || "اكتب هنا..."}
              dir={fieldKey === "phone" || field?.type === "url" ? "ltr" : "rtl"}
              className="modal-input"
            />
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl cursor-pointer border border-white/15 px-4 py-4 font-bold text-white"
          >
            إلغاء
          </button>

          <button
            onClick={() => onSave(input)}
            className="flex-1 rounded-2xl cursor-pointer bg-white px-4 py-4 font-bold text-black"
          >
            حفظ
          </button>
        </div>

  
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="flex items-center justify-between p-5">
      <div className="flex flex-col items-center justify-center gap-1 w-16">
        <p className="text-sm text-white/50">{title}</p>

        <h2 className="text-xl font-bold text-white">
          {value}
        </h2>
      </div>
    </div>
  );
}


function Field({ label, children }) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-bold text-white/50">{label}</p>
      {children}
    </label>
  );
}

function LanguagePlaceholder({ label, active }) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border px-4 py-4 ${
        active
          ? "border-white bg-white text-black"
          : "border-white/10 text-white/50"
      }`}
    >
      <span className="font-bold">{label}</span>
      <span className="text-xs opacity-60">{active ? "مفعلة" : "قريباً"}</span>
    </div>
  );
}