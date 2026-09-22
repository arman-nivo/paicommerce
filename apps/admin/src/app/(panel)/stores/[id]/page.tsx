import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe, Mail, Phone, ShieldCheck } from "lucide-react";
import { Avatar, Badge, Card, CardBody, CardHeader } from "@pai/ui";
import { storeUrl, STOREFRONT_ROOT_DOMAIN } from "@pai/core";
import {
  and,
  asc,
  auditLogs,
  count,
  customers,
  db,
  desc,
  eq,
  gte,
  ilike,
  ne,
  or,
  orders,
  platformInvoices,
  plans,
  products,
  sql,
  storeIntegrations,
  storeMembers,
  storeThemes,
  stores,
  subscriptions,
  themePurchases,
  themes,
  users,
  type SQL,
} from "@pai/db";
import { MoneyTrend } from "@/components/charts";
import { RoleBadge, StatusBadge, label } from "@/components/badges";
import { FilterBar } from "@/components/filters";
import { BackLink, DL, LinkTabs } from "@/components/link-tabs";
import { DataTable, EmptyRow, Pagination, TD, TH, THead, TR } from "@/components/table";
import { requireAdminPage } from "@/lib/auth";
import { describeAction } from "@/lib/audit-labels";
import { bdt, dayKey, fmtDate, fmtDateTime, fmtNum, timeAgo } from "@/lib/format";
import { escapeLike, listParams, oneOf, str, type SearchParams } from "@/lib/params";
import { can } from "@/lib/roles";
import { addStoreNote } from "../actions";
import { NoteForm, StoreActions } from "./store-actions";

const TABS = ["overview", "orders", "billing", "staff", "themes", "integrations", "activity"] as const;
type Tab = (typeof TABS)[number];

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { title: "Store" };
  const s = await db.query.stores.findFirst({ where: eq(stores.id, id), columns: { name: true } });
  return { title: s?.name ?? "Store" };
}

