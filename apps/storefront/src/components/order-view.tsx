import type { AccountOrderDetail } from "@pai/theme-kit";
import { Check, Circle, PackageCheck, Truck, XCircle } from "lucide-react";

const STEPS = [
  { id: "placed", label: "Order placed" },
  { id: "confirmed", label: "Confirmed" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
] as const;

function stepIndex(status: string): number {
  switch (status) {
    case "confirmed":
    case "processing":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    default:
      return 0;
  }
}

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Payment pending",
  authorized: "Payment authorised",
  paid: "Paid",
  partially_refunded: "Partially refunded",
  refunded: "Refunded",
  failed: "Payment failed",
};

/** Delivery progress stepper (order-level fulfillment status). */
export function OrderProgress({ status }: { status: string }) {
  if (status === "cancelled" || status === "returned") {
    return (
      <p className="flex items-center gap-2 rounded-pai border border-pai-sale/40 bg-pai-sale/10 px-4 py-3 text-sm font-medium text-pai-sale">
        <XCircle className="size-5" aria-hidden /> This order was {status}.
      </p>
    );
  }
  const current = stepIndex(status);
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Order progress">
      {STEPS.map((s, i) => {
        const done = i <= current;
        return (
          <li key={s.id} className="flex flex-col items-center text-center" aria-current={i === current ? "step" : undefined}>
            <span className={`grid size-9 place-items-center rounded-full border-2 ${done ? "border-pai-primary bg-pai-primary text-pai-primary-fg" : "border-pai-border opacity-60"}`}>
              {i === 3 && done ? <PackageCheck className="size-4" aria-hidden /> : i === 2 && done ? <Truck className="size-4" aria-hidden /> : done ? <Check className="size-4" aria-hidden /> : <Circle className="size-3" aria-hidden />}
            </span>
            <span className={`mt-2 text-xs font-medium ${done ? "" : "opacity-55"}`}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Items, totals and delivery address of an order. */
export function OrderSummaryCard({ order, format }: { order: AccountOrderDetail; format: (n: number) => string }) {
  const a = order.shippingAddress ?? {};
  const address = [a.line1, a.area, a.city, a.district].filter(Boolean).join(", ");
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
      <div className="rounded-pai border border-pai-border p-5">
        <h2 className="mb-3 font-semibold">Items</h2>
        <ul className="divide-y divide-pai-border">
          {order.items.map((it, i) => (
            <li key={i} className="flex gap-4 py-3">
              <div className="size-16 shrink-0 overflow-hidden rounded-pai bg-pai-muted">{it.imageUrl ? <img src={it.imageUrl} alt="" className="pai-img-cover" loading="lazy" /> : null}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{it.title}</p>
                {it.variantTitle ? <p className="text-xs opacity-65">{it.variantTitle}</p> : null}
                <p className="mt-1 text-xs opacity-65">
                  {format(it.price)} × {it.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold">{format(it.total)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1.5 border-t border-pai-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="opacity-75">Subtotal</dt>
            <dd>{format(order.subtotal)}</dd>
          </div>
          {order.discountTotal ? (
            <div className="flex justify-between text-pai-sale">
              <dt>Discount</dt>
              <dd>−{format(order.discountTotal)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="opacity-75">Delivery{order.deliveryZone ? ` · ${order.deliveryZone}` : ""}</dt>
            <dd>{order.shippingTotal ? format(order.shippingTotal) : "Free"}</dd>
          </div>
          <div className="flex justify-between border-t border-pai-border pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{format(order.total)}</dd>
          </div>
        </dl>
      </div>
      <div className="space-y-4 text-sm">
        <div className="rounded-pai border border-pai-border p-5">
          <h2 className="mb-2 font-semibold">Delivery address</h2>
          <p className="font-medium">{a.name}</p>
          {address ? <p className="opacity-75">{address}</p> : null}
          {a.phone ? <p className="mt-1 opacity-75">{a.phone}</p> : null}
        </div>
        <div className="rounded-pai border border-pai-border p-5">
          <h2 className="mb-2 font-semibold">Payment</h2>
          <p className="opacity-75">{order.paymentMethod === "cod" ? "Cash on delivery" : order.paymentMethod.replace(/_/g, " ")}</p>
          <p className="mt-1 font-medium">{PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}</p>
        </div>
      </div>
    </div>
  );
}
