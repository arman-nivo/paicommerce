/** Server-side cart: cookie token → `carts` row → priced CartView. */
import { cookies } from "next/headers";
import { and, carts, db, eq, type CartLine } from "@pai/db";
import { priceCart } from "@pai/core/orders";
import { randomToken } from "@pai/core";
import { EMPTY_CART, type CartView } from "@pai/theme-kit";
import { pricingStore } from "./commerce";
import { siteUrl, type Site } from "./site";

export const CART_COOKIE = "pai_cart";

export type CartRow = typeof carts.$inferSelect;

export function cookiePath(site: Pick<Site, "base">) {
  return site.base || "/";
}

export function cartCookieOptions(site: Pick<Site, "base">) {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: cookiePath(site), maxAge: 60 * 60 * 24 * 60 };
}

export const lineKey = (l: Pick<CartLine, "productId" | "variantId">) => `${l.productId}:${l.variantId ?? ""}`;

/** Current cart row (or null). Preview carts are isolated by the preview cookie path. */
export async function getCart(site: Site): Promise<CartRow | null> {
  const jar = await cookies();
  const token = jar.get(CART_COOKIE)?.value;
  if (!token) return null;
  const [row] = await db.select().from(carts).where(and(eq(carts.storeId, site.store.id), eq(carts.token, token))).limit(1);
  // A cart that became an order is finished — start fresh.
  if (!row || row.recoveredOrderId) return null;
  return row;
}

/** Current cart, creating one (and setting the cookie) if needed. Route handlers only. */
export async function getOrCreateCart(site: Site): Promise<CartRow> {
  const existing = await getCart(site);
  if (existing) return existing;
  const token = randomToken(20);
  const [row] = await db.insert(carts).values({ storeId: site.store.id, token, lines: [] }).returning();
  const jar = await cookies();
  jar.set(CART_COOKIE, token, cartCookieOptions(site));
  return row!;
}

export async function clearCartCookie(site: Site) {
  const jar = await cookies();
  jar.set(CART_COOKIE, "", { ...cartCookieOptions(site), maxAge: 0 });
}

/** Price a cart row into the client-facing CartView. */
export async function toCartView(site: Site, row: Pick<CartRow, "lines" | "discountCode" | "checkout"> | null, opts: { deliveryZoneId?: string | null } = {}): Promise<CartView> {
  const freeOver = site.store.settings?.delivery?.freeShippingOver ?? null;
  if (!row || !row.lines?.length) return { ...EMPTY_CART, currency: site.store.currency, freeShippingOver: freeOver };
  const priced = await priceCart(pricingStore(site.store), row.lines, {
    discountCode: row.discountCode,
    deliveryZoneId: opts.deliveryZoneId !== undefined ? opts.deliveryZoneId : row.checkout?.deliveryZoneId ?? null,
  });
  return {
    lines: priced.lines.map((l) => ({
      key: lineKey(l),
      productId: l.productId,
      variantId: l.variantId,
      title: l.title,
      variantTitle: l.variantTitle,
      slug: l.slug,
      url: siteUrl(site, `/products/${l.slug}`),
      imageUrl: l.imageUrl,
      unitPrice: l.unitPrice,
      compareAtPrice: l.compareAtPrice,
      quantity: l.quantity,
      total: l.total,
      available: Number.isFinite(l.available) ? l.available : null,
      inStock: l.inStock,
    })),
    itemCount: priced.itemCount,
    subtotal: priced.subtotal,
    discountTotal: priced.discountTotal,
    shippingTotal: priced.shippingTotal,
    total: priced.total,
    discount: priced.discount,
    deliveryZone: priced.deliveryZone,
    errors: priced.errors,
    currency: site.store.currency,
    freeShippingOver: freeOver,
  };
}

/** Drop lines whose products no longer exist / are inactive (priceCart skips them). */
export function normalizeLines(lines: CartLine[]): CartLine[] {
  const map = new Map<string, CartLine>();
  for (const l of lines) {
    if (!l?.productId) continue;
    const k = lineKey(l);
    const prev = map.get(k);
    map.set(k, { productId: l.productId, variantId: l.variantId ?? null, quantity: Math.max(1, Math.min(999, (prev?.quantity ?? 0) + Math.floor(l.quantity || 1))) });
  }
  return [...map.values()].slice(0, 100);
}

export async function saveCart(site: Site, id: string, patch: Partial<Pick<CartRow, "lines" | "discountCode" | "checkout" | "customerId">>) {
  const [row] = await db
    .update(carts)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(carts.id, id), eq(carts.storeId, site.store.id)))
    .returning();
  return row!;
}
