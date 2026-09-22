/**
 * Tenant resolution. The proxy rewrites every storefront request to `/t/{siteKey}/…` where the
 * site key encodes how the store was addressed:
 *   h.{slug}    → {slug}.{STOREFRONT_ROOT_DOMAIN}  (base "")
 *   s.{slug}    → /s/{slug}/…                        (base "/s/{slug}")
 *   d.{domain}  → verified custom domain             (base "")
 *   p.{token}   → /preview/{token}/…                 (base "/preview/{token}", draft theme config)
 */
import { cache } from "react";
import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { and, db, eq, plans, stores, type Address, type StoreSettings } from "@pai/db";
import { verifyPreviewToken } from "@pai/core/auth";

export type SiteMode = "host" | "path" | "domain" | "preview";

/** Serializable subset of the store row used across the storefront. */
export type SiteStore = {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  domainVerified: boolean;
  category: string;
  description: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  email: string | null;
  phone: string | null;
  address: Address | null;
  currency: string;
  locale: string;
  status: "trial" | "active" | "past_due" | "suspended" | "closed";
  settings: StoreSettings;
  removeBranding: boolean;
  apiAccess: boolean;
};

export type Site = {
  key: string;
  mode: SiteMode;
  /** Path prefix for every store link ("" for subdomain/custom domain). */
  base: string;
  store: SiteStore;
  /** Set in customizer preview: the store_themes row to render (draft config). */
  preview: { storeThemeId: string } | null;
};

export const STORE_TAG = (storeId: string) => `store:${storeId}`;
export const STORE_SLUG_TAG = (slug: string) => `store-slug:${slug}`;

async function queryStore(by: { slug?: string; domain?: string }): Promise<SiteStore | null> {
  const where = by.slug ? eq(stores.slug, by.slug) : and(eq(stores.customDomain, by.domain!), eq(stores.domainVerified, true));
  const [row] = await db
    .select({ s: stores, limits: plans.limits })
    .from(stores)
    .leftJoin(plans, eq(plans.id, stores.planId))
    .where(where)
    .limit(1);
  if (!row) return null;
  const s = row.s;
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    customDomain: s.customDomain,
    domainVerified: s.domainVerified,
    category: s.category,
    description: s.description,
    logoUrl: s.logoUrl,
    faviconUrl: s.faviconUrl,
    email: s.email,
    phone: s.phone,
    address: s.address ?? null,
    currency: s.currency,
    locale: s.locale,
    status: s.status,
    settings: s.settings ?? {},
    removeBranding: !!row.limits?.removeBranding,
    apiAccess: !!row.limits?.apiAccess,
  };
}

/** Store by slug — cached briefly across requests (tag `store-slug:{slug}`). */
export function getStoreBySlug(slug: string) {
  return unstable_cache(() => queryStore({ slug }), ["sf-store-slug", slug], { revalidate: 10, tags: [STORE_SLUG_TAG(slug), "stores"] })();
}

export function getStoreByDomain(domain: string) {
  return unstable_cache(() => queryStore({ domain }), ["sf-store-domain", domain], { revalidate: 10, tags: [`store-domain:${domain}`, "stores"] })();
}

/** Resolve a site key (see file header). Memoised per request. */
export const resolveSite = cache(async (rawKey: string): Promise<Site | null> => {
  const key = decodeURIComponent(rawKey);
  const dot = key.indexOf(".");
  if (dot < 1) return null;
  const kind = key.slice(0, dot);
  const value = key.slice(dot + 1);
  if (!value) return null;
  switch (kind) {
    case "h": {
      const store = await getStoreBySlug(value);
      return store ? { key, mode: "host", base: "", store, preview: null } : null;
    }
    case "s": {
      const store = await getStoreBySlug(value);
      return store ? { key, mode: "path", base: `/s/${value}`, store, preview: null } : null;
    }
    case "d": {
      const store = await getStoreByDomain(value.toLowerCase());
      return store ? { key, mode: "domain", base: "", store, preview: null } : null;
    }
    case "p": {
      const payload = await verifyPreviewToken(value);
      if (!payload) return null;
      const [row] = await db.select({ slug: stores.slug }).from(stores).where(eq(stores.id, payload.sid)).limit(1);
      if (!row) return null;
      const store = await queryStore({ slug: row.slug });
      return store ? { key, mode: "preview", base: `/preview/${value}`, store, preview: { storeThemeId: payload.stid } } : null;
    }
    default:
      return null;
  }
});

/** True when the store can't take orders / be browsed. */
export function isUnavailable(store: SiteStore) {
  return store.status === "suspended" || store.status === "closed";
}

/** Public origin of the current request (respects proxies). */
export const requestOrigin = cache(async (): Promise<string> => {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3003";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.includes(".localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto.split(",")[0]}://${host}`;
});

/** Absolute URL of the store root for the current request, e.g. "http://demo.localhost:3003" or "http://localhost:3003/s/demo". */
export async function storeBaseUrl(site: Site): Promise<string> {
  return `${await requestOrigin()}${site.base}`;
}

/** Store-relative path → URL with the tenant base. */
export function siteUrl(site: Pick<Site, "base">, path: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!site.base) return p;
  return p === "/" ? site.base : `${site.base}${p}`;
}

/** Human-readable single-line store address. */
export function formatAddress(a: Address | null | undefined): string | null {
  if (!a) return null;
  const s = [a.line1, a.line2, a.area, a.city, a.district, a.postalCode].filter(Boolean).join(", ");
  return s || null;
}
