import { NextResponse } from "next/server";
import { PAYMENT_LABELS } from "@pai/core/payments";
import { asc, db, desc, inArray, orderItems, orders } from "@pai/db";
import { getActionCtx } from "@/lib/ctx";
import { csvResponse } from "@/lib/csv";
import { addressLines, idsWhere, orderWhere, readFilters, UUID_RE } from "@/app/(app)/orders/_lib/filters";
import { courierName } from "@/app/(app)/orders/_lib/labels";

export async function GET(req: Request) {
  let ctx;
  try {
    ctx = await getActionCtx("orders.view");
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
  const sp = new URL(req.url).searchParams;
  const ids = (sp.get("ids") ?? "").split(",").filter((x) => UUID_RE.test(x)).slice(0, 5000);
  const where = ids.length ? idsWhere(ctx.store.id, ids) : orderWhere(ctx.store.id, readFilters(sp));
  const rows = await db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(20000);
  const items = rows.length
    ? await db.select({ orderId: orderItems.orderId, title: orderItems.title, variantTitle: orderItems.variantTitle, quantity: orderItems.quantity }).from(orderItems).where(inArray(orderItems.orderId, rows.map((r) => r.id))).orderBy(asc(orderItems.title))
    : [];
  const byOrder = new Map<string, string[]>();
  for (const it of items) {
    const arr = byOrder.get(it.orderId) ?? [];
    arr.push(`${it.quantity} × ${it.title}${it.variantTitle ? ` (${it.variantTitle})` : ""}`);
    byOrder.set(it.orderId, arr);
  }
  const m = (n: number) => (n / 100).toFixed(2);
  const data = [
    ["Order", "Date", "Customer", "Phone", "Email", "Address", "Zone", "Items", "Subtotal", "Discount", "Shipping", "Total", "Payment method", "Payment status", "Fulfillment", "Courier", "Tracking", "Source", "Note"],
    ...rows.map((o) => [
      o.number,
      o.createdAt.toISOString(),
      o.name,
      o.phone,
      o.email,
      addressLines(o.shippingAddress),
      o.deliveryZone,
      (byOrder.get(o.id) ?? []).join("; "),
      m(o.subtotal),
      m(o.discountTotal),
      m(o.shippingTotal),
      m(o.total),
      PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod,
      o.paymentStatus,
      o.fulfillmentStatus,
      courierName(o.courier),
      o.courier?.trackingCode ?? o.courier?.consignmentId ?? "",
      o.source,
      o.note,
    ]),
  ];
  return csvResponse(`orders-${new Date().toISOString().slice(0, 10)}.csv`, data);
}
