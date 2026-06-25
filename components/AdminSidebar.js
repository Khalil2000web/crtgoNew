"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MenuSquare,
  PlusCircle,
  CreditCard,
  Settings,
  Crown,
  HelpCircle,
  Search,
  LogOut,
  MoreHorizontal,
  X,
  Store,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

const mainLinks = [
  {
    href: "/admin",
    label: "الرئيسية",
    shortLabel: "الرئيسية",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/menus",
    label: "القوائم",
    shortLabel: "القوائم",
    icon: MenuSquare,
  },
  {
    href: "/admin/create-menu",
    label: "إنشاء قائمة",
    shortLabel: "إنشاء",
    icon: PlusCircle,
  },
];

const businessLinks = [
  {
    href: "/admin/upgrade",
    label: "الخطط",
    icon: Crown,
  },
  {
    href: "/admin/billing",
    label: "الفوترة",
    icon: CreditCard,
  },
];

const accountLinks = [
  {
    href: "/admin/settings",
    label: "إعدادات الحساب",
    icon: Settings,
  },
  {
    href: "/admin/support",
    label: "الدعم",
    icon: HelpCircle,
  },
];

function isActivePath(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DesktopNavLink({ href, icon: Icon, label }) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      prefetch
      href={href}
      className={`group flex min-h-12 cursor-pointer items-center justify-between rounded-2xl px-3 py-2 text-sm font-black transition active:scale-[0.98] ${
        active
          ? "bg-white text-[#171411] shadow-sm shadow-black/10"
          : "text-white/58 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
            active
              ? "bg-[#171411] text-white"
              : "bg-white/8 text-white/58 group-hover:bg-white/12 group-hover:text-white"
          }`}
        >
          <Icon size={18} />
        </span>

        {label}
      </span>

      {active && <ArrowLeft size={15} className="text-[#171411]/40" />}
    </Link>
  );
}

function DesktopNavGroup({ title, children }) {
  return (
    <div>
      <p className="mb-2 px-3 text-xs font-black uppercase tracking-[0.22em] text-white/28">
        {title}
      </p>

      <div className="grid gap-1">{children}</div>
    </div>
  );
}

function MobileTabLink({ href, icon: Icon, label, onClick }) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      prefetch
      href={href}
      onClick={onClick}
      className={`flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-black transition active:scale-[0.96] ${
        active
          ? "bg-[#171411] text-white"
          : "text-[#171411]/45 hover:bg-[#f3eadc] hover:text-[#171411]"
      }`}
    >
      <Icon size={19} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SearchBox({ onDone }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const clean = query.trim();
    if (!clean) return;

    router.push(`/admin/menus?search=${encodeURIComponent(clean)}`);
    setQuery("");
    onDone?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-12 items-center gap-2 rounded-2xl border border-black/10 bg-[#f3eadc] px-4"
    >
      <Search size={18} className="shrink-0 text-[#171411]/40" />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث عن قائمة..."
        className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#171411] outline-none placeholder:text-[#171411]/35"
      />

      <button
        type="submit"
        className="cursor-pointer rounded-xl bg-[#171411] px-3 py-2 text-xs font-black text-white transition hover:bg-[#30271e] active:scale-[0.98]"
      >
        بحث
      </button>
    </form>
  );
}

