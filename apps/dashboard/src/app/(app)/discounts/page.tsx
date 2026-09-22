import Link from "next/link";
import { BadgePercent, Plus, ReceiptText, Ticket, TicketPercent } from "lucide-react";
import { Badge, Card, CopyButton, EmptyState, StatCard, Table, TBody, TD, TH, THead, TR, cn } from "@pai/ui";
import { and, count, db, desc, discounts, eq, ilike, isNotNull, or, orders, sql } from "@pai/db";
import { Header } from "@/components/page";
import { Pagination } from "@/components/pagination";
import { ClearFilters, SearchBox, UrlTabs } from "@/components/url-controls";
import { getCtx } from "@/lib/ctx";
import { formatMoney, formatNumber, pageParam, str, type SearchParams } from "@/lib/format";
import { BulkGenerateButton } from "./_components/bulk-generate";
import { ActiveToggle } from "./_components/row-controls";
import { statusIs, statusSql } from "./_lib/queries";
import { shortDate, STATUS_META, TYPE_LABELS, type DiscountStatus, type DiscountType } from "./_lib/shared";

export const metadata = { title: "Discounts" };

const PAGE_SIZE = 25;
const TABS: { value: DiscountStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "expired", label: "Expired" },
  { value: "disabled", label: "Disabled" },
  { value: "limit", label: "Limit reached" },
];

const TYPE_TONE: Record<DiscountType, "brand" | "purple" | "blue"> = { percentage: "brand", fixed: "purple", free_shipping: "blue" };

