"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Crown,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

function getDaysLeft(value) {
  if (!value) return 0;

  const end = new Date(value).getTime();
  const now = Date.now();

  if (Number.isNaN(end)) return 0;

  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
}

function isPayPalActive(status) {
  return String(status || "").toUpperCase() === "ACTIVE";
}

function getAccessState(profile) {
  const plan = profile?.plan || "free";
  const trialDaysLeft = getDaysLeft(profile?.trial_ends_at);

  const hasActiveTrial = trialDaysLeft > 0;
  const hasActivePro =
    plan === "pro" && isPayPalActive(profile?.paypal_subscription_status);

  if (hasActivePro) {
    return {
      allowed: true,
      key: "pro",
      title: "Pro مفعل",
      description: "اشتراكك مفعل وكل ميزات CRTGO متاحة.",
      daysLeft: trialDaysLeft,
    };
  }

  if (hasActiveTrial) {
    return {
      allowed: true,
      key: "trial",
      title: "التجربة المجانية مفعلة",
      description: `لديك ${trialDaysLeft} أيام متبقية من التجربة المجانية.`,
      daysLeft: trialDaysLeft,
    };
  }

  return {
    allowed: false,
    key: "expired",
    title: "انتهت التجربة المجانية",
    description: "فعّل Pro للاستمرار باستخدام لوحة التحكم والقوائم.",
    daysLeft: 0,
  };
}

export default function AdminAccessGate({ profile, children }) {
  const pathname = usePathname();

  const access = getAccessState(profile);

  const isAccountPage = pathname === "/admin/account";
  const isStartPage = pathname === "/start";

  // Account page must always stay open so the user can upgrade/pay.
  if (access.allowed || isAccountPage || isStartPage) {
    return children;
  }

  return (
    <main dir="rtl" className="min-h-screen px-4 pb-32 pt-4 sm:px-5 lg:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-[#8f806c]/55 bg-[#d8cebe] p-5 shadow-sm shadow-black/5 sm:p-7">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1b1712] text-[#efe7da]">
            <LockKeyhole size={26} />
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
            Account Access
          </p>

          <h1 className="mt-2 text-3xl font-black text-[#1b1712] sm:text-5xl">
            {access.title}
          </h1>

          <p className="mt-4 max-w-2xl text-sm font-bold leading-7 text-[#1b1712]/58">
            {access.description}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <StatusBox
              icon={<CalendarDays size={18} />}
              label="التجربة"
              value="منتهية"
              hint="لا يوجد أيام متبقية"
              alert
            />

            <StatusBox
              icon={<Crown size={18} />}
              label="الخطة"
              value={profile?.plan || "free"}
              hint="تحتاج Pro"
              alert
            />

            <StatusBox
              icon={<TriangleAlert size={18} />}
              label="الوصول"
              value="مغلق"
              hint="حتى يتم الدفع"
              alert
            />
          </div>

          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admin/account"
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] px-5 py-3 text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] active:scale-[0.98]"
            >
              <Sparkles size={17} />
              تفعيل Pro
            </Link>

            <Link
              href="/admin/account"
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#ded4c5] px-5 py-3 text-sm font-black text-[#1b1712]/70 transition hover:bg-[#cfc3b2] active:scale-[0.98]"
            >
              <ArrowRight size={17} />
              الذهاب للحساب
            </Link>
          </div>
        </div>

        <section className="mt-4 rounded-2xl border border-green-900/25 bg-green-800/12 p-4">
          <div className="flex gap-3">
            <ShieldCheck size={19} className="mt-1 shrink-0 text-green-950" />

            <div>
              <h2 className="text-base font-black text-green-950">
                ليش الحساب مش محذوف؟
              </h2>

              <p className="mt-1 text-sm font-bold leading-6 text-green-950/70">
                الحساب والقوائم تبقى محفوظة. بس لوحة التحكم تنغلق بعد انتهاء التجربة إلى أن يتم تفعيل Pro.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function StatusBox({ icon, label, value, hint, alert }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3 shadow-sm shadow-black/5 ${
        alert
          ? "border-yellow-900/25 bg-yellow-700/15"
          : "border-[#8f806c]/55 bg-[#ded4c5]"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] text-[#1b1712]/70">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-black text-[#1b1712]/45">{label}</p>
        <p className="truncate text-xl font-black text-[#1b1712]">{value}</p>
        <p className="truncate text-xs font-bold text-[#1b1712]/42">{hint}</p>
      </div>
    </div>
  );
}