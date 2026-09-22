/** Shared logic for the tenant cart endpoints (`{base}/api/cart/*`). */
import { and, db, eq, productVariants, products, sql } from "@pai/db";
import { trackDaily } from "@pai/core/orders";
import { getCart, getOrCreateCart, lineKey, normalizeLines, saveCart, toCartView, type CartRow } from "./cart";
import { error, json } from "./http";
import type { Site } from "./site";

export async function cartResponse(site: Site, row: CartRow | null, status = 200, extra: Record<string, unknown> = {}) {
  const cart = await toCartView(site, row);
  return json({ cart, ...extra }, { status, headers: { "Cache-Control": "no-store" } });
}

/** Validate a product/variant pair belongs to this store and is purchasable. */
export async function resolveLine(site: Site, productId: string, variantId: string | null) {
  const [p] = await db
    .select({ id: products.id, title: products.title, status: products.status, track: products.trackInventory, backorder: products.allowBackorder, inventory: products.inventory })
    .from(products)
    .where(and(eq(products.storeId, site.store.id), eq(products.id, productId)))
    .limit(1);
  if (!p || p.status !== "active") return { error: "This product is no longer available" } as const;
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(productVariants).where(and(eq(productVariants.storeId, site.store.id), eq(productVariants.productId, p.id)));
  const hasVariants = Number(n) > 0;
  if (hasVariants && !variantId) return { error: "Please choose an option" } as const;
  let stock = !p.track || p.backorder ? Infinity : p.inventory;
  if (variantId) {
    const [v] = await db
      .select({ id: productVariants.id, inventory: productVariants.inventory })
      .from(productVariants)
      .where(and(eq(productVariants.storeId, site.store.id), eq(productVariants.productId, p.id), eq(productVariants.id, variantId)))
      .limit(1);
    if (!v) return { error: "This option is no longer available" } as const;
    if (p.track && !p.backorder) stock = v.inventory;
  }
  return { product: p, stock } as const;
}

/** Set a line's quantity (0 removes). Caps at available stock and reports it. */
export async function setLineQuantity(site: Site, key: string, quantity: number) {
  const row = await getCart(site);
  if (!row) return cartResponse(site, null);
  const [productId, variantRaw = ""] = key.split(":");
  const variantId = variantRaw || null;
  const current = row.lines.find((l) => lineKey(l) === key);
  if (!current) return cartResponse(site, row, 404, { error: "Item is no longer in your cart" });
  if (quantity <= 0) {
    const saved = await saveCart(site, row.id, { lines: row.lines.filter((l) => lineKey(l) !== key) });
    return cartResponse(site, saved);
  }
  const check = await resolveLine(site, productId!, variantId);
  if ("error" in check) {
    const saved = await saveCart(site, row.id, { lines: row.lines.filter((l) => lineKey(l) !== key) });
    return cartResponse(site, saved, 409, { error: check.error });
  }
  let q = Math.min(999, quantity);
  let message: string | undefined;
  if (q > check.stock) {
    q = Math.max(1, check.stock);
    message = check.stock > 0 ? `Only ${check.stock} available` : "This item is sold out";
  }
  const saved = await saveCart(site, row.id, { lines: row.lines.map((l) => (lineKey(l) === key ? { ...l, quantity: q } : l)) });
  return cartResponse(site, saved, message ? 409 : 200, message ? { error: message } : {});
}

export async function addLine(site: Site, input: { productId: string; variantId: string | null; quantity: number }) {
  const check = await resolveLine(site, input.productId, input.variantId);
  if ("error" in check) return error(check.error ?? "This product is unavailable", 409);
  const row = await getOrCreateCart(site);
  const key = lineKey(input);
  const already = row.lines.find((l) => lineKey(l) === key)?.quantity ?? 0;
  if (check.stock <= already) {
    return cartResponse(site, row, 409, { error: check.stock > 0 ? `You already have all ${check.stock} available in your cart` : "Sorry, this item is sold out" });
  }
  const addQty = Math.min(input.quantity, check.stock - already);
  const lines = normalizeLines([...row.lines, { productId: input.productId, variantId: input.variantId, quantity: addQty }]);
  const saved = await saveCart(site, row.id, { lines });
  if (!site.preview) void trackDaily(site.store.id, { addToCarts: 1 }).catch(() => {});
  const partial = addQty < input.quantity ? { notice: `Only ${check.stock} available — we added ${addQty}` } : {};
  return cartResponse(site, saved, 200, partial);
}
