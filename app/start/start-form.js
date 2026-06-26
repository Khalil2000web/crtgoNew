"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Mail,
  Sparkles,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TRIAL_DAYS = 14;

function normalizeUsername(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/[-_.]{2,}/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "");
}

function isValidUsername(value) {
  return /^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])?$/.test(value);
}

function getTrialEndsAt() {
  const date = new Date();
  date.setDate(date.getDate() + TRIAL_DAYS);
  return date.toISOString();
}

function getErrorMessage(error) {
  const message = String(error?.message || "");

  if (message.toLowerCase().includes("invalid login credentials")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }

  if (message.toLowerCase().includes("user already registered")) {
    return "هذا البريد الإلكتروني مستخدم من قبل.";
  }

  if (message.toLowerCase().includes("password")) {
    return "كلمة المرور غير مقبولة. استخدم كلمة مرور أطول.";
  }

  if (message.toLowerCase().includes("duplicate")) {
    return "اسم المستخدم أو البريد الإلكتروني مستخدم من قبل.";
  }

  return message || "حدث خطأ غير متوقع.";
}

export default function StartForm() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    displayName: "",
  });

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setError("");
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
  }

  async function createProfile(user) {
    const username = normalizeUsername(form.username);
    const displayName = form.displayName.trim();
    const email = form.email.trim().toLowerCase();

    const trialEndsAt = getTrialEndsAt();

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email,
        username,
        full_name: displayName,
        plan: "free",
        trial_ends_at: trialEndsAt,
        subscription_status: "trialing",
        billing_email: email,
      },
      {
        onConflict: "id",
      }
    );

    if (profileError) {
      throw profileError;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const email = form.email.trim().toLowerCase();
      const password = form.password;

      if (!email || !password) {
        throw new Error("اكتب البريد الإلكتروني وكلمة المرور.");
      }

      if (mode === "signup") {
        const username = normalizeUsername(form.username);
        const displayName = form.displayName.trim();

        if (!username) {
          throw new Error("اكتب اسم المستخدم.");
        }

        if (!isValidUsername(username)) {
          throw new Error(
            "اسم المستخدم يجب أن يكون 3 أحرف على الأقل وبالإنجليزي فقط."
          );
        }

        if (!displayName) {
          throw new Error("اكتب اسم العرض.");
        }

        if (password.length < 6) {
          throw new Error("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              display_name: displayName,
            },
          },
        });

        if (signUpError) throw signUpError;

        const user = data.user;

        if (!user) {
          throw new Error("لم يتم إنشاء الحساب. حاول مرة أخرى.");
        }

        await createProfile(user);
      }

      if (mode === "login") {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) throw loginError;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#cfc6b8] px-4 py-6 text-[#1b1712] sm:px-5"
    >
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[minmax(0,1fr)_430px]">
        <section className="hidden rounded-3xl border border-[#8f806c]/55 bg-[#d8cebe] p-6 shadow-sm shadow-black/5 lg:block">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1b1712] text-[#efe7da]">
            <Sparkles size={26} />
          </div>

          <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-[#1b1712]/45">
            CRTGO Digital Menus
          </p>

          <h1 className="mt-2 max-w-xl text-5xl font-black leading-tight text-[#1b1712]">
            لوحة ذكية لإدارة القوائم الرقمية.
          </h1>

          <p className="mt-4 max-w-xl text-sm font-bold leading-7 text-[#1b1712]/58">
            أنشئ قائمة، أضف الأقسام والأصناف، جهّز الرابط والـ QR، وابدأ تجربة مجانية لمدة {TRIAL_DAYS} يوم.
          </p>

          <div className="mt-8 grid gap-3">
            <Feature text="تجربة مجانية للحسابات الجديدة" />
            <Feature text="إدارة القوائم، الصور، اللغات، وساعات العمل" />
            <Feature text="جاهز لاحقاً للدفع والاشتراك عبر PayPal" />
          </div>
        </section>

        <section className="rounded-3xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5 sm:p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1b1712]/45">
              CRTGO
            </p>

            <h1 className="mt-2 text-3xl font-black text-[#1b1712]">
              {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
            </h1>

            <p className="mt-2 text-sm font-bold leading-6 text-[#1b1712]/52">
              {mode === "login"
                ? "ادخل إلى لوحة التحكم الخاصة بك."
                : `ابدأ حسابك مع تجربة مجانية لمدة ${TRIAL_DAYS} يوم.`}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 rounded-2xl border border-[#8f806c]/55 bg-[#d1c5b4] p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`min-h-11 cursor-pointer rounded-xl text-sm font-black transition active:scale-[0.98] ${
                mode === "login"
                  ? "bg-[#1b1712] text-[#efe7da]"
                  : "text-[#1b1712]/55 hover:bg-[#ded4c5]"
              }`}
            >
              دخول
            </button>

            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`min-h-11 cursor-pointer rounded-xl text-sm font-black transition active:scale-[0.98] ${
                mode === "signup"
                  ? "bg-[#1b1712] text-[#efe7da]"
                  : "text-[#1b1712]/55 hover:bg-[#ded4c5]"
              }`}
            >
              حساب جديد
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
            {mode === "signup" && (
              <>
                <Field icon={<User size={16} />} label="اسم المستخدم">
                  <input
                    required
                    value={form.username}
                    onChange={(e) =>
                      updateField("username", normalizeUsername(e.target.value))
                    }
                    placeholder="example-menu"
                    dir="ltr"
                    className="input"
                  />
                </Field>

                <Field icon={<User size={16} />} label="اسم العرض">
                  <input
                    required
                    value={form.displayName}
                    onChange={(e) =>
                      updateField("displayName", e.target.value)
                    }
                    placeholder="مثال: Khalil"
                    className="input"
                  />
                </Field>
              </>
            )}

            <Field icon={<Mail size={16} />} label="البريد الإلكتروني">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="you@example.com"
                dir="ltr"
                className="input"
              />
            </Field>

            <Field icon={<LockKeyhole size={16} />} label="كلمة المرور">
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="input"
              />
            </Field>

            {error && (
              <p className="rounded-xl border border-red-900/25 bg-red-700/12 p-3 text-sm font-bold leading-6 text-red-950">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] px-4 py-3 text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}

              {loading
                ? "جارٍ المعالجة..."
                : mode === "login"
                  ? "دخول"
                  : "إنشاء الحساب"}
            </button>
          </form>

          {mode === "signup" && (
            <div className="mt-4 rounded-2xl border border-green-900/25 bg-green-800/12 p-3">
              <div className="flex gap-2">
                <CheckCircle2
                  size={17}
                  className="mt-1 shrink-0 text-green-950"
                />

                <p className="text-sm font-bold leading-6 text-green-950/70">
                  بعد إنشاء الحساب سيتم تفعيل تجربة مجانية لمدة {TRIAL_DAYS} يوم تلقائياً.
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              switchMode(mode === "login" ? "signup" : "login")
            }
            className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-black text-[#1b1712]/55 transition hover:text-[#1b1712]"
          >
            <ArrowRight size={15} />
            {mode === "login"
              ? "ليس لديك حساب؟ أنشئ حساب جديد"
              : "لديك حساب؟ سجل الدخول"}
          </button>
        </section>
      </section>

      <style jsx>{`
        .input {
          min-height: 44px;
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(143 128 108 / 0.5);
          background: #ded4c5;
          padding: 0.7rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 800;
          color: #1b1712;
          outline: none;
        }

        .input::placeholder {
          color: rgb(27 23 18 / 0.3);
        }

        .input:focus {
          border-color: #1b1712;
        }
      `}</style>
    </main>
  );
}

function Field({ icon, label, children }) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center gap-2 text-sm font-black text-[#1b1712]/60">
        {icon}
        {label}
      </span>

      {children}
    </label>
  );
}

function Feature({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#8f806c]/45 bg-[#ded4c5] px-3 py-3">
      <CheckCircle2 size={17} className="shrink-0 text-green-950" />
      <span className="text-sm font-black text-[#1b1712]/62">{text}</span>
    </div>
  );
}