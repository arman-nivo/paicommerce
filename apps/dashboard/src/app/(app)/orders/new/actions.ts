"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isValidBdPhone, normalizePhone } from "@pai/core";
import { CheckoutError, createOrder, priceCart } from "@pai/core/orders";
import { and, asc, customers, db, desc, eq, ilike, inArray, or, products, productVariants } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { ActionError } from "@/lib/errors";
import { optText, uuid } from "@/lib/zod";

const lineSchema = z.object({ productId: uuid, variantId: uuid.nullable().optional(), quantity: z.number().int().min(1).max(999) });

function likeOf(q: string) {
  return `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
}

export type ProductHit = {
  id: string;
  title: string;
  imageUrl: string | null;
  price: number;
  sku: string | null;
  stock: number | null; // null = not tracked / backorder allowed
  variants: { id: string; title: string; price: number; sku: string | null; stock: number | null; imageUrl: string | null }[];
};

export const searchOrderProducts = action(z.object({ q: z.string().trim().max(100) }), { permission: "orders.manage" }, async ({ q }, ctx): Promise<ProductHit[]> => {
  const conds = [eq(products.storeId, ctx.store.id), eq(products.status, "active")];
  if (q) conds.push(or(ilike(products.title, likeOf(q)), ilike(products.sku, likeOf(q)))!);
  const prods = await db
    .select()
    .from(products)
    .where(and(...conds))
    .orderBy(q ? asc(products.title) : desc(products.salesCount))
    .limit(12);
  if (!prods.length) return [];
  const vars = await db
    .select()
    .from(productVariants)
    .where(and(eq(productVariants.storeId, ctx.store.id), inArray(productVariants.productId, prods.map((p) => p.id))))
    .orderBy(asc(productVariants.position));
  return prods.map((p) => {
    const untracked = !p.trackInventory || p.allowBackorder;
    return {
      id: p.id,
      title: p.title,
      imageUrl: p.images[0]?.url ?? null,
      price: p.price,
      sku: p.sku,
      stock: untracked ? null : p.inventory,
      variants: vars
        .filter((v) => v.productId === p.id)
        .map((v) => ({ id: v.id, title: v.title, price: v.price, sku: v.sku, stock: untracked ? null : v.inventory, imageUrl: v.imageUrl })),
    };
  });
});

export type CustomerHit = { id: string; name: string; phone: string | null; email: string | null; ordersCount: number; address: { name?: string; phone?: string; line1?: string; area?: string; city?: string; district?: string } | null };

export const searchOrderCustomers = action(z.object({ q: z.string().trim().min(1).max(100) }), { permission: "orders.manage" }, async ({ q }, ctx): Promise<CustomerHit[]> => {
  const phone = normalizePhone(q).replace(/\D/g, "");
  const parts = [ilike(customers.name, likeOf(q)), ilike(customers.email, likeOf(q))];
  if (phone.length >= 3) parts.push(ilike(customers.phone, `%${phone}%`));
  const rows = await db
    .select({ id: customers.id, name: customers.name, phone: customers.phone, email: customers.email, ordersCount: customers.ordersCount, addresses: customers.addresses })
    .from(customers)
    .where(and(eq(customers.storeId, ctx.store.id), or(...parts)))
    .orderBy(desc(customers.ordersCount))
    .limit(8);
  return rows.map(({ addresses, ...c }) => ({ ...c, address: addresses[0] ?? null }));
});

export const priceDraftOrder = action(
  z.object({ lines: z.array(lineSchema).max(100), discountCode: optText(60), deliveryZoneId: optText(80) }),
  { permission: "orders.manage" },
  async ({ lines, discountCode, deliveryZoneId }, ctx) => {
    const priced = await priceCart(ctx.store, lines, { discountCode, deliveryZoneId });
    return {
      ...priced,
      lines: priced.lines.map((l) => ({ ...l, available: Number.isFinite(l.available) ? l.available : null })),
    };
  },
);

const addressSchema = z.object({
  name: optText(120),
  phone: optText(30),
  line1: optText(300),
  area: optText(120),
  city: optText(120),
});

export const createManualOrder = action(
  z.object({
    lines: z.array(lineSchema).min(1, "Add at least one product").max(100),
    customerId: uuid.nullable().optional(),
    customer: z.object({
      name: z.string().trim().min(1, "Customer name is required").max(120),
      phone: z
        .string()
        .trim()
        .max(30)
        .refine((p) => !p || isValidBdPhone(p), "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)"),
      email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]).optional(),
    }),
    address: addressSchema,
    deliveryZoneId: optText(80),
    shippingOverride: z.number().int().min(0).max(100_000_000).nullable().optional(),
    discountCode: optText(60),
    paymentMethod: z.enum(["cod", "bkash_manual", "bkash", "nagad", "sslcommerz", "manual"]),
    paymentStatus: z.enum(["pending", "paid"]),
    paymentRef: optText(120),
    note: optText(1000),
  }),
  { permission: "orders.manage" },
  async (input, ctx) => {
    if (!input.customer.phone && !input.customer.email) throw new ActionError("Add the customer's phone number (or email) so you can reach them.");
    let customerId = input.customerId ?? null;
    if (customerId) {
      const c = await db.query.customers.findFirst({ where: and(eq(customers.id, customerId), eq(customers.storeId, ctx.store.id)), columns: { id: true } });
      if (!c) customerId = null;
    }
    const a = input.address;
    const hasAddress = !!(a.line1 || a.area || a.city);
    try {
      const order = await createOrder({
        storeId: ctx.store.id,
        lines: input.lines,
        customer: { name: input.customer.name, phone: input.customer.phone || null, email: input.customer.email || null },
        customerId,
        shippingAddress: hasAddress
          ? {
              name: a.name ?? input.customer.name,
              phone: normalizePhone(a.phone ?? input.customer.phone) || undefined,
              line1: a.line1 ?? undefined,
              area: a.area ?? undefined,
              city: a.city ?? undefined,
              country: "BD",
            }
          : undefined,
        deliveryZoneId: input.deliveryZoneId,
        shippingOverride: input.shippingOverride ?? null,
        discountCode: input.discountCode,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentStatus,
        paymentRef: input.paymentRef,
        note: input.note,
        source: "manual",
        actorUserId: ctx.user.id,
      });
      await audit(ctx, "order.create_manual", order.id, { number: order.number });
      revalidatePath("/orders");
      return { id: order.id, number: order.number };
    } catch (e) {
      if (e instanceof CheckoutError) throw new ActionError(e.message);
      throw e;
    }
  },
);
