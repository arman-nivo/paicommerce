import {
  and,
  auditLogs,
  count,
  db,
  desc,
  eq,
  gte,
  inArray,
  lt,
  ne,
  orders,
  plans,
  sql,
  stores,
  subscriptions,
  supportTickets,
  themePurchases,
  users,
} from "@pai/db";
import { dayKey } from "./format";

const num = (v: unknown) => Number(v ?? 0) || 0;
const DAY = 86400_000;

/** Monthly recurring revenue in minor units: active subscriptions × plan price (yearly / 12). */
export const mrrExpr = sql<number>`coalesce(sum(case when ${subscriptions.interval} = 'yearly' then ${plans.priceYearly} / 12.0 else ${plans.priceMonthly} end), 0)`.mapWith(Number);

export async function getMrr() {
  const [row] = await db.select({ mrr: mrrExpr, n: count() }).from(subscriptions).innerJoin(plans, eq(plans.id, subscriptions.planId)).where(eq(subscriptions.status, "active"));
  return { mrr: Math.round(row?.mrr ?? 0), activeSubs: row?.n ?? 0 };
}

function lastDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(dayKey(new Date(Date.now() - i * DAY)));
  return out;
}

const dhakaDay = (col: unknown) => sql<string>`to_char(${col} at time zone 'Asia/Dhaka', 'YYYY-MM-DD')`;

