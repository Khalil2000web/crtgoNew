"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function CheckoutClient({ userId, plan, clientId }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function confirmSubscription(subscriptionId) {
    setError("");

    const response = await fetch("/api/paypal/confirm-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscriptionId,
        plan: plan.id,
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
        <section className="mx-auto max-w-4xl">
          <Link href="/admin/upgrade" className="text-sm text-black/50">
            الرجوع للخطط
          </Link>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="rounded-3xl bg-white p-6">
              <p className="text-sm text-black/50">الدفع</p>

              <h1 className="mt-2 text-5xl font-black">
                خطة {plan.name}
              </h1>

              <p className="mt-4 text-black/50">
                أكمل الاشتراك الشهري عبر PayPal Sandbox.
              </p>

              {error && (
                <p className="mt-6 rounded-2xl bg-red-500/10 p-4 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="mt-8 rounded-3xl border border-black/10 bg-white p-4">
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
                    await confirmSubscription(data.subscriptionID);
                  }}
                  onError={(err) => {
                    console.error(err);
                    setError("حدث خطأ في PayPal.");
                  }}
                />
              </div>
            </div>

            <aside className="rounded-3xl bg-black p-6 text-white">
              <p className="text-sm text-white/50">الخطة المختارة</p>

              <h2 className="mt-2 text-4xl font-black">{plan.name}</h2>

              <p className="mt-4 text-5xl font-black">{plan.price}</p>

              <p className="mt-1 text-white/50">شهرياً</p>

              <div className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <p key={feature} className="text-sm text-white/80">
                    ✓ {feature}
                  </p>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </main>
    </PayPalScriptProvider>
  );
}