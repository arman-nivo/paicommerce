import { NextResponse } from "next/server";
import { hasPermission, formatMoney, normalizePhone } from "@pai/core";
import { and, customers, db, desc, eq, ilike, or, orders, products, sql } from "@pai/db";
import { getActionCtx } from "@/lib/ctx";

export async function GET(req: Request) {
  let ctx;
  try {
    ctx = await getActionCtx();
  } catch {
    return NextResponse.json({ orders: [], products: [], customers: [] }, { status: 401 });
  }
  const q = new URL(req.url).searchParams.get("q")?.trim().slice(0, 100) ?? "";
  if (q.length < 2) return NextResponse.json({ orders: [], products: [], customers: [] });
  const like = `%${q.replace(/[%_]/g, "")}%`;
  const num = Number(q.replace(/^#/, ""));
  const phone = normalizePhone(q);
  const sid = ctx.store.id;

  const [o, p, c] = await Promise.all([
    hasPermission(ctx.member, "orders.view")
      ? db
          .select({ id: orders.id, number: orders.number, name: orders.name, phone: orders.phone, total: orders.total })
          .from(orders)
          .where(and(eq(orders.storeId, sid), or(Number.isInteger(num) && num > 0 ? eq(orders.number, num) : sql`false`, ilike(orders.name, like), phone.length >= 5 ? ilike(orders.phone, `%${phone}%`) : sql`false`, ilike(orders.email, like))))
          .orderBy(desc(orders.createdAt))
          .limit(5)
      : [],
    hasPermission(ctx.member, "products.view")
      ? db
          .select({ id: products.id, title: products.title, status: products.status, images: products.images })
          .from(products)
          .where(and(eq(products.storeId, sid), or(ilike(products.title, like), ilike(products.sku, like))))
          .limit(5)
      : [],
    hasPermission(ctx.member, "customers.view")
      ? db
          .select({ id: customers.id, name: customers.name, phone: customers.phone, email: customers.email })
          .from(customers)
          .where(and(eq(customers.storeId, sid), or(ilike(customers.name, like), ilike(customers.email, like), phone.length >= 5 ? ilike(customers.phone, `%${phone}%`) : sql`false`)))
          .limit(5)
      : [],
  ]);
  return NextResponse.json({
    orders: o.map((x) => ({ ...x, total: formatMoney(x.total, ctx.store.currency) })),
    products: p.map((x) => ({ id: x.id, title: x.title, status: x.status, image: x.images[0]?.url ?? null })),
    customers: c,
  });
}
