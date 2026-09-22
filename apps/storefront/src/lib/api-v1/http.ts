/**
 * Shared plumbing for the public REST API (`/api/v1`): errors, auth, scopes, plan gate,
 * rate limiting, zod parsing, pagination and background side-effects.
 */
import { authenticateApiKey, hasScope, type ApiKeyRow, type ApiScope } from "@pai/core/api-keys";
import { dispatchWebhook, type WebhookTopic } from "@pai/core/webhooks";
import type { Plan, Store } from "@pai/db";
import { revalidateTag } from "next/cache";
import { after, type NextRequest } from "next/server";
import { z } from "zod";

/* ─────────────────────────── errors ─────────────────────────── */

export type ApiErrorCode =
  | "validation_error"
  | "unauthorized"
  | "insufficient_scope"
  | "plan_required"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "method_not_allowed"
  | "internal_error";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: ApiErrorCode,
    message: string,
    public details?: Record<string, string>,
  ) {
    super(message);
  }
}

export const notFound = (what = "Resource") => new ApiError(404, "not_found", `${what} not found`);
export const conflict = (message: string, details?: Record<string, string>) => new ApiError(409, "conflict", message, details);
export const invalid = (message: string, details?: Record<string, string>) => new ApiError(400, "validation_error", message, details);

function errorResponse(status: number, code: ApiErrorCode, message: string, details?: Record<string, string>, headers?: HeadersInit) {
  return Response.json({ error: { code, message, details: details ?? {} } }, { status, headers });
}

/* ─────────────────────────── responses ─────────────────────────── */

export const ok = <T>(data: T, status = 200) => Response.json({ data }, { status });

export function paginated<T>(data: T[], p: { page: number; limit: number; total: number }) {
  return Response.json({
    data,
    pagination: { page: p.page, limit: p.limit, total: p.total, pageCount: Math.max(1, Math.ceil(p.total / p.limit)) },
  });
}

/* ─────────────────────────── validation ─────────────────────────── */

export function zodDetails(err: z.ZodError): Record<string, string> {
  const details: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.map(String).join(".") || "_";
    if (!(key in details)) details[key] = issue.message;
  }
  return details;
}

export async function parseBody<S extends z.ZodType>(req: Request, schema: S): Promise<z.output<S>> {
  let raw: unknown;
  try {
    const text = await req.text();
    raw = text.trim() ? JSON.parse(text) : {};
  } catch {
    throw invalid("Request body must be valid JSON");
  }
  const res = schema.safeParse(raw);
  if (!res.success) throw invalid("Invalid request body", zodDetails(res.error));
  return res.data;
}

export function parseQuery<S extends z.ZodType>(req: NextRequest, schema: S): z.output<S> {
  const obj: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((v, k) => {
    if (v !== "") obj[k] = v;
  });
  const res = schema.safeParse(obj);
  if (!res.success) throw invalid("Invalid query parameters", zodDetails(res.error));
  return res.data;
}

export const paginationQuery = {
  page: z.coerce.number().int().min(1, "Must be at least 1").default(1),
  limit: z.coerce.number().int().min(1, "Must be at least 1").max(100, "Must be at most 100").default(20),
};

export const isoDate = z.iso.datetime({ offset: true, message: "Must be an ISO 8601 timestamp" }).transform((s) => new Date(s));

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s: string) => UUID_RE.test(s);

/* ─────────────────────────── rate limiting ─────────────────────────── */

export const RATE_LIMIT = 120;
const WINDOW_MS = 60_000;

declare global {
  // eslint-disable-next-line no-var
  var __paiApiRate: Map<string, number[]> | undefined;
}
const hits: Map<string, number[]> = (globalThis.__paiApiRate ??= new Map());
let lastSweep = Date.now();

/** In-memory sliding-window log (per process). Swap for Redis when running multiple instances. */
function rateLimit(id: string) {
  const now = Date.now();
  if (now - lastSweep > WINDOW_MS) {
    lastSweep = now;
    for (const [k, arr] of hits) if (!arr.length || arr[arr.length - 1]! <= now - WINDOW_MS) hits.delete(k);
  }
  const arr = (hits.get(id) ?? []).filter((t) => t > now - WINDOW_MS);
  const allowed = arr.length < RATE_LIMIT;
  if (allowed) arr.push(now);
  hits.set(id, arr);
  const oldest = arr[0] ?? now;
  const resetSec = Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));
  return {
    allowed,
    headers: {
      "X-RateLimit-Limit": String(RATE_LIMIT),
      "X-RateLimit-Remaining": String(Math.max(0, RATE_LIMIT - arr.length)),
      "X-RateLimit-Reset": String(resetSec),
    } as Record<string, string>,
  };
}

