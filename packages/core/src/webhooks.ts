/**
 * Webhook delivery + REST resource serializers.
 *
 * `data` in a webhook payload is exactly the REST API resource (`/api/v1`), so both the API routes
 * and every event producer (storefront checkout, dashboard, API) use the serializers below.
 *
 * ```ts
 * import { dispatchWebhook, serializeOrderForApi } from "@pai/core/webhooks";
 * after(async () => dispatchWebhook(store.id, "order.created", await serializeOrderForApi(order.id)));
 * ```
 *
 * Delivery: signed POST per active webhook (`X-Pai-Signature: sha256=hex(HMAC(secret, "{ts}.{body}"))`),
 * 5s timeout, best-effort in-process retries (1m, 5m, 30m, 2h, 6h, 24h). In production this module is
 * the seam where a durable queue (BullMQ/Redis) replaces the in-process retry timers.
 */
import { createHmac, randomUUID } from "node:crypto";
import {
  and,
  asc,
  collections,
  customers,
  db,
  eq,
  inArray,
  orderEvents,
  orderItems,
  orders,
  productCollections,
  products,
  productVariants,
  sql,
  stores,
  webhooks,
  type Address,
  type Collection,
  type Customer,
  type Order,
  type OrderItem,
  type Product,
  type ProductVariant,
} from "@pai/db";

/* ─────────────────────────── topics & signing ─────────────────────────── */

export const WEBHOOK_TOPICS = ["order.created", "order.updated", "product.updated", "customer.created"] as const;
export type WebhookTopic = (typeof WEBHOOK_TOPICS)[number];

export const WEBHOOK_TIMEOUT_MS = 5_000;
const RETRY_DELAYS_MS = [60_000, 300_000, 1_800_000, 7_200_000, 21_600_000, 86_400_000];

/** `sha256=` + hex HMAC-SHA256 of `{timestamp}.{rawBody}`. */
export function signWebhookPayload(secret: string, timestamp: number | string, rawBody: string): string {
  return "sha256=" + createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
}

/** Generate a signing secret for a new webhook (`webhooks.secret`). */
export function generateWebhookSecret(): string {
  return "whsec_" + randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "").slice(0, 16);
}

export type WebhookEnvelope<T = unknown> = {
  id: string;
  topic: WebhookTopic;
  store: { id: string; slug: string };
  createdAt: string;
  data: T;
};

type Hook = { id: string; url: string; secret: string };

async function deliver(hook: Hook, topic: WebhookTopic, storeSlug: string, deliveryId: string, body: string, attempt: number): Promise<boolean> {
  const ts = Math.floor(Date.now() / 1000);
  try {
    const res = await fetch(hook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "PaiCommerce-Webhooks/1.0",
        "X-Pai-Topic": topic,
        "X-Pai-Store": storeSlug,
        "X-Pai-Delivery": deliveryId,
        "X-Pai-Timestamp": String(ts),
        "X-Pai-Signature": signWebhookPayload(hook.secret, ts, body),
      },
      body,
      redirect: "manual",
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });
    // Drain the body so the connection can be reused.
    await res.arrayBuffer().catch(() => undefined);
    if (res.status >= 200 && res.status < 300) return true;
    console.warn(`[webhooks] ${topic} → ${hook.url} responded ${res.status} (attempt ${attempt + 1}, delivery ${deliveryId})`);
  } catch (e) {
    console.warn(`[webhooks] ${topic} → ${hook.url} failed (attempt ${attempt + 1}, delivery ${deliveryId}):`, e instanceof Error ? e.message : e);
  }
  return false;
}

function scheduleRetry(hook: Hook, topic: WebhookTopic, storeSlug: string, deliveryId: string, body: string, attempt: number) {
  const delay = RETRY_DELAYS_MS[attempt];
  if (delay == null) {
    console.error(`[webhooks] giving up on delivery ${deliveryId} (${topic} → ${hook.url}) after ${attempt + 1} attempts`);
    return;
  }
  const t = setTimeout(() => {
    void (async () => {
      // Skip if the webhook was deleted/paused meanwhile.
      const still = await db.query.webhooks.findFirst({ where: and(eq(webhooks.id, hook.id), eq(webhooks.active, true)) }).catch(() => null);
      if (!still) return;
      const ok = await deliver({ ...hook, url: still.url, secret: still.secret }, topic, storeSlug, deliveryId, body, attempt + 1);
      if (!ok) scheduleRetry(hook, topic, storeSlug, deliveryId, body, attempt + 1);
    })().catch((e) => console.error("[webhooks] retry crashed", e));
  }, delay);
  (t as { unref?: () => void }).unref?.();
}

