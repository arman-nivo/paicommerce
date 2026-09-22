"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { slugify, stripHtml } from "@pai/core";
import { generateProductDescription, generateSeo } from "@pai/core/ai";
import { and, collections, db, eq, inArray, notInArray, productCollections, products, productVariants, sql, type ProductOption } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { ActionError } from "@/lib/errors";
import { uuid, uuids } from "@/lib/zod";
import { PRODUCT_STATUSES, productInputSchema, sanitizeHtml, variantTitle } from "./_lib/shared";
import { assertProductCapacity, uniqueProductSlug } from "./_lib/server";

function revalidateProducts(id?: string) {
  revalidatePath("/products");
  revalidatePath("/products/inventory");
  revalidatePath("/products/collections");
  if (id) revalidatePath(`/products/${id}`);
}

/** Create or update a product with its variants and collections (single transaction). */
export const saveProduct = action(productInputSchema, { permission: "products.manage" }, async (input, ctx) => {
  const storeId = ctx.store.id;
  const isNew = !input.id;
  if (isNew) await assertProductCapacity(ctx.store, 1);
  else {
    const exists = await db.query.products.findFirst({ where: and(eq(products.id, input.id!), eq(products.storeId, storeId)), columns: { id: true } });
    if (!exists) throw new ActionError("This product no longer exists.");
  }

  // Collections must belong to this store.
  const collectionIds = input.collectionIds.length
    ? (await db.select({ id: collections.id }).from(collections).where(and(eq(collections.storeId, storeId), inArray(collections.id, input.collectionIds)))).map((c) => c.id)
    : [];

  const options: ProductOption[] = input.options.map((o) => ({ name: o.name, values: [...new Set(o.values)] }));
  const hasVariants = options.length > 0 && input.variants.length > 0;
  const variants = hasVariants
    ? input.variants.map((v, i) => ({
        ...v,
        title: v.title || variantTitle(options.map((o) => v.options[o.name] ?? "")),
        position: i,
        sku: v.sku || null,
        imageUrl: v.imageUrl || null,
      }))
    : [];
  const price = hasVariants ? Math.min(...variants.map((v) => v.price)) : input.price;
  const inventory = hasVariants ? variants.reduce((s, v) => s + v.inventory, 0) : input.inventory;
  const seo = input.seoTitle || input.seoDescription ? { title: input.seoTitle || undefined, description: input.seoDescription || undefined } : null;

  const result = await db.transaction(async (tx) => {
    const slug = await uniqueProductSlug(storeId, input.slug || input.title, input.id, tx);
    const values = {
      title: input.title,
      slug,
      description: input.description || null,
      status: input.status,
      vendor: input.vendor || null,
      productType: input.productType || null,
      tags: [...new Set(input.tags)],
      images: input.images.map((im) => ({ url: im.url, ...(im.alt ? { alt: im.alt } : {}) })),
      price,
      compareAtPrice: input.compareAtPrice || null,
      costPrice: input.costPrice,
      sku: input.sku || null,
      barcode: input.barcode || null,
      trackInventory: input.trackInventory,
      inventory,
      allowBackorder: input.allowBackorder,
      weightGrams: input.weightGrams,
      options: hasVariants ? options : [],
      seo,
      featured: input.featured,
    };
    let id: string;
    if (isNew) {
      const [row] = await tx.insert(products).values({ ...values, storeId }).returning({ id: products.id });
      id = row!.id;
    } else {
      id = input.id!;
      await tx
        .update(products)
        .set(values)
        .where(and(eq(products.id, id), eq(products.storeId, storeId)));
    }

    // Variants: update existing ids, insert new, delete removed.
    const existing = await tx
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(and(eq(productVariants.productId, id), eq(productVariants.storeId, storeId)));
    const existingIds = new Set(existing.map((e) => e.id));
    const keep = variants.filter((v) => v.id && existingIds.has(v.id)).map((v) => v.id!);
    await tx
      .delete(productVariants)
      .where(and(eq(productVariants.productId, id), eq(productVariants.storeId, storeId), keep.length ? notInArray(productVariants.id, keep) : undefined));
    const saved: { id: string; title: string }[] = [];
    for (const v of variants) {
      const data = { title: v.title, options: v.options, price: v.price, compareAtPrice: v.compareAtPrice || null, sku: v.sku, inventory: v.inventory, imageUrl: v.imageUrl, position: v.position };
      if (v.id && existingIds.has(v.id)) {
        await tx
          .update(productVariants)
          .set(data)
          .where(and(eq(productVariants.id, v.id), eq(productVariants.storeId, storeId)));
        saved.push({ id: v.id, title: v.title });
      } else {
        const [row] = await tx
          .insert(productVariants)
          .values({ ...data, productId: id, storeId })
          .returning({ id: productVariants.id });
        saved.push({ id: row!.id, title: v.title });
      }
    }

    // Collections membership.
    const current = await tx.select({ collectionId: productCollections.collectionId }).from(productCollections).where(eq(productCollections.productId, id));
    const currentIds = new Set(current.map((c) => c.collectionId));
    const toRemove = [...currentIds].filter((c) => !collectionIds.includes(c));
    const toAdd = collectionIds.filter((c) => !currentIds.has(c));
    if (toRemove.length) await tx.delete(productCollections).where(and(eq(productCollections.productId, id), inArray(productCollections.collectionId, toRemove)));
    for (const cid of toAdd) {
      const [m] = await tx
        .select({ max: sql<number>`coalesce(max(${productCollections.position}), -1)` })
        .from(productCollections)
        .where(eq(productCollections.collectionId, cid));
      await tx.insert(productCollections).values({ productId: id, collectionId: cid, position: Number(m?.max ?? -1) + 1 });
    }
    return { id, slug, variants: saved };
  });

  await audit(ctx, isNew ? "product.create" : "product.update", result.id, { title: input.title });
  revalidateProducts(result.id);
  return result;
});

