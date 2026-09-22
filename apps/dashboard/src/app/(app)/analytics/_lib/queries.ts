import { db, sql, type SQL } from "@pai/db";
import { bucketKeys, type Bucket, type Range } from "./range";

/**
 * Analytics queries. Every query is scoped with `store_id = ${storeId}` (tenant isolation);
 * order_items are only reached through a join on orders of this store.
 * "Sales" = sum(orders.total) excluding cancelled orders.
 */

const VALID = sql.raw(`o.status <> 'cancelled' and o.fulfillment_status <> 'cancelled'`);
const n = (v: unknown) => Number(v ?? 0) || 0;

async function rows<T>(q: SQL): Promise<T[]> {
  const r = await db.execute(q);
  return Array.from(r as unknown as T[]);
}

/** date_trunc bucket in Dhaka time → 'YYYY-MM-DD'. Unit is a trusted literal (no bind param, so GROUP BY 1 works). */
function bucketExpr(col: string, bucket: Bucket, isDate = false) {
  const unit = bucket === "week" ? "week" : "day";
  const src = isDate ? `${col}::timestamp` : `(${col} at time zone 'Asia/Dhaka')`;
  return sql.raw(`to_char(date_trunc('${unit}', ${src}), 'YYYY-MM-DD')`);
}

export type Kpis = { sales: number; orders: number; aov: number; visitors: number; conversion: number; returningRate: number; customers: number; returning: number };

export type SeriesPoint = { key: string; sales: number; orders: number; visitors: number };

async function kpis(storeId: string, start: Date, end: Date, from: string, to: string): Promise<Kpis> {
  const [[o], [a], [c]] = await Promise.all([
    rows<{ sales: string; orders: string }>(sql`
      select coalesce(sum(o.total) filter (where ${VALID}), 0) as sales, count(*) filter (where ${VALID}) as orders
      from orders o where o.store_id = ${storeId} and o.created_at >= ${start.toISOString()}::timestamptz and o.created_at < ${end.toISOString()}::timestamptz`),
    rows<{ visitors: string }>(sql`
      select coalesce(sum(visitors), 0) as visitors from analytics_daily
      where store_id = ${storeId} and day >= ${from}::date and day <= ${to}::date`),
    rows<{ customers: string; returning: string }>(sql`
      with p as (
        select distinct coalesce(o.customer_id::text, nullif(o.phone, ''), o.id::text) as k
        from orders o where o.store_id = ${storeId} and o.created_at >= ${start.toISOString()}::timestamptz and o.created_at < ${end.toISOString()}::timestamptz and ${VALID}
      ), f as (
        select coalesce(o.customer_id::text, nullif(o.phone, ''), o.id::text) as k, min(o.created_at) as first_at
        from orders o where o.store_id = ${storeId} and o.created_at < ${end.toISOString()}::timestamptz and ${VALID}
        group by 1
      )
      select count(*) as customers, count(*) filter (where f.first_at < ${start.toISOString()}::timestamptz) as returning
      from p join f on f.k = p.k`),
  ]);
  const sales = n(o?.sales);
  const orders = n(o?.orders);
  const visitors = n(a?.visitors);
  const customers = n(c?.customers);
  const returning = n(c?.returning);
  return {
    sales,
    orders,
    aov: orders ? Math.round(sales / orders) : 0,
    visitors,
    conversion: visitors ? (orders / visitors) * 100 : 0,
    returningRate: customers ? (returning / customers) * 100 : 0,
    customers,
    returning,
  };
}

async function series(storeId: string, start: Date, end: Date, from: string, to: string, bucket: Bucket): Promise<SeriesPoint[]> {
  const [ord, vis] = await Promise.all([
    rows<{ k: string; sales: string; orders: string }>(sql`
      select ${bucketExpr("o.created_at", bucket)} as k, coalesce(sum(o.total) filter (where ${VALID}), 0) as sales, count(*) filter (where ${VALID}) as orders
      from orders o where o.store_id = ${storeId} and o.created_at >= ${start.toISOString()}::timestamptz and o.created_at < ${end.toISOString()}::timestamptz
      group by 1`),
    rows<{ k: string; visitors: string }>(sql`
      select ${bucketExpr("day", bucket, true)} as k, coalesce(sum(visitors), 0) as visitors
      from analytics_daily where store_id = ${storeId} and day >= ${from}::date and day <= ${to}::date
      group by 1`),
  ]);
  const om = new Map(ord.map((r) => [r.k, r]));
  const vm = new Map(vis.map((r) => [r.k, n(r.visitors)]));
  return bucketKeys(from, to, bucket).map((key) => ({ key, sales: n(om.get(key)?.sales), orders: n(om.get(key)?.orders), visitors: vm.get(key) ?? 0 }));
}

export type Funnel = { pageViews: number; productViews: number; addToCarts: number; checkouts: number; orders: number };

