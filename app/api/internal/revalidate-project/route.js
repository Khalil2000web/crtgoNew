import {
  revalidateTag,
} from "next/cache";


function json(
  data,
  status = 200
) {
  return Response.json(
    data,
    {
      status,
    }
  );
}


function getBearerToken(
  request
) {
  const authorization =
    request.headers.get(
      "authorization"
    ) ||
    "";


  if (
    !authorization
      .toLowerCase()
      .startsWith(
        "bearer "
      )
  ) {
    return "";
  }


  return authorization
    .slice(
      7
    )
    .trim();
}


function normalizeSlug(
  value
) {
  return String(
    value ||
      ""
  )
    .trim()
    .toLowerCase();
}


function isValidSlug(
  value
) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
    value
  );
}


function safeEqual(
  first,
  second
) {
  if (
    !first ||
    !second ||
    first.length !==
      second.length
  ) {
    return false;
  }


  let difference =
    0;


  for (
    let index = 0;
    index <
    first.length;
    index += 1
  ) {
    difference |=
      first.charCodeAt(
        index
      ) ^
      second.charCodeAt(
        index
      );
  }


  return difference ===
    0;
}


export async function POST(
  request
) {
  const configuredSecret =
    String(
      process.env
        .CRTRGO_REVALIDATION_SECRET ||
        ""
    ).trim();


  if (
    !configuredSecret
  ) {
    console.error(
      "[CRTRGO revalidation] CRTRGO_REVALIDATION_SECRET is missing."
    );


    return json(
      {
        error:
          "Revalidation is not configured",
      },
      503
    );
  }


  const providedSecret =
    getBearerToken(
      request
    );


  if (
    !safeEqual(
      providedSecret,
      configuredSecret
    )
  ) {
    return json(
      {
        error:
          "Unauthorized",
      },
      401
    );
  }


  let body;


  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        error:
          "Invalid JSON",
      },
      400
    );
  }


  const slug =
    normalizeSlug(
      body?.slug
    );


  if (
    !slug ||
    !isValidSlug(
      slug
    )
  ) {
    return json(
      {
        error:
          "Invalid project slug",
      },
      400
    );
  }


  const tag =
    `crtrgo-project-${slug}`;


  /*
   * Expire this project's cached
   * public data immediately.
   *
   * The next request waits for
   * fresh data rather than using
   * the previous entitlement state.
   */
  revalidateTag(
    tag,
    {
      expire:
        0,
    }
  );


  console.log(
    "[CRTRGO revalidation] Invalidated:",
    tag
  );


  return json({
    revalidated:
      true,

    tag,

    slug,

    revalidatedAt:
      new Date()
        .toISOString(),
  });
}