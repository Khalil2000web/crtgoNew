"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
  Store,
  Building2,
  CreditCard,
} from "lucide-react";
import Link from "next/link";

function getPlanIcon(planId) {
  if (planId === "business") return <Building2 size={18} />;
  if (planId === "pro") return <Sparkles size={18} />;
  return <Store size={18} />;
}

export default function UpgradeClient({ userId, clientId, plans }) {
  const router = useRouter();

  const [error, setError] = useState("");
  const [confirmingPlan, setConfirmingPlan] = useState("");

  async function confirmSubscription(subscriptionId, planId) {
    setError("");
    setConfirmingPlan(planId);

    const response = await fetch("/api/paypal/confirm-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscriptionId,
        plan: planId,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setConfirmingPlan("");
      setError(result.error || "حدث خطأ أثناء تفعيل الاشتراك.");
      return;
    }

    router.push("/admin/billing");
    router.refresh();
  }

  return (
    <PayPalScriptProvider
      options={{
        "client-id": clientId,
        vault: true,
        intent: "subscription",
        currency: "ILS",
      }}
    >
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
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">
                  PayPal Checkout
                </p>

                <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  تفعيل الاشتراك
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                  الدفع حالياً في وضع Sandbox للتجربة. بعد الموافقة من PayPal سيتم تفعيل الخطة تلقائياً.
                </p>
              </div>

              {confirmingPlan ? (
                <div className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-white/70">
                  <Loader2 className="animate-spin" size={17} />
                  جارٍ التفعيل
                </div>
              ) : (
                <div className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-white/55">
                  PayPal Sandbox
                </div>
              )}
            </div>
          </header>

          {error && (
            <p className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-bold text-red-200">
              {error}
            </p>
          )}

          <section className="mt-5 grid gap-3 lg:grid-cols-3">
            {plans.map((plan) => {
              const isConfirming = confirmingPlan === plan.id;

              return (
                <article
                  key={plan.id}
                  className={`rounded-2xl border p-4 transition ${
                    plan.popular
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
                          اشتراك شهري
                        </p>
                      </div>
                    </div>

                    {plan.popular && (
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

                  <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-white p-2">
                    {isConfirming ? (
                      <div className="flex min-h-[145px] items-center justify-center gap-2 text-sm font-black text-[#11100f]">
                        <Loader2 className="animate-spin" size={18} />
                        جارٍ تفعيل الاشتراك...
                      </div>
                    ) : (
                      <PayPalButtons
                        style={{
                          layout: "vertical",
                          shape: "pill",
                          label: "subscribe",
                        }}
                        createSubscription={(data, actions) => {
                          return actions.subscription.create({
                            plan_id: plan.paypalPlanId,
                            custom_id: userId,
                          });
                        }}
                        onApprove={async (data) => {
                          await confirmSubscription(data.subscriptionID, plan.id);
                        }}
                        onError={(err) => {
                          console.error(err);
                          setError("حدث خطأ في PayPal.");
                        }}
                      />
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs font-bold text-white/35">
                    <CreditCard size={14} />
                    الدفع آمن من خلال PayPal
                  </div>
                </article>
              );
            })}
          </section>
        </section>
      </main>
    </PayPalScriptProvider>
  );
}