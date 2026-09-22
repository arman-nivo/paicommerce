import { slugify } from "@pai/core";
import { and, avg, collections, count, db, eq, inArray, ne, productReviews, products, sql, type Store } from "@pai/db";
import { getStorePlan } from "@/lib/ctx";
import { ActionError } from "@/lib/errors";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Exec = typeof db | Tx;

/** Pick `base`, `base-2`, `base-3`… not present in `taken`. */
export function nextFreeSlug(base: string, taken: Set<string>): string {
  const b = (base || "item").slice(0, 72);
  if (!taken.has(b)) return b;
  for (let i = 2; i < 100_000; i++) {
    const s = `${b}-${i}`;
    if (!taken.has(s)) return s;
  }
  return `${b}-${Date.now()}`;
}

async function takenSlugs(exec: Exec, table: typeof products | typeof collections, storeId: string, base: string, excludeId?: string | null) {
  const rows = await exec
    .select({ slug: table.slug })
    .from(table)
    .where(and(eq(table.storeId, storeId), sql`(${table.slug} = ${base} or ${table.slug} like ${base.replace(/[\\%_]/g, "\\$&") + "-%"})`, excludeId ? ne(table.id, excludeId) : undefined));
  return new Set(rows.map((r) => r.slug));
}

export async function uniqueProductSlug(storeId: string, input: string, excludeId?: string | null, exec: Exec = db) {
  const base = slugify(input);
  return nextFreeSlug(base, await takenSlugs(exec, products, storeId, base, excludeId));
}

export async function uniqueCollectionSlug(storeId: string, input: string, excludeId?: string | null, exec: Exec = db) {
  const base = slugify(input);
  return nextFreeSlug(base, await takenSlugs(exec, collections, storeId, base, excludeId));
}

/** Product usage vs plan limit. `limit` null = unlimited. */
export async function productUsage(store: Pick<Store, "id" | "planId">) {
  const [plan, [row]] = await Promise.all([getStorePlan(store), db.select({ n: count() }).from(products).where(eq(products.storeId, store.id))]);
  const used = row?.n ?? 0;
  const limit = plan.limits.products;
  return { used, limit, remaining: limit == null ? Infinity : Math.max(0, limit - used), planName: plan.name };
}

/** Throws a friendly error when adding `adding` products would exceed the plan. */
export async function assertProductCapacity(store: Pick<Store, "id" | "planId">, adding = 1) {
  const u = await productUsage(store);
  if (u.limit != null && u.used + adding > u.limit)
    throw new ActionError(`Your ${u.planName} plan allows ${u.limit} products (you have ${u.used}). Upgrade your plan in Settings → Billing to add more.`);
  return u;
}

/** Recompute ratingAvg / ratingCount from approved reviews for the given products. */
export async function recomputeRatings(storeId: string, productIds: string[]) {
  const ids = [...new Set(productIds)];
  if (!ids.length) return;
  const stats = await db
    .select({ productId: productReviews.productId, n: count(), avg: avg(productReviews.rating) })
    .from(productReviews)
    .where(and(eq(productReviews.storeId, storeId), inArray(productReviews.productId, ids), eq(productReviews.approved, true)))
    .groupBy(productReviews.productId);
  const map = new Map(stats.map((s) => [s.productId, s]));
  await Promise.all(
    ids.map((id) => {
      const s = map.get(id);
      const ratingAvg = s ? Math.round(Number(s.avg ?? 0) * 100) / 100 : 0;
      return db
        .update(products)
        .set({ ratingAvg, ratingCount: s?.n ?? 0 })
        .where(and(eq(products.id, id), eq(products.storeId, storeId)));
    }),
  );
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function lowStockThreshold(store: Pick<Store, "settings">) {
  return store.settings?.notifications?.lowStockThreshold ?? 5;
}
