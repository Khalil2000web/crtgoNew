import Image from "next/image";
import { redirect } from "next/navigation";
import { AlertCircle, QrCode, Store } from "lucide-react";

import { supabasePublic } from "@/lib/supabasePublic";
import { getBranchHref } from "@/app/m/_lib/publicMenuData";
import { getMenuFont } from "@/app/fonts";

export const revalidate = 0;
export const dynamic = "force-dynamic";

async function resolveQr(code) {
  const { data, error } = await supabasePublic.rpc("public_resolve_branch_qr", {
    p_code: code,
  });

  if (error) {
    console.error("QR resolver error:", error);

    return {
      qr: null,
      reason: "resolver_error",
      debug: error.message,
    };
  }

  const qr = data?.[0] || null;

  if (!qr) {
    return {
      qr: null,
      reason: "qr_not_found",
      debug: `No QR row returned for code: ${code}`,
    };
  }

  return {
    qr,
    reason: null,
    debug: null,
  };
}

function getUnavailableText(reason) {
  if (reason === "qr_not_found") {
    return "This QR code does not exist or was not found in the database.";
  }

  if (reason === "resolver_error") {
    return "The QR resolver could not load this QR code.";
  }

  if (reason === "qr_disabled") {
    return "This QR code has been disabled by the menu owner.";
  }

  if (reason === "business_unavailable") {
    return "This business is currently unavailable.";
  }

  if (reason === "branch_unavailable") {
    return "This branch is currently unavailable.";
  }

  if (reason === "past_due") {
    return "This menu is currently unavailable because billing needs attention.";
  }

  if (reason === "paused") {
    return "This menu is currently paused.";
  }

  if (reason === "canceled") {
    return "This menu is currently unavailable.";
  }

  return "This QR code is currently unavailable.";
}

export async function generateMetadata({ params }) {
  const { code } = await params;

  return {
    title: `QR ${code} | CRTGO Menu`,
    description: "CRTGO permanent menu QR link.",
  };
}

export default async function QrRedirectPage({ params }) {
  const { code } = await params;
  const result = await resolveQr(code);

  if (!result.qr) {
    return (
      <QrUnavailablePage
        qr={{
          business_name: "QR not found",
          business_logo_url: null,
          unavailable_reason: result.reason,
          debug: result.debug,
        }}
      />
    );
  }

  const qr = result.qr;

  if (qr.is_available) {
    redirect(getBranchHref(qr.business_slug, qr.branch_slug));
  }

  return <QrUnavailablePage qr={qr} />;
}

function QrUnavailablePage({ qr }) {
  return (
    <main
      dir="rtl"
      className="grid min-h-screen place-items-center bg-[#f7f4ef] px-4 py-10 text-black"
      style={{
        fontFamily: getMenuFont("clean"),
      }}
    >
      <section className="w-full max-w-md rounded-[34px] border border-black/10 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto grid h-20 w-20 place-items-center overflow-hidden rounded-[26px] border border-black/10 bg-black text-white">
          {qr.business_logo_url ? (
            <Image
              src={qr.business_logo_url}
              alt={qr.business_name || "CRTGO Menu"}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <Store size={32} />
          )}
        </div>

        <div className="mx-auto mt-5 grid h-12 w-12 place-items-center rounded-2xl bg-[#ff7a00]/15 text-[#ff7a00]">
          {qr.unavailable_reason === "qr_disabled" ? (
            <QrCode size={24} />
          ) : (
            <AlertCircle size={24} />
          )}
        </div>

        <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-black/35">
          CRTGO MENU
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-[-0.07em]">
          {qr.business_name || "Menu unavailable"}
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-sm font-bold leading-7 text-black/55">
          {getUnavailableText(qr.unavailable_reason)}
        </p>

        {qr.debug && (
          <p
            dir="ltr"
            className="mt-4 break-words rounded-2xl bg-black/5 p-3 text-xs font-bold leading-5 text-black/45"
          >
            {qr.debug}
          </p>
        )}

        <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-black/30">
          Powered by CRTGO
        </p>
      </section>
    </main>
  );
}