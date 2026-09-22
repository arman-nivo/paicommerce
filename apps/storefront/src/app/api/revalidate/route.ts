/**
 * POST /api/revalidate — invalidate storefront caches from other apps (dashboard, admin, workers).
 * Body: `{ "tag": "store:<id>" }` or `{ "storeId": "<id>" }` (or `{ "tags": [...] }`).
 * Auth: header `x-revalidate-secret` must equal REVALIDATE_SECRET (optional in development only).
 */
import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { z } from "zod";

const bodySchema = z
  .object({
    tag: z.string().trim().min(1).max(256).optional(),
    tags: z.array(z.string().trim().min(1).max(256)).max(50).optional(),
    storeId: z.uuid().optional(),
  })
  .refine((b) => b.tag || b.tags?.length || b.storeId, "Provide tag, tags or storeId");

function err(status: number, code: string, message: string, details: Record<string, string> = {}) {
  return Response.json({ error: { code, message, details } }, { status });
}

function authorized(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return process.env.NODE_ENV === "development";
  const given = req.headers.get("x-revalidate-secret") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return err(401, "unauthorized", "Invalid or missing x-revalidate-secret");
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return err(400, "validation_error", "Request body must be valid JSON");
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return err(400, "validation_error", "Invalid request body", Object.fromEntries(parsed.error.issues.map((i) => [i.path.join(".") || "_", i.message])));
  }
  const { tag, tags = [], storeId } = parsed.data;
  const all = [...new Set([...(tag ? [tag] : []), ...tags, ...(storeId ? [`store:${storeId}`] : [])])];
  for (const t of all) revalidateTag(t, "max");
  return Response.json({ revalidated: true, tags: all, now: Date.now() });
}
