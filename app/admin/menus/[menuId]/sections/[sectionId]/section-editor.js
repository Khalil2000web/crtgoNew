"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Copy,
  ImageIcon,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { revalidatePublicMenu } from "@/lib/revalidate-public-menu";

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
  const newItemsCount = items.filter((item) => isTempItem(item)).length;
  const publicPath = menu.subdomain ? `/m/${menu.subdomain}` : null;

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
    clearAlerts();

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
    const sure = confirm(
      "هل تريد حذف هذا الصنف؟ لن يتم الحذف النهائي إلا بعد الحفظ."
    );

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
    const sure = confirm(
      "هل تريد حذف صورة هذا الصنف؟ لن يتم الحذف النهائي إلا بعد الحفظ."
    );

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

      await revalidatePublicMenu(menuId);

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

    const { error: deleteError } = await supabase
      .from("sections")
      .delete()
      .eq("id", section.id)
      .eq("menu_id", menuId);

    setSavingKey("");

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await revalidatePublicMenu(menuId);

    router.push(`/admin/menus/${menuId}/sections`);
    router.refresh();
  }

  return (
    <main dir="rtl" className="min-h-screen px-4 pb-32 pt-4 sm:px-5 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                href={`/admin/menus/${menuId}/sections`}
                className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-2 text-xs font-black text-[#1b1712]/65 transition hover:bg-[#d1c5b4] hover:text-[#1b1712] active:scale-[0.98]"
              >
                <ArrowRight size={15} />
                الرجوع للأقسام
              </Link>

              <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Section Editor
              </p>

              <h1 className="mt-1 text-2xl font-black text-[#1b1712] sm:text-3xl">
                {sectionName || "قسم بدون اسم"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1b1712]/58">
                عدّل اسم القسم، الأصناف، الأسعار، الصور، وحالة التوفر. الحفظ يتم مرة واحدة من الشريط السفلي.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <SaveBadge hasChanges={hasChanges} />

              {publicPath && (
                <span
                  dir="ltr"
                  className="inline-flex items-center gap-2 rounded-full border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-1.5 text-xs font-black text-[#1b1712]/60"
                >
                  {publicPath}
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

        <section className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricBox
            icon={<Package size={18} />}
            label="الأصناف"
            value={items.length}
            hint="داخل هذا القسم"
          />

          <MetricBox
            icon={<CheckCircle2 size={18} />}
            label="متوفر"
            value={availableCount}
            hint="ظاهر للزبائن"
          />

          <MetricBox
            icon={<AlertCircle size={18} />}
            label="غير متوفر"
            value={unavailableCount}
            hint="يبقى محفوظ"
            alert={unavailableCount > 0}
          />

          <MetricBox
            icon={<Circle size={18} />}
            label="جديد"
            value={newItemsCount}
            hint="لم يتم حفظه بعد"
            alert={newItemsCount > 0}
          />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="grid gap-5">
            <Panel
              eyebrow="Section"
              title="معلومات القسم"
              description={`القائمة: ${menu?.name || "القائمة"}`}
            >
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-[#1b1712]/60">
                    اسم القسم
                  </span>

                  <input
                    value={sectionName}
                    onChange={(e) => {
                      clearAlerts();
                      setSectionName(e.target.value);
                    }}
                    placeholder="اسم القسم"
                    className="min-h-11 w-full rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] px-3 py-2.5 text-sm font-black text-[#1b1712] outline-none transition placeholder:text-[#1b1712]/30 focus:border-[#1b1712]"
                  />
                </label>

                <button
                  type="button"
                  onClick={deleteSection}
                  disabled={savingKey === "delete-section"}
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 self-end rounded-xl bg-red-700 px-4 py-3 text-sm font-black text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingKey === "delete-section" ? (
                    <Loader2 className="animate-spin" size={17} />
                  ) : (
                    <Trash2 size={17} />
                  )}
                  حذف القسم
                </button>
              </div>
            </Panel>

            <Panel
              eyebrow="Items"
              title="أصناف القسم"
              description="أضف أو عدّل الأصناف. الصور والتغييرات لا تُحفظ إلا بعد الضغط على حفظ كل التغييرات."
              action={
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] px-4 py-2.5 text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] active:scale-[0.98]"
                >
                  <Plus size={17} />
                  إضافة صنف
                </button>
              }
            >
              {!items.length ? (
                <EmptyItems onAdd={addItem} />
              ) : (
                <div className="grid gap-3">
                  {items.map((item, index) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      index={index}
                      onUpdate={updateLocalItem}
                      onDuplicate={() => duplicateItem(item)}
                      onDelete={() => deleteItem(item.id)}
                      onSelectImage={(file) => selectItemImage(item.id, file)}
                      onDeleteImage={() => deleteItemImage(item.id)}
                    />
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-24 lg:h-fit">
            <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Summary
              </p>

              <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                ملخص القسم
              </h2>

              <div className="mt-4 grid gap-2">
                <SummaryRow label="الأصناف" value={items.length} />
                <SummaryRow label="متوفر" value={availableCount} />
                <SummaryRow label="غير متوفر" value={unavailableCount} />
                <SummaryRow label="جديد" value={newItemsCount} />
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
                الحفظ سيطبّق اسم القسم، الأصناف، الصور، والأسعار مرة واحدة.
              </p>
            </section>

            <section className="rounded-2xl border border-yellow-900/25 bg-yellow-700/15 p-4">
              <div className="flex gap-3">
                <TriangleAlert
                  size={19}
                  className="mt-1 shrink-0 text-yellow-950"
                />

                <div>
                  <h2 className="text-base font-black text-yellow-950">
                    انتبه قبل الخروج
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-yellow-950/70">
                    أي صنف جديد أو صورة جديدة لن تُحفظ إلا بعد الضغط على حفظ كل التغييرات.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </section>
      </section>

      <SaveBar
        hasChanges={hasChanges}
        saving={savingKey === "save-all"}
        onDiscard={discardChanges}
        onSave={saveAllChanges}
      />
    </main>
  );
}

function ItemCard({
  item,
  index,
  onUpdate,
  onDuplicate,
  onDelete,
  onSelectImage,
  onDeleteImage,
}) {
  const displayImage = item.image_preview || item.image_url;
  const isNew = isTempItem(item);

  return (
    <article className="overflow-hidden rounded-2xl border border-[#8f806c]/55 bg-[#ded4c5] shadow-sm shadow-black/5">
      <div className="border-b border-[#8f806c]/45 bg-[#d1c5b4] p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1b1712] text-sm font-black text-[#efe7da]">
              {index + 1}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-black text-[#1b1712]">
                  {item.name_ar || "صنف بدون اسم"}
                </h3>

                {isNew && <InfoBadge>جديد</InfoBadge>}
                {item.image_file && <WarningBadge>صورة جديدة</WarningBadge>}

                {item.is_available ? (
                  <SuccessBadge>متوفر</SuccessBadge>
                ) : (
                  <DangerBadge>غير متوفر</DangerBadge>
                )}
              </div>

              <p className="mt-1 text-xs font-bold text-[#1b1712]/45">
                {item.price || 0} ₪
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:flex">
            <AvailabilityButton
              available={item.is_available}
              onClick={() =>
                onUpdate(item.id, "is_available", !item.is_available)
              }
            />

            <button
              type="button"
              onClick={onDuplicate}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-2 text-sm font-black text-[#1b1712]/65 transition hover:bg-[#cfc3b2] active:scale-[0.98]"
            >
              <Copy size={15} />
              نسخ
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-700 px-3 py-2 text-sm font-black text-white transition hover:bg-red-800 active:scale-[0.98]"
            >
              <Trash2 size={15} />
              حذف
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 lg:grid-cols-[230px_minmax(0,1fr)]">
        <div className="rounded-xl border border-[#8f806c]/50 bg-[#d1c5b4] p-2">
          <div className="overflow-hidden rounded-xl border border-[#8f806c]/45 bg-[#cfc3b2]">
            {displayImage ? (
              <img
                src={displayImage}
                alt={item.name_ar || "صورة الصنف"}
                className="pointer-events-none h-52 w-full object-cover lg:h-56"
              />
            ) : (
              <div className="flex h-52 items-center justify-center text-[#1b1712]/35 lg:h-56">
                <div className="text-center">
                  <ImageIcon className="mx-auto" size={34} />
                  <p className="mt-2 text-sm font-bold">لا توجد صورة</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 grid gap-2">
            <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] px-3 py-2 text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] active:scale-[0.98]">
              <ImagePlus size={15} />
              {displayImage ? "تغيير الصورة" : "إضافة صورة"}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  onSelectImage(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>

            {displayImage && (
              <button
                type="button"
                onClick={onDeleteImage}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-900/25 bg-red-700/15 px-3 py-2 text-sm font-black text-red-950 transition hover:bg-red-700/25 active:scale-[0.98]"
              >
                <Trash2 size={15} />
                حذف الصورة
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-3">
          <Field label="اسم الصنف">
            <input
              value={item.name_ar}
              onChange={(e) => onUpdate(item.id, "name_ar", e.target.value)}
              placeholder="مثال: برغر كلاسيك"
              className="min-h-11 w-full rounded-xl border border-[#8f806c]/50 bg-[#d1c5b4] px-3 py-2.5 text-sm font-bold text-[#1b1712] outline-none transition placeholder:text-[#1b1712]/30 focus:border-[#1b1712]"
            />
          </Field>

          <Field label="وصف الصنف">
            <textarea
              value={item.description_ar}
              onChange={(e) =>
                onUpdate(item.id, "description_ar", e.target.value)
              }
              placeholder="اكتب وصفاً قصيراً للصنف..."
              rows={3}
              className="resize-none rounded-xl border border-[#8f806c]/50 bg-[#d1c5b4] px-3 py-2.5 text-sm font-bold leading-6 text-[#1b1712] outline-none transition placeholder:text-[#1b1712]/30 focus:border-[#1b1712]"
            />
          </Field>

          <Field label="السعر">
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-[#1b1712]/50">
                ₪
              </span>

              <input
                value={item.price}
                onChange={(e) => onUpdate(item.id, "price", e.target.value)}
                placeholder="0"
                type="number"
                dir="rtl"
                step="0.1"
                className="min-h-11 w-full rounded-xl border border-[#8f806c]/50 bg-[#d1c5b4] px-3 py-2.5 pr-9 text-right text-sm font-bold text-[#1b1712] outline-none transition placeholder:text-[#1b1712]/30 focus:border-[#1b1712]"
              />
            </div>
          </Field>
        </div>
      </div>
    </article>
  );
}

function AvailabilityButton({ available, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-black transition active:scale-[0.98] ${
        available
          ? "border-green-900/25 bg-green-800/12 text-green-950 hover:bg-green-800/20"
          : "border-red-900/25 bg-red-700/12 text-red-950 hover:bg-red-700/20"
      }`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          available ? "bg-green-950" : "bg-red-950"
        }`}
      />
      {available ? "متوفر" : "مغلق"}
    </button>
  );
}

function Panel({ eyebrow, title, description, action, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] shadow-sm shadow-black/5">
      <div className="flex flex-col gap-3 border-b border-[#8f806c]/45 bg-[#d1c5b4] px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
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

        {action}
      </div>

      <div className="p-3">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2">
      <p className="text-sm font-black text-[#1b1712]/60">{label}</p>
      {children}
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

function EmptyItems({ onAdd }) {
  return (
    <div className="rounded-xl border border-dashed border-[#8f806c]/65 bg-[#ded4c5] p-6 text-center">
      <Package className="mx-auto text-[#1b1712]/30" size={34} />

      <h3 className="mt-3 text-lg font-black text-[#1b1712]">
        لا توجد أصناف بعد
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#1b1712]/55">
        أضف أول صنف داخل هذا القسم، ثم اكتب السعر والوصف وارفع صورة إذا موجودة.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mx-auto mt-4 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] px-4 py-2.5 text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] active:scale-[0.98]"
      >
        <Plus size={16} />
        إضافة صنف
      </button>
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

function InfoBadge({ children }) {
  return (
    <span className="rounded-full border border-blue-900/25 bg-blue-700/12 px-2.5 py-1 text-xs font-black text-blue-950">
      {children}
    </span>
  );
}

function WarningBadge({ children }) {
  return (
    <span className="rounded-full border border-yellow-900/25 bg-yellow-700/15 px-2.5 py-1 text-xs font-black text-yellow-950">
      {children}
    </span>
  );
}

function SuccessBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-900/25 bg-green-800/12 px-2.5 py-1 text-xs font-black text-green-950">
      <CheckCircle2 size={12} />
      {children}
    </span>
  );
}

function DangerBadge({ children }) {
  return (
    <span className="rounded-full border border-red-900/25 bg-red-700/12 px-2.5 py-1 text-xs font-black text-red-950">
      {children}
    </span>
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
    <div className="fixed bottom-24 left-4 right-4 z-[80]">
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
              الحفظ سيطبّق اسم القسم وكل تعديلات الأصناف والصور مرة واحدة.
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

              {saving ? "جارٍ الحفظ..." : "حفظ كل التغييرات"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}