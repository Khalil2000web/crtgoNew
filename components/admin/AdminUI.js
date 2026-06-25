import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function AdminSkeletonCard({ className = "" }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[28px] border border-black/10 bg-white p-5 shadow-sm",
        className
      )}
    >
      <div className="h-3 w-24 rounded-full bg-black/10" />
      <div className="mt-5 h-8 w-2/3 rounded-full bg-black/10" />
      <div className="mt-4 h-4 w-full rounded-full bg-black/10" />
      <div className="mt-2 h-4 w-4/5 rounded-full bg-black/10" />
    </div>
  );
}

/*
  TEMP COMPATIBILITY COMPONENTS
  Keep these only so old admin pages do not crash while we rebuild them.
  As we rebuild each page, we can stop using these.
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
      className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-black text-[#171411] transition hover:bg-[#f3eadc] active:scale-[0.98]"
    >
      <ArrowRight size={15} />
      {children}
    </Link>
  );
}

export function AdminHero({ eyebrow, title, description, action, side, children }) {
  return (
    <section className="rounded-[32px] border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {eyebrow && (
            <p className="text-xs font-black uppercase tracking-[0.22em] text-black/35">
              {eyebrow}
            </p>
          )}

          <h1 className="mt-2 text-4xl font-black leading-[1.05] text-[#171411] sm:text-5xl">
            {title}
          </h1>

          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-7 text-black/55">
              {description}
            </p>
          )}

          {children && <div className="mt-4 flex flex-wrap gap-2">{children}</div>}
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
        "rounded-[28px] border border-black/10 bg-white p-4 shadow-sm",
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
        "rounded-2xl border border-black/10 bg-white p-3 transition hover:border-black/20 hover:bg-[#fff7ea]",
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
          className="flex min-w-[190px] items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3eadc] text-[#171411]">
            {stat.icon}
          </div>

          <div>
            <p className="text-xs font-black text-black/35">{stat.label}</p>
            <p className="text-xl font-black text-[#171411]">{stat.value}</p>
            {stat.hint && (
              <p className="text-xs font-bold text-black/35">{stat.hint}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminAlert({ type = "info", children }) {
  const styles = {
    success: "border-green-800/20 bg-green-700/10 text-green-900",
    error: "border-red-500/20 bg-red-600/10 text-red-700",
    warning: "border-yellow-800/25 bg-yellow-600/15 text-yellow-950",
    info: "border-black/10 bg-white text-black/60",
  };

  return (
    <p className={cn("rounded-2xl border p-4 text-sm font-bold leading-6", styles[type])}>
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
  const variants = {
    primary: "bg-[#171411] text-white hover:bg-[#30271e]",
    secondary:
      "border border-black/10 bg-white text-[#171411] hover:bg-[#f3eadc]",
    danger: "bg-red-600 text-white hover:bg-red-700",
    warning:
      "border border-yellow-800/20 bg-yellow-600/15 text-yellow-950 hover:bg-yellow-600/25",
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant] || variants.primary,
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
  const variants = {
    primary: "bg-[#171411] text-white hover:bg-[#30271e]",
    secondary:
      "border border-black/10 bg-white text-[#171411] hover:bg-[#f3eadc]",
    danger: "bg-red-600 text-white hover:bg-red-700",
    warning:
      "border border-yellow-800/20 bg-yellow-600/15 text-yellow-950 hover:bg-yellow-600/25",
  };

  return (
    <Link
      href={href}
      {...props}
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition active:scale-[0.98]",
        variants[variant] || variants.primary,
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
        "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-bold text-[#171411] outline-none transition placeholder:text-black/35 focus:border-orange-600",
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
        "w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-bold text-[#171411] outline-none transition placeholder:text-black/35 focus:border-orange-600",
        className
      )}
    />
  );
}

export function AdminField({ label, hint, children }) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-black text-black/55">{label}</p>
      {children}
      {hint && <p className="mt-2 text-xs leading-5 text-black/42">{hint}</p>}
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
      <div className="mx-auto max-w-7xl rounded-[24px] border border-black/10 bg-white/95 p-3 shadow-2xl shadow-black/15 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className={cn(
                "text-sm font-black",
                hasChanges ? "text-yellow-950" : "text-green-900"
              )}
            >
              {hasChanges ? "لديك تغييرات غير محفوظة" : "كل شيء محفوظ"}
            </p>

            {hint && <p className="mt-1 text-xs font-bold text-black/45">{hint}</p>}
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