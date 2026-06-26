import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  createPayPalSubscription,
  getPayPalApprovalUrl,
} from "@/lib/paypal";

export async function POST(request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const planId = process.env.PAYPAL_PRO_PLAN_ID;

    if (!planId) {
      return NextResponse.json(
        { error: "Missing PAYPAL_PRO_PLAN_ID." },
        { status: 500 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, plan, paypal_subscription_id, paypal_subscription_status")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 404 }
      );
    }

    if (
      profile.plan === "pro" &&
      String(profile.paypal_subscription_status || "").toUpperCase() ===
        "ACTIVE"
    ) {
      return NextResponse.json(
        { error: "Your account is already Pro." },
        { status: 400 }
      );
    }

    const fallbackOrigin = new URL(request.url).origin;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || fallbackOrigin;

    const subscription = await createPayPalSubscription({
      userId: user.id,
      planId,
      returnUrl: `${siteUrl}/admin/account?payment=success`,
      cancelUrl: `${siteUrl}/admin/account?payment=cancelled`,
    });

    const approvalUrl = getPayPalApprovalUrl(subscription);

    if (!approvalUrl) {
      return NextResponse.json(
        { error: "PayPal approval URL was not returned." },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        paypal_subscription_id: subscription.id,
        paypal_subscription_status: subscription.status || "APPROVAL_PENDING",
        paypal_plan_id: planId,
        subscription_status: subscription.status || "APPROVAL_PENDING",
        billing_email: user.email,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      approvalUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to create PayPal subscription." },
      { status: 500 }
    );
  }
}