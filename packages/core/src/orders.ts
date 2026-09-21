/**
 * Cart pricing & order creation — shared by storefront checkout, dashboard manual orders
 * and the public API. All money in minor units.
 */
import {
  analyticsDaily,
  and,
  carts,
  customers,
  db,
  discounts,
  eq,
  inArray,
  orderEvents,
  orderItems,
  orders,
  products,
  productVariants,
  sql,
  stores,
  type Address,
  type CartLine,
  type Discount,
  type Order,
  type Product,
  type ProductVariant,
  type Store,
} from "@pai/db";
import { normalizePhone } from "./text";

export type PricedLine = {
  productId: string;
  variantId: string | null;
  title: string;
  variantTitle: string | null;
  slug: string;
  imageUrl: string | null;
  sku: string | null;
  unitPrice: number;
  compareAtPrice: number | null;
  quantity: number;
  total: number;
  available: number; // stock available (Infinity when not tracked)
  inStock: boolean;
};

export type PricedCart = {
  lines: PricedLine[];
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  total: number;
  discount: { code: string; type: Discount["type"]; value: number } | null;
  deliveryZone: { id: string; name: string; charge: number } | null;
  errors: string[];
};

export async function loadLineData(storeId: string, lines: CartLine[]) {
  const productIds = [...new Set(lines.map((l) => l.productId))];
  const variantIds = lines.map((l) => l.variantId).filter(Boolean) as string[];
  const [prods, vars] = await Promise.all([
    productIds.length ? db.select().from(products).where(and(eq(products.storeId, storeId), inArray(products.id, productIds))) : Promise.resolve([] as Product[]),
    variantIds.length ? db.select().from(productVariants).where(and(eq(productVariants.storeId, storeId), inArray(productVariants.id, variantIds))) : Promise.resolve([] as ProductVariant[]),
  ]);
  return { prods: new Map(prods.map((p) => [p.id, p])), vars: new Map(vars.map((v) => [v.id, v])) };
}

export async function findDiscount(storeId: string, code: string): Promise<Discount | null> {
  const d = await db.query.discounts.findFirst({
    where: and(eq(discounts.storeId, storeId), sql`upper(${discounts.code}) = upper(${code.trim()})`),
  });
  return d ?? null;
}

export function discountError(d: Discount | null, subtotal: number): string | null {
  if (!d || !d.active) return "Discount code is invalid";
  const now = Date.now();
  if (d.startsAt && d.startsAt.getTime() > now) return "Discount is not active yet";
  if (d.endsAt && d.endsAt.getTime() < now) return "Discount has expired";
  if (d.usageLimit != null && d.usedCount >= d.usageLimit) return "Discount usage limit reached";
  if (d.minSubtotal && subtotal < d.minSubtotal) return `Minimum order for this code not reached`;
  return null;
}

