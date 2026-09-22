/**
 * Synthetic but internally consistent commerce activity for a store:
 * customers, orders (+items, events), analytics_daily, incomplete carts and counters.
 */
import type { analyticsDaily, carts, CourierInfo, customers, discounts, orderEvents, orderItems, orders } from "../schema";
import type { SeedProduct } from "./catalog-rows";
import { address, DELIVERY_ZONES, emailFor, personName, phoneFactory, toAddress, zoneFor } from "./lib/bd";
import type { Rng } from "./lib/rng";
import { uuid } from "./lib/rng";
import { addMinutes, DAY, isoDay, NOW, tk } from "./lib/util";

type Order = typeof orders.$inferInsert & { id: string; createdAt: Date; total: number };
type Customer = typeof customers.$inferInsert & { id: string; createdAt: Date; ordersCount: number; totalSpent: number };
type Discount = typeof discounts.$inferInsert & { usedCount: number };

export type ActivityOptions = {
  storeId: string;
  rng: Rng;
  products: SeedProduct[];
  customerCount: number;
  orderCount: number;
  days: number;
  /** 0.8 = last day ~1.8× the first day. */
  growth: number;
  freeShippingOver: number | null;
  discounts: Discount[];
  actorUserId: string | null;
  qty?: [number, number][];
  cartCount: number;
  firstOrderNumber?: number;
  /** Analytics conversion rate (orders / visitors). */
  conversion?: number;
};

const FULFILLMENT_LABEL: Record<string, string> = {
  confirmed: "Order confirmed",
  processing: "Order is being packed",
  shipped: "Order shipped",
  delivered: "Order delivered",
  cancelled: "Order cancelled",
  returned: "Order returned to merchant",
};
const PAYMENT_LABEL: Record<string, string> = { cod: "Cash on delivery", bkash: "bKash", sslcommerz: "SSLCommerz (card)", bkash_manual: "bKash (Send Money)" };
const CANCEL_REASONS = ["Customer unreachable by phone", "Customer changed their mind", "Duplicate order", "Out of stock — customer notified", "Fake order suspected (low courier success ratio)"];
const RETURN_REASONS = ["Customer refused to receive parcel", "Size did not fit", "Customer not available at address"];
const NOTES = ["Please call before delivery.", "Deliver after 5pm please.", "Gift wrap if possible 🙏", "Office address, deliver before 6pm.", "Please send quickly, need it for Eid.", "Call my brother if I'm unavailable."];
const USER_AGENTS = [
  "Mozilla/5.0 (Linux; Android 14; SM-A546E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 13; Redmi Note 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  "Mozilla/5.0 [FBAN/FB4A;FBAV/470.0] (Linux; Android 12; vivo Y21) Mobile Safari/537.36",
];

