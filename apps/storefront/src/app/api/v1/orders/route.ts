import { normalizePhone } from "@pai/core";
import { CheckoutError, createOrder } from "@pai/core/orders";
import { serializeCustomerForApi, serializeOrderForApi, serializeOrdersForApi } from "@pai/core/webhooks";
import { and, count, customers, db, desc, eq, gt, ilike, inArray, or, orders, products, productVariants, type CartLine, type SQL } from "@pai/db";
import { z } from "zod";
import { apiRoute, conflict, fireWebhook, invalid, isoDate, ok, paginated, paginationQuery, parseBody, parseQuery, revalidateStore } from "@/lib/api-v1/http";
import { orderCreateSchema, toAddress } from "@/lib/api-v1/orders";

const listQuery = z.object({
  ...paginationQuery,
  status: z.enum(["open", "completed", "cancelled", "archived"]).optional(),
  payment_status: z.enum(["pending", "authorized", "paid", "partially_refunded", "refunded", "failed"]).optional(),
  fulfillment_status: z.enum(["unfulfilled", "confirmed", "processing", "shipped", "delivered", "returned", "cancelled"]).optional(),
  created_since: isoDate.optional(),
  updated_since: isoDate.optional(),
  customer_id: z.uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
});

export const GET = apiRoute("orders:read", async ({ req, store }) => {
  const q = parseQuery(req, listQuery);
  const where: SQL[] = [eq(orders.storeId, store.id)];
  if (q.status) where.push(eq(orders.status, q.status));
  if (q.payment_status) where.push(eq(orders.paymentStatus, q.payment_status));
  if (q.fulfillment_status) where.push(eq(orders.fulfillmentStatus, q.fulfillment_status));
  if (q.created_since) where.push(gt(orders.createdAt, q.created_since));
  if (q.updated_since) where.push(gt(orders.updatedAt, q.updated_since));
  if (q.customer_id) where.push(eq(orders.customerId, q.customer_id));
  if (q.q) {
    const term = q.q.replace(/^#/, "");
    const pat = `%${term.replace(/[\\%_]/g, (c) => "\\" + c)}%`;
    const phone = normalizePhone(term);
    const conds: SQL[] = [ilike(orders.name, pat), ilike(orders.email, pat)];
    if (phone) conds.push(ilike(orders.phone, `%${phone}%`));
    if (/^\d{1,9}$/.test(term)) conds.push(eq(orders.number, Number(term)));
    where.push(or(...conds)!);
  }
  const cond = and(...where);
  const [rows, [{ total }]] = (await Promise.all([
    db.select().from(orders).where(cond).orderBy(desc(orders.createdAt), desc(orders.number)).limit(q.limit).offset((q.page - 1) * q.limit),
    db.select({ total: count() }).from(orders).where(cond),
  ])) as [(typeof orders.$inferSelect)[], [{ total: number }]];
  return paginated(await serializeOrdersForApi(rows), { page: q.page, limit: q.limit, total });
});

/** Create an order through the same pricing/stock pipeline as checkout (`createOrder`, source "api"). */
export const POST = apiRoute("orders:write", async ({ req, store }) => {
  const body = await parseBody(req, orderCreateSchema);

  // Resolve & validate lines within this store.
  const variantIds = [...new Set(body.lines.map((l) => l.variantId).filter(Boolean) as string[])];
  const vars = variantIds.length
    ? await db.select().from(productVariants).where(and(eq(productVariants.storeId, store.id), inArray(productVariants.id, variantIds)))
    : [];
  const vmap = new Map(vars.map((v) => [v.id, v]));
  const productIds = [...new Set(body.lines.map((l) => (l.variantId ? vmap.get(l.variantId)?.productId : l.productId)).filter(Boolean) as string[])];
  const prods = productIds.length ? await db.select().from(products).where(and(eq(products.storeId, store.id), inArray(products.id, productIds))) : [];
  const pmap = new Map(prods.map((p) => [p.id, p]));
  const withVariants = new Set(
    productIds.length
      ? (await db.selectDistinct({ id: productVariants.productId }).from(productVariants).where(and(eq(productVariants.storeId, store.id), inArray(productVariants.productId, productIds)))).map((r) => r.id)
      : [],
  );

  const details: Record<string, string> = {};
  const lines: CartLine[] = [];
  body.lines.forEach((l, i) => {
    let productId = l.productId;
    if (l.variantId) {
      const v = vmap.get(l.variantId);
      if (!v) return void (details[`lines.${i}.variantId`] = "Variant not found");
      if (productId && productId !== v.productId) return void (details[`lines.${i}.variantId`] = "Variant does not belong to this product");
      productId = v.productId;
    }
    const p = pmap.get(productId!);
    if (!p) return void (details[`lines.${i}.productId`] = "Product not found");
    if (p.status !== "active") return void (details[`lines.${i}.productId`] = "Product is not active");
    if (!l.variantId && withVariants.has(p.id)) return void (details[`lines.${i}.variantId`] = "This product has variants — variantId is required");
    lines.push({ productId: p.id, variantId: l.variantId ?? null, quantity: l.quantity });
  });
  if (body.deliveryZoneId && !(store.settings?.delivery?.zones ?? []).some((z) => z.id === body.deliveryZoneId)) {
    details.deliveryZoneId = "Unknown delivery zone";
  }
  if (Object.keys(details).length) throw invalid("Invalid order", details);

  // Remember whether the customer already exists, to emit customer.created when createOrder inserts one.
  const phone = normalizePhone(body.customer.phone) || null;
  const email = body.customer.email?.trim().toLowerCase() || null;
  const existingCustomer =
    phone || email
      ? await db.query.customers.findFirst({
          where: and(eq(customers.storeId, store.id), phone ? eq(customers.phone, phone) : eq(customers.email, email!)),
          columns: { id: true },
        })
      : undefined;

  const h = req.headers;
  let order;
  try {
    order = await createOrder({
      storeId: store.id,
      lines,
      customer: { name: body.customer.name, phone, email },
      shippingAddress: body.shippingAddress ? toAddress(body.shippingAddress) : undefined,
      deliveryZoneId: body.deliveryZoneId ?? null,
      discountCode: body.discountCode ?? null,
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentStatus,
      paymentRef: body.paymentRef ?? null,
      note: body.note ?? null,
      source: "api",
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      userAgent: h.get("user-agent"),
    });
  } catch (e) {
    if (e instanceof CheckoutError) {
      if (/^Only -?\d+ left/.test(e.message)) throw conflict(e.message, { lines: e.message });
      if (/discount/i.test(e.message)) throw invalid(e.message, { discountCode: e.message });
      throw invalid(e.message, { lines: e.message });
    }
    throw e;
  }

  if (body.tags?.length) {
    await db
      .update(orders)
      .set({ tags: [...new Set(body.tags)] })
      .where(and(eq(orders.id, order.id), eq(orders.storeId, store.id)));
  }

  const data = await serializeOrderForApi(order.id, { storeId: store.id });
  revalidateStore(store.id);
  fireWebhook(store.id, "order.created", async () => data);
  if (!existingCustomer && order.customerId) {
    const customerId = order.customerId;
    fireWebhook(store.id, "customer.created", () => serializeCustomerForApi(customerId, store.id));
  }
  return ok(data, 201);
});
