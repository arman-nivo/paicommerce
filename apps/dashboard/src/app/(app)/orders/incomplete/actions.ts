"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CheckoutError, createOrder } from "@pai/core/orders";
import { and, carts, db, eq, isNull, orderEvents } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { ActionError } from "@/lib/errors";
import { uuid } from "@/lib/zod";

async function loadCart(storeId: string, id: string) {
  const c = await db.query.carts.findFirst({ where: and(eq(carts.id, id), eq(carts.storeId, storeId)) });
  if (!c) throw new ActionError("This checkout no longer exists.");
  return c;
}

export const markCartContacted = action(z.object({ id: uuid, contacted: z.boolean() }), { permission: "orders.manage" }, async ({ id, contacted }, ctx) => {
  await loadCart(ctx.store.id, id);
  await db
    .update(carts)
    .set({ recoveryContactedAt: contacted ? new Date() : null })
    .where(and(eq(carts.id, id), eq(carts.storeId, ctx.store.id)));
  revalidatePath("/orders/incomplete");
  return { contacted };
});

export const convertCartToOrder = action(z.object({ id: uuid }), { permission: "orders.manage" }, async ({ id }, ctx) => {
  const cart = await loadCart(ctx.store.id, id);
  if (cart.recoveredOrderId) throw new ActionError("This checkout was already converted to an order.");
  const snap = cart.checkout ?? {};
  if (!cart.lines.length) throw new ActionError("This cart is empty.");
  try {
    const order = await createOrder({
      storeId: ctx.store.id,
      lines: cart.lines,
      customer: { name: snap.name?.trim() || snap.address?.name?.trim() || "Customer", phone: snap.phone ?? null, email: snap.email ?? null },
      customerId: cart.customerId,
      shippingAddress: snap.address ? { ...snap.address, name: snap.address.name || snap.name, phone: snap.address.phone || snap.phone } : undefined,
      deliveryZoneId: snap.deliveryZoneId ?? null,
      discountCode: cart.discountCode,
      paymentMethod: "cod",
      paymentStatus: "pending",
      note: snap.note ?? null,
      source: "manual",
      cartId: cart.id,
      actorUserId: ctx.user.id,
    });
    await db.insert(orderEvents).values({ orderId: order.id, type: "note", message: "Recovered from an incomplete checkout", userId: ctx.user.id });
    await audit(ctx, "order.recovered", order.id, { cartId: cart.id, number: order.number });
    revalidatePath("/orders/incomplete");
    revalidatePath("/orders");
    return { id: order.id, number: order.number };
  } catch (e) {
    if (e instanceof CheckoutError) throw new ActionError(e.message);
    throw e;
  }
});

export const deleteIncompleteCart = action(z.object({ id: uuid }), { permission: "orders.manage" }, async ({ id }, ctx) => {
  // Clear the captured checkout rather than deleting the cart row, so the shopper's live cart keeps working.
  await db
    .update(carts)
    .set({ checkout: null, recoveryContactedAt: null })
    .where(and(eq(carts.id, id), eq(carts.storeId, ctx.store.id), isNull(carts.recoveredOrderId)));
  revalidatePath("/orders/incomplete");
  return { ok: true };
});