export async function priceCart(
  store: Pick<Store, "id" | "settings">,
  lines: CartLine[],
  opts: { discountCode?: string | null; deliveryZoneId?: string | null } = {},
): Promise<PricedCart> {
  const { prods, vars } = await loadLineData(store.id, lines);
  const errors: string[] = [];
  const priced: PricedLine[] = [];

  for (const l of lines) {
    const p = prods.get(l.productId);
    if (!p || p.status !== "active") continue;
    const v = l.variantId ? vars.get(l.variantId) : undefined;
    if (l.variantId && !v) continue;
    const unit = v ? v.price : p.price;
    const stock = !p.trackInventory || p.allowBackorder ? Number.POSITIVE_INFINITY : v ? v.inventory : p.inventory;
    const qty = Math.max(1, Math.min(l.quantity, 999));
    priced.push({
      productId: p.id,
      variantId: v?.id ?? null,
      title: p.title,
      variantTitle: v?.title ?? null,
      slug: p.slug,
      imageUrl: v?.imageUrl || p.images[0]?.url || null,
      sku: v?.sku ?? p.sku,
      unitPrice: unit,
      compareAtPrice: v ? v.compareAtPrice : p.compareAtPrice,
      quantity: qty,
      total: unit * qty,
      available: stock,
      inStock: stock >= qty,
    });
    if (stock < qty) errors.push(`Only ${Math.max(0, stock)} left of “${p.title}${v ? ` – ${v.title}` : ""}”`);
  }

  const subtotal = priced.reduce((s, l) => s + l.total, 0);
  const zones = store.settings?.delivery?.zones ?? [];
  const zone = zones.find((z) => z.id === opts.deliveryZoneId) ?? null;
  let shipping = zone ? zone.charge : 0;
  const freeOver = store.settings?.delivery?.freeShippingOver;
  if (freeOver && subtotal >= freeOver) shipping = 0;

  let discountTotal = 0;
  let discount: PricedCart["discount"] = null;
  if (opts.discountCode) {
    const d = await findDiscount(store.id, opts.discountCode);
    const err = discountError(d, subtotal);
    if (err) errors.push(err);
    else if (d) {
      discount = { code: d.code, type: d.type, value: d.value };
      if (d.type === "percentage") discountTotal = Math.round((subtotal * Math.min(d.value, 100)) / 100);
      else if (d.type === "fixed") discountTotal = Math.min(d.value, subtotal);
      else if (d.type === "free_shipping") shipping = 0;
    }
  }

  return {
    lines: priced,
    itemCount: priced.reduce((s, l) => s + l.quantity, 0),
    subtotal,
    discountTotal,
    shippingTotal: shipping,
    total: Math.max(0, subtotal - discountTotal + shipping),
    discount,
    deliveryZone: zone,
    errors,
  };
}

/* ─────────────────────────── analytics ─────────────────────────── */

type AnalyticsField = "pageViews" | "visitors" | "productViews" | "addToCarts" | "checkouts" | "orders" | "revenue";

export async function trackDaily(storeId: string, inc: Partial<Record<AnalyticsField, number>>, tx: Pick<typeof db, "insert"> = db) {
  const day = new Date().toISOString().slice(0, 10);
  const set: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(inc)) set[k] = sql.raw(`analytics_daily.${k.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase())} + ${Number(v) | 0}`);
  await tx
    .insert(analyticsDaily)
    .values({ storeId, day, ...inc })
    .onConflictDoUpdate({ target: [analyticsDaily.storeId, analyticsDaily.day], set });
}

/* ─────────────────────────── order creation ─────────────────────────── */

export type CreateOrderInput = {
  storeId: string;
  lines: CartLine[];
  customer: { name: string; phone?: string | null; email?: string | null };
  shippingAddress?: Address;
  deliveryZoneId?: string | null;
  discountCode?: string | null;
  paymentMethod: string;
  paymentRef?: string | null;
  paymentStatus?: Order["paymentStatus"];
  note?: string | null;
  source?: string;
  ip?: string | null;
  userAgent?: string | null;
  cartId?: string | null;
  customerId?: string | null;
  actorUserId?: string | null;
  /** Manual orders may override shipping (minor units). */
  shippingOverride?: number | null;
};

