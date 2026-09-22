import { normalizePhone } from "@pai/core";
import { and, asc, customers, desc, eq, gte, ilike, or, sql, type SQL } from "@pai/db";

export type CustomerFilters = {
  tab: string; // "" | repeat | new | blocked
  q: string;
  tag: string;
  marketing: string; // "" | yes | no
  sort: string; // "" (newest) | recent | spent | orders | name
};

export const CUSTOMER_SORTS = [
  { value: "recent", label: "Recent orders" },
  { value: "spent", label: "Top spenders" },
  { value: "orders", label: "Most orders" },
  { value: "name", label: "Name (A–Z)" },
];

export function readCustomerFilters(sp: Record<string, string | string[] | undefined>): CustomerFilters {
  const s = (k: string) => {
    const v = sp[k];
    return ((Array.isArray(v) ? v[0] : v) ?? "").trim();
  };
  return { tab: s("tab"), q: s("q"), tag: s("tag"), marketing: s("marketing"), sort: s("sort") };
}

/** Latest order date for a customer row (matched by customer id, this store). */
export const lastOrderAt = sql<string | null>`(select max(o.created_at) from orders o where o.store_id = "customers"."store_id" and o.customer_id = "customers"."id")`;

export function tabCondition(tab: string): SQL | undefined {
  if (tab === "repeat") return gte(customers.ordersCount, 2);
  if (tab === "new") return gte(customers.createdAt, new Date(Date.now() - 30 * 86400_000));
  if (tab === "blocked") return eq(customers.blocked, true);
  return undefined;
}

/** WHERE clause for the list/export (without the tab so tab counts can reuse it). */
export function baseConditions(storeId: string, f: CustomerFilters): SQL[] {
  const conds: SQL[] = [eq(customers.storeId, storeId)];
  if (f.q) {
    const like = `%${f.q.replace(/[%_\\]/g, (m) => "\\" + m)}%`;
    const parts: SQL[] = [ilike(customers.name, like), ilike(customers.email, like)];
    const digits = f.q.replace(/\D/g, "");
    if (digits.length >= 3) {
      const phone = normalizePhone(f.q);
      parts.push(ilike(customers.phone, `%${phone || digits}%`));
    }
    conds.push(or(...parts)!);
  }
  if (f.tag) conds.push(sql`${f.tag} = any(${customers.tags})`);
  if (f.marketing === "yes") conds.push(eq(customers.acceptsMarketing, true));
  if (f.marketing === "no") conds.push(eq(customers.acceptsMarketing, false));
  return conds;
}

export function customerWhere(storeId: string, f: CustomerFilters) {
  const t = tabCondition(f.tab);
  return and(...baseConditions(storeId, f), ...(t ? [t] : []));
}

export function customerOrder(sort: string): SQL[] {
  switch (sort) {
    case "recent":
      return [sql`${lastOrderAt} desc nulls last`, desc(customers.createdAt)];
    case "spent":
      return [desc(customers.totalSpent), desc(customers.createdAt)];
    case "orders":
      return [desc(customers.ordersCount), desc(customers.totalSpent)];
    case "name":
      return [asc(customers.name)];
    default:
      return [desc(customers.createdAt)];
  }
}

/** Spend threshold (minor units) that earns the "VIP" badge. */
export const VIP_THRESHOLD = 2_000_000; // ৳20,000