export default async function DiscountsPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await getCtx("discounts.manage");
  const sp = await searchParams;
  const storeId = ctx.store.id;
  const cur = ctx.store.currency;
  const page = pageParam(sp.page);
  const q = str(sp.q).trim();
  const tab = (TABS.some((t) => t.value === str(sp.tab)) ? str(sp.tab) : "") as DiscountStatus | "";

  const base = [eq(discounts.storeId, storeId)];
  if (q) {
    const like = `%${q.replace(/[%_\\]/g, (m) => "\\" + m)}%`;
    base.push(or(ilike(discounts.code, like), ilike(discounts.title, like))!);
  }
  const where = and(...base, ...(tab ? [statusIs(tab)] : []));
  const valid = sql`${orders.status} <> 'cancelled' and ${orders.fulfillmentStatus} <> 'cancelled'`;

  const [rows, [totalRow], statusCounts, [summary], [orderStats]] = await Promise.all([
    db
      .select({
        id: discounts.id,
        code: discounts.code,
        title: discounts.title,
        type: discounts.type,
        value: discounts.value,
        minSubtotal: discounts.minSubtotal,
        usageLimit: discounts.usageLimit,
        usedCount: discounts.usedCount,
        startsAt: discounts.startsAt,
        endsAt: discounts.endsAt,
        active: discounts.active,
        status: statusSql,
      })
      .from(discounts)
      .where(where)
      .orderBy(desc(discounts.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(discounts).where(where),
    db
      .select({ status: statusSql, n: count() })
      .from(discounts)
      .where(and(...base))
      .groupBy(sql`1`),
    db
      .select({
        total: count(),
        active: sql<number>`count(*) filter (where ${statusIs("active")})`.mapWith(Number),
        redemptions: sql<number>`coalesce(sum(${discounts.usedCount}), 0)`.mapWith(Number),
      })
      .from(discounts)
      .where(eq(discounts.storeId, storeId)),
    db
      .select({
        given: sql<number>`coalesce(sum(${orders.discountTotal}), 0)`.mapWith(Number),
        withCode: sql<number>`count(*) filter (where ${orders.discountCode} is not null and ${orders.discountCode} <> '')`.mapWith(Number),
        revenue: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.discountCode} is not null and ${orders.discountCode} <> ''), 0)`.mapWith(Number),
      })
      .from(orders)
      .where(and(eq(orders.storeId, storeId), valid, or(isNotNull(orders.discountCode), sql`${orders.discountTotal} > 0`))),
  ]);

  const total = totalRow?.n ?? 0;
  const byStatus = Object.fromEntries(statusCounts.map((r) => [r.status, r.n])) as Record<string, number>;
  const allCount = statusCounts.reduce((a, r) => a + r.n, 0);
  const s = summary ?? { total: 0, active: 0, redemptions: 0 };
  const o = orderStats ?? { given: 0, withCode: 0, revenue: 0 };

  const newBtn = (
    <Link href="/discounts/new" className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90">
      <Plus className="size-4" /> Create discount
    </Link>
  );

  return (
    <div>
      <Header title="Discounts" description="Promo codes customers can use at checkout." actions={s.total > 0 ? <><BulkGenerateButton />{newBtn}</> : undefined} />

      {s.total === 0 ? (
        <Card>
          <EmptyState
            icon={<TicketPercent />}
            title="Create your first discount code"
            description="Run Eid, Pohela Boishakh or Facebook campaigns with codes like EID20. Set a percentage or flat amount off, free delivery, minimum order and an end date."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                {newBtn}
                <BulkGenerateButton />
              </div>
            }
          />
        </Card>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Active codes" value={formatNumber(s.active)} icon={<Ticket />} hint={`of ${formatNumber(s.total)} total`} />
            <StatCard label="Total redemptions" value={formatNumber(s.redemptions)} icon={<BadgePercent />} />
            <StatCard label="Discount given" value={formatMoney(o.given, cur)} icon={<TicketPercent />} hint="Excludes cancelled orders" />
            <StatCard label="Orders using codes" value={formatNumber(o.withCode)} icon={<ReceiptText />} hint={`${formatMoney(o.revenue, cur)} in sales`} />
          </div>

          <Card className="overflow-hidden">
            <UrlTabs tabs={TABS.map((t) => ({ value: t.value, label: t.label, count: t.value ? (byStatus[t.value] ?? 0) : allCount }))} />
            <div className="flex items-center gap-2 border-b border-border p-3">
              <SearchBox placeholder="Search codes or names" />
              <ClearFilters />
            </div>
            {rows.length === 0 ? (
              <EmptyState icon={<TicketPercent />} title="No discounts found" description={q ? "Try a different search." : "No codes with this status."} />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Code</TH>
                    <TH>Type</TH>
                    <TH>Value</TH>
                    <TH className="hidden lg:table-cell">Min. order</TH>
                    <TH>Used</TH>
                    <TH className="hidden md:table-cell">Active dates</TH>
                    <TH>Status</TH>
                    <TH className="text-right">On</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((d) => {
                    const meta = STATUS_META[d.status as DiscountStatus] ?? STATUS_META.active;
                    const pct = d.usageLimit ? Math.min(100, (d.usedCount / d.usageLimit) * 100) : 0;
                    return (
                      <TR key={d.id}>
                        <TD>
                          <div className="flex items-center gap-1">
                            <Link href={`/discounts/${d.id}`} className="font-mono text-sm font-semibold tracking-wide hover:text-primary">
                              {d.code}
                            </Link>
                            <CopyButton value={d.code} className="px-1.5" />
                          </div>
                          {d.title && <div className="max-w-52 truncate text-xs text-muted-foreground">{d.title}</div>}
                        </TD>
                        <TD>
                          <Badge tone={TYPE_TONE[d.type]}>{TYPE_LABELS[d.type]}</Badge>
                        </TD>
                        <TD className="whitespace-nowrap font-medium tabular-nums">{d.type === "percentage" ? `${d.value}%` : d.type === "fixed" ? formatMoney(d.value, cur) : "Free delivery"}</TD>
                        <TD className="hidden whitespace-nowrap text-muted-foreground tabular-nums lg:table-cell">{d.minSubtotal ? formatMoney(d.minSubtotal, cur) : "—"}</TD>
                        <TD className="min-w-28">
                          <div className="text-sm tabular-nums">
                            {formatNumber(d.usedCount)}
                            <span className="text-muted-foreground"> / {d.usageLimit ? formatNumber(d.usageLimit) : "∞"}</span>
                          </div>
                          {d.usageLimit ? (
                            <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                              <div className={cn("h-full rounded-full", pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-primary")} style={{ width: `${pct}%` }} />
                            </div>
                          ) : null}
                        </TD>
                        <TD className="hidden whitespace-nowrap text-xs text-muted-foreground md:table-cell">
                          {d.startsAt || d.endsAt ? (
                            <>
                              {d.startsAt ? shortDate(d.startsAt, true) : "Now"} → {d.endsAt ? shortDate(d.endsAt, true) : "No end"}
                            </>
                          ) : (
                            "Always"
                          )}
                        </TD>
                        <TD>
                          <Badge tone={meta.tone} dot>
                            {meta.label}
                          </Badge>
                        </TD>
                        <TD className="text-right">
                          <ActiveToggle id={d.id} active={d.active} code={d.code} />
                        </TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            )}
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/discounts" params={sp} />
          </Card>
        </>
      )}
    </div>
  );
}
