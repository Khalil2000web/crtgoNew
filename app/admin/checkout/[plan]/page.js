import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckoutClient from "./checkout-client";

const plans = {
  basic: {
    id: "basic",
    name: "Basic",
    price: "₪49",
    paypalPlanId: process.env.PAYPAL_BASIC_PLAN_ID,
    features: ["قائمة واحدة", "حتى 50 صنف", "روابط التواصل", "دعم أساسي"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "₪99",
    paypalPlanId: process.env.PAYPAL_PRO_PLAN_ID,
    features: ["حتى 5 قوائم", "عدد أصناف غير محدود", "قوالب متعددة", "دعم أولوية"],
  },
  business: {
    id: "business",
    name: "Business",
    price: "₪199",
    paypalPlanId: process.env.PAYPAL_BUSINESS_PLAN_ID,
    features: ["قوائم غير محدودة", "ميزات مستقبلية أولاً", "إدارة متقدمة", "دعم كامل"],
  },
};

export default async function CheckoutPage({ params }) {
  const { plan } = await params;
  const selectedPlan = plans[plan];

  if (!selectedPlan) notFound();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/start");

  return (
    <CheckoutClient
      userId={user.id}
      plan={selectedPlan}
      clientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}
    />
  );
}