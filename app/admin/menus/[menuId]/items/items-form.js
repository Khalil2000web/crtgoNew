"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CirclePlus,
  FolderOpen,
  Loader2,
  Plus,
  TriangleAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { revalidatePublicMenu } from "@/lib/revalidate-public-menu";

export default function ItemsForm({ menuId, branches }) {
  const router = useRouter();
  const supabase = createClient();

  const normalizedBranches = useMemo(() => {
    return (branches || []).map((branch) => ({
      ...branch,
      categories: [...(branch.categories || [])].sort((a, b) => {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }),
    }));
  }, [branches]);

  const [branchId, setBranchId] = useState(normalizedBranches?.[0]?.id || "");
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedBranch = normalizedBranches.find((branch) => {
    return branch.id === branchId;
  });

  const hasBranches = normalizedBranches.length > 0;
  const categoryCount = normalizedBranches.reduce((total, branch) => {
    return total + (branch.categories?.length || 0);
  }, 0);

  function clearAlerts() {
    setMessage("");
    setError("");
  }

  async function addCategory(e) {
    e.preventDefault();

    clearAlerts();

    const cleanName = categoryName.trim();

    if (!branchId) {
      setError("لازم تختار فرع قبل إضافة تصنيف.");
      return;
    }

    if (!cleanName) {
      setError("اكتب اسم التصنيف أولاً.");
      return;
    }

    setLoading(true);

    const { error: insertError } = await supabase.from("categories").insert({
      branch_id: branchId,
      name_ar: cleanName,
    });

    if (insertError) {
      setLoading(false);
      setError(insertError.message);
      return;
    }

    await revalidatePublicMenu(menuId);

    setLoading(false);
    setMessage("تمت إضافة التصنيف.");
    setCategoryName("");
    router.refresh();
  }

  return (
    <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
      <div className="grid gap-5">
        <section className="overflow-hidden rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] shadow-sm shadow-black/5">
          <div className="border-b border-[#8f806c]/45 bg-[#d1c5b4] px-4 py-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
              Add category
            </p>

            <h2 className="mt-0.5 text-lg font-black text-[#1b1712]">
              إضافة تصنيف جديد
            </h2>

            <p className="mt-1 text-sm leading-6 text-[#1b1712]/52">
              اختر الفرع، ثم اكتب اسم التصنيف. بعد ذلك يمكنك إضافة الأصناف داخله.
            </p>
          </div>

          <div className="p-3">
            {!hasBranches ? (
              <EmptyBranches menuId={menuId} />
            ) : (
              <form onSubmit={addCategory} className="grid gap-3">
                {(message || error) && (
                  <div className="grid gap-2">
                    {message && <Alert type="success">{message}</Alert>}
                    {error && <Alert type="error">{error}</Alert>}
                  </div>
                )}

                <label className="grid gap-2">
                  <span className="text-sm font-black text-[#1b1712]/60">
                    الفرع
                  </span>

                  <select
                    value={branchId}
                    onChange={(e) => {
                      clearAlerts();
                      setBranchId(e.target.value);
                    }}
                    className="min-h-11 w-full cursor-pointer rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] px-3 py-2.5 text-sm font-black text-[#1b1712] outline-none transition focus:border-[#1b1712]"
                  >
                    {normalizedBranches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name_ar || "فرع بدون اسم"}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black text-[#1b1712]/60">
                    اسم التصنيف
                  </span>

                  <input
                    required
                    value={categoryName}
                    onChange={(e) => {
                      clearAlerts();
                      setCategoryName(e.target.value);
                    }}
                    placeholder="مثال: المشروبات"
                    className="min-h-11 w-full rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] px-3 py-2.5 text-sm font-bold text-[#1b1712] outline-none transition placeholder:text-[#1b1712]/30 focus:border-[#1b1712]"
                  />
                </label>

                <button
                  disabled={loading}
                  className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] px-4 py-3 text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={17} />
                  ) : (
                    <Plus size={17} />
                  )}

                  {loading ? "جارٍ الإضافة..." : "إضافة التصنيف"}
                </button>
              </form>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] shadow-sm shadow-black/5">
          <div className="flex items-center justify-between gap-3 border-b border-[#8f806c]/45 bg-[#d1c5b4] px-4 py-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Branches
              </p>

              <h2 className="mt-0.5 text-lg font-black text-[#1b1712]">
                التصنيفات حسب الفروع
              </h2>
            </div>

            <span className="rounded-full border border-[#8f806c]/45 bg-[#ded4c5] px-3 py-1 text-xs font-black text-[#1b1712]/60">
              {categoryCount} تصنيف
            </span>
          </div>

          <div className="p-3">
            {!hasBranches ? (
              <EmptyBranches menuId={menuId} simple />
            ) : (
              <div className="grid gap-3">
                {normalizedBranches.map((branch) => (
                  <BranchCard
                    key={branch.id}
                    menuId={menuId}
                    branch={branch}
                    selected={branch.id === branchId}
                    onSelect={() => setBranchId(branch.id)}
                  />
                ))}
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
            ملخص التنظيم
          </h2>

          <div className="mt-4 grid gap-2">
            <SummaryRow label="الفروع" value={normalizedBranches.length} />
            <SummaryRow label="التصنيفات" value={categoryCount} />
            <SummaryRow
              label="الفرع المحدد"
              value={selectedBranch?.name_ar || "غير محدد"}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d1c5b4] p-4 shadow-sm shadow-black/5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
            Next step
          </p>

          <h2 className="mt-1 text-lg font-black text-[#1b1712]">
            بعد التصنيفات
          </h2>

          <p className="mt-3 text-sm font-bold leading-6 text-[#1b1712]/58">
            بعد إضافة التصنيفات، افتح التصنيف لإضافة الأصناف والأسعار والصور.
          </p>
        </section>
      </aside>
    </section>
  );
}

