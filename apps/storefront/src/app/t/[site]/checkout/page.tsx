import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getCart, toCartView } from "@/lib/cart";
import { BD_DISTRICTS } from "@/lib/checkout";
import { deliveryZones, paymentMethods } from "@/lib/commerce";
import { customerFor } from "@/lib/customer";
import { siteUrl } from "@/lib/site";
import { pageMeta, policyLinks, siteOr404, type PageProps } from "@/lib/pages";
import { CheckoutForm } from "@/components/checkout-form";
import { CheckoutShell } from "@/components/checkout-shell";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const site = await siteOr404(params);
  return pageMeta(site, "/checkout", { title: "Checkout", noindex: true });
}

export default async function CheckoutPage({ params }: PageProps) {
  const site = await siteOr404(params);
  const [row, customer, methods] = await Promise.all([getCart(site), customerFor(site), paymentMethods(site.store.id)]);
  const cart = await toCartView(site, row);
  const s = site.store.settings ?? {};
  const snap = row?.checkout ?? {};
  const addr = (snap.address ?? (customer?.addresses?.[0] as Record<string, string> | undefined) ?? {}) as Record<string, string | undefined>;
  const terms = s.checkout?.termsUrl || (s.policies?.terms ? siteUrl(site, "/policies/terms") : null);

  return (
    <CheckoutShell storeName={site.store.name} logoUrl={site.store.logoUrl} homeUrl={siteUrl(site, "/")} cartUrl={siteUrl(site, "/cart")} policies={policyLinks(site)}>
      <h1 className="pai-h2 mb-8">Checkout</h1>
      {!cart.lines.length ? (
        <div className="mx-auto max-w-md rounded-pai border border-pai-border p-10 text-center">
          <ShoppingBag className="mx-auto size-10 opacity-40" aria-hidden />
          <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-sm opacity-70">Add something you love, then come back to check out.</p>
          <Link href={siteUrl(site, "/collections/all")} className="pai-btn pai-btn-primary mt-6">
            Continue shopping
          </Link>
        </div>
      ) : (
        <CheckoutForm
          zones={deliveryZones(site.store)}
          methods={methods}
          districts={BD_DISTRICTS}
          requireEmail={!!s.checkout?.requireEmail}
          allowNote={s.checkout?.orderNote !== false}
          termsUrl={terms}
          minimumOrder={s.checkout?.minimumOrder ?? null}
          freeShippingOver={s.delivery?.freeShippingOver ?? null}
          isPreview={!!site.preview}
          initial={{
            name: snap.name ?? customer?.name ?? "",
            phone: snap.phone ?? customer?.phone ?? "",
            email: snap.email ?? customer?.email ?? "",
            line1: addr.line1 ?? "",
            area: addr.area ?? "",
            city: addr.city ?? "",
            district: addr.district ?? "",
            deliveryZoneId: snap.deliveryZoneId ?? "",
            note: snap.note ?? "",
          }}
        />
      )}
    </CheckoutShell>
  );
}
