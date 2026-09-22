"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { COURIERS } from "@pai/core/couriers";
import { and, db, eq, inArray, orderEvents, orders, type CourierInfo, type Order } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { ActionError } from "@/lib/errors";
import { optText, uuid, uuids } from "@/lib/zod";
import { applyTransition, bookWithCourier, notifyOrderUpdated, canTransition, COURIER_NAMES, dueAmount, enabledCouriers, label, shipAfterBooking } from "./_lib/order-ops";

const fulfillment = z.enum(["unfulfilled", "confirmed", "processing", "shipped", "delivered", "returned", "cancelled"]);
const paymentStatus = z.enum(["pending", "authorized", "paid", "partially_refunded", "refunded", "failed"]);

const PAYMENT_LABELS: Record<string, string> = {
  pending: "pending",
  authorized: "authorized",
  paid: "paid",
  partially_refunded: "partially refunded",
  refunded: "refunded",
  failed: "failed",
};

async function loadOrder(storeId: string, id: string): Promise<Order> {
  const o = await db.query.orders.findFirst({ where: and(eq(orders.id, id), eq(orders.storeId, storeId)) });
  if (!o) throw new ActionError("Order not found");
  return o;
}

function revalidateOrder(id?: string) {
  revalidatePath("/orders");
  if (id) revalidatePath(`/orders/${id}`);
}

/* ─────────────────────────── Status ─────────────────────────── */

export const changeOrderStatus = action(
  z.object({ id: uuid, to: fulfillment, markPaid: z.boolean().optional() }),
  { permission: "orders.manage" },
  async ({ id, to, markPaid }, ctx) => {
    const o = await loadOrder(ctx.store.id, id);
    if (!canTransition(o.fulfillmentStatus, to)) throw new ActionError(`Can't move an order from ${label(o.fulfillmentStatus)} to ${label(to)}.`);
    const ok = await applyTransition(o, to, ctx.user.id);
    if (!ok) throw new ActionError("This order was just updated by someone else. Refresh and try again.");
    if (to === "delivered" && markPaid && o.paymentStatus !== "paid") {
      await db.update(orders).set({ paymentStatus: "paid" }).where(and(eq(orders.id, id), eq(orders.storeId, ctx.store.id)));
      await db.insert(orderEvents).values({ orderId: id, type: "payment", message: `Payment marked as paid${o.paymentMethod === "cod" ? " · cash collected on delivery" : ""}`, userId: ctx.user.id });
    }
    await audit(ctx, "order.status", id, { from: o.fulfillmentStatus, to });
    revalidateOrder(id);
    return { status: to };
  },
);

export const bulkChangeStatus = action(
  z.object({ ids: uuids, to: z.enum(["confirmed", "processing", "shipped"]) }),
  { permission: "orders.manage" },
  async ({ ids, to }, ctx) => {
    const rows = await db
      .select({ id: orders.id, storeId: orders.storeId, fulfillmentStatus: orders.fulfillmentStatus })
      .from(orders)
      .where(and(eq(orders.storeId, ctx.store.id), inArray(orders.id, ids)));
    let updated = 0;
    for (const o of rows) if (await applyTransition(o, to, ctx.user.id)) updated++;
    await audit(ctx, "order.bulk_status", undefined, { to, updated, count: ids.length });
    revalidateOrder();
    return { updated, skipped: ids.length - updated };
  },
);

/* ─────────────────────────── Payment ─────────────────────────── */

export const updatePayment = action(
  z.object({ id: uuid, status: paymentStatus, reference: optText(120) }),
  { permission: "orders.manage" },
  async ({ id, status, reference }, ctx) => {
    const o = await loadOrder(ctx.store.id, id);
    const refChanged = (reference ?? null) !== (o.paymentRef ?? null);
    if (o.paymentStatus === status && !refChanged) return { status };
    await db
      .update(orders)
      .set({ paymentStatus: status, paymentRef: reference ?? null })
      .where(and(eq(orders.id, id), eq(orders.storeId, ctx.store.id)));
    const parts: string[] = [];
    if (o.paymentStatus !== status) parts.push(`Payment marked as ${PAYMENT_LABELS[status]}`);
    if (refChanged) parts.push(reference ? `Reference ${reference}` : "Reference removed");
    await db.insert(orderEvents).values({ orderId: id, type: "payment", message: parts.join(" · "), userId: ctx.user.id });
    await audit(ctx, "order.payment", id, { from: o.paymentStatus, to: status });
    notifyOrderUpdated(ctx.store.id, id);
    revalidateOrder(id);
    return { status };
  },
);

/* ─────────────────────────── Courier ─────────────────────────── */

export const bookCourier = action(
  z.object({
    id: uuid,
    provider: z.string().min(1).max(40),
    codAmount: z.number().int().min(0).max(100_000_000),
    note: optText(300),
    weightKg: z.number().min(0).max(100).nullable().optional(),
  }),
  { permission: "orders.manage" },
  async ({ id, provider, codAmount, note, weightKg }, ctx) => {
    const o = await loadOrder(ctx.store.id, id);
    if (o.fulfillmentStatus === "cancelled" || o.fulfillmentStatus === "returned") throw new ActionError("Cancelled or returned orders can't be booked.");
    if (o.courier?.consignmentId) throw new ActionError(`Already booked with ${COURIER_NAMES[o.courier.provider] ?? o.courier.provider}.`);
    const integration = (await enabledCouriers(ctx.store.id)).find((i) => i.provider === provider);
    if (!integration) throw new ActionError("This courier isn't connected. Enable it in Settings → Couriers.");
    const res = await bookWithCourier(o, integration, { codAmount, note, weightKg }, ctx.user.id);
    if (!res.ok) throw new ActionError(`${COURIERS[provider]?.name ?? provider}: ${res.error}`);
    await audit(ctx, "order.courier_booked", id, { provider, consignmentId: res.courier.consignmentId });
    revalidateOrder(id);
    return res.courier;
  },
);

