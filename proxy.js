import {
  NextResponse,
} from "next/server";


function getHostname(
  request
) {
  return String(
    request.headers.get(
      "host"
    ) ||
      ""
  )
    .split(
      ":"
    )[0]
    .trim()
    .toLowerCase();
}


function shouldIgnorePath(
  pathname
) {
  if (
    pathname ===
    "/"
  ) {
    return true;
  }


  if (
    pathname.startsWith(
      "/api/"
    ) ||
    pathname ===
      "/api"
  ) {
    return true;
  }


  if (
    pathname.startsWith(
      "/_next/"
    )
  ) {
    return true;
  }


  if (
    pathname.startsWith(
      "/tenant/"
    ) ||
    pathname ===
      "/tenant"
  ) {
    return true;
  }


  if (
    pathname ===
      "/favicon.ico" ||
    pathname ===
      "/robots.txt" ||
    pathname ===
      "/sitemap.xml"
  ) {
    return true;
  }


  /*
   * Public/static files:
   *
   * /logo.png
   * /fonts/font.woff2
   * /manifest.webmanifest
   * etc.
   */
  const lastSegment =
    pathname
      .split(
        "/"
      )
      .pop() ||
    "";


  if (
    lastSegment.includes(
      "."
    )
  ) {
    return true;
  }


  return false;
}


export function proxy(
  request
) {
  const hostname =
    getHostname(
      request
    );


  const {
    pathname,
  } =
    request.nextUrl;


  /*
   * Only the canonical CRTRGO
   * menu hostname is tenant-routed.
   *
   * Production:
   * menu.crtrgo.com
   *
   * Local:
   * menu.localhost:3000
   */
  const isMenuHostname =
    hostname ===
      "menu.crtrgo.com" ||
    hostname ===
      "menu.localhost";


  if (
    !isMenuHostname
  ) {
    return NextResponse.next();
  }


  if (
    shouldIgnorePath(
      pathname
    )
  ) {
    return NextResponse.next();
  }


  const segments =
    pathname
      .split(
        "/"
      )
      .filter(
        Boolean
      );


  const slug =
    String(
      segments[0] ||
        ""
    )
      .trim()
      .toLowerCase();


  if (
    !slug
  ) {
    return NextResponse.next();
  }


  const remainingPath =
    segments
      .slice(
        1
      )
      .join(
        "/"
      );


  const rewriteUrl =
    request.nextUrl.clone();


  rewriteUrl.pathname =
    remainingPath
      ? `/tenant/${slug}/${remainingPath}`
      : `/tenant/${slug}`;


  return NextResponse.rewrite(
    rewriteUrl
  );
}


export const config = {
  matcher: [
    "/((?!_next/static|_next/image).*)",
  ],
};