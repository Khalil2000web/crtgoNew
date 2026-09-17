import { NextResponse } from "next/server";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "admin",
  "ws",
  "menu",
  "api",
  "app",
  "accounts",
]);

function getHostname(request) {
  return String(request.headers.get("host") || "")
    .split(":")[0]
    .trim()
    .toLowerCase();
}

function shouldIgnorePath(pathname) {
  if (pathname.startsWith("/api/") || pathname === "/api") return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/tenant/") || pathname === "/tenant") return true;

  if (
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return true;
  }

  const lastSegment = pathname.split("/").pop() || "";
  if (lastSegment.includes(".")) return true;

  return false;
}

function tenantSlugFromHostname(hostname) {
  if (hostname.endsWith(".crtgo.com")) {
    const labels = hostname.split(".");

    if (labels.length === 3) {
      const slug = labels[0];
      return RESERVED_SUBDOMAINS.has(slug) ? null : slug;
    }
  }

  if (hostname.endsWith(".localhost")) {
    const slug = hostname.slice(0, -".localhost".length);
    return slug && !RESERVED_SUBDOMAINS.has(slug) ? slug : null;
  }

  return null;
}

export function proxy(request) {
  const hostname = getHostname(request);
  const { pathname } = request.nextUrl;

  if (shouldIgnorePath(pathname)) {
    return NextResponse.next();
  }

  const hostnameSlug = tenantSlugFromHostname(hostname);

  /*
   * Canonical tenant URLs:
   *   demo.crtgo.com
   *   restaurant-name.crtgo.com
   *
   * Local equivalent:
   *   demo.localhost:3000
   */
  if (hostnameSlug) {
    const rewriteUrl = request.nextUrl.clone();

    rewriteUrl.pathname = pathname === "/"
      ? `/tenant/${hostnameSlug}`
      : `/tenant/${hostnameSlug}${pathname}`;

    return NextResponse.rewrite(rewriteUrl);
  }

  /*
   * Temporary compatibility routes while migrating:
   *   menu.crtgo.com/demo
   *   menu.crtrgo.com/demo
   *   localhost:3000/demo
   */
  const isPathBasedMenuHost = [
    "menu.crtgo.com",
    "menu.crtrgo.com",
    "menu.localhost",
    "localhost",
    "127.0.0.1",
  ].includes(hostname);

  if (!isPathBasedMenuHost || pathname === "/") {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const slug = String(segments[0] || "").trim().toLowerCase();

  if (!slug) return NextResponse.next();

  const remainingPath = segments.slice(1).join("/");
  const rewriteUrl = request.nextUrl.clone();

  rewriteUrl.pathname = remainingPath
    ? `/tenant/${slug}/${remainingPath}`
    : `/tenant/${slug}`;

  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
