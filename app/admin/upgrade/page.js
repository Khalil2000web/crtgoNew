import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChevronLeft, Settings } from "lucide-react";

const plans = {
  basic: {
    name: "Basic",
    next: ["extra", "pro"],
  },
  extra: {
    name: "Extra",
    next: ["pro"],
  },
  pro: {
    name: "Pro",
    next: [],
  },
};

export default async function UpgradePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/start");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const currentPlan = profile?.plan || "basic";
  const availablePlans = plans[currentPlan]?.next || [];

  return (
    <div dir="rtl" className="min-h-screen px-5 py-8">
      <section className="mx-auto max-w-4xl">
        <Link href="/admin/settings" className="text-left w-full text-sm flex items-center justify-end gap-2 text-black/50">
           الرجوع للإعدادات <ChevronLeft />
        </Link>

        <h1 className="mt-8 text-4xl font-black">ترقية الخطة</h1>

        <p className="mt-4 text-black/60">
          خطتك الحالية: {currentPlan}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {availablePlans.length ? (
            availablePlans.map((plan) => (
              <div
                key={plan}
                className="rounded-3xl border border-black/10 p-6"
              >
                <h2 className="text-2xl font-black uppercase">{plan}</h2>

                <p className="mt-3 text-black/60">
                  سنربط هذا الزر لاحقًا مع Stripe Checkout.
                </p>

                <button className="mt-6 w-full rounded-2xl bg-black px-4 py-4 font-bold text-white">
                  اختيار خطة {plan}
                </button>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-black/10 p-5 text-black/50">
              أنت بالفعل على أعلى خطة.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}