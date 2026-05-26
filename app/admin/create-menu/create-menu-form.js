"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

export default function CreateMenuForm() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleNameChange(value) {
    setName(value);
    setSubdomain(makeSubdomain(value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/start");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      const { count, error: countError } = await supabase
        .from("menus")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id);

      if (countError) throw countError;

      const plan = profile?.plan || "basic";

      if (plan === "basic" && count >= 1) {
        throw new Error("خطتك الحالية تسمح بإنشاء قائمة رقمية واحدة فقط.");
      }

      if (plan === "pro" && count >= 3) {
        throw new Error("خطة Pro تسمح بإنشاء 3 قوائم رقمية فقط.");
      }

      const cleanSubdomain = makeSubdomain(subdomain || name);

      if (!cleanSubdomain) {
        throw new Error("اكتب اسمًا صالحًا للقائمة.");
      }

      const { data: menu, error: menuError } = await supabase
        .from("menus")
        .insert({
          owner_id: user.id,
          name,
          subdomain: cleanSubdomain,
          template_id: "classic",
          status: "active",
        })
        .select()
        .single();

      if (menuError) throw menuError;

      router.push(`/admin/menus/${menu.id}`);
      router.refresh();
    } catch (err) {
      setError(err.message || "حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-black px-5 py-8 text-white">
      <section className="mx-auto max-w-xl">
        <p className="text-sm text-white/50">CRTGO</p>

        <h1 className="mt-3 text-4xl font-black">إنشاء قائمة رقمية</h1>

        <p className="mt-4 text-white/60">
          ابدأ بإنشاء اسم المطعم أو الكافيه، وسنقوم بتوليد الرابط تلقائيًا.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-white/60">
              اسم المطعم / الكافيه
            </label>

            <input
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="مثال: كافيه الريف"
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/60">
              الرابط الفرعي
            </label>

            <div className="flex overflow-hidden rounded-2xl border border-white/15 bg-white/5">
              <input
                required
                dir="ltr"
                value={subdomain}
                onChange={(e) => setSubdomain(makeSubdomain(e.target.value))}
                placeholder="alreef"
                className="min-w-0 flex-1 bg-transparent px-4 py-4 text-left outline-none"
              />

              <span className="border-r border-white/15 px-4 py-4 text-white/40">
                .crtgo.com
              </span>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-white px-4 py-4 font-bold text-black disabled:opacity-50"
          >
            {loading ? "جارٍ الإنشاء..." : "إنشاء القائمة"}
          </button>
        </form>
      </section>
    </main>
  );
}