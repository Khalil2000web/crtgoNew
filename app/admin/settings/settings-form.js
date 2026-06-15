"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsForm({ user, profile }) {
  const supabase = createClient();

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [password, setPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const plan = profile?.plan_id || "trial";
  const status = profile?.subscription_status || "unknown";

  const trialEnds = profile?.trial_ends_at
    ? new Date(profile.trial_ends_at)
    : null;

  const trialDaysLeft = trialEnds
    ? Math.max(
        0,
        Math.ceil((trialEnds - new Date()) / (1000 * 60 * 60 * 24))
      )
    : 0;

  async function saveProfile(e) {
    e.preventDefault();

    setSavingProfile(true);
    setMessage("");
    setError("");

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
      })
      .eq("id", user.id);

    setSavingProfile(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("تم حفظ معلومات الحساب.");
  }

  async function changePassword(e) {
    e.preventDefault();

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      return;
    }

    setSavingPassword(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setSavingPassword(false);

    if (error) {
      setError(error.message);
      return;
    }

    setPassword("");
    setMessage("تم تغيير كلمة المرور.");
  }

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        {message && (
          <p className="rounded-xl bg-green-500/10 p-4 text-sm text-green-300">
            {message}
          </p>
        )}

        {error && (
          <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </p>
        )}

        <section className="rounded-xl bg-black p-6">
          <div>
            <p className="text-sm text-white/50">Profile</p>
            <h2 className="mt-1 text-2xl font-bold">معلومات الحساب</h2>
          </div>

          <form onSubmit={saveProfile} className="mt-6 space-y-4">
            <Field label="اسم العرض">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="اسم العرض"
                className="input"
              />
            </Field>

            <Field label="اسم المستخدم">
              <input
                value={profile?.username || ""}
                disabled
                className="input cursor-not-allowed opacity-50"
              />

              <p className="mt-2 text-sm text-white/35">
                لا يمكن تغيير اسم المستخدم حالياً.
              </p>
            </Field>

            <Field label="البريد الإلكتروني">
              <input
                value={user.email || ""}
                disabled
                dir="ltr"
                className="input cursor-not-allowed text-left opacity-50"
              />
            </Field>

            <button
              disabled={savingProfile}
              className="w-full rounded-xl bg-white px-4 py-4 font-bold text-black disabled:opacity-50"
            >
              {savingProfile ? "جارٍ الحفظ..." : "حفظ معلومات الحساب"}
            </button>
          </form>
        </section>

        <section className="rounded-xl bg-black p-6">
          <div>
            <p className="text-sm text-white/50">Security</p>
            <h2 className="mt-1 text-2xl font-bold">تغيير كلمة المرور</h2>
          </div>

          <form onSubmit={changePassword} className="mt-6 space-y-4">
            <Field label="كلمة مرور جديدة">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="input"
              />
            </Field>

            <button
              disabled={savingPassword}
              className="w-full rounded-xl bg-white px-4 py-4 font-bold text-black disabled:opacity-50"
            >
              {savingPassword ? "جارٍ التغيير..." : "تغيير كلمة المرور"}
            </button>
          </form>
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
        <section className="rounded-xl bg-black p-6">
          <p className="text-sm text-white/50">الخطة الحالية</p>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/50">Plan</p>
            <h2 className="mt-1 text-4xl font-bold uppercase">{plan}</h2>

            <StatusText status={status} trialDaysLeft={trialDaysLeft} />
          </div>

          <Link
            href="/admin/upgrade"
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-white px-5 py-4 font-bold text-black"
          >
            إدارة الخطة
          </Link>

          <Link
            href="/admin/billing"
            className="mt-3 flex w-full items-center justify-center rounded-xl border border-white/10 px-5 py-4 font-bold text-white hover:bg-white/10"
          >
            الفوترة
          </Link>
        </section>

        <section className="rounded-xl bg-black p-6">
          <p className="text-sm text-white/50">Account ID</p>

          <p dir="ltr" className="mt-3 break-all text-left text-sm text-white/60">
            {user.id}
          </p>
        </section>
      </aside>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          color: white;
          padding: 1rem;
          outline: none;
        }

        .input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }

        .input:focus {
          border-color: white;
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}

function StatusText({ status, trialDaysLeft }) {
  if (status === "trialing") {
    return (
      <p className="mt-2 text-sm text-yellow-300">
        باقي {trialDaysLeft} أيام من الفترة التجريبية
      </p>
    );
  }

  if (status === "active") {
    return (
      <p className="mt-2 text-sm text-green-300">
        الاشتراك فعال
      </p>
    );
  }

  if (status === "expired") {
    return (
      <p className="mt-2 text-sm text-red-300">
        انتهت الفترة التجريبية
      </p>
    );
  }

  return (
    <p className="mt-2 text-sm text-white/50">
      الحالة: {status}
    </p>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-bold text-white/50">{label}</p>
      {children}
    </label>
  );
}