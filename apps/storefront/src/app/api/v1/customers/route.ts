import { normalizePhone } from "@pai/core";
import { serializeCustomerForApi, serializeCustomersForApi } from "@pai/core/webhooks";
import { and, count, customers, db, desc, eq, gt, ilike, or, type SQL } from "@pai/db";
import { z } from "zod";
import { apiRoute, conflict, fireWebhook, invalid, isoDate, ok, paginated, paginationQuery, parseBody, parseQuery } from "@/lib/api-v1/http";
import { addressInput, toAddress } from "@/lib/api-v1/orders";

const listQuery = z.object({
  ...paginationQuery,
  q: z.string().trim().min(1).max(200).optional(),
  created_since: isoDate.optional(),
  updated_since: isoDate.optional(),
});

export const GET = apiRoute("customers:read", async ({ req, store }) => {
  const q = parseQuery(req, listQuery);
  const where: SQL[] = [eq(customers.storeId, store.id)];
  if (q.created_since) where.push(gt(customers.createdAt, q.created_since));
  if (q.updated_since) where.push(gt(customers.updatedAt, q.updated_since));
  if (q.q) {
    const pat = `%${q.q.replace(/[\\%_]/g, (c) => "\\" + c)}%`;
    const phone = normalizePhone(q.q);
    const conds: SQL[] = [ilike(customers.name, pat), ilike(customers.email, pat)];
    if (/\d{3,}/.test(phone)) conds.push(ilike(customers.phone, `%${phone}%`));
    where.push(or(...conds)!);
  }
  const cond = and(...where);
  const [rows, [{ total }]] = (await Promise.all([
    db.select().from(customers).where(cond).orderBy(desc(customers.createdAt), desc(customers.id)).limit(q.limit).offset((q.page - 1) * q.limit),
    db.select({ total: count() }).from(customers).where(cond),
  ])) as [(typeof customers.$inferSelect)[], [{ total: number }]];
  return paginated(await serializeCustomersForApi(rows, { currency: store.currency }), { page: q.page, limit: q.limit, total });
});

const createSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(120),
    phone: z.string().trim().min(5, "Invalid phone number").max(40).nullable().optional(),
    email: z.email("Invalid email").max(200).nullable().optional(),
    addresses: z.array(addressInput).max(10).optional(),
    tags: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
    note: z.string().trim().max(5000).nullable().optional(),
    acceptsMarketing: z.boolean().optional(),
  })
  .strict();

export const POST = apiRoute("customers:write", async ({ req, store }) => {
  const body = await parseBody(req, createSchema);
  const phone = normalizePhone(body.phone) || null;
  const email = body.email?.trim().toLowerCase() || null;
  if (body.phone && !/^\+?\d{6,15}$/.test(phone ?? "")) throw invalid("Invalid request body", { phone: "Invalid phone number" });

  if (phone || email) {
    const conds: SQL[] = [];
    if (phone) conds.push(eq(customers.phone, phone));
    if (email) conds.push(eq(customers.email, email));
    const dupe = await db.query.customers.findFirst({ where: and(eq(customers.storeId, store.id), or(...conds)), columns: { id: true, phone: true } });
    if (dupe) {
      const field = phone && dupe.phone === phone ? "phone" : "email";
      throw conflict(`A customer with this ${field} already exists`, { [field]: "Already in use", id: dupe.id });
    }
  }

  const [c] = await db
    .insert(customers)
    .values({
      storeId: store.id,
      name: body.name,
      phone,
      email,
      addresses: (body.addresses ?? []).map(toAddress),
      tags: [...new Set(body.tags ?? [])],
      note: body.note ?? null,
      acceptsMarketing: body.acceptsMarketing ?? false,
    })
    .returning();

  const data = await serializeCustomerForApi(c!);
  fireWebhook(store.id, "customer.created", async () => data);
  return ok(data, 201);
});