/**
 * Deliver `data` to every active webhook of `storeId` subscribed to `topic`.
 * Never throws; resolves once the first attempt of every delivery has finished (≤ ~5s).
 * Call it inside `after()` (next/server) or with `void` so it never blocks a response.
 */
export async function dispatchWebhook(storeId: string, topic: WebhookTopic, data: unknown): Promise<void> {
  try {
    if (data == null) return;
    const hooks = await db
      .select({ id: webhooks.id, url: webhooks.url, secret: webhooks.secret, slug: stores.slug })
      .from(webhooks)
      .innerJoin(stores, eq(stores.id, webhooks.storeId))
      .where(and(eq(webhooks.storeId, storeId), eq(webhooks.topic, topic), eq(webhooks.active, true)));
    if (!hooks.length) return;
    const createdAt = new Date().toISOString();
    await Promise.all(
      hooks.map(async (h) => {
        const deliveryId = randomUUID();
        const envelope: WebhookEnvelope = { id: deliveryId, topic, store: { id: storeId, slug: h.slug }, createdAt, data };
        const body = JSON.stringify(envelope);
        const ok = await deliver(h, topic, h.slug, deliveryId, body, 0);
        if (!ok) scheduleRetry(h, topic, h.slug, deliveryId, body, 0);
      }),
    );
  } catch (e) {
    console.error(`[webhooks] dispatch ${topic} for store ${storeId} failed`, e);
  }
}

/* ─────────────────────────── resource shapes ─────────────────────────── */

export type ApiAddress = {
  name: string | null;
  phone: string | null;
  address: string | null;
  area: string | null;
  city: string | null;
  district: string | null;
  postalCode: string | null;
  country: string | null;
};

export function serializeAddress(a: Address | null | undefined): ApiAddress | null {
  if (!a) return null;
  return {
    name: a.name ?? null,
    phone: a.phone ?? null,
    address: [a.line1, a.line2].filter(Boolean).join(", ") || null,
    area: a.area ?? null,
    city: a.city ?? null,
    district: a.district ?? null,
    postalCode: a.postalCode ?? null,
    country: a.country ?? null,
  };
}

export type ApiVariant = {
  id: string;
  title: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  inventory: number;
  options: Record<string, string>;
  imageUrl: string | null;
  position: number;
};

export type ApiProduct = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: Product["status"];
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  currency: string;
  sku: string | null;
  barcode: string | null;
  trackInventory: boolean;
  allowBackorder: boolean;
  inventory: number;
  weightGrams: number | null;
  vendor: string | null;
  productType: string | null;
  featured: boolean;
  images: { url: string; alt: string | null }[];
  options: { name: string; values: string[] }[];
  variants: ApiVariant[];
  tags: string[];
  collections: { id: string; slug: string; title: string }[];
  seo: { title: string | null; description: string | null } | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiOrderLine = {
  id: string;
  productId: string | null;
  variantId: string | null;
  title: string;
  productTitle: string;
  variantTitle: string | null;
  sku: string | null;
  imageUrl: string | null;
  quantity: number;
  price: number;
  total: number;
};

export type ApiOrder = {
  id: string;
  orderNumber: number;
  status: Order["status"];
  paymentStatus: Order["paymentStatus"];
  fulfillmentStatus: Order["fulfillmentStatus"];
  paymentMethod: string;
  paymentRef: string | null;
  currency: string;
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  discountCode: string | null;
  deliveryZone: string | null;
  customer: { id: string | null; name: string; phone: string | null; email: string | null };
  shippingAddress: ApiAddress | null;
  lines: ApiOrderLine[];
  courier: { provider: string; consignmentId: string | null; trackingCode: string | null; trackingUrl: string | null; status: string | null; bookedAt: string | null } | null;
  note: string | null;
  staffNote: string | null;
  tags: string[];
  source: string;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Only present on single-order reads (`GET /orders/{id}`). */
  timeline?: { id: string; type: string; message: string; createdAt: string }[];
};

export type ApiCustomer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  addresses: ApiAddress[];
  tags: string[];
  note: string | null;
  acceptsMarketing: boolean;
  ordersCount: number;
  totalSpent: number;
  currency: string;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiCollection = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  published: boolean;
  sortOrder: string;
  productsCount: number;
  createdAt: string;
  updatedAt: string;
};

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);

