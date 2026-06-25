import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  Circle,
  CreditCard,
  ExternalLink,
  FolderOpen,
  Globe,
  LayoutDashboard,
  MenuSquare,
  Plus,
  Settings,
  Sparkles,
  Store,
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
    .select("id, name, subdomain, status, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const menuList = menus || [];
  const latestMenus = menuList.slice(0, 5);

  const activeMenus = menuList.filter((menu) => menu.status !== "archived");
  const archivedMenus = menuList.filter((menu) => menu.status === "archived");

  const trialDaysLeft = getTrialDaysLeft(profile);
  const subscriptionStatus = profile?.subscription_status || "unknown";
  const plan = profile?.plan_id || "trial";

  return (
    <main dir="rtl" className="min-h-screen px-4 pb-28 pt-5 sm:px-5 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1fr_330px]">
            <div className="p-5 sm:p-7">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-black/35">
                CRTGO Workspace
              </p>

              <h1 className="mt-3 text-4xl font-black leading-[1.05] text-[#171411] sm:text-5xl">
                أهلاً {profile?.display_name || "بك"}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-black/55">
                لوحة تحكم لإدارة قوائم العملاء، الروابط، الاشتراك، والإعدادات بطريقة واضحة وسريعة.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <StatusPill status={subscriptionStatus} />
                <SmallPill icon={<CreditCard size={13} />}>
                  {getPlanLabel(plan)}
                </SmallPill>

                {subscriptionStatus === "trialing" && trialDaysLeft !== null && (
                  <SmallPill>باقي {trialDaysLeft} أيام</SmallPill>
                )}
              </div>

              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <MainButton href="/admin/create-menu" dark>
                  <Plus size={18} />
                  إنشاء قائمة جديدة
                </MainButton>

                <MainButton href="/admin/menus">
                  <FolderOpen size={18} />
                  إدارة كل القوائم
                </MainButton>
              </div>
            </div>

            <div className="border-t border-black/10 bg-[#171411] p-5 text-white lg:border-r lg:border-t-0">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">
                Account
              </p>

              <div className="mt-5 grid gap-3">
                <MiniAccountRow label="الخطة" value={getPlanLabel(plan)} />
                <MiniAccountRow
                  label="الحالة"
                  value={getStatusLabel(subscriptionStatus)}
                />
                <MiniAccountRow label="عدد القوائم" value={menuList.length} />
              </div>

              <Link
                href="/admin/upgrade"
                className="mt-5 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#171411] transition hover:bg-white/90 active:scale-[0.98]"
              >
                <Sparkles size={17} />
                إدارة الخطة
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <MetricStrip
            icon={<Store size={19} />}
            label="القوائم النشطة"
            value={activeMenus.length}
            hint={`${archivedMenus.length} مؤرشفة`}
          />

          <MetricStrip
            icon={<MenuSquare size={19} />}
            label="كل القوائم"
            value={menuList.length}
            hint="في حسابك"
          />

          <MetricStrip
            icon={<LayoutDashboard size={19} />}
            label="الصفحة الحالية"
            value="Dashboard"
            hint="نظرة عامة"
          />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <section className="rounded-[28px] border border-black/10 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-black/10 bg-[#fffaf2] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-black/35">
                    Recent work
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-[#171411]">
                    آخر القوائم
                  </h2>
                </div>

                <Link
                  href="/admin/menus"
                  className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-black text-[#171411] transition hover:bg-[#f7ead8] active:scale-[0.98]"
                >
                  عرض الكل
                </Link>
              </div>

              <div className="p-3">
                {!latestMenus.length ? (
                  <EmptyMenus />
                ) : (
                  <div className="grid gap-2">
                    {latestMenus.map((menu) => {
                      const publicPath = menu.subdomain
                        ? `/m/${menu.subdomain}`
                        : null;

                      return (
                        <div
                          key={menu.id}
                          className="grid gap-3 rounded-2xl border border-black/10 bg-white p-3 transition hover:border-black/20 hover:bg-[#fff7ea] sm:grid-cols-[1fr_auto] sm:items-center"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-lg font-black text-[#171411]">
                                {menu.name || "قائمة بدون اسم"}
                              </h3>

                              <MenuStatus status={menu.status} />
                            </div>

                            <p
                              dir="ltr"
                              className="mt-2 text-left text-sm font-bold text-black/40"
                            >
                              {publicPath || "/m/not-set"}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 sm:flex">
                            <Link
                              href={`/admin/menus/${menu.id}`}
                              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#171411] px-4 py-2 text-sm font-black text-white transition hover:bg-[#30271e] active:scale-[0.98]"
                            >
                              إدارة
                              <ArrowLeft size={15} />
                            </Link>

                            {publicPath ? (
                              <Link
                                href={publicPath}
                                target="_blank"
                                className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-black text-[#171411] transition hover:bg-[#f7ead8] active:scale-[0.98]"
                              >
                                <ExternalLink size={15} />
                                فتح
                              </Link>
                            ) : (
                              <Link
                                href={`/admin/menus/${menu.id}/settings`}
                                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-yellow-800/20 bg-yellow-600/15 px-4 py-2 text-sm font-black text-yellow-950 transition hover:bg-yellow-600/25 active:scale-[0.98]"
                              >
                                الرابط
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-black/10 bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-black/35">
                Best workflow
              </p>

              <h2 className="mt-1 text-2xl font-black text-[#171411]">
                طريقة العمل الأسرع
              </h2>

              <div className="mt-4 grid gap-2 md:grid-cols-2">
                <WorkflowStep
                  href="/admin/create-menu"
                  number="01"
                  title="أنشئ قائمة"
                  text="ابدأ قائمة للعميل أو للمشروع."
                />

                <WorkflowStep
                  href="/admin/menus"
                  number="02"
                  title="أضف الأقسام"
                  text="رتّب القائمة بطريقة مفهومة للزبائن."
                />

                <WorkflowStep
                  href="/admin/menus"
                  number="03"
                  title="أضف الأصناف"
                  text="اسم، وصف، سعر، وصورة إذا موجودة."
                />

                <WorkflowStep
                  href="/admin/menus"
                  number="04"
                  title="افتح الرابط"
                  text="اختبر القائمة كأنك زبون."
                />
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
            <section className="rounded-[28px] border border-black/10 bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-black/35">
                Quick actions
              </p>

              <h2 className="mt-1 text-xl font-black text-[#171411]">
                اختصارات
              </h2>

              <div className="mt-4 grid gap-2">
                <QuickAction href="/admin/create-menu" icon={<Plus size={18} />} title="قائمة جديدة" />
                <QuickAction href="/admin/menus" icon={<FolderOpen size={18} />} title="كل القوائم" />
                <QuickAction href="/admin/upgrade" icon={<Sparkles size={18} />} title="الخطط" />
                <QuickAction href="/admin/settings" icon={<Settings size={18} />} title="إعدادات الحساب" />
              </div>
            </section>

            <section className="rounded-[28px] border border-black/10 bg-[#171411] p-4 text-white shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
                Tip
              </p>

              <h2 className="mt-1 text-xl font-black">لعملائك</h2>

              <p className="mt-2 text-sm leading-7 text-white/60">
                خليك دايماً تبدأ بالشعار، رابط قصير، أقسام واضحة، وبعدين الأصناف. هيك القائمة تطلع منظمة للزبون.
              </p>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function StatusPill({ status }) {
  const isActive = status === "active";
  const isTrial = status === "trialing";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${
        isActive
          ? "border-green-800/20 bg-green-700/10 text-green-900"
          : isTrial
            ? "border-yellow-800/20 bg-yellow-600/15 text-yellow-950"
            : "border-red-500/20 bg-red-600/10 text-red-700"
      }`}
    >
      <Circle size={8} fill="currentColor" />
      {getStatusLabel(status)}
    </span>
  );
}

function SmallPill({ children, icon }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f3eadc] px-3 py-1.5 text-xs font-black text-black/60">
      {icon}
      {children}
    </span>
  );
}

function MiniAccountRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
      <p className="text-xs font-black text-white/35">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function MetricStrip({ icon, label, value, hint }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f3eadc] text-[#171411]">
        {icon}
      </div>

      <div>
        <p className="text-xs font-black text-black/35">{label}</p>
        <p className="text-2xl font-black text-[#171411]">{value}</p>
        <p className="text-xs font-bold text-black/35">{hint}</p>
      </div>
    </div>
  );
}

function MenuStatus({ status }) {
  if (status === "archived") {
    return (
      <span className="rounded-full border border-yellow-800/20 bg-yellow-600/15 px-2.5 py-1 text-xs font-black text-yellow-950">
        مؤرشفة
      </span>
    );
  }

  return (
    <span className="rounded-full border border-green-800/20 bg-green-700/10 px-2.5 py-1 text-xs font-black text-green-900">
      مفعلة
    </span>
  );
}

function EmptyMenus() {
  return (
    <div className="rounded-[24px] border border-dashed border-black/15 bg-[#f3eadc] p-7 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#171411]">
        <Globe size={24} />
      </div>

      <h3 className="mt-4 text-xl font-black text-[#171411]">
        لا توجد قوائم بعد
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/50">
        أنشئ أول قائمة رقمية وابدأ بتجهيزها للزبائن.
      </p>

      <Link
        href="/admin/create-menu"
        className="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#171411] px-5 py-3 text-sm font-black text-white transition hover:bg-[#30271e] active:scale-[0.98]"
      >
        <Plus size={17} />
        إنشاء أول قائمة
      </Link>
    </div>
  );
}

function WorkflowStep({ href, number, title, text }) {
  return (
    <Link
      href={href}
      className="cursor-pointer rounded-2xl border border-black/10 bg-[#fffaf2] p-4 transition hover:border-black/20 hover:bg-[#fff1d6] active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#171411] text-sm font-black text-white">
          {number}
        </span>

        <div>
          <h3 className="font-black text-[#171411]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-black/50">{text}</p>
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ href, icon, title }) {
  return (
    <Link
      href={href}
      className="flex cursor-pointer items-center justify-between rounded-2xl border border-black/10 bg-[#f3eadc] p-3 font-black text-[#171411] transition hover:border-black/20 hover:bg-[#ead9bd] active:scale-[0.99]"
    >
      <span className="flex items-center gap-2">
        {icon}
        {title}
      </span>

      <ArrowLeft size={16} className="text-black/35" />
    </Link>
  );
}

function MainButton({ href, children, dark }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition active:scale-[0.98] ${
        dark
          ? "bg-[#171411] text-white hover:bg-[#30271e]"
          : "border border-black/10 bg-white text-[#171411] hover:bg-[#f7ead8]"
      }`}
    >
      {children}
    </Link>
  );
}