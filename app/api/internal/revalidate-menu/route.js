import { revalidateTag } from "next/cache";

function safeEqual(first, second) {
  if (!first || !second || first.length !== second.length) return false;
  let diff = 0;
  for (let i = 0; i < first.length; i += 1) diff |= first.charCodeAt(i) ^ second.charCodeAt(i);
  return diff === 0;
}

export async function POST(request) {
  const secret = String(process.env.CRTGO_REVALIDATION_SECRET || process.env.CRTRGO_REVALIDATION_SECRET || "").trim();
  if (!secret) return Response.json({ error: "Revalidation is not configured" }, { status: 503 });

  const auth = request.headers.get("authorization") || "";
  const provided = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (!safeEqual(provided, secret)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const slug = String(body?.slug || "").trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return Response.json({ error: "Invalid menu slug" }, { status: 400 });

  const tag = `crtgo-menu-${slug}`;
  const legacyTag = `crtrgo-menu-${slug}`;
  revalidateTag(tag, { expire: 0 });
  revalidateTag(legacyTag, { expire: 0 });
  return Response.json({ revalidated: true, slug, tag, revalidatedAt: new Date().toISOString() });
}
