/**
 * Server-side StorefrontDataAPI over Drizzle. Tenant-scoped (every query filters by storeId),
 * batched (variants loaded in one query per product list) and memoised per request.
 */
import { cache } from "react";
import {
  and,
  asc,
  blogPosts,
  collections,
  count,
  db,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  menus,
  or,
  pages,
  productCollections,
  productReviews,
  products,
  productVariants,
  sql,
  type MenuItem,
  type Product,
  type ProductVariant,
  type SQL,
} from "@pai/db";
import type { Paginated, ProductQuery, SfCollection, SfMenuItem, SfPage, SfPost, SfProduct, SfReview, StorefrontDataAPI } from "@pai/theme-sdk";
import { siteUrl, type Site } from "./site";

type Ctx = { storeId: string; base: string; path: string };

/* ─────────────────────────── mappers ─────────────────────────── */

export function toSfProduct(p: Product, variants: ProductVariant[], ctx: Pick<Ctx, "base">): SfProduct {
  const untracked = !p.trackInventory || p.allowBackorder;
  const vs = [...variants].sort((a, b) => a.position - b.position);
  const sfVariants = vs.map((v) => ({
    id: v.id,
    title: v.title,
    options: v.options ?? {},
    price: v.price,
    compareAtPrice: v.compareAtPrice,
    available: untracked || v.inventory > 0,
    inventory: untracked ? 999 : Math.max(0, v.inventory),
    imageUrl: v.imageUrl,
    sku: v.sku,
  }));
  const prices = sfVariants.length ? sfVariants.map((v) => v.price) : [p.price];
  const priceMin = Math.min(...prices);
  const priceMax = Math.max(...prices);
  // Card price: the cheapest variant (with its compare-at) or the product price.
  const cheapest = sfVariants.length ? sfVariants.reduce((a, b) => (b.price < a.price ? b : a)) : null;
  const price = cheapest ? cheapest.price : p.price;
  const compareAtPrice = cheapest ? cheapest.compareAtPrice ?? p.compareAtPrice : p.compareAtPrice;
  const inventory = untracked ? 999 : sfVariants.length ? sfVariants.reduce((s, v) => s + v.inventory, 0) : Math.max(0, p.inventory);
  const images = (p.images ?? []).filter((i) => i?.url).map((i) => ({ url: i.url, alt: i.alt || p.title }));
  const options = (p.options ?? []).filter((o) => o.name && o.values?.length);
  return {
    id: p.id,
    slug: p.slug,
    url: siteUrl(ctx, `/products/${p.slug}`),
    title: p.title,
    description: p.description ?? "",
    vendor: p.vendor,
    productType: p.productType,
    tags: p.tags ?? [],
    images,
    featuredImage: images[0] ?? null,
    price,
    compareAtPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : null,
    priceMin,
    priceMax,
    onSale: !!compareAtPrice && compareAtPrice > price,
    available: untracked || (sfVariants.length ? sfVariants.some((v) => v.available) : p.inventory > 0),
    inventory,
    options: sfVariants.length ? options : [],
    variants: sfVariants,
    rating: { average: Math.round((p.ratingAvg ?? 0) * 10) / 10, count: p.ratingCount ?? 0 },
    createdAt: (p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt)).toISOString(),
  };
}

async function withVariants(storeId: string, rows: Product[], ctx: Pick<Ctx, "base">): Promise<SfProduct[]> {
  if (!rows.length) return [];
  const vars = await db
    .select()
    .from(productVariants)
    .where(and(eq(productVariants.storeId, storeId), inArray(productVariants.productId, rows.map((r) => r.id))));
  const byProduct = new Map<string, ProductVariant[]>();
  for (const v of vars) byProduct.set(v.productId, [...(byProduct.get(v.productId) ?? []), v]);
  return rows.map((r) => toSfProduct(r, byProduct.get(r.id) ?? [], ctx));
}

