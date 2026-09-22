import { formatMoney } from "@pai/core";
import { PAYMENT_LABELS } from "@pai/core/payments";
import type { Order, OrderItem, Store } from "@pai/db";
import { addressLines } from "@/app/(app)/orders/_lib/filters";
import { courierName } from "@/app/(app)/orders/_lib/labels";

const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka", day: "numeric", month: "short", year: "numeric" });

/** Simple visual "barcode" (Code-39-ish bars) for the order number — scannable text is printed underneath. */
function Bars({ value }: { value: string }) {
  const bits = [...value].flatMap((c) => {
    const n = c.charCodeAt(0);
    return [1, (n & 1) + 1, 1, ((n >> 1) & 1) + 1, 2, ((n >> 2) & 1) + 1, 1];
  });
  let x = 0;
  const rects = bits.map((w, i) => {
    const r = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w} height={34} fill="#000" /> : null;
    x += w;
    return r;
  });
  return (
    <svg viewBox={`0 0 ${x} 34`} width={Math.min(200, x * 1.4)} height={34} preserveAspectRatio="none" aria-hidden>
      {rects}
    </svg>
  );
}

export function OrderDocument({ store, order, items, type }: { store: Store; order: Order; items: OrderItem[]; type: "invoice" | "slip" }) {
  const money = (n: number) => formatMoney(n, order.currency);
  const paid = order.paymentStatus === "paid";
  const due = paid || order.paymentStatus === "refunded" ? 0 : order.total;
  const addr = order.shippingAddress;
  const storeAddr = addressLines(store.address);
  const isSlip = type === "slip";
  return (
    <article className="print-page mx-auto my-6 w-full max-w-[210mm] rounded-xl border border-border bg-white p-8 text-[13px] text-black shadow-sm print:my-0 print:rounded-none print:p-0">
      <header className="flex items-start justify-between gap-6 border-b border-neutral-200 pb-5">
        <div className="flex items-start gap-3">
          {store.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logoUrl} alt="" className="size-12 rounded-lg object-contain" />
          )}
          <div>
            <div className="text-lg font-bold">{store.name}</div>
            {storeAddr && <div className="text-neutral-600">{storeAddr}</div>}
            <div className="text-neutral-600">{[store.phone, store.email].filter(Boolean).join(" · ")}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold uppercase tracking-wide">{isSlip ? "Packing slip" : "Invoice"}</div>
          <div className="mt-1 font-semibold">#{order.number}</div>
          <div className="text-neutral-600">{fmtDate(order.createdAt)}</div>
          <div className="mt-2 flex flex-col items-end">
            <Bars value={String(order.number)} />
            <span className="font-mono text-[10px] tracking-[0.3em]">{order.number}</span>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-6 py-5">
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{isSlip ? "Deliver to" : "Bill to"}</div>
          <div className={isSlip ? "text-base font-bold" : "font-semibold"}>{addr?.name || order.name}</div>
          <div className={isSlip ? "text-base font-semibold" : ""}>{addr?.phone || order.phone}</div>
          {order.email && !isSlip && <div>{order.email}</div>}
          <div className={isSlip ? "mt-1 text-sm" : "mt-1 text-neutral-700"}>{addressLines(addr)}</div>
          {order.deliveryZone && <div className="mt-1 text-neutral-600">Zone: {order.deliveryZone}</div>}
        </div>
        <div className="text-right">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Payment</div>
          <div className="font-semibold">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</div>
          <div className="capitalize text-neutral-700">{order.paymentStatus.replace("_", " ")}</div>
          {order.paymentRef && <div className="text-neutral-600">Ref: {order.paymentRef}</div>}
          {order.courier && (
            <div className="mt-2 text-neutral-700">
              {courierName(order.courier)}
              {(order.courier.trackingCode || order.courier.consignmentId) && <> · {order.courier.trackingCode || order.courier.consignmentId}</>}
            </div>
          )}
        </div>
      </section>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-y border-neutral-300 text-left text-[11px] uppercase tracking-wider text-neutral-500">
            {isSlip && <th className="w-8 py-2" />}
            <th className="py-2">Item</th>
            <th className="py-2">SKU</th>
            <th className="py-2 text-right">Qty</th>
            {!isSlip && <th className="py-2 text-right">Price</th>}
            {!isSlip && <th className="py-2 text-right">Total</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-b border-neutral-200 align-top">
              {isSlip && (
                <td className="py-2.5">
                  <span className="inline-block size-4 rounded border border-neutral-500" />
                </td>
              )}
              <td className="py-2.5 pr-3">
                <div className="font-medium">{it.title}</div>
                {it.variantTitle && <div className="text-neutral-600">{it.variantTitle}</div>}
              </td>
              <td className="py-2.5 text-neutral-600">{it.sku ?? "—"}</td>
              <td className={`py-2.5 text-right tabular-nums ${isSlip ? "text-base font-bold" : ""}`}>{it.quantity}</td>
              {!isSlip && <td className="py-2.5 text-right tabular-nums">{money(it.price)}</td>}
              {!isSlip && <td className="py-2.5 text-right tabular-nums">{money(it.total)}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      <section className="mt-5 flex justify-between gap-6">
        <div className="max-w-[55%] text-neutral-700">
          {order.note && (
            <p>
              <span className="font-semibold">Customer note:</span> {order.note}
            </p>
          )}
          {isSlip && order.staffNote && (
            <p className="mt-1">
              <span className="font-semibold">Staff note:</span> {order.staffNote}
            </p>
          )}
        </div>
        {isSlip ? (
          <div className="rounded-lg border-2 border-black px-4 py-3 text-right">
            <div className="text-[11px] font-semibold uppercase tracking-wider">Collect (COD)</div>
            <div className="text-2xl font-extrabold tabular-nums">{money(due)}</div>
          </div>
        ) : (
          <dl className="w-64 space-y-1.5 tabular-nums">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{money(order.subtotal)}</dd>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between">
                <dt>Discount{order.discountCode ? ` (${order.discountCode})` : ""}</dt>
                <dd>−{money(order.discountTotal)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd>{money(order.shippingTotal)}</dd>
            </div>
            <div className="flex justify-between border-t border-neutral-300 pt-1.5 text-base font-bold">
              <dt>Total</dt>
              <dd>{money(order.total)}</dd>
            </div>
            <div className="mt-2 flex justify-between rounded-md bg-neutral-900 px-3 py-2 text-base font-extrabold text-white print:border-2 print:border-black print:bg-white print:text-black">
              <dt>{due ? "Amount due" : "Paid"}</dt>
              <dd>{money(due || order.total)}</dd>
            </div>
          </dl>
        )}
      </section>

      <footer className="mt-8 border-t border-neutral-200 pt-4 text-center text-neutral-600">
        Thank you for shopping with {store.name}! {store.phone ? `Questions? Call ${store.phone}.` : ""}
      </footer>
    </article>
  );
}
