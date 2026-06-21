"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  Plus,
  Loader2,
  FolderOpen,
  Package,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Save,
  AlertCircle,
} from "lucide-react";

function normalizeSection(section) {
  return {
    ...section,
    name_ar: section.name_ar || "",
    items: section.items || [],
    sort_order: section.sort_order || 0,
  };
}

export default function SectionsManager({ menu, initialSections }) {
  const router = useRouter();
  const supabase = createClient();

  const [sections, setSections] = useState(() =>
    (initialSections || []).map(normalizeSection)
  );

  const [newSectionName, setNewSectionName] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editingName, setEditingName] = useState("");
  const [savingKey, setSavingKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totalItems = useMemo(() => {
    return sections.reduce(
      (total, section) => total + (section.items || []).length,
      0
    );
  }, [sections]);

  const emptySections = useMemo(() => {
    return sections.filter((section) => !section.items?.length).length;
  }, [sections]);

  function clearAlerts() {
    setMessage("");
    setError("");
  }

  async function addSection() {
    const name = newSectionName.trim();

    if (!name) {
      setError("اكتب اسم القسم أولاً.");
      return;
    }

    setSavingKey("add-section");
    clearAlerts();

    const nextSortOrder =
      sections.length > 0
        ? Math.max(...sections.map((section) => section.sort_order || 0)) + 1
        : 1;

    const { data, error } = await supabase
      .from("sections")
      .insert({
        menu_id: menu.id,
        name_ar: name,
        sort_order: nextSortOrder,
      })
      .select("*, items(id)")
      .single();

    setSavingKey("");

    if (error) {
      setError(error.message);
      return;
    }

    setSections((current) => [...current, normalizeSection(data)]);
    setNewSectionName("");
    setMessage("تمت إضافة القسم.");
    router.refresh();
  }

  function startEditing(section) {
    setEditingId(section.id);
    setEditingName(section.name_ar || "");
    clearAlerts();
  }

  function cancelEditing() {
    setEditingId("");
    setEditingName("");
  }

  async function saveSectionName(sectionId) {
    const name = editingName.trim();

    if (!name) {
      setError("اسم القسم مطلوب.");
      return;
    }

    setSavingKey(`rename-${sectionId}`);
    clearAlerts();

    const { error } = await supabase
      .from("sections")
      .update({
        name_ar: name,
      })
      .eq("id", sectionId)
      .eq("menu_id", menu.id);

    setSavingKey("");

    if (error) {
      setError(error.message);
      return;
    }

    setSections((current) =>
      current.map((section) =>
        section.id === sectionId ? { ...section, name_ar: name } : section
      )
    );

    setEditingId("");
    setEditingName("");
    setMessage("تم تعديل اسم القسم.");
    router.refresh();
  }

  async function deleteSection(sectionId) {
    const sure = confirm(
      "هل تريد حذف هذا القسم؟ سيتم حذف كل الأصناف الموجودة داخله أيضاً."
    );

    if (!sure) return;

    setSavingKey(`delete-${sectionId}`);
    clearAlerts();

    const { error } = await supabase
      .from("sections")
      .delete()
      .eq("id", sectionId)
      .eq("menu_id", menu.id);

    setSavingKey("");

    if (error) {
      setError(error.message);
      return;
    }

    setSections((current) =>
      current.filter((section) => section.id !== sectionId)
    );

    setMessage("تم حذف القسم.");
    router.refresh();
  }

  async function moveSection(index, direction) {
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];

    const currentSection = updated[index];
    const targetSection = updated[targetIndex];

    updated[index] = targetSection;
    updated[targetIndex] = currentSection;

    const reordered = updated.map((section, sectionIndex) => ({
      ...section,
      sort_order: sectionIndex + 1,
    }));

    setSections(reordered);

    setSavingKey(`move-${currentSection.id}`);
    clearAlerts();

    const updates = [
      supabase
        .from("sections")
        .update({ sort_order: reordered[index].sort_order })
        .eq("id", reordered[index].id)
        .eq("menu_id", menu.id),

      supabase
        .from("sections")
        .update({ sort_order: reordered[targetIndex].sort_order })
        .eq("id", reordered[targetIndex].id)
        .eq("menu_id", menu.id),
    ];

    const results = await Promise.all(updates);

    setSavingKey("");

    const failed = results.find((result) => result.error);

    if (failed?.error) {
      setError(failed.error.message);
      router.refresh();
      return;
    }

    setMessage("تم تحديث ترتيب الأقسام.");
    router.refresh();
  }

  return (
    <main dir="rtl" className="min-h-screen px-5 py-8 text-white">
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
            <p className="text-sm text-white/45">الأقسام</p>

            <h1 className="mt-2 text-5xl font-bold text-white">
              إدارة أقسام {menu.name}
            </h1>

            <p className="mt-3 max-w-2xl text-white/45">
              أضف الأقسام، عدّل أسماءها، غيّر ترتيبها، وافتح كل قسم لإدارة الأصناف داخله.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSection();
                }}
                placeholder="مثال: المشروبات، الوجبات، الحلويات..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-white/40 focus:bg-white/[0.07]"
              />

              <button
                type="button"
                onClick={addSection}
                disabled={savingKey === "add-section"}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-extrabold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingKey === "add-section" ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Plus size={18} />
                )}
                إضافة قسم
              </button>
            </div>
          </section>

          <section className="grid gap-3">
            <StatCard
              icon={<FolderOpen size={20} />}
              label="عدد الأقسام"
              value={sections.length}
            />

            <StatCard
              icon={<Package size={20} />}
              label="عدد الأصناف"
              value={totalItems}
            />

            <StatCard
              icon={<AlertCircle size={20} />}
              label="أقسام فارغة"
              value={emptySections}
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

        <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/45">قائمة الأقسام</p>
            <h2 className="mt-1 text-4xl font-bold text-white">
              كل الأقسام
            </h2>
            <p className="mt-2 text-white/45">
              اضغط على “إدارة الأصناف” للدخول إلى صفحة القسم.
            </p>
          </div>
        </div>

        {!sections.length && (
          <section className="mt-6 rounded-xl border border-white/10 bg-[#0f0f0f] p-10 text-center">
            <FolderOpen className="mx-auto text-white/25" size={48} />

            <h3 className="mt-4 text-2xl font-bold text-white">
              لا توجد أقسام بعد
            </h3>

            <p className="mt-2 text-white/45">
              ابدأ بإضافة أول قسم في القائمة، ثم أضف الأصناف داخله.
            </p>
          </section>
        )}

        <div className="mt-6 grid gap-5">
          {sections.map((section, index) => {
            const isEditing = editingId === section.id;
            const isRenaming = savingKey === `rename-${section.id}`;
            const isDeleting = savingKey === `delete-${section.id}`;
            const isMoving = savingKey === `move-${section.id}`;
            const itemCount = (section.items || []).length;

            return (
              <article
                key={section.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-xl shadow-black/10"
              >
                <div className="grid gap-5 p-5 lg:grid-cols-[80px_1fr_260px] lg:items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-black text-black">
                    {index + 1}
                  </div>

                  <div>
                    {isEditing ? (
                      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-2xl font-bold text-white outline-none transition placeholder:text-white/25 focus:border-white/40 focus:bg-white/[0.07]"
                        />

                        <button
                          type="button"
                          onClick={() => saveSectionName(section.id)}
                          disabled={isRenaming}
                          className="inline-flex items-center cursor-pointer justify-center gap-2 rounded-xl bg-white px-5 py-4 font-extrabold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isRenaming ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <Save size={18} />
                          )}
                          حفظ
                        </button>

                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="rounded-xl cursor-pointer border border-white/10 bg-white/[0.04] px-5 py-4 font-extrabold text-white transition hover:bg-white/10"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-3xl font-bold text-white">
                          {section.name_ar || "قسم بدون اسم"}
                        </h3>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs font-bold text-white/45">
                            {itemCount} أصناف
                          </span>

                          {itemCount === 0 && (
                            <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-bold text-yellow-300">
                              قسم فارغ
                            </span>
                          )}

                          <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs font-bold text-white/35">
                            الترتيب: {section.sort_order || index + 1}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Link
                      href={`/admin/menus/${menu.id}/sections/${section.id}`}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-4 font-extrabold text-black transition hover:bg-white/90"
                    >
                      <ExternalLink size={17} />
                      إدارة الأصناف
                    </Link>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => moveSection(index, "up")}
                        disabled={index === 0 || isMoving}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        {isMoving ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <ArrowUp size={16} />
                        )}
                        أعلى
                      </button>

                      <button
                        type="button"
                        onClick={() => moveSection(index, "down")}
                        disabled={index === sections.length - 1 || isMoving}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        {isMoving ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <ArrowDown size={16} />
                        )}
                        أسفل
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(section)}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                      >
                        <Pencil size={16} />
                        تعديل
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteSection(section.id)}
                        disabled={isDeleting}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
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