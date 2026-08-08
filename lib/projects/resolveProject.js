import "server-only";

import { redis } from "@/lib/redis/client";
import { supabaseAdmin } from "@/lib/supabase/admin";

const PROJECT_CACHE_SECONDS = 60 * 60;

export async function resolveProject(hostname) {
  const cleanHostname = normalizeHostname(hostname);

  if (!cleanHostname) {
    return null;
  }

  const cacheKey = `crtgo:host:${cleanHostname}`;

  const cachedProject = await redis.get(cacheKey);

  if (cachedProject) {
    return cachedProject;
  }

  const { data: domain, error } = await supabaseAdmin
    .from("project_domains")
    .select(`
      hostname,
      project:projects (
        id,
        slug,
        service_type,
        status,
        business_id,
        branch_id
      )
    `)
    .eq("hostname", cleanHostname)
    .maybeSingle();

  if (error) {
    console.error("CRTGO project lookup failed:", error);
    return null;
  }

  const project = domain?.project;

  if (!project || project.status !== "active") {
    return null;
  }

  await redis.set(cacheKey, project, {
    ex: PROJECT_CACHE_SECONDS,
  });

  return project;
}

function normalizeHostname(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .split(":")[0];
}