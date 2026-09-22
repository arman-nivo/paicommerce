import { customers, db } from "@pai/db";
import { customerOrder, customerWhere, lastOrderAt, readCustomerFilters } from "@/app/(app)/customers/_lib/filters";
import { csvResponse } from "@/lib/csv";
import { getActionCtx } from "@/lib/ctx";
import { ActionError } from "@/lib/errors";

export const dynamic = "force-dynamic";

const MAX_ROWS = 50_000;

function dhaka(d: Date | string | null | undefined) {
  if (!d) return "";
  return new Date(new Date(d).getTime() + 6 * 3600_000).toISOString().slice(0, 16).replace("T", " ");
}

export async function GET(req: Request) {
  let ctx;
  try {
    ctx = await getActionCtx("customers.view");
  } catch (e) {
    const msg = e instanceof ActionError ? e.message : "Not allowed";
    return new Response(msg, { status: 403 });
  }
  const url = new URL(req.url);
  const f = readCustomerFilters(Object.fromEntries(url.searchParams));
  const rows = await db
    .select({
      name: customers.name,
      phone: customers.phone,
      email: customers.email,
      ordersCount: customers.ordersCount,
      totalSpent: customers.totalSpent,
      lastOrderAt,
      tags: customers.tags,
      acceptsMarketing: customers.acceptsMarketing,
      blocked: customers.blocked,
      addresses: customers.addresses,
      note: customers.note,
      createdAt: customers.createdAt,
    })
    .from(customers)
    .where(customerWhere(ctx.store.id, f))
    .orderBy(...customerOrder(f.sort))
    .limit(MAX_ROWS);

  const header = ["Name", "Phone", "Email", "Orders", "Total spent", "Last order", "Tags", "Accepts marketing", "Blocked", "Address", "District", "Note", "Customer since"];
  const data = rows.map((r) => {
    const a = r.addresses?.[0];
    return [
      r.name,
      r.phone,
      r.email,
      r.ordersCount,
      (r.totalSpent / 100).toFixed(2),
      dhaka(r.lastOrderAt),
      r.tags.join(", "),
      r.acceptsMarketing ? "yes" : "no",
      r.blocked ? "yes" : "no",
      a ? [a.line1, a.line2, a.area, a.city].filter(Boolean).join(", ") : "",
      a?.district ?? "",
      r.note,
      dhaka(r.createdAt),
    ];
  });
  const day = new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10);
  return csvResponse(`customers-${ctx.store.slug}-${day}.csv`, [header, ...data]);
}
