import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { formatMoney } from "@pai/theme-kit";
import { orderDetail } from "@/lib/account";
import { isRecentOrder } from "@/lib/checkout";
import { customerFor } from "@/lib/customer";
import { getSiteTheme } from "@/lib/theme";
import { renderThemePage } from "@/lib/render";
import { siteUrl } from "@/lib/site";
import { pageMeta, readParams, siteOr404, type PageProps } from "@/lib/pages";
import { OrderProgress, OrderSummaryCard } from "@/components/order-view";
import { PurchaseEvent } from "@/components/purchase-event";

export const dynamic = "force-dynamic";
type P = PageProps<{ id: string }>;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const site = await siteOr404(params);
  return pageMeta(site, "/checkout", { title: "Thank you for your order", noindex: true });
}

export default async function ThankYouPage({ params, searchParams }: P) {
  const site = await siteOr404(params);
  const { id } = await params;
  const sp = await readParams(searchParams);
  if (!UUID.test(id)) notFound();
  const [order, customer, recent, t] = await Promise.all([orderDetail(site.store.id, { id }), customerFor(site), isRecentOrder(id), getSiteTheme(site.key)]);
  // Only the browser that placed the order (or the logged-in owner) may see it.
  if (!order || !(recent || (customer && order.customerId === customer.id))) notFound();
  const { customerId: _c, phone: _p, email, ...detail } = order;
  void _c, void _p;
  const format = (n: number) => formatMoney(n, site.store.currency, (t.settings.currency_display as "symbol" | "code") ?? "symbol");
  const payment = sp.payment;
  const failed = payment === "failed" || payment === "cancelled" || payment === "unavailable";

  return renderThemePage(site, "page", {
    path: `/checkout/thank-you/${id}`,
    children: (
      <section className="pai-section">
        <div className="pai-container max-w-4xl">
          <div className="mb-8 text-center">
            {failed ? <AlertTriangle className="mx-auto size-14 text-pai-sale" aria-hidden /> : <CheckCircle2 className="mx-auto size-14 text-pai-primary" aria-hidden />}
            <p className="mt-4 text-sm font-medium uppercase tracking-widest opacity-60">Order #{order.number}</p>
            <h1 className="pai-h2 mt-2">{failed ? "Your order is saved — payment wasn't completed" : `Thank you${detail.shippingAddress?.name ? `, ${String(detail.shippingAddress.name).split(" ")[0]}` : ""}!`}</h1>
            <p className="mx-auto mt-3 max-w-xl opacity-75">
              {failed
                ? "Don't worry — nothing was charged. The store will contact you to arrange payment, or you can pay cash on delivery."
                : order.paymentMethod === "cod"
                  ? `We've received your order and will call you shortly to confirm it. Please keep ${format(order.total)} ready for the delivery.`
                  : order.paymentMethod === "bkash_manual"
                    ? "We've received your order. We'll verify your transaction and confirm it shortly."
                    : "Your order has been placed. You'll receive updates as it progresses."}
            </p>
            {email ? <p className="mt-2 text-sm opacity-60">A confirmation will be sent to {email}.</p> : null}
            {order.paymentStatus === "pending" && order.paymentMethod !== "cod" && !failed ? (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-pai-muted px-3 py-1 text-xs font-medium">
                <Clock className="size-3.5" aria-hidden /> Payment verification pending
              </p>
            ) : null}
          </div>
          <div className="mb-8">
            <OrderProgress status={order.fulfillmentStatus} />
          </div>
          <OrderSummaryCard order={detail} format={format} />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={siteUrl(site, "/collections/all")} className="pai-btn pai-btn-primary">
              Continue shopping
            </Link>
            <Link href={siteUrl(site, `/track-order?order=${order.number}`)} className="pai-btn pai-btn-outline">
              Track this order
            </Link>
          </div>
        </div>
        {!failed ? <PurchaseEvent orderId={order.id} value={order.total} currency={order.currency} contentIds={[]} numItems={order.itemCount} /> : null}
      </section>
    ),
  });
}
