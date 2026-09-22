import Link from "next/link";
import { Download, Plus, ShoppingCart } from "lucide-react";
import { PAYMENT_LABELS } from "@pai/core/payments";
import { and, count, db, desc, orders } from "@pai/db";
import { buttonVariants, Card } from "@pai/ui";
import { Header } from "@/components/page";
import { Pagination } from "@/components/pagination";
import { ClearFilters, DateParam, FilterSelect, SearchBox, UrlTabs } from "@/components/url-controls";
import { can, getCtx } from "@/lib/ctx";
import { pageParam, type SearchParams } from "@/lib/format";
import { baseConditions, FULFILLMENT_STATUSES, itemsCountSql, ORDER_SOURCES, orderWhere, readFilters } from "./_lib/filters";
import { COURIER_NAMES, enabledCouriers } from "./_lib/order-ops";
import { OrdersEmpty } from "./_components/orders-empty";
import { OrdersTable, type OrderRow } from "./_components/orders-table";

export const metadata = { title: "Orders" };

const PAGE_SIZE = 25;

const TAB_LABELS: Record<string, string> = {
  unfulfilled: "New",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await getCtx("orders.view");
  const sp = await searchParams;
  const f = readFilters(sp);
  const page = pageParam(sp.page);
  const storeId = ctx.store.id;

  const [statusCounts, [{ n: total } = { n: 0 }], rows, [{ n: storeTotal } = { n: 0 }], couriers] = await Promise.all([
    db
      .select({ status: orders.fulfillmentStatus, n: count() })
      .from(orders)
      .where(and(...baseConditions(storeId, f)))
      .groupBy(orders.fulfillmentStatus),
    db.select({ n: count() }).from(orders).where(orderWhere(storeId, f)),
    db
      .select({
        id: orders.id,
        number: orders.number,
        createdAt: orders.createdAt,
        name: orders.name,
        phone: orders.phone,
        total: orders.total,
        paymentStatus: orders.paymentStatus,
        paymentMethod: orders.paymentMethod,
        fulfillmentStatus: orders.fulfillmentStatus,
        courier: orders.courier,
        source: orders.source,
        items: itemsCountSql,
      })
      .from(orders)
      .where(orderWhere(storeId, f))
      .orderBy(desc(orders.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(orders).where(baseConditions(storeId, {})[0]),
    enabledCouriers(storeId),
  ]);

  const byStatus = Object.fromEntries(statusCounts.map((r) => [r.status, r.n]));
  const allCount = statusCounts.reduce((s, r) => s + r.n, 0);
  const tabs = [{ value: "all", label: "All", count: allCount }, ...FULFILLMENT_STATUSES.map((s) => ({ value: s, label: TAB_LABELS[s]!, count: byStatus[s] ?? 0 }))];

  const exportParams = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v) exportParams.set(k, v);
  const exportHref = `/api/orders/export${exportParams.size ? `?${exportParams}` : ""}`;
  const manage = can(ctx, "orders.manage");

  const data: OrderRow[] = rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), items: Number(r.items) }));

  return (
    <>
      <Header
        title="Orders"
        description="Confirm, ship and track every order in one place."
        actions={
          <>
            <Link href="/orders/incomplete" className={buttonVariants({ variant: "ghost" })}>
              <ShoppingCart /> <span className="hidden sm:inline">Incomplete orders</span>
            </Link>
            {storeTotal > 0 && (
              <a href={exportHref} className={buttonVariants({ variant: "outline" })}>
                <Download /> Export
              </a>
            )}
            {manage && (
              <Link href="/orders/new" className={buttonVariants()}>
                <Plus /> Create order
              </Link>
            )}
          </>
        }
      />

      {storeTotal === 0 ? (
        <OrdersEmpty canCreate={manage} />
      ) : (
        <Card className="overflow-hidden">
          <UrlTabs param="status" tabs={tabs} />
          <div className="flex flex-col gap-2 border-b border-border p-3 lg:flex-row lg:flex-wrap lg:items-center">
            <SearchBox placeholder="Search order #, name, phone or email" className="lg:max-w-sm" />
            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect
                param="payment"
                placeholder="Payment status"
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "paid", label: "Paid" },
                  { value: "authorized", label: "Authorized" },
                  { value: "partially_refunded", label: "Partially refunded" },
                  { value: "refunded", label: "Refunded" },
                  { value: "failed", label: "Failed" },
                ]}
              />
              <FilterSelect param="method" placeholder="Payment method" options={Object.entries(PAYMENT_LABELS).map(([value, label]) => ({ value, label }))} />
              <FilterSelect param="source" placeholder="Source" options={ORDER_SOURCES.map((s) => ({ value: s.value, label: s.label }))} />
              <DateParam param="from" label="From" />
              <DateParam param="to" label="To" />
              <ClearFilters keep={["status"]} />
            </div>
          </div>
          <OrdersTable
            rows={data}
            canManage={manage}
            couriers={couriers.map((c) => ({ provider: c.provider, name: COURIER_NAMES[c.provider] ?? c.provider }))}
            filtered={total === 0}
          />
          {total > 0 && <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/orders" params={sp} />}
        </Card>
      )}
    </>
  );
}
