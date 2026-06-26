"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  MenuSquare,
  Plus,
  Menu,
  X,
  CreditCard,
  Crown,
  HelpCircle,
  UserRound,
  LogOut,
  ChevronLeft,
  Store,
  Eye,
  Settings,
  Palette,
  Clock,
  Languages,
  Layers3,
  FileText,
  Globe,
  Building2,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

function isActivePath(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getMenuIdFromPath(pathname) {
  const match = pathname.match(/^\/admin\/menus\/([^/]+)/);
  return match?.[1] || null;
}

const mainLinks = [
  {
    href: "/admin",
    label: "الرئيسية",
    icon: Home,
  },
  {
    href: "/admin/menus",
    label: "القوائم",
    icon: MenuSquare,
  },
  {
    href: "/admin/create-menu",
    label: "إنشاء",
    icon: Plus,
  },
];

function SearchModal({ open, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();

    const clean = query.trim();
    if (!clean) return;

    router.push(`/admin/menus?search=${encodeURIComponent(clean)}`);
    setQuery("");
    onClose();
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[1200] bg-black/25 p-4 backdrop-blur-sm"
    >
      <div className="mx-auto mt-12 max-w-md rounded-[26px] border border-[#8f806c]/60 bg-[#ded4c5] p-4 shadow-2xl shadow-black/20">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1b1712]/45">
              Search
            </p>

            <h2 className="text-xl font-black text-[#1b1712]">
              البحث في القوائم
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#8f806c]/55 bg-[#d1c5b4] text-[#1b1712] transition hover:bg-[#c5b7a4] active:scale-[0.98]"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-[#8f806c]/60 bg-[#cfc3b2] px-4 py-3">
            <Search size={18} className="text-[#1b1712]/45" />

            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اسم القائمة أو الرابط..."
              className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#1b1712] outline-none placeholder:text-[#1b1712]/35"
            />
          </div>

          <button
            type="submit"
            className="min-h-11 cursor-pointer rounded-2xl bg-[#1b1712] px-4 py-3 text-sm font-black text-[#efe7da] transition hover:bg-[#342b22] active:scale-[0.98]"
          >
            بحث
          </button>
        </form>
      </div>
    </div>
  );
}

