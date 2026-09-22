/** Product/collection helpers for the REST API. Every query is scoped by `storeId`. */
import { slugify } from "@pai/core";
import { and, collections, db, eq, inArray, like, or, productCollections, products, productVariants, sql, type Collection, type Product } from "@pai/db";
import { z } from "zod";
import { invalid, isUuid } from "./http";

/* ─────────────────────────── schemas ─────────────────────────── */

const money = z.number({ message: "Must be an integer amount in minor units" }).int("Must be an integer amount in minor units").min(0, "Must be 0 or more");
const optText = (max: number) => z.string().trim().max(max).nullable().optional();

export const imageInput = z
  .union([z.url("Must be a valid URL"), z.object({ url: z.url("Must be a valid URL"), alt: z.string().trim().max(300).optional() })])
  .transform((i) => (typeof i === "string" ? { url: i } : i.alt ? { url: i.url, alt: i.alt } : { url: i.url }));

export const variantInput = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  options: z.record(z.string().trim().min(1).max(60), z.string().trim().min(1).max(120)).optional(),
  price: money.optional(),
  compareAtPrice: money.nullable().optional(),
  sku: optText(100),
  inventory: z.number().int().min(-1_000_000).max(10_000_000).optional(),
  imageUrl: z.url().nullable().optional(),
  position: z.number().int().min(0).optional(),
});

const productFields = {
  title: z.string().trim().min(1, "Title is required").max(255),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9ঀ-৿]+(?:-[a-z0-9ঀ-৿]+)*$/, "Use lowercase letters, numbers and dashes"),
  description: optText(100_000),
  status: z.enum(["draft", "active", "archived"]),
  price: money,
  compareAtPrice: money.nullable(),
  costPrice: money.nullable(),
  sku: optText(100),
  barcode: optText(100),
  trackInventory: z.boolean(),
  inventory: z.number().int().min(-1_000_000).max(10_000_000),
  allowBackorder: z.boolean(),
  weightGrams: z.number().int().min(0).max(1_000_000).nullable(),
  vendor: optText(120),
  productType: optText(120),
  featured: z.boolean(),
  tags: z.array(z.string().trim().min(1).max(60)).max(50),
  images: z.array(imageInput).max(30),
  options: z.array(z.object({ name: z.string().trim().min(1).max(60), values: z.array(z.string().trim().min(1).max(120)).min(1).max(100) })).max(3),
  seo: z.object({ title: z.string().trim().max(120).optional(), description: z.string().trim().max(320).optional() }).nullable(),
  /** Collection ids or slugs (replaces the product's collections). */
  collections: z.array(z.string().trim().min(1)).max(50),
};

export const productCreateSchema = z.object({
  ...productFields,
  slug: productFields.slug.optional(),
  price: productFields.price,
  status: productFields.status.optional(),
  compareAtPrice: productFields.compareAtPrice.optional(),
  costPrice: productFields.costPrice.optional(),
  trackInventory: productFields.trackInventory.optional(),
  inventory: productFields.inventory.optional(),
  allowBackorder: productFields.allowBackorder.optional(),
  weightGrams: productFields.weightGrams.optional(),
  featured: productFields.featured.optional(),
  tags: productFields.tags.optional(),
  images: productFields.images.optional(),
  options: productFields.options.optional(),
  seo: productFields.seo.optional(),
  collections: productFields.collections.optional(),
  variants: z.array(variantInput).max(100).optional(),
});

export const productUpdateSchema = z
  .object(productFields)
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Provide at least one field to update");

export const variantUpdateSchema = variantInput
  .extend({ inventoryAdjustment: z.number().int().min(-1_000_000).max(1_000_000).optional() })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Provide at least one field to update")
  .refine((v) => !(v.inventory !== undefined && v.inventoryAdjustment !== undefined), { message: "Send either inventory or inventoryAdjustment, not both", path: ["inventoryAdjustment"] });

/* ─────────────────────────── lookups ─────────────────────────── */

export async function findProduct(storeId: string, idOrSlug: string): Promise<Product | undefined> {
  const key = decodeURIComponent(idOrSlug);
  return db.query.products.findFirst({
    where: and(eq(products.storeId, storeId), isUuid(key) ? eq(products.id, key) : eq(products.slug, key.toLowerCase())),
  });
}

export async function findCollection(storeId: string, idOrSlug: string): Promise<Collection | undefined> {
  const key = decodeURIComponent(idOrSlug);
  return db.query.collections.findFirst({
    where: and(eq(collections.storeId, storeId), isUuid(key) ? eq(collections.id, key) : eq(collections.slug, key.toLowerCase())),
  });
}

/** Resolve a free-form slug to one that's unique in the store (`tee`, `tee-2`, …). */
export async function uniqueProductSlug(storeId: string, wanted: string, excludeId?: string): Promise<string> {
  const base = slugify(wanted);
  const rows = await db
    .select({ slug: products.slug, id: products.id })
    .from(products)
    .where(and(eq(products.storeId, storeId), or(eq(products.slug, base), like(products.slug, `${base}-%`))));
  const taken = new Set(rows.filter((r) => r.id !== excludeId).map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 10_000; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
  return `${base}-${Date.now()}`;
}

/** Map collection ids/slugs to ids in this store; unknown refs → 400. */
export async function resolveCollectionIds(storeId: string, refs: string[]): Promise<string[]> {
  if (!refs.length) return [];
  const ids = refs.filter(isUuid);
  const slugs = refs.filter((r) => !isUuid(r)).map((r) => r.toLowerCase());
  const conds = [];
  if (ids.length) conds.push(inArray(collections.id, ids));
  if (slugs.length) conds.push(inArray(collections.slug, slugs));
  const rows = await db
    .select({ id: collections.id, slug: collections.slug })
    .from(collections)
    .where(and(eq(collections.storeId, storeId), or(...conds)));
  const details: Record<string, string> = {};
  refs.forEach((r, i) => {
    if (!rows.some((c) => c.id === r || c.slug === r.toLowerCase())) details[`collections.${i}`] = "Collection not found";
  });
  if (Object.keys(details).length) throw invalid("Unknown collection", details);
  return [...new Set(refs.map((r) => rows.find((c) => c.id === r || c.slug === r.toLowerCase())!.id))];
}

/** Replace a product's collection memberships (appending at the end of each collection). */
export async function setProductCollections(productId: string, collectionIds: string[]) {
  await db.transaction(async (tx) => {
    await tx.delete(productCollections).where(eq(productCollections.productId, productId));
    for (const cid of collectionIds) {
      const [{ pos }] = (await tx
        .select({ pos: sql<number>`coalesce(max(${productCollections.position}) + 1, 0)::int` })
        .from(productCollections)
        .where(eq(productCollections.collectionId, cid))) as [{ pos: number }];
      await tx.insert(productCollections).values({ productId, collectionId: cid, position: pos });
    }
  });
}

/** Keep `products.inventory` equal to the sum of its variants (when it has any). */
export async function syncProductInventory(productId: string) {
  await db.execute(sql`
    update ${products} set inventory = s.total
    from (select coalesce(sum(${productVariants.inventory}), 0)::int as total, count(*) as n from ${productVariants} where ${productVariants.productId} = ${productId}) s
    where ${products.id} = ${productId} and s.n > 0`);
}