function BranchCard({ menuId, branch, selected, onSelect }) {
  const categories = branch.categories || [];

  return (
    <section
      className={`rounded-2xl border p-3 transition ${
        selected
          ? "border-[#1b1712] bg-[#ded4c5]"
          : "border-[#8f806c]/50 bg-[#ded4c5] hover:border-[#796a58]/75 hover:bg-[#d1c5b4]"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-right"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#8f806c]/45 bg-[#d1c5b4] text-[#1b1712]/70">
            <Building2 size={18} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-black text-[#1b1712]">
                {branch.name_ar || "فرع بدون اسم"}
              </h3>

              {selected && (
                <span className="inline-flex items-center gap-1 rounded-full border border-green-900/25 bg-green-800/12 px-2.5 py-1 text-xs font-black text-green-950">
                  <CheckCircle2 size={12} />
                  محدد
                </span>
              )}
            </div>

            <p className="mt-1 text-xs font-bold text-[#1b1712]/45">
              {categories.length} تصنيفات
            </p>
          </div>
        </button>

        <Link
          href={`/admin/menus/${menuId}/branches`}
          className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#d1c5b4] px-3 py-2 text-xs font-black text-[#1b1712]/65 transition hover:bg-[#cfc3b2] hover:text-[#1b1712] active:scale-[0.98]"
        >
          إدارة الفرع
          <ArrowLeft size={14} />
        </Link>
      </div>

      <div className="mt-3 grid gap-2">
        {categories.length ? (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#8f806c]/45 bg-[#d1c5b4] px-3 py-2.5"
            >
              <span className="flex min-w-0 items-center gap-2">
                <FolderOpen size={15} className="shrink-0 text-[#1b1712]/45" />

                <span className="truncate text-sm font-black text-[#1b1712]/75">
                  {category.name_ar || "تصنيف بدون اسم"}
                </span>
              </span>

              <Link
                href={`/admin/menus/${menuId}/items/${category.id}`}
                className="shrink-0 rounded-full border border-[#8f806c]/45 bg-[#ded4c5] px-2.5 py-1 text-xs font-black text-[#1b1712]/58 transition hover:bg-[#cfc3b2] hover:text-[#1b1712]"
              >
                فتح
              </Link>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[#8f806c]/65 bg-[#d1c5b4] px-3 py-4 text-center text-sm font-bold text-[#1b1712]/40">
            لا توجد تصنيفات في هذا الفرع.
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyBranches({ menuId, simple }) {
  return (
    <div className="rounded-xl border border-dashed border-[#8f806c]/65 bg-[#ded4c5] p-6 text-center">
      <Building2 className="mx-auto text-[#1b1712]/30" size={34} />

      <h3 className="mt-3 text-lg font-black text-[#1b1712]">
        لا توجد فروع بعد
      </h3>

      {!simple && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#1b1712]/55">
          قبل إضافة التصنيفات، أنشئ فرع واحد على الأقل. حتى لو المطعم عنده فرع واحد فقط.
        </p>
      )}

      <div className="mt-4 flex justify-center">
        <Link
          href={`/admin/menus/${menuId}/branches`}
          className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] px-4 py-2.5 text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] active:scale-[0.98]"
        >
          <CirclePlus size={16} />
          إنشاء فرع
        </Link>
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