function mapMenu(items: MenuItem[], ctx: Ctx): SfMenuItem[] {
  return (items ?? []).map((i) => {
    const url = /^(https?:|mailto:|tel:|#)/.test(i.url) ? i.url : siteUrl(ctx, i.url || "/");
    const rel = i.url?.split("?")[0] ?? "";
    return {
      id: i.id,
      label: i.label,
      url,
      active: rel === ctx.path || (rel !== "/" && rel.length > 1 && ctx.path.startsWith(rel + "/")),
      children: i.children?.length ? mapMenu(i.children, ctx) : undefined,
    };
  });
}

type CollectionRow = typeof collections.$inferSelect;

function toSfCollection(c: CollectionRow, productsCount: number, ctx: Ctx): SfCollection {
  return {
    id: c.id,
    slug: c.slug,
    url: siteUrl(ctx, `/collections/${c.slug}`),
    title: c.title,
    description: c.description,
    image: c.imageUrl ? { url: c.imageUrl, alt: c.title } : null,
    productsCount,
  };
}

function toSfPost(p: typeof blogPosts.$inferSelect, ctx: Ctx): SfPost {
  return {
    id: p.id,
    slug: p.slug,
    url: siteUrl(ctx, `/blog/${p.slug}`),
    title: p.title,
    excerpt: p.excerpt,
    content: p.content ?? "",
    coverUrl: p.coverUrl,
    author: p.author,
    tags: p.tags ?? [],
    publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : null,
  };
}

/* ─────────────────────────── product queries ─────────────────────────── */

// Correlated subquery: the outer column must be table-qualified, because drizzle renders
// `collections.id` as a bare "id", which would bind to `p.id` inside the subquery.
const activeCount = (collectionId: SQL | typeof collections.id) =>
  sql<number>`(select count(*)::int from ${productCollections} pc join ${products} p on p.id = pc.product_id where pc.collection_id = ${
    collectionId === collections.id ? sql.raw(`"collections"."id"`) : collectionId
  } and p.status = 'active')`;

export async function queryProducts(ctx: Ctx, q: ProductQuery = {}): Promise<Paginated<SfProduct>> {
  const pageSize = Math.max(1, Math.min(100, q.limit ?? 24));
  const page = Math.max(1, q.page ?? 1);
  const conds: SQL[] = [eq(products.storeId, ctx.storeId), eq(products.status, "active")];
  let collectionId: string | null = null;
  let collectionSort: string | null = null;
  if (q.collection && q.collection !== "all") {
    const [c] = await db
      .select({ id: collections.id, sortOrder: collections.sortOrder })
      .from(collections)
      .where(and(eq(collections.storeId, ctx.storeId), eq(collections.slug, q.collection), eq(collections.published, true)))
      .limit(1);
    if (!c) return { items: [], total: 0, page, pageSize, pageCount: 0 };
    collectionId = c.id;
    collectionSort = c.sortOrder;
  }
  if (q.ids?.length) conds.push(inArray(products.id, q.ids));
  if (q.slugs?.length) conds.push(inArray(products.slug, q.slugs));
  if (q.featured) conds.push(eq(products.featured, true));
  if (q.tag) conds.push(sql`${q.tag} = any(${products.tags})`);
  if (q.minPrice != null) conds.push(gte(products.price, q.minPrice));
  if (q.maxPrice != null) conds.push(lte(products.price, q.maxPrice));
  if (q.inStock) {
    conds.push(
      or(
        eq(products.trackInventory, false),
        eq(products.allowBackorder, true),
        sql`${products.inventory} > 0`,
        sql`exists (select 1 from ${productVariants} v where v.product_id = ${products.id} and v.inventory > 0)`,
      )!,
    );
  }
  if (q.query?.trim()) {
    const term = `%${q.query.trim().replace(/[%_]/g, "\\$&")}%`;
    conds.push(
      or(ilike(products.title, term), ilike(products.vendor, term), ilike(products.productType, term), sql`array_to_string(${products.tags}, ' ') ilike ${term}`, ilike(products.sku, term))!,
    );
  }
  if (collectionId) conds.push(eq(productCollections.collectionId, collectionId));

  const sort = q.sort ?? (collectionSort as ProductQuery["sort"]) ?? "manual";
  const order: SQL[] = (() => {
    switch (sort) {
      case "newest":
        return [desc(products.createdAt)];
      case "price-asc":
        return [asc(products.price), desc(products.createdAt)];
      case "price-desc":
        return [desc(products.price), desc(products.createdAt)];
      case "best-selling":
        return [desc(products.salesCount), desc(products.createdAt)];
      case "rating":
        return [desc(products.ratingAvg), desc(products.ratingCount)];
      case "title":
        return [asc(products.title)];
      default:
        return collectionId ? [asc(productCollections.position), desc(products.createdAt)] : [desc(products.featured), desc(products.createdAt)];
    }
  })();

  const where = and(...conds);
  const base = db.select({ p: products }).from(products);
  const countBase = db.select({ n: count() }).from(products);
  const [rows, [{ n }]] = await Promise.all([
    (collectionId ? base.innerJoin(productCollections, eq(productCollections.productId, products.id)) : base)
      .where(where)
      .orderBy(...order)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    (collectionId ? countBase.innerJoin(productCollections, eq(productCollections.productId, products.id)) : countBase).where(where) as Promise<{ n: number }[]>,
  ]);
  const items = await withVariants(ctx.storeId, rows.map((r) => r.p), ctx);
  return { items, total: Number(n), page, pageSize, pageCount: Math.ceil(Number(n) / pageSize) };
}

/* ─────────────────────────── API factory ─────────────────────────── */

export type StorefrontData = StorefrontDataAPI & {
  getPage(slug: string): Promise<(SfPage & { seo: { title?: string; description?: string; image?: string } | null }) | null>;
  getPost(slug: string): Promise<(SfPost & { seo: { title?: string; description?: string; image?: string } | null }) | null>;
  getProductSeo(slug: string): Promise<{ title?: string; description?: string; image?: string } | null>;
  getCollectionSeo(slug: string): Promise<{ title?: string; description?: string; image?: string } | null>;
};

function memo<A extends unknown[], R>(fn: (...a: A) => Promise<R>): (...a: A) => Promise<R> {
  const m = new Map<string, Promise<R>>();
  return (...a: A) => {
    const k = JSON.stringify(a);
    if (!m.has(k)) m.set(k, fn(...a));
    return m.get(k)!;
  };
}

/** Build the data API for a site + current path. Memoised per request. */
export const getDataApi = cache((storeId: string, base: string, path: string): StorefrontData => createDataApi({ storeId, base, path }));

export function dataFor(site: Site, path: string): StorefrontData {
  return getDataApi(site.store.id, site.base, path);
}

export function createDataApi(ctx: Ctx): StorefrontData {
  const getProductRow = memo(async (slug: string) => {
    const [row] = await db
      .select()
      .from(products)
      .where(and(eq(products.storeId, ctx.storeId), eq(products.slug, slug), eq(products.status, "active")))
      .limit(1);
    return row ?? null;
  });
  const getCollectionRow = memo(async (slug: string) => {
    const [row] = await db
      .select({ c: collections, n: activeCount(collections.id) })
      .from(collections)
      .where(and(eq(collections.storeId, ctx.storeId), eq(collections.slug, slug), eq(collections.published, true)))
      .limit(1);
    return row ?? null;
  });

  const api: StorefrontData = {
    getProducts: memo((q?: ProductQuery) => queryProducts(ctx, q ?? {})),

    getProduct: memo(async (slug: string) => {
      const row = await getProductRow(slug);
      if (!row) return null;
      const [p] = await withVariants(ctx.storeId, [row], ctx);
      return p ?? null;
    }),

    getCollections: memo(async (opts?: { limit?: number; slugs?: string[] }) => {
      const conds = [eq(collections.storeId, ctx.storeId), eq(collections.published, true)];
      if (opts?.slugs?.length) conds.push(inArray(collections.slug, opts.slugs));
      const rows = await db
        .select({ c: collections, n: activeCount(collections.id) })
        .from(collections)
        .where(and(...conds))
        .orderBy(asc(collections.position), asc(collections.title))
        .limit(Math.min(200, opts?.limit ?? 100));
      return rows.map((r) => toSfCollection(r.c, Number(r.n), ctx));
    }),

    getCollection: memo(async (slug: string) => {
      if (slug === "all") {
        const [{ n }] = await db.select({ n: count() }).from(products).where(and(eq(products.storeId, ctx.storeId), eq(products.status, "active")));
        return { id: "all", slug: "all", url: siteUrl(ctx, "/collections/all"), title: "All products", description: null, image: null, productsCount: Number(n) };
      }
      const r = await getCollectionRow(slug);
      return r ? toSfCollection(r.c, Number(r.n), ctx) : null;
    }),

    getRelatedProducts: memo(async (productId: string, limit = 4) => {
      const [self] = await db.select().from(products).where(and(eq(products.storeId, ctx.storeId), eq(products.id, productId))).limit(1);
      if (!self) return [];
      const sameCollection = db
        .select({ id: productCollections.productId })
        .from(productCollections)
        .where(inArray(productCollections.collectionId, db.select({ id: productCollections.collectionId }).from(productCollections).where(eq(productCollections.productId, productId))));
      const rows = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.storeId, ctx.storeId),
            eq(products.status, "active"),
            sql`${products.id} <> ${productId}`,
            or(
              inArray(products.id, sameCollection),
              self.productType ? eq(products.productType, self.productType) : sql`false`,
              self.tags?.length ? sql`${products.tags} && ARRAY[${sql.join(self.tags.map((t) => sql`${t}`), sql`, `)}]::text[]` : sql`false`,
            ),
          ),
        )
        .orderBy(desc(products.salesCount), desc(products.createdAt))
        .limit(limit);
      let list = rows;
      if (list.length < limit) {
        const more = await db
          .select()
          .from(products)
          .where(and(eq(products.storeId, ctx.storeId), eq(products.status, "active"), sql`${products.id} <> ${productId}`))
          .orderBy(desc(products.salesCount))
          .limit(limit * 2);
        const seen = new Set(list.map((r) => r.id));
        list = [...list, ...more.filter((r) => !seen.has(r.id))].slice(0, limit);
      }
      return withVariants(ctx.storeId, list, ctx);
    }),

    getReviews: memo(async (productId: string, limit = 10): Promise<SfReview[]> => {
      const rows = await db
        .select()
        .from(productReviews)
        .where(and(eq(productReviews.storeId, ctx.storeId), eq(productReviews.productId, productId), eq(productReviews.approved, true)))
        .orderBy(desc(productReviews.createdAt))
        .limit(limit);
      return rows.map((r) => ({ id: r.id, customerName: r.customerName, rating: r.rating, title: r.title, body: r.body, createdAt: r.createdAt.toISOString() }));
    }),

    getPosts: memo(async (opts?: { limit?: number; page?: number }) => {
      const pageSize = Math.max(1, Math.min(50, opts?.limit ?? 12));
      const page = Math.max(1, opts?.page ?? 1);
      const where = and(eq(blogPosts.storeId, ctx.storeId), eq(blogPosts.published, true), sql`(${blogPosts.publishedAt} is null or ${blogPosts.publishedAt} <= now())`);
      const [rows, [{ n }]] = await Promise.all([
        db.select().from(blogPosts).where(where).orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt)).limit(pageSize).offset((page - 1) * pageSize),
        db.select({ n: count() }).from(blogPosts).where(where),
      ]);
      return { items: rows.map((p) => toSfPost(p, ctx)), total: Number(n), page, pageSize, pageCount: Math.ceil(Number(n) / pageSize) };
    }),

    getMenu: memo(async (handle: string) => {
      const [m] = await db.select().from(menus).where(and(eq(menus.storeId, ctx.storeId), eq(menus.handle, handle))).limit(1);
      return m ? mapMenu(m.items, ctx) : [];
    }),

    getPage: memo(async (slug: string) => {
      const [p] = await db.select().from(pages).where(and(eq(pages.storeId, ctx.storeId), eq(pages.slug, slug), eq(pages.published, true))).limit(1);
      return p ? { id: p.id, slug: p.slug, url: siteUrl(ctx, `/pages/${p.slug}`), title: p.title, content: p.content ?? "", seo: p.seo ?? null } : null;
    }),

    getPost: memo(async (slug: string) => {
      const [p] = await db.select().from(blogPosts).where(and(eq(blogPosts.storeId, ctx.storeId), eq(blogPosts.slug, slug), eq(blogPosts.published, true))).limit(1);
      return p ? { ...toSfPost(p, ctx), seo: p.seo ?? null } : null;
    }),

    getProductSeo: memo(async (slug: string) => (await getProductRow(slug))?.seo ?? null),
    getCollectionSeo: memo(async (slug: string) => (await getCollectionRow(slug))?.c.seo ?? null),
  };
  return api;
}
