import {
  NextResponse,
} from "next/server";

function cleanHost(value) {
  return String(value || "")
    .split(":")[0]
    .trim()
    .toLowerCase();
}

function getTenantFromHost(
  rawHost
) {
  const host =
    cleanHost(rawHost);

  if (!host) {
    return null;
  }

  /*
   * LOCAL:
   *
   * test.localhost:3000
   */
  if (
    host.endsWith(
      ".localhost"
    )
  ) {
    const tenant =
      host.slice(
        0,
        -".localhost".length
      );

    if (
      tenant &&
      !tenant.includes(".")
    ) {
      return tenant;
    }
  }

  /*
   * PRODUCTION:
   *
   * test.w.crtgo.com
   */
  const suffix =
    ".w.crtgo.com";

  if (
    host.endsWith(suffix)
  ) {
    const tenant =
      host.slice(
        0,
        -suffix.length
      );

    if (
      tenant &&
      !tenant.includes(".")
    ) {
      return tenant;
    }
  }

  return null;
}

export function proxy(
  request
) {
  const {
    pathname,
  } = request.nextUrl;

  /*
   * Never rewrite Next internals,
   * API handlers, or static files.
   */
  if (
    pathname.startsWith(
      "/_next"
    ) ||
    pathname.startsWith(
      "/api"
    ) ||
    pathname ===
      "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const host =
    request.headers.get(
      "host"
    );

  const tenant =
    getTenantFromHost(
      host
    );

  if (!tenant) {
    return NextResponse.next();
  }

  /*
   * Avoid recursively rewriting
   * an already-internal tenant path.
   */
  if (
    pathname.startsWith(
      "/tenant/"
    )
  ) {
    return NextResponse.next();
  }

  const url =
    request.nextUrl.clone();

  const cleanPath =
    pathname === "/"
      ? ""
      : pathname;

  url.pathname =
    `/tenant/${encodeURIComponent(
      tenant
    )}${cleanPath}`;

  return NextResponse.rewrite(
    url
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};