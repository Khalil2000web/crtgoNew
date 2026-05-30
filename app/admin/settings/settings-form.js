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

  const plan = profile?.plan || "basic";

  return (
    <div className="mt-8 space-y-6">
      {message && (
        <p className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="rounded-3xl border border-black/10 p-5">
        <h2 className="text-xl font-bold">معلومات الحساب</h2>

        <form onSubmit={saveProfile} className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-black/60">
              اسم العرض
            </label>

            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-2xl border border-black/15 bg-transparent px-4 py-4 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-black/60">
              اسم المستخدم
            </label>

            <input
              value={profile?.username || ""}
              disabled
              className="w-full cursor-not-allowed rounded-2xl border border-black/10 bg-black/5 px-4 py-4 text-black/50"
            />

            <p className="mt-2 text-sm text-black/40">
              لا يمكن تغيير اسم المستخدم.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-black/60">
              البريد الإلكتروني
            </label>

            <input
              value={user.email || ""}
              disabled
              dir="ltr"
              className="w-full cursor-not-allowed rounded-2xl border border-black/10 bg-black/5 px-4 py-4 text-left text-black/50"
            />
          </div>

          <button
            disabled={savingProfile}
            className="w-full rounded-2xl cursor-pointer hover:bg-black/80 bg-black px-4 py-4 font-bold text-white disabled:opacity-50"
          >
            {savingProfile ? "جارٍ الحفظ..." : "حفظ معلومات الحساب"}
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-black/10 p-5">
        <h2 className="text-xl font-bold">الخطة الحالية</h2>

        <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-black p-5 text-white">
          <div>
            <p className="text-sm text-white/50">خطتك</p>
            <p className="mt-1 text-2xl font-black uppercase">{plan}</p>
          </div>

          <Link
            href="/admin/upgrade"
            className="rounded-full bg-white px-5 py-3 font-bold text-black"
          >
            ترقية الخطة
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 p-5">
        <h2 className="text-xl font-bold">تغيير كلمة المرور</h2>

        <form onSubmit={changePassword} className="mt-5 space-y-4">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="كلمة مرور جديدة"
            className="w-full rounded-2xl border border-black/15 bg-transparent px-4 py-4 outline-none focus:border-black"
          />

          <button
            disabled={savingPassword}
            className="w-full rounded-2xl cursor-pointer hover:bg-black/80 bg-black px-4 py-4 font-bold text-white disabled:opacity-50"
          >
            {savingPassword ? "جارٍ التغيير..." : "تغيير كلمة المرور"}
          </button>
        </form>
      </div>
    </div>
  );
}