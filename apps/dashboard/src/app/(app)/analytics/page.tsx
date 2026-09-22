import Link from "next/link";
import { ChartColumn, Eye, MousePointerClick, Package, Receipt, Repeat, ShoppingBag, Wallet } from "lucide-react";
import { formatCompact, percentChange } from "@pai/core";
import { PAYMENT_LABELS } from "@pai/core/payments";
import { Avatar, Card, CardBody, CardHeader, EmptyState, StatCard, Table, TBody, TD, TH, THead, TR } from "@pai/ui";
import { Header } from "@/components/page";
import { FULFILLMENT_LABELS } from "@/components/status";
import { can, getCtx } from "@/lib/ctx";
import { formatMoney, formatNumber, pct, type SearchParams } from "@/lib/format";
import { DonutWithLegend, OrdersChart, SalesChart } from "./_components/charts";
import { BarList, FunnelChart } from "./_components/panels";
import { ExportSeriesButton, RangePicker } from "./_components/range-picker";
import { getAnalytics, storeHasOrders } from "./_lib/queries";
import { dhakaToday, formatDay, rangeLabel, resolveRange } from "./_lib/range";

export const metadata = { title: "Analytics" };

const SOURCE_LABELS: Record<string, string> = {
  web: "Online store",
  manual: "Manual (dashboard)",
  facebook: "Facebook",
  landing: "Landing page",
  pos: "Point of sale",
  api: "API",
  unknown: "Unknown",
};

const STATUS_TONE: Record<string, "green" | "red" | "amber" | "default"> = { delivered: "green", cancelled: "red", returned: "amber" };

