import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { paypalRequest } from "@/lib/paypal";

export async function POST(request) {
  try {
    const { subscriptionId, plan } = await request.json();

    if (!subscriptionId || !plan) {
      return NextResponse.json(
        { error: "Missing subscription data" },
        { status: 400 }
      );
    }

    const allowedPlans = ["basic", "pro", "business"];

    if (!allowedPlans.includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscription = await paypalRequest(
      `/v1/billing/subscriptions/${subscriptionId}`,
      {
        method: "GET",
      }
    );

    if (subscription.custom_id !== user.id) {
      return NextResponse.json(
        { error: "Subscription does not belong to this user" },
        { status: 403 }
      );
    }

    if (subscription.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Subscription is not active yet" },
        { status: 400 }
      );
    }

    const nextBillingTime =
      subscription.billing_info?.next_billing_time || null;

    const { error } = await supabase
      .from("profiles")
      .update({
        plan_id: plan,
        subscription_status: "active",
        subscription_started_at: new Date().toISOString(),
        subscription_ends_at: nextBillingTime,
        payment_provider: "paypal",
        payment_subscription_id: subscriptionId,
      })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "PayPal confirmation failed" },
      { status: 500 }
    );
  }
}