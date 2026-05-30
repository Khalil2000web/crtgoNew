import { NextResponse } from "next/server";

export function proxy(request) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  if (hostname === "dash.crtgo.com") {
    if (url.pathname === "/") {
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }

    if (url.pathname.startsWith("/start")) {
      return NextResponse.next();
    }

    if (!url.pathname.startsWith("/admin")) {
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};