import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const ui = {
  pageText: "text-[#f4efe7]",
  muted: "text-white/55",
  soft: "text-white/35",

  surface: "border-white/16 bg-[#1d1b19]",
  surface2: "border-white/14 bg-[#211f1c]",
  surfaceHover: "hover:border-white/28 hover:bg-[#25221f]",

  input:
    "border-white/18 bg-[#171615] text-[#f4efe7] placeholder:text-white/30 focus:border-[#d7b98b] focus:bg-[#1b1917]",

  button: {
    primary:
      "bg-[#e7d1ae] text-[#171411] hover:bg-[#f0dcbf]",
    secondary:
      "border border-white/18 bg-white/[0.06] text-[#f4efe7] hover:border-white/32 hover:bg-white/[0.1]",
    danger:
      "bg-red-600 text-white hover:bg-red-700",
    warning:
      "border border-yellow-400/35 bg-yellow-400/12 text-yellow-100 hover:bg-yellow-400/18",
    success:
      "border border-green-400/30 bg-green-400/12 text-green-100 hover:bg-green-400/18",
  },
};

export function AdminSkeletonCard({ className = "" }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl border border-white/16 bg-[#1d1b19] p-4",
        className
      )}
    >
      <div className="h-3 w-24 rounded-full bg-white/12" />
      <div className="mt-4 h-6 w-2/3 rounded-full bg-white/12" />
      <div className="mt-4 h-4 w-full rounded-full bg-white/10" />
      <div className="mt-2 h-4 w-4/5 rounded-full bg-white/10" />
    </div>
  );
}

/*
  TEMP COMPATIBILITY COMPONENTS
  Dark admin UI base while we rebuild every page.
*/

export function AdminPageShell({ children, max = "max-w-7xl", className = "" }) {
  return (
    <main
      dir="rtl"
      className={cn("min-h-screen px-4 pb-28 pt-5 sm:px-5 lg:px-8", className)}
    >
      <section className={cn("mx-auto w-full", max)}>{children}</section>
    </main>
  );
}

export function AdminBackLink({ href, children = "رجوع" }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-white/18 bg-white/[0.06] px-3 py-2 text-xs font-black text-white/65 transition hover:border-white/30 hover:bg-white/[0.1] hover:text-white active:scale-[0.98]"
    >
      <ArrowRight size={15} />
      {children}
    </Link>
  );
}

export function AdminHero({
  eyebrow,
  title,
  description,
  action,
  side,
  children,
}) {
  return (
    <section className={cn("rounded-2xl border p-4 shadow-sm", ui.surface)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {eyebrow && (
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
              {eyebrow}
            </p>
          )}

          <h1 className="mt-2 text-2xl font-black leading-tight text-[#f4efe7] sm:text-3xl">
            {title}
          </h1>

          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/52">
              {description}
            </p>
          )}

          {children && (
            <div className="mt-4 flex flex-wrap gap-2">
              {children}
            </div>
          )}
        </div>

        {(action || side) && <div>{action || side}</div>}
      </div>
    </section>
  );
}

export function AdminCard({ children, className = "" }) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-4 shadow-sm",
        ui.surface,
        className
      )}
    >
      {children}
    </section>
  );
}

export function AdminRow({ children, className = "" }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition",
        ui.surface2,
        ui.surfaceHover,
        className
      )}
    >
      {children}
    </div>
  );
}

export function AdminStatStrip({ stats = [] }) {
  return (
    <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "flex min-w-[180px] items-center gap-3 rounded-xl border p-3 shadow-sm",
            ui.surface
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/14 bg-white/[0.06] text-white/70">
            {stat.icon}
          </div>

          <div>
            <p className="text-xs font-black text-white/35">{stat.label}</p>

            <p className="text-lg font-black text-[#f4efe7]">
              {stat.value}
            </p>

            {stat.hint && (
              <p className="text-xs font-bold text-white/35">
                {stat.hint}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminAlert({ type = "info", children }) {
  const styles = {
    success: "border-green-400/30 bg-green-400/12 text-green-100",
    error: "border-red-400/30 bg-red-500/12 text-red-100",
    warning: "border-yellow-400/35 bg-yellow-400/12 text-yellow-100",
    info: "border-white/16 bg-[#1d1b19] text-white/65",
  };

  return (
    <p
      className={cn(
        "rounded-xl border p-4 text-sm font-bold leading-6",
        styles[type]
      )}
    >
      {children}
    </p>
  );
}

export function AdminButton({
  children,
  loading,
  disabled,
  className = "",
  variant = "primary",
  ...props
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        ui.button[variant] || ui.button.primary,
        className
      )}
    >
      {loading && <Loader2 size={17} className="animate-spin" />}
      {children}
    </button>
  );
}

export function AdminLinkButton({
  href,
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  return (
    <Link
      href={href}
      {...props}
      className={cn(
        "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition active:scale-[0.98]",
        ui.button[variant] || ui.button.primary,
        className
      )}
    >
      {children}
    </Link>
  );
}

export function AdminInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border px-4 py-3 text-sm font-bold outline-none transition",
        ui.input,
        className
      )}
    />
  );
}

export function AdminTextarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full resize-none rounded-xl border px-4 py-3 text-sm font-bold outline-none transition",
        ui.input,
        className
      )}
    />
  );
}

export function AdminField({ label, hint, children }) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-black text-white/55">
        {label}
      </p>

      {children}

      {hint && (
        <p className="mt-2 text-xs leading-5 text-white/38">
          {hint}
        </p>
      )}
    </label>
  );
}

export function AdminSaveBar({
  hasChanges,
  saving,
  hint,
  onDiscard,
  onSave,
  saveLabel = "حفظ التغييرات",
  discardLabel = "تراجع",
}) {
  return (
    <div className="fixed bottom-24 left-4 right-4 z-[80] md:left-[22rem]">
      <div className="mx-auto max-w-7xl rounded-2xl border border-white/18 bg-[#1b1917]/95 p-3 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className={cn(
                "text-sm font-black",
                hasChanges ? "text-yellow-100" : "text-green-100"
              )}
            >
              {hasChanges ? "لديك تغييرات غير محفوظة" : "كل شيء محفوظ"}
            </p>

            {hint && (
              <p className="mt-1 text-xs font-bold text-white/42">
                {hint}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <AdminButton
              type="button"
              variant="secondary"
              onClick={onDiscard}
              disabled={!hasChanges || saving}
              className="min-h-10 px-3 py-2"
            >
              {discardLabel}
            </AdminButton>

            <AdminButton
              type="button"
              variant="primary"
              onClick={onSave}
              loading={saving}
              disabled={!hasChanges || saving}
              className="min-h-10 px-3 py-2"
            >
              {saveLabel}
            </AdminButton>
          </div>
        </div>
      </div>
    </div>
  );
}