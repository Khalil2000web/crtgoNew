function getPayPalBaseUrl() {
  return process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function getPayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PayPal client ID or client secret.");
  }

  return { clientId, clientSecret };
}

export async function getPayPalAccessToken() {
  const { clientId, clientSecret } = getPayPalCredentials();

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_description || "Failed to get PayPal token.");
  }

  return data.access_token;
}

export async function paypalFetch(path, options = {}) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${getPayPalBaseUrl()}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      data?.details?.[0]?.description ||
      data?.message ||
      data?.name ||
      "PayPal request failed.";

    throw new Error(message);
  }

  return data;
}

export function getPayPalApprovalUrl(subscription) {
  return (
    subscription?.links?.find((link) => link.rel === "approve")?.href ||
    subscription?.links?.find((link) => link.rel === "payer-action")?.href ||
    ""
  );
}

export async function createPayPalSubscription({
  userId,
  planId,
  returnUrl,
  cancelUrl,
}) {
  return paypalFetch("/v1/billing/subscriptions", {
    method: "POST",
    headers: {
      "PayPal-Request-Id": `crtgo-${userId}-${Date.now()}`,
    },
    body: JSON.stringify({
      plan_id: planId,
      custom_id: userId,
      application_context: {
        brand_name: "CRTGO",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });
}

export async function getPayPalSubscription(subscriptionId) {
  return paypalFetch(`/v1/billing/subscriptions/${subscriptionId}`, {
    method: "GET",
  });
}

export async function cancelPayPalSubscription(subscriptionId) {
  return paypalFetch(`/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    body: JSON.stringify({
      reason: "User cancelled from CRTGO account page.",
    }),
  });
}

export async function verifyPayPalWebhook({ headers, event }) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!webhookId) {
    throw new Error("Missing PAYPAL_WEBHOOK_ID.");
  }

  const payload = {
    auth_algo: headers.get("paypal-auth-algo"),
    cert_url: headers.get("paypal-cert-url"),
    transmission_id: headers.get("paypal-transmission-id"),
    transmission_sig: headers.get("paypal-transmission-sig"),
    transmission_time: headers.get("paypal-transmission-time"),
    webhook_id: webhookId,
    webhook_event: event,
  };

  const missingField = Object.entries(payload).find(([, value]) => !value);

  if (missingField) {
    return false;
  }

  const result = await paypalFetch("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result?.verification_status === "SUCCESS";
}