function ToolsSheet({ profile, open, onClose }) {
  const pathname = usePathname();
  const menuId = getMenuIdFromPath(pathname);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const groups = useMemo(() => {
    if (menuId) {
      return [
        {
          title: "إعدادات هذه القائمة",
          items: [
            {
              href: `/admin/menus/${menuId}`,
              label: "نظرة عامة",
              description: "ملخص القائمة والجاهزية",
              icon: Eye,
            },
            {
              href: `/admin/menus/${menuId}/details`,
              label: "معلومات القائمة",
              description: "الاسم، الوصف، التواصل والموقع",
              icon: FileText,
            },
            {
              href: `/admin/menus/${menuId}/sections`,
              label: "الأقسام والأصناف",
              description: "إدارة المنتجات والأسعار",
              icon: Layers3,
            },
            {
              href: `/admin/menus/${menuId}/appearance`,
              label: "المظهر",
              description: "الشعار، الغلاف، والقالب",
              icon: Palette,
            },
            {
              href: `/admin/menus/${menuId}/hours`,
              label: "ساعات العمل",
              description: "الأيام والأوقات",
              icon: Clock,
            },
            {
              href: `/admin/menus/${menuId}/languages`,
              label: "اللغات",
              description: "إعداد لغات القائمة",
              icon: Languages,
            },
            {
              href: `/admin/menus/${menuId}/branches`,
              label: "الفروع",
              description: "إدارة فروع المطعم",
              icon: Building2,
            },
            {
              href: `/admin/menus/${menuId}/settings`,
              label: "إعدادات الرابط",
              description: "الرابط، الحالة، والحذف",
              icon: Settings,
            },
          ],
        },
        {
          title: "الحساب",
          items: [
            {
              href: "/admin/account",
              label: "إعدادات الحساب",
              description: "الاسم وكلمة المرور",
              icon: UserRound,
            },
          ],
        },
      ];
    }

    return [
      {
        title: "العمل",
        items: [
          {
            href: "/admin",
            label: "الرئيسية",
            description: "نظرة عامة على الحساب",
            icon: Home,
          },
          {
            href: "/admin/menus",
            label: "القوائم",
            description: "إدارة كل قوائم العملاء",
            icon: MenuSquare,
          },
          {
            href: "/admin/create-menu",
            label: "إنشاء قائمة",
            description: "إضافة قائمة جديدة",
            icon: Plus,
          },
        ],
      },
      {
        title: "الحساب والاشتراك",
        items: [
          {
            href: "/admin/account",
            label: "إعدادات الحساب",
            description: "الاسم وكلمة المرور",
            icon: UserRound,
          },
          {
            href: "/admin/support",
            label: "الدعم",
            description: "المساعدة والتواصل",
            icon: HelpCircle,
          },
        ],
      },
    ];
  }, [menuId]);

  if (!open) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[1100] bg-black/25 p-3 backdrop-blur-sm"
    >
      <section className="mx-auto flex h-full max-w-md flex-col overflow-hidden rounded-[30px] border border-[#8f806c]/65 bg-[#d8cebe] text-[#1b1712] shadow-2xl shadow-black/25">
        <header className="border-b border-[#8f806c]/45 bg-[#d1c5b4] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1b1712]/45">
                {menuId ? "Menu tools" : "Workspace"}
              </p>

              <h2 className="mt-1 text-xl font-black text-[#1b1712]">
                {menuId ? "أدوات القائمة" : "القائمة"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#8f806c]/60 bg-[#c4b6a4] text-[#1b1712] transition hover:bg-[#b8a892] active:scale-[0.98]"
              aria-label="إغلاق"
            >
              <X size={21} />
            </button>
          </div>

          <Link
            href="/admin/account"
            onClick={onClose}
            className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-[#8f806c]/55 bg-[#ded4c5] p-3 transition hover:bg-[#cfc3b2] active:scale-[0.99]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1b1712] font-black text-[#efe7da]">
              {(profile?.display_name || "C").charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black">
                {profile?.display_name || "CRTGO"}
              </p>

              <p className="mt-0.5 truncate text-xs font-bold text-[#1b1712]/45">
                {profile?.plan_id || "trial"} ·{" "}
                {profile?.subscription_status || "unknown"}
              </p>
            </div>
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <section key={group.title} className="mb-5">
              <p className="mb-2 px-3 text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                {group.title}
              </p>

              <div className="overflow-hidden rounded-2xl border border-[#8f806c]/55 bg-[#e2d8c8]">
                {group.items.map((item, index) => (
                  <ToolRow
                    key={item.href}
                    item={item}
                    last={index === group.items.length - 1}
                    onClick={onClose}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="border-t border-[#8f806c]/45 bg-[#d1c5b4] p-3">
          <LogoutButton className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-700 px-4 py-3 text-sm font-black text-white transition hover:bg-red-800 active:scale-[0.98]">
            <LogOut size={18} />
            تسجيل الخروج
          </LogoutButton>
        </footer>
      </section>
    </div>
  );
}

function ToolRow({ item, last, onClick }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-3 px-4 py-3.5 transition hover:bg-[#d1c5b4] active:scale-[0.99] ${
        last ? "" : "border-b border-[#8f806c]/45"
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#8f806c]/50 bg-[#d1c5b4] text-[#1b1712]/70">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-[#1b1712]">{item.label}</p>

        <p className="mt-0.5 truncate text-xs font-bold text-[#1b1712]/42">
          {item.description}
        </p>
      </div>

      <ChevronLeft size={19} className="text-[#1b1712]/28" />
    </Link>
  );
}

function TopLink({ href, label, icon: Icon }) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-black transition active:scale-[0.98] ${
        active
          ? "border-[#1b1712] bg-[#1b1712] text-[#efe7da]"
          : "border-[#8f806c]/45 bg-[#d8cebe] text-[#1b1712]/62 hover:border-[#8f806c]/75 hover:bg-[#cfc3b2] hover:text-[#1b1712]"
      }`}
    >
      <Icon size={17} />
      {label}
    </Link>
  );
}

function DockCircle({ children, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[58px] w-[58px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#8f806c]/55 bg-[#ded4c5] text-[#1b1712]/65 shadow-lg shadow-black/10 transition hover:bg-[#cfc3b2] hover:text-[#1b1712] active:scale-[0.96]"
      aria-label={label}
    >
      {children}
    </button>
  );
}

function DockMainLink({ href, icon: Icon }) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      className={`flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-full transition active:scale-[0.96] ${
        active
          ? "bg-[#1b1712] text-[#efe7da]"
          : "text-[#1b1712]/45 hover:bg-[#cfc3b2] hover:text-[#1b1712]"
      }`}
    >
      <Icon size={21} />
    </Link>
  );
}

export default function AdminSidebar({ profile }) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <ToolsSheet
        profile={profile}
        open={toolsOpen}
        onClose={() => setToolsOpen(false)}
      />

      <header
        dir="rtl"
        className="fixed left-0 right-0 top-0 z-[850] border-b border-[#8f806c]/45 bg-[#cfc6b8]/95 px-3 py-3 backdrop-blur"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Link
            href="/admin"
            className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-2 transition hover:bg-[#d1c5b4] active:scale-[0.98]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1b1712] text-[#efe7da]">
              <Store size={19} />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-black leading-none text-[#1b1712]">
                CRTGO
              </p>

              <p className="mt-1 text-[11px] font-bold text-[#1b1712]/45">
                menu workspace
              </p>
            </div>
          </Link>

          <nav className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
            {mainLinks.map((link) => (
              <TopLink
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
              />
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#8f806c]/45 bg-[#d8cebe] px-3 py-2 text-sm font-black text-[#1b1712]/55 transition hover:border-[#8f806c]/75 hover:bg-[#cfc3b2] hover:text-[#1b1712] active:scale-[0.98] sm:inline-flex"
          >
            <Search size={17} />
            بحث
          </button>

          <button
            type="button"
            onClick={() => setToolsOpen(true)}
            className="hidden min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#8f806c]/45 bg-[#d8cebe] px-3 py-2 text-sm font-black text-[#1b1712]/55 transition hover:border-[#8f806c]/75 hover:bg-[#cfc3b2] hover:text-[#1b1712] active:scale-[0.98] sm:inline-flex"
          >
            <Menu size={18} />
            الأدوات
          </button>
        </div>
      </header>

      <nav
        dir="rtl"
        className="fixed bottom-3 left-3 right-3 z-[900] md:hidden"
      >
        <div className="flex items-center justify-center gap-3">
          <DockCircle onClick={() => setSearchOpen(true)} label="بحث">
            <Search size={23} />
          </DockCircle>

          <div className="flex items-center gap-1 rounded-full border border-[#8f806c]/55 bg-[#ded4c5] p-1.5 shadow-lg shadow-black/10">
            {mainLinks.map((link) => (
              <DockMainLink
                key={link.href}
                href={link.href}
                icon={link.icon}
              />
            ))}

            <button
              type="button"
              onClick={() => setToolsOpen(true)}
              className="flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-full text-[#1b1712]/45 transition hover:bg-[#cfc3b2] hover:text-[#1b1712] active:scale-[0.96]"
              aria-label="الأدوات"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}