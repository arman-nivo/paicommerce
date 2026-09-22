/** Customer account data (orders & order detail), always scoped to store + customer. */
import { and, count, db, desc, eq, inArray, orderEvents, orderItems, orders, sql, type Order } from "@pai/db";
import type { AccountOrderDetail, AccountOrderSummary } from "@pai/theme-kit";

const PUBLIC_EVENT_TYPES = new Set(["created", "status", "payment", "courier"]);

function summary(o: Order, itemCount: number): AccountOrderSummary {
  return {
    id: o.id,
    number: o.number,
    createdAt: o.createdAt.toISOString(),
    total: o.total,
    currency: o.currency,
    itemCount,
    paymentStatus: o.paymentStatus,
    fulfillmentStatus: o.fulfillmentStatus,
    paymentMethod: o.paymentMethod,
  };
}

async function itemCounts(orderIds: string[]): Promise<Map<string, number>> {
  if (!orderIds.length) return new Map();
  const rows = await db
    .select({ orderId: orderItems.orderId, n: sql<number>`coalesce(sum(${orderItems.quantity}), 0)` })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .groupBy(orderItems.orderId);
  return new Map(rows.map((r) => [r.orderId, Number(r.n)]));
}

export async function customerOrders(storeId: string, customerId: string, limit = 50): Promise<AccountOrderSummary[]> {
  const rows = await db
    .select()
    .from(orders)
    .where(and(eq(orders.storeId, storeId), eq(orders.customerId, customerId)))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
  const counts = await itemCounts(rows.map((r) => r.id));
  return rows.map((o) => summary(o, counts.get(o.id) ?? 0));
}

export async function countCustomerOrders(storeId: string, customerId: string): Promise<number> {
  const [r] = await db.select({ n: count() }).from(orders).where(and(eq(orders.storeId, storeId), eq(orders.customerId, customerId)));
  return Number(r?.n ?? 0);
}

/** Customer-facing order detail. Caller is responsible for authorisation (see callers). */
export async function orderDetail(storeId: string, where: { id: string } | { number: number }): Promise<(AccountOrderDetail & { customerId: string | null; phone: string | null; email: string | null }) | null> {
  const cond = "id" in where ? eq(orders.id, where.id) : eq(orders.number, where.number);
  const [o] = await db.select().from(orders).where(and(eq(orders.storeId, storeId), cond)).limit(1);
  if (!o) return null;
  const [items, events] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, o.id)),
    db.select().from(orderEvents).where(eq(orderEvents.orderId, o.id)).orderBy(desc(orderEvents.createdAt)).limit(50),
  ]);
  const addr = o.shippingAddress ?? null;
  return {
    ...summary(o, items.reduce((s, i) => s + i.quantity, 0)),
    customerId: o.customerId,
    phone: o.phone,
    email: o.email,
    subtotal: o.subtotal,
    discountTotal: o.discountTotal,
    shippingTotal: o.shippingTotal,
    deliveryZone: o.deliveryZone,
    shippingAddress: addr ? { ...addr } : null,
    items: items.map((i) => ({ title: i.title, variantTitle: i.variantTitle, imageUrl: i.imageUrl, price: i.price, quantity: i.quantity, total: i.total })),
    // Staff notes and internal events stay private.
    events: events
      .filter((e) => PUBLIC_EVENT_TYPES.has(e.type))
      .map((e) => ({ type: e.type, message: e.message ?? "", createdAt: e.createdAt.toISOString() })),
    trackingUrl: o.courier?.trackingUrl ?? null,
  };
}

/** Keep only the last digits for display (e.g. "01XXXXXX678"). */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  return phone.length > 5 ? `${phone.slice(0, 3)}${"•".repeat(Math.max(0, phone.length - 6))}${phone.slice(-3)}` : phone;
}
