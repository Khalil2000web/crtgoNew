import { NextResponse } from "next/server";

function getHostname(request) {
  return String(request.headers.get("host") || "")
    .split(":")[0]
    .trim()
    .toLowerCase();
}

function shouldIgnorePath(pathname) {
  if (pathname === "/") return true;

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

export function proxy(request) {
  const hostname = getHostname(request);
  const { pathname } = request.nextUrl;

  /*
   * CRTGO menu routing.
   *
   * Production: menu.crtgo.com
   * Legacy domain stays supported during migration: menu.crtrgo.com
   * Local: localhost:3000/demo or menu.localhost:3000/demo
   */
  const isMenuHostname = [
    "menu.crtgo.com",
    "menu.crtrgo.com",
    "menu.localhost",
    "localhost",
    "127.0.0.1",
  ].includes(hostname);

  if (!isMenuHostname || shouldIgnorePath(pathname)) {
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
