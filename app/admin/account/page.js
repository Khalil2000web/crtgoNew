import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountClient from "./account-client";

export const metadata = {
  title: "Account",
};

function createSafeProfile(user, profile) {
  return {
    id: profile?.id || user.id,
    email: profile?.email || user.email || "",
    full_name: profile?.full_name || profile?.name || "",
    username: profile?.username || "",
    plan: profile?.plan || "free",
    trial_ends_at: profile?.trial_ends_at || null,
    paypal_subscription_id: profile?.paypal_subscription_id || null,
    paypal_subscription_status: profile?.paypal_subscription_status || null,
    paypal_plan_id: profile?.paypal_plan_id || null,
    subscription_status:
      profile?.subscription_status || profile?.paypal_subscription_status || null,
    subscription_current_period_end:
      profile?.subscription_current_period_end || null,
    created_at: profile?.created_at || null,
  };
}

export default async function AccountPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/start");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const safeProfile = createSafeProfile(user, profile);

  return (
    <AccountClient
      user={{
        id: user.id,
        email: user.email,
      }}
      profile={safeProfile}
      paymentStatus={resolvedSearchParams?.payment || ""}
    />
  );
}