/* ─────────────────────────── handler wrapper ─────────────────────────── */

export type ApiContext<P extends Record<string, string> = Record<string, string>> = {
  req: NextRequest;
  params: P;
  store: Store;
  plan: Plan | null;
  key: ApiKeyRow;
};

type RouteCtx<P> = { params: Promise<P> };

/**
 * Wrap a route handler: bearer auth → plan gate → scope → rate limit → handler,
 * with consistent JSON errors and rate-limit headers on every authenticated response.
 */
export function apiRoute<P extends Record<string, string> = Record<string, string>>(
  scope: ApiScope,
  handler: (ctx: ApiContext<P>) => Promise<Response>,
) {
  return async (req: NextRequest, routeCtx: RouteCtx<P>): Promise<Response> => {
    let rl: Record<string, string> | undefined;
    try {
      const auth = req.headers.get("authorization") ?? "";
      const m = /^Bearer\s+(\S+)\s*$/i.exec(auth);
      if (!m) throw new ApiError(401, "unauthorized", "Missing or malformed Authorization header. Use: Authorization: Bearer <api key>");
      const found = await authenticateApiKey(m[1]);
      if (!found) throw new ApiError(401, "unauthorized", "Invalid or revoked API key");

      const limit = rateLimit(found.key.id);
      rl = limit.headers;
      if (!limit.allowed) throw new ApiError(429, "rate_limited", `Rate limit of ${RATE_LIMIT} requests per minute exceeded. Retry in ${rl["X-RateLimit-Reset"]}s.`);

      if (found.store.status === "suspended" || found.store.status === "closed") {
        throw new ApiError(403, "plan_required", `This store is ${found.store.status}; API access is disabled`);
      }
      if (!found.apiAccess) {
        throw new ApiError(403, "plan_required", "The store's plan does not include API access. Upgrade to Growth or above.");
      }
      if (!hasScope(found.key.scopes, scope)) {
        throw new ApiError(403, "insufficient_scope", `This API key is missing the required scope: ${scope}`, { scope });
      }

      const params = ((await routeCtx?.params) ?? {}) as P;
      const res = await handler({ req, params, store: found.store, plan: found.plan, key: found.key });
      for (const [k, v] of Object.entries(rl)) res.headers.set(k, v);
      return res;
    } catch (e) {
      const headers: Record<string, string> = { ...(rl ?? {}) };
      if (e instanceof ApiError) {
        if (e.status === 429 && rl) headers["Retry-After"] = rl["X-RateLimit-Reset"]!;
        if (e.status === 401) headers["WWW-Authenticate"] = 'Bearer realm="PaiCommerce API"';
        return errorResponse(e.status, e.code, e.message, e.details, headers);
      }
      const pgCode = (e as { code?: string })?.code ?? (e as { cause?: { code?: string } })?.cause?.code;
      if (pgCode === "23505") return errorResponse(409, "conflict", "A resource with these unique values already exists", undefined, headers);
      console.error(`[api/v1] ${req.method} ${req.nextUrl.pathname} failed`, e);
      return errorResponse(500, "internal_error", "Something went wrong on our side. Please retry later.", undefined, headers);
    }
  };
}

/* ─────────────────────────── side-effects ─────────────────────────── */

/** Fire a webhook after the response is sent. `load` builds the payload (errors are logged, never thrown). */
export function fireWebhook(storeId: string, topic: WebhookTopic, load: () => Promise<unknown>) {
  after(async () => {
    try {
      const data = await load();
      if (data) await dispatchWebhook(storeId, topic, data);
    } catch (e) {
      console.error(`[api/v1] webhook ${topic} failed`, e);
    }
  });
}

/** Invalidate the storefront's cached data for a store (tag convention: `store:{id}`). */
export function revalidateStore(storeId: string) {
  try {
    revalidateTag(`store:${storeId}`, "max");
  } catch (e) {
    console.error("[api/v1] revalidateTag failed", e);
  }
}