export default async function AnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await getCtx("analytics.view");
  const sp = await searchParams;
  const range = resolveRange(sp);
  const storeId = ctx.store.id;
  const cur = ctx.store.currency;
  const money = (v: number) => formatMoney(v, cur);

  const hasOrders = await storeHasOrders(storeId);

  if (!hasOrders) {
    return (
      <div>
        <Header title="Analytics" description="See how your store is performing." />
        <Card>
          <EmptyState
            icon={<ChartColumn />}
            title="Your reports will appear here"
            description="Once you get your first order, you'll see sales, conversion, top products, payment methods and more. Share your store link on Facebook to get started!"
            action={
              can(ctx, "orders.manage") ? (
                <Link href="/orders/new" className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  Create a manual order
                </Link>
              ) : undefined
            }
          />
        </Card>
      </div>
    );
  }

  const a = await getAnalytics(storeId, range);
  const k = a.cur;
  const p = a.prev;
  const compare = range.compare;
  const change = (c: number, pv: number) => (compare ? percentChange(c, pv) : null);
  const weekly = range.bucket === "week";
  const label = (key: string) => (weekly ? `Wk ${formatDay(key)}` : formatDay(key));

  const salesData = a.curSeries.map((s, i) => ({ label: label(s.key), current: s.sales, previous: a.prevSeries[i]?.sales ?? 0 }));
  const ordersData = a.curSeries.map((s, i) => ({ label: label(s.key), current: s.orders, previous: a.prevSeries[i]?.orders ?? 0 }));
  const compareHint = compare ? `vs ${rangeLabel(range.prevFrom, range.prevTo)}` : undefined;

  const settled = a.statuses.reduce((acc, s) => (["delivered", "cancelled", "returned"].includes(s.key) ? acc + s.orders : acc), 0);
  const delivered = a.statuses.find((s) => s.key === "delivered")?.orders ?? 0;
  const totalStatus = a.statuses.reduce((acc, s) => acc + s.orders, 0);
  const newCustomers = k.customers - k.returning;

  return (
    <div className="space-y-5">
      <Header
        title="Analytics"
        description={
          <>
            {rangeLabel(range.from, range.to)}
            {compare && <span className="text-muted-foreground/80"> · compared with {rangeLabel(range.prevFrom, range.prevTo)}</span>}
            {weekly && " · grouped by week"}
          </>
        }
        actions={
          <>
            <RangePicker preset={range.preset} from={range.from} to={range.to} today={dhakaToday()} compare={range.compare} />
            <ExportSeriesButton
              filename={`analytics-${ctx.store.slug}-${range.from}-to-${range.to}.csv`}
              rows={a.curSeries.map((s) => ({ date: s.key, sales: s.sales, orders: s.orders, visitors: s.visitors }))}
            />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total sales" value={money(k.sales)} change={change(k.sales, p.sales)} icon={<Wallet />} hint={compare ? money(p.sales) : undefined} />
        <StatCard label="Orders" value={formatNumber(k.orders)} change={change(k.orders, p.orders)} icon={<ShoppingBag />} hint={compare ? formatNumber(p.orders) : undefined} />
        <StatCard label="Avg. order value" value={money(k.aov)} change={change(k.aov, p.aov)} icon={<Receipt />} hint={compare ? money(p.aov) : undefined} />
        <StatCard label="Visitors" value={formatCompact(k.visitors)} change={change(k.visitors, p.visitors)} icon={<Eye />} hint={compare ? formatCompact(p.visitors) : undefined} />
        <StatCard label="Conversion rate" value={pct(k.conversion, 2)} change={change(k.conversion, p.conversion)} icon={<MousePointerClick />} hint={compare ? pct(p.conversion, 2) : "Orders ÷ visitors"} />
        <StatCard label="Returning customers" value={pct(k.returningRate)} change={change(k.returningRate, p.returningRate)} icon={<Repeat />} hint={`${formatNumber(k.returning)} of ${formatNumber(k.customers)}`} />
      </div>

      <Card>
        <CardHeader
          title="Sales over time"
          description={compareHint}
          action={
            compare ? (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-4 rounded bg-[#2545eb]" /> This period
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-4 rounded bg-slate-400" /> Previous
                </span>
              </div>
            ) : undefined
          }
        />
        <CardBody className="px-2 sm:px-5">
          <SalesChart data={salesData} compare={compare} />
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Orders over time" description={compareHint} />
          <CardBody className="px-2 sm:px-5">
            <OrdersChart data={ordersData} compare={compare} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Conversion funnel" description="How visitors move from browsing to buying" />
          <CardBody>
            {a.funnel.pageViews === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No storefront visits recorded in this period yet.</p>
            ) : (
              <FunnelChart data={a.funnel} />
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="overflow-hidden lg:col-span-3">
          <CardHeader title="Top products" description="By revenue, excluding cancelled orders" />
          {a.products.length === 0 ? (
            <EmptyState icon={<Package />} title="No products sold in this period" />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH className="w-8">#</TH>
                  <TH>Product</TH>
                  <TH className="text-right">Units</TH>
                  <TH className="hidden text-right sm:table-cell">Orders</TH>
                  <TH className="text-right">Revenue</TH>
                </TR>
              </THead>
              <TBody>
                {a.products.map((pr, i) => (
                  <TR key={`${pr.productId ?? pr.title}-${i}`}>
                    <TD className="text-muted-foreground tabular-nums">{i + 1}</TD>
                    <TD>
                      <div className="flex items-center gap-3">
                        {pr.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={pr.imageUrl} alt="" className="size-9 shrink-0 rounded-md border border-border object-cover" />
                        ) : (
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            <Package className="size-4" />
                          </span>
                        )}
                        {pr.productId ? (
                          <Link href={`/products/${pr.productId}`} className="line-clamp-2 font-medium hover:text-primary">
                            {pr.title}
                          </Link>
                        ) : (
                          <span className="line-clamp-2 font-medium">{pr.title}</span>
                        )}
                      </div>
                    </TD>
                    <TD className="text-right tabular-nums">{formatNumber(pr.units)}</TD>
                    <TD className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">{formatNumber(pr.orders)}</TD>
                    <TD className="text-right font-medium tabular-nums">{money(pr.revenue)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Sales by payment method" />
          <CardBody>
            {a.payments.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No sales in this period</p>
            ) : (
              <DonutWithLegend data={a.payments.map((x) => ({ name: PAYMENT_LABELS[x.key] ?? x.key, value: x.sales, count: x.orders }))} />
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="Sales by channel" description="Where orders came from" />
          <CardBody>
            <BarList items={a.sources.map((x) => ({ label: SOURCE_LABELS[x.key] ?? x.key, value: x.sales, display: money(x.sales), sub: `${x.orders} orders` }))} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Sales by delivery zone" />
          <CardBody>
            <BarList items={a.zones.map((x) => ({ label: x.key === "unknown" ? "Not set" : x.key, value: x.sales, display: money(x.sales), sub: `${x.orders} orders` }))} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Order status"
            description={settled ? `${Math.round((delivered / settled) * 100)}% delivery success (delivered ÷ delivered + returned + cancelled)` : "All orders placed in this period"}
          />
          <CardBody>
            <BarList
              items={a.statuses.map((x) => ({
                label: FULFILLMENT_LABELS[x.key] ?? x.key,
                value: x.orders,
                display: formatNumber(x.orders),
                sub: totalStatus ? pct((x.orders / totalStatus) * 100, 0) : undefined,
                tone: STATUS_TONE[x.key] ?? "default",
              }))}
            />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="New vs returning customers" description="Customers who ordered in this period" />
          <CardBody className="space-y-4">
            {k.customers === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No customers in this period</p>
            ) : (
              <>
                <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                  <div className="bg-primary" style={{ width: `${(newCustomers / k.customers) * 100}%` }} />
                  <div className="bg-emerald-500" style={{ width: `${(k.returning / k.customers) * 100}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/60 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="size-2 rounded-full bg-primary" /> New
                    </div>
                    <div className="mt-1 font-display text-xl font-bold tabular-nums">{formatNumber(newCustomers)}</div>
                    <div className="text-xs text-muted-foreground">{pct((newCustomers / k.customers) * 100, 0)}</div>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="size-2 rounded-full bg-emerald-500" /> Returning
                    </div>
                    <div className="mt-1 font-display text-xl font-bold tabular-nums">{formatNumber(k.returning)}</div>
                    <div className="text-xs text-muted-foreground">{pct(k.returningRate, 0)}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Returning = ordered before this period too (matched by account or phone).</p>
              </>
            )}
          </CardBody>
        </Card>
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader title="Top customers" description="By spend in this period" />
          {a.customers.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No customers in this period</p>
          ) : (
            <ul className="divide-y divide-border">
              {a.customers.map((c, i) => {
                const inner = (
                  <>
                    <span className="w-5 text-sm text-muted-foreground tabular-nums">{i + 1}</span>
                    <Avatar name={c.name} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{c.name}</div>
                      <div className="truncate text-xs text-muted-foreground tabular-nums">{c.phone ?? "—"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium tabular-nums">{money(c.spent)}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.orders} order{c.orders === 1 ? "" : "s"}
                      </div>
                    </div>
                  </>
                );
                return (
                  <li key={`${c.customerId ?? c.phone ?? c.name}-${i}`}>
                    {c.customerId ? (
                      <Link href={`/customers/${c.customerId}`} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/40">
                        {inner}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 px-5 py-2.5">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
