import { serializeProductForApi } from "@pai/core/webhooks";
import { and, db, eq, products, productVariants, sql } from "@pai/db";
import { findProduct, syncProductInventory, variantUpdateSchema } from "@/lib/api-v1/catalog";
import { apiRoute, fireWebhook, isUuid, notFound, ok, parseBody, revalidateStore } from "@/lib/api-v1/http";

type Params = { id: string; variantId: string };

/** Update a variant — price, SKU, options or stock (`inventory` absolute, or `inventoryAdjustment` delta). */
export const PATCH = apiRoute<Params>("products:write", async ({ req, params, store }) => {
  if (!isUuid(params.variantId)) throw notFound("Variant");
  const product = await findProduct(store.id, params.id);
  if (!product) throw notFound("Product");
  const variant = await db.query.productVariants.findFirst({
    where: and(eq(productVariants.id, params.variantId), eq(productVariants.productId, product.id), eq(productVariants.storeId, store.id)),
  });
  if (!variant) throw notFound("Variant");

  const { inventoryAdjustment, ...body } = await parseBody(req, variantUpdateSchema);
  const set: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) if (v !== undefined) set[k] = v;
  if (inventoryAdjustment !== undefined) set.inventory = sql`${productVariants.inventory} + ${inventoryAdjustment}`;
  if (Object.keys(set).length) {
    await db.update(productVariants).set(set).where(and(eq(productVariants.id, variant.id), eq(productVariants.storeId, store.id)));
  }
  if (set.inventory !== undefined) await syncProductInventory(product.id);
  // Touch the product so `updatedAt`-based syncs pick up the variant change.
  await db.update(products).set({ updatedAt: new Date() }).where(and(eq(products.id, product.id), eq(products.storeId, store.id)));

  const data = await serializeProductForApi(product.id, store.id);
  revalidateStore(store.id);
  fireWebhook(store.id, "product.updated", async () => data);
  return ok(data);
});
