"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MenuSquare,
  PlusCircle,
  CreditCard,
  Settings,
  Crown,
  HelpCircle,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

function NavLink({ href, icon: Icon, label, onClick }) {
  const pathname = usePathname();

  const active =
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      prefetch
      href={href}
      onClick={onClick}
      className={`flex flex-row-reverse items-center justify-end gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
        active
          ? "bg-black text-white"
          : "text-black/60 hover:bg-black/5 hover:text-black"
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}

function NavGroup({ title, children }) {
  return (
    <div>
      <p className="mb-2 px-4 text-xs font-bold text-black/35">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function NavContent({ profile, onLinkClick }) {
  return (
    <>
      <div className="border-b border-black/80 pb-4">
        <p className="text-xs text-black/50">CRTGO</p>
        <h1 className="text-2xl font-black">لوحة التحكم</h1>

        <div className="mt-3 rounded-2xl bg-black/5 p-3">
          <p className="text-xs text-black/50">الحساب</p>
          <p className="font-bold" dir="rtl">
            {profile?.display_name || "CRTGO"}@
          </p>
          <p className="mt-1 text-xs uppercase text-black/40">
            {profile?.plan_id || "trial"} ·{" "}
            {profile?.subscription_status || "unknown"}
          </p>
        </div>
      </div>

      <nav className="mt-5 flex-1 space-y-8 overflow-y-auto pb-24 no-scrollbar">
        <NavGroup title="الرئيسية">
          <NavLink href="/admin" icon={LayoutDashboard} label="لوحة التحكم" onClick={onLinkClick} />
          <NavLink href="/admin/menus" icon={MenuSquare} label="القوائم" onClick={onLinkClick} />
          <NavLink href="/admin/create-menu" icon={PlusCircle} label="إنشاء قائمة" onClick={onLinkClick} />
        </NavGroup>

        <NavGroup title="الأعمال">
          <NavLink href="/admin/billing" icon={CreditCard} label="الفوترة" onClick={onLinkClick} />
          <NavLink href="/admin/upgrade" icon={Crown} label="الخطط" onClick={onLinkClick} />
        </NavGroup>

        <NavGroup title="الحساب">
          <NavLink href="/admin/settings" icon={Settings} label="الإعدادات" onClick={onLinkClick} />
          <NavLink href="/admin/support" icon={HelpCircle} label="الدعم" onClick={onLinkClick} />
        </NavGroup>
      </nav>
    </>
  );
}

export default function AdminSidebar({ profile }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [touchStartY, setTouchStartY] = useState(null);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function handleTouchEnd(e) {
    if (touchStartY === null) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;

    if (diff > 50) setMobileOpen(true);
    if (diff < -50) setMobileOpen(false);

    setTouchStartY(null);
  }

  return (
    <>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-[998] bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="إغلاق القائمة"
        />
      )}

      <div
        dir="rtl"
        onTouchStart={(e) => setTouchStartY(e.touches[0].clientY)}
        onTouchEnd={handleTouchEnd}
        className={`fixed bottom-0 left-0 right-0 z-[999] max-h-[88vh] rounded-t-[2rem] border border-black/10 bg-white p-4 shadow-2xl transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-y-0" : "translate-y-[calc(100%-76px)]"
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="w-full pb-4"
        >
          <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-black/25" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-black/50">CRTGO</p>
              <h1 className="font-black">القائمة</h1>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black font-black text-white">
              {(profile?.display_name || "C").charAt(0).toUpperCase()}
            </div>
          </div>
        </button>

        <div className="max-h-[calc(88vh-90px)] overflow-y-auto overscroll-contain no-scrollbar">
          <NavContent
            profile={profile}
            onLinkClick={() => setMobileOpen(false)}
          />

          <div className="border-t border-black/10 pt-3">
            <LogoutButton className="w-full" />
          </div>
        </div>
      </div>

      <aside
        dir="rtl"
        className="fixed left-0 top-0 hidden h-screen w-80 flex-col border-r border-black/10 bg-white p-3 md:flex"
      >
        <NavContent profile={profile} />

        <Link
          href="/admin/settings"
          className="flex items-center gap-3 rounded-2xl border border-black/80 p-3 transition hover:bg-black/5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black font-black text-white">
            {(profile?.display_name || "C").charAt(0).toUpperCase()}
          </div>

          <div className="flex flex-col">
            <span className="font-bold">
              {profile?.display_name || "CRTGO"}
            </span>
            <span className="text-xs text-black/50">الإعدادات</span>
          </div>
        </Link>
      </aside>
    </>
  );
}