export class CheckoutError extends Error {}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const store = await db.query.stores.findFirst({ where: eq(stores.id, input.storeId) });
  if (!store) throw new CheckoutError("Store not found");
  const priced = await priceCart(store, input.lines, { discountCode: input.discountCode, deliveryZoneId: input.deliveryZoneId });
  if (!priced.lines.length) throw new CheckoutError("Your cart is empty");
  if (priced.errors.length) throw new CheckoutError(priced.errors[0]!);
  const minimum = store.settings?.checkout?.minimumOrder;
  if (minimum && priced.subtotal < minimum) throw new CheckoutError("Order total is below the store minimum");

  const shippingTotal = input.shippingOverride ?? priced.shippingTotal;
  const total = Math.max(0, priced.subtotal - priced.discountTotal + shippingTotal);
  const phone = normalizePhone(input.customer.phone) || null;
  const email = input.customer.email?.trim().toLowerCase() || null;

  return db.transaction(async (tx) => {
    // Atomic, gap-free per-store order numbers.
    const [{ seq }] = (await tx
      .update(stores)
      .set({ orderSeq: sql`${stores.orderSeq} + 1` })
      .where(eq(stores.id, store.id))
      .returning({ seq: stores.orderSeq })) as [{ seq: number }];

    // Upsert customer by phone/email.
    let customerId = input.customerId ?? null;
    if (!customerId && (phone || email)) {
      const existing = await tx.query.customers.findFirst({
        where: and(eq(customers.storeId, store.id), phone ? eq(customers.phone, phone) : eq(customers.email, email!)),
      });
      if (existing) customerId = existing.id;
      else {
        const [c] = await tx
          .insert(customers)
          .values({ storeId: store.id, name: input.customer.name, phone, email, addresses: input.shippingAddress ? [input.shippingAddress] : [] })
          .returning({ id: customers.id });
        customerId = c!.id;
      }
    }
    if (customerId) {
      await tx
        .update(customers)
        .set({ ordersCount: sql`${customers.ordersCount} + 1`, totalSpent: sql`${customers.totalSpent} + ${total}` })
        .where(eq(customers.id, customerId));
    }

    const [order] = await tx
      .insert(orders)
      .values({
        storeId: store.id,
        number: seq,
        customerId,
        name: input.customer.name,
        email,
        phone,
        shippingAddress: input.shippingAddress,
        subtotal: priced.subtotal,
        discountTotal: priced.discountTotal,
        shippingTotal,
        total,
        currency: store.currency,
        discountCode: priced.discount?.code ?? null,
        deliveryZone: priced.deliveryZone?.name ?? null,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentStatus ?? "pending",
        paymentRef: input.paymentRef ?? null,
        note: input.note ?? null,
        source: input.source ?? "web",
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
      })
      .returning();

    await tx.insert(orderItems).values(
      priced.lines.map((l) => ({
        orderId: order!.id,
        productId: l.productId,
        variantId: l.variantId,
        title: l.title,
        variantTitle: l.variantTitle,
        sku: l.sku,
        imageUrl: l.imageUrl,
        price: l.unitPrice,
        quantity: l.quantity,
        total: l.total,
      })),
    );

    // Inventory & sales counters.
    for (const l of priced.lines) {
      if (l.variantId) {
        await tx.update(productVariants).set({ inventory: sql`${productVariants.inventory} - ${l.quantity}` }).where(eq(productVariants.id, l.variantId));
      }
      await tx
        .update(products)
        .set({
          salesCount: sql`${products.salesCount} + ${l.quantity}`,
          inventory: l.variantId ? products.inventory : sql`${products.inventory} - ${l.quantity}`,
        })
        .where(and(eq(products.id, l.productId), eq(products.trackInventory, true)));
    }

    if (priced.discount) {
      await tx
        .update(discounts)
        .set({ usedCount: sql`${discounts.usedCount} + 1` })
        .where(and(eq(discounts.storeId, store.id), sql`upper(${discounts.code}) = upper(${priced.discount.code})`));
    }

    if (input.cartId) await tx.update(carts).set({ recoveredOrderId: order!.id }).where(eq(carts.id, input.cartId));

    await tx.insert(orderEvents).values({
      orderId: order!.id,
      type: "created",
      message: input.source === "manual" ? "Order created manually" : `Order placed via ${input.source ?? "web"}`,
      userId: input.actorUserId ?? null,
    });

    await trackDaily(store.id, { orders: 1, revenue: total }, tx);
    return order!;
  });
}

export const FULFILLMENT_FLOW: Record<Order["fulfillmentStatus"], Order["fulfillmentStatus"][]> = {
  unfulfilled: ["confirmed", "cancelled"],
  confirmed: ["processing", "shipped", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  returned: [],
  cancelled: [],
};

/** Restock inventory when an order is cancelled/returned. */
export async function restockOrder(orderId: string) {
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  for (const it of items) {
    if (it.variantId) await db.update(productVariants).set({ inventory: sql`${productVariants.inventory} + ${it.quantity}` }).where(eq(productVariants.id, it.variantId));
    else if (it.productId) await db.update(products).set({ inventory: sql`${products.inventory} + ${it.quantity}` }).where(eq(products.id, it.productId));
  }
}
