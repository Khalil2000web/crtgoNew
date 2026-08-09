import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const COOKIE_NAME = "crtgo_visitor";

const COOKIE_MAX_AGE =
  60 * 60 * 24 * 365 * 2; // 2 years

function createServerSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL"
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(
    url,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

function getVisitor(request) {
  const existing =
    request.cookies.get(
      COOKIE_NAME
    )?.value;

  if (isUuid(existing)) {
    return {
      visitorId: existing,
      isNew: false,
    };
  }

  return {
    visitorId:
      crypto.randomUUID(),

    isNew: true,
  };
}

function setVisitorCookie(
  response,
  visitor
) {
  if (!visitor.isNew) {
    return response;
  }

  response.cookies.set({
    name: COOKIE_NAME,
    value: visitor.visitorId,

    httpOnly: true,

    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite: "lax",

    path: "/",

    maxAge:
      COOKIE_MAX_AGE,
  });

  return response;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );
}

async function projectExists(
  supabase,
  projectId
) {
  const {
    data,
    error,
  } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function getStats(
  supabase,
  projectId
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    "get_project_rating_stats",
    {
      p_project_id:
        projectId,
    }
  );

  if (error) {
    throw error;
  }

  const row =
    Array.isArray(data)
      ? data[0]
      : data;

  return {
    average:
      row?.average_rating ===
        null ||
      row?.average_rating ===
        undefined
        ? null
        : Number(
            row.average_rating
          ),

    count:
      Number(
        row?.rating_count || 0
      ),
  };
}


/*
 * GET
 *
 * Returns:
 * - overall rating
 * - rating count
 * - this visitor's rating
 */
export async function GET(
  request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const projectId =
      searchParams.get(
        "projectId"
      );

    if (!isUuid(projectId)) {
      return NextResponse.json(
        {
          error:
            "Invalid project ID",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      createServerSupabase();

    const exists =
      await projectExists(
        supabase,
        projectId
      );

    if (!exists) {
      return NextResponse.json(
        {
          error:
            "Project not found",
        },
        {
          status: 404,
        }
      );
    }

    const visitor =
      getVisitor(request);

    const [
      stats,
      visitorRatingResult,
    ] = await Promise.all([
      getStats(
        supabase,
        projectId
      ),

      supabase
        .from("project_ratings")
        .select("rating")
        .eq(
          "project_id",
          projectId
        )
        .eq(
          "visitor_id",
          visitor.visitorId
        )
        .maybeSingle(),
    ]);

    if (
      visitorRatingResult.error
    ) {
      throw visitorRatingResult.error;
    }

    const response =
      NextResponse.json({
        average:
          stats.average,

        count:
          stats.count,

        myRating:
          visitorRatingResult
            .data?.rating ||
          null,
      });

    return setVisitorCookie(
      response,
      visitor
    );
  } catch (error) {
    console.error(
      "[CRTGO ratings GET]",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load ratings",
      },
      {
        status: 500,
      }
    );
  }
}


/*
 * POST
 *
 * Creates or updates this
 * visitor's rating.
 */
export async function POST(
  request
) {
  try {
    const body =
      await request.json();

    const projectId =
      body?.projectId;

    const rating =
      Number(body?.rating);

    if (!isUuid(projectId)) {
      return NextResponse.json(
        {
          error:
            "Invalid project ID",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          error:
            "Rating must be between 1 and 5",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      createServerSupabase();

    const exists =
      await projectExists(
        supabase,
        projectId
      );

    if (!exists) {
      return NextResponse.json(
        {
          error:
            "Project not found",
        },
        {
          status: 404,
        }
      );
    }

    const visitor =
      getVisitor(request);

    const {
      error: ratingError,
    } = await supabase
      .from("project_ratings")
      .upsert(
        {
          project_id:
            projectId,

          visitor_id:
            visitor.visitorId,

          rating,
        },
        {
          onConflict:
            "project_id,visitor_id",
        }
      );

    if (ratingError) {
      throw ratingError;
    }

    const stats =
      await getStats(
        supabase,
        projectId
      );

    const response =
      NextResponse.json({
        success: true,

        average:
          stats.average,

        count:
          stats.count,

        myRating:
          rating,
      });

    return setVisitorCookie(
      response,
      visitor
    );
  } catch (error) {
    console.error(
      "[CRTGO ratings POST]",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to save rating",
      },
      {
        status: 500,
      }
    );
  }
}