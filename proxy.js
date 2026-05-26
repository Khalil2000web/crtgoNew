import { NextResponse } from "next/server";

export function proxy(request) {
  const url = request.nextUrl.clone();

  const host = request.headers
    .get("host")
    ?.replace(":3000", "");

  const rootDomain = "crtgo.com";

  if (host === rootDomain || host === `www.${rootDomain}`) {
    return NextResponse.next();
  }

  const subdomain = host?.split(".")[0];

  if (subdomain && subdomain !== "www") {
    url.pathname = `/menu/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\.).*)"],
};