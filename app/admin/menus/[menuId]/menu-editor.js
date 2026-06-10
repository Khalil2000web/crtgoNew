"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, X } from "lucide-react";

export default function MenuEditor({ menu }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const [coverOpen, setCoverOpen] = useState(false);

  const [details, setDetails] = useState({
    name: menu.name || "",
    description_ar: menu.description_ar || "",
    phone: menu.phone || "",
    whatsapp: menu.whatsapp || "",
    instagram: menu.instagram || "",
    tiktok: menu.tiktok || "",
    facebook: menu.facebook || "",
  });

  useEffect(() => {
    const targetId = sessionStorage.getItem("scrollTarget");
    if (!targetId) return;

    sessionStorage.removeItem("scrollTarget");

    setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
  }, [menu]);

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

  async function updateMenuSettings(updates) {
    setError("");

    const { error } = await supabase
      .from("menus")
      .update(updates)
      .eq("id", menu.id);

    if (error) {
      setError(error.message);
      return false;
    }

    router.refresh();
    return true;
  }

  async function archiveMenu() {
    setActionLoading("archive-menu");
    await updateMenuSettings({ status: "archived" });
    setActionLoading("");
  }

  async function restoreMenu() {
    setActionLoading("restore-menu");
    await updateMenuSettings({ status: "active" });
    setActionLoading("");
  }

  async function deleteMenu() {
    setError("");
    setActionLoading("delete-menu");

    const { error } = await supabase.from("menus").delete().eq("id", menu.id);

    setActionLoading("");

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  const sections = [...(menu.sections || [])].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );

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

  async function uploadMenuImage(field, file) {
    if (!file) return;

    setError("");
    setActionLoading(`upload-menu-${field}`);

    const fileExt = file.name.split(".").pop();
    const filePath = `menus/${menu.id}/${field}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(filePath, file);

    if (uploadError) {
      setActionLoading("");
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("menu-images")
      .getPublicUrl(filePath);

    const { error } = await supabase
      .from("menus")
      .update({ [field]: data.publicUrl })
      .eq("id", menu.id);

    setActionLoading("");

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  async function deleteMenuImage(field) {
    const sure = confirm("هل تريد حذف هذه الصورة؟");
    if (!sure) return;

    setActionLoading(`delete-menu-${field}`);

    const { error } = await supabase
      .from("menus")
      .update({ [field]: null })
      .eq("id", menu.id);

    setActionLoading("");

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

    const { data, error } = await supabase
      .from("sections")
      .insert({
        menu_id: menu.id,
        name_ar: name.trim(),
        sort_order: sections.length,
      })
      .select("id")
      .single();

    setActionLoading("");

    if (error) {
      setError(error.message);
      return;
    }

    sessionStorage.setItem("scrollTarget", `section-${data.id}`);
    router.refresh();
  }

  async function renameSection(sectionId, currentName) {
    const name = prompt("اسم القسم", currentName);
    if (!name?.trim()) return;

    setActionLoading(`rename-section-${sectionId}`);

    const { error } = await supabase
      .from("sections")
      .update({ name_ar: name.trim() })
      .eq("id", sectionId);

    setActionLoading("");

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  async function deleteSection(sectionId) {
    const sure = confirm("هل تريد حذف هذا القسم وكل الأصناف داخله؟");
    if (!sure) return;

    setActionLoading(`delete-section-${sectionId}`);

    const { error } = await supabase
      .from("sections")
      .delete()
      .eq("id", sectionId);

    setActionLoading("");

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  async function addItem(sectionId) {
    setActionLoading(`add-item-${sectionId}`);
    setError("");

    const { data, error } = await supabase
      .from("items")
      .insert({
        section_id: sectionId,
        name_ar: "صنف جديد",
        description_ar: "",
        price: 0,
        is_available: true,
      })
      .select("id")
      .single();

    setActionLoading("");

    if (error) {
      setError(error.message);
      return;
    }

    sessionStorage.setItem("scrollTarget", `item-${data.id}`);
    router.refresh();
  }

  async function updateItem(itemId, updates) {
    setActionLoading(`update-item-${itemId}`);

    const { error } = await supabase
      .from("items")
      .update(updates)
      .eq("id", itemId);

    setActionLoading("");

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  async function deleteItem(itemId) {
    const sure = confirm("هل تريد حذف هذا الصنف؟");
    if (!sure) return;

    setActionLoading(`delete-item-${itemId}`);

    const { error } = await supabase.from("items").delete().eq("id", itemId);

    setActionLoading("");

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  async function uploadItemImage(itemId, file) {
    if (!file) return;

    setError("");
    setActionLoading(`upload-item-image-${itemId}`);

    const fileExt = file.name.split(".").pop();
    const filePath = `items/${menu.id}/${itemId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(filePath, file);

    if (uploadError) {
      setActionLoading("");
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("menu-images")
      .getPublicUrl(filePath);

    await updateItem(itemId, {
      image_url: data.publicUrl,
    });

    setActionLoading("");
  }

  async function deleteItemImage(itemId) {
    const sure = confirm("هل تريد حذف صورة هذا الصنف؟");
    if (!sure) return;

    setActionLoading(`delete-item-image-${itemId}`);

    await updateItem(itemId, {
      image_url: null,
    });

    setActionLoading("");
  }

  return (
    <div dir="rtl" className="min-h-screen px-5 py-8">
      <section className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-left text-sm flex items-center justify-end gap-2 text-black/50 hover:bg-black/10 rounded-full px-3 py-2">
                   الرجوع للصفحةالرئيسية <ChevronLeft />
                </Link>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-black/70">محرر القائمة</p>
            <h1 className="mt-2 text-4xl font-black">{menu.name}</h1>
            <a
  href={`https://crtgo.com/m/${menu.subdomain}`}
  target="_blank"
  rel="noopener noreferrer"
  className="mt-2 block text-left text-sm text-black/60 hover:text-black hover:underline"
>
  crtgo.com/m/{menu.subdomain}
</a>
          </div>

<div className="flex gap-3">
  <button
    onClick={() => setSettingsOpen(true)}
    className="rounded-full cursor-pointer border border-black/70 px-5 py-3 font-bold text-black hover:bg-white hover:text-black transition-colors"
  >
    ⚙️ الإعدادات
  </button>

  <button
    onClick={saveDetails}
    disabled={saving}
    className="rounded-full cursor-pointer bg-white px-6 py-3 font-bold text-black disabled:opacity-50 hover:bg-white/60 border border-transparent hover:border-black/70"
  >
    {saving ? "جارٍ الحفظ..." : "حفظ المعلومات"}
  </button>
</div>
        </div>

        {error && (
          <p className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[350px_1fr]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-black/70 p-5">
              <h2 className="text-xl font-bold">معلومات القائمة</h2>

              <div className="mt-5 space-y-4">
                <input
                  value={details.name}
                  onChange={(e) => updateDetail("name", e.target.value)}
                  placeholder="اسم القائمة"
                  className="w-full rounded-2xl border border-black/70 bg-white/5 px-4 py-4 outline-none focus:border-black"
                />

                <textarea
                  value={details.description_ar}
                  onChange={(e) =>
                    updateDetail("description_ar", e.target.value)
                  }
                  placeholder="وصف قصير للقائمة"
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-black/70 bg-white/5 px-4 py-4 outline-none focus:border-black"
                />

                <input
                  value={details.phone}
                  onChange={(e) => updateDetail("phone", e.target.value)}
                  placeholder="رقم الهاتف"
                  dir="ltr"
                  className="w-full rounded-2xl border border-black/70  bg-white/5 px-4 py-4 text-left outline-none focus:border-black"
                />

                <input
                  value={details.whatsapp}
                  onChange={(e) => updateDetail("whatsapp", e.target.value)}
                  placeholder="رابط واتساب"
                  dir="ltr"
                  className="w-full rounded-2xl border border-black/70 bg-white/5 px-4 py-4 text-left outline-none focus:border-black"
                />

                <input
                  value={details.instagram}
                  onChange={(e) => updateDetail("instagram", e.target.value)}
                  placeholder="رابط إنستغرام"
                  dir="ltr"
                  className="w-full rounded-2xl border border-black/70 bg-white/5 px-4 py-4 text-left outline-none focus:border-black"
                />

                <input
                  value={details.tiktok}
                  onChange={(e) => updateDetail("tiktok", e.target.value)}
                  placeholder="رابط تيك توك"
                  dir="ltr"
                  className="w-full rounded-2xl border border-black/70 bg-white/5 px-4 py-4 text-left outline-none focus:border-black"
                />

                <input
                  value={details.facebook}
                  onChange={(e) => updateDetail("facebook", e.target.value)}
                  placeholder="رابط فيسبوك"
                  dir="ltr"
                  className="w-full rounded-2xl border border-black/70 bg-white/5 px-4 py-4 text-left outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-black/70 p-5">
              <h2 className="text-xl font-bold">الشعار وصورة الغلاف</h2>

              <div className="mt-5 space-y-5">
                <ImageUploader
                  title="الشعار"
                  imageUrl={menu.logo_url}
                  loading={
                    actionLoading === "upload-menu-logo_url" ||
                    actionLoading === "delete-menu-logo_url"
                  }
                  onUpload={(file) => uploadMenuImage("logo_url", file)}
                  onDelete={() => deleteMenuImage("logo_url")}
                />

                <button
  type="button"
  onClick={() => setCoverOpen(true)}
  className="w-full rounded-2xl border cursor-pointer border-black/70 px-4 py-4 font-bold hover:bg-white transition-colors text-black"
>
  إعدادات صورة الغلاف
</button>
              </div>
            </div>

            <WorkingHoursEditor
              menuId={menu.id}
              initialHours={menu.working_hours || {}}
            />
          </aside>

          <section className="rounded-3xl border border-black/50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">الأقسام والأصناف</h2>
                <p className="mt-2 text-sm text-black/50">
                  أنشئ أقسام القائمة، ثم أضف الأصناف داخل كل قسم.
                </p>
              </div>

              <button
                onClick={addSection}
                disabled={actionLoading === "add-section"}
                className="cursor-pointer rounded-full border border-transparent bg-white px-5 py-3 font-bold text-black hover:border-black/70 hover:bg-white/60 disabled:opacity-50"
              >
                {actionLoading === "add-section"
                  ? "جارٍ الإضافة..."
                  : "قسم جديد"}
              </button>
            </div>

            <div className="mt-8 space-y-6">
              {!sections.length && (
                <div className="rounded-2xl border border-black/70 p-6 text-black/50">
                  لا توجد أقسام بعد.
                </div>
              )}

              {sections.map((section) => {
                const items = section.items || [];

                return (
                  <div
                    id={`section-${section.id}`}
                    key={section.id}
                    className="rounded-3xl border border-black/50 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <h3 className="text-xl font-bold">{section.name_ar}</h3>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => addItem(section.id)}
                          disabled={actionLoading === `add-item-${section.id}`}
                          className="cursor-pointer rounded-full border border-black/70 px-4 py-2 text-sm transition-colors hover:bg-white hover:text-black disabled:opacity-50"
                        >
                          {actionLoading === `add-item-${section.id}`
                            ? "جارٍ الإضافة..."
                            : "إضافة صنف"}
                        </button>

                        <button
                          onClick={() =>
                            renameSection(section.id, section.name_ar)
                          }
                          disabled={
                            actionLoading === `rename-section-${section.id}`
                          }
                          className="cursor-pointer rounded-full border border-black/70 px-4 py-2 text-sm text-black/70 transition-colors hover:bg-white hover:text-black disabled:opacity-50"
                        >
                          {actionLoading === `rename-section-${section.id}`
                            ? "جارٍ التعديل..."
                            : "تعديل الاسم"}
                        </button>

                        <button
                          onClick={() => deleteSection(section.id)}
                          disabled={
                            actionLoading === `delete-section-${section.id}`
                          }
                          className="cursor-pointer rounded-full border border-black/70 bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading === `delete-section-${section.id}`
                            ? "جارٍ الحذف..."
                            : "حذف القسم"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">
                      {!items.length && (
                        <p className="rounded-2xl bg-black/7 p-4 text-sm text-black/70">
                          لا توجد أصناف في هذا القسم.
                        </p>
                      )}

                      {items.map((item) => (
                        <div
                          id={`item-${item.id}`}
                          key={item.id}
                          className="grid gap-4 bg-white/5 p-4 md:grid-cols-[200px_1fr_0px] border-t border-black"
                        >
                          <div className="overflow-hidden rounded-2xl border border-black/10 bg-black/40">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name_ar || "صورة الصنف"}
                                className="pointer-events-none h-40 w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-40 items-center justify-center text-sm text-black">
                                لا توجد صورة
                              </div>
                            )}

                            <label className="block cursor-pointer font-bold hover:bg-black/20 border-t border-black/50 px-3 py-3 text-center text-sm text-white/70">
                              {item.image_url ? "تغيير الصورة" : "إضافة صورة"}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={
                                  actionLoading ===
                                  `upload-item-image-${item.id}`
                                }
                                onChange={(e) =>
                                  uploadItemImage(
                                    item.id,
                                    e.target.files?.[0]
                                  )
                                }
                              />
                            </label>

                            {item.image_url && (
                              <button
                                onClick={() => deleteItemImage(item.id)}
                                className="w-full border-t border-black/50 px-3 py-3 text-sm font-bold text-red-800 hover:text-red-700 hover:bg-red-400/20 cursor-pointer"
                              >
                                حذف الصورة
                              </button>
                            )}
                          </div>

                          <div className="flex flex-col items-center justify-center gap-2">
                            <label className="text-md w-full">
                              <p className="my-1 text-md font-bold text-black">
                                اسم الصنف
                              </p>

                              <input
                                defaultValue={item.name_ar}
                                onBlur={(e) =>
                                  updateItem(item.id, {
                                    name_ar: e.target.value,
                                  })
                                }
                                placeholder="اسم الصنف"
                                className="w-full rounded-xl border border-black/10 bg-black/40 px-3 py-3 outline-none focus:border-black"
                              />
                            </label>

                            <label className="w-full">
                              <p className="my-1 text-md font-bold text-black">
                                وصف الصنف
                              </p>

                              <textarea
                                defaultValue={item.description_ar || ""}
                                onBlur={(e) =>
                                  updateItem(item.id, {
                                    description_ar: e.target.value,
                                  })
                                }
                                placeholder="وصف الصنف"
                                rows={4}
                                className="w-full resize-none rounded-xl border border-black/10 bg-black/40 px-3 py-3 outline-none focus:border-black"
                              />
                            </label>

<label className="text-md">
<p className="my-1 text-md text-black font-bold">

سعر الصنف
</p>
                            <input
                              defaultValue={item.price || ""}
                              onBlur={(e) =>
                                updateItem(item.id, {
                                  price: e.target.value || 0,
                                })
                              }
                              placeholder="السعر"
                              type="number"
                              dir="ltr"
                              step="0.1"
                            
                              className="w-full rounded-xl border border-black/10 bg-black/40 px-3 py-3 text-right outline-none focus:border-black"
                            />
</label>

                            <button
                              onClick={() => deleteItem(item.id)}
                              className="w-full rounded-xl font-bold border border-black/70 px-3 py-3 text-sm cursor-pointer bg-red-500 text-white hover:bg-red-700"
                            >
                              حذف الصنف
                            </button>
                          </div>
                          </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </section>

      {settingsOpen && (
        <MenuSettingsDialog
          menu={menu}
          actionLoading={actionLoading}
          onClose={() => setSettingsOpen(false)}
          onSave={async (values) => {
            const saved = await updateMenuSettings({
              name: values.name,
              subdomain: makeSubdomain(values.subdomain),
              template_id: values.template_id,
            });

      if (saved) setSettingsOpen(false);
    }}
    onArchive={archiveMenu}
    onRestore={restoreMenu}
    onDelete={deleteMenu}
  />
)}


{coverOpen && (
  <CoverSettingsModal
    menu={menu}
    supabase={supabase}
    onClose={() => setCoverOpen(false)}
    onSaved={() => {
      setCoverOpen(false);
      router.refresh();
    }}
    setError={setError}
  />
)}

    </div>
  );
}

function ImageUploader({ title, imageUrl, onUpload, onDelete, loading }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-black/5">
      <div className="p-4">
        <h3 className="font-bold">{title}</h3>
      </div>

      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="pointer-events-none h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-black/40 text-sm text-white/80">
          لا توجد صورة
        </div>
      )}

      <label className="block cursor-pointer border-t border-black/10 px-4 py-3 text-center text-sm font-bold text-black">
        {loading ? "جارٍ المعالجة..." : imageUrl ? "تغيير الصورة" : "رفع صورة"}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={loading}
          onChange={(e) => onUpload(e.target.files?.[0])}
        />
      </label>

      {imageUrl && (
        <button
          onClick={onDelete}
          disabled={loading}
          className="w-full cursor-pointer border-t border-black/10 bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "جارٍ الحذف..." : "حذف الصورة"}
        </button>
      )}
    </div>
  );
}

function WorkingHoursEditor({ menuId, initialHours }) {
  const router = useRouter();
  const supabase = createClient();

  const days = [
    ["sunday", "الأحد"],
    ["monday", "الإثنين"],
    ["tuesday", "الثلاثاء"],
    ["wednesday", "الأربعاء"],
    ["thursday", "الخميس"],
    ["friday", "الجمعة"],
    ["saturday", "السبت"],
  ];

  const [hours, setHours] = useState(() => {
    const base = {};

    days.forEach(([key]) => {
      base[key] = initialHours?.[key] || {
        closed: false,
        open: "09:00",
        close: "22:00",
      };
    });

    return base;
  });

  const [saving, setSaving] = useState(false);

  function updateDay(day, key, value) {
    setHours((current) => ({
      ...current,
      [day]: {
        ...current[day],
        [key]: value,
      },
    }));
  }

  async function saveHours() {
    setSaving(true);

    const { error } = await supabase
      .from("menus")
      .update({ working_hours: hours })
      .eq("id", menuId);

    setSaving(false);

    if (!error) router.refresh();
  }

  return (
    <div className="rounded-3xl border border-black/70 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">ساعات العمل</h2>

        <button
          onClick={saveHours}
          disabled={saving}
          className="cursor-pointer rounded-full border border-transparent bg-white px-4 py-2 text-sm font-bold text-black transition-colors hover:border-black/70 hover:bg-white/60 disabled:opacity-50"
        >
          {saving ? "حفظ..." : "حفظ"}
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {days.map(([key, label]) => (
          <div
            key={key}
            className="rounded-2xl border border-black/70 bg-white/5 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold">{label}</span>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-black">
                <input
                  type="checkbox"
                  checked={hours[key]?.closed || false}
                  onChange={(e) =>
                    updateDay(key, "closed", e.target.checked)
                  }
                />
                مغلق
              </label>
            </div>

            {!hours[key]?.closed && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={hours[key]?.open || "09:00"}
                  onChange={(e) => updateDay(key, "open", e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-black/40 px-3 py-3 text-left outline-none"
                />

                <input
                  type="time"
                  value={hours[key]?.close || "22:00"}
                  onChange={(e) => updateDay(key, "close", e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-black/40 px-3 py-3 text-left outline-none"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuSettingsDialog({
  menu,
  onClose,
  onSave,
  onArchive,
  onRestore,
  onDelete,
  actionLoading,
}) {
  const [name, setName] = useState(menu.name || "");
  const [subdomain, setSubdomain] = useState(menu.subdomain || "");
  const [deleteText, setDeleteText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templateId, setTemplateId] = useState(menu.template_id || "classic");

  const isArchived = menu.status === "archived";
  const canDelete = deleteText === menu.name;

  async function handleSave() {
    setSaving(true);

    await onSave({
      name,
      subdomain,
      template_id: templateId,
    });

    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-black/10 bg-[#080808] p-5 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/50">إعدادات القائمة</p>
            <h2 className="mt-1 text-2xl font-black">{menu.name}</h2>
          </div>

          <button
            onClick={onClose}
            className="cursor-pointer rounded-full border border-black/15 px-4 py-2 text-sm text-white/60"
          >
            إغلاق
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-white/60">
              اسم القائمة
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-black/15 bg-white/5 px-4 py-4 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/60">
              رابط القائمة
            </label>

            <div className="flex overflow-hidden rounded-2xl border border-black/15 bg-white/5">
              <input
                dir="ltr"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                className="min-w-0 flex-1 bg-transparent px-4 py-4 text-left outline-none"
              />

              <span
                dir="ltr"
                className="border-r border-black/15 px-4 py-4 text-white/40"
              >
                crtgo.com/m/
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 mt-4 block text-sm text-white/60">
              تصميم القائمة
            </label>

            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="flex w-full items-center justify-between rounded-2xl border border-black/15 bg-white/5 px-2 py-4 outline-none focus:border-black"
            >
              <option value="classic">Classic</option>
              <option value="luxury">Luxury</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full cursor-pointer rounded-2xl bg-white px-4 py-4 font-bold text-black disabled:opacity-50"
          >
            {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-black/10 p-4">
          <h3 className="font-bold">حالة القائمة</h3>

          <p className="mt-2 text-sm text-white/50">
            الحالة الحالية: {isArchived ? "مؤرشفة" : "نشطة"}
          </p>

          {isArchived ? (
            <button
              onClick={onRestore}
              disabled={actionLoading === "restore-menu"}
              className="mt-4 w-full cursor-pointer rounded-2xl border border-black/15 px-4 py-4 font-bold disabled:opacity-50"
            >
              {actionLoading === "restore-menu"
                ? "جارٍ الاستعادة..."
                : "استعادة القائمة"}
            </button>
          ) : (
            <button
              onClick={onArchive}
              disabled={actionLoading === "archive-menu"}
              className="mt-4 w-full cursor-pointer rounded-2xl border border-black/15 px-4 py-4 font-bold disabled:opacity-50"
            >
              {actionLoading === "archive-menu"
                ? "جارٍ الأرشفة..."
                : "أرشفة القائمة"}
            </button>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <h3 className="font-bold text-red-300">حذف القائمة</h3>

          <p className="mt-2 text-sm text-red-200/70">
            حذف القائمة سيحذف الأقسام والأصناف التابعة لها. هذا الإجراء لا يمكن
            التراجع عنه.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-4 w-full cursor-pointer rounded-2xl bg-red-500 px-4 py-4 font-bold text-white"
            >
              حذف القائمة
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-red-200/80">
                للتأكيد، اكتب اسم القائمة:
                <span className="font-bold"> {menu.name}</span>
              </p>

              <input
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                className="w-full rounded-2xl border border-red-400/30 bg-black/30 px-4 py-4 outline-none focus:border-red-300"
              />

              <button
                disabled={!canDelete || actionLoading === "delete-menu"}
                onClick={onDelete}
                className="w-full cursor-pointer rounded-2xl bg-red-500 px-4 py-4 font-bold text-white disabled:opacity-30"
              >
                {actionLoading === "delete-menu"
                  ? "جارٍ الحذف..."
                  : "تأكيد الحذف النهائي"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




function CoverSettingsModal({ menu, supabase, onClose, onSaved, setError }) {
  const [images, setImages] = useState(menu.cover_images || []);
  const [settings, setSettings] = useState(
    menu.cover_settings || { type: "single", speed: "normal" }
  );
  const [saving, setSaving] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);

  const types = [
    { id: "single", name: "صورة واحدة" },
    { id: "fade", name: "تبديل ناعم" },
    { id: "carousel", name: "سلايدر تلقائي" },
    { id: "stack", name: "صور متراكمة" },
  ];

  const speeds = [
    { id: "verySlow", name: "بطيء جداً" },
    { id: "slow", name: "بطيء" },
    { id: "normal", name: "عادي" },
    { id: "fast", name: "سريع" },
  ];

  async function uploadCover(file) {
    if (!file) return;

    if (images.length >= 5) {
      setError("يمكنك رفع 5 صور كحد أقصى.");
      return;
    }

    setSaving(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `menus/${menu.id}/covers/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(filePath, file);

    if (uploadError) {
      setSaving(false);
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("menu-images")
      .getPublicUrl(filePath);

    setImages((current) => [...current, data.publicUrl]);
    setSaving(false);
  }

  function confirmDeleteImage() {
    if (imageToDelete === null) return;

    setImages((current) => current.filter((_, i) => i !== imageToDelete));
    setImageToDelete(null);
  }

  async function saveCoverSettings() {
    setSaving(true);

    const mainCover = images[0] || null;

    const { error } = await supabase
      .from("menus")
      .update({
        cover_url: mainCover,
        cover_images: images,
        cover_settings: settings,
      })
      .eq("id", menu.id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    onSaved();
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-5 text-black no-scrollbar">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-black/50">إعدادات الغلاف</p>
            <h2 className="text-2xl font-black">صور غلاف القائمة</h2>
          </div>

          <button
            onClick={onClose}
            className="cursor-pointer rounded-full border border-black/20 px-4 py-2 text-sm text-black/50 hover:bg-black/10"
          >
            إغلاق
          </button>
        </div>

        <div className="mt-6">
          <label className="block cursor-pointer rounded-2xl border border-black/20 px-4 py-5 text-center font-bold hover:border-black">
            {images.length >= 5 ? "وصلت للحد الأقصى" : "إضافة صورة غلاف"}

            <input
              type="file"
              accept="image/*"
              disabled={images.length >= 5 || saving}
              className="hidden"
              onChange={(e) => {
                uploadCover(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>

          <p className="mt-2 text-sm text-black/50">يمكنك رفع حتى 5 صور.</p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {images.map((image, index) => (
            <div key={image} className="relative pt-3">
              <button
                type="button"
                onClick={() => setImageToDelete(index)}
                className="absolute -right-2 top-0 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black bg-white text-black shadow-lg transition hover:bg-red-600 hover:text-white"
                aria-label="حذف الصورة"
              >
                <X size={18} />
              </button>

              <div className="overflow-hidden rounded-2xl border border-black/10">
                <img
                  src={image}
                  alt={`Cover ${index + 1}`}
                  className="h-36 w-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="mb-3 font-bold">شكل الهيدر</h3>

          <div className="grid gap-3 sm:grid-cols-2">
            {types.map((type) => {
              const active = settings.type === type.id;

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      type: type.id,
                    }))
                  }
                  className={`rounded-3xl border-2 p-3 text-right transition ${
                    active
                      ? "border-black bg-white shadow-[0_0_0_4px_rgba(0,0,0,0.08)]"
                      : "border-black/15 bg-white hover:border-black/50"
                  }`}
                >
                  <div className="h-36 overflow-hidden rounded-2xl bg-black/10">
                    <CoverTypePreview
                      type={type.id}
                      images={images}
                      speed={settings.speed || "normal"}
                    />
                  </div>

                  <p className="mt-3 font-bold">{type.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="mb-3 font-bold">سرعة الحركة</h3>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {speeds.map((speed) => {
              const active = (settings.speed || "normal") === speed.id;

              return (
                <button
                  key={speed.id}
                  type="button"
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      speed: speed.id,
                    }))
                  }
                  className={`rounded-2xl border-2 px-4 py-4 font-bold transition ${
                    active
                      ? "border-black bg-black text-white"
                      : "border-black/15 bg-white text-black hover:border-black/50"
                  }`}
                >
                  {speed.name}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={saveCoverSettings}
          disabled={saving}
          className="mt-6 w-full rounded-2xl bg-black px-4 py-4 font-bold text-white disabled:opacity-50"
        >
          {saving ? "جارٍ الحفظ..." : "حفظ إعدادات الغلاف"}
        </button>
      </div>

      {imageToDelete !== null && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 text-black shadow-2xl">
            <h3 className="text-xl font-black">حذف الصورة؟</h3>

            <p className="mt-3 text-sm text-black/60">
              سيتم حذف هذه الصورة من غلاف القائمة بعد حفظ إعدادات الغلاف.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setImageToDelete(null)}
                className="flex-1 rounded-2xl border border-black/15 px-4 py-3 font-bold"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={confirmDeleteImage}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function CoverTypePreview({ type, images, speed }) {
  const previewImages = images.length ? images : [null, null, null];

  const speedMap = {
    verySlow: "10s",
    slow: "7s",
    normal: "4s",
    fast: "2s",
  };

  const stackSpeedMap = {
    verySlow: "18s",
    slow: "14s",
    normal: "9s",
    fast: "5s",
  };

  const duration = speedMap[speed || "normal"] || "4s";
  const stackDuration = stackSpeedMap[speed || "normal"] || "9s";

  if (type === "single") {
    return previewImages[0] ? (
      <img src={previewImages[0]} className="h-full w-full object-cover" />
    ) : (
      <div className="flex h-full items-center justify-center text-sm text-black/40">
        صورة واحدة
      </div>
    );
  }

  if (type === "fade") {
    return (
      <div className="relative h-full w-full">
        {previewImages.slice(0, 3).map((image, index) =>
          image ? (
            <img
              key={`${image}-${index}`}
              src={image}
              className="absolute inset-0 h-full w-full object-cover opacity-0"
              style={{
                animationName: "cover-preview-fade",
                animationDuration: duration,
                animationIterationCount: "infinite",
                animationDelay: `${index * 0.8}s`,
              }}
            />
          ) : (
            <div
              key={index}
              className="absolute inset-0 h-full w-full bg-black/20 opacity-0"
              style={{
                animationName: "cover-preview-fade",
                animationDuration: duration,
                animationIterationCount: "infinite",
                animationDelay: `${index * 0.8}s`,
              }}
            />
          )
        )}
      </div>
    );
  }

  if (type === "carousel") {
    return (
      <div className="h-full w-full overflow-hidden">
        <div
          className="flex h-full"
          style={{
            animationName: "cover-preview-carousel",
            animationDuration: duration,
            animationIterationCount: "infinite",
          }}
        >
          {[...previewImages, ...previewImages]
            .slice(0, 6)
            .map((image, index) =>
              image ? (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  className="h-full min-w-full object-cover"
                />
              ) : (
                <div key={index} className="h-full min-w-full bg-black/20" />
              )
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <div
        className="flex h-full"
        style={{
          animationName: "cover-preview-stack",
          animationDuration: stackDuration,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}
      >
        {[...previewImages, ...previewImages].slice(0, 6).map((image, index) =>
          image ? (
            <img
              key={`${image}-${index}`}
              src={image}
              className="h-full min-w-[75%] object-cover shadow"
            />
          ) : (
            <div
              key={index}
              className="h-full min-w-[75%] bg-black/20"
            />
          )
        )}
      </div>
    </div>
  );
}