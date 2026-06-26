import { NextResponse } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "crtgo.com";
const WS_DOMAIN = process.env.NEXT_PUBLIC_WS_DOMAIN || `ws.${ROOT_DOMAIN}`;
const MENU_DOMAIN = process.env.NEXT_PUBLIC_MENU_DOMAIN || `m.${ROOT_DOMAIN}`;

function cleanHost(host) {
  return String(host || "")
    .toLowerCase()
    .replace(/^www\./, "")
    .split(":")[0];
}

function isFileOrSystemPath(pathname) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.includes(".")
  );
}

function redirectToWs(request, pathname = "/menus") {
  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.host = WS_DOMAIN;
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

export function proxy(request) {
  const url = request.nextUrl.clone();
  const host = cleanHost(request.headers.get("host"));
  const pathname = url.pathname;

  if (isFileOrSystemPath(pathname)) {
    return NextResponse.next();
  }

  /*
    m.crtgo.com
    Public menu domain.

    m.crtgo.com/restaurant-name
    secretly renders:
    /m/restaurant-name
  */
  if (host === MENU_DOMAIN) {
    const parts = pathname.split("/").filter(Boolean);

    if (parts.length === 0) {
      return redirectToWs(request, "/menus");
    }

    const firstPart = parts[0];

    const blockedMenuDomainPaths = [
      "admin",
      "start",
      "account",
      "billing",
      "checkout",
      "upgrade",
      "settings",
      "menus",
      "login",
      "signup",
    ];

    if (blockedMenuDomainPaths.includes(firstPart)) {
      return redirectToWs(request, pathname);
    }

    if (firstPart === "m") {
      return NextResponse.next();
    }

    url.pathname = `/m/${firstPart}`;

    return NextResponse.rewrite(url);
  }

  /*
    crtgo.com
    Parent brand domain.

    For now, send it to Web Services.
    Later you can build a real parent-brand homepage here.
  */
  if (host === ROOT_DOMAIN) {
    url.protocol = "https:";
    url.host = WS_DOMAIN;
    return NextResponse.redirect(url);
  }

  /*
    ws.crtgo.com
    Main Web Services app:
    /start
    /admin
    /admin/account
    /menus
  */
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};