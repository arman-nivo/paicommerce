import { and, analyticsDaily, count, db, desc, eq, gte, isNotNull, lt, lte, ne, orderItems, orders, products, sql, storeIntegrations, storeThemes, sum, type Store } from "@pai/db";

export type Period = 7 | 30 | 90;

export async function getHomeData(store: Store, period: Period) {
  const sid = store.id;
  const now = new Date();
  const start = new Date(now.getTime() - period * 86400_000);
  const prevStart = new Date(now.getTime() - 2 * period * 86400_000);
  const valid = and(eq(orders.storeId, sid), ne(orders.fulfillmentStatus, "cancelled"));
  const dayStr = (d: Date) => d.toISOString().slice(0, 10);

  const agg = (from: Date, to: Date) =>
    db
      .select({ sales: sum(orders.total).mapWith(Number), n: count() })
      .from(orders)
      .where(and(valid, gte(orders.createdAt, from), lt(orders.createdAt, to)));
  const visits = (from: Date, to: Date) =>
    db
      .select({ visitors: sum(analyticsDaily.visitors).mapWith(Number), orders: sum(analyticsDaily.orders).mapWith(Number) })
      .from(analyticsDaily)
      .where(and(eq(analyticsDaily.storeId, sid), gte(analyticsDaily.day, dayStr(from)), lt(analyticsDaily.day, dayStr(to))));

  const threshold = store.settings?.notifications?.lowStockThreshold ?? 5;
  const dayExpr = sql<string>`to_char(date_trunc('day', ${orders.createdAt} at time zone 'Asia/Dhaka'), 'YYYY-MM-DD')`;

  const [[cur], [prev], [vCur], [vPrev], series, recent, top, lowStock, [productCount], [orderCount], themeRow, integrations, [unfulfilled]] = await Promise.all([
    agg(start, now),
    agg(prevStart, start),
    visits(start, new Date(now.getTime() + 86400_000)),
    visits(prevStart, start),
    db
      .select({ day: dayExpr, sales: sum(orders.total).mapWith(Number), n: count() })
      .from(orders)
      .where(and(valid, gte(orders.createdAt, prevStart)))
      .groupBy(dayExpr),
    db.select().from(orders).where(eq(orders.storeId, sid)).orderBy(desc(orders.createdAt)).limit(6),
    db
      .select({ productId: orderItems.productId, title: orderItems.title, image: sql<string | null>`max(${orderItems.imageUrl})`, qty: sum(orderItems.quantity).mapWith(Number), revenue: sum(orderItems.total).mapWith(Number) })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(and(valid, gte(orders.createdAt, start)))
      .groupBy(orderItems.productId, orderItems.title)
      .orderBy(desc(sum(orderItems.quantity)))
      .limit(5),
    db
      .select({ id: products.id, title: products.title, inventory: products.inventory, images: products.images })
      .from(products)
      .where(and(eq(products.storeId, sid), eq(products.status, "active"), eq(products.trackInventory, true), lte(products.inventory, threshold)))
      .orderBy(products.inventory)
      .limit(5),
    db.select({ n: count() }).from(products).where(eq(products.storeId, sid)),
    db.select({ n: count() }).from(orders).where(eq(orders.storeId, sid)),
    db.query.storeThemes.findFirst({ where: and(eq(storeThemes.storeId, sid), eq(storeThemes.role, "live")) }),
    db.select({ provider: storeIntegrations.provider, type: storeIntegrations.type }).from(storeIntegrations).where(and(eq(storeIntegrations.storeId, sid), eq(storeIntegrations.enabled, true))),
    db.select({ n: count() }).from(orders).where(and(eq(orders.storeId, sid), eq(orders.fulfillmentStatus, "unfulfilled"))),
  ]);

  // Daily chart: current period vs previous period aligned by index.
  const map = new Map(series.map((r) => [r.day, r]));
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Dhaka" });
  const keyOf = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(d);
  const chart = Array.from({ length: period }, (_, i) => {
    const d = new Date(now.getTime() - (period - 1 - i) * 86400_000);
    const p = new Date(d.getTime() - period * 86400_000);
    return { label: fmt.format(d), sales: (map.get(keyOf(d))?.sales ?? 0) / 100, previous: (map.get(keyOf(p))?.sales ?? 0) / 100, orders: map.get(keyOf(d))?.n ?? 0 };
  });

  const payments = integrations.filter((i) => i.type === "payment");
  const checklist = {
    product: (productCount?.n ?? 0) > 0,
    theme: !!themeRow && (!!themeRow.config || !!themeRow.draftConfig),
    payments: payments.some((p) => p.provider !== "cod"),
    delivery: integrations.some((i) => i.type === "courier"),
    domain: !!store.customDomain,
    order: (orderCount?.n ?? 0) > 0,
  };

  return {
    kpi: {
      sales: cur?.sales ?? 0,
      salesPrev: prev?.sales ?? 0,
      orders: cur?.n ?? 0,
      ordersPrev: prev?.n ?? 0,
      aov: cur?.n ? Math.round((cur.sales ?? 0) / cur.n) : 0,
      aovPrev: prev?.n ? Math.round((prev.sales ?? 0) / prev.n) : 0,
      visitors: vCur?.visitors ?? 0,
      conversion: vCur?.visitors ? ((vCur.orders ?? 0) / vCur.visitors) * 100 : 0,
      conversionPrev: vPrev?.visitors ? ((vPrev.orders ?? 0) / vPrev.visitors) * 100 : 0,
    },
    chart,
    recent,
    top,
    lowStock,
    threshold,
    checklist,
    themeId: themeRow?.id ?? null,
    unfulfilled: unfulfilled?.n ?? 0,
    hasCod: payments.some((p) => p.provider === "cod"),
  };
}

export async function getIncompleteSummary(storeId: string) {
  const { carts, isNull } = await import("@pai/db");
  const [r] = await db
    .select({ n: count() })
    .from(carts)
    .where(and(eq(carts.storeId, storeId), isNull(carts.recoveredOrderId), isNotNull(carts.checkout), sql`coalesce(${carts.checkout}->>'phone','') <> ''`, gte(carts.updatedAt, new Date(Date.now() - 30 * 86400_000))));
  return r?.n ?? 0;
}

