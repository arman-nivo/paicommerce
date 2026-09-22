import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardBody, CardHeader, EmptyState, Table, TBody, TD, TH, THead, TR } from "@pai/ui";
import { and, db, desc, discounts, eq, orders, sql } from "@pai/db";
import { Header } from "@/components/page";
import { FulfillmentBadge } from "@/components/status";
import { getCtx } from "@/lib/ctx";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/format";
import { DiscountForm } from "../_components/discount-form";
import { DiscountMenu } from "../_components/row-controls";
import { toDhakaInput } from "../_lib/shared";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const metadata = { title: "Edit discount" };

export default async function DiscountPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getCtx("discounts.manage");
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const storeId = ctx.store.id;
  const cur = ctx.store.currency;

  const d = await db.query.discounts.findFirst({ where: and(eq(discounts.id, id), eq(discounts.storeId, storeId)) });
  if (!d) notFound();

  const usedBy = and(eq(orders.storeId, storeId), sql`upper(${orders.discountCode}) = upper(${d.code})`);
  const valid = sql`${orders.status} <> 'cancelled' and ${orders.fulfillmentStatus} <> 'cancelled'`;
  const [[stats], recent] = await Promise.all([
    db
      .select({
        orders: sql<number>`count(*) filter (where ${valid})`.mapWith(Number),
        cancelled: sql<number>`count(*) filter (where not (${valid}))`.mapWith(Number),
        revenue: sql<number>`coalesce(sum(${orders.total}) filter (where ${valid}), 0)`.mapWith(Number),
        given: sql<number>`coalesce(sum(${orders.discountTotal}) filter (where ${valid}), 0)`.mapWith(Number),
      })
      .from(orders)
      .where(usedBy),
    db
      .select({ id: orders.id, number: orders.number, name: orders.name, createdAt: orders.createdAt, total: orders.total, discountTotal: orders.discountTotal, fulfillmentStatus: orders.fulfillmentStatus })
      .from(orders)
      .where(usedBy)
      .orderBy(desc(orders.createdAt))
      .limit(10),
  ]);
  const s = stats ?? { orders: 0, cancelled: 0, revenue: 0, given: 0 };
  const aov = s.orders ? Math.round(s.revenue / s.orders) : 0;

  const statRow = (label: string, value: string, hint?: string) => (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right">
        <span className="font-semibold tabular-nums">{value}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </div>
  );

  return (
    <div>
      <Header
        back={{ href: "/discounts", label: "Discounts" }}
        title={<span className="font-mono tracking-wide">{d.code}</span>}
        description={d.title ?? "Discount code"}
        actions={<DiscountMenu id={d.id} code={d.code} usedCount={d.usedCount} />}
      />
      <DiscountForm
        id={d.id}
        usedCount={d.usedCount}
        initial={{
          code: d.code,
          title: d.title ?? "",
          type: d.type,
          value: d.value,
          minSubtotal: d.minSubtotal,
          usageLimit: d.usageLimit,
          oncePerCustomer: d.oncePerCustomer,
          startsAt: toDhakaInput(d.startsAt),
          endsAt: toDhakaInput(d.endsAt),
          active: d.active,
        }}
        extraAside={
          <Card>
            <CardHeader title="Performance" description="Orders that used this code" />
            <CardBody className="divide-y divide-border py-2">
              {statRow("Times used", `${formatNumber(d.usedCount)}${d.usageLimit ? ` / ${formatNumber(d.usageLimit)}` : ""}`)}
              {statRow("Orders", formatNumber(s.orders), s.cancelled ? `+${s.cancelled} cancelled` : undefined)}
              {statRow("Sales", formatMoney(s.revenue, cur))}
              {statRow("Discount given", formatMoney(s.given, cur))}
              {statRow("Avg. order value", formatMoney(aov, cur))}
            </CardBody>
          </Card>
        }
      />

      <Card className="mt-5 overflow-hidden">
        <CardHeader title="Recent orders with this code" />
        {recent.length === 0 ? (
          <EmptyState title="Not used yet" description="Share the code on Facebook, Instagram or SMS — orders that use it will appear here." />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Order</TH>
                <TH>Customer</TH>
                <TH>Date</TH>
                <TH>Status</TH>
                <TH className="text-right">Discount</TH>
                <TH className="text-right">Total</TH>
              </TR>
            </THead>
            <TBody>
              {recent.map((o) => (
                <TR key={o.id} className="relative">
                  <TD>
                    <Link href={`/orders/${o.id}`} className="font-medium text-primary after:absolute after:inset-0 hover:underline">
                      #{o.number}
                    </Link>
                  </TD>
                  <TD className="max-w-48 truncate">{o.name}</TD>
                  <TD className="whitespace-nowrap text-muted-foreground">{formatDateTime(o.createdAt)}</TD>
                  <TD>
                    <FulfillmentBadge status={o.fulfillmentStatus} />
                  </TD>
                  <TD className="text-right tabular-nums text-emerald-600 dark:text-emerald-400">−{formatMoney(o.discountTotal, cur)}</TD>
                  <TD className="text-right font-medium tabular-nums">{formatMoney(o.total, cur)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
