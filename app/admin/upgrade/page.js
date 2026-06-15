import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function UpgradePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/start");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan_id, subscription_status")
    .eq("id", user.id)
    .single();

  const currentPlan = profile?.plan_id || "trial";

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "₪49",
      features: ["قائمة واحدة", "حتى 50 صنف", "روابط التواصل", "دعم أساسي"],
    },
    {
      id: "pro",
      name: "Pro",
      price: "₪99",
      popular: true,
      features: ["حتى 5 قوائم", "عدد أصناف غير محدود", "قوالب متعددة", "دعم أولوية"],
    },
    {
      id: "business",
      name: "Business",
      price: "₪199",
      features: ["قوائم غير محدودة", "ميزات مستقبلية أولاً", "إدارة متقدمة", "دعم كامل"],
    },
  ];

  return (
    <main dir="rtl" className="min-h-screen px-5 py-10">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm text-black/50">CRTGO SUBSCRIPTIONS</p>
        <h1 className="mt-2 text-5xl font-black">اختر الخطة المناسبة</h1>

        <p className="mt-4 text-black/50">
          خطتك الحالية:{" "}
          <span className="font-bold uppercase text-black">{currentPlan}</span>
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => {
            const isActive = currentPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl border p-6 ${
                  isActive
                    ? "border-green-600 bg-green-50"
                    : plan.popular
                    ? "border-black bg-black text-white"
                    : "border-black/15 bg-white"
                }`}
              >
                {isActive && (
                  <div className="mb-4 inline-flex rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                    الخطة الحالية
                  </div>
                )}

                {!isActive && plan.popular && (
                  <div className="mb-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
                    الأكثر اختياراً
                  </div>
                )}

                <h2 className="text-3xl font-black">{plan.name}</h2>
                <p className="mt-4 text-5xl font-black">{plan.price}</p>

                <p
                  className={`mt-1 ${
                    isActive
                      ? "text-green-800/70"
                      : plan.popular
                      ? "text-white/60"
                      : "text-black/50"
                  }`}
                >
                  شهرياً
                </p>

                <div className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className={`text-sm ${
                        isActive
                          ? "text-green-900/70"
                          : plan.popular
                          ? "text-white/80"
                          : "text-black/70"
                      }`}
                    >
                      ✓ {feature}
                    </div>
                  ))}
                </div>

                {isActive ? (
                  <div className="mt-8 flex w-full items-center justify-center rounded-2xl border border-green-600 px-4 py-4 font-bold text-green-700">
                    مفعّلة حالياً
                  </div>
                ) : (
                  <Link
                    href={`/admin/checkout/${plan.id}`}
                    className={`mt-8 flex w-full items-center justify-center rounded-2xl px-4 py-4 font-bold ${
                      plan.popular ? "bg-white text-black" : "bg-black text-white"
                    }`}
                  >
                    {currentPlan === "trial"
                      ? `اختيار ${plan.name}`
                      : `الترقية إلى ${plan.name}`}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}