"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { revalidatePublicMenu } from "@/lib/revalidate-public-menu";

export default function ItemsForm({
  menuId,
  branches
}) {
  const router = useRouter();
  const supabase = createClient();

  const [branchId,setBranchId] = useState(
    branches?.[0]?.id || ""
  );

  const [categoryName,setCategoryName] =
    useState("");

  const [loading,setLoading] =
    useState(false);

async function addCategory(e) {
  e.preventDefault();

  setLoading(true);

  const { error } = await supabase
    .from("categories")
    .insert({
      branch_id: branchId,
      name_ar: categoryName,
    });

  if (error) {
    setLoading(false);
    return;
  }

  await revalidatePublicMenu(menuId);

  setLoading(false);
  router.refresh();
  setCategoryName("");
}

  return(
    <div className="mt-8">

      <form
        onSubmit={addCategory}
        className="space-y-4"
      >

        <select
          value={branchId}
          onChange={(e)=>
            setBranchId(e.target.value)
          }
          className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4"
        >
          {branches.map(branch=>(
            <option
              key={branch.id}
              value={branch.id}
            >
              {branch.name_ar}
            </option>
          ))}
        </select>

        <input
          required
          value={categoryName}
          onChange={(e)=>
            setCategoryName(e.target.value)
          }
          placeholder="مثال: المشروبات"
          className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4"
        />

        <button
          disabled={loading}
          className="w-full rounded-2xl bg-white py-4 text-black font-bold"
        >
          إضافة تصنيف
        </button>

      </form>

      <div className="mt-10 space-y-4">

        {branches.map(branch=>(

          <div
            key={branch.id}
            className="rounded-2xl border border-white/10 p-5"
          >

            <h2 className="font-bold">
              {branch.name_ar}
            </h2>

            <div className="mt-4 space-y-2">

              {branch.categories?.map(category=>(

                <div
                  key={category.id}
                  className="rounded-xl bg-white/5 p-3"
                >
                  {category.name_ar}
                </div>

              ))}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}