"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const DAYS = [
  { key: "sunday", label: "الأحد" },
  { key: "monday", label: "الإثنين" },
  { key: "tuesday", label: "الثلاثاء" },
  { key: "wednesday", label: "الأربعاء" },
  { key: "thursday", label: "الخميس" },
  { key: "friday", label: "الجمعة" },
  { key: "saturday", label: "السبت" },
];

function getDefaultHours() {
  const result = {};

  DAYS.forEach((day) => {
    result[day.key] = {
      enabled: false,
      from: "09:00",
      to: "17:00",
    };
  });

  return result;
}

function normalizeHours(value) {
  const defaults = getDefaultHours();

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaults;
  }

  const result = { ...defaults };

  DAYS.forEach((day) => {
    const current = value[day.key];

    if (current && typeof current === "object") {
      result[day.key] = {
        enabled: Boolean(current.enabled),
        from: current.from || "09:00",
        to: current.to || "17:00",
      };
    }
  });

  return result;
}

export default function HoursForm({ menu }) {
  const router = useRouter();
  const supabase = createClient();

  const [hours, setHours] = useState(() => normalizeHours(menu.working_hours));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const openDaysCount = useMemo(() => {
    return DAYS.filter((day) => hours[day.key]?.enabled).length;
  }, [hours]);

  function updateDay(dayKey, field, value) {
    setHours((current) => ({
      ...current,
      [dayKey]: {
        ...current[dayKey],
        [field]: value,
      },
    }));
  }

  function setAllOpen() {
    const updated = {};

    DAYS.forEach((day) => {
      updated[day.key] = {
        enabled: true,
        from: "09:00",
        to: "17:00",
      };
    });

    setHours(updated);
  }

  function setAllClosed() {
    const updated = {};

    DAYS.forEach((day) => {
      updated[day.key] = {
        ...hours[day.key],
        enabled: false,
      };
    });

    setHours(updated);
  }

  async function saveHours(e) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const { error } = await supabase
      .from("menus")
      .update({
        working_hours: hours,
      })
      .eq("id", menu.id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("تم حفظ ساعات العمل.");
    router.refresh();
  }

  return (
    <main dir="rtl" className="min-h-screen px-5 py-8 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/50">ساعات العمل</p>

            <h1 className="mt-2 text-5xl font-bold">مواعيد القائمة</h1>

            <p className="mt-3 max-w-2xl text-white/50">
              حدّد الأيام التي يعمل بها المكان، والوقت الذي يظهر للزبائن في صفحة القائمة.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black p-4 text-sm">
            <p className="text-white/50">الأيام المفتوحة</p>
            <p className="mt-1 text-3xl font-bold">
              {openDaysCount} / {DAYS.length}
            </p>
          </div>
        </div>

        {message && (
          <p className="mt-6 rounded-xl bg-green-500/10 p-4 text-sm text-green-300">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </p>
        )}

        <form onSubmit={saveHours} className="mt-10 space-y-6">
          <section className="rounded-xl bg-black p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-white/50">Schedule</p>
                <h2 className="mt-1 text-2xl font-bold">جدول الأسبوع</h2>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={setAllOpen}
                  className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-black"
                >
                  فتح كل الأيام
                </button>

                <button
                  type="button"
                  onClick={setAllClosed}
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/5"
                >
                  إغلاق الكل
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {DAYS.map((day) => {
                const current = hours[day.key];

                return (
                  <div
                    key={day.key}
                    className={`rounded-xl border p-4 transition ${
                      current.enabled
                        ? "border-white/20 bg-white/10"
                        : "border-white/10 bg-white/5 opacity-70"
                    }`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            updateDay(day.key, "enabled", !current.enabled)
                          }
                          className={`relative h-8 w-14 rounded-full transition ${
                            current.enabled ? "bg-white" : "bg-white/15"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-6 w-6 rounded-full transition ${
                              current.enabled
                                ? "right-7 bg-black"
                                : "right-1 bg-white/60"
                            }`}
                          />
                        </button>

                        <div>
                          <h3 className="text-lg font-bold">{day.label}</h3>
                          <p className="text-xs text-white/40">
                            {current.enabled ? "مفتوح" : "مغلق"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:w-[320px]">
                        <label>
                          <p className="mb-2 text-xs text-white/40">من</p>
                          <input
                            type="time"
                            value={current.from}
                            disabled={!current.enabled}
                            onChange={(e) =>
                              updateDay(day.key, "from", e.target.value)
                            }
                            className="input"
                          />
                        </label>

                        <label>
                          <p className="mb-2 text-xs text-white/40">إلى</p>
                          <input
                            type="time"
                            value={current.to}
                            disabled={!current.enabled}
                            onChange={(e) =>
                              updateDay(day.key, "to", e.target.value)
                            }
                            className="input"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl bg-black p-6">
            <p className="text-sm text-white/50">Preview</p>
            <h2 className="mt-1 text-2xl font-bold">كيف ستظهر للزبائن</h2>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {DAYS.map((day) => {
                const current = hours[day.key];

                return (
                  <div
                    key={day.key}
                    className="flex items-center justify-between rounded-xl bg-white/5 p-4"
                  >
                    <span className="font-bold">{day.label}</span>

                    <span className="text-sm text-white/50">
                      {current.enabled
                        ? `${current.from} - ${current.to}`
                        : "مغلق"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="sticky bottom-4 z-20 rounded-xl border border-white/10 bg-black/90 p-3 backdrop-blur">
            <button
              disabled={saving}
              className="w-full rounded-xl bg-white px-5 py-4 font-bold text-black disabled:opacity-50"
            >
              {saving ? "جارٍ الحفظ..." : "حفظ ساعات العمل"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}