export default async function StoreDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> }) {
  const admin = await requireAdminPage();
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const store = await db.query.stores.findFirst({ where: eq(stores.id, id), with: { owner: true, plan: true } });
  if (!store) notFound();
  const tab: Tab = oneOf(sp, "tab", TABS) ?? "overview";

  const liveOrders = and(eq(orders.storeId, id), ne(orders.status, "cancelled"));
  const [[stats], [productCount], [customerCount], [memberCount], [lastAudit], allPlans] = await Promise.all([
    db
      .select({ gmv: sql<number>`coalesce(sum(${orders.total}),0)`.mapWith(Number), n: count(), last: sql<string | null>`max(${orders.createdAt})` })
      .from(orders)
      .where(liveOrders),
    db.select({ n: count() }).from(products).where(eq(products.storeId, id)),
    db.select({ n: count() }).from(customers).where(eq(customers.storeId, id)),
    db.select({ n: count() }).from(storeMembers).where(eq(storeMembers.storeId, id)),
    db.select({ at: auditLogs.createdAt }).from(auditLogs).where(eq(auditLogs.storeId, id)).orderBy(desc(auditLogs.createdAt)).limit(1),
    db.select({ id: plans.id, name: plans.name, priceMonthly: plans.priceMonthly, priceYearly: plans.priceYearly, active: plans.active }).from(plans).orderBy(asc(plans.sort)),
  ]);

  const activityDates = [store.updatedAt, stats?.last ? new Date(stats.last) : null, lastAudit?.at ?? null, store.owner.lastLoginAt].filter(Boolean) as Date[];
  const lastActivity = activityDates.sort((a, b) => b.getTime() - a.getTime())[0];
  const url = storeUrl(store);
  const base = `/stores/${id}`;

  return (
    <div className="space-y-5">
      <div>
        <BackLink href="/stores">Stores</BackLink>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={store.name} src={store.logoUrl} size={48} className="rounded-xl" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight">{store.name}</h1>
                <StatusBadge status={store.status} />
                {store.plan && <Badge tone="brand">{store.plan.name}</Badge>}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {store.slug}.{STOREFRONT_ROOT_DOMAIN} · {label(store.category)} · created {fmtDate(store.createdAt)}
              </p>
            </div>
          </div>
          <StoreActions
            store={{ id: store.id, status: store.status, planId: store.planId, customDomain: store.customDomain, domainVerified: store.domainVerified, ownerEmail: store.owner.email }}
            plans={allPlans}
            storefrontUrl={url}
            canManage={can(admin.role, "stores.manage")}
            canImpersonate={can(admin.role, "stores.impersonate")}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="GMV (all time)" value={bdt(stats?.gmv)} />
        <Kpi label="Orders" value={fmtNum(stats?.n)} />
        <Kpi label="Products" value={fmtNum(productCount?.n)} />
        <Kpi label="Customers" value={fmtNum(customerCount?.n)} />
        <Kpi label="Last activity" value={lastActivity ? timeAgo(lastActivity) : "—"} />
      </div>

      <Card className="overflow-hidden">
        <LinkTabs
          base={base}
          params={sp}
          current={tab}
          tabs={[
            { value: "overview", label: "Overview" },
            { value: "orders", label: "Orders", count: stats?.n },
            { value: "billing", label: "Subscription & invoices" },
            { value: "staff", label: "Staff", count: memberCount?.n },
            { value: "themes", label: "Themes" },
            { value: "integrations", label: "Integrations" },
            { value: "activity", label: "Audit log" },
          ]}
        />
        {tab === "overview" && <OverviewTab store={store} url={url} lastOrder={stats?.last ?? null} canNote={can(admin.role, "tickets")} />}
        {tab === "orders" && <OrdersTab storeId={id} sp={sp} base={base} />}
        {tab === "billing" && <BillingTab storeId={id} />}
        {tab === "staff" && <StaffTab storeId={id} />}
        {tab === "themes" && <ThemesTab storeId={id} />}
        {tab === "integrations" && <IntegrationsTab storeId={id} />}
        {tab === "activity" && <ActivityTab storeId={id} sp={sp} base={base} />}
      </Card>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card className="px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-lg font-bold tabular-nums">{value}</div>
    </Card>
  );
}

type StoreWith = NonNullable<Awaited<ReturnType<typeof db.query.stores.findFirst<{ with: { owner: true; plan: true } }>>>>;

