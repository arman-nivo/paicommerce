/** Renders a theme template (header group → template sections → footer group) for a store page. */
import type { ReactNode } from "react";
import { RenderSections, type Paginated, type SfCollection, type SfPage, type SfPost, type SfProduct, type TemplateType, type ThemeLayoutProps } from "@pai/theme-sdk";
import { formatMoney, type AccountData, type CurrencyDisplay, type KitContext } from "@pai/theme-kit";
import { dataFor } from "./data";
import { getSiteTheme } from "./theme";
import { customerFor } from "./customer";
import { formatAddress, siteUrl, storeBaseUrl, type Site } from "./site";
import { PreviewPing } from "@/components/preview-bridge";

export type PageResources = {
  product?: SfProduct | null;
  collection?: SfCollection | null;
  products?: Paginated<SfProduct>;
  page?: SfPage | null;
  post?: SfPost | null;
  posts?: Paginated<SfPost>;
  account?: AccountData;
};

export type SearchParamsRecord = Record<string, string | undefined>;

/** Flatten Next's searchParams into single string values. */
export function flatParams(sp: Record<string, string | string[] | undefined>): SearchParamsRecord {
  const out: SearchParamsRecord = {};
  for (const [k, v] of Object.entries(sp)) out[k] = Array.isArray(v) ? v[0] : v;
  return out;
}

/** Build the StorefrontContext handed to every section. */
export async function buildContext(site: Site, template: TemplateType, path: string, searchParams: SearchParamsRecord, resources: PageResources = {}): Promise<KitContext> {
  const [t, customer, storeUrl] = await Promise.all([getSiteTheme(site.key), customerFor(site), storeBaseUrl(site)]);
  const s = site.store;
  const social: Record<string, string> = {};
  for (const [k, v] of Object.entries(s.settings?.social ?? {})) if (v) social[k] = v;
  const display = (t.settings.currency_display as CurrencyDisplay) ?? "symbol";
  return {
    store: {
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      logoUrl: s.logoUrl,
      email: s.email,
      phone: s.phone,
      address: formatAddress(s.address),
      currency: s.currency,
      locale: s.locale,
      social,
      showBranding: !s.removeBranding,
    },
    theme: t.settings,
    template,
    path,
    searchParams,
    ...resources,
    customer: customer ? { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone } : null,
    data: dataFor(site, path),
    isPreview: !!site.preview,
    formatMoney: (n: number) => formatMoney(n, s.currency, display),
    url: (p: string) => siteUrl(site, p),
    storeUrl,
  };
}

function DefaultLayout({ header, footer, children }: ThemeLayoutProps) {
  return (
    <>
      {header}
      <main id="main" className="min-h-[50vh]">
        {children}
      </main>
      {footer}
    </>
  );
}

/**
 * Render a full themed page. `children` replaces the template sections (used by storefront-owned
 * pages like order tracking and the thank-you page, which still get the theme header & footer).
 */
export async function renderThemePage(
  site: Site,
  template: TemplateType,
  opts: { path: string; searchParams?: SearchParamsRecord; resources?: PageResources; children?: ReactNode },
) {
  const [t, context] = await Promise.all([getSiteTheme(site.key), buildContext(site, template, opts.path, opts.searchParams ?? {}, opts.resources)]);
  const Layout = t.theme.Layout ?? DefaultLayout;
  const list = t.config.templates[template] ?? t.theme.defaultConfig.templates[template];
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pai focus:bg-pai-bg focus:px-4 focus:py-2 focus:shadow-lg">
        Skip to content
      </a>
      <Layout
        context={context}
        header={<RenderSections theme={t.theme} list={t.config.groups.header} context={context} group="header" />}
        footer={<RenderSections theme={t.theme} list={t.config.groups.footer} context={context} group="footer" />}
      >
        {opts.children ?? <RenderSections theme={t.theme} list={list} context={context} />}
      </Layout>
      {site.preview ? <PreviewPing template={template} path={opts.path} /> : null}
    </>
  );
}
