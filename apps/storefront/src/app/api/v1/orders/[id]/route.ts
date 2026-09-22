import { FULFILLMENT_FLOW, restockOrder } from "@pai/core/orders";
import { serializeOrderForApi } from "@pai/core/webhooks";
import { and, db, eq, orderEvents, orders, type CourierInfo, type Order } from "@pai/db";
import { apiRoute, conflict, fireWebhook, isUuid, notFound, ok, parseBody, revalidateStore } from "@/lib/api-v1/http";
import { FS_LABELS, orderUpdateSchema } from "@/lib/api-v1/orders";

type Params = { id: string };
type Fs = Order["fulfillmentStatus"];

async function loadOrder(storeId: string, id: string) {
  if (!isUuid(id)) return undefined;
  return db.query.orders.findFirst({ where: and(eq(orders.id, id), eq(orders.storeId, storeId)) });
}

export const GET = apiRoute<Params>("orders:read", async ({ params, store }) => {
  const order = await loadOrder(store.id, params.id);
  if (!order) throw notFound("Order");
  return ok(await serializeOrderForApi(order, { timeline: true }));
});

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
const RESTOCKED: Fs[] = ["cancelled", "returned"];

/**
 * Update status / payment / fulfillment / notes / tags / courier. Every change is written to the
 * order timeline and an `order.updated` webhook fires. Fulfillment moves follow FULFILLMENT_FLOW;
 * cancelling (via `status` or `fulfillmentStatus`) restocks inventory, as does `returned`.
 */
export const PATCH = apiRoute<Params>("orders:write", async ({ req, params, store }) => {
  const order = await loadOrder(store.id, params.id);
  if (!order) throw notFound("Order");
  const body = await parseBody(req, orderUpdateSchema);

  const set: Partial<typeof orders.$inferInsert> = {};
  const events: { type: string; message: string }[] = [];

  /* fulfillment + status */
  let nextFs: Fs = body.fulfillmentStatus ?? order.fulfillmentStatus;
  if (body.status === "cancelled" && !RESTOCKED.includes(nextFs)) {
    if (nextFs !== order.fulfillmentStatus || !FULFILLMENT_FLOW[order.fulfillmentStatus].includes("cancelled")) {
      throw conflict(`An order that is ${FS_LABELS[order.fulfillmentStatus]} can't be cancelled`, { status: "Mark it returned instead" });
    }
    nextFs = "cancelled";
  }
  if (nextFs !== order.fulfillmentStatus) {
    if (!FULFILLMENT_FLOW[order.fulfillmentStatus].includes(nextFs)) {
      throw conflict(`Can't change fulfillment from ${FS_LABELS[order.fulfillmentStatus]} to ${FS_LABELS[nextFs]}`, {
        fulfillmentStatus: `Allowed: ${FULFILLMENT_FLOW[order.fulfillmentStatus].join(", ") || "none"}`,
      });
    }
    set.fulfillmentStatus = nextFs;
  }

  let nextStatus: Order["status"] = body.status ?? order.status;
  if (nextFs === "cancelled") nextStatus = "cancelled";
  else if (set.fulfillmentStatus === "delivered" && !body.status && order.status === "open") nextStatus = "completed";
  if (order.status === "cancelled" && nextStatus !== "cancelled" && nextStatus !== "archived") {
    throw conflict("Cancelled orders can't be reopened", { status: "Order is cancelled" });
  }
  if (nextStatus !== order.status) {
    set.status = nextStatus;
    if (nextStatus === "cancelled" && !order.cancelledAt) set.cancelledAt = new Date();
  }
  const restock = set.fulfillmentStatus !== undefined && RESTOCKED.includes(set.fulfillmentStatus) && !RESTOCKED.includes(order.fulfillmentStatus);

  if (set.fulfillmentStatus) {
    events.push({
      type: "status",
      message: `Status changed from ${FS_LABELS[order.fulfillmentStatus]} to ${FS_LABELS[set.fulfillmentStatus]}${restock ? " · items restocked" : ""} · via API`,
    });
  }
  if (set.status && !(set.status === "cancelled" && set.fulfillmentStatus === "cancelled")) {
    events.push({ type: "status", message: `Order marked ${set.status} · via API` });
  }

  /* payment */
  if (body.paymentStatus && body.paymentStatus !== order.paymentStatus) {
    set.paymentStatus = body.paymentStatus;
    events.push({ type: "payment", message: `Payment status changed from ${cap(order.paymentStatus)} to ${cap(body.paymentStatus)} · via API` });
  }
  if (body.paymentRef !== undefined && body.paymentRef !== order.paymentRef) {
    set.paymentRef = body.paymentRef;
    events.push({ type: "payment", message: body.paymentRef ? `Payment reference set to ${body.paymentRef} · via API` : "Payment reference removed · via API" });
  }

  /* notes & tags */
  if (body.note !== undefined && (body.note || null) !== order.note) {
    set.note = body.note || null;
    events.push({ type: "note", message: set.note ? `Note updated via API: ${set.note.slice(0, 280)}` : "Note removed via API" });
  }
  if (body.staffNote !== undefined && (body.staffNote || null) !== order.staffNote) {
    set.staffNote = body.staffNote || null;
    events.push({ type: "note", message: set.staffNote ? `Staff note updated via API: ${set.staffNote.slice(0, 280)}` : "Staff note removed via API" });
  }
  if (body.tags) {
    const tags = [...new Set(body.tags)];
    const same = tags.length === order.tags.length && tags.every((t) => order.tags.includes(t));
    if (!same) {
      set.tags = tags;
      events.push({ type: "note", message: tags.length ? `Tags set to ${tags.join(", ")} · via API` : "Tags cleared via API" });
    }
  }

  /* courier */
  if (body.courier !== undefined) {
    if (body.courier === null) {
      if (order.courier) {
        set.courier = null;
        events.push({ type: "courier", message: "Courier information removed · via API" });
      }
    } else {
      const courier: CourierInfo = { ...(order.courier ?? {}), ...body.courier, bookedAt: order.courier?.bookedAt ?? new Date().toISOString() };
      set.courier = courier;
      events.push({
        type: "courier",
        message: `Courier ${courier.provider}${courier.consignmentId ? ` · CN ${courier.consignmentId}` : ""}${courier.status ? ` · ${courier.status}` : ""} · via API`,
      });
    }
  }

  if (!Object.keys(set).length) return ok(await serializeOrderForApi(order, { timeline: true }));

  // Optimistic concurrency on the fulfillment state so a concurrent change can't double-restock.
  const updated = await db
    .update(orders)
    .set(set)
    .where(and(eq(orders.id, order.id), eq(orders.storeId, store.id), eq(orders.fulfillmentStatus, order.fulfillmentStatus)))
    .returning({ id: orders.id });
  if (!updated.length) throw conflict("The order was changed concurrently — fetch it and retry");
  if (restock) await restockOrder(order.id);
  if (events.length) await db.insert(orderEvents).values(events.map((e) => ({ orderId: order.id, ...e })));

  const data = await serializeOrderForApi(order.id, { storeId: store.id, timeline: true });
  if (restock) revalidateStore(store.id);
  fireWebhook(store.id, "order.updated", async () => {
    if (!data) return null;
    const { timeline: _t, ...rest } = data;
    return rest;
  });
  return ok(data);
});
