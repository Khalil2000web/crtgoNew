import { NextResponse } from "next/server";

export function proxy(request) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("host") || "";

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "crtrgo.com";

  const isLocalhost = host.includes("localhost");
  const isVercelPreview = host.includes("vercel.app");

  if (!isLocalhost && !isVercelPreview) {
    const subdomain = host.replace(`.${rootDomain}`, "");

    if (subdomain && subdomain !== rootDomain && !subdomain.includes(":")) {
      url.pathname = `/menu/${subdomain}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};