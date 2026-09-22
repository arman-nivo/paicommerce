import Link from "next/link";
import { AlertCircle, BadgeDollarSign, CalendarClock, Receipt, TrendingUp, Wallet } from "lucide-react";
import { Card, CardBody, CardHeader, PageHeader, StatCard } from "@pai/ui";
import { percentChange } from "@pai/core";
import { and, asc, count, db, desc, eq, gte, ilike, inArray, lt, lte, or, plans, platformInvoices, sql, stores, subscriptions, type SQL } from "@pai/db";
import { MoneyTrend } from "@/components/charts";
import { StatusBadge, label } from "@/components/badges";
import { FilterBar } from "@/components/filters";
import { LinkTabs } from "@/components/link-tabs";
import { RowCheck, SelectAll, SelectionProvider } from "@/components/selection";
import { DataTable, EmptyRow, Pagination, SortTH, TD, TH, THead, TR } from "@/components/table";
import { requireAdminPage } from "@/lib/auth";
import { bdt, fmtDate, fmtNum } from "@/lib/format";
import { getMrr } from "@/lib/metrics";
import { dateParam, escapeLike, listParams, oneOf, str, type SearchParams } from "@/lib/params";
import { can } from "@/lib/roles";
import { InvoiceBulk, InvoiceRowActions, NewInvoiceButton, SubscriptionRowActions } from "./billing-client";

export const metadata = { title: "Billing" };
const TABS = ["overview", "subscriptions", "invoices"] as const;

export default async function BillingPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const admin = await requireAdminPage();
  const params = await searchParams;
  const tab = oneOf(params, "tab", TABS) ?? "overview";
  const canManage = can(admin.role, "billing.manage");
  return (
    <div>
      <PageHeader title="Billing" description="Platform subscriptions, invoices and revenue" actions={canManage && <NewInvoiceButton />} />
      <Card className="overflow-hidden">
        <LinkTabs
          base="/billing"
          params={params}
          current={tab}
          tabs={[
            { value: "overview", label: "Revenue" },
            { value: "subscriptions", label: "Subscriptions" },
            { value: "invoices", label: "Invoices" },
          ]}
        />
        {tab === "overview" && <RevenueTab />}
        {tab === "subscriptions" && <SubscriptionsTab params={params} canManage={canManage} />}
        {tab === "invoices" && <InvoicesTab params={params} canManage={canManage} />}
      </Card>
    </div>
  );
}

