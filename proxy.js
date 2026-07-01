import { NextResponse } from "next/server";

const MENU_HOSTS = new Set([
  "menu.crtgo.com",
  "www.menu.crtgo.com",
]);

export function proxy(request) {
  const url = request.nextUrl;
  const host = request.headers.get("host") || "";

  const pathname = url.pathname;

  const isAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap") ||
    pathname.includes(".");

  if (isAsset) {
    return NextResponse.next();
  }

  const isMenuHost = MENU_HOSTS.has(host);

  if (!isMenuHost) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/m/")) {
    return NextResponse.next();
  }

  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 2) {
    const [businessSlug, branchSlug] = parts;

    url.pathname = `/m/${businessSlug}/${branchSlug}`;

    return NextResponse.rewrite(url);
  }

  if (pathname === "/") {
    url.pathname = "/m";

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};