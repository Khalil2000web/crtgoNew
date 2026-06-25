"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CreditCard,
  Fingerprint,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  AdminAlert,
  AdminButton,
  AdminCard,
  AdminField,
  AdminInput,
  AdminLinkButton,
  AdminRow,
  AdminStatStrip,
} from "@/components/admin/AdminUI";

function getPlanLabel(plan) {
  const labels = {
    basic: "Basic",
    pro: "Pro",
    business: "Business",
    trial: "Trial",
  };

  return labels[plan] || plan || "Trial";
}

function getStatusLabel(status) {
  const labels = {
    active: "فعال",
    trialing: "تجريبي",
    inactive: "غير فعال",
    expired: "منتهي",
    cancelled: "ملغي",
  };

  return labels[status] || status || "غير معروف";
}

function getTrialDaysLeft(profile) {
  if (!profile?.trial_ends_at) return 0;

  return Math.max(
    0,
    Math.ceil(
      (new Date(profile.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24)
    )
  );
}

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
  const trialDaysLeft = getTrialDaysLeft(profile);

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
    <div className="mt-5 grid gap-5">
      {(message || error) && (
        <div>
          {message && <AdminAlert type="success">{message}</AdminAlert>}
          {error && <AdminAlert type="error">{error}</AdminAlert>}
        </div>
      )}

      <AdminStatStrip
        stats={[
          {
            label: "الخطة الحالية",
            value: getPlanLabel(plan),
            hint: "يمكنك إدارتها من صفحة الخطط",
            icon: <CreditCard size={20} />,
          },
          {
            label: "حالة الحساب",
            value: getStatusLabel(status),
            hint:
              status === "trialing"
                ? `باقي ${trialDaysLeft} أيام`
                : status || "unknown",
            icon: <ShieldCheck size={20} />,
          },
          {
            label: "البريد",
            value: user.email ? "مربوط" : "غير محدد",
            hint: user.email || "No email",
            icon: <Mail size={20} />,
          },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="grid gap-5">
          <AdminCard>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#15120d] text-white">
                <UserRound size={20} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#15120d]/45">Profile</p>
                <h2 className="mt-1 text-2xl font-black text-[#15120d]">
                  معلومات الحساب
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#15120d]/50">
                  هذه المعلومات تظهر داخل لوحة التحكم وتساعدك تميز حسابك.
                </p>
              </div>
            </div>

            <form onSubmit={saveProfile} className="mt-5 grid gap-4">
              <AdminField label="اسم العرض">
                <AdminInput
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="اسم العرض"
                />
              </AdminField>

              <AdminField
                label="اسم المستخدم"
                hint="لا يمكن تغيير اسم المستخدم حالياً."
              >
                <AdminInput
                  value={profile?.username || ""}
                  disabled
                  className="cursor-not-allowed opacity-55"
                />
              </AdminField>

              <AdminField label="البريد الإلكتروني">
                <AdminInput
                  value={user.email || ""}
                  disabled
                  dir="ltr"
                  className="cursor-not-allowed text-left opacity-55"
                />
              </AdminField>

              <AdminButton
                type="submit"
                variant="primary"
                loading={savingProfile}
                disabled={savingProfile}
                className="w-full"
              >
                {savingProfile ? "جارٍ الحفظ..." : "حفظ معلومات الحساب"}
              </AdminButton>
            </form>
          </AdminCard>

          <AdminCard>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#15120d] text-white">
                <KeyRound size={20} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#15120d]/45">Security</p>
                <h2 className="mt-1 text-2xl font-black text-[#15120d]">
                  تغيير كلمة المرور
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#15120d]/50">
                  اختر كلمة مرور جديدة وقوية لحسابك.
                </p>
              </div>
            </div>

            <form onSubmit={changePassword} className="mt-5 grid gap-4">
              <AdminField label="كلمة مرور جديدة">
                <AdminInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                />
              </AdminField>

              <AdminButton
                type="submit"
                variant="primary"
                loading={savingPassword}
                disabled={savingPassword}
                className="w-full"
              >
                {savingPassword ? "جارٍ التغيير..." : "تغيير كلمة المرور"}
              </AdminButton>
            </form>
          </AdminCard>
        </section>

        <aside className="grid gap-4 lg:sticky lg:top-6 lg:h-fit">
          <AdminCard>
            <p className="text-sm font-bold text-[#15120d]/45">الخطة</p>

            <div className="mt-4 rounded-2xl border border-[#241b12]/12 bg-[#f4ecdc] p-4">
              <p className="text-sm font-bold text-[#15120d]/45">Plan</p>

              <h2 className="mt-1 text-4xl font-black uppercase text-[#15120d]">
                {getPlanLabel(plan)}
              </h2>

              <StatusText status={status} trialDaysLeft={trialDaysLeft} />
            </div>

            <div className="mt-4 grid gap-2">
              <AdminLinkButton href="/admin/upgrade" variant="primary">
                إدارة الخطة
              </AdminLinkButton>

              <AdminLinkButton href="/admin/billing" variant="secondary">
                الفوترة
              </AdminLinkButton>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f4ecdc] text-[#15120d]">
                <Fingerprint size={19} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-[#15120d]/45">
                  Account ID
                </p>

                <p
                  dir="ltr"
                  className="mt-2 break-all text-left text-xs font-semibold leading-5 text-[#15120d]/55"
                >
                  {user.id}
                </p>
              </div>
            </div>
          </AdminCard>

          <AdminRow>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-700/10 text-green-800">
                {savingProfile || savingPassword ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <ShieldCheck size={18} />
                )}
              </div>

              <div>
                <p className="font-black text-[#15120d]">الحساب آمن</p>
                <p className="mt-1 text-sm text-[#15120d]/45">
                  التغييرات تتم من خلال Supabase Auth.
                </p>
              </div>
            </div>
          </AdminRow>
        </aside>
      </div>
    </div>
  );
}

function StatusText({ status, trialDaysLeft }) {
  if (status === "trialing") {
    return (
      <p className="mt-2 text-sm font-bold text-yellow-900">
        باقي {trialDaysLeft} أيام من الفترة التجريبية
      </p>
    );
  }

  if (status === "active") {
    return (
      <p className="mt-2 text-sm font-bold text-green-800">الاشتراك فعال</p>
    );
  }

  if (status === "expired") {
    return (
      <p className="mt-2 text-sm font-bold text-red-700">
        انتهت الفترة التجريبية
      </p>
    );
  }

  return (
    <p className="mt-2 text-sm font-bold text-[#15120d]/50">
      الحالة: {status}
    </p>
  );
}