import {
  createClient,
} from "@supabase/supabase-js";

import {
  cacheLife,
  cacheTag,
} from "next/cache";


function createPublicSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL"
    );
  }

  if (!anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createClient(
    url,
    anonKey,
    {
      auth: {
        persistSession:
          false,

        autoRefreshToken:
          false,

        detectSessionInUrl:
          false,
      },
    }
  );
}


function sortByOrder(
  items = []
) {
  return [
    ...items,
  ].sort(
    (
      a,
      b
    ) =>
      Number(
        a?.sort_order ||
          0
      ) -
      Number(
        b?.sort_order ||
          0
      )
  );
}


function normalizeLanguages(
  value
) {
  if (
    !Array.isArray(
      value
    )
  ) {
    return [
      "ar",
    ];
  }

  const clean = [
    ...new Set(
      value
        .map(
          (
            item
          ) =>
            String(
              item ||
                ""
            )
              .trim()
              .toLowerCase()
        )
        .filter(
          Boolean
        )
    ),
  ];

  return clean.length
    ? clean
    : [
        "ar",
      ];
}


function normalizeCoverImages(
  value
) {
  if (
    !Array.isArray(
      value
    )
  ) {
    return [];
  }

  return value
    .map(
      (
        item
      ) => {
        if (
          typeof item ===
          "string"
        ) {
          return item.trim();
        }

        if (
          item &&
          typeof item ===
            "object"
        ) {
          return (
            item.url ||
            item.src ||
            item.image_url ||
            ""
          );
        }

        return "";
      }
    )
    .filter(
      Boolean
    );
}


export async function getPublicProject(
  slug
) {
  "use cache";


  const cleanSlug =
    String(
      slug ||
        ""
    )
      .trim()
      .toLowerCase();


  if (
    !cleanSlug
  ) {
    return null;
  }


  cacheTag(
    `crtgo-project-${cleanSlug}`
  );


  cacheLife({
    stale:
      60,

    revalidate:
      60,

    expire:
      300,
  });


  const supabase =
    createPublicSupabase();


  /*
   * PROJECT
   */

  const {
    data: project,
    error:
      projectError,
  } =
    await supabase
      .from(
        "projects"
      )
      .select(`
        id,
        owner_id,
        name,
        slug,
        status,
        description,

        logo_url,
        favicon_url,
        cover_images,

        phone,
        whatsapp,
        instagram,
        tiktok,
        facebook,

        location,
        working_hours,

        primary_color,
        background_color,
        text_color,

        enabled_languages,
        default_language,

        name_i18n,
        description_i18n,
        location_i18n,

        created_at,
        updated_at
      `)
      .ilike(
        "slug",
        cleanSlug
      )
      .eq(
        "status",
        "active"
      )
      .maybeSingle();


  if (
    projectError
  ) {
    console.error(
      "[CRTGO public] Project lookup failed:",
      projectError
    );

    throw new Error(
      "Failed to load public project"
    );
  }


  if (
    !project
  ) {
    return null;
  }


  /*
   * SECTIONS
   */

  const {
    data:
      sectionRows,
    error:
      sectionsError,
  } =
    await supabase
      .from(
        "sections"
      )
      .select(`
        id,
        project_id,
        name,
        description,
        cover_url,
        icon_type,
        icon_value,
        sort_order,
        name_i18n,
        description_i18n,
        created_at,
        updated_at
      `)
      .eq(
        "project_id",
        project.id
      )
      .order(
        "sort_order",
        {
          ascending:
            true,
        }
      );


  if (
    sectionsError
  ) {
    console.error(
      "[CRTGO public] Sections lookup failed:",
      sectionsError
    );

    throw new Error(
      "Failed to load public sections"
    );
  }


  const sections =
    sortByOrder(
      sectionRows ||
        []
    );


  const sectionIds =
    sections.map(
      (
        section
      ) =>
        section.id
    );


  /*
   * ITEMS
   */

  let itemRows =
    [];


  if (
    sectionIds.length
  ) {
    const {
      data,
      error:
        itemsError,
    } =
      await supabase
        .from(
          "items"
        )
        .select(`
          id,
          section_id,
          name,
          description,
          price,
          image_url,
          is_available,
          sort_order,
          name_i18n,
          description_i18n,
          created_at,
          updated_at
        `)
        .in(
          "section_id",
          sectionIds
        )
        .eq(
          "is_available",
          true
        )
        .order(
          "sort_order",
          {
            ascending:
              true,
          }
        );


    if (
      itemsError
    ) {
      console.error(
        "[CRTGO public] Items lookup failed:",
        itemsError
      );

      throw new Error(
        "Failed to load public items"
      );
    }


    itemRows =
      data ||
      [];
  }


  const itemsBySection =
    new Map();


  for (
    const item of
    sortByOrder(
      itemRows
    )
  ) {
    const current =
      itemsBySection.get(
        item.section_id
      ) ||
      [];


    current.push({
      id:
        item.id,

      sectionId:
        item.section_id,

      name:
        item.name,

      description:
        item.description,

      price:
        item.price,

      imageUrl:
        item.image_url,

      available:
        item.is_available,

      sortOrder:
        item.sort_order,

      nameI18n:
        item.name_i18n ||
        {},

      descriptionI18n:
        item.description_i18n ||
        {},
    });


    itemsBySection.set(
      item.section_id,
      current
    );
  }


  const finalSections =
    sections.map(
      (
        section
      ) => ({
        id:
          section.id,

        name:
          section.name,

        description:
          section.description,

        coverUrl:
          section.cover_url,

        iconType:
          section.icon_type ||
          "none",

        iconValue:
          section.icon_value ||
          null,

        sortOrder:
          section.sort_order,

        nameI18n:
          section.name_i18n ||
          {},

        descriptionI18n:
          section.description_i18n ||
          {},

        items:
          itemsBySection.get(
            section.id
          ) ||
          [],
      })
    );


  const coverImages =
    normalizeCoverImages(
      project.cover_images
    );


  const enabledLanguages =
    normalizeLanguages(
      project.enabled_languages
    );


  const requestedDefaultLanguage =
    String(
      project.default_language ||
        ""
    )
      .trim()
      .toLowerCase();


  const defaultLanguage =
    enabledLanguages.includes(
      requestedDefaultLanguage
    )
      ? requestedDefaultLanguage
      : enabledLanguages[0] ||
        "ar";


  return {
    id:
      project.id,

    name:
      project.name,

    slug:
      project.slug,

    status:
      project.status,

    description:
      project.description,

    logoUrl:
      project.logo_url,

    faviconUrl:
      project.favicon_url,

    coverUrl:
      coverImages[0] ||
      null,

    coverImages,

    phone:
      project.phone,

    whatsapp:
      project.whatsapp,

    instagram:
      project.instagram,

    tiktok:
      project.tiktok,

    facebook:
      project.facebook,

    location:
      project.location,

    workingHours:
      project.working_hours,

    primaryColor:
      project.primary_color ||
      "#000000",

    backgroundColor:
      project.background_color ||
      "#ffffff",

    textColor:
      project.text_color ||
      "#000000",

    enabledLanguages,

    defaultLanguage,

    nameI18n:
      project.name_i18n ||
      {},

    descriptionI18n:
      project.description_i18n ||
      {},

    locationI18n:
      project.location_i18n ||
      {},

    sections:
      finalSections,
  };
}


/*
 * Temporary compatibility export.
 *
 * Remove this later once nothing
 * imports getPublicMenuData anymore.
 */

export const getPublicMenuData =
  getPublicProject;