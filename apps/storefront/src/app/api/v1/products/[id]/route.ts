import { serializeProductForApi } from "@pai/core/webhooks";
import { and, db, eq, ne, products, productVariants } from "@pai/db";
import { findProduct, productUpdateSchema, resolveCollectionIds, setProductCollections } from "@/lib/api-v1/catalog";
import { apiRoute, conflict, fireWebhook, invalid, isUuid, notFound, ok, parseBody, revalidateStore } from "@/lib/api-v1/http";

type Params = { id: string };

export const GET = apiRoute<Params>("products:read", async ({ params, store }) => {
  const p = await findProduct(store.id, params.id);
  if (!p) throw notFound("Product");
  return ok(await serializeProductForApi(p));
});

/** Partial update by id. Archive with `{ "status": "archived" }`. */
export const PATCH = apiRoute<Params>("products:write", async ({ req, params, store }) => {
  if (!isUuid(params.id)) throw notFound("Product");
  const existing = await findProduct(store.id, params.id);
  if (!existing) throw notFound("Product");
  const body = await parseBody(req, productUpdateSchema);

  if (body.slug && body.slug !== existing.slug) {
    const clash = await db.query.products.findFirst({
      where: and(eq(products.storeId, store.id), eq(products.slug, body.slug), ne(products.id, existing.id)),
      columns: { id: true },
    });
    if (clash) throw conflict("A product with this slug already exists", { slug: "Already in use" });
  }
  if (body.inventory !== undefined) {
    const hasVariants = await db.query.productVariants.findFirst({ where: and(eq(productVariants.productId, existing.id), eq(productVariants.storeId, store.id)), columns: { id: true } });
    if (hasVariants) throw invalid("This product has variants — adjust stock per variant", { inventory: "Use PATCH /products/{id}/variants/{variantId}" });
  }
  const collectionIds = body.collections ? await resolveCollectionIds(store.id, body.collections) : null;

  const { collections: _c, ...fields } = body;
  const set: Partial<typeof products.$inferInsert> = {};
  for (const [k, v] of Object.entries(fields)) if (v !== undefined) (set as Record<string, unknown>)[k] = v;
  if (Object.keys(set).length) {
    await db.update(products).set(set).where(and(eq(products.id, existing.id), eq(products.storeId, store.id)));
  } else {
    await db.update(products).set({ updatedAt: new Date() }).where(and(eq(products.id, existing.id), eq(products.storeId, store.id)));
  }
  if (collectionIds) await setProductCollections(existing.id, collectionIds);

  const data = await serializeProductForApi(existing.id, store.id);
  revalidateStore(store.id);
  fireWebhook(store.id, "product.updated", async () => data);
  return ok(data);
});
