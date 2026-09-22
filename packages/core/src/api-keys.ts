/**
 * Public REST API keys (`/api/v1`).
 *
 * Key format:  `pai_sk_<prefix>_<secret>`
 *   - `prefix`  6 lowercase hex chars, shown in the dashboard so merchants can recognise a key
 *   - `secret`  32 random bytes, base64url
 *
 * Only `sha256(fullKey)` (hex) is persisted in `api_keys.key_hash`; the full key is shown once.
 *
 * Dashboard usage:
 * ```ts
 * const { key, prefix, keyHash } = generateApiKey();
 * await db.insert(apiKeys).values({ storeId, name, prefix, keyHash, scopes });
 * // show `key` to the merchant exactly once
 * ```
 */
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { apiKeys, db, eq, plans, stores, type Plan, type Store } from "@pai/db";

export const API_KEY_PREFIX = "pai_sk_";

export const API_SCOPES = [
  "products:read",
  "products:write",
  "orders:read",
  "orders:write",
  "customers:read",
  "customers:write",
] as const;
export type ApiScope = (typeof API_SCOPES)[number];

/** Human-readable descriptions for the dashboard key-creation UI. */
export const API_SCOPE_LABELS: Record<ApiScope, string> = {
  "products:read": "List and read products, variants and collections",
  "products:write": "Create, update and archive products; adjust inventory",
  "orders:read": "List and read orders, line items and timelines",
  "orders:write": "Create orders, update status, add notes, book couriers",
  "customers:read": "List and read customers",
  "customers:write": "Create and update customers",
};

export function isApiScope(s: string): s is ApiScope {
  return (API_SCOPES as readonly string[]).includes(s);
}

/** A `*:write` scope implies the matching `*:read` scope. */
export function hasScope(granted: readonly string[], required: ApiScope): boolean {
  if (granted.includes(required)) return true;
  if (required.endsWith(":read")) return granted.includes(required.replace(/:read$/, ":write"));
  return false;
}

export type GeneratedApiKey = {
  /** Full secret key — return to the merchant once, never store it. */
  key: string;
  /** Display prefix persisted in `api_keys.prefix`, e.g. `pai_sk_4f9c2a`. */
  prefix: string;
  /** sha256 hex of `key`, persisted in `api_keys.key_hash`. */
  keyHash: string;
};

/** Generate a new API key. Persist `prefix` + `keyHash`; show `key` once. */
export function generateApiKey(): GeneratedApiKey {
  const short = randomBytes(3).toString("hex"); // 6 chars
  const secret = randomBytes(32).toString("base64url");
  const key = `${API_KEY_PREFIX}${short}_${secret}`;
  return { key, prefix: `${API_KEY_PREFIX}${short}`, keyHash: hashApiKey(key) };
}

/** sha256 hex of the full key. */
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key.trim(), "utf8").digest("hex");
}

const KEY_RE = /^pai_sk_[0-9a-f]{6}_[A-Za-z0-9_-]{20,}$/;

/** Cheap syntactic check before touching the DB. */
export function looksLikeApiKey(key: string): boolean {
  return KEY_RE.test(key);
}

export type ApiKeyRow = typeof apiKeys.$inferSelect;
export type AuthenticatedApiKey = {
  key: ApiKeyRow;
  store: Store;
  plan: Plan | null;
  /** `plans.limits.apiAccess` — callers should reject with `plan_required` when false. */
  apiAccess: boolean;
};

const LAST_USED_THROTTLE_MS = 60_000;

/**
 * Resolve a raw bearer key to its key row + store (+ plan).
 * Returns null for malformed, unknown or revoked keys. Updates `last_used_at` at most once a minute.
 */
export async function authenticateApiKey(rawKey: string | null | undefined): Promise<AuthenticatedApiKey | null> {
  const raw = (rawKey ?? "").trim();
  if (!looksLikeApiKey(raw)) return null;
  const hash = hashApiKey(raw);

  const [row] = await db
    .select({ key: apiKeys, store: stores, plan: plans })
    .from(apiKeys)
    .innerJoin(stores, eq(stores.id, apiKeys.storeId))
    .leftJoin(plans, eq(plans.id, stores.planId))
    .where(eq(apiKeys.keyHash, hash))
    .limit(1);
  if (!row) return null;
  // Defence in depth (the lookup is already by unique hash).
  const a = Buffer.from(row.key.keyHash, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (row.key.revokedAt) return null;

  const now = Date.now();
  if (!row.key.lastUsedAt || now - row.key.lastUsedAt.getTime() > LAST_USED_THROTTLE_MS) {
    const at = new Date(now);
    row.key.lastUsedAt = at;
    db.update(apiKeys)
      .set({ lastUsedAt: at })
      .where(eq(apiKeys.id, row.key.id))
      .catch((e) => console.error("[api-keys] failed to update last_used_at", e));
  }

  return { key: row.key, store: row.store, plan: row.plan, apiAccess: Boolean(row.plan?.limits?.apiAccess) };
}
