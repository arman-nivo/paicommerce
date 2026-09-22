import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, Mail, MessageCircle, Phone, Receipt, ShoppingBag, Wallet } from "lucide-react";
import { normalizePhone } from "@pai/core";
import { Avatar, Badge, Card, CardBody, CardHeader, EmptyState, StatCard, Table, TBody, TD, TH, THead, TR } from "@pai/ui";
import { and, customers, db, desc, eq, or, orders, sql, stores } from "@pai/db";
import { Header } from "@/components/page";
import { FulfillmentBadge, PaymentBadge } from "@/components/status";
import { can, getCtx } from "@/lib/ctx";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { VIP_THRESHOLD } from "../_lib/filters";
import { AddressesCard } from "./_components/addresses-card";
import { CustomerActions } from "./_components/customer-actions";
import { DeliveryPanel } from "./_components/delivery-panel";
import { ProfileCard } from "./_components/profile-card";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ORDER_LIMIT = 50;

export async function generateMetadata() {
  return { title: "Customer" };
}

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getCtx("customers.view");
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const storeId = ctx.store.id;
  const cur = ctx.store.currency;

  const c = await db.query.customers.findFirst({ where: and(eq(customers.id, id), eq(customers.storeId, storeId)) });
  if (!c) notFound();

  const phone = normalizePhone(c.phone);
  const match = and(eq(orders.storeId, storeId), phone ? or(eq(orders.customerId, c.id), eq(orders.phone, phone)) : eq(orders.customerId, c.id));
  const valid = sql`${orders.status} <> 'cancelled' and ${orders.fulfillmentStatus} <> 'cancelled'`;

  const [orderRows, [agg], store, tagRows] = await Promise.all([
    db
      .select({
        id: orders.id,
        number: orders.number,
        createdAt: orders.createdAt,
        total: orders.total,
        fulfillmentStatus: orders.fulfillmentStatus,
        paymentStatus: orders.paymentStatus,
        paymentMethod: orders.paymentMethod,
        items: sql<number>`(select coalesce(sum(oi.quantity), 0) from order_items oi where oi.order_id = "orders"."id")`.mapWith(Number),
      })
      .from(orders)
      .where(match)
      .orderBy(desc(orders.createdAt))
      .limit(ORDER_LIMIT),
    db
      .select({
        all: sql<number>`count(*)`.mapWith(Number),
        valid: sql<number>`count(*) filter (where ${valid})`.mapWith(Number),
        spent: sql<number>`coalesce(sum(${orders.total}) filter (where ${valid}), 0)`.mapWith(Number),
        delivered: sql<number>`count(*) filter (where ${orders.fulfillmentStatus} = 'delivered')`.mapWith(Number),
        cancelled: sql<number>`count(*) filter (where ${orders.fulfillmentStatus} = 'cancelled' or ${orders.status} = 'cancelled')`.mapWith(Number),
        returned: sql<number>`count(*) filter (where ${orders.fulfillmentStatus} = 'returned')`.mapWith(Number),
        inTransit: sql<number>`count(*) filter (where ${orders.fulfillmentStatus} in ('shipped'))`.mapWith(Number),
        last: sql<string | null>`max(${orders.createdAt})`,
      })
      .from(orders)
      .where(match),
    db.query.stores.findFirst({ columns: { settings: true }, where: eq(stores.id, storeId) }),
    db.execute<{ tag: string }>(sql`select distinct unnest(tags) as tag from customers where store_id = ${storeId} order by 1 limit 200`),
  ]);

  const a = agg ?? { all: 0, valid: 0, spent: 0, delivered: 0, cancelled: 0, returned: 0, inTransit: 0, last: null };
  // Prefer live order data; fall back to stored counters (e.g. imported customers).
  const totalSpent = a.all ? a.spent : c.totalSpent;
  const ordersCount = a.all ? a.valid : c.ordersCount;
  const aov = ordersCount ? Math.round(totalSpent / ordersCount) : 0;
  const fraud = store?.settings?.fraud ?? {};
  const onBlockList = !!phone && (fraud.blockPhones ?? []).map(normalizePhone).includes(phone);
  const canManage = can(ctx, "customers.manage");
  const tagSuggestions = Array.from(tagRows as unknown as { tag: string }[]).map((r) => r.tag);
  const isVip = totalSpent >= VIP_THRESHOLD;
  const isRepeat = ordersCount >= 2;

  return (
    <div>
      <Header
        back={{ href: "/customers", label: "Customers" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            <Avatar name={c.name} size={40} />
            <span className="min-w-0 break-words">{c.name}</span>
            <span className="flex flex-wrap items-center gap-1.5">
              {c.blocked && (
                <Badge tone="red" dot>
                  Blocked
                </Badge>
              )}
              {isVip && <Badge tone="purple">VIP</Badge>}
              {isRepeat && <Badge tone="green">Repeat customer</Badge>}
              {!a.all && !c.ordersCount && <Badge>No orders yet</Badge>}
            </span>
          </span>
        }
        description={`Customer since ${formatDate(c.createdAt)}${c.acceptsMarketing ? " · Subscribed to marketing" : ""}`}
        actions={
          canManage ? (
            <CustomerActions customer={{ id: c.id, name: c.name, phone: c.phone, email: c.email, blocked: c.blocked }} onBlockList={onBlockList} />
          ) : undefined
        }
      />

      {c.blocked && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          This customer is blocked and can&apos;t place new orders on your store{onBlockList ? " — their phone number is also on your fraud block list." : "."}
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total spent" value={formatMoney(totalSpent, cur)} icon={<Wallet />} hint="Excludes cancelled orders" />
        <StatCard label="Orders" value={ordersCount} icon={<ShoppingBag />} hint={a.all > ordersCount ? `+${a.all - ordersCount} cancelled` : undefined} />
        <StatCard label="Avg. order value" value={formatMoney(aov, cur)} icon={<Receipt />} />
        <StatCard label="Last order" value={a.last ? formatDate(a.last, { day: "numeric", month: "short" }) : "—"} icon={<CalendarClock />} hint={a.last ? formatDate(a.last, { year: "numeric" }) : "No orders yet"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="min-w-0 space-y-5 lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader
              title="Orders"
              description={phone ? "Matched by customer account or phone number" : undefined}
              action={
                a.all > ORDER_LIMIT && phone ? (
                  <Link href={`/orders?q=${encodeURIComponent(phone)}`} className="text-sm font-medium text-primary hover:underline">
                    View all {a.all}
                  </Link>
                ) : undefined
              }
            />
            {orderRows.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag />}
                title="No orders yet"
                description="Orders placed with this customer's phone number will show up here."
                action={
                  can(ctx, "orders.manage") ? (
                    <Link href="/orders/new" className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                      Create order
                    </Link>
                  ) : undefined
                }
              />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Order</TH>
                    <TH>Date</TH>
                    <TH>Status</TH>
                    <TH>Payment</TH>
                    <TH className="text-right">Total</TH>
                  </TR>
                </THead>
                <TBody>
                  {orderRows.map((o) => (
                    <TR key={o.id} className="relative">
                      <TD>
                        <Link href={`/orders/${o.id}`} className="font-medium text-primary after:absolute after:inset-0 hover:underline">
                          #{o.number}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {o.items} item{o.items === 1 ? "" : "s"}
                        </div>
                      </TD>
                      <TD className="whitespace-nowrap text-muted-foreground">{formatDateTime(o.createdAt)}</TD>
                      <TD>
                        <FulfillmentBadge status={o.fulfillmentStatus} />
                      </TD>
                      <TD>
                        <PaymentBadge status={o.paymentStatus} />
                      </TD>
                      <TD className="text-right font-medium tabular-nums">{formatMoney(o.total, cur)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </Card>

          <ProfileCard customerId={c.id} initial={{ note: c.note ?? "", tags: c.tags, acceptsMarketing: c.acceptsMarketing }} tagSuggestions={tagSuggestions} canManage={canManage} />
        </div>

        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="Contact" />
            <CardBody className="space-y-3 text-sm">
              {c.phone ? (
                <div className="space-y-2">
                  <div className="font-medium tabular-nums">{c.phone}</div>
                  <div className="flex flex-wrap gap-2">
                    <a href={`tel:${phone}`} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input bg-card px-3 text-xs font-medium hover:bg-muted">
                      <Phone className="size-3.5" /> Call
                    </a>
                    <a
                      href={`https://wa.me/88${phone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                    >
                      <MessageCircle className="size-3.5" /> WhatsApp
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No phone number</p>
              )}
              {c.email ? (
                <a href={`mailto:${c.email}`} className="flex items-center gap-2 break-all text-primary hover:underline">
                  <Mail className="size-4 shrink-0" /> {c.email}
                </a>
              ) : (
                <p className="text-muted-foreground">No email</p>
              )}
            </CardBody>
          </Card>

          <DeliveryPanel delivered={a.delivered} cancelled={a.cancelled} returned={a.returned} inTransit={a.inTransit} minRate={fraud.minCourierSuccessRate ?? null} />

          <AddressesCard customerId={c.id} customerName={c.name} addresses={c.addresses ?? []} canManage={canManage} />
        </div>
      </div>
    </div>
  );
}
