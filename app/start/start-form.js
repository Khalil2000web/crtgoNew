"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        const { data, error: signUpError } =
          await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
              data: {
                username: form.username.trim().toLowerCase(),
                display_name: form.displayName.trim(),
              },
            },
          });

        if (signUpError) throw signUpError;

        const user = data.user;

        if (!user) {
          throw new Error(
            "لم يتم إنشاء الحساب. حاول مرة أخرى."
          );
        }
      }

      if (mode === "login") {
        const { error: loginError } =
          await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
          });

        if (loginError) throw loginError;
      }

      router.push("/admin");
      router.refresh();

    } catch (err) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-5 py-8">
      <section className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center">

        <p className="mb-3 text-sm text-white/50">
          CRTRGO
        </p>

        <h1 className="text-4xl font-black tracking-tight">
          {mode === "login"
            ? "تسجيل الدخول"
            : "إنشاء حساب"}
        </h1>

        <div className="mt-8 grid grid-cols-2 rounded-full border border-white/15 p-1">

          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-full py-3 text-sm transition ${
              mode === "login"
                ? "bg-white text-black"
                : "text-white/60"
            }`}
          >
            دخول
          </button>

          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-full py-3 text-sm transition ${
              mode === "signup"
                ? "bg-white text-black"
                : "text-white/60"
            }`}
          >
            حساب جديد
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4"
        >

          {mode === "signup" && (
            <>
              <input
                required
                value={form.username}
                onChange={(e) =>
                  updateField(
                    "username",
                    e.target.value
                  )
                }
                placeholder="اسم المستخدم"
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 outline-none focus:border-white"
              />

              <input
                required
                value={form.displayName}
                onChange={(e) =>
                  updateField(
                    "displayName",
                    e.target.value
                  )
                }
                placeholder="اسم العرض"
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 outline-none focus:border-white"
              />
            </>
          )}

          <input
            required
            type="email"
            value={form.email}
            onChange={(e) =>
              updateField(
                "email",
                e.target.value
              )
            }
            placeholder="البريد الإلكتروني"
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 outline-none focus:border-white"
          />

          <input
            required
            type="password"
            value={form.password}
            onChange={(e) =>
              updateField(
                "password",
                e.target.value
              )
            }
            placeholder="كلمة المرور"
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 outline-none focus:border-white"
          />

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full cursor-pointer rounded-2xl bg-white px-4 py-4 font-bold text-black disabled:opacity-50"
          >
            {loading
              ? "جارٍ المعالجة..."
              : mode === "login"
              ? "دخول"
              : "إنشاء الحساب"}
          </button>

        </form>
      </section>
    </div>
  );
}