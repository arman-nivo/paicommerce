import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, CopyPlus, FileText, Package, Printer } from "lucide-react";
import { PAYMENT_LABELS } from "@pai/core/payments";
import { and, asc, customers, db, desc, eq, gt, lt, ne, or, orderEvents, orderItems, orders, users } from "@pai/db";
import { Badge, buttonVariants, Card, CardHeader, cn } from "@pai/ui";
import { BackLink } from "@/components/page";
import { FulfillmentBadge, PaymentBadge } from "@/components/status";
import { can, getCtx } from "@/lib/ctx";
import { formatDateTime, formatMoney } from "@/lib/format";
import { UUID_RE } from "../_lib/filters";
import { fraudStats } from "../_lib/fraud";
import { SOURCE_SHORT } from "../_lib/labels";
import { COURIER_NAMES, dueAmount, enabledCouriers } from "../_lib/order-ops";
import { CourierCard } from "./_components/courier-card";
import { CustomerCard } from "./_components/customer-card";
import { FraudPanel } from "./_components/fraud-panel";
import { MetaCard } from "./_components/meta-card";
import { PaymentCard } from "./_components/payment-card";
import { StatusActions } from "./_components/status-actions";
import { Timeline } from "./_components/timeline";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return { title: "Order" };
  const ctx = await getCtx("orders.view");
  const o = await db.query.orders.findFirst({ where: and(eq(orders.id, id), eq(orders.storeId, ctx.store.id)), columns: { number: true } });
  return { title: o ? `Order #${o.number}` : "Order" };
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getCtx("orders.view");
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const storeId = ctx.store.id;
  const order = await db.query.orders.findFirst({ where: and(eq(orders.id, id), eq(orders.storeId, storeId)) });
  if (!order) notFound();

  const historyCond = [order.phone ? eq(orders.phone, order.phone) : undefined, order.customerId ? eq(orders.customerId, order.customerId) : undefined].filter(Boolean);

  const [items, events, [older], [newer], history, fraud, couriers, customer] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)).orderBy(asc(orderItems.id)),
    db
      .select({ id: orderEvents.id, type: orderEvents.type, message: orderEvents.message, createdAt: orderEvents.createdAt, author: users.name })
      .from(orderEvents)
      .leftJoin(users, eq(users.id, orderEvents.userId))
      .where(eq(orderEvents.orderId, order.id))
      .orderBy(desc(orderEvents.createdAt)),
    db.select({ id: orders.id }).from(orders).where(and(eq(orders.storeId, storeId), lt(orders.number, order.number))).orderBy(desc(orders.number)).limit(1),
    db.select({ id: orders.id }).from(orders).where(and(eq(orders.storeId, storeId), gt(orders.number, order.number))).orderBy(asc(orders.number)).limit(1),
    historyCond.length
      ? db
          .select({ id: orders.id, number: orders.number, total: orders.total, fulfillmentStatus: orders.fulfillmentStatus, createdAt: orders.createdAt })
          .from(orders)
          .where(and(eq(orders.storeId, storeId), ne(orders.id, order.id), or(...historyCond)))
          .orderBy(desc(orders.createdAt))
          .limit(5)
      : Promise.resolve([]),
    fraudStats(storeId, ctx.store.settings ?? {}, order.phone, order.id),
    enabledCouriers(storeId),
    order.customerId ? db.query.customers.findFirst({ where: and(eq(customers.id, order.customerId), eq(customers.storeId, storeId)), columns: { id: true, ordersCount: true, totalSpent: true } }) : Promise.resolve(undefined),
  ]);

  const money = (n: number) => formatMoney(n, order.currency);
  const manage = can(ctx, "orders.manage");
  const due = dueAmount(order);
  const paid = order.total - due;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const statusProps = { id: order.id, number: order.number, fulfillmentStatus: order.fulfillmentStatus, paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus, hasCourier: !!order.courier };
  const courierProps = {
    orderId: order.id,
    number: order.number,
    fulfillmentStatus: order.fulfillmentStatus,
    courier: order.courier,
    defaultCod: due,
    note: order.note,
    couriers: couriers.map((c) => ({ provider: c.provider, name: COURIER_NAMES[c.provider] ?? c.provider })),
    hasAddress: !!order.shippingAddress?.line1 || !!order.shippingAddress?.area,
  };

  return (
    <div className="pb-24 lg:pb-0">
      <BackLink href="/orders" label="Orders" />
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight">#{order.number}</h1>
            <FulfillmentBadge status={order.fulfillmentStatus} />
            <PaymentBadge status={order.paymentStatus} />
            {order.status === "cancelled" && order.fulfillmentStatus !== "cancelled" && <Badge tone="gray">Cancelled</Badge>}
            {fraud?.blocked && <Badge tone="red">Blocked phone</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateTime(order.createdAt)} · {SOURCE_SHORT[order.source] ?? order.source} · {itemCount} item{itemCount === 1 ? "" : "s"}
            {order.cancelledAt && ` · Cancelled ${formatDateTime(order.cancelledAt)}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex">
            <NavArrow href={older ? `/orders/${older.id}` : null} label="Older order" side="left" />
            <NavArrow href={newer ? `/orders/${newer.id}` : null} label="Newer order" side="right" />
          </div>
          <a href={`/orders/${order.id}/invoice`} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <FileText /> Invoice
          </a>
          <a href={`/orders/print?ids=${order.id}&type=slip&autoprint=1`} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Printer /> Packing slip
          </a>
          {manage && (
            <Link href={`/orders/new?from=${order.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
              <CopyPlus /> Duplicate
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {manage && (
            <div className="hidden lg:block">
              <StatusActions order={statusProps} layout="card" />
            </div>
          )}

          {/* Items */}
          <Card>
            <CardHeader title={`Items (${itemCount})`} action={<FulfillmentBadge status={order.fulfillmentStatus} />} />
            <ul className="divide-y divide-border">
              {items.map((it) => (
                <li key={it.id} className="flex gap-3 px-5 py-3">
                  {it.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.imageUrl} alt="" className="size-14 shrink-0 rounded-lg border border-border object-cover" />
                  ) : (
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                      <Package className="size-5" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    {it.productId ? (
                      <Link href={`/products/${it.productId}`} className="line-clamp-2 text-sm font-medium hover:underline">
                        {it.title}
                      </Link>
                    ) : (
                      <p className="line-clamp-2 text-sm font-medium">{it.title}</p>
                    )}
                    <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                      {it.variantTitle && <span>{it.variantTitle}</span>}
                      {it.sku && <span>SKU {it.sku}</span>}
                    </div>
                    <p className="mt-1 text-xs tabular-nums text-muted-foreground sm:hidden">
                      {it.quantity} × {money(it.price)}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-sm tabular-nums text-muted-foreground sm:block">
                    {it.quantity} × {money(it.price)}
                  </div>
                  <div className="w-20 shrink-0 text-right text-sm font-medium tabular-nums">{money(it.total)}</div>
                </li>
              ))}
            </ul>
            {/* Totals */}
            <dl className="space-y-2 border-t border-border bg-muted/30 px-5 py-4 text-sm">
              <Row label={`Subtotal · ${itemCount} item${itemCount === 1 ? "" : "s"}`} value={money(order.subtotal)} />
              {order.discountTotal > 0 && (
                <Row
                  label={
                    <>
                      Discount
                      {order.discountCode && (
                        <Badge tone="green" className="ml-2 font-mono">
                          {order.discountCode}
                        </Badge>
                      )}
                    </>
                  }
                  value={`−${money(order.discountTotal)}`}
                  valueClass="text-emerald-600 dark:text-emerald-400"
                />
              )}
              <Row label={`Delivery${order.deliveryZone ? ` · ${order.deliveryZone}` : ""}`} value={order.shippingTotal ? money(order.shippingTotal) : "Free"} />
              {order.taxTotal > 0 && <Row label="Tax" value={money(order.taxTotal)} />}
              <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{money(order.total)}</dd>
              </div>
              <Row label="Paid" value={money(paid)} />
              <div className={cn("flex items-center justify-between font-semibold", due > 0 ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400")}>
                <dt>{due > 0 ? (order.paymentMethod === "cod" ? "To collect on delivery" : "Balance due") : "Fully paid"}</dt>
                <dd className="tabular-nums">{money(due)}</dd>
              </div>
            </dl>
          </Card>

          <CourierCard {...courierProps} canManage={manage} />

          <Timeline orderId={order.id} canManage={manage} events={events.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() }))} customerNote={order.note} />
        </div>

        <div className="space-y-5">
          <CustomerCard order={order} customer={customer ?? null} history={history} />
          <FraudPanel stats={fraud} />
          <PaymentCard
            orderId={order.id}
            canManage={manage}
            method={order.paymentMethod}
            methodLabel={PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
            status={order.paymentStatus}
            reference={order.paymentRef}
            total={order.total}
          />
          <MetaCard orderId={order.id} canManage={manage} staffNote={order.staffNote} tags={order.tags} />
        </div>
      </div>

      {manage && (
        <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-card/95 px-4 py-2.5 backdrop-blur-md lg:hidden">
          <StatusActions order={statusProps} layout="bar" />
        </div>
      )}
    </div>
  );
}

function Row({ label, value, valueClass }: { label: React.ReactNode; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center text-muted-foreground">{label}</dt>
      <dd className={cn("tabular-nums", valueClass)}>{value}</dd>
    </div>
  );
}

function NavArrow({ href, label, side }: { href: string | null; label: string; side: "left" | "right" }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  const cls = cn(buttonVariants({ variant: "outline", size: "icon-sm" }), side === "left" ? "rounded-r-none" : "-ml-px rounded-l-none");
  return href ? (
    <Link href={href} className={cls} aria-label={label} title={label}>
      <Icon />
    </Link>
  ) : (
    <span className={cn(cls, "pointer-events-none opacity-40")} aria-hidden>
      <Icon />
    </span>
  );
}
