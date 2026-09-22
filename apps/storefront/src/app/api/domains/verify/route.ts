/**
 * Caddy on-demand TLS "ask" endpoint: `GET /api/domains/verify?domain=shop.example.com`.
 * 200 → a certificate may be issued for the domain; 404 → refuse. Global path on every host.
 *
 * Allowed: a store's custom domain (and its www. variant), or `{slug}.{STOREFRONT_ROOT_DOMAIN}`
 * for an existing store. Closed stores are refused.
 */
import { and, db, eq, inArray, ne, stores } from "@pai/db";
import { STOREFRONT_ROOT_DOMAIN } from "@pai/core";

export const dynamic = "force-dynamic";

const HOST_RE = /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

function text(body: string, status: number) {
  return new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("domain") ?? "";
  const domain = raw.trim().toLowerCase().replace(/\.$/, "").split(":")[0]!;
  if (!domain || !HOST_RE.test(domain)) return text("invalid domain", 400);

  const root = STOREFRONT_ROOT_DOMAIN.toLowerCase().split(":")[0]!;
  if (domain.endsWith(`.${root}`)) {
    const sub = domain.slice(0, -(root.length + 1));
    if (sub && !sub.includes(".")) {
      const [row] = await db.select({ id: stores.id }).from(stores).where(and(eq(stores.slug, sub), ne(stores.status, "closed"))).limit(1);
      return row ? text("ok", 200) : text("unknown store", 404);
    }
    return text("unknown store", 404);
  }

  const candidates = domain.startsWith("www.") ? [domain, domain.slice(4)] : [domain, `www.${domain}`];
  const [row] = await db
    .select({ id: stores.id })
    .from(stores)
    .where(and(inArray(stores.customDomain, candidates), ne(stores.status, "closed")))
    .limit(1);
  return row ? text("ok", 200) : text("unknown domain", 404);
}
