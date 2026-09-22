import Link from "next/link";
import { Ban, Download, Repeat, Users, Wallet } from "lucide-react";
import { Avatar, Badge, Card, EmptyState, StatCard, Table, TBody, TD, TH, THead, TR } from "@pai/ui";
import { and, count, customers, db, eq, gte, sql } from "@pai/db";
import { Header } from "@/components/page";
import { Pagination } from "@/components/pagination";
import { ClearFilters, FilterSelect, SearchBox, UrlTabs } from "@/components/url-controls";
import { can, getCtx } from "@/lib/ctx";
import { formatDate, formatMoney, formatNumber as fmtN, pageParam, pct, type SearchParams } from "@/lib/format";
import { AddCustomerButton } from "./_components/add-customer-dialog";
import { baseConditions, CUSTOMER_SORTS, customerOrder, customerWhere, lastOrderAt, readCustomerFilters, tabCondition } from "./_lib/filters";

export const metadata = { title: "Customers" };

const PAGE_SIZE = 25;

export default async function CustomersPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await getCtx("customers.view");
  const sp = await searchParams;
  const f = readCustomerFilters(sp);
  const page = pageParam(sp.page);
  const storeId = ctx.store.id;
  const cur = ctx.store.currency;
  const canManage = can(ctx, "customers.manage");

  const base = baseConditions(storeId, f);
  const tabCount = (tab: string) => {
    const t = tabCondition(tab);
    return db
      .select({ n: count() })
      .from(customers)
      .where(and(...base, ...(t ? [t] : [])))
      .then((r) => r[0]?.n ?? 0);
  };

  const [rows, [totalRow], counts, [stats], tagRows] = await Promise.all([
    db
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        phone: customers.phone,
        ordersCount: customers.ordersCount,
        totalSpent: customers.totalSpent,
        tags: customers.tags,
        blocked: customers.blocked,
        acceptsMarketing: customers.acceptsMarketing,
        createdAt: customers.createdAt,
        lastOrderAt,
      })
      .from(customers)
      .where(customerWhere(storeId, f))
      .orderBy(...customerOrder(f.sort))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(customers).where(customerWhere(storeId, f)),
    Promise.all(["", "repeat", "new", "blocked"].map(tabCount)),
    db
      .select({
        total: count(),
        buyers: sql<number>`count(*) filter (where ${customers.ordersCount} >= 1)`.mapWith(Number),
        repeat: sql<number>`count(*) filter (where ${customers.ordersCount} >= 2)`.mapWith(Number),
        spent: sql<number>`coalesce(sum(${customers.totalSpent}) filter (where ${customers.ordersCount} >= 1), 0)`.mapWith(Number),
        newThisMonth: sql<number>`count(*) filter (where ${gte(customers.createdAt, new Date(Date.now() - 30 * 86400_000))})`.mapWith(Number),
      })
      .from(customers)
      .where(eq(customers.storeId, storeId)),
    db.execute<{ tag: string }>(sql`select distinct unnest(tags) as tag from customers where store_id = ${storeId} order by 1 limit 200`),
  ]);

  const total = totalRow?.n ?? 0;
  const s = stats ?? { total: 0, buyers: 0, repeat: 0, spent: 0, newThisMonth: 0 };
  const repeatRate = s.buyers ? (s.repeat / s.buyers) * 100 : 0;
  const avgLtv = s.buyers ? Math.round(s.spent / s.buyers) : 0;
  const tags = Array.from(tagRows as unknown as { tag: string }[]).map((r) => r.tag);

  const exportParams = new URLSearchParams();
  for (const [k, v] of Object.entries({ tab: f.tab, q: f.q, tag: f.tag, marketing: f.marketing, sort: f.sort })) if (v) exportParams.set(k, v);
  const exportHref = `/api/customers/export${exportParams.size ? `?${exportParams}` : ""}`;
  const filtered = !!(f.q || f.tag || f.marketing || f.tab);

  return (
    <div>
      <Header
        title="Customers"
        description="Everyone who has ordered from you or was added by your team."
        actions={
          <>
            {s.total > 0 && (
              <a href={exportHref} className="inline-flex h-9 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm font-medium shadow-xs hover:bg-muted">
                <Download className="size-4" /> Export
              </a>
            )}
            {canManage && <AddCustomerButton tagSuggestions={tags} />}
          </>
        }
      />

      {s.total === 0 ? (
        <Card>
          <EmptyState
            icon={<Users />}
            title="No customers yet"
            description="Customers are added automatically when someone places an order. You can also add customers yourself — for phone or Facebook orders."
            action={canManage ? <AddCustomerButton tagSuggestions={[]} label="Add your first customer" /> : undefined}
          />
        </Card>
      ) : (
        <>
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <StatCard label="Total customers" value={fmtN(s.total)} icon={<Users />} hint={`${fmtN(s.newThisMonth)} new in the last 30 days`} />
            <StatCard label="Repeat customer rate" value={pct(repeatRate)} icon={<Repeat />} hint={`${fmtN(s.repeat)} of ${fmtN(s.buyers)} buyers ordered 2+ times`} />
            <StatCard label="Avg. lifetime value" value={formatMoney(avgLtv, cur)} icon={<Wallet />} hint="Total spent per buying customer" />
          </div>

          <Card className="overflow-hidden">
            <UrlTabs
              tabs={[
                { value: "", label: "All", count: counts[0] },
                { value: "repeat", label: "Repeat", count: counts[1] },
                { value: "new", label: "New (30 days)", count: counts[2] },
                { value: "blocked", label: "Blocked", count: counts[3] },
              ]}
            />
            <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:flex-wrap sm:items-center">
              <SearchBox placeholder="Search by name, phone or email" />
              <div className="flex flex-wrap items-center gap-2">
                {tags.length > 0 && <FilterSelect param="tag" placeholder="Any tag" options={tags.map((t) => ({ value: t, label: t }))} />}
                <FilterSelect
                  param="marketing"
                  placeholder="Marketing: any"
                  options={[
                    { value: "yes", label: "Accepts marketing" },
                    { value: "no", label: "Doesn't accept" },
                  ]}
                />
                <FilterSelect param="sort" placeholder="Sort: Newest" options={CUSTOMER_SORTS} />
                <ClearFilters />
              </div>
            </div>

            {rows.length === 0 ? (
              <EmptyState
                icon={<Users />}
                title={filtered ? "No customers match" : "No customers here"}
                description={filtered ? "Try a different search or clear the filters." : undefined}
              />
            ) : (
              <>
                {/* Mobile: stacked cards */}
                <ul className="divide-y divide-border md:hidden">
                  {rows.map((c) => (
                    <li key={c.id}>
                      <Link href={`/customers/${c.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40">
                        <Avatar name={c.name} size={36} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium">{c.name}</span>
                            {c.blocked && <Badge tone="red">Blocked</Badge>}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">{c.phone || c.email || "—"}</div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium tabular-nums">{formatMoney(c.totalSpent, cur)}</div>
                          <div className="text-xs text-muted-foreground">
                            {c.ordersCount} order{c.ordersCount === 1 ? "" : "s"}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Desktop: table */}
                <div className="hidden md:block">
                  <Table>
                    <THead>
                      <TR>
                        <TH>Customer</TH>
                        <TH>Phone</TH>
                        <TH>Email</TH>
                        <TH className="text-right">Orders</TH>
                        <TH className="text-right">Total spent</TH>
                        <TH>Last order</TH>
                        <TH>Tags</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {rows.map((c) => (
                        <TR key={c.id} className="relative">
                          <TD>
                            <Link href={`/customers/${c.id}`} className="flex items-center gap-3 font-medium after:absolute after:inset-0 hover:text-primary">
                              <Avatar name={c.name} size={32} />
                              <span className="max-w-56 truncate">{c.name}</span>
                              {c.blocked && (
                                <Badge tone="red">
                                  <Ban className="size-3" /> Blocked
                                </Badge>
                              )}
                            </Link>
                          </TD>
                          <TD className="whitespace-nowrap tabular-nums">{c.phone || <span className="text-muted-foreground">—</span>}</TD>
                          <TD className="max-w-56 truncate text-muted-foreground">{c.email || "—"}</TD>
                          <TD className="text-right tabular-nums">{c.ordersCount}</TD>
                          <TD className="text-right font-medium tabular-nums">{formatMoney(c.totalSpent, cur)}</TD>
                          <TD className="whitespace-nowrap text-muted-foreground">{c.lastOrderAt ? formatDate(c.lastOrderAt) : "—"}</TD>
                          <TD>
                            <div className="flex max-w-56 flex-wrap gap-1">
                              {c.tags.slice(0, 3).map((t) => (
                                <Badge key={t}>{t}</Badge>
                              ))}
                              {c.tags.length > 3 && <span className="text-xs text-muted-foreground">+{c.tags.length - 3}</span>}
                            </div>
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </div>
              </>
            )}
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/customers" params={sp} />
          </Card>
        </>
      )}
    </div>
  );
}
