"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpgradePage() {
  const router = useRouter();

  const [loadingPlan, setLoadingPlan] = useState("");
  const [error, setError] = useState("");

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "₪49",
      features: [
        "قائمة واحدة",
        "حتى 50 صنف",
        "روابط التواصل",
        "دعم أساسي",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: "₪99",
      popular: true,
      features: [
        "حتى 5 قوائم",
        "عدد أصناف غير محدود",
        "قوالب متعددة",
        "دعم أولوية",
      ],
    },
    {
      id: "business",
      name: "Business",
      price: "₪199",
      features: [
        "قوائم غير محدودة",
        "ميزات مستقبلية أولاً",
        "إدارة متقدمة",
        "دعم كامل",
      ],
    },
  ];

  async function choosePlan(planId) {
    setLoadingPlan(planId);
    setError("");

    const response = await fetch("/api/test-upgrade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan: planId }),
    });

    const result = await response.json();

    setLoadingPlan("");

    if (!response.ok) {
      setError(result.error || "حدث خطأ أثناء ترقية الخطة.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main dir="rtl" className="min-h-screen px-5 py-10">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm text-black/50">CRTGO SUBSCRIPTIONS</p>

        <h1 className="mt-2 text-5xl font-black">اختر الخطة المناسبة</h1>

        <p className="mt-4 text-black/50">
          حالياً هذه ترقية تجريبية بدون دفع، فقط لاختبار النظام.
        </p>

        {error && (
          <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-3xl border p-6 ${
                plan.popular
                  ? "border-black bg-black text-white"
                  : "border-black/15"
              }`}
            >
              {plan.popular && (
                <div className="mb-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
                  الأكثر اختياراً
                </div>
              )}

              <h2 className="text-3xl font-black">{plan.name}</h2>

              <p className="mt-4 text-5xl font-black">{plan.price}</p>

              <p
                className={`mt-1 ${
                  plan.popular ? "text-white/60" : "text-black/50"
                }`}
              >
                شهرياً
              </p>

              <div className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className={`text-sm ${
                      plan.popular ? "text-white/80" : "text-black/70"
                    }`}
                  >
                    ✓ {feature}
                  </div>
                ))}
              </div>

              <button
                onClick={() => choosePlan(plan.id)}
                disabled={loadingPlan === plan.id}
                className={`mt-8 w-full cursor-pointer rounded-2xl px-4 py-4 font-bold disabled:opacity-50 ${
                  plan.popular ? "bg-white text-black" : "bg-black text-white"
                }`}
              >
                {loadingPlan === plan.id ? "جارٍ التفعيل..." : "تفعيل تجريبي"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}