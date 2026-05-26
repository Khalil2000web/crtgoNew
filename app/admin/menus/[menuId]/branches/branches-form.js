"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function makeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function BranchesForm({ menuId, branches }) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function addBranch(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const cleanName = name.trim();

      if (!cleanName) {
        throw new Error("اكتب اسم الفرع.");
      }

      const { error } = await supabase.from("branches").insert({
        menu_id: menuId,
        name_ar: cleanName,
        slug: makeSlug(cleanName),
        sort_order: branches.length,
      });

      if (error) throw error;

      setName("");
      router.refresh();
    } catch (err) {
      setError(err.message || "حدث خطأ.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteBranch(id) {
    const sure = confirm("هل أنت متأكد من حذف هذا الفرع؟");

    if (!sure) return;

    const { error } = await supabase.from("branches").delete().eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-8">
      <form onSubmit={addBranch} className="flex gap-3">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: الفرع الرئيسي"
          className="min-w-0 flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-4 outline-none focus:border-white"
        />

        <button
          disabled={loading}
          className="rounded-2xl bg-white px-5 py-4 font-bold text-black disabled:opacity-50"
        >
          إضافة
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-8 space-y-3">
        {!branches.length && (
          <p className="rounded-2xl border border-white/10 p-5 text-white/50">
            لا توجد فروع بعد.
          </p>
        )}

        {branches.map((branch) => (
          <div
            key={branch.id}
            className="flex items-center justify-between rounded-2xl border border-white/10 p-5"
          >
            <div>
              <h2 className="font-bold">{branch.name_ar}</h2>
              <p dir="ltr" className="mt-1 text-left text-sm text-white/40">
                /{branch.slug}
              </p>
            </div>

            <button
              onClick={() => deleteBranch(branch.id)}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/60"
            >
              حذف
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}