export const bulkBookCourier = action(
  z.object({ ids: uuids.max(100), provider: z.string().min(1).max(40) }),
  { permission: "orders.manage" },
  async ({ ids, provider }, ctx) => {
    const integration = (await enabledCouriers(ctx.store.id)).find((i) => i.provider === provider);
    if (!integration) throw new ActionError("This courier isn't connected. Enable it in Settings → Couriers.");
    const rows = await db.select().from(orders).where(and(eq(orders.storeId, ctx.store.id), inArray(orders.id, ids)));
    let booked = 0;
    let skipped = ids.length - rows.length;
    const errors: string[] = [];
    for (const o of rows) {
      if (o.courier?.consignmentId || !["unfulfilled", "confirmed", "processing"].includes(o.fulfillmentStatus)) {
        skipped++;
        continue;
      }
      const res = await bookWithCourier(o, integration, { codAmount: dueAmount(o) }, ctx.user.id);
      if (res.ok) booked++;
      else errors.push(`#${o.number}: ${res.error}`);
    }
    await audit(ctx, "order.bulk_courier", undefined, { provider, booked, failed: errors.length });
    revalidateOrder();
    return { booked, skipped, failed: errors.length, errors: errors.slice(0, 5) };
  },
);

export const saveManualShipment = action(
  z.object({
    id: uuid,
    provider: z.string().trim().min(1, "Courier name is required").max(60),
    trackingCode: optText(120),
    trackingUrl: z
      .string()
      .trim()
      .max(500)
      .optional()
      .nullable()
      .transform((v) => v || null)
      .refine((v) => !v || /^https?:\/\//i.test(v), "Tracking link must start with http:// or https://"),
    markShipped: z.boolean().default(true),
  }),
  { permission: "orders.manage" },
  async ({ id, provider, trackingCode, trackingUrl, markShipped }, ctx) => {
    const o = await loadOrder(ctx.store.id, id);
    if (o.fulfillmentStatus === "cancelled" || o.fulfillmentStatus === "returned") throw new ActionError("Cancelled or returned orders can't be shipped.");
    const courier: CourierInfo = {
      provider: "manual",
      consignmentId: trackingCode ?? undefined,
      trackingCode: trackingCode ?? undefined,
      trackingUrl: trackingUrl ?? undefined,
      status: provider, // manual shipments store the courier's display name here
      bookedAt: new Date().toISOString(),
    };
    await db.update(orders).set({ courier }).where(and(eq(orders.id, id), eq(orders.storeId, ctx.store.id)));
    await db.insert(orderEvents).values({
      orderId: id,
      type: "courier",
      message: `Shipped manually with ${provider}${trackingCode ? ` · Tracking ${trackingCode}` : ""}`,
      userId: ctx.user.id,
    });
    if (markShipped) await shipAfterBooking(o, ctx.user.id);
    revalidateOrder(id);
    return courier;
  },
);

export const clearCourier = action(z.object({ id: uuid }), { permission: "orders.manage" }, async ({ id }, ctx) => {
  const o = await loadOrder(ctx.store.id, id);
  if (!o.courier) return { ok: true };
  await db.update(orders).set({ courier: null }).where(and(eq(orders.id, id), eq(orders.storeId, ctx.store.id)));
  const name = o.courier.provider === "manual" ? (o.courier.status ?? "manual courier") : (COURIER_NAMES[o.courier.provider] ?? o.courier.provider);
  await db.insert(orderEvents).values({
    orderId: id,
    type: "courier",
    message: `Removed shipment info (${name}${o.courier.consignmentId ? ` · CN ${o.courier.consignmentId}` : ""})`,
    userId: ctx.user.id,
  });
  revalidateOrder(id);
  return { ok: true };
});

/* ─────────────────────────── Notes & tags ─────────────────────────── */

export const addOrderNote = action(
  z.object({ id: uuid, message: z.string().trim().min(1, "Write a note first").max(2000) }),
  { permission: "orders.manage" },
  async ({ id, message }, ctx) => {
    await loadOrder(ctx.store.id, id);
    await db.insert(orderEvents).values({ orderId: id, type: "note", message, userId: ctx.user.id });
    revalidateOrder(id);
    return { ok: true };
  },
);

export const saveOrderMeta = action(
  z.object({ id: uuid, staffNote: optText(2000), tags: z.array(z.string().trim().min(1).max(40)).max(20) }),
  { permission: "orders.manage" },
  async ({ id, staffNote, tags }, ctx) => {
    const o = await loadOrder(ctx.store.id, id);
    const uniq = [...new Set(tags)];
    await db.update(orders).set({ staffNote, tags: uniq }).where(and(eq(orders.id, id), eq(orders.storeId, ctx.store.id)));
    if ((o.staffNote ?? null) !== staffNote) {
      await db.insert(orderEvents).values({ orderId: id, type: "note", message: staffNote ? "Updated the staff note" : "Removed the staff note", userId: ctx.user.id });
    }
    revalidateOrder(id);
    return { ok: true };
  },
);