async function RevenueTab() {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const lastMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const yearAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  const sum = sql<number>`coalesce(sum(${platformInvoices.amount}),0)`.mapWith(Number);
  const monthExpr = sql<string>`to_char(${platformInvoices.paidAt} at time zone 'Asia/Dhaka', 'YYYY-MM')`;
  const [mrr, [thisMonth], [lastMonth], [outstanding], [overdue], [allTime], monthly, byPlan, [subStats]] = await Promise.all([
    getMrr(),
    db.select({ v: sum, n: count() }).from(platformInvoices).where(and(eq(platformInvoices.status, "paid"), gte(platformInvoices.paidAt, monthStart))),
    db.select({ v: sum, n: count() }).from(platformInvoices).where(and(eq(platformInvoices.status, "paid"), gte(platformInvoices.paidAt, lastMonthStart), lt(platformInvoices.paidAt, monthStart))),
    db.select({ v: sum, n: count() }).from(platformInvoices).where(eq(platformInvoices.status, "open")),
    db.select({ v: sum, n: count() }).from(platformInvoices).where(and(eq(platformInvoices.status, "open"), lt(platformInvoices.dueAt, now))),
    db.select({ v: sum, n: count() }).from(platformInvoices).where(eq(platformInvoices.status, "paid")),
    db.select({ month: monthExpr, v: sum }).from(platformInvoices).where(and(eq(platformInvoices.status, "paid"), gte(platformInvoices.paidAt, yearAgo))).groupBy(monthExpr),
    db
      .select({
        name: plans.name,
        n: count(),
        mrr: sql<number>`coalesce(sum(case when ${subscriptions.interval} = 'yearly' then ${plans.priceYearly} / 12.0 else ${plans.priceMonthly} end),0)`.mapWith(Number),
      })
      .from(subscriptions)
      .innerJoin(plans, eq(plans.id, subscriptions.planId))
      .where(eq(subscriptions.status, "active"))
      .groupBy(plans.name, plans.sort)
      .orderBy(asc(plans.sort)),
    db
      .select({
        trialing: sql<number>`count(*) filter (where ${subscriptions.status} = 'trialing')`.mapWith(Number),
        pastDue: sql<number>`count(*) filter (where ${subscriptions.status} = 'past_due')`.mapWith(Number),
        cancelling: sql<number>`count(*) filter (where ${subscriptions.cancelAtPeriodEnd} and ${subscriptions.status} = 'active')`.mapWith(Number),
        renewing7: sql<number>`count(*) filter (where ${subscriptions.status} = 'active' and ${subscriptions.currentPeriodEnd} < now() + interval '7 days')`.mapWith(Number),
      })
      .from(subscriptions),
  ]);
  const mMap = new Map(monthly.map((m) => [m.month, m.v]));
  const series = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + i, 1));
    const k = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    return { day: d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }), collected: mMap.get(k) ?? 0 };
  });
  return (
    <div className="space-y-5 p-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="MRR" value={bdt(mrr.mrr)} icon={<BadgeDollarSign />} hint={`ARR ${bdt(mrr.mrr * 12)} · ${fmtNum(mrr.activeSubs)} active`} />
        <StatCard label="Collected this month" value={bdt(thisMonth?.v)} icon={<Wallet />} change={percentChange(thisMonth?.v ?? 0, lastMonth?.v ?? 0)} hint={`vs ${bdt(lastMonth?.v)} last month`} />
        <StatCard label="Outstanding" value={bdt(outstanding?.v)} icon={<Receipt />} hint={`${fmtNum(outstanding?.n)} open invoices`} />
        <StatCard label="Overdue" value={bdt(overdue?.v)} icon={<AlertCircle />} hint={`${fmtNum(overdue?.n)} past due date`} />
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Collected revenue" description="Paid platform invoices per month (last 12 months)" action={<span className="text-sm font-semibold">{bdt(allTime?.v)} all time</span>} />
          <CardBody className="pl-1">
            <MoneyTrend data={series} keys={[{ key: "collected", label: "Collected" }]} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="MRR by plan" />
          <CardBody className="space-y-3">
            {byPlan.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No active subscriptions</p>}
            {byPlan.map((p) => (
              <div key={p.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>
                    {p.name} <span className="text-xs text-muted-foreground">· {p.n} subs</span>
                  </span>
                  <span className="font-semibold tabular-nums">{bdt(p.mrr)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${mrr.mrr ? Math.max(2, (p.mrr / mrr.mrr) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
              <Link href="/billing?tab=subscriptions&status=trialing" className="rounded-lg bg-muted/60 p-2 hover:bg-muted">
                <div className="text-muted-foreground">Trialing</div>
                <div className="text-base font-semibold">{subStats?.trialing ?? 0}</div>
              </Link>
              <Link href="/billing?tab=subscriptions&status=past_due" className="rounded-lg bg-muted/60 p-2 hover:bg-muted">
                <div className="text-muted-foreground">Past due</div>
                <div className="text-base font-semibold text-amber-600">{subStats?.pastDue ?? 0}</div>
              </Link>
              <div className="rounded-lg bg-muted/60 p-2">
                <div className="text-muted-foreground">Cancelling</div>
                <div className="text-base font-semibold">{subStats?.cancelling ?? 0}</div>
              </div>
              <div className="rounded-lg bg-muted/60 p-2">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <CalendarClock className="size-3" /> Renew ≤ 7d
                </div>
                <div className="text-base font-semibold">{subStats?.renewing7 ?? 0}</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <TrendingUp className="size-3.5" /> MRR = Σ active subscriptions × plan price (yearly ÷ 12). Collected revenue counts invoices with status “paid” by payment date.
      </p>
    </div>
  );
}

async function SubscriptionsTab({ params, canManage }: { params: SearchParams; canManage: boolean }) {
  const { page, size, offset, sort, dir } = listParams(params, ["created", "period", "store"] as const, "created");
  const conds: (SQL | undefined)[] = [];
  const status = oneOf(params, "status", ["trialing", "active", "past_due", "cancelled"] as const);
  if (status) conds.push(eq(subscriptions.status, status));
  const interval = oneOf(params, "interval", ["monthly", "yearly"] as const);
  if (interval) conds.push(eq(subscriptions.interval, interval));
  const plan = str(params, "plan");
  if (plan) conds.push(eq(plans.code, plan));
  const q = str(params, "q");
  if (q) conds.push(or(ilike(stores.name, `%${escapeLike(q)}%`), ilike(stores.slug, `%${escapeLike(q)}%`)));
  const where = conds.length ? and(...(conds as SQL[])) : undefined;
  const orderBy = { created: dir === "asc" ? asc(subscriptions.createdAt) : desc(subscriptions.createdAt), period: dir === "asc" ? asc(subscriptions.currentPeriodEnd) : desc(subscriptions.currentPeriodEnd), store: dir === "asc" ? asc(stores.name) : desc(stores.name) }[sort];
  const [rows, [{ n }], planRows] = await Promise.all([
    db
      .select({ s: subscriptions, storeName: stores.name, storeSlug: stores.slug, planName: plans.name, priceMonthly: plans.priceMonthly, priceYearly: plans.priceYearly })
      .from(subscriptions)
      .innerJoin(stores, eq(stores.id, subscriptions.storeId))
      .innerJoin(plans, eq(plans.id, subscriptions.planId))
      .where(where)
      .orderBy(orderBy)
      .limit(size)
      .offset(offset),
    db.select({ n: count() }).from(subscriptions).innerJoin(stores, eq(stores.id, subscriptions.storeId)).innerJoin(plans, eq(plans.id, subscriptions.planId)).where(where),
    db.select({ code: plans.code, name: plans.name }).from(plans).orderBy(asc(plans.sort)),
  ]);
  const sp = { base: "/billing", params, sort, dir };
  return (
    <>
      <FilterBar
        search="Search store…"
        filters={[
          { key: "status", label: "Status", options: ["active", "trialing", "past_due", "cancelled"].map((v) => ({ value: v, label: label(v) })) },
          { key: "plan", label: "Plan", options: planRows.map((p) => ({ value: p.code, label: p.name })) },
          { key: "interval", label: "Interval", options: [{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }] },
        ]}
      />
      <DataTable>
        <THead>
          <SortTH label="Store" field="store" {...sp} />
          <TH>Plan</TH>
          <TH>Status</TH>
          <TH>Interval</TH>
          <TH align="right">MRR</TH>
          <SortTH label="Period ends" field="period" {...sp} />
          <TH>Provider</TH>
          <SortTH label="Created" field="created" {...sp} />
          {canManage && <TH className="w-10" />}
        </THead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={9} title="No subscriptions" />}
          {rows.map(({ s, storeName, storeSlug, planName, priceMonthly, priceYearly }) => (
            <TR key={s.id}>
              <TD>
                <Link href={`/stores/${s.storeId}?tab=billing`} className="font-medium hover:underline">
                  {storeName}
                </Link>
                <div className="text-xs text-muted-foreground">{storeSlug}</div>
              </TD>
              <TD>{planName}</TD>
              <TD>
                <StatusBadge status={s.status} />
                {s.cancelAtPeriodEnd && <div className="mt-0.5 text-[11px] text-amber-600">cancels at period end</div>}
              </TD>
              <TD>{label(s.interval)}</TD>
              <TD align="right">{s.status === "active" ? bdt(s.interval === "yearly" ? priceYearly / 12 : priceMonthly) : <span className="text-muted-foreground">—</span>}</TD>
              <TD className={`text-xs ${s.status === "active" && s.currentPeriodEnd.getTime() < Date.now() ? "font-medium text-red-600" : ""}`}>{fmtDate(s.currentPeriodEnd)}</TD>
              <TD className="text-xs text-muted-foreground">{s.provider ?? "—"}</TD>
              <TD className="text-xs text-muted-foreground">{fmtDate(s.createdAt)}</TD>
              {canManage && (
                <TD>
                  <SubscriptionRowActions id={s.id} status={s.status} cancelAtPeriodEnd={s.cancelAtPeriodEnd} />
                </TD>
              )}
            </TR>
          ))}
        </tbody>
      </DataTable>
      <Pagination base="/billing" params={params} page={page} size={size} total={n} />
    </>
  );
}

async function InvoicesTab({ params, canManage }: { params: SearchParams; canManage: boolean }) {
  const { page, size, offset, sort, dir } = listParams(params, ["created", "amount", "due", "number"] as const, "created");
  const conds: (SQL | undefined)[] = [];
  const status = oneOf(params, "status", ["draft", "open", "paid", "void", "uncollectible"] as const);
  if (status) conds.push(eq(platformInvoices.status, status));
  if (str(params, "status") === "overdue") conds.push(and(eq(platformInvoices.status, "open"), lt(platformInvoices.dueAt, new Date())));
  const q = str(params, "q");
  if (q) {
    const like = `%${escapeLike(q)}%`;
    conds.push(or(ilike(platformInvoices.number, like), ilike(stores.name, like), ilike(stores.slug, like), ilike(platformInvoices.description, like), /^[0-9a-f-]{36}$/i.test(q) ? eq(stores.id, q) : undefined));
  }
  const from = dateParam(params, "from");
  const to = dateParam(params, "to", true);
  if (from) conds.push(gte(platformInvoices.createdAt, from));
  if (to) conds.push(lte(platformInvoices.createdAt, to));
  const where = conds.length ? and(...(conds as SQL[])) : undefined;
  const d = dir === "asc" ? asc : desc;
  const orderBy = { created: d(platformInvoices.createdAt), amount: d(platformInvoices.amount), due: d(platformInvoices.dueAt), number: d(platformInvoices.number) }[sort];
  const [rows, [agg], statusCounts] = await Promise.all([
    db
      .select({ i: platformInvoices, storeName: stores.name, storeSlug: stores.slug })
      .from(platformInvoices)
      .innerJoin(stores, eq(stores.id, platformInvoices.storeId))
      .where(where)
      .orderBy(orderBy)
      .limit(size)
      .offset(offset),
    db
      .select({ n: count(), sum: sql<number>`coalesce(sum(${platformInvoices.amount}),0)`.mapWith(Number) })
      .from(platformInvoices)
      .innerJoin(stores, eq(stores.id, platformInvoices.storeId))
      .where(where),
    db.select({ status: platformInvoices.status, n: count() }).from(platformInvoices).groupBy(platformInvoices.status),
  ]);
  const sc = Object.fromEntries(statusCounts.map((r) => [r.status, r.n])) as Record<string, number>;
  const sp = { base: "/billing", params, sort, dir };
  const selectable = rows.filter((r) => ["draft", "open", "uncollectible"].includes(r.i.status)).map((r) => r.i.id);
  return (
    <SelectionProvider ids={selectable}>
      <FilterBar
        search="Invoice #, store or description…"
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              ...["open", "paid", "draft", "void", "uncollectible"].map((v) => ({ value: v, label: `${label(v)} (${sc[v] ?? 0})` })),
              { value: "overdue", label: "Overdue" },
            ],
          },
        ]}
        dates={{ from: "from", to: "to", label: "Issued" }}
      >
        <span className="ml-auto text-xs text-muted-foreground">
          {fmtNum(agg?.n)} invoices · <span className="font-medium text-foreground">{bdt(agg?.sum)}</span>
        </span>
      </FilterBar>
      <DataTable>
        <THead>
          {canManage && (
            <TH className="w-8">
              <SelectAll />
            </TH>
          )}
          <SortTH label="Number" field="number" {...sp} />
          <TH>Store</TH>
          <TH>Description</TH>
          <TH>Status</TH>
          <SortTH label="Amount" field="amount" align="right" {...sp} />
          <SortTH label="Due" field="due" {...sp} />
          <TH>Paid</TH>
          <SortTH label="Issued" field="created" {...sp} />
          <TH className="w-10" />
        </THead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={10} title="No invoices" />}
          {rows.map(({ i, storeName, storeSlug }) => {
            const overdue = i.status === "open" && i.dueAt && i.dueAt.getTime() < Date.now();
            return (
              <TR key={i.id}>
                {canManage && <TD>{["draft", "open", "uncollectible"].includes(i.status) && <RowCheck id={i.id} />}</TD>}
                <TD>
                  <Link href={`/invoices/${i.id}`} target="_blank" className="font-mono text-xs font-medium text-primary hover:underline">
                    {i.number}
                  </Link>
                </TD>
                <TD>
                  <Link href={`/stores/${i.storeId}?tab=billing`} className="hover:underline">
                    {storeName}
                  </Link>
                  <div className="text-xs text-muted-foreground">{storeSlug}</div>
                </TD>
                <TD className="max-w-[260px] truncate text-sm">{i.description}</TD>
                <TD>
                  <StatusBadge status={i.status} />
                  {overdue && <div className="mt-0.5 text-[11px] font-medium text-red-600">overdue</div>}
                </TD>
                <TD align="right" className="font-medium">
                  {bdt(i.amount)}
                </TD>
                <TD className={`text-xs ${overdue ? "text-red-600" : ""}`}>{fmtDate(i.dueAt)}</TD>
                <TD className="text-xs">{i.paidAt ? `${fmtDate(i.paidAt)}${i.paymentMethod ? ` · ${i.paymentMethod}` : ""}` : "—"}</TD>
                <TD className="text-xs text-muted-foreground">{fmtDate(i.createdAt)}</TD>
                <TD>
                  <InvoiceRowActions id={i.id} status={i.status} canManage={canManage} />
                </TD>
              </TR>
            );
          })}
        </tbody>
      </DataTable>
      <Pagination base="/billing" params={params} page={page} size={size} total={agg?.n ?? 0} />
      {canManage && <InvoiceBulk />}
    </SelectionProvider>
  );
}