async function funnel(storeId: string, from: string, to: string): Promise<Funnel> {
  const [r] = await rows<Record<keyof Funnel, string>>(sql`
    select coalesce(sum(page_views), 0) as "pageViews", coalesce(sum(product_views), 0) as "productViews",
      coalesce(sum(add_to_carts), 0) as "addToCarts", coalesce(sum(checkouts), 0) as "checkouts", coalesce(sum(orders), 0) as "orders"
    from analytics_daily where store_id = ${storeId} and day >= ${from}::date and day <= ${to}::date`);
  return { pageViews: n(r?.pageViews), productViews: n(r?.productViews), addToCarts: n(r?.addToCarts), checkouts: n(r?.checkouts), orders: n(r?.orders) };
}

export type Breakdown = { key: string; orders: number; sales: number };

async function breakdown(storeId: string, start: Date, end: Date, column: "payment_method" | "source" | "delivery_zone", limit = 8): Promise<Breakdown[]> {
  const col = sql.raw(`coalesce(nullif(o.${column}, ''), 'unknown')`);
  const r = await rows<{ key: string; orders: string; sales: string }>(sql`
    select ${col} as key, count(*) as orders, coalesce(sum(o.total), 0) as sales
    from orders o where o.store_id = ${storeId} and o.created_at >= ${start.toISOString()}::timestamptz and o.created_at < ${end.toISOString()}::timestamptz and ${VALID}
    group by 1 order by 3 desc limit ${limit}`);
  return r.map((x) => ({ key: x.key, orders: n(x.orders), sales: n(x.sales) }));
}

async function fulfillment(storeId: string, start: Date, end: Date) {
  const r = await rows<{ key: string; orders: string; sales: string }>(sql`
    select case when o.status = 'cancelled' then 'cancelled' else o.fulfillment_status::text end as key, count(*) as orders, coalesce(sum(o.total), 0) as sales
    from orders o where o.store_id = ${storeId} and o.created_at >= ${start.toISOString()}::timestamptz and o.created_at < ${end.toISOString()}::timestamptz
    group by 1 order by 2 desc`);
  return r.map((x) => ({ key: x.key, orders: n(x.orders), sales: n(x.sales) }));
}

export type TopProduct = { productId: string | null; title: string; imageUrl: string | null; units: number; revenue: number; orders: number };

async function topProducts(storeId: string, start: Date, end: Date): Promise<TopProduct[]> {
  const r = await rows<{ product_id: string | null; title: string; image_url: string | null; units: string; revenue: string; orders: string }>(sql`
    select max(oi.product_id::text) as product_id, max(oi.title) as title, max(oi.image_url) as image_url,
      sum(oi.quantity) as units, sum(oi.total) as revenue, count(distinct o.id) as orders
    from order_items oi join orders o on o.id = oi.order_id
    where o.store_id = ${storeId} and o.created_at >= ${start.toISOString()}::timestamptz and o.created_at < ${end.toISOString()}::timestamptz and ${VALID}
    group by coalesce(oi.product_id::text, oi.title)
    order by 5 desc limit 10`);
  return r.map((x) => ({ productId: x.product_id, title: x.title, imageUrl: x.image_url, units: n(x.units), revenue: n(x.revenue), orders: n(x.orders) }));
}

export type TopCustomer = { customerId: string | null; name: string; phone: string | null; orders: number; spent: number };

async function topCustomers(storeId: string, start: Date, end: Date): Promise<TopCustomer[]> {
  const r = await rows<{ customer_id: string | null; name: string; phone: string | null; orders: string; spent: string }>(sql`
    select max(o.customer_id::text) as customer_id, max(o.name) as name, max(o.phone) as phone, count(*) as orders, sum(o.total) as spent
    from orders o where o.store_id = ${storeId} and o.created_at >= ${start.toISOString()}::timestamptz and o.created_at < ${end.toISOString()}::timestamptz and ${VALID}
    group by coalesce(o.customer_id::text, nullif(o.phone, ''), o.id::text)
    order by 5 desc limit 8`);
  return r.map((x) => ({ customerId: x.customer_id, name: x.name, phone: x.phone, orders: n(x.orders), spent: n(x.spent) }));
}

export async function storeHasOrders(storeId: string) {
  const [r] = await rows<{ any: boolean }>(sql`select exists(select 1 from orders where store_id = ${storeId}) as any`);
  return !!r?.any;
}

export async function getAnalytics(storeId: string, r: Range) {
  const [cur, prev, curSeries, prevSeries, fun, payments, sources, zones, statuses, products, customers] = await Promise.all([
    kpis(storeId, r.start, r.end, r.from, r.to),
    kpis(storeId, r.prevStart, r.prevEnd, r.prevFrom, r.prevTo),
    series(storeId, r.start, r.end, r.from, r.to, r.bucket),
    series(storeId, r.prevStart, r.prevEnd, r.prevFrom, r.prevTo, r.bucket),
    funnel(storeId, r.from, r.to),
    breakdown(storeId, r.start, r.end, "payment_method"),
    breakdown(storeId, r.start, r.end, "source"),
    breakdown(storeId, r.start, r.end, "delivery_zone", 10),
    fulfillment(storeId, r.start, r.end),
    topProducts(storeId, r.start, r.end),
    topCustomers(storeId, r.start, r.end),
  ]);
  return { cur, prev, curSeries, prevSeries, funnel: fun, payments, sources, zones, statuses, products, customers };
}
