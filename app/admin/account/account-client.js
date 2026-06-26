"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Crown,
  Loader2,
  Mail,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  User,
  WalletCards,
  XCircle,
} from "lucide-react";

const TRIAL_DAYS = 14;

function formatDate(value) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("ar", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}

function getDaysLeft(value) {
  if (!value) return 0;

  const end = new Date(value).getTime();
  const now = Date.now();

  if (Number.isNaN(end)) return 0;

  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
}

function getPlanLabel(plan) {
  if (plan === "pro") return "Pro";
  if (plan === "business") return "Business";
  return "Free";
}

function getPayPalStatusLabel(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "ACTIVE") return "نشط";
  if (normalized === "APPROVAL_PENDING") return "بانتظار الموافقة";
  if (normalized === "APPROVED") return "تمت الموافقة";
  if (normalized === "SUSPENDED") return "موقوف";
  if (normalized === "CANCELLED") return "ملغي";
  if (normalized === "EXPIRED") return "منتهي";

  return "غير مفعل";
}

function getAccountState(profile) {
  const plan = profile?.plan || "free";
  const paypalStatus = String(profile?.paypal_subscription_status || "").toUpperCase();

  const trialDaysLeft = getDaysLeft(profile?.trial_ends_at);
  const trialActive = plan !== "pro" && trialDaysLeft > 0;

  const paidActive =
    plan === "pro" && ["ACTIVE", "APPROVED"].includes(paypalStatus);

  const paymentPending = paypalStatus === "APPROVAL_PENDING";

  if (paidActive) {
    return {
      key: "pro",
      title: "Pro مفعل",
      description: "اشتراكك مفعل، وكل ميزات CRTGO متاحة.",
      tone: "green",
      accessLabel: "وصول كامل",
      trialDaysLeft,
      paidActive,
      trialActive: false,
      paymentPending: false,
      canUseApp: true,
    };
  }

  if (paymentPending) {
    return {
      key: "pending",
      title: "الدفع بانتظار الموافقة",
      description: "اشتراك PayPal لم يكتمل بعد. بعد الموافقة سيتم تفعيل Pro تلقائياً.",
      tone: "yellow",
      accessLabel: "بانتظار الدفع",
      trialDaysLeft,
      paidActive: false,
      trialActive,
      paymentPending: true,
      canUseApp: trialActive,
    };
  }

  if (trialActive) {
    return {
      key: "trial",
      title: "التجربة المجانية مفعلة",
      description: `لديك ${trialDaysLeft} أيام متبقية من التجربة المجانية.`,
      tone: "yellow",
      accessLabel: "تجربة مجانية",
      trialDaysLeft,
      paidActive: false,
      trialActive: true,
      paymentPending: false,
      canUseApp: true,
    };
  }

  return {
    key: "free",
    title: "الخطة المجانية",
    description: profile?.trial_ends_at
      ? "انتهت التجربة المجانية. فعّل Pro للاستمرار بكل الميزات."
      : "حسابك على الخطة المجانية. عند تجهيز نظام التسجيل، الحسابات الجديدة ستحصل على تجربة مجانية.",
    tone: "red",
    accessLabel: profile?.trial_ends_at ? "التجربة انتهت" : "Free",
    trialDaysLeft,
    paidActive: false,
    trialActive: false,
    paymentPending: false,
    canUseApp: false,
  };
}

