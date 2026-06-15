"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function UpgradeClient({ userId, clientId, plans }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function confirmSubscription(subscriptionId, planId) {
    setError("");

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
      <main dir="rtl" className="min-h-screen px-5 py-10">
        <section className="mx-auto max-w-6xl">
          <p className="text-sm text-black/50">CRTGO SUBSCRIPTIONS</p>

          <h1 className="mt-2 text-5xl font-black">اختر الخطة المناسبة</h1>

          <p className="mt-4 text-black/50">
            الدفع حالياً في وضع Sandbox للتجربة.
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
                    : "border-black/15 bg-white"
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

                <div className="mt-8 overflow-hidden rounded-2xl bg-white p-2">
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
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </PayPalScriptProvider>
  );
}