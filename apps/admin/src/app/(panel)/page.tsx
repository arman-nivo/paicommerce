import Link from "next/link";
import { Activity, AlertTriangle, ArrowRight, BadgeDollarSign, CreditCard, LifeBuoy, Palette, ShoppingBag, Store, TrendingDown, TrendingUp } from "lucide-react";
import { Avatar, Card, CardBody, CardHeader, PageHeader, StatCard } from "@pai/ui";
import { percentChange } from "@pai/core";
import { DonutWithLegend, GmvChart, SignupsChart } from "@/components/charts";
import { StatusBadge } from "@/components/badges";
import { requireAdminPage } from "@/lib/auth";
import { describeAction } from "@/lib/audit-labels";
import { bdt, fmtNum, pct, timeAgo } from "@/lib/format";
import { getOverview } from "@/lib/metrics";

export const metadata = { title: "Overview" };

function Mini({ label, value, href, tone }: { label: string; value: React.ReactNode; href?: string; tone?: string }) {
  const body = (
    <Card className="flex items-center justify-between px-4 py-3 transition hover:border-input">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-display text-lg font-bold tabular-nums ${tone ?? ""}`}>{value}</span>
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const admin = await requireAdminPage();
  const { denied } = await searchParams;
  const m = await getOverview();
  const sc = m.statusCounts;

  return (
    <div className="space-y-6">
      <PageHeader
        className="mb-0"
        title={`Good ${greeting()}, ${admin.name.split(" ")[0]}`}
        description={`Platform health at a glance · ${fmtNum(m.totalStores)} stores · ${fmtNum(m.ordersAll)} orders all-time (${bdt(m.gmvAll)} GMV)`}
      />
      {denied && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <AlertTriangle className="size-4" /> Your role doesn&apos;t have access to that area ({denied}).
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="MRR" value={bdt(m.mrr)} icon={<BadgeDollarSign />} hint={`ARR ${bdt(m.arr)} · ${fmtNum(m.activeSubs)} active subs`} />
        <StatCard label="GMV · 30 days" value={bdt(m.gmv30)} icon={<TrendingUp />} change={percentChange(m.gmv30, m.gmvPrev)} hint="vs previous 30 days" />
        <StatCard label="Orders · 30 days" value={fmtNum(m.orders30)} icon={<ShoppingBag />} change={percentChange(m.orders30, m.ordersPrev)} hint="vs previous 30 days" />
        <StatCard label="New stores · 30 days" value={fmtNum(m.newStores)} icon={<Store />} change={percentChange(m.newStores, m.prevNewStores)} hint="vs previous 30 days" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Mini label="Active stores" value={fmtNum(sc.active ?? 0)} href="/stores?status=active" tone="text-emerald-600" />
        <Mini label="On trial" value={fmtNum(sc.trial ?? 0)} href="/stores?status=trial" tone="text-blue-600" />
        <Mini label="Past due" value={fmtNum(sc.past_due ?? 0)} href="/stores?status=past_due" tone="text-amber-600" />
        <Mini label="Suspended" value={fmtNum(sc.suspended ?? 0)} href="/stores?status=suspended" tone="text-red-600" />
        <Mini label="Trial → paid conversion" value={pct(m.conversion)} />
        <Mini label="Churn · 30 days" value={pct(m.churn)} tone={m.churn > 5 ? "text-red-600" : undefined} />
        <Mini label="Open tickets" value={`${m.tickets.open}${m.tickets.urgent ? ` · ${m.tickets.urgent} urgent` : ""}`} href="/tickets" tone={m.tickets.urgent ? "text-red-600" : undefined} />
        <Mini label="Theme store revenue" value={bdt(m.themeRevenue.total)} href="/themes" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Platform GMV" description="Daily gross merchandise value across all stores, last 30 days" action={<span className="text-sm font-semibold tabular-nums">{bdt(m.gmv30)}</span>} />
          <CardBody className="pb-3 pl-2">
            <GmvChart data={m.gmvSeries} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Plan distribution" description="Stores per plan (excluding closed)" action={<Link href="/plans" className="text-xs text-primary hover:underline">Plans</Link>} />
          <CardBody>{m.planDist.length ? <DonutWithLegend data={m.planDist} /> : <p className="py-12 text-center text-sm text-muted-foreground">No stores yet</p>}</CardBody>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Signups" description="New stores and user accounts per day, last 30 days" />
          <CardBody className="pb-3 pl-2">
            <SignupsChart data={m.signupSeries} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Revenue streams" description="Recurring + marketplace" />
          <CardBody className="space-y-4 text-sm">
            <Row icon={<CreditCard />} label="Subscription MRR" value={bdt(m.mrr)} />
            <Row icon={<TrendingUp />} label="Annual run-rate" value={bdt(m.arr)} />
            <Row icon={<Palette />} label="Theme sales · 30 days" value={bdt(m.themeRevenue.last30)} />
            <Row icon={<Palette />} label="Theme sales · all time" value={`${bdt(m.themeRevenue.total)} (${m.themeRevenue.purchases})`} />
            <Row icon={<BadgeDollarSign />} label="Platform share of theme sales" value={bdt(m.themeRevenue.platform)} />
            <Row icon={<TrendingDown />} label="Cancelled subs · 30 days" value={fmtNum(m.cancelled30)} />
            <Row icon={<LifeBuoy />} label="Tickets awaiting reply" value={fmtNum(m.tickets.open + m.tickets.pending)} />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="Top stores by GMV" description="Last 30 days" action={<Link href="/stores?sort=gmv" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">All stores <ArrowRight className="size-3" /></Link>} />
          {m.topStores.length ? (
            <ul className="divide-y divide-border">
              {m.topStores.map((s, i) => (
                <li key={s.id}>
                  <Link href={`/stores/${s.id}`} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/40">
                    <span className="w-5 text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                    <Avatar name={s.name} size={28} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{s.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {s.slug} · {fmtNum(s.n)} orders
                      </span>
                    </span>
                    <StatusBadge status={s.status} />
                    <span className="w-28 text-right text-sm font-semibold tabular-nums">{bdt(s.gmv)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-12 text-center text-sm text-muted-foreground">No orders in the last 30 days</p>
          )}
        </Card>
        <Card>
          <CardHeader title="Recent activity" description="Latest admin & system events" action={<Link href="/audit" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">Audit log <ArrowRight className="size-3" /></Link>} />
          {m.recent.length ? (
            <ul className="divide-y divide-border">
              {m.recent.map((r) => (
                <li key={r.id} className="flex items-start gap-3 px-5 py-2.5 text-sm">
                  <Activity className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="font-medium">{r.actorName ?? "System"}</span> <span className="text-muted-foreground">{describeAction(r.action).toLowerCase()}</span>{" "}
                    {r.storeId ? (
                      <Link href={`/stores/${r.storeId}`} className="font-medium hover:underline">
                        {r.storeName}
                      </Link>
                    ) : (
                      r.target && <span className="font-medium">{r.target}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-12 text-center text-sm text-muted-foreground">No activity yet</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4">{icon}</span>
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function greeting() {
  const h = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Dhaka" }));
  return h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
}