export default function AccountClient({ user, profile, paymentStatus }) {
  const router = useRouter();

  const [loadingKey, setLoadingKey] = useState("");
  const [error, setError] = useState("");

  const accountState = useMemo(() => getAccountState(profile), [profile]);

  const plan = profile?.plan || "free";
  const isPro = accountState.paidActive;

  async function startPayPalSubscription() {
    setLoadingKey("paypal-checkout");
    setError("");

    try {
      const response = await fetch("/api/paypal/create-subscription", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start PayPal subscription.");
      }

      const approvalUrl = data.approvalUrl || data.url;

      if (!approvalUrl) {
        throw new Error("PayPal approval URL was not returned.");
      }

      window.location.href = approvalUrl;
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء فتح PayPal.");
      setLoadingKey("");
    }
  }

  async function cancelSubscription() {
    const sure = confirm(
      "هل تريد إلغاء الاشتراك؟ سيبقى الحساب Pro حتى نهاية الفترة المدفوعة إذا كان PayPal يسمح بذلك."
    );

    if (!sure) return;

    setLoadingKey("cancel-subscription");
    setError("");

    try {
      const response = await fetch("/api/paypal/cancel-subscription", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel subscription.");
      }

      router.refresh();
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء إلغاء الاشتراك.");
      setLoadingKey("");
    }
  }

async function refreshAccount() {
  setLoadingKey("sync");
  setError("");

  try {
    const response = await fetch("/api/paypal/sync-subscription", {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to sync account.");
    }

    router.refresh();
  } catch (err) {
    setError(err.message || "حدث خطأ أثناء تحديث حالة الاشتراك.");
  }

  setLoadingKey("");
}

  return (
    <main dir="rtl" className="min-h-screen px-4 pb-32 pt-4 sm:px-5 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                href="/admin"
                className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-2 text-xs font-black text-[#1b1712]/65 transition hover:bg-[#d1c5b4] hover:text-[#1b1712] active:scale-[0.98]"
              >
                <ArrowRight size={15} />
                الرجوع للرئيسية
              </Link>

              <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Account
              </p>

              <h1 className="mt-1 text-2xl font-black text-[#1b1712] sm:text-3xl">
                الحساب والاشتراك
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1b1712]/58">
                صفحة واحدة لإدارة الحساب، التجربة المجانية، الخطة، والدفع عبر PayPal.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <PlanBadge state={accountState} plan={plan} />

              <span className="inline-flex items-center gap-2 rounded-full border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-1.5 text-xs font-black text-[#1b1712]/60">
                <Mail size={13} />
                {user.email}
              </span>
            </div>
          </div>
        </header>

        {paymentStatus === "success" && (
          <Alert type="success">
            تم الرجوع من PayPal. إذا لم تظهر خطة Pro فوراً، انتظر ثواني واضغط تحديث الحالة.
          </Alert>
        )}

        {paymentStatus === "cancelled" && (
          <Alert type="error">
            تم إلغاء عملية الدفع. لم يتم تغيير الخطة.
          </Alert>
        )}

        {error && <Alert type="error">{error}</Alert>}

        <section className="mt-3 grid gap-3 sm:grid-cols-3">
          <MetricBox
            icon={<Crown size={18} />}
            label="الخطة"
            value={getPlanLabel(plan)}
            hint={accountState.accessLabel}
            alert={!isPro}
          />

          <MetricBox
            icon={<CalendarDays size={18} />}
            label="التجربة"
            value={
              accountState.trialActive
                ? `${accountState.trialDaysLeft} أيام`
                : profile?.trial_ends_at
                  ? "منتهية"
                  : "غير محددة"
            }
            hint={`التجربة الافتراضية ${TRIAL_DAYS} يوم`}
            alert={!accountState.trialActive && !isPro}
          />

          <MetricBox
            icon={<WalletCards size={18} />}
            label="PayPal"
            value={getPayPalStatusLabel(profile?.paypal_subscription_status)}
            hint={profile?.paypal_subscription_id ? "مرتبط" : "غير مرتبط"}
            alert={!isPro}
          />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-5">
            <Panel
              eyebrow="Access"
              title="حالة الحساب"
              description="هذه هي الحالة التي سيعتمد عليها النظام للسماح أو منع الميزات المدفوعة."
            >
              <div
                className={`rounded-2xl border p-4 ${
                  accountState.tone === "green"
                    ? "border-green-900/25 bg-green-800/12"
                    : accountState.tone === "yellow"
                      ? "border-yellow-900/25 bg-yellow-700/15"
                      : "border-red-900/25 bg-red-700/12"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {accountState.tone === "green" ? (
                        <CheckCircle2 size={22} className="text-green-950" />
                      ) : accountState.tone === "yellow" ? (
                        <TriangleAlert size={22} className="text-yellow-950" />
                      ) : (
                        <XCircle size={22} className="text-red-950" />
                      )}

                      <h2
                        className={`text-2xl font-black ${
                          accountState.tone === "green"
                            ? "text-green-950"
                            : accountState.tone === "yellow"
                              ? "text-yellow-950"
                              : "text-red-950"
                        }`}
                      >
                        {accountState.title}
                      </h2>
                    </div>

                    <p
                      className={`mt-2 max-w-xl text-sm font-bold leading-6 ${
                        accountState.tone === "green"
                          ? "text-green-950/70"
                          : accountState.tone === "yellow"
                            ? "text-yellow-950/70"
                            : "text-red-950/70"
                      }`}
                    >
                      {accountState.description}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:min-w-[220px]">
                    {!isPro && (
                      <button
                        type="button"
                        onClick={startPayPalSubscription}
                        disabled={loadingKey === "paypal-checkout"}
                        className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] px-4 py-3 text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loadingKey === "paypal-checkout" ? (
                          <Loader2 className="animate-spin" size={17} />
                        ) : (
                          <Sparkles size={17} />
                        )}

                        {loadingKey === "paypal-checkout"
                          ? "جارٍ فتح PayPal..."
                          : "تفعيل Pro"}
                      </button>
                    )}

                    {profile?.paypal_subscription_id && (
                      <button
                        type="button"
                        onClick={cancelSubscription}
                        disabled={loadingKey === "cancel-subscription"}
                        className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-900/25 bg-red-700/12 px-4 py-3 text-sm font-black text-red-950 transition hover:bg-red-700/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loadingKey === "cancel-subscription" ? (
                          <Loader2 className="animate-spin" size={17} />
                        ) : (
                          <XCircle size={17} />
                        )}

                        إلغاء الاشتراك
                      </button>
                    )}

<button
  type="button"
  onClick={refreshAccount}
  disabled={loadingKey === "sync"}
  className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#d1c5b4] px-4 py-3 text-sm font-black text-[#1b1712]/70 transition hover:bg-[#cfc3b2] disabled:cursor-not-allowed disabled:opacity-50"
>
  {loadingKey === "sync" ? (
    <Loader2 className="animate-spin" size={17} />
  ) : (
    <RotateCcw size={17} />
  )}
  تحديث الحالة
</button>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel
              eyebrow="Plans"
              title="الخطة"
              description="حالياً نخلي النظام بسيط: Free/Trial ثم Pro عبر PayPal."
            >
              <div className="grid gap-3 md:grid-cols-2">
                <PlanCard
                  title="Free / Trial"
                  price="₪0"
                  description="للتجربة وتجهيز القائمة قبل الدفع."
                  active={!isPro}
                  features={[
                    "تجربة مجانية للحسابات الجديدة",
                    "إنشاء القائمة وتجهيزها",
                    "مناسب قبل نشر القائمة للزبائن",
                  ]}
                />

                <PlanCard
                  title="Pro"
                  price="Monthly"
                  description="الخطة الفعلية للعميل."
                  active={isPro}
                  highlighted
                  features={[
                    "قائمة رقمية كاملة",
                    "أقسام وأصناف وصور",
                    "رابط عام و QR",
                    "لغات متعددة",
                    "تفعيل دائم طالما الاشتراك نشط",
                  ]}
                />
              </div>
            </Panel>

            <Panel
              eyebrow="Trial"
              title="التجربة المجانية للحسابات الجديدة"
              description="هاي الفكرة التي لازم تكون في التسجيل والـ access gate."
            >
              <div className="grid gap-3 md:grid-cols-3">
                <ProcessCard
                  number="01"
                  title="تسجيل جديد"
                  description={`عند إنشاء الحساب، نعطيه trial_ends_at بعد ${TRIAL_DAYS} يوم.`}
                />

                <ProcessCard
                  number="02"
                  title="خلال التجربة"
                  description="المستخدم يقدر يجهز قائمته ويجرب لوحة التحكم."
                />

                <ProcessCard
                  number="03"
                  title="بعد التجربة"
                  description="إذا ما دفع، نطلب الترقية إلى Pro للاستمرار."
                />
              </div>
            </Panel>

            <Panel
              eyebrow="Account info"
              title="معلومات الحساب"
              description="معلومات الحساب الحالية من Supabase و PayPal."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <InfoRow label="البريد الإلكتروني" value={user.email} />
                <InfoRow label="معرّف الحساب" value={user.id} />
                <InfoRow label="الاسم" value={profile?.display_name || "—"} />
                <InfoRow label="Username" value={profile?.username || "—"} />
                <InfoRow

                  label="Trial ends"
                  value={formatDate(profile?.trial_ends_at)}
                />
                <InfoRow
                  label="PayPal Subscription"
                  value={profile?.paypal_subscription_id || "غير موجود"}
                />
              </div>
            </Panel>
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-24 lg:h-fit">
            <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Summary
              </p>

              <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                ملخص الاشتراك
              </h2>

              <div className="mt-4 grid gap-2">
                <SummaryRow label="الخطة" value={getPlanLabel(plan)} />
                <SummaryRow
                  label="الوصول"
                  value={accountState.canUseApp ? "مسموح" : "يحتاج ترقية"}
                />
                <SummaryRow
                  label="PayPal"
                  value={getPayPalStatusLabel(profile?.paypal_subscription_status)}
                />
                <SummaryRow
                  label="انتهاء التجربة"
                  value={formatDate(profile?.trial_ends_at)}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-green-900/25 bg-green-800/12 p-4">
              <div className="flex gap-3">
                <ShieldCheck
                  size={19}
                  className="mt-1 shrink-0 text-green-950"
                />

                <div>
                  <h2 className="text-base font-black text-green-950">
                    كيف كل شيء يشتغل مع بعض؟
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-green-950/70">
                    الـ Account page تعرض الحالة. PayPal يرسل Webhook. الـ Webhook يحدث profile.plan. والـ AdminAccessGate يقرر إذا المستخدم مسموح أو لازم يدفع.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d1c5b4] p-4 shadow-sm shadow-black/5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Next
              </p>

              <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                الخطوة الجاية
              </h2>

              <p className="mt-3 text-sm font-bold leading-6 text-[#1b1712]/58">
                بعد هذه الصفحة، نعمل API routes لـ PayPal: إنشاء الاشتراك، Webhook، وإلغاء الاشتراك.
              </p>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function Panel({ eyebrow, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] shadow-sm shadow-black/5">
      <div className="border-b border-[#8f806c]/45 bg-[#d1c5b4] px-4 py-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
          {eyebrow}
        </p>

        <h2 className="mt-0.5 text-lg font-black text-[#1b1712]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-[#1b1712]/52">
            {description}
          </p>
        )}
      </div>

      <div className="p-3">{children}</div>
    </section>
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

      <div className="min-w-0">
        <p className="text-xs font-black text-[#1b1712]/45">{label}</p>
        <p className="truncate text-xl font-black text-[#1b1712]">{value}</p>
        <p className="truncate text-xs font-bold text-[#1b1712]/42">{hint}</p>
      </div>
    </div>
  );
}

function PlanBadge({ state, plan }) {
  const good = state.canUseApp;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${
        good
          ? "border-green-900/25 bg-green-800/12 text-green-950"
          : "border-yellow-900/25 bg-yellow-700/15 text-yellow-950"
      }`}
    >
      <BadgeCheck size={13} />
      {getPlanLabel(plan)} · {state.accessLabel}
    </span>
  );
}

function PlanCard({ title, price, description, features, active, highlighted }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlighted
          ? "border-[#1b1712] bg-[#1b1712] text-[#efe7da]"
          : "border-[#8f806c]/50 bg-[#ded4c5] text-[#1b1712]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black">{title}</h3>

          <p
            className={`mt-1 text-sm font-bold ${
              highlighted ? "text-[#efe7da]/60" : "text-[#1b1712]/50"
            }`}
          >
            {description}
          </p>
        </div>

        {active && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-black ${
              highlighted
                ? "bg-[#efe7da] text-[#1b1712]"
                : "bg-[#1b1712] text-[#efe7da]"
            }`}
          >
            الحالية
          </span>
        )}
      </div>

      <p className="mt-4 text-2xl font-black">{price}</p>

      <div className="mt-4 grid gap-2">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <CheckCircle2 size={15} />

            <span
              className={`text-sm font-bold ${
                highlighted ? "text-[#efe7da]/70" : "text-[#1b1712]/60"
              }`}
            >
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcessCard({ number, title, description }) {
  return (
    <div className="rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] p-3">
      <span className="inline-flex rounded-full bg-[#1b1712] px-2.5 py-1 text-xs font-black text-[#efe7da]">
        {number}
      </span>

      <h3 className="mt-3 text-base font-black text-[#1b1712]">{title}</h3>

      <p className="mt-2 text-sm font-bold leading-6 text-[#1b1712]/52">
        {description}
      </p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] px-3 py-3">
      <p className="text-xs font-black text-[#1b1712]/45">{label}</p>

      <p
        dir="ltr"
        className="mt-1 break-all text-left text-sm font-black text-[#1b1712]"
      >
        {value || "—"}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] px-3 py-2.5">
      <span className="text-sm font-black text-[#1b1712]/55">{label}</span>

      <span className="truncate text-sm font-black text-[#1b1712]">
        {value || "—"}
      </span>
    </div>
  );
}

function Alert({ type, children }) {
  const styles =
    type === "success"
      ? "border-green-900/25 bg-green-800/12 text-green-950"
      : "border-red-900/25 bg-red-700/12 text-red-950";

  return (
    <p className={`mt-3 rounded-xl border p-3 text-sm font-bold leading-6 ${styles}`}>
      {children}
    </p>
  );
}