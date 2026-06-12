"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ImagePlus, Trash2 } from "lucide-react";

export default function SectionEditor({ section, menuId }) {
  const router = useRouter();
  const supabase = createClient();

  const [sectionName, setSectionName] = useState(section.name_ar || "");
  const [items, setItems] = useState(section.items || []);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  async function renameSection() {
    if (!sectionName.trim()) {
      setError("اسم القسم مطلوب.");
      return;
    }

    setActionLoading("rename-section");
    setError("");

    const { error } = await supabase
      .from("sections")
      .update({ name_ar: sectionName.trim() })
      .eq("id", section.id);

    setActionLoading("");

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  async function deleteSection() {
    const sure = confirm("هل تريد حذف هذا القسم وكل الأصناف داخله؟");
    if (!sure) return;

    setActionLoading("delete-section");
    setError("");

    const { error } = await supabase
      .from("sections")
      .delete()
      .eq("id", section.id);

    setActionLoading("");

    if (error) {
      setError(error.message);
      return;
    }

    router.push(`/admin/menus/${menuId}/sections`);
    router.refresh();
  }

  async function addItem() {
    setActionLoading("add-item");
    setError("");

    const { data, error } = await supabase
      .from("items")
      .insert({
        section_id: section.id,
        name_ar: "صنف جديد",
        description_ar: "",
        price: 0,
        is_available: true,
      })
      .select("*")
      .single();

    setActionLoading("");

    if (error) {
      setError(error.message);
      return;
    }

    setItems((current) => [...current, data]);
    router.refresh();
  }

  async function updateItem(itemId, updates) {
    setActionLoading(`update-item-${itemId}`);
    setError("");

    const { error } = await supabase
      .from("items")
      .update(updates)
      .eq("id", itemId);

    setActionLoading("");

    if (error) {
      setError(error.message);
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );

    router.refresh();
  }

  async function deleteItem(itemId) {
    const sure = confirm("هل تريد حذف هذا الصنف؟");
    if (!sure) return;

    setActionLoading(`delete-item-${itemId}`);
    setError("");

    const { error } = await supabase.from("items").delete().eq("id", itemId);

    setActionLoading("");

    if (error) {
      setError(error.message);
      return;
    }

    setItems((current) => current.filter((item) => item.id !== itemId));
    router.refresh();
  }

  async function uploadItemImage(itemId, file) {
    if (!file) return;

    setActionLoading(`upload-item-image-${itemId}`);
    setError("");

    const fileExt = file.name.split(".").pop();
    const filePath = `items/${menuId}/${itemId}-${Date.now()}.${fileExt}`;

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

    await updateItem(itemId, {
      image_url: null,
    });
  }

  return (
    <main dir="rtl" className="px-5 py-8">
      <section className="mx-auto max-w-6xl">
        <Link
          href={`/admin/menus/${menuId}/sections`}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-black/50 hover:bg-black/5"
        >
          الرجوع للأقسام <ChevronLeft size={18} />
        </Link>

        <div className="mt-6 rounded-3xl bg-white p-5">
          <p className="text-sm text-black/50">محرر القسم</p>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <input
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-transparent px-4 py-4 text-3xl font-bold outline-none focus:border-black"
            />

            <button
              onClick={renameSection}
              disabled={actionLoading === "rename-section"}
              className="rounded-2xl bg-black px-5 py-4 font-bold text-white disabled:opacity-50"
            >
              {actionLoading === "rename-section" ? "جارٍ الحفظ..." : "حفظ الاسم"}
            </button>

            <button
              onClick={deleteSection}
              disabled={actionLoading === "delete-section"}
              className="rounded-2xl bg-red-600 px-5 py-4 font-bold text-white disabled:opacity-50"
            >
              {actionLoading === "delete-section" ? "جارٍ الحذف..." : "حذف القسم"}
            </button>
          </div>

          <p className="mt-3 text-sm text-black/50">
            عدد الأصناف: {items.length}
          </p>
        </div>

        {error && (
          <p className="mt-6 rounded-2xl bg-red-500/10 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-black/50">الأصناف</p>
            <h2 className="mt-1 text-3xl font-bold">إدارة الأصناف</h2>
          </div>

          <button
            onClick={addItem}
            disabled={actionLoading === "add-item"}
            className="rounded-2xl bg-black px-5 py-3 font-bold text-white disabled:opacity-50"
          >
            {actionLoading === "add-item" ? "جارٍ الإضافة..." : "إضافة صنف"}
          </button>
        </div>

        <div className="mt-6 grid gap-5">
          {!items.length && (
            <p className="rounded-3xl bg-white p-6 text-black/50">
              لا توجد أصناف في هذا القسم.
            </p>
          )}

          {items.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 rounded-3xl bg-white p-4 md:grid-cols-[220px_1fr_150px]"
            >
              <div className="overflow-hidden rounded-2xl border border-black/10 bg-black/5">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name_ar || "صورة الصنف"}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center text-sm text-black/40">
                    لا توجد صورة
                  </div>
                )}

                <label className="flex cursor-pointer items-center justify-center gap-2 border-t border-black/10 px-3 py-3 text-center text-sm font-bold hover:bg-black/5">
                  <ImagePlus size={17} />

                  {actionLoading === `upload-item-image-${item.id}`
                    ? "جارٍ الرفع..."
                    : item.image_url
                      ? "تغيير الصورة"
                      : "إضافة صورة"}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={actionLoading === `upload-item-image-${item.id}`}
                    onChange={(e) => {
                      uploadItemImage(item.id, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>

                {item.image_url && (
                  <button
                    onClick={() => deleteItemImage(item.id)}
                    disabled={actionLoading === `update-item-${item.id}`}
                    className="flex w-full items-center justify-center gap-2 border-t border-black/10 bg-red-600 px-3 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    حذف الصورة
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <label className="block">
                  <p className="mb-1 text-sm font-bold text-black/60">
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
                    className="w-full rounded-2xl border border-black/10 bg-transparent px-4 py-4 outline-none focus:border-black"
                  />
                </label>

                <label className="block">
                  <p className="mb-1 text-sm font-bold text-black/60">
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
                    className="w-full resize-none rounded-2xl border border-black/10 bg-transparent px-4 py-4 outline-none focus:border-black"
                  />
                </label>

                <label className="block">
                  <p className="mb-1 text-sm font-bold text-black/60">
                    السعر
                  </p>

                  <input
                    defaultValue={item.price || ""}
                    onBlur={(e) =>
                      updateItem(item.id, {
                        price: e.target.value || 0,
                      })
                    }
                    placeholder="0"
                    type="number"
                    dir="ltr"
                    step="0.1"
                    className="w-full rounded-2xl border border-black/10 bg-transparent px-4 py-4 text-left outline-none focus:border-black"
                  />
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 px-4 py-4">
                  <input
                    type="checkbox"
                    defaultChecked={item.is_available}
                    onChange={(e) =>
                      updateItem(item.id, {
                        is_available: e.target.checked,
                      })
                    }
                  />

                  <span className="font-bold">الصنف متوفر</span>
                </label>

                {actionLoading === `update-item-${item.id}` && (
                  <p className="text-sm text-black/50">جارٍ الحفظ...</p>
                )}
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => deleteItem(item.id)}
                  disabled={actionLoading === `delete-item-${item.id}`}
                  className="w-full rounded-2xl bg-red-600 px-4 py-4 font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading === `delete-item-${item.id}`
                    ? "جارٍ الحذف..."
                    : "حذف الصنف"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}