import { NextResponse } from "next/server";

import { supabasePublic } from "@/lib/supabasePublic";
import { getBranchHref } from "@/app/m/_lib/publicMenuData";

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

export async function GET(request, { params }) {
  const { code } = await params;
  const result = await resolveQr(code);

  if (result.qr?.is_available) {
    const href = getBranchHref(result.qr.business_slug, result.qr.branch_slug);
    const targetUrl = new URL(href, request.url);

    return NextResponse.redirect(targetUrl, {
      status: 302,
    });
  }

  const unavailableUrl = new URL(`/q/unavailable/${code}`, request.url);

  if (result.reason) {
    unavailableUrl.searchParams.set("reason", result.reason);
  }

  if (result.debug) {
    unavailableUrl.searchParams.set("debug", result.debug);
  }

  return NextResponse.redirect(unavailableUrl, {
    status: 302,
  });
}