async function storeCurrency(storeId: string): Promise<string> {
  const s = await db.query.stores.findFirst({ where: eq(stores.id, storeId), columns: { currency: true } });
  return s?.currency ?? "BDT";
}

/* ─────────────────────────── products ─────────────────────────── */

function productShape(p: Product, vars: ProductVariant[], cols: { id: string; slug: string; title: string }[], currency: string): ApiProduct {
  const variants = [...vars].sort((a, b) => a.position - b.position);
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    status: p.status,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    costPrice: p.costPrice,
    currency,
    sku: p.sku,
    barcode: p.barcode,
    trackInventory: p.trackInventory,
    allowBackorder: p.allowBackorder,
    inventory: variants.length ? variants.reduce((s, v) => s + v.inventory, 0) : p.inventory,
    weightGrams: p.weightGrams,
    vendor: p.vendor,
    productType: p.productType,
    featured: p.featured,
    images: (p.images ?? []).map((i) => ({ url: i.url, alt: i.alt ?? null })),
    options: p.options ?? [],
    variants: variants.map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      inventory: v.inventory,
      options: v.options ?? {},
      imageUrl: v.imageUrl,
      position: v.position,
    })),
    tags: p.tags ?? [],
    collections: cols,
    seo: p.seo ? { title: p.seo.title ?? null, description: p.seo.description ?? null } : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

/** Serialize many products (all from the same store) with 2 extra queries. Order is preserved. */
export async function serializeProductsForApi(list: Product[], opts: { currency?: string } = {}): Promise<ApiProduct[]> {
  if (!list.length) return [];
  const ids = list.map((p) => p.id);
  const storeId = list[0]!.storeId;
  const [vars, cols, currency] = await Promise.all([
    db.select().from(productVariants).where(and(eq(productVariants.storeId, storeId), inArray(productVariants.productId, ids))),
    db
      .select({ productId: productCollections.productId, id: collections.id, slug: collections.slug, title: collections.title })
      .from(productCollections)
      .innerJoin(collections, eq(collections.id, productCollections.collectionId))
      .where(and(eq(collections.storeId, storeId), inArray(productCollections.productId, ids)))
      .orderBy(asc(collections.position)),
    opts.currency ? Promise.resolve(opts.currency) : storeCurrency(storeId),
  ]);
  const vmap = new Map<string, ProductVariant[]>();
  for (const v of vars) vmap.set(v.productId, [...(vmap.get(v.productId) ?? []), v]);
  const cmap = new Map<string, { id: string; slug: string; title: string }[]>();
  for (const c of cols) cmap.set(c.productId, [...(cmap.get(c.productId) ?? []), { id: c.id, slug: c.slug, title: c.title }]);
  return list.map((p) => productShape(p, vmap.get(p.id) ?? [], cmap.get(p.id) ?? [], currency));
}

/** Serialize one product (by row or id). Pass `storeId` with an id to enforce tenancy. */
export async function serializeProductForApi(productOrId: Product | string, storeId?: string): Promise<ApiProduct | null> {
  let p: Product | undefined;
  if (typeof productOrId === "string") {
    p = await db.query.products.findFirst({
      where: storeId ? and(eq(products.id, productOrId), eq(products.storeId, storeId)) : eq(products.id, productOrId),
    });
  } else p = productOrId;
  if (!p) return null;
  const [out] = await serializeProductsForApi([p]);
  return out ?? null;
}

/* ─────────────────────────── orders ─────────────────────────── */