function AccountCard({ profile, dark = false }) {
  const firstLetter = (profile?.display_name || "C").charAt(0).toUpperCase();

  if (dark) {
    return (
      <Link
        href="/admin/settings"
        className="flex cursor-pointer items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.07] p-3 transition hover:bg-white/10 active:scale-[0.99]"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white font-black text-[#171411]">
          {firstLetter}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">
            {profile?.display_name || "CRTGO"}
          </p>

          <p className="mt-1 truncate text-xs font-bold text-white/40">
            {profile?.plan_id || "trial"} ·{" "}
            {profile?.subscription_status || "unknown"}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="/admin/settings"
      className="flex cursor-pointer items-center gap-3 rounded-3xl border border-black/10 bg-white p-3 transition hover:bg-[#fff7ea] active:scale-[0.99]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#171411] font-black text-white">
        {firstLetter}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-black text-[#171411]">
          {profile?.display_name || "CRTGO"}
        </p>

        <p className="mt-1 truncate text-xs font-bold text-[#171411]/45">
          {profile?.plan_id || "trial"} ·{" "}
          {profile?.subscription_status || "unknown"}
        </p>
      </div>
    </Link>
  );
}

function MobileMoreSheet({ profile, open, onClose }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[999] bg-black/35 p-3 backdrop-blur-sm md:hidden"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[32px] border border-black/10 bg-[#f6f4ef] shadow-2xl shadow-black/30">
        <div className="flex items-center justify-between border-b border-black/10 bg-white p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-black/35">
              CRTGO
            </p>

            <h2 className="mt-1 text-2xl font-black text-[#171411]">
              القائمة
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl bg-[#171411] text-white transition hover:bg-[#30271e] active:scale-[0.98]"
            aria-label="إغلاق"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <SearchBox onDone={onClose} />

          <div className="mt-4">
            <AccountCard profile={profile} />
          </div>

          <MobileSection title="الرئيسية">
            {[...mainLinks, ...businessLinks, ...accountLinks].map((item) => (
              <MobileSheetLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                onClick={onClose}
              />
            ))}
          </MobileSection>
        </div>

        <div className="border-t border-black/10 bg-white p-4">
          <LogoutButton className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-700 active:scale-[0.98]">
            <LogOut size={18} />
            تسجيل الخروج
          </LogoutButton>
        </div>
      </div>
    </div>
  );
}

function MobileSection({ title, children }) {
  return (
    <section className="mt-5">
      <p className="mb-2 px-1 text-xs font-black uppercase tracking-[0.18em] text-[#171411]/35">
        {title}
      </p>

      <div className="grid gap-2">{children}</div>
    </section>
  );
}

function MobileSheetLink({ href, icon: Icon, label, onClick }) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      prefetch
      href={href}
      onClick={onClick}
      className={`flex min-h-12 cursor-pointer items-center justify-between rounded-2xl border px-3 py-2 font-black transition active:scale-[0.98] ${
        active
          ? "border-[#171411] bg-[#171411] text-white"
          : "border-black/10 bg-white text-[#171411] hover:bg-[#fff7ea]"
      }`}
    >
      <span className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            active ? "bg-white/10 text-white" : "bg-[#f3eadc] text-[#171411]"
          }`}
        >
          <Icon size={18} />
        </span>

        {label}
      </span>

      <ArrowLeft
        size={15}
        className={active ? "text-white/45" : "text-[#171411]/35"}
      />
    </Link>
  );
}

export default function AdminSidebar({ profile }) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <MobileMoreSheet
        profile={profile}
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
      />

      <aside
        dir="rtl"
        className="fixed left-0 top-0 z-[80] hidden h-screen w-80 flex-col border-r border-white/10 bg-[#171411] p-3 text-white md:flex"
      >
        <Link
          href="/admin"
          className="mb-4 flex cursor-pointer items-center gap-3 rounded-[28px] border border-white/10 bg-white/[0.07] p-4 transition hover:bg-white/10 active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#171411]">
            <Store size={23} />
          </div>

          <div>
            <p className="text-xl font-black leading-none text-white">CRTGO</p>
            <p className="mt-1 text-xs font-bold text-white/38">
              Admin workspace
            </p>
          </div>
        </Link>

        <SearchBox />

        <nav className="mt-5 flex-1 space-y-6 overflow-y-auto pb-4">
          <DesktopNavGroup title="العمل">
            {mainLinks.map((item) => (
              <DesktopNavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </DesktopNavGroup>

          <DesktopNavGroup title="الاشتراك">
            {businessLinks.map((item) => (
              <DesktopNavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </DesktopNavGroup>

          <DesktopNavGroup title="الحساب">
            {accountLinks.map((item) => (
              <DesktopNavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </DesktopNavGroup>
        </nav>

        <div className="grid gap-2 border-t border-white/10 pt-3">
          <AccountCard profile={profile} dark />

          <LogoutButton className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-white transition hover:bg-red-600 hover:border-red-500 active:scale-[0.98]">
            <LogOut size={17} />
            تسجيل الخروج
          </LogoutButton>
        </div>
      </aside>

      <nav
        dir="rtl"
        className="fixed bottom-3 left-3 right-3 z-[900] rounded-[28px] border border-black/10 bg-white/95 p-2 shadow-2xl shadow-black/15 backdrop-blur md:hidden no-scrollbar"
      >
        <div className="flex items-center gap-1 no-scrollbar">
          {mainLinks.map((item) => (
            <MobileTabLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.shortLabel}
              onClick={() => setMoreOpen(false)}
            />
          ))}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-black text-[#171411]/45 transition hover:bg-[#f3eadc] hover:text-[#171411] active:scale-[0.96]"
            aria-label="المزيد"
          >
            <MoreHorizontal size={19} />
            <span>المزيد</span>
          </button>
        </div>
      </nav>
    </>
  );
}