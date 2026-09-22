import { and, asc, count, db, desc, eq, gte, ilike, inArray, isNotNull, isNull, lte, ne, or, orders, plans, sql, stores, users, type SQL } from "@pai/db";
import { dateParam, escapeLike, listParams, oneOf, str, type SearchParams } from "../params";

export const STORE_STATUSES = ["trial", "active", "past_due", "suspended", "closed"] as const;
export const STORE_SORTS = ["created", "name", "gmv", "orders", "status", "plan", "trial"] as const;

const agg = db
  .select({
    storeId: orders.storeId,
    gmv: sql<number>`coalesce(sum(${orders.total}), 0)`.mapWith(Number).as("gmv"),
    orderCount: sql<number>`count(*)`.mapWith(Number).as("order_count"),
    lastOrderAt: sql<Date | null>`max(${orders.createdAt})`.as("last_order_at"),
  })
  .from(orders)
  .where(ne(orders.status, "cancelled"))
  .groupBy(orders.storeId)
  .as("agg");

export function storeFilters(params: SearchParams): SQL | undefined {
  const conds: (SQL | undefined)[] = [];
  const q = str(params, "q");
  if (q) {
    const like = `%${escapeLike(q)}%`;
    conds.push(or(ilike(stores.name, like), ilike(stores.slug, like), ilike(stores.customDomain, like), ilike(users.email, like), ilike(users.name, like)));
  }
  const status = oneOf(params, "status", STORE_STATUSES);
  if (status) conds.push(eq(stores.status, status));
  const plan = str(params, "plan");
  if (plan === "none") conds.push(isNull(stores.planId));
  else if (plan) conds.push(eq(plans.code, plan));
  const category = str(params, "category");
  if (category) conds.push(eq(stores.category, category));
  const from = dateParam(params, "from");
  const to = dateParam(params, "to", true);
  if (from) conds.push(gte(stores.createdAt, from));
  if (to) conds.push(lte(stores.createdAt, to));
  const domain = str(params, "domain");
  if (domain === "yes") conds.push(isNotNull(stores.customDomain));
  if (domain === "no") conds.push(isNull(stores.customDomain));
  if (domain === "unverified") conds.push(and(isNotNull(stores.customDomain), eq(stores.domainVerified, false)));
  if (domain === "verified") conds.push(and(isNotNull(stores.customDomain), eq(stores.domainVerified, true)));
  const ids = str(params, "ids");
  if (ids) {
    const list = ids.split(",").filter((x) => /^[0-9a-f-]{36}$/i.test(x));
    conds.push(list.length ? inArray(stores.id, list) : sql`false`);
  }
  const c = conds.filter(Boolean) as SQL[];
  return c.length ? and(...c) : undefined;
}

export async function queryStores(params: SearchParams, opts: { all?: boolean } = {}) {
  const { page, size, offset, sort, dir } = listParams(params, STORE_SORTS, "created");
  const where = storeFilters(params);
  const d = dir === "asc" ? asc : desc;
  const orderBy = {
    created: [d(stores.createdAt)],
    name: [d(stores.name)],
    gmv: [dir === "asc" ? sql`coalesce(${agg.gmv}, 0) asc` : sql`coalesce(${agg.gmv}, 0) desc`, desc(stores.createdAt)],
    orders: [dir === "asc" ? sql`coalesce(${agg.orderCount}, 0) asc` : sql`coalesce(${agg.orderCount}, 0) desc`, desc(stores.createdAt)],
    status: [d(stores.status), desc(stores.createdAt)],
    plan: [dir === "asc" ? sql`${plans.sort} asc nulls first` : sql`${plans.sort} desc nulls last`, desc(stores.createdAt)],
    trial: [dir === "asc" ? sql`${stores.trialEndsAt} asc nulls last` : sql`${stores.trialEndsAt} desc nulls last`],
  }[sort];

  const base = db
    .select({
      id: stores.id,
      name: stores.name,
      slug: stores.slug,
      logoUrl: stores.logoUrl,
      customDomain: stores.customDomain,
      domainVerified: stores.domainVerified,
      category: stores.category,
      status: stores.status,
      createdAt: stores.createdAt,
      trialEndsAt: stores.trialEndsAt,
      planName: plans.name,
      planCode: plans.code,
      ownerId: users.id,
      ownerName: users.name,
      ownerEmail: users.email,
      gmv: sql<number>`coalesce(${agg.gmv}, 0)`.mapWith(Number),
      orderCount: sql<number>`coalesce(${agg.orderCount}, 0)`.mapWith(Number),
      lastOrderAt: agg.lastOrderAt,
    })
    .from(stores)
    .innerJoin(users, eq(users.id, stores.ownerId))
    .leftJoin(plans, eq(plans.id, stores.planId))
    .leftJoin(agg, eq(agg.storeId, stores.id))
    .where(where)
    .orderBy(...orderBy);

  const rows = opts.all ? await base.limit(50_000) : await base.limit(size).offset(offset);
  const [{ n }] = await db
    .select({ n: count() })
    .from(stores)
    .innerJoin(users, eq(users.id, stores.ownerId))
    .leftJoin(plans, eq(plans.id, stores.planId))
    .where(where);
  return { rows, total: n, page, size, sort, dir };
}

export async function storeFilterOptions() {
  const [planRows, catRows, statusRows] = await Promise.all([
    db.select({ code: plans.code, name: plans.name }).from(plans).orderBy(asc(plans.sort)),
    db.selectDistinct({ category: stores.category }).from(stores).orderBy(asc(stores.category)),
    db.select({ status: stores.status, n: count() }).from(stores).groupBy(stores.status),
  ]);
  return {
    plans: planRows,
    categories: catRows.map((c) => c.category),
    statusCounts: Object.fromEntries(statusRows.map((r) => [r.status, r.n])) as Record<string, number>,
  };
}
