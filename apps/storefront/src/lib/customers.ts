/** Customer upserts used by storefront forms (newsletter, contact, register). Always store-scoped. */
import { and, customers, db, eq, sql } from "@pai/db";

export async function findCustomerByEmail(storeId: string, email: string) {
  const [c] = await db.select().from(customers).where(and(eq(customers.storeId, storeId), sql`lower(${customers.email}) = ${email.toLowerCase()}`)).limit(1);
  return c ?? null;
}

export async function findCustomerByPhone(storeId: string, phone: string) {
  const [c] = await db.select().from(customers).where(and(eq(customers.storeId, storeId), eq(customers.phone, phone))).limit(1);
  return c ?? null;
}

/** Add a tag (deduplicated) and optionally append a timestamped line to the customer note. */
export async function tagCustomer(id: string, storeId: string, tag: string, noteLine?: string, extra: Partial<{ acceptsMarketing: boolean; phone: string }> = {}) {
  await db
    .update(customers)
    .set({
      tags: sql`(select array(select distinct unnest(array_append(${customers.tags}, ${tag}))))`,
      ...(noteLine ? { note: sql`trim(both from concat_ws(E'\n\n', ${customers.note}, ${noteLine}::text))` } : {}),
      ...extra,
    })
    .where(and(eq(customers.id, id), eq(customers.storeId, storeId)));
}
