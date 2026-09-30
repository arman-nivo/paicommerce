import { DASHBOARD_URL, storeUrl, WEB_URL } from "@pai/core";

export const SITE = {
  name: "PaiCommerce",
  tagline: "The commerce platform built for Bangladesh",
  description:
    "Launch a beautiful online store in minutes. bKash, Nagad, SSLCommerz & COD, one-click Steadfast/Pathao/RedX booking, fraud checks, incomplete-order recovery, 13 conversion-ready themes and a developer platform — all in one place.",
  url: WEB_URL.replace(/\/$/, ""),
  email: "hello@paicommerce.com",
  salesEmail: "sales@paicommerce.com",
  supportEmail: "support@paicommerce.com",
  partnersEmail: "partners@paicommerce.com",
  phone: "+880 1700-000000",
  address: "Level 9, Gulshan Avenue, Dhaka 1212, Bangladesh",
  social: {
    facebook: "https://facebook.com/paicommerce",
    youtube: "https://youtube.com/@paicommerce",
    linkedin: "https://linkedin.com/company/paicommerce",
    github: "https://github.com/paicommerce",
    x: "https://x.com/paicommerce",
  },
};

const dash = DASHBOARD_URL.replace(/\/$/, "");

export function signupUrl(params?: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v) q.set(k, v);
  const qs = q.toString();
  return `${dash}/signup${qs ? `?${qs}` : ""}`;
}

export const loginUrl = `${dash}/login`;
export const dashboardUrl = dash;

/**
 * Live demo store for a theme: `{demoSlug}.{STOREFRONT_ROOT_DOMAIN}` (dev: http://aurora-demo.localhost:3003),
 * or `{STOREFRONT_URL}/s/{demoSlug}` where wildcard subdomains aren't available (e.g. *.vercel.app).
 */
export function demoStoreUrl(themeSlug: string, demoStoreSlug?: string | null): string {
  const slug = demoStoreSlug || `${themeSlug}-demo`;
  return storeUrl({ slug });
}

export function absoluteUrl(path = "/"): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
