import { NextResponse } from "next/server";
import { paypalRequest } from "@/lib/paypal";

const plans = [
  {
    id: "basic",
    name: "CRTGO Basic",
    price: "49.00",
  },
  {
    id: "pro",
    name: "CRTGO Pro",
    price: "99.00",
  },
  {
    id: "business",
    name: "CRTGO Business",
    price: "199.00",
  },
];

export async function POST() {
  try {
    const product = await paypalRequest("/v1/catalogs/products", {
      method: "POST",
      body: JSON.stringify({
        name: "CRTGO",
        description: "Digital menu subscriptions",
        type: "SERVICE",
        category: "SOFTWARE",
      }),
    });

    const createdPlans = [];

    for (const plan of plans) {
      const paypalPlan = await paypalRequest("/v1/billing/plans", {
        method: "POST",
        body: JSON.stringify({
          product_id: product.id,
          name: plan.name,
          description: `${plan.name} monthly subscription`,
          billing_cycles: [
            {
              frequency: {
                interval_unit: "MONTH",
                interval_count: 1,
              },
              tenure_type: "REGULAR",
              sequence: 1,
              total_cycles: 0,
              pricing_scheme: {
                fixed_price: {
                  value: plan.price,
                  currency_code: "ILS",
                },
              },
            },
          ],
          payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee_failure_action: "CONTINUE",
            payment_failure_threshold: 3,
          },
        }),
      });

      createdPlans.push({
        localPlan: plan.id,
        paypalPlanId: paypalPlan.id,
      });
    }

    return NextResponse.json({
      productId: product.id,
      plans: createdPlans,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "PayPal setup failed" },
      { status: 500 }
    );
  }
}