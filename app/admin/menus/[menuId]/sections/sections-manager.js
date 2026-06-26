"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  CirclePlus,
  ExternalLink,
  FolderOpen,
  Loader2,
  Package,
  Pencil,
  Plus,
  Save,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { revalidatePublicMenu } from "@/lib/revalidate-public-menu";

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
    return sections.reduce((total, section) => {
      return total + (section.items || []).length;
    }, 0);
  }, [sections]);

  const emptySections = useMemo(() => {
    return sections.filter((section) => !section.items?.length).length;
  }, [sections]);

  const publicPath = menu.subdomain ? `m.crtgo.com/${menu.subdomain}` : null;

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

    const { data, error: insertError } = await supabase
      .from("sections")
      .insert({
        menu_id: menu.id,
        name_ar: name,
        sort_order: nextSortOrder,
      })
      .select("*, items(id)")
      .single();

    setSavingKey("");

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSections((current) => [...current, normalizeSection(data)]);
    setNewSectionName("");

    await revalidatePublicMenu(menu.id);

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

    const { error: updateError } = await supabase
      .from("sections")
      .update({
        name_ar: name,
      })
      .eq("id", sectionId)
      .eq("menu_id", menu.id);

    setSavingKey("");

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSections((current) =>
      current.map((section) =>
        section.id === sectionId ? { ...section, name_ar: name } : section
      )
    );

    setEditingId("");
    setEditingName("");

    await revalidatePublicMenu(menu.id);

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

    const { error: deleteError } = await supabase
      .from("sections")
      .delete()
      .eq("id", sectionId)
      .eq("menu_id", menu.id);

    setSavingKey("");

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setSections((current) =>
      current.filter((section) => section.id !== sectionId)
    );

    await revalidatePublicMenu(menu.id);

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

    await revalidatePublicMenu(menu.id);

    setMessage("تم تحديث ترتيب الأقسام.");
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
                Menu Sections
              </p>

              <h1 className="mt-1 text-2xl font-black text-[#1b1712] sm:text-3xl">
                أقسام القائمة
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1b1712]/58">
                أضف الأقسام، عدّل أسماءها، رتّب ظهورها، وافتح كل قسم لإدارة الأصناف داخله.
              </p>
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
            icon={<FolderOpen size={18} />}
            label="الأقسام"
            value={sections.length}
            hint="داخل هذه القائمة"
          />

          <MetricBox
            icon={<Package size={18} />}
            label="الأصناف"
            value={totalItems}
            hint="داخل كل الأقسام"
          />

          <MetricBox
            icon={<AlertCircle size={18} />}
            label="أقسام فارغة"
            value={emptySections}
            hint="تحتاج أصناف"
            alert={emptySections > 0}
          />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="grid gap-5">
            <section className="overflow-hidden rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] shadow-sm shadow-black/5">
              <div className="border-b border-[#8f806c]/45 bg-[#d1c5b4] px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                  Add section
                </p>

                <h2 className="mt-0.5 text-lg font-black text-[#1b1712]">
                  إضافة قسم جديد
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#1b1712]/52">
                  مثال: المشروبات، الوجبات، الحلويات، الفطور.
                </p>
              </div>

              <div className="p-3">
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <input
                    value={newSectionName}
                    onChange={(e) => {
                      clearAlerts();
                      setNewSectionName(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addSection();
                    }}
                    placeholder="مثال: المشروبات"
                    className="min-h-11 w-full rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] px-3 py-2.5 text-sm font-bold text-[#1b1712] outline-none transition placeholder:text-[#1b1712]/30 focus:border-[#1b1712]"
                  />

                  <button
                    type="button"
                    onClick={addSection}
                    disabled={savingKey === "add-section"}
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] px-4 py-3 text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingKey === "add-section" ? (
                      <Loader2 className="animate-spin" size={17} />
                    ) : (
                      <Plus size={17} />
                    )}

                    إضافة قسم
                  </button>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] shadow-sm shadow-black/5">
              <div className="flex items-center justify-between gap-3 border-b border-[#8f806c]/45 bg-[#d1c5b4] px-4 py-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                    List
                  </p>

                  <h2 className="mt-0.5 text-lg font-black text-[#1b1712]">
                    كل الأقسام
                  </h2>
                </div>

                <span className="rounded-full border border-[#8f806c]/45 bg-[#ded4c5] px-3 py-1 text-xs font-black text-[#1b1712]/60">
                  {sections.length} أقسام
                </span>
              </div>

              <div className="p-3">
                {!sections.length ? (
                  <EmptySections />
                ) : (
                  <div className="grid gap-2">
                    {sections.map((section, index) => {
                      const isEditing = editingId === section.id;
                      const isRenaming = savingKey === `rename-${section.id}`;
                      const isDeleting = savingKey === `delete-${section.id}`;
                      const isMoving = savingKey === `move-${section.id}`;
                      const itemCount = (section.items || []).length;

                      return (
                        <SectionRow
                          key={section.id}
                          menuId={menu.id}
                          section={section}
                          index={index}
                          sectionsLength={sections.length}
                          itemCount={itemCount}
                          isEditing={isEditing}
                          editingName={editingName}
                          setEditingName={setEditingName}
                          isRenaming={isRenaming}
                          isDeleting={isDeleting}
                          isMoving={isMoving}
                          onSaveName={() => saveSectionName(section.id)}
                          onCancelEditing={cancelEditing}
                          onStartEditing={() => startEditing(section)}
                          onDelete={() => deleteSection(section.id)}
                          onMoveUp={() => moveSection(index, "up")}
                          onMoveDown={() => moveSection(index, "down")}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-24 lg:h-fit">
            <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Summary
              </p>

              <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                ملخص الأقسام
              </h2>

              <div className="mt-4 grid gap-2">
                <SummaryRow label="الأقسام" value={sections.length} />
                <SummaryRow label="الأصناف" value={totalItems} />
                <SummaryRow label="الفارغة" value={emptySections} />
              </div>
            </section>

            <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d1c5b4] p-4 shadow-sm shadow-black/5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Tip
              </p>

              <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                ترتيب واضح للزبون
              </h2>

              <p className="mt-3 text-sm font-bold leading-6 text-[#1b1712]/58">
                خلي الأقسام الأكثر طلباً فوق. مثلاً: عروض، وجبات رئيسية، مشروبات، حلويات.
              </p>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function SectionRow({
  menuId,
  section,
  index,
  sectionsLength,
  itemCount,
  isEditing,
  editingName,
  setEditingName,
  isRenaming,
  isDeleting,
  isMoving,
  onSaveName,
  onCancelEditing,
  onStartEditing,
  onDelete,
  onMoveUp,
  onMoveDown,
}) {
  return (
    <article className="rounded-2xl border border-[#8f806c]/50 bg-[#ded4c5] p-3 transition hover:border-[#796a58]/75 hover:bg-[#d1c5b4]">
      <div className="grid gap-3 lg:grid-cols-[56px_minmax(0,1fr)_260px] lg:items-center">
        <div className="flex items-center justify-between gap-3 lg:block">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1b1712] text-sm font-black text-[#efe7da]">
            {index + 1}
          </div>

          <span className="rounded-full border border-[#8f806c]/45 bg-[#d1c5b4] px-2.5 py-1 text-xs font-black text-[#1b1712]/50 lg:hidden">
            ترتيب {section.sort_order || index + 1}
          </span>
        </div>

        <div className="min-w-0">
          {isEditing ? (
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-[#8f806c]/50 bg-[#d1c5b4] px-3 py-2.5 text-sm font-black text-[#1b1712] outline-none transition focus:border-[#1b1712]"
              />

              <button
                type="button"
                onClick={onSaveName}
                disabled={isRenaming}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] px-4 py-2.5 text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRenaming ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                حفظ
              </button>

              <button
                type="button"
                onClick={onCancelEditing}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-[#8f806c]/55 bg-[#d1c5b4] px-4 py-2.5 text-sm font-black text-[#1b1712]/65 transition hover:bg-[#cfc3b2]"
              >
                إلغاء
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-black text-[#1b1712]">
                  {section.name_ar || "قسم بدون اسم"}
                </h3>

                {itemCount === 0 ? (
                  <WarningBadge>فارغ</WarningBadge>
                ) : (
                  <SuccessBadge>فيه أصناف</SuccessBadge>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <MiniTag>
                  <Package size={12} />
                  {itemCount} أصناف
                </MiniTag>

                <MiniTag>الترتيب {section.sort_order || index + 1}</MiniTag>
              </div>
            </>
          )}
        </div>

        <div className="grid gap-2">
          <Link
            href={`/admin/menus/${menuId}/sections/${section.id}`}
            className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] px-3 py-2.5 text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] active:scale-[0.98]"
          >
            <ExternalLink size={16} />
            إدارة الأصناف
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={index === 0 || isMoving}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#d1c5b4] px-3 py-2 text-sm font-black text-[#1b1712]/65 transition hover:bg-[#cfc3b2] disabled:cursor-not-allowed disabled:opacity-35"
            >
              {isMoving ? (
                <Loader2 className="animate-spin" size={15} />
              ) : (
                <ArrowUp size={15} />
              )}
              أعلى
            </button>

            <button
              type="button"
              onClick={onMoveDown}
              disabled={index === sectionsLength - 1 || isMoving}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#d1c5b4] px-3 py-2 text-sm font-black text-[#1b1712]/65 transition hover:bg-[#cfc3b2] disabled:cursor-not-allowed disabled:opacity-35"
            >
              {isMoving ? (
                <Loader2 className="animate-spin" size={15} />
              ) : (
                <ArrowDown size={15} />
              )}
              أسفل
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onStartEditing}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#d1c5b4] px-3 py-2 text-sm font-black text-[#1b1712]/65 transition hover:bg-[#cfc3b2]"
            >
              <Pencil size={15} />
              تعديل
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-700 px-3 py-2 text-sm font-black text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="animate-spin" size={15} />
              ) : (
                <Trash2 size={15} />
              )}
              حذف
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptySections() {
  return (
    <div className="rounded-xl border border-dashed border-[#8f806c]/65 bg-[#ded4c5] p-6 text-center">
      <FolderOpen className="mx-auto text-[#1b1712]/30" size={34} />

      <h3 className="mt-3 text-lg font-black text-[#1b1712]">
        لا توجد أقسام بعد
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#1b1712]/55">
        ابدأ بإضافة أول قسم، وبعدها افتحه لإضافة الأصناف والأسعار والصور.
      </p>

      <div className="mt-4 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#d1c5b4] px-4 py-2.5 text-sm font-black text-[#1b1712]/60">
          <CirclePlus size={16} />
          أضف قسم من الأعلى
        </span>
      </div>
    </div>
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

function MiniTag({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#8f806c]/45 bg-[#d1c5b4] px-2.5 py-1 text-xs font-black text-[#1b1712]/55">
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