export async function getOverview() {
  const now = Date.now();
  const d30 = new Date(now - 30 * DAY);
  const d60 = new Date(now - 60 * DAY);
  const liveOrder = ne(orders.status, "cancelled");
  const gmvSum = sql<number>`coalesce(sum(${orders.total}), 0)`.mapWith(Number);

  const [
    mrr,
    statusRows,
    [newStores],
    [prevStores],
    [gmv30],
    [gmvPrev],
    [gmvAll],
    [eligible],
    [converted],
    [cancelled30],
    gmvDaily,
    storeDaily,
    userDaily,
    topStores,
    planDist,
    [themeRev],
    [themeRev30],
    [tickets],
    recent,
  ] = await Promise.all([
    getMrr(),
    db.select({ status: stores.status, n: count() }).from(stores).groupBy(stores.status),
    db.select({ n: count() }).from(stores).where(gte(stores.createdAt, d30)),
    db.select({ n: count() }).from(stores).where(and(gte(stores.createdAt, d60), lt(stores.createdAt, d30))),
    db.select({ gmv: gmvSum, n: count() }).from(orders).where(and(liveOrder, gte(orders.createdAt, d30))),
    db.select({ gmv: gmvSum, n: count() }).from(orders).where(and(liveOrder, gte(orders.createdAt, d60), lt(orders.createdAt, d30))),
    db.select({ gmv: gmvSum, n: count() }).from(orders).where(liveOrder),
    db.select({ n: count() }).from(stores).where(ne(stores.status, "trial")),
    db
      .select({ n: sql<number>`count(distinct ${subscriptions.storeId})`.mapWith(Number) })
      .from(subscriptions)
      .innerJoin(plans, eq(plans.id, subscriptions.planId))
      .where(and(inArray(subscriptions.status, ["active", "past_due"]), sql`${plans.priceMonthly} > 0`)),
    db.select({ n: count() }).from(subscriptions).where(and(eq(subscriptions.status, "cancelled"), gte(subscriptions.updatedAt, d30))),
    db
      .select({ day: dhakaDay(orders.createdAt), gmv: gmvSum, n: count() })
      .from(orders)
      .where(and(liveOrder, gte(orders.createdAt, d30)))
      .groupBy(dhakaDay(orders.createdAt)),
    db.select({ day: dhakaDay(stores.createdAt), n: count() }).from(stores).where(gte(stores.createdAt, d30)).groupBy(dhakaDay(stores.createdAt)),
    db.select({ day: dhakaDay(users.createdAt), n: count() }).from(users).where(gte(users.createdAt, d30)).groupBy(dhakaDay(users.createdAt)),
    db
      .select({ id: stores.id, name: stores.name, slug: stores.slug, status: stores.status, gmv: gmvSum, n: count() })
      .from(orders)
      .innerJoin(stores, eq(stores.id, orders.storeId))
      .where(and(liveOrder, gte(orders.createdAt, d30)))
      .groupBy(stores.id)
      .orderBy(desc(gmvSum))
      .limit(8),
    db
      .select({ name: sql<string>`coalesce(${plans.name}, 'No plan')`, n: count() })
      .from(stores)
      .leftJoin(plans, eq(plans.id, stores.planId))
      .where(ne(stores.status, "closed"))
      .groupBy(plans.name, plans.sort)
      .orderBy(sql`${plans.sort} nulls last`),
    db
      .select({ amount: sql<number>`coalesce(sum(${themePurchases.amount}),0)`.mapWith(Number), platform: sql<number>`coalesce(sum(${themePurchases.platformShare}),0)`.mapWith(Number), n: count() })
      .from(themePurchases),
    db
      .select({ amount: sql<number>`coalesce(sum(${themePurchases.amount}),0)`.mapWith(Number), n: count() })
      .from(themePurchases)
      .where(gte(themePurchases.createdAt, d30)),
    db
      .select({
        open: sql<number>`count(*) filter (where ${supportTickets.status} = 'open')`.mapWith(Number),
        pending: sql<number>`count(*) filter (where ${supportTickets.status} = 'pending')`.mapWith(Number),
        urgent: sql<number>`count(*) filter (where ${supportTickets.status} in ('open','pending') and ${supportTickets.priority} in ('urgent','high'))`.mapWith(Number),
      })
      .from(supportTickets),
    db
      .select({ id: auditLogs.id, action: auditLogs.action, target: auditLogs.target, createdAt: auditLogs.createdAt, actorName: users.name, storeId: auditLogs.storeId, storeName: stores.name })
      .from(auditLogs)
      .leftJoin(users, eq(users.id, auditLogs.actorId))
      .leftJoin(stores, eq(stores.id, auditLogs.storeId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(12),
  ]);

  const statusCounts = Object.fromEntries(statusRows.map((r) => [r.status, r.n])) as Record<string, number>;
  const days = lastDays(30);
  const gmvMap = new Map(gmvDaily.map((r) => [r.day, r]));
  const sMap = new Map(storeDaily.map((r) => [r.day, r.n]));
  const uMap = new Map(userDaily.map((r) => [r.day, r.n]));
  const short = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  const activeAtStart = mrr.activeSubs + num(cancelled30?.n);
  return {
    mrr: mrr.mrr,
    arr: mrr.mrr * 12,
    activeSubs: mrr.activeSubs,
    statusCounts,
    totalStores: statusRows.reduce((a, r) => a + r.n, 0),
    newStores: num(newStores?.n),
    prevNewStores: num(prevStores?.n),
    gmv30: num(gmv30?.gmv),
    orders30: num(gmv30?.n),
    gmvPrev: num(gmvPrev?.gmv),
    ordersPrev: num(gmvPrev?.n),
    gmvAll: num(gmvAll?.gmv),
    ordersAll: num(gmvAll?.n),
    conversion: num(eligible?.n) ? (num(converted?.n) / num(eligible?.n)) * 100 : 0,
    convertedStores: num(converted?.n),
    churn: activeAtStart ? (num(cancelled30?.n) / activeAtStart) * 100 : 0,
    cancelled30: num(cancelled30?.n),
    gmvSeries: days.map((d) => ({ day: short(d), gmv: num(gmvMap.get(d)?.gmv), orders: num(gmvMap.get(d)?.n) })),
    signupSeries: days.map((d) => ({ day: short(d), stores: num(sMap.get(d)), users: num(uMap.get(d)) })),
    topStores,
    planDist: planDist.map((p) => ({ name: p.name, value: p.n })),
    themeRevenue: { total: num(themeRev?.amount), platform: num(themeRev?.platform), purchases: num(themeRev?.n), last30: num(themeRev30?.amount) },
    tickets: { open: num(tickets?.open), pending: num(tickets?.pending), urgent: num(tickets?.urgent) },
    recent,
  };
}