function orderShape(o: Order, items: OrderItem[]): ApiOrder {
  return {
    id: o.id,
    orderNumber: o.number,
    status: o.status,
    paymentStatus: o.paymentStatus,
    fulfillmentStatus: o.fulfillmentStatus,
    paymentMethod: o.paymentMethod,
    paymentRef: o.paymentRef,
    currency: o.currency,
    subtotal: o.subtotal,
    shipping: o.shippingTotal,
    discount: o.discountTotal,
    tax: o.taxTotal,
    total: o.total,
    discountCode: o.discountCode,
    deliveryZone: o.deliveryZone,
    customer: { id: o.customerId, name: o.name, phone: o.phone, email: o.email },
    shippingAddress: serializeAddress(o.shippingAddress),
    lines: items.map((it) => ({
      id: it.id,
      productId: it.productId,
      variantId: it.variantId,
      title: it.variantTitle ? `${it.title} — ${it.variantTitle}` : it.title,
      productTitle: it.title,
      variantTitle: it.variantTitle,
      sku: it.sku,
      imageUrl: it.imageUrl,
      quantity: it.quantity,
      price: it.price,
      total: it.total,
    })),
    courier: o.courier
      ? {
          provider: o.courier.provider,
          consignmentId: o.courier.consignmentId ?? null,
          trackingCode: o.courier.trackingCode ?? null,
          trackingUrl: o.courier.trackingUrl ?? null,
          status: o.courier.status ?? null,
          bookedAt: o.courier.bookedAt ?? null,
        }
      : null,
    note: o.note,
    staffNote: o.staffNote,
    tags: o.tags ?? [],
    source: o.source,
    cancelledAt: iso(o.cancelledAt),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

/** Serialize many orders with one extra query for line items. Order is preserved. */
export async function serializeOrdersForApi(list: Order[]): Promise<ApiOrder[]> {
  if (!list.length) return [];
  const items = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, list.map((o) => o.id)))
    .orderBy(asc(orderItems.title));
  const map = new Map<string, OrderItem[]>();
  for (const it of items) map.set(it.orderId, [...(map.get(it.orderId) ?? []), it]);
  return list.map((o) => orderShape(o, map.get(o.id) ?? []));
}

/**
 * Serialize one order (by row or id) — the `order.created` / `order.updated` webhook `data`.
 * Pass `storeId` with an id to enforce tenancy; `timeline: true` adds the order events.
 */
export async function serializeOrderForApi(orderOrId: Order | string, opts: { storeId?: string; timeline?: boolean } = {}): Promise<ApiOrder | null> {
  let o: Order | undefined;
  if (typeof orderOrId === "string") {
    o = await db.query.orders.findFirst({
      where: opts.storeId ? and(eq(orders.id, orderOrId), eq(orders.storeId, opts.storeId)) : eq(orders.id, orderOrId),
    });
  } else o = orderOrId;
  if (!o) return null;
  const [out] = await serializeOrdersForApi([o]);
  if (!out) return null;
  if (opts.timeline) {
    const ev = await db.select().from(orderEvents).where(eq(orderEvents.orderId, o.id)).orderBy(asc(orderEvents.createdAt));
    out.timeline = ev.map((e) => ({ id: e.id, type: e.type, message: e.message, createdAt: e.createdAt.toISOString() }));
  }
  return out;
}

/* ─────────────────────────── customers ─────────────────────────── */

function customerShape(c: Customer, currency: string): ApiCustomer {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    addresses: (c.addresses ?? []).map((a) => serializeAddress(a)!).filter(Boolean),
    tags: c.tags ?? [],
    note: c.note,
    acceptsMarketing: c.acceptsMarketing,
    ordersCount: c.ordersCount,
    totalSpent: c.totalSpent,
    currency,
    blocked: c.blocked,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export async function serializeCustomersForApi(list: Customer[], opts: { currency?: string } = {}): Promise<ApiCustomer[]> {
  if (!list.length) return [];
  const currency = opts.currency ?? (await storeCurrency(list[0]!.storeId));
  return list.map((c) => customerShape(c, currency));
}

/** Serialize one customer (by row or id) — the `customer.created` webhook `data`. Never exposes the password hash. */
export async function serializeCustomerForApi(customerOrId: Customer | string, storeId?: string): Promise<ApiCustomer | null> {
  let c: Customer | undefined;
  if (typeof customerOrId === "string") {
    c = await db.query.customers.findFirst({
      where: storeId ? and(eq(customers.id, customerOrId), eq(customers.storeId, storeId)) : eq(customers.id, customerOrId),
    });
  } else c = customerOrId;
  if (!c) return null;
  const [out] = await serializeCustomersForApi([c]);
  return out ?? null;
}

/* ─────────────────────────── collections ─────────────────────────── */

export async function serializeCollectionsForApi(list: Collection[]): Promise<ApiCollection[]> {
  if (!list.length) return [];
  const counts = await db
    .select({ id: productCollections.collectionId, n: sql<number>`count(*)::int` })
    .from(productCollections)
    .where(inArray(productCollections.collectionId, list.map((c) => c.id)))
    .groupBy(productCollections.collectionId);
  const m = new Map(counts.map((c) => [c.id, c.n]));
  return list.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    imageUrl: c.imageUrl,
    published: c.published,
    sortOrder: c.sortOrder,
    productsCount: m.get(c.id) ?? 0,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}
