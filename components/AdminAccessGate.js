"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function getAccessState(profile) {
  if (!profile) {
    return {
      allowed: false,
      status: "unknown",
      message: "لم يتم العثور على بيانات الحساب.",
    };
  }

  if (profile.subscription_status === "active") {
    return {
      allowed: true,
      status: "active",
      message: "الاشتراك فعال.",
    };
  }

  if (profile.subscription_status === "trialing") {
    const trialEndsAt = profile.trial_ends_at
      ? new Date(profile.trial_ends_at)
      : null;

    const trialActive = trialEndsAt && trialEndsAt > new Date();

    if (trialActive) {
      return {
        allowed: true,
        status: "trialing",
        message: "الفترة التجريبية فعالة.",
      };
    }

    return {
      allowed: false,
      status: "expired",
      message: "انتهت الفترة التجريبية.",
    };
  }

  return {
    allowed: false,
    status: profile.subscription_status || "expired",
    message: "الاشتراك غير فعال.",
  };
}

function SubscriptionWall({ access }) {
  return (
    <main dir="rtl" className="min-h-screen px-5 py-10">
      <section className="mx-auto max-w-2xl rounded-3xl border border-black/20 p-6 text-center">
        <p className="text-sm text-black/50">CRTGO</p>

        <h1 className="mt-3 text-4xl font-black">انتهت الفترة التجريبية</h1>

        <p className="mt-4 text-black/60">
          للاكمال في استخدام لوحة التحكم ونشر القوائم الرقمية، اختر خطة مناسبة.
        </p>

        <div className="mt-6 rounded-2xl bg-black/5 p-4 text-sm text-black/60">
          {access.message}
        </div>

        <Link
          href="/admin/upgrade"
          className="mt-6 inline-flex rounded-2xl bg-black px-6 py-4 font-bold text-white"
        >
          اختيار خطة
        </Link>
      </section>
    </main>
  );
}

export default function AdminAccessGate({ profile, children }) {
  const pathname = usePathname();

  const access = getAccessState(profile);
  const isUpgradePage = pathname?.startsWith("/admin/upgrade");

  if (!access.allowed && !isUpgradePage) {
    return <SubscriptionWall access={access} />;
  }

  return children;
}