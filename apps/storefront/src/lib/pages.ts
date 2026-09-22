/** Helpers shared by the tenant page routes (`app/t/[site]/**`). */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { stripHtml, truncate } from "@pai/core";
import { flatParams, type SearchParamsRecord } from "./render";
import { resolveSite, siteUrl, type Site } from "./site";

export type SiteRouteParams<P extends Record<string, string> = Record<string, never>> = { params: Promise<{ site: string } & P> };
export type PageProps<P extends Record<string, string> = Record<string, never>> = SiteRouteParams<P> & {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Resolve the tenant for a page (404 when the store doesn't exist). */
export async function siteOr404(params: Promise<{ site: string }>): Promise<Site> {
  const site = await resolveSite((await params).site);
  if (!site) notFound();
  return site;
}

export async function readParams(searchParams: PageProps["searchParams"] | undefined): Promise<SearchParamsRecord> {
  return searchParams ? flatParams(await searchParams) : {};
}

/** Decode a dynamic route segment safely (bad escapes → 404). */
export function segment(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch {
    notFound();
  }
}

/** Page metadata with canonical URL + Open Graph. */
export function pageMeta(
  site: Site,
  path: string,
  opts: { title?: string; description?: string | null; image?: string | null; type?: "website" | "article"; noindex?: boolean },
): Metadata {
  const description = opts.description ? truncate(stripHtml(opts.description).replace(/\s+/g, " ").trim(), 160) : undefined;
  const canonical = siteUrl(site, path);
  return {
    title: opts.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: opts.title,
      description,
      url: canonical,
      type: opts.type ?? "website",
      images: opts.image ? [{ url: opts.image }] : undefined,
    },
    robots: opts.noindex || site.preview ? { index: false, follow: !site.preview } : undefined,
  };
}

/** Only allow store-relative redirect targets (prevents open redirects). */
export function safeReturnTo(v: string | undefined | null, fallback = "/account"): string {
  if (!v || !v.startsWith("/") || v.startsWith("//") || v.includes("\\")) return fallback;
  return v;
}

/** Links to the store policies that have content (Settings → Policies). */
export function policyLinks(site: Site) {
  const p = site.store.settings?.policies ?? {};
  const out: { label: string; href: string }[] = [];
  if (p.refund) out.push({ label: "Refund policy", href: siteUrl(site, "/policies/refund") });
  if (p.shipping) out.push({ label: "Shipping policy", href: siteUrl(site, "/policies/shipping") });
  if (p.privacy) out.push({ label: "Privacy policy", href: siteUrl(site, "/policies/privacy") });
  if (p.terms) out.push({ label: "Terms of service", href: siteUrl(site, "/policies/terms") });
  return out;
}
