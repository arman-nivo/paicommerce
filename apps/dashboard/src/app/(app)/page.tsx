import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChartColumn, CircleDollarSign, Eye, PackageX, Plus, ShoppingBag, ShoppingCart, TriangleAlert } from "lucide-react";
import { formatMoney, percentChange, PERMISSIONS, storeUrl, type Permission } from "@pai/core";
import { Button, Card, CardHeader, EmptyState, StatCard } from "@pai/ui";
import { FulfillmentBadge, PaymentBadge } from "@/components/status";
import { RelativeTime } from "@/components/time";
import { can, getCtx } from "@/lib/ctx";
import { SetupChecklist } from "./_home/checklist";
import { getHomeData, getIncompleteSummary, type Period } from "./_home/data";
import { SalesChart } from "./_home/sales-chart";
import { WelcomeDialog } from "./_home/welcome";

export const metadata: Metadata = { title: "Home" };

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Dhaka" }).format(new Date()));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ period?: string; welcome?: string; denied?: string }> }) {
  const ctx = await getCtx();
  const { store, user } = ctx;
  const sp = await searchParams;
  const period: Period = sp.period === "7" ? 7 : sp.period === "90" ? 90 : 30;
  const canOrders = can(ctx, "orders.view");
  const [d, incomplete] = await Promise.all([getHomeData(store, period), canOrders ? getIncompleteSummary(store.id) : 0]);
  const money = (n: number) => formatMoney(n, store.currency);
  const url = storeUrl(store);
  const denied = sp.denied && sp.denied in PERMISSIONS ? PERMISSIONS[sp.denied as Permission] : null;

  return (
    <div className="space-y-6">
      {sp.welcome && <WelcomeDialog storeName={store.name} storeUrl={url} />}
      {denied && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <TriangleAlert className="size-4 shrink-0" /> You don't have access to that page (“{denied}”). Ask the store owner to update your permissions.
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {greeting()}, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's what's happening with {store.name}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-card p-0.5 text-sm">
            {([7, 30, 90] as const).map((p) => (
              <Link key={p} href={p === 30 ? "/" : `/?period=${p}`} scroll={false} className={`rounded-md px-3 py-1.5 font-medium transition ${p === period ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {p}d
              </Link>
            ))}
          </div>
          {can(ctx, "products.manage") && (
            <Link href="/products/new">
              <Button variant="outline">
                <Plus /> Add product
              </Button>
            </Link>
          )}
          {can(ctx, "orders.manage") && (
            <Link href="/orders/new">
              <Button>
                <Plus /> Create order
              </Button>
            </Link>
          )}
        </div>
      </div>

      <SetupChecklist checklist={d.checklist} themeId={d.themeId} storeUrl={url} hasCod={d.hasCod} />

      {(d.unfulfilled > 0 || incomplete > 0 || d.lowStock.length > 0) && canOrders && (
        <div className="grid gap-3 sm:grid-cols-3">
          {d.unfulfilled > 0 && (
            <Link href="/orders?tab=unfulfilled" className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/50 hover:shadow-sm">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10">
                <ShoppingBag className="size-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{d.unfulfilled} new order{d.unfulfilled === 1 ? "" : "s"} to confirm</span>
                <span className="block text-xs text-muted-foreground">Confirm and ship them quickly</span>
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
            </Link>
          )}
          {incomplete > 0 && (
            <Link href="/orders/incomplete" className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/50 hover:shadow-sm">
              <span className="flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10">
                <ShoppingCart className="size-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{incomplete} incomplete order{incomplete === 1 ? "" : "s"}</span>
                <span className="block text-xs text-muted-foreground">Call or WhatsApp to recover sales</span>
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
            </Link>
          )}
          {d.lowStock.length > 0 && (
            <Link href="/products/inventory?stock=low" className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/50 hover:shadow-sm">
              <span className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10">
                <PackageX className="size-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{d.lowStock.length}+ product{d.lowStock.length === 1 ? "" : "s"} low on stock</span>
                <span className="block text-xs text-muted-foreground">Restock before you run out</span>
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Total sales" value={money(d.kpi.sales)} change={percentChange(d.kpi.sales, d.kpi.salesPrev)} icon={<CircleDollarSign />} hint={`vs previous ${period}d`} />
        <StatCard label="Orders" value={d.kpi.orders.toLocaleString()} change={percentChange(d.kpi.orders, d.kpi.ordersPrev)} icon={<ShoppingBag />} hint={`vs previous ${period}d`} />
        <StatCard label="Avg. order value" value={money(d.kpi.aov)} change={percentChange(d.kpi.aov, d.kpi.aovPrev)} icon={<ChartColumn />} />
        <StatCard label="Conversion rate" value={`${d.kpi.conversion.toFixed(2)}%`} change={d.kpi.conversionPrev ? percentChange(d.kpi.conversion, d.kpi.conversionPrev) : null} icon={<Eye />} hint={`${d.kpi.visitors.toLocaleString()} visitors`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Sales over time"
            description={`Last ${period} days compared with the previous ${period} days`}
            action={
              can(ctx, "analytics.view") ? (
                <Link href="/analytics" className="text-sm font-medium text-primary hover:underline">
                  View report
                </Link>
              ) : undefined
            }
          />
          <div className="px-2 pb-3 pt-4 sm:px-4">
            <SalesChart data={d.chart} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Top products" description={`Best sellers in the last ${period} days`} />
          {d.top.length ? (
            <ul className="divide-y divide-border">
              {d.top.map((p, i) => (
                <li key={`${p.productId}-${i}`}>
                  <Link href={p.productId ? `/products/${p.productId}` : "/products"} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40">
                    <span className="w-4 text-xs font-semibold text-muted-foreground">{i + 1}</span>
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="size-10 rounded-lg border border-border object-cover" />
                    ) : (
                      <span className="size-10 rounded-lg bg-muted" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{p.title}</span>
                      <span className="block text-xs text-muted-foreground">{p.qty} sold</span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums">{money(p.revenue)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<ChartColumn />} title="No sales yet" description="Your best-selling products will show up here." className="py-12" />
          )}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {canOrders && (
          <Card className="lg:col-span-2">
            <CardHeader
              title="Recent orders"
              action={
                <Link href="/orders" className="text-sm font-medium text-primary hover:underline">
                  View all
                </Link>
              }
            />
            {d.recent.length ? (
              <ul className="divide-y divide-border">
                {d.recent.map((o) => (
                  <li key={o.id}>
                    <Link href={`/orders/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-muted/40">
                      <span className="w-16 text-sm font-semibold">#{o.number}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{o.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          <RelativeTime date={o.createdAt} /> · {o.phone ?? o.email ?? ""}
                        </span>
                      </span>
                      <span className="hidden sm:block">
                        <PaymentBadge status={o.paymentStatus} />
                      </span>
                      <FulfillmentBadge status={o.fulfillmentStatus} />
                      <span className="w-24 text-right text-sm font-semibold tabular-nums">{money(o.total)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={<ShoppingBag />}
                title="No orders yet"
                description="Share your store link on Facebook, Instagram and WhatsApp to get your first order."
                action={
                  <a href={url} target="_blank" rel="noreferrer">
                    <Button variant="outline">Open my store</Button>
                  </a>
                }
                className="py-12"
              />
            )}
          </Card>
        )}
        <Card>
          <CardHeader
            title="Low stock"
            description={`Products with ${d.threshold} or fewer left`}
            action={
              <Link href="/products/inventory" className="text-sm font-medium text-primary hover:underline">
                Inventory
              </Link>
            }
          />
          {d.lowStock.length ? (
            <ul className="divide-y divide-border">
              {d.lowStock.map((p) => (
                <li key={p.id}>
                  <Link href={`/products/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40">
                    {p.images[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0].url} alt="" className="size-10 rounded-lg border border-border object-cover" />
                    ) : (
                      <span className="size-10 rounded-lg bg-muted" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.title}</span>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${p.inventory <= 0 ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300" : "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"}`}>
                      {p.inventory <= 0 ? "Out of stock" : `${p.inventory} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<PackageX />} title="All stocked up" description="We'll alert you when products run low." className="py-12" />
          )}
        </Card>
      </div>
    </div>
  );
}
