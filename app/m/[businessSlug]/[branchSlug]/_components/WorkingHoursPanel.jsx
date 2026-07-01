import { Clock } from "lucide-react";

import {
  getFullWorkingHours,
  getTodayWorkingHours,
  getUi,
} from "./menuUtils";

export default function WorkingHoursPanel({ workingHours, language, theme }) {
  const today = getTodayWorkingHours(workingHours, language);
  const fullHours = getFullWorkingHours(workingHours, language);

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] opacity-45">
            <Clock size={15} />
            {getUi(language, "workingHours")}
          </p>

          <h2 className="mt-3 text-2xl font-black tracking-[-0.05em]">
            {today.dayLabel}: {today.label}
          </h2>
        </div>

        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-black"
          style={{
            backgroundColor: today.isOpenNow ? `${theme.primary}22` : "rgba(255,255,255,.08)",
            color: today.isOpenNow ? theme.primary : "rgba(255,255,255,.55)",
          }}
        >
          {today.isOpenNow
            ? getUi(language, "openNow")
            : getUi(language, "closedNow")}
        </span>
      </div>

      <div className="mt-5 grid gap-2">
        {fullHours.map((day) => (
          <div
            key={day.dayKey}
            className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold"
          >
            <span className="opacity-75">{day.dayLabel}</span>
            <span className={day.isOpenDay ? "opacity-90" : "opacity-35"}>
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}