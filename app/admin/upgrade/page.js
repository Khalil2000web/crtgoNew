import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  Check,
  Crown,
  Store,
  Building2,
  CreditCard,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Upgrade",
};

function getCurrentPlanLabel(plan) {
  const labels = {
    trial: "Trial",
    basic: "Basic",
    pro: "Pro",
    business: "Business",
  };

  return labels[plan] || plan || "Trial";
}

function getStatusLabel(status) {
  const labels = {
    active: "فعال",
    trialing: "تجريبي",
    inactive: "غير فعال",
    expired: "منتهي",
    cancelled: "ملغي",
  };

  return labels[status] || status || "غير معروف";
}

function getPlanIcon(planId) {
  if (planId === "business") return <Building2 size={18} />;
  if (planId === "pro") return <Sparkles size={18} />;
  return <Store size={18} />;
}

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
  const currentStatus = profile?.subscription_status || "unknown";

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "₪49",
      description: "لبداية بسيطة مع قائمة واحدة.",
      features: ["قائمة واحدة", "حتى 50 صنف", "روابط التواصل", "دعم أساسي"],
    },
    {
      id: "pro",
      name: "Pro",
      price: "₪99",
      popular: true,
      description: "الخيار الأفضل لمعظم المطاعم والكافيهات.",
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
      description: "للأعمال الأكبر والإدارة المتقدمة.",
      features: [
        "قوائم غير محدودة",
        "ميزات مستقبلية أولاً",
        "إدارة متقدمة",
        "دعم كامل",
      ],
    },
  ];

  return (
    <main dir="rtl" className="min-h-screen bg-[#11100f] px-4 pb-28 pt-5 text-[#f4efe7] sm:px-5 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <Link
          href="/admin"
          className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/60 transition hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
        >
          <ArrowRight size={15} />
          الرجوع للوحة التحكم
        </Link>

        <header className="mt-5 rounded-2xl border border-white/10 bg-[#171513] p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">
                CRTGO Plans
              </p>

              <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                الخطط والاشتراك
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                اختر الخطة المناسبة حسب عدد القوائم وحجم العمل. الصفحة بسيطة وواضحة بدون زحمة.
              </p>
            </div>

            <Link
              href="/admin/billing"
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-white transition hover:bg-white/[0.1] active:scale-[0.98]"
            >
              <CreditCard size={17} />
              الفوترة
            </Link>
          </div>
        </header>

        <section className="mt-3 grid gap-2 sm:grid-cols-3">
          <InfoBox
            icon={<Crown size={18} />}
            label="الخطة الحالية"
            value={getCurrentPlanLabel(currentPlan)}
          />

          <InfoBox
            icon={<CreditCard size={18} />}
            label="حالة الحساب"
            value={getStatusLabel(currentStatus)}
          />

          <InfoBox
            icon={<Sparkles size={18} />}
            label="طريقة الدفع"
            value="شهري"
          />
        </section>

        <section className="mt-5 grid gap-3 lg:grid-cols-3">
          {plans.map((plan) => {
            const isActive = currentPlan === plan.id;

            return (
              <article
                key={plan.id}
                className={`rounded-2xl border p-4 transition ${
                  isActive
                    ? "border-green-400/30 bg-green-400/10"
                    : plan.popular
                      ? "border-[#d7b98b]/40 bg-[#211b14]"
                      : "border-white/10 bg-[#171513] hover:border-white/18 hover:bg-[#1d1a17]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        plan.popular
                          ? "bg-[#d7b98b] text-[#11100f]"
                          : "bg-white/[0.06] text-white/75"
                      }`}
                    >
                      {getPlanIcon(plan.id)}
                    </div>

                    <div>
                      <h2 className="text-xl font-black text-white">
                        {plan.name}
                      </h2>

                      <p className="mt-1 text-xs font-bold text-white/40">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  {isActive && (
                    <span className="rounded-full border border-green-400/25 bg-green-400/10 px-2.5 py-1 text-xs font-black text-green-200">
                      الحالية
                    </span>
                  )}

                  {!isActive && plan.popular && (
                    <span className="rounded-full bg-[#d7b98b] px-2.5 py-1 text-xs font-black text-[#11100f]">
                      الأفضل
                    </span>
                  )}
                </div>

                <div className="mt-5 flex items-end gap-2 border-b border-white/10 pb-4">
                  <p className="text-3xl font-black text-white">{plan.price}</p>
                  <p className="pb-1 text-sm font-bold text-white/40">/ شهرياً</p>
                </div>

                <div className="mt-4 grid gap-2">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-sm font-bold text-white/65"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.06] text-white/70">
                        <Check size={12} />
                      </span>

                      {feature}
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  {isActive ? (
                    <div className="flex min-h-11 w-full items-center justify-center rounded-xl border border-green-400/25 bg-green-400/10 px-4 py-3 text-sm font-black text-green-200">
                      مفعّلة حالياً
                    </div>
                  ) : (
                    <Link
                      href={`/admin/checkout/${plan.id}`}
                      className={`flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl px-4 py-3 text-sm font-black transition active:scale-[0.98] ${
                        plan.popular
                          ? "bg-[#d7b98b] text-[#11100f] hover:bg-[#caa873]"
                          : "bg-white text-[#11100f] hover:bg-white/90"
                      }`}
                    >
                      {currentPlan === "trial"
                        ? `اختيار ${plan.name}`
                        : `الترقية إلى ${plan.name}`}
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#171513] p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-white/70">
        {icon}
      </div>

      <div>
        <p className="text-xs font-black text-white/35">{label}</p>
        <p className="mt-0.5 text-sm font-black text-white">{value}</p>
      </div>
    </div>
  );
}