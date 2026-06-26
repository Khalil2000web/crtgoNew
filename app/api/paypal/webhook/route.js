import { NextResponse } from "next/server";
import {
  getPayPalSubscription,
  verifyPayPalWebhook,
} from "@/lib/paypal";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { updateProfileFromPayPalSubscription } from "@/lib/paypal-subscription-sync";

export const runtime = "nodejs";

function getSubscriptionIdFromEvent(event) {
  const resource = event?.resource || {};

  return (
    resource.id ||
    resource.subscription_id ||
    resource.billing_agreement_id ||
    null
  );
}

async function syncSubscriptionFromEvent(event) {
  const resource = event?.resource || {};
  const subscriptionId = getSubscriptionIdFromEvent(event);

  if (!subscriptionId) return;

  let subscription = resource;

  try {
    subscription = await getPayPalSubscription(subscriptionId);
  } catch {
    subscription = {
      ...resource,
      id: subscriptionId,
    };
  }

  await updateProfileFromPayPalSubscription(subscription, resource.custom_id);
}

async function markSubscriptionAsFree(event, status) {
  const subscriptionId = getSubscriptionIdFromEvent(event);
  const resource = event?.resource || {};

  if (!subscriptionId && !resource.custom_id) return;

  let query = supabaseAdmin.from("profiles").update({
    plan: "free",
    paypal_subscription_status: status,
    subscription_status: status,
  });

  if (resource.custom_id) {
    query = query.eq("id", resource.custom_id);
  } else {
    query = query.eq("paypal_subscription_id", subscriptionId);
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}

export async function POST(request) {
  try {
    const event = await request.json();

    const verified = await verifyPayPalWebhook({
      headers: request.headers,
      event,
    });

    if (!verified) {
      return NextResponse.json(
        { error: "Invalid PayPal webhook signature." },
        { status: 400 }
      );
    }

    const eventType = event.event_type;

    if (
[
  "BILLING.SUBSCRIPTION.CREATED",
  "BILLING.SUBSCRIPTION.ACTIVATED",
  "BILLING.SUBSCRIPTION.RE-ACTIVATED",
  "BILLING.SUBSCRIPTION.UPDATED",
].includes(eventType)
    ) {
      await syncSubscriptionFromEvent(event);
    }

    if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") {
      await markSubscriptionAsFree(event, "CANCELLED");
    }

    if (eventType === "BILLING.SUBSCRIPTION.EXPIRED") {
      await markSubscriptionAsFree(event, "EXPIRED");
    }

    if (eventType === "BILLING.SUBSCRIPTION.SUSPENDED") {
      await markSubscriptionAsFree(event, "SUSPENDED");
    }

    if (eventType === "BILLING.SUBSCRIPTION.PAYMENT.FAILED") {
      await markSubscriptionAsFree(event, "PAYMENT_FAILED");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "PayPal webhook failed." },
      { status: 500 }
    );
  }
}