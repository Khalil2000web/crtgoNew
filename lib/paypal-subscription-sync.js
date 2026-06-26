import { supabaseAdmin } from "@/lib/supabase/admin";

export function isActivePayPalSubscription(status) {
  return String(status || "").toUpperCase() === "ACTIVE";
}

export function getPayPalNextBillingTime(subscription) {
  return subscription?.billing_info?.next_billing_time || null;
}

export function getPayPalBillingEmail(subscription) {
  return subscription?.subscriber?.email_address || null;
}

export async function updateProfileFromPayPalSubscription(
  subscription,
  fallbackUserId = null
) {
  if (!subscription?.id) {
    throw new Error("Missing PayPal subscription ID.");
  }

  const userId = fallbackUserId || subscription.custom_id || null;
  const status = String(subscription.status || "").toUpperCase();
  const isActive = isActivePayPalSubscription(status);

  const updateData = {
    plan: isActive ? "pro" : "free",
    paypal_subscription_id: subscription.id,
    paypal_subscription_status: status,
    paypal_plan_id: subscription.plan_id || process.env.PAYPAL_PRO_PLAN_ID,
    subscription_status: status,
    subscription_current_period_end: getPayPalNextBillingTime(subscription),
    billing_email: getPayPalBillingEmail(subscription),
  };

  let query = supabaseAdmin.from("profiles").update(updateData);

  if (userId) {
    query = query.eq("id", userId);
  } else {
    query = query.eq("paypal_subscription_id", subscription.id);
  }

  const { error } = await query;

  if (error) {
    throw error;
  }

  return updateData;
}