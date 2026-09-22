import { NextResponse } from "next/server";
import { and, db, desc, eq, ilike, or, orders, sql, stores, users } from "@pai/db";
import { getAdmin } from "@/lib/auth";
import { escapeLike } from "@/lib/params";
import { bdt } from "@/lib/format";

export async function GET(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const q = (sp.get("q") ?? "").trim().slice(0, 100);
  const only = sp.get("type");
  if (q.length < 2) return NextResponse.json({ results: [] });
  const like = `%${escapeLike(q)}%`;

  // Orders: "#1024", "1024", "demo #1024", "demo 1024"
  const orderMatch = q.match(/^(?:(.+?)\s+)?#?(\d{1,9})$/);

  if (only === "stores") {
    const rows = await db
      .select({ id: stores.id, name: stores.name, slug: stores.slug })
      .from(stores)
      .where(or(ilike(stores.name, like), ilike(stores.slug, like), ilike(stores.customDomain, like)))
      .orderBy(stores.name)
      .limit(10);
    return NextResponse.json({ results: rows });
  }

  const [storeRows, userRows, orderRows] = await Promise.all([
    db
      .select({ id: stores.id, name: stores.name, slug: stores.slug, customDomain: stores.customDomain, status: stores.status })
      .from(stores)
      .where(or(ilike(stores.name, like), ilike(stores.slug, like), ilike(stores.customDomain, like)))
      .orderBy(desc(stores.createdAt))
      .limit(6),
    db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role })
      .from(users)
      .where(or(ilike(users.email, like), ilike(users.name, like)))
      .orderBy(desc(users.createdAt))
      .limit(6),
    orderMatch
      ? db
          .select({ id: orders.id, number: orders.number, total: orders.total, name: orders.name, storeId: stores.id, storeName: stores.name, storeSlug: stores.slug })
          .from(orders)
          .innerJoin(stores, eq(stores.id, orders.storeId))
          .where(
            and(
              eq(orders.number, Number(orderMatch[2])),
              orderMatch[1] ? or(ilike(stores.slug, `%${escapeLike(orderMatch[1])}%`), ilike(stores.name, `%${escapeLike(orderMatch[1])}%`)) : sql`true`,
            ),
          )
          .orderBy(desc(orders.createdAt))
          .limit(6)
      : Promise.resolve([]),
  ]);

  const results = [
    ...storeRows.map((s) => ({ id: "s:" + s.id, type: "store", title: s.name, subtitle: `${s.slug}${s.customDomain ? " · " + s.customDomain : ""} · ${s.status}`, href: `/stores/${s.id}` })),
    ...userRows.map((u) => ({ id: "u:" + u.id, type: "user", title: u.name, subtitle: `${u.email} · ${u.role}`, href: `/users/${u.id}` })),
    ...orderRows.map((o) => ({ id: "o:" + o.id, type: "order", title: `#${o.number} · ${o.storeName}`, subtitle: `${o.name} · ${bdt(o.total)}`, href: `/stores/${o.storeId}/orders/${o.id}` })),
  ];
  return NextResponse.json({ results });
}
