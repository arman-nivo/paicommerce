/** Small helpers for storefront route handlers. */
import { NextResponse } from "next/server";
import type { z } from "zod";
import { isUnavailable, resolveSite, type Site } from "./site";

export type SiteParams = { params: Promise<{ site: string }> };

export function json<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === "number" ? { status: init } : init);
}

export function error(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/** Resolve the tenant for a route handler; returns an error response when unknown/unavailable. */
export async function siteFromParams(params: Promise<{ site: string }>): Promise<Site | NextResponse> {
  const { site: key } = await params;
  const site = await resolveSite(key);
  if (!site) return error("Store not found", 404);
  if (isUnavailable(site.store)) return error("This store is currently unavailable", 403);
  return site;
}

/** Parse a JSON body with a zod schema. */
export async function parseBody<S extends z.ZodType>(req: Request, schema: S): Promise<{ ok: true; data: z.infer<S> } | { ok: false; response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, response: error("Invalid JSON body") };
  }
  const r = schema.safeParse(raw);
  if (!r.success) {
    const first = r.error.issues[0];
    return { ok: false, response: error(first ? `${first.path.join(".") || "body"}: ${first.message}` : "Invalid request", 422, { issues: r.error.issues }) };
  }
  return { ok: true, data: r.data };
}

export function clientIp(req: Request): string | null {
  const h = req.headers;
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}
