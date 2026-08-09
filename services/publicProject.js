import "server-only";

import {
  cache,
} from "react";

import {
  createPublicSupabaseClient,
} from "@/lib/supabase/public";


function sortByOrder(
  values = []
) {
  return [
    ...values,
  ].sort(
    (
      a,
      b
    ) =>
      Number(
        a.sort_order ??
          9999
      ) -
      Number(
        b.sort_order ??
          9999
      )
  );
}


export const getPublicProject =
  cache(
    async function getPublicProject(
      hostname
    ) {
      const cleanHostname =
        String(
          hostname ||
            ""
        )
          .trim()
          .toLowerCase();


      if (
        !cleanHostname
      ) {
        return null;
      }


      const supabase =
        createPublicSupabaseClient();


      const {
        data,
        error,
      } =
        await supabase
          .from(
            "projects"
          )
          .select(`
            *,
            sections (
              *,
              items (
                *
              )
            )
          `)
          .eq(
            "slug",
            cleanHostname
          )
          .eq(
            "status",
            "active"
          )
          .maybeSingle();


      if (error) {
        console.error(
          "Failed to load public project:",
          error
        );

        throw error;
      }


      if (!data) {
        return null;
      }


      const sections =
        sortByOrder(
          data.sections ||
            []
        ).map(
          (
            section
          ) => ({
            ...section,

            items:
              sortByOrder(
                section.items ||
                  []
              ),
          })
        );


      return {
        ...data,
        sections,
      };
    }
  );