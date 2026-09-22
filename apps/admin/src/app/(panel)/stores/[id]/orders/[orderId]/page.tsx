import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card, CardBody, CardHeader } from "@pai/ui";
import { and, asc, db, eq, orderEvents, orderItems, orders, stores, users } from "@pai/db";
import { StatusBadge, label } from "@/components/badges";
import { BackLink, DL } from "@/components/link-tabs";
import { requireAdminPage } from "@/lib/auth";
import { bdt, fmtDateTime } from "@/lib/format";

export const metadata = { title: "Order" };

export default async function OrderPage({ params }: { params: Promise<{ id: string; orderId: string }> }) {
  await requireAdminPage();
  const { id, orderId } = await params;
  if (![id, orderId].every((x) => /^[0-9a-f-]{36}$/i.test(x))) notFound();
  const [order] = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.storeId, id))).limit(1);
  if (!order) notFound();
  const [store, items, events] = await Promise.all([
    db.query.stores.findFirst({ where: eq(stores.id, id), columns: { name: true, currency: true } }),
    db.select().from(orderItems).where(eq(orderItems.orderId, orderId)),
    db
      .select({ e: orderEvents, user: users.name })
      .from(orderEvents)
      .leftJoin(users, eq(users.id, orderEvents.userId))
      .where(eq(orderEvents.orderId, orderId))
      .orderBy(asc(orderEvents.createdAt)),
  ]);
  const a = order.shippingAddress;
  return (
    <div className="space-y-5">
      <div>
        <BackLink href={`/stores/${id}?tab=orders`}>{store?.name ?? "Store"} orders</BackLink>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-bold tracking-tight">Order #{order.number}</h1>
          <StatusBadge status={order.paymentStatus} />
          <Badge>{label(order.fulfillmentStatus)}</Badge>
          <Badge tone="gray">{label(order.status)}</Badge>
          <span className="text-sm text-muted-foreground">· read-only · {fmtDateTime(order.createdAt)}</span>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Items" />
          <ul className="divide-y divide-border">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 px-5 py-3">
                {i.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.imageUrl} alt="" className="size-10 rounded-lg border border-border object-cover" />
                ) : (
                  <span className="size-10 rounded-lg bg-muted" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{i.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {i.variantTitle ?? ""} {i.sku ? `· SKU ${i.sku}` : ""}
                  </span>
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {bdt(i.price)} × {i.quantity}
                </span>
                <span className="w-24 text-right text-sm font-medium tabular-nums">{bdt(i.total)}</span>
              </li>
            ))}
          </ul>
          <CardBody className="border-t border-border">
            <DL
              items={[
                ["Subtotal", bdt(order.subtotal)],
                [`Discount${order.discountCode ? ` (${order.discountCode})` : ""}`, `−${bdt(order.discountTotal)}`],
                [`Shipping${order.deliveryZone ? ` (${order.deliveryZone})` : ""}`, bdt(order.shippingTotal)],
                ["Tax", bdt(order.taxTotal)],
                [<b key="t">Total</b>, <b key="v">{bdt(order.total)}</b>],
              ]}
            />
          </CardBody>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader title="Customer" />
            <CardBody>
              <DL
                items={[
                  ["Name", order.name],
                  ["Phone", order.phone ?? "—"],
                  ["Email", order.email ?? "—"],
                  ["Address", a ? [a.line1, a.line2, a.area, a.city, a.district, a.postalCode].filter(Boolean).join(", ") || "—" : "—"],
                  ["Note", order.note ?? "—"],
                ]}
              />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Payment & delivery" />
            <CardBody>
              <DL
                items={[
                  ["Method", order.paymentMethod.toUpperCase()],
                  ["Reference", order.paymentRef ?? "—"],
                  ["Courier", order.courier?.provider ?? "—"],
                  ["Tracking", order.courier?.trackingCode ?? order.courier?.consignmentId ?? "—"],
                  ["Source", order.source],
                  ["IP", order.ip ?? "—"],
                ]}
              />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Timeline" />
            <CardBody>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events</p>
              ) : (
                <ol className="space-y-3 border-l border-border pl-4">
                  {events.map(({ e, user }) => (
                    <li key={e.id} className="relative text-sm">
                      <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary" />
                      <p>{e.message}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {fmtDateTime(e.createdAt)}
                        {user ? ` · ${user}` : ""}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </CardBody>
          </Card>
          <Link href={`/stores/${id}`} className="block text-center text-sm text-primary hover:underline">
            Open store
          </Link>
        </div>
      </div>
    </div>
  );
}
