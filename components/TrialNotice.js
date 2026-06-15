"use client";

import Link from "next/link";

function getDaysLeft(date) {
  if (!date) return 0;

  return Math.max(
    0,
    Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
  );
}

export default function TrialNotice({ profile }) {
  if (!profile) return null;

  if (profile.subscription_status !== "trialing") {
    return null;
  }

  const daysLeft = getDaysLeft(profile.trial_ends_at);

  const urgent = daysLeft <= 1;

  return (
    <div
      dir="rtl"
      className={`border-b px-5 py-3 text-sm ${
        urgent
          ? "border-red-500/20 bg-red-500/10 text-red-800"
          : "border-black/10 bg-white text-black"
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="font-bold">
          {daysLeft > 0
            ? `باقي ${daysLeft} أيام من الفترة التجريبية`
            : "انتهت الفترة التجريبية"}
        </p>

        <Link
          href="/admin/upgrade"
          className={`rounded-full px-4 py-2 font-bold ${
            urgent ? "bg-red-600 text-white" : "bg-black text-white"
          }`}
        >
          اختر خطة
        </Link>
      </div>
    </div>
  );
}