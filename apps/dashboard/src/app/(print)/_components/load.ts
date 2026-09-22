import { and, asc, db, eq, inArray, orderItems, orders, type OrderItem } from "@pai/db";

export async function loadOrdersForPrint(storeId: string, ids: string[]) {
  if (!ids.length) return [];
  const rows = await db.select().from(orders).where(and(eq(orders.storeId, storeId), inArray(orders.id, ids)));
  const items = await db.select().from(orderItems).where(inArray(orderItems.orderId, rows.map((r) => r.id))).orderBy(asc(orderItems.title));
  const byOrder = new Map<string, OrderItem[]>();
  for (const it of items) byOrder.set(it.orderId, [...(byOrder.get(it.orderId) ?? []), it]);
  const order = new Map(ids.map((id, i) => [id, i]));
  return rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)).map((o) => ({ order: o, items: byOrder.get(o.id) ?? [] }));
}
