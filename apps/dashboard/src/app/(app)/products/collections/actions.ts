"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, asc, collections, db, desc, eq, ilike, inArray, notInArray, or, productCollections, products, sql } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { ActionError } from "@/lib/errors";
import { uuid, uuids } from "@/lib/zod";
import { sanitizeHtml } from "../_lib/shared";
import { uniqueCollectionSlug } from "../_lib/server";

const collectionSchema = z.object({
  id: uuid.optional().nullable(),
  title: z.string().trim().min(1, "Give your collection a title").max(120, "Keep it under 120 characters"),
  description: z.string().max(50_000),
  imageUrl: z.string().max(2000).nullable(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(80)
    .regex(/^([a-z0-9ঀ-৿]+(?:-[a-z0-9ঀ-৿]+)*)?$/, "Use lowercase letters, numbers and dashes"),
  published: z.boolean(),
  sortOrder: z.enum(["manual", "newest", "price-asc", "price-desc", "best-selling"]),
  seoTitle: z.string().trim().max(120),
  seoDescription: z.string().trim().max(320),
  productIds: z.array(uuid).max(5000),
});

function revalidateCollections(id?: string) {
  revalidatePath("/products/collections");
  revalidatePath("/products");
  if (id) revalidatePath(`/products/collections/${id}`);
}

export const saveCollection = action(collectionSchema, { permission: "products.manage" }, async (input, ctx) => {
  const storeId = ctx.store.id;
  if (input.id) {
    const exists = await db.query.collections.findFirst({ where: and(eq(collections.id, input.id), eq(collections.storeId, storeId)), columns: { id: true } });
    if (!exists) throw new ActionError("This collection no longer exists.");
  }
  const wanted = [...new Set(input.productIds)];
  const owned = wanted.length
    ? new Set((await db.select({ id: products.id }).from(products).where(and(eq(products.storeId, storeId), inArray(products.id, wanted)))).map((p) => p.id))
    : new Set<string>();
  const productIds = wanted.filter((id) => owned.has(id));
  const seo = input.seoTitle || input.seoDescription ? { title: input.seoTitle || undefined, description: input.seoDescription || undefined } : null;

  const result = await db.transaction(async (tx) => {
    const slug = await uniqueCollectionSlug(storeId, input.slug || input.title, input.id, tx);
    const values = {
      title: input.title,
      slug,
      description: input.description ? sanitizeHtml(input.description) : null,
      imageUrl: input.imageUrl || null,
      published: input.published,
      sortOrder: input.sortOrder,
      seo,
    };
    let id: string;
    if (input.id) {
      id = input.id;
      await tx
        .update(collections)
        .set(values)
        .where(and(eq(collections.id, id), eq(collections.storeId, storeId)));
    } else {
      const [m] = await tx
        .select({ max: sql<number>`coalesce(max(${collections.position}), -1)` })
        .from(collections)
        .where(eq(collections.storeId, storeId));
      const [row] = await tx
        .insert(collections)
        .values({ ...values, storeId, position: Number(m?.max ?? -1) + 1 })
        .returning({ id: collections.id });
      id = row!.id;
    }
    await tx.delete(productCollections).where(and(eq(productCollections.collectionId, id), productIds.length ? notInArray(productCollections.productId, productIds) : undefined));
    if (productIds.length)
      await tx
        .insert(productCollections)
        .values(productIds.map((productId, position) => ({ productId, collectionId: id, position })))
        .onConflictDoUpdate({ target: [productCollections.productId, productCollections.collectionId], set: { position: sql`excluded.position` } });
    return { id, slug };
  });
  await audit(ctx, input.id ? "collection.update" : "collection.create", result.id, { title: input.title, products: productIds.length });
  revalidateCollections(result.id);
  return result;
});

export const deleteCollections = action(z.object({ ids: uuids }), { permission: "products.manage" }, async ({ ids }, ctx) => {
  const rows = await db
    .delete(collections)
    .where(and(eq(collections.storeId, ctx.store.id), inArray(collections.id, ids)))
    .returning({ id: collections.id });
  await audit(ctx, "collection.delete", undefined, { ids: rows.map((r) => r.id) });
  revalidateCollections();
  return { count: rows.length };
});

export const setCollectionsPublished = action(z.object({ ids: uuids, published: z.boolean() }), { permission: "products.manage" }, async ({ ids, published }, ctx) => {
  const rows = await db
    .update(collections)
    .set({ published })
    .where(and(eq(collections.storeId, ctx.store.id), inArray(collections.id, ids)))
    .returning({ id: collections.id });
  revalidateCollections();
  return { count: rows.length };
});

/** Persist the display order of collections (ids in the new order). */
export const reorderCollections = action(z.object({ ids: z.array(uuid).min(1).max(1000) }), { permission: "products.manage" }, async ({ ids }, ctx) => {
  await db.transaction(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      await tx
        .update(collections)
        .set({ position: i })
        .where(and(eq(collections.id, ids[i]!), eq(collections.storeId, ctx.store.id)));
    }
  });
  revalidateCollections();
  return { count: ids.length };
});

/** Product search for the collection product picker. */
export const searchProductsForCollection = action(z.object({ q: z.string().max(100), exclude: z.array(uuid).max(5000).default([]) }), { permission: "products.view" }, async ({ q, exclude }, ctx) => {
  const pat = `%${q.trim().replace(/[\\%_]/g, "\\$&")}%`;
  const rows = await db
    .select({ id: products.id, title: products.title, images: products.images, status: products.status, price: products.price, inventory: products.inventory, trackInventory: products.trackInventory })
    .from(products)
    .where(
      and(
        eq(products.storeId, ctx.store.id),
        q.trim() ? or(ilike(products.title, pat), ilike(products.sku, pat)) : undefined,
        exclude.length ? notInArray(products.id, exclude) : undefined,
      ),
    )
    .orderBy(q.trim() ? asc(products.title) : desc(products.createdAt))
    .limit(20);
  return rows.map((r) => ({ id: r.id, title: r.title, image: r.images[0]?.url ?? null, status: r.status, price: r.price, inventory: r.inventory, trackInventory: r.trackInventory }));
});
