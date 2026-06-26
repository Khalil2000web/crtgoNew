import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { cancelPayPalSubscription } from "@/lib/paypal";

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

    await cancelPayPalSubscription(profile.paypal_subscription_id);

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        plan: "free",
        paypal_subscription_status: "CANCELLED",
        subscription_status: "CANCELLED",
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to cancel PayPal subscription." },
      { status: 500 }
    );
  }
}