/**
 * Order list filters — shared by the /orders page and GET /api/orders/export.
 * Every condition is scoped to the given store id (tenant isolation).
 */
import { normalizePhone } from "@pai/core";
import { and, eq, gte, ilike, inArray, lt, or, orders, sql, type SQL } from "@pai/db";

export const FULFILLMENT_STATUSES = ["unfulfilled", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"] as const;
export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];

export const PAYMENT_STATUSES = ["pending", "authorized", "paid", "partially_refunded", "refunded", "failed"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const ORDER_SOURCES = [
  { value: "web", label: "Online store" },
  { value: "manual", label: "Manual" },
  { value: "facebook", label: "Facebook" },
  { value: "landing", label: "Landing page" },
  { value: "pos", label: "POS" },
  { value: "api", label: "API" },
] as const;

export const SOURCE_LABELS: Record<string, string> = Object.fromEntries(ORDER_SOURCES.map((s) => [s.value, s.label]));

export type OrderFilters = {
  status?: string;
  q?: string;
  payment?: string;
  method?: string;
  source?: string;
  from?: string;
  to?: string;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Start of a yyyy-mm-dd day in Asia/Dhaka (UTC+6, no DST). */
export function dhakaDayStart(day: string): Date | null {
  if (!DATE_RE.test(day)) return null;
  const d = new Date(`${day}T00:00:00+06:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Conditions for everything except the fulfillment status tab (used for tab counts). */
export function baseConditions(storeId: string, f: OrderFilters): SQL[] {
  const conds: SQL[] = [eq(orders.storeId, storeId)];
  const q = f.q?.trim();
  if (q) {
    const like = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    const parts: SQL[] = [ilike(orders.name, like), ilike(orders.email, like)];
    const phone = normalizePhone(q);
    if (phone.replace(/\D/g, "").length >= 3) parts.push(ilike(orders.phone, `%${phone.replace(/\D/g, "")}%`));
    const num = q.replace(/^#/, "");
    if (/^\d{1,9}$/.test(num)) parts.push(eq(orders.number, Number(num)));
    conds.push(or(...parts)!);
  }
  if (f.payment && (PAYMENT_STATUSES as readonly string[]).includes(f.payment)) conds.push(eq(orders.paymentStatus, f.payment as PaymentStatus));
  if (f.method) conds.push(eq(orders.paymentMethod, f.method));
  if (f.source) conds.push(eq(orders.source, f.source));
  const from = f.from ? dhakaDayStart(f.from) : null;
  if (from) conds.push(gte(orders.createdAt, from));
  const to = f.to ? dhakaDayStart(f.to) : null;
  if (to) conds.push(lt(orders.createdAt, new Date(to.getTime() + 86400_000)));
  return conds;
}

export function statusCondition(status?: string): SQL | null {
  if (status && (FULFILLMENT_STATUSES as readonly string[]).includes(status)) return eq(orders.fulfillmentStatus, status as FulfillmentStatus);
  return null;
}

export function orderWhere(storeId: string, f: OrderFilters): SQL {
  const conds = baseConditions(storeId, f);
  const s = statusCondition(f.status);
  if (s) conds.push(s);
  return and(...conds)!;
}

export function idsWhere(storeId: string, ids: string[]): SQL {
  return and(eq(orders.storeId, storeId), inArray(orders.id, ids))!;
}

/** Items count per order as a correlated subquery. */
export const itemsCountSql = sql<number>`(select coalesce(sum(oi.quantity), 0)::int from order_items oi where oi.order_id = ${orders.id})`;

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function readFilters(sp: Record<string, string | string[] | undefined> | URLSearchParams): OrderFilters {
  const get = (k: string) => {
    if (sp instanceof URLSearchParams) return sp.get(k) ?? undefined;
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v) || undefined;
  };
  return { status: get("status"), q: get("q"), payment: get("payment"), method: get("method"), source: get("source"), from: get("from"), to: get("to") };
}

export function addressLines(a: { name?: string; line1?: string; line2?: string; area?: string; city?: string; district?: string; postalCode?: string } | null | undefined): string {
  if (!a) return "";
  return [a.line1, a.line2, a.area, a.city, a.district, a.postalCode].map((s) => s?.trim()).filter(Boolean).join(", ");
}
