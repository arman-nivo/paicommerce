const env = (k: string, fb: string) => (typeof process !== "undefined" && process.env[k]) || fb;

export const WEB_URL = env("NEXT_PUBLIC_WEB_URL", "http://localhost:3000");
export const DASHBOARD_URL = env("NEXT_PUBLIC_DASHBOARD_URL", "http://localhost:3001");
export const ADMIN_URL = env("NEXT_PUBLIC_ADMIN_URL", "http://localhost:3002");
export const STOREFRONT_URL = env("NEXT_PUBLIC_STOREFRONT_URL", "http://localhost:3003");
export const STOREFRONT_ROOT_DOMAIN = env("STOREFRONT_ROOT_DOMAIN", "localhost:3003");

/**
 * Path mode serves stores at {STOREFRONT_URL}/s/{slug} instead of {slug}.{root}.
 * Needed wherever wildcard subdomains are unavailable — e.g. *.vercel.app, which is on the
 * public suffix list, so no wildcard certificate or DNS record can be issued for it.
 * Enabled explicitly, or automatically when the storefront runs on a vercel.app host.
 */
export const STOREFRONT_PATH_MODE =
  /^(1|true|yes)$/i.test(env("NEXT_PUBLIC_STOREFRONT_PATH_MODE", "")) || /\.vercel\.app$/.test(STOREFRONT_ROOT_DOMAIN);

/** Public URL of a store: custom domain if verified, else {slug}.{root} (or /s/{slug} in path mode). */
export function storeUrl(store: { slug: string; customDomain?: string | null; domainVerified?: boolean }): string {
  if (store.customDomain && store.domainVerified) return `https://${store.customDomain}`;
  if (STOREFRONT_PATH_MODE) return `${STOREFRONT_URL.replace(/\/$/, "")}/s/${store.slug}`;
  const proto = STOREFRONT_ROOT_DOMAIN.startsWith("localhost") ? "http" : "https";
  return `${proto}://${store.slug}.${STOREFRONT_ROOT_DOMAIN}`;
}
