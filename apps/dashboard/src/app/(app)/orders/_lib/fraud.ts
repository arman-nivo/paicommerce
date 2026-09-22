import { normalizePhone } from "@pai/core";
import { and, count, db, eq, ne, orders, sql, type StoreSettings } from "@pai/db";

export type FraudStats = {
  phone: string;
  total: number;
  delivered: number;
  failed: number; // cancelled + returned
  inProgress: number;
  ratio: number | null; // delivered / (delivered + failed), 0–100
  verdict: "new" | "trusted" | "caution" | "risky";
  blocked: boolean;
};

/** Delivery history of a phone number in THIS store (excluding the current order). */
export async function fraudStats(storeId: string, settings: StoreSettings, phone: string | null, excludeOrderId?: string): Promise<FraudStats | null> {
  const p = normalizePhone(phone);
  if (!p) return null;
  const conds = [eq(orders.storeId, storeId), eq(orders.phone, p)];
  if (excludeOrderId) conds.push(ne(orders.id, excludeOrderId));
  const [r] = await db
    .select({
      total: count(),
      delivered: sql<number>`count(*) filter (where ${orders.fulfillmentStatus} = 'delivered')::int`,
      failed: sql<number>`count(*) filter (where ${orders.fulfillmentStatus} in ('cancelled','returned'))::int`,
    })
    .from(orders)
    .where(and(...conds));
  const total = r?.total ?? 0;
  const delivered = Number(r?.delivered ?? 0);
  const failed = Number(r?.failed ?? 0);
  const decided = delivered + failed;
  const ratio = decided ? Math.round((delivered / decided) * 100) : null;
  const verdict: FraudStats["verdict"] = ratio == null ? "new" : ratio >= 80 ? "trusted" : ratio >= 50 ? "caution" : "risky";
  const blocked = (settings.fraud?.blockPhones ?? []).some((b) => normalizePhone(b) === p);
  return { phone: p, total, delivered, failed, inProgress: total - decided, ratio, verdict, blocked };
}
