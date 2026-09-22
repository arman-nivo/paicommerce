/**
 * Server-only order operations shared by single & bulk server actions.
 * Callers MUST pass orders already loaded with `eq(orders.storeId, ctx.store.id)`.
 */
import { after } from "next/server";
import { COURIERS, type CourierParcel } from "@pai/core/couriers";
import { dispatchWebhook, serializeOrderForApi } from "@pai/core/webhooks";
import { FULFILLMENT_FLOW, restockOrder } from "@pai/core/orders";
import { and, db, eq, inArray, orderEvents, orderItems, orders, sql, storeIntegrations, type CourierInfo, type Order } from "@pai/db";
import { addressLines } from "./filters";

type Fs = Order["fulfillmentStatus"];

export const STATUS_LABELS: Record<string, string> = {
  unfulfilled: "New",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
};
export const label = (s: string) => STATUS_LABELS[s] ?? s;

/** Fire the `order.updated` webhook after the response is sent (never blocks the action). */
export function notifyOrderUpdated(storeId: string, orderId: string) {
  after(async () => {
    const data = await serializeOrderForApi(orderId, { storeId });
    if (data) await dispatchWebhook(storeId, "order.updated", data);
  });
}

export function canTransition(from: Fs, to: Fs) {
  return FULFILLMENT_FLOW[from]?.includes(to) ?? false;
}

/**
 * Apply a fulfillment transition (validated against FULFILLMENT_FLOW), with side-effects:
 * cancel → status cancelled + cancelledAt + restock; returned → restock; delivered → status completed.
 * Returns false when the transition is not allowed.
 */
export async function applyTransition(order: Pick<Order, "id" | "storeId" | "fulfillmentStatus">, to: Fs, userId: string, extra?: string): Promise<boolean> {
  if (!canTransition(order.fulfillmentStatus, to)) return false;
  const set: Partial<Order> = { fulfillmentStatus: to };
  if (to === "cancelled") {
    set.status = "cancelled";
    set.cancelledAt = new Date();
  } else if (to === "delivered") set.status = "completed";
  const res = await db
    .update(orders)
    .set(set)
    .where(and(eq(orders.id, order.id), eq(orders.storeId, order.storeId), eq(orders.fulfillmentStatus, order.fulfillmentStatus)))
    .returning({ id: orders.id });
  if (!res.length) return false; // changed concurrently
  if (to === "cancelled" || to === "returned") await restockOrder(order.id);
  await db.insert(orderEvents).values({
    orderId: order.id,
    type: "status",
    message: `Status changed from ${label(order.fulfillmentStatus)} to ${label(to)}${to === "cancelled" || to === "returned" ? " · items restocked" : ""}${extra ? ` · ${extra}` : ""}`,
    userId,
  });
  notifyOrderUpdated(order.storeId, order.id);
  return true;
}

export async function enabledCouriers(storeId: string) {
  const rows = await db
    .select({ id: storeIntegrations.id, provider: storeIntegrations.provider, config: storeIntegrations.config })
    .from(storeIntegrations)
    .where(and(eq(storeIntegrations.storeId, storeId), eq(storeIntegrations.type, "courier"), eq(storeIntegrations.enabled, true), inArray(storeIntegrations.provider, Object.keys(COURIERS))));
  return rows;
}

export function dueAmount(o: Pick<Order, "paymentStatus" | "total">) {
  return o.paymentStatus === "paid" || o.paymentStatus === "refunded" || o.paymentStatus === "partially_refunded" ? 0 : o.total;
}

export async function itemCount(orderId: string) {
  const [r] = await db.select({ n: sql<number>`coalesce(sum(${orderItems.quantity}), 0)::int` }).from(orderItems).where(eq(orderItems.orderId, orderId));
  return r?.n ?? 0;
}

/**
 * Book a parcel with a courier adapter and persist the result on the order.
 * Moves the order to "shipped" when the flow allows it (auto-confirming a new order first).
 */
export async function bookWithCourier(
  order: Order,
  integration: { provider: string; config: Record<string, unknown> },
  opts: { codAmount: number; note?: string | null; weightKg?: number | null },
  userId: string,
): Promise<{ ok: true; courier: CourierInfo } | { ok: false; error: string }> {
  const adapter = COURIERS[integration.provider];
  if (!adapter) return { ok: false, error: "This courier is not supported yet." };
  if (!order.phone) return { ok: false, error: `Order #${order.number} has no phone number` };
  const addr = addressLines(order.shippingAddress);
  if (!addr) return { ok: false, error: `Order #${order.number} has no shipping address` };
  const parcel: CourierParcel = {
    invoice: String(order.number),
    recipientName: order.shippingAddress?.name || order.name,
    recipientPhone: order.shippingAddress?.phone || order.phone,
    recipientAddress: addr,
    codAmount: Math.round(opts.codAmount) / 100,
    note: opts.note ?? order.note ?? undefined,
    weightKg: opts.weightKg ?? undefined,
    itemCount: await itemCount(order.id),
  };
  const res = await adapter.book(integration.config, parcel);
  if (!res.ok) return { ok: false, error: res.error };
  const courier: CourierInfo = {
    provider: integration.provider,
    consignmentId: res.consignmentId,
    trackingCode: res.trackingCode,
    trackingUrl: res.trackingUrl,
    status: res.status,
    bookedAt: new Date().toISOString(),
  };
  await db.update(orders).set({ courier }).where(and(eq(orders.id, order.id), eq(orders.storeId, order.storeId)));
  await db.insert(orderEvents).values({
    orderId: order.id,
    type: "courier",
    message: `Booked with ${adapter.name} · CN ${res.consignmentId}${res.trackingCode && res.trackingCode !== res.consignmentId ? ` · Tracking ${res.trackingCode}` : ""} · COD ${parcel.codAmount.toLocaleString("en-US")}`,
    userId,
  });
  await shipAfterBooking(order, userId);
  return { ok: true, courier };
}

/** New → Confirmed → Shipped, or Confirmed/Processing → Shipped. */
export async function shipAfterBooking(order: Pick<Order, "id" | "storeId" | "fulfillmentStatus">, userId: string) {
  let current = order.fulfillmentStatus;
  if (current === "unfulfilled" && (await applyTransition({ ...order, fulfillmentStatus: current }, "confirmed", userId))) current = "confirmed";
  if (canTransition(current, "shipped")) await applyTransition({ ...order, fulfillmentStatus: current }, "shipped", userId);
}

export const COURIER_NAMES: Record<string, string> = { steadfast: "Steadfast", pathao: "Pathao", redx: "RedX", manual: "Manual" };
