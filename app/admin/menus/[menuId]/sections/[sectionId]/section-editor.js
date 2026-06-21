"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  ImagePlus,
  Trash2,
  Save,
  Plus,
  Copy,
  Loader2,
  Package,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Circle,
} from "lucide-react";

function normalizeItem(item) {
  return {
    ...item,
    name_ar: item.name_ar || "",
    description_ar: item.description_ar || "",
    price: item.price ?? "",
    image_url: item.image_url || "",
    is_available: item.is_available ?? true,
    image_file: null,
    image_preview: "",
    image_deleted: false,
  };
}

function isTempItem(item) {
  return String(item.id).startsWith("temp-");
}

function cleanItem(item) {
  return {
    id: item.id,
    name_ar: item.name_ar || "",
    description_ar: item.description_ar || "",
    price: Number(item.price) || 0,
    image_url: item.image_url || "",
    is_available: Boolean(item.is_available),
  };
}

function createTempItem() {
  return {
    id: `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name_ar: "صنف جديد",
    description_ar: "",
    price: 0,
    image_url: "",
    is_available: true,
    image_file: null,
    image_preview: "",
    image_deleted: false,
  };
}

export default function SectionEditor({ section, menu, menuId }) {
  const router = useRouter();
  const supabase = createClient();

  const [initialSectionName, setInitialSectionName] = useState(
    section.name_ar || ""
  );

  const [initialItems, setInitialItems] = useState(() =>
    (section.items || []).map(normalizeItem)
  );

  const [sectionName, setSectionName] = useState(section.name_ar || "");
  const [items, setItems] = useState(() =>
    (section.items || []).map(normalizeItem)
  );

  const [deletedItemIds, setDeletedItemIds] = useState([]);
  const [savingKey, setSavingKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const availableCount = useMemo(() => {
    return items.filter((item) => item.is_available).length;
  }, [items]);

  const unavailableCount = items.length - availableCount;

  const hasChanges = useMemo(() => {
    if (sectionName.trim() !== initialSectionName.trim()) return true;
    if (deletedItemIds.length > 0) return true;

    if (items.some((item) => isTempItem(item))) return true;

    for (const item of items) {
      const original = initialItems.find((oldItem) => oldItem.id === item.id);

      if (!original) return true;
      if (item.image_file) return true;
      if (item.image_deleted) return true;

      const currentClean = cleanItem(item);
      const originalClean = cleanItem(original);

      if (JSON.stringify(currentClean) !== JSON.stringify(originalClean)) {
        return true;
      }
    }

    return false;
  }, [sectionName, initialSectionName, items, initialItems, deletedItemIds]);

  function clearAlerts() {
    setMessage("");
    setError("");
  }

  function updateLocalItem(itemId, key, value) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, [key]: value } : item
      )
    );
  }

  function addItem() {
    clearAlerts();
    setItems((current) => [createTempItem(), ...current]);
  }

  function duplicateItem(item) {
    clearAlerts();

    const duplicatedItem = {
      ...createTempItem(),
      name_ar: `${item.name_ar || "صنف"} - نسخة`,
      description_ar: item.description_ar || "",
      price: item.price || 0,
      image_url: item.image_url || "",
      is_available: item.is_available,
    };

    setItems((current) => [duplicatedItem, ...current]);
  }

  function deleteItem(itemId) {
    const sure = confirm("هل تريد حذف هذا الصنف؟ لن يتم الحذف النهائي إلا بعد الحفظ.");
    if (!sure) return;

    clearAlerts();

    setItems((current) => current.filter((item) => item.id !== itemId));

    if (!String(itemId).startsWith("temp-")) {
      setDeletedItemIds((current) =>
        current.includes(itemId) ? current : [...current, itemId]
      );
    }
  }

  function selectItemImage(itemId, file) {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              image_file: file,
              image_preview: previewUrl,
              image_deleted: false,
            }
          : item
      )
    );

    clearAlerts();
  }

  function deleteItemImage(itemId) {
    const sure = confirm("هل تريد حذف صورة هذا الصنف؟ لن يتم الحذف النهائي إلا بعد الحفظ.");
    if (!sure) return;

    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              image_url: "",
              image_file: null,
              image_preview: "",
              image_deleted: true,
            }
          : item
      )
    );

    clearAlerts();
  }

  function discardChanges() {
    if (!hasChanges) return;

    const sure = confirm("هل تريد التراجع عن كل التغييرات غير المحفوظة؟");
    if (!sure) return;

    setSectionName(initialSectionName);
    setItems(initialItems.map(normalizeItem));
    setDeletedItemIds([]);
    setMessage("تم التراجع عن التغييرات.");
    setError("");
  }

  async function uploadImageForItem(realItemId, file) {
    const fileExt = file.name.split(".").pop();
    const filePath = `items/${menuId}/${section.id}/${realItemId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("menu-images").getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function saveAllChanges() {
    if (!sectionName.trim()) {
      setError("اسم القسم مطلوب.");
      return;
    }

    const itemWithoutName = items.find((item) => !item.name_ar.trim());

    if (itemWithoutName) {
      setError("في صنف بدون اسم. اكتب اسم الصنف قبل الحفظ.");
      return;
    }

    setSavingKey("save-all");
    clearAlerts();

    try {
      const { error: sectionError } = await supabase
        .from("sections")
        .update({
          name_ar: sectionName.trim(),
        })
        .eq("id", section.id)
        .eq("menu_id", menuId);

      if (sectionError) throw sectionError;

      if (deletedItemIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("items")
          .delete()
          .in("id", deletedItemIds)
          .eq("section_id", section.id);

        if (deleteError) throw deleteError;
      }

      const savedItems = [];

      for (const item of items) {
        let finalImageUrl = item.image_url || null;

        if (item.image_deleted) {
          finalImageUrl = null;
        }

        if (isTempItem(item)) {
          const { data: insertedItem, error: insertError } = await supabase
            .from("items")
            .insert({
              section_id: section.id,
              name_ar: item.name_ar.trim(),
              description_ar: item.description_ar.trim(),
              price: Number(item.price) || 0,
              image_url: finalImageUrl,
              is_available: Boolean(item.is_available),
            })
            .select("*")
            .single();

          if (insertError) throw insertError;

          let savedItem = insertedItem;

          if (item.image_file) {
            const uploadedUrl = await uploadImageForItem(
              insertedItem.id,
              item.image_file
            );

            const { data: updatedItem, error: imageUpdateError } =
              await supabase
                .from("items")
                .update({
                  image_url: uploadedUrl,
                })
                .eq("id", insertedItem.id)
                .eq("section_id", section.id)
                .select("*")
                .single();

            if (imageUpdateError) throw imageUpdateError;

            savedItem = updatedItem;
          }

          savedItems.push(normalizeItem(savedItem));
        } else {
          if (item.image_file) {
            finalImageUrl = await uploadImageForItem(item.id, item.image_file);
          }

          const { data: updatedItem, error: updateError } = await supabase
            .from("items")
            .update({
              name_ar: item.name_ar.trim(),
              description_ar: item.description_ar.trim(),
              price: Number(item.price) || 0,
              image_url: finalImageUrl,
              is_available: Boolean(item.is_available),
            })
            .eq("id", item.id)
            .eq("section_id", section.id)
            .select("*")
            .single();

          if (updateError) throw updateError;

          savedItems.push(normalizeItem(updatedItem));
        }
      }

      setInitialSectionName(sectionName.trim());
      setInitialItems(savedItems);
      setItems(savedItems);
      setDeletedItemIds([]);

      setMessage("تم حفظ كل التغييرات.");
      router.refresh();
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء الحفظ.");
    }

    setSavingKey("");
  }

  async function deleteSection() {
    const sure = confirm(
      "هل أنت متأكد؟ سيتم حذف هذا القسم وكل الأصناف الموجودة داخله."
    );

    if (!sure) return;

    setSavingKey("delete-section");
    clearAlerts();

    const { error } = await supabase
      .from("sections")
      .delete()
      .eq("id", section.id)
      .eq("menu_id", menuId);

    setSavingKey("");

    if (error) {
      setError(error.message);
      return;
    }

    router.push(`/admin/menus/${menuId}/sections`);
    router.refresh();
  }

  return (
    <main dir="rtl" className="min-h-screen px-5 py-8 pb-36 text-white">
      <section className="mx-auto max-w-6xl">
        <Link
          href={`/admin/menus/${menuId}/sections`}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowRight size={18} />
          الرجوع للأقسام
        </Link>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_320px]">
          <section className="rounded-xl border border-white/10 bg-[#0f0f0f] p-6 shadow-2xl shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-white/45">محرر القسم</p>

                <h1 className="mt-2 text-5xl font-bold text-white">
                  {sectionName || "قسم بدون اسم"}
                </h1>

                <p className="mt-3 text-white/45">
                  قائمة: {menu?.name || "القائمة"}
                </p>
              </div>

              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${
                  hasChanges
                    ? "bg-yellow-500/15 text-yellow-300"
                    : "bg-green-500/15 text-green-300"
                }`}
              >
                <Circle size={9} fill="currentColor" />
                {hasChanges ? "تغييرات غير محفوظة" : "كل شيء محفوظ"}
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="اسم القسم"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-2xl font-bold text-white outline-none transition placeholder:text-white/25 focus:border-white/40 focus:bg-white/[0.07]"
              />

              <button
                type="button"
                onClick={deleteSection}
                disabled={savingKey === "delete-section"}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-4 font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingKey === "delete-section" ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Trash2 size={18} />
                )}
                حذف القسم
              </button>
            </div>
          </section>

          <section className="grid gap-3">
            <StatCard
              icon={<Package size={20} />}
              label="عدد الأصناف"
              value={items.length}
            />

            <StatCard
              icon={<CheckCircle2 size={20} />}
              label="متوفر"
              value={availableCount}
            />

            <StatCard
              icon={<AlertCircle size={20} />}
              label="غير متوفر"
              value={unavailableCount}
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

        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/45">الأصناف</p>

            <h2 className="mt-1 text-4xl font-bold text-white">
              إدارة أصناف القسم
            </h2>

            <p className="mt-2 text-white/45">
              عدّل كل الأصناف بحرية، ثم احفظ كل التغييرات مرة واحدة من الشريط السفلي.
            </p>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-extrabold text-black transition hover:bg-white/90"
          >
            <Plus size={18} />
            إضافة صنف
          </button>
        </div>

        {!items.length && (
          <section className="mt-6 rounded-xl border border-white/10 bg-[#0f0f0f] p-10 text-center">
            <Package className="mx-auto text-white/25" size={42} />

            <h3 className="mt-4 text-2xl font-bold text-white">
              لا توجد أصناف بعد
            </h3>

            <p className="mt-2 text-white/45">
              ابدأ بإضافة أول صنف داخل هذا القسم.
            </p>

            <button
              type="button"
              onClick={addItem}
              className="mx-auto mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-extrabold text-black transition hover:bg-white/90"
            >
              <Plus size={18} />
              إضافة صنف
            </button>
          </section>
        )}

        <div className="mt-8 grid gap-8">
          {items.map((item, index) => {
            const displayImage = item.image_preview || item.image_url;
            const isNew = isTempItem(item);

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-2xl shadow-black/20"
              >
                <div className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.03] p-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-black text-black">
                      {index + 1}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-2xl font-bold text-white">
                          {item.name_ar || "صنف بدون اسم"}
                        </h3>

                        {isNew && (
                          <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-300">
                            جديد
                          </span>
                        )}

                        {item.image_file && (
                          <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-bold text-yellow-300">
                            صورة جديدة
                          </span>
                        )}
                      </div>

                      <p className="hidden mt-1 text-sm text-white/40">
                        هذا البلوك خاص بهذا الصنف فقط.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2">
<button
  type="button"
  onClick={() =>
    updateLocalItem(item.id, "is_available", !item.is_available)
  }
  className={`group flex min-w-[180px] cursor-pointer items-center justify-between gap-3 rounded-xl border p-2 text-right transition ${
    item.is_available
      ? "border-green-400/20 bg-green-500/10 hover:bg-green-500/20"
      : "border-red-400/20 bg-red-500/10 hover:bg-red-500/20"
  }`}
>
  <div>
    <p className="text-xs font-bold text-white/45">حالة الصنف</p>

    <p
      className={`mt-1 text-sm font-extrabold ${
        item.is_available ? "text-green-300" : "text-red-300"
      }`}
    >
      {item.is_available ? "متوفر حالياً" : "غير متوفر حالياً"}
    </p>

    <p className="mt-1 text-[11px] hidden text-white/35">
      اضغط لتغيير الحالة
    </p>
  </div>

  <span
    className={`relative flex h-7 w-12 shrink-0 items-center rounded-full transition ${
      item.is_available ? "bg-green-400/80" : "bg-red-400/80"
    }`}
  >
    <span
      className={`absolute h-5 w-5 rounded-full bg-white transition ${
        item.is_available ? "right-6" : "right-1"
      }`}
    />
  </span>
</button>

                    <button
                      type="button"
                      onClick={() => duplicateItem(item)}
                      className="inline-flex items-center cursor-pointer justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
                    >
                      <Copy size={16} />
                      نسخ
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-red-700"
                    >
                      <Trash2 size={16} />
                      حذف
                    </button>
                  </div>
                </div>

                <div className="grid gap-6 p-5 lg:grid-cols-[320px_1fr]">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt={item.name_ar || "صورة الصنف"}
                          className="h-72 w-full pointer-events-none object-cover"
                        />
                      ) : (
                        <div className="flex h-72 items-center justify-center text-sm text-white/35">
                          لا توجد صورة
                        </div>
                      )}
                    </div>

                    <div className="mt-3 grid gap-2">
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center text-sm font-bold text-white/80 transition hover:bg-white/10 hover:text-white">
                        <ImagePlus size={17} />
                        {displayImage ? "تغيير صورة هذا الصنف" : "إضافة صورة لهذا الصنف"}

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            selectItemImage(item.id, e.target.files?.[0]);
                            e.target.value = "";
                          }}
                        />
                      </label>

                      {displayImage && (
                        <button
                          type="button"
                          onClick={() => deleteItemImage(item.id)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-4 text-sm font-bold text-white transition hover:bg-red-700"
                        >
                          <Trash2 size={16} />
                          حذف صورة هذا الصنف
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <Field label="اسم الصنف">
                      <input
                        value={item.name_ar}
                        onChange={(e) =>
                          updateLocalItem(item.id, "name_ar", e.target.value)
                        }
                        placeholder="مثال: برغر كلاسيك"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-white/40 focus:bg-white/[0.07]"
                      />
                    </Field>

                    <Field label="وصف الصنف">
                      <textarea
                        value={item.description_ar}
                        onChange={(e) =>
                          updateLocalItem(
                            item.id,
                            "description_ar",
                            e.target.value
                          )
                        }
                        placeholder="اكتب وصفاً قصيراً للصنف..."
                        rows={2}
                        className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-white/40 focus:bg-white/[0.07]"
                      />
                    </Field>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="السعر">
                        <div className="relative">
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70">
                            ₪
                          </span>
                          <input
                            value={item.price}
                            onChange={(e) =>
                              updateLocalItem(item.id, "price", e.target.value)
                            }
                            placeholder="0"
                            type="number"
                            dir="rtl"
                            step="0.1"
                            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 pr-10 text-right text-white outline-none transition placeholder:text-white/25 focus:border-white/40 focus:bg-white/[0.07]"
                          />

                          
                        </div>
                      </Field>

                      <label className="hidden flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]">
                        <div>
                          <p className="font-bold text-white">حالة التوفر</p>
                          <p className="mt-1 text-xs text-white/40">
                            يظهر للزبائن كمتوفر أو غير متوفر.
                          </p>
                        </div>

                        <input
                          type="checkbox"
                          checked={item.is_available}
                          onChange={(e) =>
                            updateLocalItem(
                              item.id,
                              "is_available",
                              e.target.checked
                            )
                          }
                          className="h-5 w-5 accent-white"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
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
                الحفظ سيطبّق اسم القسم وكل تعديلات الأصناف والصور مرة واحدة.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 md:flex">
              <button
                type="button"
                onClick={discardChanges}
                disabled={!hasChanges || savingKey === "save-all"}
                className="inline-flex items-center justify-center text-sm gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-extrabold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw size={18} />
                تراجع
              </button>

              <button
                type="button"
                onClick={saveAllChanges}
                disabled={!hasChanges || savingKey === "save-all"}
                className="inline-flex items-center justify-center text-sm gap-2 rounded-xl bg-white px-3 py-2 font-extrabold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {savingKey === "save-all" ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {savingKey === "save-all" ? "جارٍ الحفظ..." : "حفظ كل التغييرات"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-bold text-white/45">{label}</p>
      {children}
    </label>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-5 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between gap-3 text-white/45">
        <span>{label}</span>
        {icon}
      </div>

      <p className="mt-3 text-4xl font-bold text-white">{value}</p>
    </div>
  );
}