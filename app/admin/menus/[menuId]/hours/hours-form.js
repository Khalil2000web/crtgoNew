"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Moon,
  RotateCcw,
  Save,
  SunMedium,
  TimerReset,
  TriangleAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { revalidatePublicMenu } from "@/lib/revalidate-public-menu";

const DAYS = [
  { key: "sunday", label: "الأحد", short: "أحد" },
  { key: "monday", label: "الإثنين", short: "إثن" },
  { key: "tuesday", label: "الثلاثاء", short: "ثلا" },
  { key: "wednesday", label: "الأربعاء", short: "أرب" },
  { key: "thursday", label: "الخميس", short: "خمي" },
  { key: "friday", label: "الجمعة", short: "جمع" },
  { key: "saturday", label: "السبت", short: "سبت" },
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

function timeToMinutes(value) {
  const [hours, minutes] = String(value || "00:00")
    .split(":")
    .map((part) => Number(part));

  return hours * 60 + minutes;
}

function isOvernight(from, to) {
  return timeToMinutes(to) <= timeToMinutes(from);
}

function getDayText(dayHours) {
  if (!dayHours?.enabled) return "مغلق";

  const overnight = isOvernight(dayHours.from, dayHours.to);

  return `${dayHours.from} - ${dayHours.to}${overnight ? " +1" : ""}`;
}

export default function HoursForm({ menu }) {
  const router = useRouter();
  const supabase = createClient();

  const [initialHours, setInitialHours] = useState(() =>
    normalizeHours(menu.working_hours)
  );
  const [hours, setHours] = useState(() => normalizeHours(menu.working_hours));

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hasChanges = JSON.stringify(hours) !== JSON.stringify(initialHours);

  const openDaysCount = useMemo(() => {
    return DAYS.filter((day) => hours[day.key]?.enabled).length;
  }, [hours]);

  const overnightCount = useMemo(() => {
    return DAYS.filter((day) => {
      const current = hours[day.key];
      return current?.enabled && isOvernight(current.from, current.to);
    }).length;
  }, [hours]);

  const publicPath = menu.subdomain ? `/m/${menu.subdomain}` : null;

  function clearAlerts() {
    setMessage("");
    setError("");
  }

  function updateDay(dayKey, field, value) {
    clearAlerts();

    setHours((current) => ({
      ...current,
      [dayKey]: {
        ...current[dayKey],
        [field]: value,
      },
    }));
  }

  function setAllOpen() {
    clearAlerts();

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
    clearAlerts();

    const updated = {};

    DAYS.forEach((day) => {
      updated[day.key] = {
        ...hours[day.key],
        enabled: false,
      };
    });

    setHours(updated);
  }

  function setRestaurantPreset() {
    clearAlerts();

    const updated = {};

    DAYS.forEach((day) => {
      updated[day.key] = {
        enabled: !["friday"].includes(day.key),
        from: "12:00",
        to: "23:00",
      };
    });

    setHours(updated);
  }

  function setCafePreset() {
    clearAlerts();

    const updated = {};

    DAYS.forEach((day) => {
      updated[day.key] = {
        enabled: true,
        from: "08:00",
        to: "22:00",
      };
    });

    setHours(updated);
  }

  function applyFirstOpenDayToAll() {
    clearAlerts();

    const firstOpenDay = DAYS.find((day) => hours[day.key]?.enabled);
    if (!firstOpenDay) return;

    const source = hours[firstOpenDay.key];
    const updated = {};

    DAYS.forEach((day) => {
      updated[day.key] = {
        enabled: true,
        from: source.from,
        to: source.to,
      };
    });

    setHours(updated);
  }

  function discardChanges() {
    if (!hasChanges || saving) return;

    setHours(initialHours);
    setMessage("");
    setError("");
  }

  async function saveHours(e) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const { error: updateError } = await supabase
      .from("menus")
      .update({
        working_hours: hours,
      })
      .eq("id", menu.id)
      .eq("owner_id", menu.owner_id);

    if (updateError) {
      setSaving(false);
      setError(updateError.message);
      return;
    }

    await revalidatePublicMenu(menu.id);

    setInitialHours(hours);
    setSaving(false);
    setMessage("تم حفظ ساعات العمل.");
    router.refresh();
  }

  return (
    <main dir="rtl" className="min-h-screen px-4 pb-32 pt-4 sm:px-5 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                href={`/admin/menus/${menu.id}`}
                className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-2 text-xs font-black text-[#1b1712]/65 transition hover:bg-[#d1c5b4] hover:text-[#1b1712] active:scale-[0.98]"
              >
                <ArrowRight size={15} />
                الرجوع للقائمة
              </Link>

              <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Working Hours
              </p>

              <h1 className="mt-1 text-2xl font-black text-[#1b1712] sm:text-3xl">
                ساعات العمل
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1b1712]/58">
                حدّد الأيام المفتوحة والمغلقة، والأوقات التي تظهر للزبائن في صفحة القائمة.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <SaveBadge hasChanges={hasChanges} />

              
            </div>
          </div>
        </header>

        {(message || error) && (
          <div className="mt-3 grid gap-2">
            {message && <Alert type="success">{message}</Alert>}
            {error && <Alert type="error">{error}</Alert>}
          </div>
        )}

        <section className="mt-3 grid gap-3 sm:grid-cols-3">
          <MetricBox
            icon={<CalendarDays size={18} />}
            label="أيام مفتوحة"
            value={`${openDaysCount}/${DAYS.length}`}
            hint="حسب الجدول الحالي"
          />


        </section>

        <form onSubmit={saveHours} className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="grid gap-5">
            <Panel
              eyebrow="Schedule"
              title="جدول الأسبوع"
              description=""
            >
              <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">


                <ActionButton type="button" onClick={setAllOpen}>
                  <CheckCircle2 size={16} />
                  فتح الكل
                </ActionButton>

                <ActionButton type="button" onClick={setAllClosed}>
                  <TimerReset size={16} />
                  إغلاق الكل
                </ActionButton>
              </div>

              <div className="grid gap-2">
                {DAYS.map((day) => {
                  const current = hours[day.key];
                  const overnight =
                    current.enabled && isOvernight(current.from, current.to);

                  return (
                    <DayCard
                      key={day.key}
                      day={day}
                      current={current}
                      overnight={overnight}
                      onToggle={() =>
                        updateDay(day.key, "enabled", !current.enabled)
                      }
                      onChangeFrom={(value) =>
                        updateDay(day.key, "from", value)
                      }
                      onChangeTo={(value) => updateDay(day.key, "to", value)}
                    />
                  );
                })}
              </div>
            </Panel>

            <Panel
              eyebrow="Preview"
              title="كيف ستظهر للزبائن"
              description="هذه معاينة بسيطة للنص الذي سيظهر في القائمة العامة."
            >
              <div className="grid gap-2 md:grid-cols-2">
                {DAYS.map((day) => {
                  const current = hours[day.key];

                  return (
                    <div
                      key={day.key}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] px-3 py-3"
                    >
                      <span className="text-sm font-black text-[#1b1712]">
                        {day.label}
                      </span>

                      <span
                        dir="ltr"
                        className={`text-sm font-black ${
                          current.enabled
                            ? "text-[#1b1712]/65"
                            : "text-[#1b1712]/35"
                        }`}
                      >
                        {getDayText(current)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>

          <SaveBar
            hasChanges={hasChanges}
            saving={saving}
            onDiscard={discardChanges}
          />
        </form>
      </section>
    </main>
  );
}

function DayCard({
  day,
  current,
  overnight,
  onToggle,
  onChangeFrom,
  onChangeTo,
}) {
  return (
    <section
      className={`rounded-2xl border p-3 transition ${
        current.enabled
          ? "border-[#8f806c]/60 bg-[#ded4c5]"
          : "border-[#8f806c]/40 bg-[#d1c5b4]/60"
      }`}
    >
      <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
        <div className="flex items-center justify-between gap-3 lg:justify-start">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggle}
              className={`relative h-8 w-14 shrink-0 cursor-pointer rounded-full border transition active:scale-[0.98] ${
                current.enabled
                  ? "border-[#1b1712] bg-[#1b1712]"
                  : "border-[#8f806c]/55 bg-[#c8baa8]"
              }`}
              aria-label={`Toggle ${day.label}`}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full transition ${
                  current.enabled
                    ? "right-7 bg-[#efe7da]"
                    : "right-1 bg-[#8f806c]"
                }`}
              />
            </button>

            <div>
              <h3 className="text-base font-black text-[#1b1712]">
                {day.label}
              </h3>

              <p className="text-xs font-bold text-[#1b1712]/45">
                {current.enabled ? "مفتوح" : "مغلق"}
              </p>
            </div>
          </div>

        </div>

        <div className="grid min-w-0 grid-cols-1 gap-2 min-[390px]:grid-cols-2">
          <TimeField
            label="من"
            value={current.from}
            disabled={!current.enabled}
            onChange={onChangeFrom}
          />

          <TimeField
            label="إلى"
            value={current.to}
            disabled={!current.enabled}
            onChange={onChangeTo}
          />
        </div>
      </div>

      {overnight && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-yellow-900/25 bg-yellow-700/15 px-3 py-1.5 text-xs font-black text-yellow-950">
          <TriangleAlert size={13} />
          الدوام يمتد لليوم التالي
        </div>
      )}
    </section>
  );
}

function TimeField({ label, value, disabled, onChange }) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="text-xs font-black text-[#1b1712]/50">{label}</span>

      <input
        type="time"
        dir="ltr"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="block h-11 w-full min-w-0 rounded-xl border border-[#8f806c]/55 bg-[#d1c5b4] px-3 text-left text-base font-black text-[#1b1712] outline-none transition placeholder:text-[#1b1712]/30 focus:border-[#1b1712] disabled:cursor-not-allowed disabled:opacity-35"
      />
    </label>
  );
}

function Panel({ eyebrow, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] shadow-sm shadow-black/5">
      <div className="border-b border-[#8f806c]/45 bg-[#d1c5b4] px-4 py-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
          {eyebrow}
        </p>

        <h2 className="mt-0.5 text-lg font-black text-[#1b1712]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-[#1b1712]/52">
            {description}
          </p>
        )}
      </div>

      <div className="p-3">{children}</div>
    </section>
  );
}

function MetricBox({ icon, label, value, hint, alert }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3 shadow-sm shadow-black/5 ${
        alert
          ? "border-yellow-900/25 bg-yellow-700/15"
          : "border-[#8f806c]/55 bg-[#d8cebe]"
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

function SummaryRow({ day, current }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] px-3 py-2.5">
      <span className="text-sm font-black text-[#1b1712]">{day.label}</span>

      <span
        dir="ltr"
        className={`text-sm font-black ${
          current.enabled ? "text-[#1b1712]/60" : "text-[#1b1712]/32"
        }`}
      >
        {getDayText(current)}
      </span>
    </div>
  );
}

function SaveBadge({ hasChanges }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${
        hasChanges
          ? "border-yellow-900/25 bg-yellow-700/15 text-yellow-950"
          : "border-green-900/25 bg-green-800/12 text-green-950"
      }`}
    >
      <Circle size={8} fill="currentColor" />
      {hasChanges ? "تغييرات غير محفوظة" : "كل شيء محفوظ"}
    </div>
  );
}

function Alert({ type, children }) {
  const styles =
    type === "success"
      ? "border-green-900/25 bg-green-800/12 text-green-950"
      : "border-red-900/25 bg-red-700/12 text-red-950";

  return (
    <p className={`rounded-xl border p-3 text-sm font-bold leading-6 ${styles}`}>
      {children}
    </p>
  );
}

function ActionButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-2.5 text-sm font-black text-[#1b1712]/70 transition hover:bg-[#cfc3b2] hover:text-[#1b1712] active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

function SaveBar({ hasChanges, saving, onDiscard }) {
  return (
    <div className="fixed bottom-24 left-4 right-4 z-[80]">
      <div className="mx-auto max-w-7xl rounded-2xl border border-[#8f806c]/60 bg-[#d8cebe]/95 p-3 shadow-2xl shadow-black/25 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className={`text-sm font-black ${
                hasChanges ? "text-yellow-950" : "text-green-950"
              }`}
            >
              {hasChanges ? "لديك تغييرات غير محفوظة" : "كل شيء محفوظ"}
            </p>

            <p className="mt-1 text-xs font-bold text-[#1b1712]/45">
              احفظ التغييرات لتحديث ساعات العمل في القائمة العامة.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={onDiscard}
              disabled={!hasChanges || saving}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-2 text-sm font-black text-[#1b1712]/70 transition hover:bg-[#cfc3b2] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={17} />
              تراجع
            </button>

            <button
              type="submit"
              disabled={!hasChanges || saving}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] px-3 py-2 text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Save size={17} />
              )}

              {saving ? "جارٍ الحفظ..." : "حفظ الساعات"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}