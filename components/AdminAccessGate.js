"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function getAccessState(profile) {
  if (!profile) {
    return {
      allowed: false,
      status: "unknown",
      title: "الاشتراك غير فعال",
      message: "لم يتم العثور على بيانات الحساب.",
    };
  }

  if (profile.subscription_status === "active") {
    return {
      allowed: true,
      status: "active",
      title: "الاشتراك فعال",
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
        title: "الفترة التجريبية فعالة",
        message: "الفترة التجريبية فعالة.",
      };
    }

    return {
      allowed: false,
      status: "expired",
      title: "انتهت الفترة التجريبية",
      message: "انتهت الفترة التجريبية. اختر خطة مناسبة للاستمرار.",
    };
  }

  return {
    allowed: false,
    status: profile.subscription_status || "inactive",
    title: "الاشتراك غير فعال",
    message: "الاشتراك غير فعال حالياً. يمكنك إدارته من صفحة الفوترة.",
  };
}

function SubscriptionWall({ access }) {
  return (
    <main dir="rtl" className="min-h-screen px-5 py-10">
      <section className="mx-auto max-w-2xl rounded-3xl bg-white p-6 text-center">
        <p className="text-sm text-black/50">CRTGO</p>

        <h1 className="mt-3 text-4xl font-bold">{access.title}</h1>

        <p className="mt-4 text-black/60">{access.message}</p>

        <div className="mt-6 rounded-2xl bg-black/5 p-4 text-sm text-black/60">
          الحالة الحالية: {access.status}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/admin/upgrade"
            className="rounded-2xl bg-black px-6 py-4 font-bold text-white"
          >
            اختيار خطة
          </Link>

          <Link
            href="/admin/billing"
            className="rounded-2xl border border-black/15 px-6 py-4 font-bold text-black"
          >
            الفوترة
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function AdminAccessGate({ profile, children }) {
  const pathname = usePathname();

  const access = getAccessState(profile);

  const allowedRoutesWhenLocked = [
    "/admin/upgrade",
    "/admin/checkout",
    "/admin/billing",
    "/admin/support",
    "/admin/settings",
  ];

  const isAllowedRouteWhenLocked = allowedRoutesWhenLocked.some((route) =>
    pathname?.startsWith(route)
  );

  if (!access.allowed && !isAllowedRouteWhenLocked) {
    return <SubscriptionWall access={access} />;
  }

  return children;
}