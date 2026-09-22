import { serializeCollectionsForApi } from "@pai/core/webhooks";
import { and, asc, collections, count, db, eq, ilike, or, type SQL } from "@pai/db";
import { z } from "zod";
import { apiRoute, paginated, paginationQuery, parseQuery } from "@/lib/api-v1/http";

const listQuery = z.object({
  ...paginationQuery,
  published: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
  q: z.string().trim().min(1).max(200).optional(),
});

export const GET = apiRoute("products:read", async ({ req, store }) => {
  const q = parseQuery(req, listQuery);
  const where: SQL[] = [eq(collections.storeId, store.id)];
  if (q.published !== undefined) where.push(eq(collections.published, q.published));
  if (q.q) {
    const pat = `%${q.q.replace(/[\\%_]/g, (c) => "\\" + c)}%`;
    where.push(or(ilike(collections.title, pat), ilike(collections.slug, pat))!);
  }
  const cond = and(...where);
  const [rows, [{ total }]] = (await Promise.all([
    db.select().from(collections).where(cond).orderBy(asc(collections.position), asc(collections.title)).limit(q.limit).offset((q.page - 1) * q.limit),
    db.select({ total: count() }).from(collections).where(cond),
  ])) as [(typeof collections.$inferSelect)[], [{ total: number }]];
  return paginated(await serializeCollectionsForApi(rows), { page: q.page, limit: q.limit, total });
});