async function OverviewTab({ store, url, lastOrder, canNote }: { store: StoreWith; url: string; lastOrder: string | null; canNote: boolean }) {
  const d30 = new Date(Date.now() - 30 * 86400_000);
  const dayExpr = sql<string>`to_char(${orders.createdAt} at time zone 'Asia/Dhaka', 'YYYY-MM-DD')`;
  const [daily, notes, [sub]] = await Promise.all([
    db
      .select({ day: dayExpr, gmv: sql<number>`coalesce(sum(${orders.total}),0)`.mapWith(Number) })
      .from(orders)
      .where(and(eq(orders.storeId, store.id), ne(orders.status, "cancelled"), gte(orders.createdAt, d30)))
      .groupBy(dayExpr),
    db
      .select({ id: auditLogs.id, meta: auditLogs.meta, createdAt: auditLogs.createdAt, author: users.name })
      .from(auditLogs)
      .leftJoin(users, eq(users.id, auditLogs.actorId))
      .where(and(eq(auditLogs.storeId, store.id), eq(auditLogs.action, "store.note")))
      .orderBy(desc(auditLogs.createdAt))
      .limit(20),
    db.select().from(subscriptions).where(eq(subscriptions.storeId, store.id)).orderBy(desc(subscriptions.createdAt)).limit(1),
  ]);
  const map = new Map(daily.map((d) => [d.day, d.gmv]));
  const series = Array.from({ length: 30 }, (_, i) => {
    const k = dayKey(new Date(Date.now() - (29 - i) * 86400_000));
    return { day: k.slice(5), gmv: map.get(k) ?? 0 };
  });
  const trialLeft = store.trialEndsAt ? Math.ceil((store.trialEndsAt.getTime() - Date.now()) / 86400_000) : null;

  return (
    <div className="grid gap-5 p-5 xl:grid-cols-3">
      <div className="space-y-5 xl:col-span-2">
        <Card>
          <CardHeader title="Sales · last 30 days" />
          <CardBody className="pl-1">
            <MoneyTrend data={series} keys={[{ key: "gmv", label: "GMV" }]} />
          </CardBody>
        </Card>
        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <CardHeader title="Owner" action={<Link href={`/users/${store.owner.id}`} className="text-xs text-primary hover:underline">View user</Link>} />
            <CardBody className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar name={store.owner.name} src={store.owner.avatarUrl} size={40} />
                <div className="min-w-0">
                  <div className="font-medium">{store.owner.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{store.owner.email}</div>
                </div>
              </div>
              <DL
                items={[
                  [<span key="p" className="inline-flex items-center gap-1.5"><Phone className="size-3.5" /> Phone</span>, store.owner.phone ?? store.phone ?? "—"],
                  [<span key="m" className="inline-flex items-center gap-1.5"><Mail className="size-3.5" /> Store email</span>, store.email ?? "—"],
                  ["Last login", store.owner.lastLoginAt ? timeAgo(store.owner.lastLoginAt) : "Never"],
                  ["Account", store.owner.disabled ? <StatusBadge key="d" status="suspended" /> : <StatusBadge key="a" status="active" />],
                ]}
              />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Plan & domain" />
            <CardBody>
              <DL
                items={[
                  ["Plan", store.plan?.name ?? "No plan"],
                  ["Subscription", sub ? <span key="s">{label(sub.status)} · {sub.interval}</span> : "—"],
                  ["Renews / ends", sub ? fmtDate(sub.currentPeriodEnd) : "—"],
                  ["Trial ends", store.trialEndsAt ? `${fmtDate(store.trialEndsAt)}${store.status === "trial" && trialLeft !== null ? ` (${trialLeft > 0 ? trialLeft + "d left" : "expired"})` : ""}` : "—"],
                  [
                    "Storefront",
                    <a key="u" href={url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {url.replace(/^https?:\/\//, "")}
                    </a>,
                  ],
                  [
                    "Custom domain",
                    store.customDomain ? (
                      <span key="d" className="inline-flex items-center gap-1.5">
                        <Globe className="size-3.5 text-muted-foreground" /> {store.customDomain}{" "}
                        {store.domainVerified ? <ShieldCheck className="size-3.5 text-emerald-600" /> : <Badge tone="yellow">unverified</Badge>}
                      </span>
                    ) : (
                      "—"
                    ),
                  ],
                  ["Currency / locale", `${store.currency} · ${store.locale} · ${store.timezone}`],
                  ["Onboarding", store.onboardingCompleted ? "Completed" : "In progress"],
                  ["Last order", lastOrder ? timeAgo(lastOrder) : "—"],
                ]}
              />
            </CardBody>
          </Card>
        </div>
      </div>
      <Card className="h-fit">
        <CardHeader title="Internal notes" description="Only visible to the PaiCommerce team" />
        <CardBody className="space-y-4">
          {canNote && <NoteForm storeId={store.id} action={addStoreNote} />}
          {notes.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No notes yet</p>
          ) : (
            <ul className="space-y-3">
              {notes.map((n) => (
                <li key={n.id} className="rounded-lg bg-muted/60 p-3 text-sm">
                  <p className="whitespace-pre-wrap">{String((n.meta as { note?: string } | null)?.note ?? "")}</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {n.author ?? "System"} · {timeAgo(n.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

async function OrdersTab({ storeId, sp, base }: { storeId: string; sp: SearchParams; base: string }) {
  const { page, size, offset } = listParams(sp, ["created"] as const, "created");
  const conds: (SQL | undefined)[] = [eq(orders.storeId, storeId)];
  const q = str(sp, "q");
  if (q) {
    const n = Number(q.replace(/^#/, ""));
    const like = `%${escapeLike(q)}%`;
    conds.push(or(Number.isInteger(n) && n > 0 && n < 2e9 ? eq(orders.number, n) : undefined, ilike(orders.name, like), ilike(orders.phone, like), ilike(orders.email, like)));
  }
  const fs = oneOf(sp, "fulfillment", ["unfulfilled", "confirmed", "processing", "shipped", "delivered", "returned", "cancelled"] as const);
  if (fs) conds.push(eq(orders.fulfillmentStatus, fs));
  const ps = oneOf(sp, "payment", ["pending", "authorized", "paid", "partially_refunded", "refunded", "failed"] as const);
  if (ps) conds.push(eq(orders.paymentStatus, ps));
  const where = and(...conds);
  const [rows, [{ n }]] = await Promise.all([
    db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(size).offset(offset),
    db.select({ n: count() }).from(orders).where(where),
  ]);
  return (
    <>
      <FilterBar
        search="Order #, customer name, phone or email…"
        filters={[
          { key: "fulfillment", label: "Fulfilment", options: ["unfulfilled", "confirmed", "processing", "shipped", "delivered", "returned", "cancelled"].map((v) => ({ value: v, label: label(v) })) },
          { key: "payment", label: "Payment", options: ["pending", "authorized", "paid", "partially_refunded", "refunded", "failed"].map((v) => ({ value: v, label: label(v) })) },
        ]}
      />
      <DataTable maxHeight="calc(100vh - 380px)">
        <THead>
          <TH>Order</TH>
          <TH>Customer</TH>
          <TH>Payment</TH>
          <TH>Fulfilment</TH>
          <TH>Source</TH>
          <TH align="right">Total</TH>
          <TH>Date</TH>
        </THead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={7} title="No orders" description="This store has no matching orders." />}
          {rows.map((o) => (
            <TR key={o.id}>
              <TD>
                <Link href={`${base}/orders/${o.id}`} className="font-medium text-primary hover:underline">
                  #{o.number}
                </Link>
              </TD>
              <TD>
                <div className="max-w-[200px] truncate">{o.name}</div>
                <div className="text-xs text-muted-foreground">{o.phone ?? o.email ?? ""}</div>
              </TD>
              <TD>
                <StatusBadge status={o.paymentStatus === "pending" ? "pending" : o.paymentStatus} />
                <div className="mt-0.5 text-[11px] uppercase text-muted-foreground">{o.paymentMethod}</div>
              </TD>
              <TD>
                <Badge tone={o.fulfillmentStatus === "delivered" ? "green" : o.fulfillmentStatus === "cancelled" || o.fulfillmentStatus === "returned" ? "red" : o.fulfillmentStatus === "shipped" ? "blue" : "gray"}>{label(o.fulfillmentStatus)}</Badge>
              </TD>
              <TD className="text-xs text-muted-foreground">{o.source}</TD>
              <TD align="right" className="font-medium">
                {bdt(o.total)}
              </TD>
              <TD className="text-xs text-muted-foreground">{fmtDateTime(o.createdAt)}</TD>
            </TR>
          ))}
        </tbody>
      </DataTable>
      <Pagination base={base} params={sp} page={page} size={size} total={n} />
    </>
  );
}

async function BillingTab({ storeId }: { storeId: string }) {
  const [subs, invoices] = await Promise.all([
    db
      .select({ s: subscriptions, planName: plans.name })
      .from(subscriptions)
      .innerJoin(plans, eq(plans.id, subscriptions.planId))
      .where(eq(subscriptions.storeId, storeId))
      .orderBy(desc(subscriptions.createdAt)),
    db.select().from(platformInvoices).where(eq(platformInvoices.storeId, storeId)).orderBy(desc(platformInvoices.createdAt)).limit(100),
  ]);
  return (
    <div className="space-y-5 p-5">
      <Card className="overflow-hidden">
        <CardHeader title="Subscriptions" />
        <DataTable maxHeight="none">
          <THead>
            <TH>Plan</TH>
            <TH>Status</TH>
            <TH>Interval</TH>
            <TH>Current period</TH>
            <TH>Provider</TH>
            <TH>Created</TH>
          </THead>
          <tbody>
            {subs.length === 0 && <EmptyRow colSpan={6} title="No subscriptions" description="The store has never subscribed." />}
            {subs.map(({ s, planName }) => (
              <TR key={s.id}>
                <TD className="font-medium">{planName}</TD>
                <TD>
                  <StatusBadge status={s.status} />
                  {s.cancelAtPeriodEnd && <span className="ml-2 text-xs text-amber-600">cancels at period end</span>}
                </TD>
                <TD>{label(s.interval)}</TD>
                <TD className="text-xs">
                  {fmtDate(s.currentPeriodStart)} → {fmtDate(s.currentPeriodEnd)}
                </TD>
                <TD className="text-xs text-muted-foreground">{s.provider ?? "—"}</TD>
                <TD className="text-xs text-muted-foreground">{fmtDate(s.createdAt)}</TD>
              </TR>
            ))}
          </tbody>
        </DataTable>
      </Card>
      <Card className="overflow-hidden">
        <CardHeader title="Invoices" action={<Link href={`/billing?tab=invoices&q=${storeId}`} className="text-xs text-primary hover:underline">Manage in billing</Link>} />
        <DataTable maxHeight="none">
          <THead>
            <TH>Number</TH>
            <TH>Description</TH>
            <TH>Status</TH>
            <TH align="right">Amount</TH>
            <TH>Due</TH>
            <TH>Paid</TH>
          </THead>
          <tbody>
            {invoices.length === 0 && <EmptyRow colSpan={6} title="No invoices" description="Nothing billed yet." />}
            {invoices.map((i) => (
              <TR key={i.id}>
                <TD>
                  <Link href={`/invoices/${i.id}`} target="_blank" className="font-mono text-xs text-primary hover:underline">
                    {i.number}
                  </Link>
                </TD>
                <TD className="max-w-[280px] truncate">{i.description}</TD>
                <TD>
                  <StatusBadge status={i.status} />
                </TD>
                <TD align="right" className="font-medium">
                  {bdt(i.amount)}
                </TD>
                <TD className="text-xs">{fmtDate(i.dueAt)}</TD>
                <TD className="text-xs">{i.paidAt ? `${fmtDate(i.paidAt)}${i.paymentMethod ? " · " + i.paymentMethod : ""}` : "—"}</TD>
              </TR>
            ))}
          </tbody>
        </DataTable>
      </Card>
    </div>
  );
}

async function StaffTab({ storeId }: { storeId: string }) {
  const rows = await db
    .select({ m: storeMembers, u: users })
    .from(storeMembers)
    .innerJoin(users, eq(users.id, storeMembers.userId))
    .where(eq(storeMembers.storeId, storeId))
    .orderBy(asc(storeMembers.createdAt));
  return (
    <DataTable maxHeight="none">
      <THead>
        <TH>Member</TH>
        <TH>Role</TH>
        <TH>Permissions</TH>
        <TH>Last login</TH>
        <TH>Added</TH>
      </THead>
      <tbody>
        {rows.length === 0 && <EmptyRow colSpan={5} title="No staff" description="Only the owner has access." />}
        {rows.map(({ m, u }) => (
          <TR key={u.id}>
            <TD>
              <Link href={`/users/${u.id}`} className="flex items-center gap-2.5">
                <Avatar name={u.name} src={u.avatarUrl} size={28} />
                <span>
                  <span className="block font-medium hover:underline">{u.name}</span>
                  <span className="block text-xs text-muted-foreground">{u.email}</span>
                </span>
              </Link>
            </TD>
            <TD>
              <Badge tone={m.role === "owner" ? "brand" : m.role === "admin" ? "purple" : "gray"}>{label(m.role)}</Badge>
              {u.disabled && <Badge tone="red" className="ml-1">disabled</Badge>}
            </TD>
            <TD className="max-w-[360px] whitespace-normal text-xs text-muted-foreground">{m.role === "staff" ? m.permissions.join(", ") || "None" : "All permissions"}</TD>
            <TD className="text-xs">{u.lastLoginAt ? timeAgo(u.lastLoginAt) : "Never"}</TD>
            <TD className="text-xs text-muted-foreground">{fmtDate(m.createdAt)}</TD>
          </TR>
        ))}
      </tbody>
    </DataTable>
  );
}

async function ThemesTab({ storeId }: { storeId: string }) {
  const [installed, purchases] = await Promise.all([
    db.select().from(storeThemes).where(eq(storeThemes.storeId, storeId)).orderBy(asc(storeThemes.role), desc(storeThemes.updatedAt)),
    db
      .select({ p: themePurchases, name: themes.name, slug: themes.slug })
      .from(themePurchases)
      .innerJoin(themes, eq(themes.id, themePurchases.themeId))
      .where(eq(themePurchases.storeId, storeId))
      .orderBy(desc(themePurchases.createdAt)),
  ]);
  return (
    <div className="space-y-5 p-5">
      <Card className="overflow-hidden">
        <CardHeader title="Theme library" />
        <DataTable maxHeight="none">
          <THead>
            <TH>Theme</TH>
            <TH>Role</TH>
            <TH>Preset</TH>
            <TH>Customised</TH>
            <TH>Published</TH>
            <TH>Updated</TH>
          </THead>
          <tbody>
            {installed.length === 0 && <EmptyRow colSpan={6} title="No themes installed" description="The store is using the platform default." />}
            {installed.map((t) => (
              <TR key={t.id}>
                <TD>
                  <span className="font-medium">{t.name}</span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">{t.themeSlug}</span>
                </TD>
                <TD>{t.role === "live" ? <Badge tone="green" dot>Live</Badge> : <Badge>Unpublished</Badge>}</TD>
                <TD className="text-xs">{t.presetId ?? "—"}</TD>
                <TD className="text-xs">{t.config ? "Yes" : "Default"}{t.draftConfig ? " · unsaved draft" : ""}</TD>
                <TD className="text-xs">{fmtDate(t.publishedAt)}</TD>
                <TD className="text-xs text-muted-foreground">{timeAgo(t.updatedAt)}</TD>
              </TR>
            ))}
          </tbody>
        </DataTable>
      </Card>
      <Card className="overflow-hidden">
        <CardHeader title="Theme purchases" />
        <DataTable maxHeight="none">
          <THead>
            <TH>Theme</TH>
            <TH align="right">Amount</TH>
            <TH align="right">Developer share</TH>
            <TH align="right">Platform share</TH>
            <TH>Date</TH>
          </THead>
          <tbody>
            {purchases.length === 0 && <EmptyRow colSpan={5} title="No purchases" description="No premium themes bought." />}
            {purchases.map(({ p, name, slug }) => (
              <TR key={p.id}>
                <TD>
                  <Link href={`/themes/${p.themeId}`} className="font-medium hover:underline">
                    {name}
                  </Link>{" "}
                  <span className="font-mono text-xs text-muted-foreground">{slug}</span>
                </TD>
                <TD align="right">{bdt(p.amount)}</TD>
                <TD align="right">{bdt(p.developerShare)}</TD>
                <TD align="right">{bdt(p.platformShare)}</TD>
                <TD className="text-xs text-muted-foreground">{fmtDate(p.createdAt)}</TD>
              </TR>
            ))}
          </tbody>
        </DataTable>
      </Card>
    </div>
  );
}

const SENSITIVE = /secret|key|pass|token|pwd|signature|private/i;
function mask(k: string, v: string | number | boolean): string {
  if (typeof v === "boolean") return v ? "true" : "false";
  const s = String(v);
  if (!s) return "—";
  if (SENSITIVE.test(k)) return "•".repeat(Math.min(12, Math.max(6, s.length)));
  if (s.length <= 4) return s.slice(0, 1) + "•••";
  return `${s.slice(0, 3)}•••${s.slice(-2)}`;
}

async function IntegrationsTab({ storeId }: { storeId: string }) {
  const rows = await db.select().from(storeIntegrations).where(eq(storeIntegrations.storeId, storeId)).orderBy(asc(storeIntegrations.type), asc(storeIntegrations.provider));
  return (
    <div>
      <p className="border-b border-border bg-muted/40 px-5 py-2 text-xs text-muted-foreground">Credentials are masked. Admins never see merchant secrets in full.</p>
      <DataTable maxHeight="none">
        <THead>
          <TH>Provider</TH>
          <TH>Type</TH>
          <TH>Status</TH>
          <TH>Configuration</TH>
          <TH>Updated</TH>
        </THead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={5} title="No integrations" description="No payment, courier or marketing integrations configured." />}
          {rows.map((r) => (
            <TR key={r.id}>
              <TD className="font-medium">{label(r.provider)}</TD>
              <TD>
                <Badge>{label(r.type)}</Badge>
              </TD>
              <TD>{r.enabled ? <Badge tone="green" dot>Enabled</Badge> : <Badge dot>Disabled</Badge>}</TD>
              <TD className="whitespace-normal">
                <div className="flex max-w-[520px] flex-wrap gap-1.5">
                  {Object.entries(r.config).length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                  {Object.entries(r.config).map(([k, v]) => (
                    <span key={k} className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                      <span className="text-muted-foreground">{k}:</span> {mask(k, v)}
                    </span>
                  ))}
                </div>
              </TD>
              <TD className="text-xs text-muted-foreground">{timeAgo(r.updatedAt)}</TD>
            </TR>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

async function ActivityTab({ storeId, sp, base }: { storeId: string; sp: SearchParams; base: string }) {
  const { page, size, offset } = listParams(sp, ["created"] as const, "created");
  const where = eq(auditLogs.storeId, storeId);
  const [rows, [{ n }]] = await Promise.all([
    db
      .select({ a: auditLogs, actorName: users.name, actorEmail: users.email, actorRole: users.role })
      .from(auditLogs)
      .leftJoin(users, eq(users.id, auditLogs.actorId))
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(size)
      .offset(offset),
    db.select({ n: count() }).from(auditLogs).where(where),
  ]);
  return (
    <>
      <DataTable maxHeight="calc(100vh - 360px)">
        <THead>
          <TH>When</TH>
          <TH>Actor</TH>
          <TH>Action</TH>
          <TH>Details</TH>
        </THead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={4} title="No activity" description="Nothing has been logged for this store yet." />}
          {rows.map(({ a, actorName, actorEmail, actorRole }) => (
            <TR key={a.id}>
              <TD className="text-xs text-muted-foreground">{fmtDateTime(a.createdAt)}</TD>
              <TD>
                <span className="font-medium">{actorName ?? "System"}</span>
                {actorRole && actorRole !== "user" && <RoleBadge role={actorRole} />}
                <div className="text-xs text-muted-foreground">{actorEmail}</div>
              </TD>
              <TD>
                <div className="font-medium">{describeAction(a.action)}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{a.action}</div>
              </TD>
              <TD className="max-w-[420px] whitespace-normal font-mono text-[11px] text-muted-foreground">{a.meta ? JSON.stringify(a.meta) : (a.target ?? "")}</TD>
            </TR>
          ))}
        </tbody>
      </DataTable>
      <Pagination base={base} params={sp} page={page} size={size} total={n} />
    </>
  );
}