export const deleteProducts = action(z.object({ ids: uuids }), { permission: "products.manage" }, async ({ ids }, ctx) => {
  const rows = await db
    .delete(products)
    .where(and(eq(products.storeId, ctx.store.id), inArray(products.id, ids)))
    .returning({ id: products.id });
  await audit(ctx, "product.delete", undefined, { ids: rows.map((r) => r.id) });
  revalidateProducts();
  return { count: rows.length };
});

export const setProductsStatus = action(z.object({ ids: uuids, status: z.enum(PRODUCT_STATUSES) }), { permission: "products.manage" }, async ({ ids, status }, ctx) => {
  const rows = await db
    .update(products)
    .set({ status })
    .where(and(eq(products.storeId, ctx.store.id), inArray(products.id, ids)))
    .returning({ id: products.id });
  await audit(ctx, "product.status", undefined, { ids, status });
  revalidateProducts();
  return { count: rows.length };
});

export const addProductsToCollection = action(z.object({ ids: uuids, collectionId: uuid }), { permission: "products.manage" }, async ({ ids, collectionId }, ctx) => {
  const col = await db.query.collections.findFirst({ where: and(eq(collections.id, collectionId), eq(collections.storeId, ctx.store.id)), columns: { id: true, title: true } });
  if (!col) throw new ActionError("Collection not found.");
  const owned = (await db.select({ id: products.id }).from(products).where(and(eq(products.storeId, ctx.store.id), inArray(products.id, ids)))).map((p) => p.id);
  if (!owned.length) return { count: 0, title: col.title };
  const already = new Set(
    (
      await db
        .select({ productId: productCollections.productId })
        .from(productCollections)
        .where(and(eq(productCollections.collectionId, collectionId), inArray(productCollections.productId, owned)))
    ).map((r) => r.productId),
  );
  const add = owned.filter((id) => !already.has(id));
  if (add.length) {
    const [m] = await db
      .select({ max: sql<number>`coalesce(max(${productCollections.position}), -1)` })
      .from(productCollections)
      .where(eq(productCollections.collectionId, collectionId));
    const start = Number(m?.max ?? -1) + 1;
    await db.insert(productCollections).values(add.map((productId, i) => ({ productId, collectionId, position: start + i })));
  }
  revalidateProducts();
  revalidatePath(`/products/collections/${collectionId}`);
  return { count: add.length, title: col.title };
});

export const duplicateProduct = action(z.object({ id: uuid }), { permission: "products.manage" }, async ({ id }, ctx) => {
  const storeId = ctx.store.id;
  const src = await db.query.products.findFirst({ where: and(eq(products.id, id), eq(products.storeId, storeId)) });
  if (!src) throw new ActionError("Product not found.");
  await assertProductCapacity(ctx.store, 1);
  const newId = await db.transaction(async (tx) => {
    const title = `${src.title} (Copy)`;
    const slug = await uniqueProductSlug(storeId, `${src.slug}-copy`, null, tx);
    const { id: _id, createdAt: _c, updatedAt: _u, ratingAvg: _ra, ratingCount: _rc, salesCount: _sc, ...rest } = src;
    const [row] = await tx
      .insert(products)
      .values({ ...rest, title, slug, status: "draft", storeId })
      .returning({ id: products.id });
    const vs = await tx
      .select()
      .from(productVariants)
      .where(and(eq(productVariants.productId, id), eq(productVariants.storeId, storeId)));
    if (vs.length)
      await tx.insert(productVariants).values(vs.map(({ id: _vid, productId: _p, ...v }) => ({ ...v, productId: row!.id, storeId })));
    const pcs = await tx.select().from(productCollections).where(eq(productCollections.productId, id));
    if (pcs.length) await tx.insert(productCollections).values(pcs.map((pc) => ({ ...pc, productId: row!.id })));
    return row!.id;
  });
  await audit(ctx, "product.duplicate", newId, { from: id });
  revalidateProducts();
  return { id: newId };
});

export const aiProductDescription = action(
  z.object({ title: z.string().trim().min(1, "Add a product title first").max(255), language: z.enum(["en", "bn"]), tone: z.string().max(60).optional(), keywords: z.string().max(300).optional() }),
  { permission: "products.manage" },
  async (input) => {
    const html = await generateProductDescription({ title: input.title, language: input.language, tone: input.tone || undefined, keywords: input.keywords || undefined });
    return { html: sanitizeHtml(html.replace(/^```html\s*|```$/g, "").trim()) };
  },
);

export const aiProductSeo = action(z.object({ title: z.string().trim().min(1, "Add a product title first").max(255), description: z.string().max(100_000).optional() }), { permission: "products.manage" }, async (input) => {
  const r = await generateSeo({ title: input.title, description: stripHtml(input.description) });
  return { title: String(r.title ?? "").slice(0, 70), description: String(r.description ?? "").slice(0, 170) };
});

/** Suggest a unique handle (for the SEO card). */
export const suggestProductSlug = action(z.object({ text: z.string().max(255), id: uuid.optional() }), { permission: "products.view" }, async ({ text, id }, ctx) => {
  return { slug: await uniqueProductSlug(ctx.store.id, slugify(text || "product"), id) };
});
