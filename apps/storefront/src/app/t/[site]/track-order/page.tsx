import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { normalizePhone } from "@pai/core";
import { formatMoney } from "@pai/theme-kit";
import { orderDetail } from "@/lib/account";
import { getSiteTheme } from "@/lib/theme";
import { renderThemePage } from "@/lib/render";
import { siteUrl } from "@/lib/site";
import { pageMeta, readParams, siteOr404, type PageProps } from "@/lib/pages";
import { OrderProgress, OrderSummaryCard } from "@/components/order-view";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const site = await siteOr404(params);
  return pageMeta(site, "/track-order", { title: "Track your order", description: `Check the delivery status of your ${site.store.name} order.` });
}

/** Guest order tracking: order number + the phone number used at checkout. */
export default async function TrackOrderPage({ params, searchParams }: PageProps) {
  const site = await siteOr404(params);
  const sp = await readParams(searchParams);
  const number = parseInt((sp.order ?? "").replace(/\D/g, ""), 10);
  const phone = normalizePhone(sp.phone);
  const t = await getSiteTheme(site.key);
  const format = (n: number) => formatMoney(n, site.store.currency, (t.settings.currency_display as "symbol" | "code") ?? "symbol");

  let error = "";
  let order: Awaited<ReturnType<typeof orderDetail>> = null;
  if (sp.order && sp.phone) {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    if (!rateLimit(`track:${site.store.id}:${ip}`, 20, 10 * 60_000).ok) error = "Too many lookups — please try again in a few minutes.";
    else if (!Number.isFinite(number) || !phone) error = "Enter your order number and phone number.";
    else {
      order = await orderDetail(site.store.id, { number });
      if (!order || normalizePhone(order.phone) !== phone) {
        order = null;
        error = "We couldn't find an order with that number and phone. Please check and try again.";
      }
    }
  }

  return renderThemePage(site, "page", {
    path: "/track-order",
    searchParams: sp,
    children: (
      <section className="pai-section">
        <div className="pai-container max-w-4xl">
          <div className="mx-auto max-w-lg text-center">
            <PackageSearch className="mx-auto size-12 opacity-70" aria-hidden />
            <h1 className="pai-h2 mt-4">Track your order</h1>
            <p className="mt-2 opacity-70">Enter your order number and the mobile number you used at checkout.</p>
          </div>
          <form method="get" action={siteUrl(site, "/track-order")} className="mx-auto mt-8 grid max-w-lg gap-4 rounded-pai border border-pai-border p-6 sm:grid-cols-2">
            <label className="block">
              <span className="pai-label">Order number</span>
              <input name="order" defaultValue={sp.order ?? ""} required inputMode="numeric" placeholder="e.g. 1048" className="pai-input" />
            </label>
            <label className="block">
              <span className="pai-label">Mobile number</span>
              <input name="phone" defaultValue={sp.phone ?? ""} required inputMode="tel" placeholder="01XXXXXXXXX" className="pai-input" />
            </label>
            {error ? (
              <p className="text-sm font-medium text-pai-sale sm:col-span-2" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" className="pai-btn pai-btn-primary sm:col-span-2">
              Track order
            </button>
          </form>

          {order ? (
            <div className="mt-12 space-y-8">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-sm opacity-60">Order #{order.number}</p>
                  <p className="text-lg font-semibold">Placed {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                {order.trackingUrl ? (
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="pai-btn pai-btn-outline pai-btn-sm">
                    Courier tracking
                  </a>
                ) : null}
              </div>
              <OrderProgress status={order.fulfillmentStatus} />
              {order.events.length ? (
                <div className="rounded-pai border border-pai-border p-5">
                  <h2 className="mb-3 font-semibold">Updates</h2>
                  <ol className="space-y-3 border-l border-pai-border pl-4">
                    {order.events.map((e, i) => (
                      <li key={i} className="text-sm">
                        <p>{e.message}</p>
                        <p className="text-xs opacity-60">{new Date(e.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
              <OrderSummaryCard order={order} format={format} />
            </div>
          ) : null}
        </div>
      </section>
    ),
  });
}
