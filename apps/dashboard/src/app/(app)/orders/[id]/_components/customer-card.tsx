import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Order } from "@pai/db";
import { Avatar, Card, CardBody, CardHeader, CopyButton } from "@pai/ui";
import { FulfillmentBadge } from "@/components/status";
import { formatDate, formatMoney } from "@/lib/format";
import { addressLines } from "../../_lib/filters";
import { waNumber } from "../../_lib/labels";

type History = { id: string; number: number; total: number; fulfillmentStatus: string; createdAt: Date }[];

export function CustomerCard({ order, customer, history }: { order: Order; customer: { id: string; ordersCount: number; totalSpent: number } | null; history: History }) {
  const a = order.shippingAddress;
  const addr = addressLines(a);
  const shipName = a?.name && a.name !== order.name ? a.name : null;
  const shipPhone = a?.phone && a.phone !== order.phone ? a.phone : null;
  const money = (n: number) => formatMoney(n, order.currency);

  return (
    <Card>
      <CardHeader
        title="Customer"
        action={
          customer ? (
            <Link href={`/customers/${customer.id}`} className="text-xs font-medium text-primary hover:underline">
              View profile
            </Link>
          ) : undefined
        }
      />
      <CardBody className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar name={order.name} size={40} />
          <div className="min-w-0">
            <p className="truncate font-medium">{order.name}</p>
            <p className="text-xs text-muted-foreground">{customer ? `${customer.ordersCount} order${customer.ordersCount === 1 ? "" : "s"} · ${money(customer.totalSpent)} spent` : "Guest customer"}</p>
          </div>
        </div>

        {order.phone && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="size-4 text-muted-foreground" />
              <span className="font-medium tabular-nums">{order.phone}</span>
              <CopyButton value={order.phone} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a href={`tel:${order.phone}`} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-input bg-card text-sm font-medium shadow-xs hover:bg-muted">
                <Phone className="size-4" /> Call
              </a>
              <a
                href={`https://wa.me/${waNumber(order.phone)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#25d366] text-sm font-medium text-white shadow-sm hover:bg-[#25d366]/90"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </div>
          </div>
        )}
        {order.email && (
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <Mail className="size-4 shrink-0 text-muted-foreground" />
            <a href={`mailto:${order.email}`} className="truncate hover:underline">
              {order.email}
            </a>
          </div>
        )}

        <div className="border-t border-border pt-4">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Shipping address</p>
          {addr ? (
            <div className="flex gap-2 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                {shipName && <p className="font-medium">{shipName}</p>}
                {shipPhone && <p className="tabular-nums">{shipPhone}</p>}
                <p>{addr}</p>
                {order.deliveryZone && <p className="mt-0.5 text-xs text-muted-foreground">Zone: {order.deliveryZone}</p>}
                <CopyButton value={[shipName ?? order.name, shipPhone ?? order.phone, addr].filter(Boolean).join(", ")} className="-ml-2 mt-1">
                  Copy address
                </CopyButton>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No address provided.</p>
          )}
        </div>

        {history.length > 0 && (
          <div className="border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Previous orders</p>
            <ul className="space-y-1">
              {history.map((h) => (
                <li key={h.id}>
                  <Link href={`/orders/${h.id}`} className="-mx-2 flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
                    <span className="min-w-0">
                      <span className="font-medium">#{h.number}</span> <span className="text-xs text-muted-foreground">{formatDate(h.createdAt)}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="tabular-nums">{money(h.total)}</span>
                      <FulfillmentBadge status={h.fulfillmentStatus} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
