import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  Circle,
  Clock,
  CreditCard,
  ExternalLink,
  FolderOpen,
  Globe,
  MenuSquare,
  Plus,
  Settings,
  Sparkles,
  Store,
  TriangleAlert,
  CheckCircle2,
  Package,
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

function getMenuCounts(menu) {
  const sections = menu.sections || [];

  const items = sections.reduce((total, section) => {
    return total + (section.items?.length || 0);
  }, 0);

  const availableItems = sections.reduce((total, section) => {
    return (
      total +
      (section.items || []).filter((item) => item.is_available !== false).length
    );
  }, 0);

  return {
    sections: sections.length,
    items,
    availableItems,
  };
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
    .select(
      `
      id,
      name,
      subdomain,
      status,
      created_at,
      sections (
        id,
        items (
          id,
          is_available
        )
      )
    `
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const menuList = menus || [];
  const latestMenus = menuList.slice(0, 5);

  const activeMenus = menuList.filter((menu) => menu.status !== "archived");
  const archivedMenus = menuList.filter((menu) => menu.status === "archived");
  const menusWithoutLinks = menuList.filter((menu) => !menu.subdomain);

  const totalSections = menuList.reduce((total, menu) => {
    return total + getMenuCounts(menu).sections;
  }, 0);

  const totalItems = menuList.reduce((total, menu) => {
    return total + getMenuCounts(menu).items;
  }, 0);

  const menusWithContent = menuList.filter((menu) => {
    return getMenuCounts(menu).items > 0;
  });

  const trialDaysLeft = getTrialDaysLeft(profile);
  const subscriptionStatus = profile?.subscription_status || "unknown";
  const plan = profile?.plan_id || "trial";

  const needsAttention =
    menusWithoutLinks.length > 0 ||
    menuList.some((menu) => getMenuCounts(menu).items === 0) ||
    subscriptionStatus === "expired" ||
    subscriptionStatus === "inactive";

  return (
    <main dir="rtl" className="min-h-screen px-4 pb-32 pt-4 sm:px-5 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1b1712]/45">
                CRTGO Workspace
              </p>

              <h1 className="mt-1 text-2xl font-black text-[#1b1712] sm:text-3xl">
                أهلاً {profile?.display_name || "بك"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1b1712]/58">
                إدارة قوائم العملاء، الروابط، الاشتراك، وتجهيز القوائم للطباعة أو المشاركة.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[320px]">
              <PrimaryLink href="/admin/create-menu">
                <Plus size={17} />
                قائمة جديدة
              </PrimaryLink>

              <SoftLink href="/admin/menus">
                <MenuSquare size={17} />
                كل القوائم
              </SoftLink>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill status={subscriptionStatus} />

            <SmallPill icon={<CreditCard size={13} />}>
              {getPlanLabel(plan)}
            </SmallPill>

            {subscriptionStatus === "trialing" && trialDaysLeft !== null && (
              <SmallPill icon={<Clock size={13} />}>
                باقي {trialDaysLeft} أيام
              </SmallPill>
            )}

            {needsAttention ? (
              <SmallPill warning icon={<TriangleAlert size={13} />}>
                يحتاج مراجعة
              </SmallPill>
            ) : (
              <SmallPill success icon={<CheckCircle2 size={13} />}>
                كل شيء جاهز
              </SmallPill>
            )}
          </div>
        </header>

        <section className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricBox
            label="القوائم"
            value={menuList.length}
            hint={`${activeMenus.length} نشطة / ${archivedMenus.length} مؤرشفة`}
            icon={<Store size={18} />}
          />

          <MetricBox
            label="الأقسام"
            value={totalSections}
            hint="داخل كل القوائم"
            icon={<FolderOpen size={18} />}
          />

          <MetricBox
            label="الأصناف"
            value={totalItems}
            hint={`${menusWithContent.length} قوائم فيها محتوى`}
            icon={<Package size={18} />}
          />

          <MetricBox
            label="روابط ناقصة"
            value={menusWithoutLinks.length}
            hint="قبل الطباعة لازم رابط"
            icon={<Globe size={18} />}
            alert={menusWithoutLinks.length > 0}
          />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="grid gap-5">
            <Panel
              eyebrow="Recent menus"
              title="آخر القوائم"
              action={
                <SoftLink href="/admin/menus" small>
                  عرض الكل
                </SoftLink>
              }
            >
              {!latestMenus.length ? (
                <EmptyMenus />
              ) : (
                <div className="grid gap-2">
                  {latestMenus.map((menu) => {
                    const publicPath = menu.subdomain
                      ? `/m/${menu.subdomain}`
                      : null;

                    const counts = getMenuCounts(menu);
                    const isEmpty = counts.items === 0;

                    return (
                      <MenuRow
                        key={menu.id}
                        menu={menu}
                        publicPath={publicPath}
                        counts={counts}
                        isEmpty={isEmpty}
                      />
                    );
                  })}
                </div>
              )}
            </Panel>

            <Panel eyebrow="Client workflow" title="طريقة تجهيز قائمة عميل">
              <div className="grid gap-2 md:grid-cols-2">
                <WorkflowStep
                  href="/admin/create-menu"
                  number="01"
                  title="أنشئ القائمة"
                  text="ابدأ باسم العميل والرابط الأساسي."
                />

                <WorkflowStep
                  href="/admin/menus"
                  number="02"
                  title="رتّب الأقسام"
                  text="أقسام قليلة وواضحة أفضل من زحمة."
                />

                <WorkflowStep
                  href="/admin/menus"
                  number="03"
                  title="أضف الأصناف"
                  text="اسم، سعر، وصف قصير، وصورة عند الحاجة."
                />

                <WorkflowStep
                  href="/admin/menus"
                  number="04"
                  title="اختبر الرابط"
                  text="افتحه كزبون قبل تسليم QR للعميل."
                />
              </div>
            </Panel>
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-24 lg:h-fit">
            <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1b1712]/45">
                Account
              </p>

              <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                حالة الحساب
              </h2>

              <div className="mt-4 grid gap-2">
                <InfoRow label="الخطة" value={getPlanLabel(plan)} />
                <InfoRow label="الحالة" value={getStatusLabel(subscriptionStatus)} />
                <InfoRow label="عدد القوائم" value={menuList.length} />
              </div>

              <div className="mt-4 grid gap-2">
                <PrimaryLink href="/admin/upgrade">
                  <Sparkles size={17} />
                  إدارة الخطة
                </PrimaryLink>

                <SoftLink href="/admin/settings">
                  <Settings size={17} />
                  إعدادات الحساب
                </SoftLink>
              </div>
            </section>

            <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d1c5b4] p-4 shadow-sm shadow-black/5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1b1712]/45">
                Quick checks
              </p>

              <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                قبل تسليم العميل
              </h2>

              <div className="mt-4 grid gap-2">
                <CheckRow
                  done={menusWithoutLinks.length === 0}
                  text="كل القوائم لديها رابط"
                />

                <CheckRow
                  done={menusWithContent.length === menuList.length || menuList.length === 0}
                  text="كل قائمة فيها أصناف"
                />

                <CheckRow
                  done={subscriptionStatus === "active" || subscriptionStatus === "trialing"}
                  text="الحساب مفعل"
                />
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function Panel({ eyebrow, title, action, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] shadow-sm shadow-black/5">
      <div className="flex items-center justify-between gap-3 border-b border-[#8f806c]/45 bg-[#d1c5b4] px-4 py-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
            {eyebrow}
          </p>

          <h2 className="mt-0.5 text-lg font-black text-[#1b1712]">
            {title}
          </h2>
        </div>

        {action}
      </div>

      <div className="p-3">{children}</div>
    </section>
  );
}

