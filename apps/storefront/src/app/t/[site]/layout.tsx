import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { notFound } from "next/navigation";
import { DASHBOARD_URL } from "@pai/core";
import { str, type CurrencyDisplay } from "@pai/theme-kit";
import type { StorefrontClientConfig } from "@pai/theme-kit/client";
import { isUnavailable, resolveSite, storeBaseUrl } from "@/lib/site";
import { getSiteTheme } from "@/lib/theme";
import { getCart, toCartView } from "@/lib/cart";
import { customerFor } from "@/lib/customer";
import { trackingConfig } from "@/lib/commerce";
import { StorefrontShell } from "@/components/storefront-shell";
import { PreviewBridge } from "@/components/preview-bridge";
import { Tracking } from "@/components/tracking";
import { ChatButtons } from "@/components/chat-button";
import { StoreUnavailable } from "@/components/unavailable";
import { scopeThemeCss } from "@/lib/theme-css";
import { PasswordGate } from "@/components/password-gate";
import { hasStoreAccess, storePassword } from "@/lib/password";
import { cookies } from "next/headers";

type Props = { children: ReactNode; params: Promise<{ site: string }> };

export async function generateMetadata({ params }: { params: Promise<{ site: string }> }): Promise<Metadata> {
  const site = await resolveSite((await params).site);
  if (!site) return { title: "Store not found" };
  const s = site.store;
  const t = await getSiteTheme(site.key);
  const base = await storeBaseUrl(site);
  const description = s.settings?.seo?.description ?? s.description ?? `Shop online at ${s.name}. Cash on delivery available.`;
  const favicon = str(t.settings.favicon) || s.faviconUrl || s.logoUrl || undefined;
  return {
    metadataBase: new URL(base.endsWith("/") ? base : `${base}/`),
    title: { default: s.settings?.seo?.title ?? s.name, template: `%s | ${s.name}` },
    description,
    applicationName: s.name,
    icons: favicon ? { icon: favicon, apple: favicon } : undefined,
    openGraph: { siteName: s.name, type: "website", locale: s.locale === "bn" ? "bn_BD" : "en_US", images: s.settings?.seo?.image ? [s.settings.seo.image] : s.logoUrl ? [s.logoUrl] : undefined },
    twitter: { card: "summary_large_image" },
    robots: site.preview ? { index: false, follow: false } : undefined,
  };
}

export default async function StoreLayout({ children, params }: Props) {
  const site = await resolveSite((await params).site);
  if (!site) notFound();
  if (isUnavailable(site.store) && !site.preview) return <StoreUnavailable name={site.store.name} logoUrl={site.store.logoUrl} />;
  if (!site.preview && !(await hasStoreAccess(site.store))) {
    const wrong = (await cookies()).get("pai_pw_err")?.value === "1";
    return <PasswordGate siteKey={site.key} base={site.base} name={site.store.name} logoUrl={site.store.logoUrl} message={storePassword(site.store)?.message} wrong={wrong} />;
  }

  const [t, cartRow, customer, tracking] = await Promise.all([getSiteTheme(site.key), getCart(site), customerFor(site), trackingConfig(site.store)]);
  const cart = await toCartView(site, cartRow);
  const slug = t.theme.manifest.slug;
  const settings = t.settings;

  const config: StorefrontClientConfig = {
    base: site.base,
    storeId: site.store.id,
    storeName: site.store.name,
    currency: site.store.currency,
    currencyDisplay: (settings.currency_display as CurrencyDisplay) ?? "symbol",
    cartType: settings.cart_type === "page" ? "page" : "drawer",
    buyNowCheckout: settings.buy_now_direct_checkout !== false,
    freeShippingOver: site.store.settings?.delivery?.freeShippingOver ?? null,
    showFreeShipping: settings.cart_show_free_shipping !== false,
    isPreview: !!site.preview,
    customer: customer ? { id: customer.id, name: customer.name } : null,
  };

  const dashboardOrigin = new URL(DASHBOARD_URL).origin;

  return (
    <div className={`pai-root pai-theme-${slug} min-h-screen`} style={t.cssVars as CSSProperties} data-theme={slug} lang={site.store.locale}>
      {t.fontsUrl ? <link rel="stylesheet" href={t.fontsUrl} precedence="default" /> : null}
      <style
        // Theme CSS is scoped under the theme class; body gets the theme background for overscroll.
        dangerouslySetInnerHTML={{ __html: `body{background:${t.cssVars["--pai-bg"] ?? "#fff"}}${scopeThemeCss(slug, t.theme.css)}` }}
      />
      <StorefrontShell config={config} initialCart={cart}>
        {children}
      </StorefrontShell>
      {site.preview ? <PreviewBridge base={site.base} allowedOrigins={[dashboardOrigin]} /> : <Tracking config={tracking} />}
      {!site.preview ? <ChatButtons whatsapp={tracking.whatsapp} messenger={tracking.messenger} storeName={site.store.name} /> : null}
    </div>
  );
}
