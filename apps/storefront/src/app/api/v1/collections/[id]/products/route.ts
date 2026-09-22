import { serializeProductsForApi } from "@pai/core/webhooks";
import { and, asc, count, db, desc, eq, productCollections, products, type SQL } from "@pai/db";
import { z } from "zod";
import { findCollection } from "@/lib/api-v1/catalog";
import { apiRoute, notFound, paginated, paginationQuery, parseQuery } from "@/lib/api-v1/http";

const listQuery = z.object({
  ...paginationQuery,
  status: z.enum(["draft", "active", "archived"]).optional(),
});

/** Products in a collection, in the collection's configured sort order. */
export const GET = apiRoute<{ id: string }>("products:read", async ({ req, params, store }) => {
  const q = parseQuery(req, listQuery);
  const col = await findCollection(store.id, params.id);
  if (!col) throw notFound("Collection");

  const where: SQL[] = [eq(products.storeId, store.id), eq(productCollections.collectionId, col.id)];
  if (q.status) where.push(eq(products.status, q.status));
  const cond = and(...where);
  const order =
    col.sortOrder === "newest"
      ? [desc(products.createdAt)]
      : col.sortOrder === "price-asc"
        ? [asc(products.price)]
        : col.sortOrder === "price-desc"
          ? [desc(products.price)]
          : col.sortOrder === "best-selling"
            ? [desc(products.salesCount)]
            : [asc(productCollections.position), desc(products.createdAt)];

  const [rows, [{ total }]] = (await Promise.all([
    db
      .select({ p: products })
      .from(products)
      .innerJoin(productCollections, eq(productCollections.productId, products.id))
      .where(cond)
      .orderBy(...order, asc(products.id))
      .limit(q.limit)
      .offset((q.page - 1) * q.limit),
    db.select({ total: count() }).from(products).innerJoin(productCollections, eq(productCollections.productId, products.id)).where(cond),
  ])) as [{ p: typeof products.$inferSelect }[], [{ total: number }]];
  return paginated(await serializeProductsForApi(rows.map((r) => r.p), { currency: store.currency }), { page: q.page, limit: q.limit, total });
});