function MenuRow({ menu, publicPath, counts, isEmpty }) {
  return (
    <div className="grid gap-3 rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] p-3 transition hover:border-[#796a58]/70 hover:bg-[#d1c5b4] sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-black text-[#1b1712]">
            {menu.name || "قائمة بدون اسم"}
          </h3>

          <MenuStatus status={menu.status} />

          {isEmpty && (
            <span className="rounded-full border border-yellow-900/25 bg-yellow-700/15 px-2.5 py-1 text-xs font-black text-yellow-950">
              فارغة
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <MiniTag>{counts.sections} أقسام</MiniTag>
          <MiniTag>{counts.items} أصناف</MiniTag>
          <MiniTag dir="ltr">{publicPath || "/m/not-set"}</MiniTag>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex">
        <PrimaryLink href={`/admin/menus/${menu.id}`} small>
          إدارة
          <ArrowLeft size={15} />
        </PrimaryLink>

        {publicPath ? (
          <SoftLink href={publicPath} target="_blank" small>
            <ExternalLink size={15} />
            فتح
          </SoftLink>
        ) : (
          <WarningLink href={`/admin/menus/${menu.id}/settings`} small>
            الرابط
          </WarningLink>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const isActive = status === "active";
  const isTrial = status === "trialing";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${
        isActive
          ? "border-green-900/25 bg-green-800/12 text-green-950"
          : isTrial
            ? "border-yellow-900/25 bg-yellow-700/15 text-yellow-950"
            : "border-red-900/25 bg-red-700/12 text-red-950"
      }`}
    >
      <Circle size={8} fill="currentColor" />
      {getStatusLabel(status)}
    </span>
  );
}

function SmallPill({ children, icon, warning, success }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${
        warning
          ? "border-yellow-900/25 bg-yellow-700/15 text-yellow-950"
          : success
            ? "border-green-900/25 bg-green-800/12 text-green-950"
            : "border-[#8f806c]/55 bg-[#ded4c5] text-[#1b1712]/65"
      }`}
    >
      {icon}
      {children}
    </span>
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

      <div>
        <p className="text-xs font-black text-[#1b1712]/45">{label}</p>
        <p className="text-xl font-black text-[#1b1712]">{value}</p>
        <p className="text-xs font-bold text-[#1b1712]/42">{hint}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] px-3 py-2.5">
      <span className="text-xs font-black text-[#1b1712]/45">{label}</span>
      <span className="text-sm font-black text-[#1b1712]">{value}</span>
    </div>
  );
}

function CheckRow({ done, text }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] px-3 py-2.5">
      {done ? (
        <CheckCircle2 size={17} className="shrink-0 text-green-950" />
      ) : (
        <TriangleAlert size={17} className="shrink-0 text-yellow-950" />
      )}

      <span className="text-sm font-bold text-[#1b1712]/70">{text}</span>
    </div>
  );
}

