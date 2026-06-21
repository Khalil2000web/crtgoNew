import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Plus,
  FolderOpen,
  CreditCard,
  Settings,
  ExternalLink,
  LayoutDashboard,
  Circle,
  Menu as MenuIcon,
} from "lucide-react";



function getPlanLabel(plan) {
  const labels = {
    basic: "Basic",
    pro: "Pro",
    business: "Business",
    trial: "Trial",
  };

  return labels[plan] || plan || "Trial";
}

function getStatusLabel(status) {
  const labels = {
    active: "فعال",
    trialing: "تجريبي",
    inactive: "غير فعال",
    expired: "منتهي",
    cancelled: "ملغي",
  };

  return labels[status] || "غير معروف";
}

function getTrialDaysLeft(profile) {
  if (!profile?.trial_ends_at) return null;

  const diff = new Date(profile.trial_ends_at) - new Date();

  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/start");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: menus } = await supabase
    .from("menus")
    .select("id, name, subdomain, status")
    .eq("owner_id", user.id)
    .limit(5);

  const menuList = menus || [];

  const menuCount = menuList.length;
  const activeMenus = menuList.filter((menu) => menu.status !== "archived").length;
  const archivedMenus = menuList.filter((menu) => menu.status === "archived").length;

  const trialDaysLeft = getTrialDaysLeft(profile);

  return (
    <main dir="rtl" className="min-h-screen px-5 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/50">
                <LayoutDashboard size={16} />
                لوحة التحكم
              </div>

              <h1 className="mt-5 text-5xl font-black text-white">
                أهلاً {profile?.display_name || "بك"}
              </h1>

              <p className="hidden mt-3 max-w-2xl text-white/45">
                من هنا تقدر تدير قوائمك الرقمية، تعدّل التصميم، تضيف الأقسام والأصناف، وتتابع حالة حسابك.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/create-menu"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-extrabold text-black transition hover:bg-white/90"
              >
                <Plus size={18} />
                إنشاء قائمة
              </Link>

              <Link
                href="/admin/menus"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4 font-extrabold text-white transition hover:bg-white/10"
              >
                <FolderOpen size={18} />
                إدارة القوائم
              </Link>
            </div>
          </div>
        </div>

        {profile?.subscription_status === "trialing" && trialDaysLeft !== null && (
          <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-extrabold text-yellow-300">
                  الفترة التجريبية
                </p>

                <p className="mt-1 text-sm text-yellow-100/70">
                  {trialDaysLeft > 0
                    ? `باقي ${trialDaysLeft} أيام من الفترة التجريبية.`
                    : "انتهت الفترة التجريبية."}
                </p>
              </div>

              <Link
                href="/admin/upgrade"
                className="inline-flex items-center justify-center rounded-xl bg-yellow-300 px-5 py-3 font-extrabold text-black transition hover:bg-yellow-200"
              >
                اختيار خطة
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard
            label="عدد القوائم"
            value={menuCount}
            hint={`${activeMenus} مفعلة / ${archivedMenus} مؤرشفة`}
            icon={<MenuIcon size={22} />}
          />

          <StatCard
            label="الخطة الحالية"
            value={getPlanLabel(profile?.plan_id || "trial")}
            hint="يمكنك الترقية من صفحة الخطط"
            icon={<CreditCard size={22} />}
          />

          <StatCard
            label="حالة الحساب"
            value={getStatusLabel(profile?.subscription_status)}
            hint={profile?.subscription_status || "unknown"}
            icon={
              <Circle
                size={18}
                fill="currentColor"
                className={
                  profile?.subscription_status === "active"
                    ? "text-green-300"
                    : profile?.subscription_status === "trialing"
                      ? "text-yellow-300"
                      : "text-red-300"
                }
              />
            }
          />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white/45">قوائمك</p>

                <h2 className="mt-1 text-3xl font-black text-white">
                  آخر القوائم
                </h2>
              </div>

              <Link
                href="/admin/menus"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                عرض الكل
              </Link>
            </div>

            {!menuList.length && (
              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-8 text-center">
                <FolderOpen className="mx-auto text-white/25" size={44} />

                <h3 className="mt-4 text-2xl font-bold text-white">
                  لا توجد قوائم بعد
                </h3>

                <p className="mt-2 text-sm text-white/45">
                  أنشئ أول قائمة رقمية وابدأ بإضافة الأقسام والأصناف.
                </p>

                <Link
                  href="/admin/create-menu"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-extrabold text-black transition hover:bg-white/90"
                >
                  <Plus size={18} />
                  إنشاء قائمة جديدة
                </Link>
              </div>
            )}

            {menuList.length > 0 && (
              <div className="mt-6 grid gap-3">
                {menuList.map((menu) => (
                  <div
                    key={menu.id}
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black text-white">
                            {menu.name}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              menu.status === "archived"
                                ? "bg-yellow-500/15 text-yellow-300"
                                : "bg-green-500/15 text-green-300"
                            }`}
                          >
                            {menu.status === "archived" ? "مؤرشفة" : "مفعلة"}
                          </span>
                        </div>

                        <p dir="ltr" className="mt-2 text-left text-sm text-white/35">
                          /m/{menu.subdomain || "not-set"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/admin/menus/${menu.id}`}
                          className="rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-black transition hover:bg-white/90"
                        >
                          إدارة
                        </Link>

                        {menu.subdomain && (
                          <Link
                            href={`/m/${menu.subdomain}`}
                            target="_blank"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
                          >
                            <ExternalLink size={16} />
                            فتح
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <QuickAction
              href="/admin/create-menu"
              title="إنشاء قائمة جديدة"
              description="ابدأ قائمة رقمية جديدة لمطعم أو كافيه."
              icon={<Plus size={22} />}
              primary
            />

            <QuickAction
              href="/admin/menus"
              title="إدارة القوائم"
              description="عرض وتعديل كل القوائم الموجودة."
              icon={<FolderOpen size={22} />}
            />

            <QuickAction
              href="/admin/upgrade"
              title="الخطط والترقية"
              description="اختر الخطة المناسبة لحسابك."
              icon={<CreditCard size={22} />}
            />

            <QuickAction
              href="/admin/settings"
              title="إعدادات الحساب"
              description="عدّل معلومات الحساب وكلمة المرور."
              icon={<Settings size={22} />}
            />
          </aside>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, hint, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-5 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between gap-3 text-white/45">
        <span>{label}</span>
        {icon}
      </div>

      <p className="mt-4 text-3xl font-black text-white">{value}</p>

      <p className="mt-2 text-sm text-white/35">{hint}</p>
    </div>
  );
}

function QuickAction({ href, title, description, icon, primary }) {
  return (
    <Link
      href={href}
      className={`block rounded-2xl border p-5 transition ${
        primary
          ? "border-white bg-white text-black hover:bg-white/90"
          : "border-white/10 bg-[#0f0f0f] text-white hover:bg-white/[0.06]"
      }`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
          primary ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        {icon}
      </div>

      <h3 className="mt-4 text-xl font-black">{title}</h3>

      <p className={`mt-2 text-sm ${primary ? "text-black/55" : "text-white/45"}`}>
        {description}
      </p>
    </Link>
  );
}