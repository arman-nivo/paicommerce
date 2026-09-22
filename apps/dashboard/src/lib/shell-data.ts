import { and, announcements, carts, count, db, desc, eq, gte, inArray, isNotNull, isNull, lte, orders, productReviews, products, sql } from "@pai/db";
import type { Store } from "@pai/db";

export type NavCounts = { unfulfilled: number; incomplete: number; pendingReviews: number };

export async function getNavCounts(storeId: string): Promise<NavCounts> {
  const [[u], [i], [r]] = await Promise.all([
    db.select({ n: count() }).from(orders).where(and(eq(orders.storeId, storeId), eq(orders.fulfillmentStatus, "unfulfilled"))),
    db
      .select({ n: count() })
      .from(carts)
      .where(and(eq(carts.storeId, storeId), isNull(carts.recoveredOrderId), isNotNull(carts.checkout), sql`coalesce(${carts.checkout}->>'phone','') <> ''`)),
    db.select({ n: count() }).from(productReviews).where(and(eq(productReviews.storeId, storeId), eq(productReviews.approved, false))),
  ]);
  return { unfulfilled: u?.n ?? 0, incomplete: i?.n ?? 0, pendingReviews: r?.n ?? 0 };
}

export type Notification = { id: string; kind: "order" | "stock" | "announcement"; title: string; body?: string; href?: string; at: string; level?: string };

export async function getNotifications(store: Pick<Store, "id" | "settings" | "currency">): Promise<Notification[]> {
  const threshold = store.settings?.notifications?.lowStockThreshold ?? 5;
  const since = new Date(Date.now() - 3 * 86400_000);
  const [newOrders, lowStock, anns] = await Promise.all([
    db
      .select({ id: orders.id, number: orders.number, name: orders.name, total: orders.total, createdAt: orders.createdAt })
      .from(orders)
      .where(and(eq(orders.storeId, store.id), eq(orders.fulfillmentStatus, "unfulfilled"), gte(orders.createdAt, since)))
      .orderBy(desc(orders.createdAt))
      .limit(6),
    db
      .select({ id: products.id, title: products.title, inventory: products.inventory, updatedAt: products.updatedAt })
      .from(products)
      .where(and(eq(products.storeId, store.id), eq(products.status, "active"), eq(products.trackInventory, true), lte(products.inventory, threshold)))
      .orderBy(products.inventory)
      .limit(5),
    db
      .select()
      .from(announcements)
      .where(and(eq(announcements.active, true), inArray(announcements.audience, ["merchants", "all"])))
      .orderBy(desc(announcements.createdAt))
      .limit(4),
  ]);
  const { formatMoney } = await import("@pai/core");
  return [
    ...anns.map((a) => ({ id: `a-${a.id}`, kind: "announcement" as const, title: a.title, body: a.body, at: a.createdAt.toISOString(), level: a.level })),
    ...newOrders.map((o) => ({
      id: `o-${o.id}`,
      kind: "order" as const,
      title: `New order #${o.number}`,
      body: `${o.name} · ${formatMoney(o.total, store.currency)}`,
      href: `/orders/${o.id}`,
      at: o.createdAt.toISOString(),
    })),
    ...lowStock.map((p) => ({
      id: `s-${p.id}-${p.inventory}`,
      kind: "stock" as const,
      title: p.inventory <= 0 ? `Out of stock: ${p.title}` : `Low stock: ${p.title}`,
      body: `${p.inventory} left`,
      href: `/products/${p.id}`,
      at: p.updatedAt.toISOString(),
      level: p.inventory <= 0 ? "critical" : "warning",
    })),
  ].sort((a, b) => b.at.localeCompare(a.at));
}
