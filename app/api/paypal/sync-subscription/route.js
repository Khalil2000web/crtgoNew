import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPayPalSubscription } from "@/lib/paypal";
import { updateProfileFromPayPalSubscription } from "@/lib/paypal-subscription-sync";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("paypal_subscription_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.paypal_subscription_id) {
      return NextResponse.json(
        { error: "No PayPal subscription found." },
        { status: 400 }
      );
    }

    const subscription = await getPayPalSubscription(
      profile.paypal_subscription_id
    );

    const updated = await updateProfileFromPayPalSubscription(
      subscription,
      user.id
    );

    return NextResponse.json({
      ok: true,
      subscription,
      updated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to sync PayPal subscription." },
      { status: 500 }
    );
  }
}