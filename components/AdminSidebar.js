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
  PanelBottomOpen,
  PanelTopOpen,
  X,
  Search,
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
      className={`flex flex-row-reverse items-center justify-end gap-3 rounded-md px-4 py-3 text-sm font-bold transition ${
        active
          ? "bg-white text-black"
          : "text-white/60 hover:bg-black/5 hover:text-white/90"
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
      <p className="mb-2 px-4 text-xs font-bold text-white/55 border-b border-white/30 pb-2">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function NavContent({ profile, onLinkClick }) {
  return (
    <>
      <div className="border-b border-white/0 pb-4 mb-5">
        <div className="mt-3 rounded-2xl bg-white/15 p-3">
          <p className="text-xs text-white">الحساب</p>
          <p className="font-bold text-white" dir="rtl">
            {profile?.display_name || "CRTGO"}@
          </p>
          <p className="mt-1 text-xs uppercase text-white">
            {profile?.plan_id || "trial"} ·{" "}
            {profile?.subscription_status || "unknown"}
          </p>
        </div>
      </div>

      <nav className="mt-5 flex-1 space-y-8 overflow-y-auto pb-24 no-scrollbar">
        <NavGroup title="الرئيسية">
          <NavLink
            href="/admin"
            icon={LayoutDashboard}
            label="لوحة التحكم"
            onClick={onLinkClick}
          />
          <NavLink
            href="/admin/menus"
            icon={MenuSquare}
            label="القوائم"
            onClick={onLinkClick}
          />
          <NavLink
            href="/admin/create-menu"
            icon={PlusCircle}
            label="إنشاء قائمة"
            onClick={onLinkClick}
          />
        </NavGroup>

        <NavGroup title="الأعمال">
          <NavLink
            href="/admin/billing"
            icon={CreditCard}
            label="الفوترة"
            onClick={onLinkClick}
          />
          <NavLink
            href="/admin/upgrade"
            icon={Crown}
            label="الخطط"
            onClick={onLinkClick}
          />
        </NavGroup>

        <NavGroup title="الحساب">
          <NavLink
            href="/admin/settings"
            icon={Settings}
            label="الإعدادات"
            onClick={onLinkClick}
          />
          <NavLink
            href="/admin/support"
            icon={HelpCircle}
            label="الدعم"
            onClick={onLinkClick}
          />
        </NavGroup>
      </nav>
    </>
  );
}

function MobileSearchBar({ mobileOpen, setMobileOpen }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const clean = query.trim();
    if (!clean) return;

    router.push(`/admin/menus?search=${encodeURIComponent(clean)}`);
    setMobileOpen(false);
  }

  return (
    <div
      dir="rtl"
      className="fixed bottom-4 left-4 right-4 z-[1000] md:hidden"
    >
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white p-2 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-black/15 px-4 py-3">
          <Search size={18} className="shrink-0 text-black/40" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث..."
            className="min-w-0 flex-1 bg-transparent text-md font-bold outline-none text-black placeholder:text-black/35"
          />
        </form>

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white cursor-pointer hover:bg-black/70 transition"
          aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
        >
          {mobileOpen ? <PanelTopOpen size={22} /> : <PanelBottomOpen size={22} />}
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar({ profile }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <MobileSearchBar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {mobileOpen && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[999] no-scrollbar overflow-y-auto overscroll-contain bg-[#000] text-white px-5 pb-28 pt-8 md:hidden"
        >
          <div className="mx-auto max-w-md">
            <NavContent
              profile={profile}
              onLinkClick={() => setMobileOpen(false)}
            />

            <div className="flex items-center justify-center mt-6 pt-4">
              <LogoutButton className="border border-white/40 px-4 py-2 rounded-md cursor-pointer hover:bg-white/10 text-white w-full" />
            </div>
          </div>
        </div>
      )}

      <aside
        dir="rtl"
        className="fixed left-0 top-0 hidden h-screen w-80 flex-col border-r border-white/80 bg-[#000] p-3 md:flex"
      >
        <NavContent profile={profile} />

        <Link
          href="/admin/settings"
          className="flex items-center gap-3 rounded-2xl border border-white/40 p-3 transition hover:bg-white/5"
        >
          <div className="flex h-11 w-11 border border-white items-center justify-center rounded-full bg-white font-black text-black">
            {(profile?.display_name || "C").charAt(0).toUpperCase()}
          </div>

          <div className="flex flex-col">
            <span className="font-bold">
              {profile?.display_name || "CRTGO"}
            </span>
            <span className="text-xs text-white/50">الإعدادات</span>
          </div>
        </Link>
      </aside>
    </>
  );
}