function dayStartUtc(daysBack: number): Date {
  const d = new Date(NOW.getTime() - daysBack * DAY);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function generateActivity(o: ActivityOptions) {
  const { rng, storeId } = o;
  const newPhone = phoneFactory(rng);

  /* ── Customers ── */
  const custs: (Customer & { zoneId: string })[] = [];
  for (let i = 0; i < o.customerCount; i++) {
    const { name } = personName(rng);
    const ph = newPhone();
    const addr = address(rng, name, ph);
    custs.push({
      id: uuid(),
      storeId,
      name,
      phone: ph,
      email: rng.chance(0.55) ? emailFor(rng, name) : null,
      addresses: [toAddress(addr)],
      tags: [],
      acceptsMarketing: rng.chance(0.5),
      ordersCount: 0,
      totalSpent: 0,
      createdAt: NOW,
      updatedAt: NOW,
      zoneId: addr.zone,
    });
  }
  // Popularity: a few loyal repeat buyers, a long tail of one-timers.
  const custWeights = custs.map((_, i) => 1 / Math.pow(i + 1, 0.55));
  const prodWeights = o.products.map((p) => p.pop * rng.float(0.6, 1.4) * (p.row.featured ? 1.4 : 1));

  /* ── Daily distribution ── */
  const weights: number[] = [];
  for (let d = 0; d < o.days; d++) {
    const date = dayStartUtc(o.days - 1 - d);
    const dow = date.getUTCDay();
    const dowF = dow === 5 ? 1.35 : dow === 6 ? 1.2 : dow === 4 ? 1.1 : dow === 2 ? 0.9 : 1;
    weights.push((1 + (o.growth * d) / o.days) * dowF * rng.float(0.7, 1.3));
  }
  const wSum = weights.reduce((a, b) => a + b, 0);
  const perDay = weights.map((w) => Math.floor((o.orderCount * w) / wSum));
  let remaining = o.orderCount - perDay.reduce((a, b) => a + b, 0);
  while (remaining-- > 0) perDay[rng.weightedIndex(weights)]!++;

  const orderRows: Order[] = [];
  const itemRows: (typeof orderItems.$inferInsert)[] = [];
  const eventRows: (typeof orderEvents.$inferInsert)[] = [];
  const hourWeights: [number, number][] = [[9, 2], [10, 4], [11, 6], [12, 6], [13, 5], [14, 5], [15, 5], [16, 6], [17, 6], [18, 7], [19, 8], [20, 10], [21, 11], [22, 9], [23, 5], [0, 2]];

  let number = o.firstOrderNumber ?? 1001;
  const drafts: { at: Date; custIdx: number }[] = [];
  perDay.forEach((n, d) => {
    const base = dayStartUtc(o.days - 1 - d);
    for (let k = 0; k < n; k++) {
      const bdHour = rng.weighted(hourWeights);
      let at = new Date(base.getTime() + ((bdHour - 6 + 24) % 24) * 3600_000 + rng.int(0, 59) * 60000 + rng.int(0, 59) * 1000);
      if (at > NOW) at = new Date(NOW.getTime() - rng.int(5, 600) * 60000);
      drafts.push({ at, custIdx: rng.weightedIndex(custWeights) });
    }
  });
  drafts.sort((a, b) => a.at.getTime() - b.at.getTime());

  const discountUse = new Map<string, number>();

  for (const draft of drafts) {
    const cust = custs[draft.custIdx]!;
    const at = draft.at;
    const ageDays = (NOW.getTime() - at.getTime()) / DAY;
    const id = uuid();

    // Line items
    const nLines = rng.weighted([[1, 62], [2, 28], [3, 10]] as const);
    const chosen = new Set<number>();
    let subtotal = 0;
    const lines: (typeof orderItems.$inferInsert)[] = [];
    for (let l = 0; l < nLines; l++) {
      const pi = rng.weightedIndex(prodWeights);
      if (chosen.has(pi)) continue;
      chosen.add(pi);
      const sp = o.products[pi]!;
      const variant = sp.variants.length ? rng.pick(sp.variants) : null;
      const qty = rng.weighted(o.qty ?? [[1, 80], [2, 15], [3, 5]]);
      const price: number = variant ? variant.price : (sp.row.price ?? 0);
      subtotal += price * qty;
      sp.row.salesCount += qty;
      lines.push({ orderId: id, productId: sp.row.id, variantId: variant?.id ?? null, title: sp.row.title, variantTitle: variant?.title ?? null, sku: variant?.sku ?? sp.row.sku ?? null, imageUrl: sp.row.images?.[0]?.url ?? null, price, quantity: qty, total: price * qty });
    }
    itemRows.push(...lines);

    // Delivery & discount
    const zone = zoneFor(cust.zoneId as "inside-dhaka");
    let shipping: number = zone.charge;
    if (o.freeShippingOver !== null && subtotal >= tk(o.freeShippingOver)) shipping = 0;
    let discountTotal = 0;
    let discountCode: string | null = null;
    if (o.discounts.length && rng.chance(0.13)) {
      const d = rng.pick(o.discounts);
      const active = (!d.startsAt || d.startsAt <= at) && (!d.endsAt || d.endsAt >= at);
      if (active && (!d.minSubtotal || subtotal >= d.minSubtotal)) {
        discountCode = d.code;
        discountUse.set(d.code, (discountUse.get(d.code) ?? 0) + 1);
        if (d.type === "percentage") discountTotal = Math.round((subtotal * (d.value ?? 0)) / 100 / 100) * 100;
        else if (d.type === "fixed") discountTotal = Math.min(subtotal, d.value ?? 0);
        else shipping = 0;
      }
    }
    const total = Math.max(0, subtotal - discountTotal + shipping);

    // Status by age
    const fulfillment =
      ageDays < 1
        ? rng.weighted([["unfulfilled", 55], ["confirmed", 28], ["processing", 12], ["cancelled", 5]] as const)
        : ageDays < 3
          ? rng.weighted([["confirmed", 10], ["processing", 25], ["shipped", 55], ["cancelled", 10]] as const)
          : ageDays < 6
            ? rng.weighted([["shipped", 40], ["delivered", 48], ["cancelled", 6], ["returned", 6]] as const)
            : rng.weighted([["delivered", 84], ["cancelled", 9], ["returned", 7]] as const);
    const method = rng.weighted([["cod", 70], ["bkash", 12], ["sslcommerz", 10], ["bkash_manual", 8]] as const);
    const online = method === "bkash" || method === "sslcommerz";
    let paymentStatus: "pending" | "paid" | "refunded" | "failed";
    if (method === "cod") paymentStatus = fulfillment === "delivered" ? "paid" : "pending";
    else if (online) paymentStatus = fulfillment === "cancelled" || fulfillment === "returned" ? "refunded" : "paid";
    else paymentStatus = fulfillment === "unfulfilled" ? "pending" : fulfillment === "cancelled" ? "refunded" : "paid";
    if (method === "cod" && fulfillment === "cancelled") paymentStatus = "pending";
    const paymentRef = method === "bkash" ? `BK${rng.alnum(8)}` : method === "sslcommerz" ? `SSL${rng.digits(12)}` : method === "bkash_manual" ? rng.alnum(10) : null;
    const status = fulfillment === "delivered" ? "completed" : fulfillment === "cancelled" ? "cancelled" : fulfillment === "returned" ? "archived" : "open";
    const source = rng.weighted([["web", 64], ["facebook", 26], ["manual", 10]] as const);

    // Timeline
    const ev: { type: string; message: string; at: Date; user?: boolean }[] = [];
    ev.push({ type: "created", message: source === "manual" ? "Order created manually" : `Order placed via ${source}`, at, user: source === "manual" });
    if (online && paymentStatus !== "pending") ev.push({ type: "payment", message: `Payment of ৳${(total / 100).toLocaleString("en-IN")} received via ${PAYMENT_LABEL[method]} (${paymentRef})`, at: addMinutes(at, 2) });
    let t = addMinutes(at, rng.int(20, 240));
    const flow = ["confirmed", "processing", "shipped", "delivered"];
    const reach = fulfillment === "cancelled" ? rng.int(0, 1) : fulfillment === "returned" ? 3 : Math.max(0, flow.indexOf(fulfillment) + 1);
    let courier: CourierInfo | null = null;
    for (let s = 0; s < reach && s < 4; s++) {
      const step = flow[s]!;
      if (method === "bkash_manual" && step === "confirmed") ev.push({ type: "payment", message: `bKash TrxID ${paymentRef} verified`, at: t, user: true });
      if (step === "shipped") {
        const provider = rng.chance(0.6) ? "steadfast" : "pathao";
        const consignmentId = provider === "steadfast" ? rng.digits(9) : `DL${rng.digits(6)}${rng.alnum(4)}`;
        const trackingCode = provider === "steadfast" ? rng.alnum(8).toLowerCase() : consignmentId;
        const trackingUrl = provider === "steadfast" ? `https://steadfast.com.bd/t/${trackingCode}` : `https://merchant.pathao.com/tracking?consignment_id=${consignmentId}`;
        courier = { provider, consignmentId, trackingCode, trackingUrl, status: fulfillment === "delivered" ? "delivered" : fulfillment === "returned" ? "returned" : "in_transit", bookedAt: t.toISOString() };
        ev.push({ type: "courier", message: `Booked with ${provider === "steadfast" ? "Steadfast Courier" : "Pathao Courier"} — consignment ${consignmentId}`, at: t, user: true });
      }
      ev.push({ type: "status", message: FULFILLMENT_LABEL[step]!, at: t, user: step !== "delivered" });
      if (step === "delivered" && method === "cod") ev.push({ type: "payment", message: `Cash of ৳${(total / 100).toLocaleString("en-IN")} collected by courier`, at: addMinutes(t, 1) });
      t = addMinutes(t, step === "shipped" ? rng.int(18 * 60, zone.id === "outside-dhaka" ? 72 * 60 : 40 * 60) : rng.int(60, 16 * 60));
      if (t > NOW) t = new Date(NOW.getTime() - rng.int(1, 60) * 60000);
    }
    let cancelledAt: Date | null = null;
    if (fulfillment === "cancelled") {
      cancelledAt = t;
      ev.push({ type: "status", message: `Order cancelled — ${rng.pick(CANCEL_REASONS)}`, at: t, user: true });
      if (paymentStatus === "refunded") ev.push({ type: "payment", message: `Refund of ৳${(total / 100).toLocaleString("en-IN")} issued`, at: addMinutes(t, 30), user: true });
    }
    if (fulfillment === "returned") {
      ev.push({ type: "status", message: `Order returned — ${rng.pick(RETURN_REASONS)}`, at: t, user: true });
      if (paymentStatus === "refunded") ev.push({ type: "payment", message: `Refund of ৳${(total / 100).toLocaleString("en-IN")} issued`, at: addMinutes(t, 60), user: true });
    }
    for (const e of ev) eventRows.push({ orderId: id, type: e.type, message: e.message, userId: e.user ? o.actorUserId : null, createdAt: e.at > NOW ? NOW : e.at });
    const lastAt = ev.reduce((m, e) => (e.at > m ? e.at : m), at);

    const addr = cust.addresses?.[0];
    orderRows.push({
      id,
      storeId,
      number: number++,
      customerId: cust.id,
      name: cust.name,
      email: cust.email ?? null,
      phone: cust.phone ?? null,
      shippingAddress: addr,
      subtotal,
      discountTotal,
      shippingTotal: shipping,
      taxTotal: 0,
      total,
      currency: "BDT",
      discountCode,
      deliveryZone: zone.name,
      paymentMethod: method,
      paymentStatus,
      paymentRef,
      fulfillmentStatus: fulfillment,
      status,
      courier,
      note: rng.chance(0.12) ? rng.pick(NOTES) : null,
      staffNote: rng.chance(0.05) ? "Customer called to confirm the address." : null,
      tags: [],
      source,
      ip: source === "manual" ? null : `103.${rng.int(100, 230)}.${rng.int(0, 255)}.${rng.int(1, 254)}`,
      userAgent: source === "manual" ? null : rng.pick(USER_AGENTS),
      cancelledAt,
      createdAt: at,
      updatedAt: lastAt > NOW ? NOW : lastAt,
    });

    // Customer counters mirror @pai/core createOrder (every order counts).
    cust.ordersCount += 1;
    cust.totalSpent += total;
    if (cust.createdAt > at) cust.createdAt = addMinutes(at, -rng.int(1, 30));
  }

  // Customers without orders registered at a random time in the window.
  for (const c of custs) {
    if (c.ordersCount === 0) c.createdAt = new Date(NOW.getTime() - rng.int(1, o.days) * DAY + rng.int(0, 1000) * 60000);
    c.updatedAt = c.createdAt;
    const tags: string[] = [];
    if (c.totalSpent > tk(15000) || c.ordersCount >= 5) tags.push("vip");
    if (c.ordersCount >= 2) tags.push("repeat");
    if (c.zoneId === "outside-dhaka") tags.push("outside-dhaka");
    c.tags = tags;
  }
  for (const ord of orderRows) {
    const c = custs.find((x) => x.id === ord.customerId)!;
    if (c.ordersCount >= 3) ord.tags = ["repeat-customer"];
  }
  for (const d of o.discounts) d.usedCount = discountUse.get(d.code) ?? 0;

  /* ── Analytics (UTC days, same bucketing as trackDaily) ── */
  const byDay = new Map<string, { orders: number; revenue: number }>();
  for (const ord of orderRows) {
    const k = isoDay(ord.createdAt);
    const cur = byDay.get(k) ?? { orders: 0, revenue: 0 };
    cur.orders++;
    cur.revenue += ord.total;
    byDay.set(k, cur);
  }
  const conv = o.conversion ?? 0.022;
  const analytics: (typeof analyticsDaily.$inferInsert)[] = [];
  for (let d = o.days - 1; d >= 0; d--) {
    const day = isoDay(dayStartUtc(d));
    const agg = byDay.get(day) ?? { orders: 0, revenue: 0 };
    const baseline = Math.max(agg.orders, 0.5);
    const visitors = Math.round((baseline / conv) * rng.float(0.85, 1.15)) + rng.int(3, 20);
    const pageViews = Math.round(visitors * rng.float(2.6, 3.6));
    const productViews = Math.round(visitors * rng.float(1.1, 1.6));
    const checkouts = Math.max(agg.orders, Math.round(agg.orders * rng.float(1.5, 2.1) + rng.int(0, 2)));
    const addToCarts = Math.max(checkouts, Math.round(checkouts * rng.float(2.3, 3.2) + rng.int(0, 3)));
    analytics.push({ storeId, day, pageViews, visitors, productViews, addToCarts, checkouts, orders: agg.orders, revenue: agg.revenue });
  }

  /* ── Incomplete checkouts (abandoned carts) in the last 7 days ── */
  const cartRows: (typeof carts.$inferInsert)[] = [];
  for (let i = 0; i < o.cartCount; i++) {
    const existing = rng.chance(0.25) ? rng.pick(custs) : null;
    const nm = existing?.name ?? personName(rng).name;
    const ph = existing?.phone ?? newPhone();
    const addr = address(rng, nm, ph);
    const step = rng.weighted([["contact", 25], ["shipping", 45], ["payment", 30]] as const);
    const nLines = rng.int(1, 3);
    const lines = rng.sample(o.products, nLines).map((sp) => ({ productId: sp.row.id, variantId: sp.variants.length ? rng.pick(sp.variants).id : null, quantity: rng.weighted([[1, 80], [2, 20]] as const) }));
    const updatedAt = new Date(NOW.getTime() - rng.int(20, 7 * 24 * 60) * 60000);
    const createdAt = addMinutes(updatedAt, -rng.int(2, 40));
    cartRows.push({
      id: uuid(),
      storeId,
      token: rng.hex(32),
      customerId: existing?.id ?? null,
      lines,
      discountCode: rng.chance(0.1) && o.discounts[0] ? o.discounts[0].code : null,
      checkout: {
        name: nm,
        phone: ph,
        email: rng.chance(0.3) ? emailFor(rng, nm) : undefined,
        address: step === "contact" ? undefined : toAddress(addr),
        deliveryZoneId: step === "contact" ? undefined : addr.zone,
        step,
      },
      recoveryContactedAt: rng.chance(0.3) ? addMinutes(updatedAt, rng.int(60, 600)) : null,
      createdAt,
      updatedAt,
    });
  }
  // Fix any contacted timestamps that drifted into the future.
  for (const c of cartRows) if (c.recoveryContactedAt && c.recoveryContactedAt > NOW) c.recoveryContactedAt = null;

  const customerRows = custs.map(({ zoneId: _z, ...c }) => c);
  return { customers: customerRows, orders: orderRows, items: itemRows, events: eventRows, analytics, carts: cartRows, lastNumber: number - 1 };
}

export { DELIVERY_ZONES };
