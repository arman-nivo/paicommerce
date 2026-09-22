import { and, asc, count, db, desc, eq, gte, ilike, leads, lte, or, type SQL } from "@pai/db";
import { dateParam, escapeLike, listParams, str, type SearchParams } from "@/lib/params";

export const LEAD_SOURCES = ["contact", "demo", "enterprise", "newsletter"] as const;

export async function queryLeads(params: SearchParams, all = false) {
  const { page, size, offset, sort, dir } = listParams(params, ["created", "name", "company"] as const, "created");
  const conds: SQL[] = [];
  const q = str(params, "q");
  if (q) {
    const like = `%${escapeLike(q)}%`;
    conds.push(or(ilike(leads.name, like), ilike(leads.email, like), ilike(leads.company, like), ilike(leads.phone, like), ilike(leads.message, like))!);
  }
  const source = str(params, "source");
  if (source) conds.push(eq(leads.source, source));
  const from = dateParam(params, "from");
  const to = dateParam(params, "to", true);
  if (from) conds.push(gte(leads.createdAt, from));
  if (to) conds.push(lte(leads.createdAt, to));
  const where = conds.length ? and(...conds) : undefined;
  const d = dir === "asc" ? asc : desc;
  const orderBy = { created: d(leads.createdAt), name: d(leads.name), company: d(leads.company) }[sort];
  const base = db.select().from(leads).where(where).orderBy(orderBy);
  const rows = all ? await base.limit(50_000) : await base.limit(size).offset(offset);
  const [{ n }] = await db.select({ n: count() }).from(leads).where(where);
  return { rows, total: n, page, size, sort, dir };
}
