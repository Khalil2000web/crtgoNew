import { NextResponse } from "next/server";

const MENU_HOSTS = new Set(["menu.crtgo.com", "www.menu.crtgo.com"]);

export function proxy(request) {
  const url = request.nextUrl;
  const host = (request.headers.get("host") || "").split(":")[0];
  const pathname = url.pathname;

  const isAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap") ||
    pathname.includes(".");

  if (isAsset) return NextResponse.next();

  const isMenuHost = MENU_HOSTS.has(host);

  if (!isMenuHost) return NextResponse.next();

  // Real app routes that must NOT be rewritten into /m
  if (
    pathname.startsWith("/m/") ||
    pathname === "/m" ||
    pathname.startsWith("/q/") ||
    pathname === "/q"
  ) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = "/m";
    return NextResponse.rewrite(rewriteUrl);
  }

  const parts = pathname.split("/").filter(Boolean);

  if (parts.length >= 1 && parts.length <= 3) {
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = `/m/${parts.join("/")}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};