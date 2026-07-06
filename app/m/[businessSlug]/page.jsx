import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowUpRight, Store } from "lucide-react";

import {
  getBranchHref,
  getBusinessPayload,
} from "../_lib/publicMenuData";
import PublicUnavailablePage from "../_components/PublicUnavailablePage";
import { getMenuFont } from "../../fonts";

export const revalidate = 180;

function pickText(record, baseKey, i18nKey, language = "ar") {
  return record?.[i18nKey]?.[language] || record?.[baseKey] || "";
}

function getBranchImage(branch) {
  const menu =
    branch.menu_versions?.find((item) => item.status === "active") ||
    branch.menu_versions?.[0];

  const firstSection = menu?.sections?.[0];
  const firstItem = firstSection?.items?.find((item) => item.image_url);

  return (
    menu?.cover_url ||
    menu?.logo_url ||
    firstSection?.cover_url ||
    firstItem?.image_url
  );
}

export async function generateMetadata({ params }) {
  const { businessSlug } = await params;
  const data = await getBusinessPayload(businessSlug);

  if (!data) {
    return {
      title: "Business not found | CRTGO",
    };
  }

  if (!data.billing?.isAvailable) {
    return {
      title: `${data.business.name} unavailable | CRTGO Menu`,
      description: "This menu is currently unavailable.",
    };
  }

  return {
    title: `${data.business.name} | CRTGO Menu`,
    description:
      data.business.description ||
      `Choose a branch for ${data.business.name}.`,
  };
}

export default async function BusinessLandingPage({ params }) {
  const { businessSlug } = await params;
  const data = await getBusinessPayload(businessSlug);

  if (!data) notFound();

  const { business, branches, billing } = data;

  if (!billing?.isAvailable) {
    return (
      <PublicUnavailablePage
        business={business}
        status={billing?.status}
      />
    );
  }

  if (!branches.length) notFound();

  const mainBranch = branches.find((branch) => branch.is_main) || branches[0];

  if (business.landing_mode === "redirect_main" || branches.length === 1) {
    redirect(getBranchHref(business.slug, mainBranch.slug));
  }

  const cover =
    business.landing_cover_url ||
    business.logo_url ||
    getBranchImage(mainBranch);

  const businessName = pickText(business, "name", "name_i18n", "ar");

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f7f4ef] text-black"
      style={{
        fontFamily: getMenuFont("clean"),
      }}
    >
      <header className="relative overflow-hidden px-4 py-4">
        <section className="relative mx-auto min-h-[340px] max-w-5xl overflow-hidden rounded-[34px] bg-black text-white">
          {cover && (
            <Image
              src={cover}
              alt={businessName}
              fill
              priority
              sizes="100vw"
              className="pointer-events-none select-none object-cover opacity-65"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/15" />

          <div className="relative z-10 flex min-h-[340px] flex-col justify-end p-6">
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[24px] border border-white/15 bg-white/15 backdrop-blur-xl">
              {business.logo_url ? (
                <Image
                  src={business.logo_url}
                  alt={businessName}
                  fill
                  priority
                  sizes="80px"
                  className="pointer-events-none object-cover"
                />
              ) : (
                <Store size={32} />
              )}
            </div>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-white/50">
              CRTGO MENU
            </p>

            <h1 className="mt-2 text-5xl font-black tracking-[-0.07em]">
              {businessName}
            </h1>

            {business.description && (
              <p className="mt-3 max-w-xl text-sm font-bold leading-6 text-white/65">
                {business.description}
              </p>
            )}
          </div>
        </section>
      </header>

      <section className="mx-auto max-w-5xl px-4 pb-12 pt-4">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-black/35">
              الفروع
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-[-0.05em]">
              اختر الفرع
            </h2>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {branches.map((branch, index) => {
            const image = getBranchImage(branch);

            return (
              <Link
                prefetch={true}
                key={branch.id}
                href={getBranchHref(business.slug, branch.slug)}
                className="group overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                style={{
                  animation: "crtgoRise .45s ease both",
                  animationDelay: `${index * 55}ms`,
                }}
              >
                <div className="relative aspect-[16/10] bg-black/5">
                  {image ? (
                    <Image
                      src={image}
                      alt={branch.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="pointer-events-none object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <Store size={36} className="opacity-25" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-black">
                      {pickText(branch, "name", "name_i18n", "ar")}
                    </h3>

                    {branch.address && (
                      <p className="mt-1 truncate text-sm font-bold text-black/45">
                        {branch.address}
                      </p>
                    )}
                  </div>

                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-black text-white">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <style>{`
        @keyframes crtgoRise {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}