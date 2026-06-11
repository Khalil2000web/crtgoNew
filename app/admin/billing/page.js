import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function formatDate(date) {
  if (!date) return "غير محدد";

  return new Intl.DateTimeFormat("ar", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function getTrialDaysLeft(profile) {
  if (!profile?.trial_ends_at) return 0;

  return Math.max(
    0,
    Math.ceil(
      (new Date(profile.trial_ends_at) - new Date()) /
        (1000 * 60 * 60 * 24)
    )
  );
}

export default async function BillingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const plan = profile?.plan_id || "trial";
  const status = profile?.subscription_status || "unknown";
  const trialDaysLeft = getTrialDaysLeft(profile);

  return (
    <main dir="rtl" className="min-h-screen px-5 py-10">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm text-black/50">CRTGO BILLING</p>

        <h1 className="mt-2 text-5xl font-black">الفوترة والاشتراك</h1>

        <p className="mt-4 text-black/50">
          إدارة الخطة الحالية، حالة الاشتراك، ومعلومات الدفع.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-black/20 p-6">
            <h2 className="text-2xl font-black">الخطة الحالية</h2>

            <div className="mt-6 rounded-3xl bg-black p-6 text-white">
              <p className="text-sm text-white/50">PLAN</p>

              <h3 className="mt-2 text-5xl font-black uppercase">{plan}</h3>

              <p className="mt-4 text-white/60">
                الحالة:{" "}
                <span className="font-bold uppercase text-white">
                  {status}
                </span>
              </p>

              {status === "trialing" && (
                <p className="mt-2 text-white/60">
                  متبقي من الفترة التجريبية:{" "}
                  <span className="font-bold text-white">
                    {trialDaysLeft} أيام
                  </span>
                </p>
              )}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-black/10 p-4">
                <p className="text-sm text-black/50">بداية الفترة التجريبية</p>
                <p className="mt-1 font-bold">
                  {formatDate(profile?.trial_started_at)}
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 p-4">
                <p className="text-sm text-black/50">نهاية الفترة التجريبية</p>
                <p className="mt-1 font-bold">
                  {formatDate(profile?.trial_ends_at)}
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 p-4">
                <p className="text-sm text-black/50">بداية الاشتراك</p>
                <p className="mt-1 font-bold">
                  {formatDate(profile?.subscription_started_at)}
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 p-4">
                <p className="text-sm text-black/50">نهاية الاشتراك</p>
                <p className="mt-1 font-bold">
                  {formatDate(profile?.subscription_ends_at)}
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-black/20 p-5">
              <h2 className="text-xl font-black">إدارة الاشتراك</h2>

              <p className="mt-3 text-sm text-black/50">
                يمكنك ترقية خطتك أو تغييرها من صفحة الخطط.
              </p>

              <Link
                href="/admin/upgrade"
                className="mt-5 flex w-full items-center justify-center rounded-2xl bg-black px-4 py-4 font-bold text-white"
              >
                تغيير الخطة
              </Link>
            </div>

            <div className="rounded-3xl border border-black/20 p-5">
              <h2 className="text-xl font-black">الدفع</h2>

              <p className="mt-3 text-sm text-black/50">
                سيتم ربط مزود الدفع هنا لاحقاً.
              </p>

              <div className="mt-4 rounded-2xl bg-black/5 p-4 text-sm text-black/60">
                Provider: {profile?.payment_provider || "not connected"}
              </div>
            </div>

            <div className="rounded-3xl border border-black/20 p-5">
              <h2 className="text-xl font-black">الفواتير</h2>

              <p className="mt-3 text-sm text-black/50">
                سجل الفواتير سيظهر هنا بعد ربط الدفع.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}