const env = (k: string, fb: string) => (typeof process !== "undefined" && process.env[k]) || fb;

export const WEB_URL = env("NEXT_PUBLIC_WEB_URL", "http://localhost:3000");
export const DASHBOARD_URL = env("NEXT_PUBLIC_DASHBOARD_URL", "http://localhost:3001");
export const ADMIN_URL = env("NEXT_PUBLIC_ADMIN_URL", "http://localhost:3002");
export const STOREFRONT_URL = env("NEXT_PUBLIC_STOREFRONT_URL", "http://localhost:3003");
export const STOREFRONT_ROOT_DOMAIN = env("STOREFRONT_ROOT_DOMAIN", "localhost:3003");

/** Public URL of a store: custom domain if verified, else {slug}.{root}. */
export function storeUrl(store: { slug: string; customDomain?: string | null; domainVerified?: boolean }): string {
  if (store.customDomain && store.domainVerified) return `https://${store.customDomain}`;
  const proto = STOREFRONT_ROOT_DOMAIN.startsWith("localhost") ? "http" : "https";
  return `${proto}://${store.slug}.${STOREFRONT_ROOT_DOMAIN}`;
}
