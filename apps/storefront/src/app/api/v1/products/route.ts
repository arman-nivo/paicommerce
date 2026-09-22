import { serializeProductForApi, serializeProductsForApi } from "@pai/core/webhooks";
import { and, count, db, desc, eq, exists, gt, ilike, or, productCollections, products, productVariants, sql, type SQL } from "@pai/db";
import { z } from "zod";
import { findCollection, productCreateSchema, resolveCollectionIds, setProductCollections, uniqueProductSlug } from "@/lib/api-v1/catalog";
import { ApiError, apiRoute, conflict, fireWebhook, isoDate, ok, paginated, paginationQuery, parseBody, parseQuery, revalidateStore } from "@/lib/api-v1/http";

const listQuery = z.object({
  ...paginationQuery,
  status: z.enum(["draft", "active", "archived"]).optional(),
  collection: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).max(200).optional(),
  updated_since: isoDate.optional(),
});

export const GET = apiRoute("products:read", async ({ req, store }) => {
  const q = parseQuery(req, listQuery);
  const where: SQL[] = [eq(products.storeId, store.id)];
  if (q.status) where.push(eq(products.status, q.status));
  if (q.updated_since) where.push(gt(products.updatedAt, q.updated_since));
  if (q.collection) {
    const col = await findCollection(store.id, q.collection);
    if (!col) return paginated([], { page: q.page, limit: q.limit, total: 0 });
    where.push(exists(db.select({ one: sql`1` }).from(productCollections).where(and(eq(productCollections.productId, products.id), eq(productCollections.collectionId, col.id)))));
  }
  if (q.q) {
    const pat = `%${q.q.replace(/[\\%_]/g, (c) => "\\" + c)}%`;
    where.push(
      or(
        ilike(products.title, pat),
        ilike(products.sku, pat),
        sql`exists (select 1 from unnest(${products.tags}) t where t ilike ${pat})`,
        exists(db.select({ one: sql`1` }).from(productVariants).where(and(eq(productVariants.productId, products.id), ilike(productVariants.sku, pat)))),
      )!,
    );
  }
  const cond = and(...where);
  const [rows, [{ total }]] = (await Promise.all([
    db.select().from(products).where(cond).orderBy(desc(products.createdAt), desc(products.id)).limit(q.limit).offset((q.page - 1) * q.limit),
    db.select({ total: count() }).from(products).where(cond),
  ])) as [(typeof products.$inferSelect)[], [{ total: number }]];
  return paginated(await serializeProductsForApi(rows, { currency: store.currency }), { page: q.page, limit: q.limit, total });
});

export const POST = apiRoute("products:write", async ({ req, store, plan }) => {
  const body = await parseBody(req, productCreateSchema);

  const maxProducts = plan?.limits?.products;
  if (maxProducts != null) {
    const [{ n }] = (await db.select({ n: count() }).from(products).where(eq(products.storeId, store.id))) as [{ n: number }];
    if (n >= maxProducts) throw new ApiError(403, "plan_required", `Your plan allows up to ${maxProducts} products. Upgrade to add more.`);
  }

  if (body.slug) {
    const clash = await db.query.products.findFirst({ where: and(eq(products.storeId, store.id), eq(products.slug, body.slug)), columns: { id: true } });
    if (clash) throw conflict("A product with this slug already exists", { slug: "Already in use" });
  }
  const slug = body.slug ?? (await uniqueProductSlug(store.id, body.title));
  const collectionIds = body.collections ? await resolveCollectionIds(store.id, body.collections) : [];

  // Variants: derive titles and (if absent) the product option list from variant options.
  const variants = (body.variants ?? []).map((v, i) => ({
    title: v.title ?? (Object.values(v.options ?? {}).join(" / ") || `Variant ${i + 1}`),
    options: v.options ?? {},
    price: v.price ?? body.price,
    compareAtPrice: v.compareAtPrice === undefined ? (body.compareAtPrice ?? null) : v.compareAtPrice,
    sku: v.sku ?? null,
    inventory: v.inventory ?? 0,
    imageUrl: v.imageUrl ?? null,
    position: v.position ?? i,
  }));
  let options = body.options ?? [];
  if (!options.length && variants.length) {
    const names = new Map<string, string[]>();
    for (const v of variants) for (const [k, val] of Object.entries(v.options)) {
      const arr = names.get(k) ?? [];
      if (!arr.includes(val)) arr.push(val);
      names.set(k, arr);
    }
    options = [...names].map(([name, values]) => ({ name, values }));
  }

  const created = await db.transaction(async (tx) => {
    const [p] = await tx
      .insert(products)
      .values({
        storeId: store.id,
        title: body.title,
        slug,
        description: body.description ?? null,
        status: body.status ?? "active",
        vendor: body.vendor ?? null,
        productType: body.productType ?? null,
        tags: body.tags ?? [],
        images: body.images ?? [],
        price: body.price,
        compareAtPrice: body.compareAtPrice ?? null,
        costPrice: body.costPrice ?? null,
        sku: body.sku ?? null,
        barcode: body.barcode ?? null,
        trackInventory: body.trackInventory ?? true,
        inventory: variants.length ? variants.reduce((s, v) => s + v.inventory, 0) : (body.inventory ?? 0),
        allowBackorder: body.allowBackorder ?? false,
        weightGrams: body.weightGrams ?? null,
        options,
        seo: body.seo ?? null,
        featured: body.featured ?? false,
      })
      .returning();
    if (variants.length) await tx.insert(productVariants).values(variants.map((v) => ({ ...v, productId: p!.id, storeId: store.id })));
    return p!;
  });
  if (collectionIds.length) await setProductCollections(created.id, collectionIds);

  const data = await serializeProductForApi(created.id, store.id);
  revalidateStore(store.id);
  fireWebhook(store.id, "product.updated", async () => data);
  return ok(data, 201);
});
