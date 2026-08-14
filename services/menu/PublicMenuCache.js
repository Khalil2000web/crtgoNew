"use server";

import { revalidatePath } from "next/cache";

import { getRedis } from "@/lib/redis";
import {
  getCacheKey,
  normalizeHost,
} from "@/services/menu/publicMenuData";

async function clearHost(host) {
  const normalizedHost = normalizeHost(host);

  if (!normalizedHost) {
    return;
  }

  const redis = getRedis();

  if (redis) {
    try {
      await redis.del(
        getCacheKey(normalizedHost)
      );
    } catch (error) {
      console.error(
        "[crtrgo Redis] Cache invalidation failed:",
        error
      );
    }
  }

  revalidatePath(
    `/tenant/${normalizedHost}`
  );
}

export async function invalidatePublicMenuCache(
  host,
  previousHost = null
) {
  const hosts = new Set([
    normalizeHost(host),
    normalizeHost(previousHost),
  ]);

  for (const value of hosts) {
    if (!value) {
      continue;
    }

    await clearHost(value);
  }
}