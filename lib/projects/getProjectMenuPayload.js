import "server-only";

import { redis } from "@/lib/redis/client";
import { getBranchMenuPayloadByIds } from "@/app/m/_lib/publicMenuData";

const MENU_CACHE_SECONDS = 5 * 60;

export async function getProjectMenuPayload(
  project,
) {
  if (!project?.id) {
    return null;
  }

  if (
    project.service_type !== "menu"
  ) {
    return null;
  }

  if (
    !project.business_id ||
    !project.branch_id
  ) {
    return null;
  }

  const cacheKey =
    `crtgo:menu:${project.id}`;

  /*
   * Redis first.
   */
  const cached =
    await redis.get(cacheKey);

  if (cached) {
    return cached;
  }

  /*
   * Redis miss.
   *
   * Load the full public menu
   * payload from Supabase.
   */
  const payload =
    await getBranchMenuPayloadByIds(
      project.business_id,
      project.branch_id,
    );

  if (!payload) {
    return null;
  }

  /*
   * Cache the complete public
   * menu payload.
   */
  await redis.set(
    cacheKey,
    payload,
    {
      ex: MENU_CACHE_SECONDS,
    },
  );

  return payload;
}

export async function clearProjectMenuCache(
  projectId,
) {
  if (!projectId) {
    return;
  }

  await redis.del(
    `crtgo:menu:${projectId}`,
  );
}