function MenuStatus({ status }) {
  if (status === "archived") {
    return (
      <span className="rounded-full border border-yellow-900/25 bg-yellow-700/15 px-2.5 py-1 text-xs font-black text-yellow-950">
        مؤرشفة
      </span>
    );
  }

  return (
    <span className="rounded-full border border-green-900/25 bg-green-800/12 px-2.5 py-1 text-xs font-black text-green-950">
      مفعلة
    </span>
  );
}

function MiniTag({ children, dir }) {
  return (
    <span
      dir={dir}
      className="rounded-full border border-[#8f806c]/45 bg-[#d1c5b4] px-2.5 py-1 text-xs font-black text-[#1b1712]/55"
    >
      {children}
    </span>
  );
}

function EmptyMenus() {
  return (
    <div className="rounded-xl border border-dashed border-[#8f806c]/65 bg-[#ded4c5] p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#8f806c]/45 bg-[#d1c5b4] text-[#1b1712]">
        <Globe size={22} />
      </div>

      <h3 className="mt-3 text-lg font-black text-[#1b1712]">
        لا توجد قوائم بعد
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#1b1712]/55">
        أنشئ أول قائمة رقمية، ثم أضف الأقسام والأصناف والرابط.
      </p>

      <div className="mt-4 flex justify-center">
        <PrimaryLink href="/admin/create-menu">
          <Plus size={16} />
          إنشاء أول قائمة
        </PrimaryLink>
      </div>
    </div>
  );
}

function WorkflowStep({ href, number, title, text }) {
  return (
    <Link
      href={href}
      className="cursor-pointer rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] p-3 transition hover:border-[#796a58]/70 hover:bg-[#d1c5b4] active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1b1712] text-xs font-black text-[#efe7da]">
          {number}
        </span>

        <div>
          <h3 className="text-sm font-black text-[#1b1712]">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-[#1b1712]/50">{text}</p>
        </div>
      </div>
    </Link>
  );
}

function PrimaryLink({ href, children, small, ...props }) {
  return (
    <Link
      href={href}
      {...props}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] active:scale-[0.98] ${
        small ? "min-h-9 px-3 py-2" : "min-h-10 px-4 py-2.5"
      }`}
    >
      {children}
    </Link>
  );
}

function SoftLink({ href, children, small, ...props }) {
  return (
    <Link
      href={href}
      {...props}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#ded4c5] text-sm font-black text-[#1b1712]/70 transition hover:border-[#796a58]/70 hover:bg-[#d1c5b4] hover:text-[#1b1712] active:scale-[0.98] ${
        small ? "min-h-9 px-3 py-2" : "min-h-10 px-4 py-2.5"
      }`}
    >
      {children}
    </Link>
  );
}

function WarningLink({ href, children, small }) {
  return (
    <Link
      href={href}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-yellow-900/25 bg-yellow-700/15 text-sm font-black text-yellow-950 transition hover:bg-yellow-700/22 active:scale-[0.98] ${
        small ? "min-h-9 px-3 py-2" : "min-h-10 px-4 py-2.5"
      }`}
    >
      {children}
    </Link>
  );
}