import { NextResponse } from "next/server";

export function proxy(request) {
  const url = request.nextUrl;
  const hostname = request.headers
    .get("host")
    ?.replace(":3000", "");

  const rootDomain =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN || "crtgo.com";

  const isRootDomain =
    hostname === rootDomain ||
    hostname === `www.${rootDomain}`;

  if (isRootDomain) {
    return NextResponse.next();
  }

  if (hostname?.endsWith(`.${rootDomain}`)) {
    const subdomain = hostname.replace(
      `.${rootDomain}`,
      ""
    );

    url.pathname = `/menu/${subdomain}`;

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|.*\\.).*)",
  ],
};