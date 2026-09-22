import { and, blogPosts, collections, db, eq, pages, products } from "@pai/db";
import { isUnavailable, resolveSite, storeBaseUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Per-store sitemap: home, collections, products, pages, blog posts. */
export async function GET(_req: Request, { params }: { params: Promise<{ site: string }> }) {
  const site = await resolveSite((await params).site);
  if (!site || site.preview || isUnavailable(site.store)) return new Response("Not found", { status: 404 });
  const base = await storeBaseUrl(site);
  const id = site.store.id;
  const [prods, cols, pgs, posts] = await Promise.all([
    db.select({ slug: products.slug, at: products.updatedAt }).from(products).where(and(eq(products.storeId, id), eq(products.status, "active"))).limit(45000),
    db.select({ slug: collections.slug, at: collections.updatedAt }).from(collections).where(and(eq(collections.storeId, id), eq(collections.published, true))),
    db.select({ slug: pages.slug, at: pages.updatedAt }).from(pages).where(and(eq(pages.storeId, id), eq(pages.published, true))),
    db.select({ slug: blogPosts.slug, at: blogPosts.updatedAt }).from(blogPosts).where(and(eq(blogPosts.storeId, id), eq(blogPosts.published, true))),
  ]);
  const urls: { loc: string; at?: Date; priority: string }[] = [
    { loc: base || "/", priority: "1.0" },
    { loc: `${base}/collections`, priority: "0.6" },
    { loc: `${base}/collections/all`, priority: "0.7" },
    ...cols.map((c) => ({ loc: `${base}/collections/${c.slug}`, at: c.at, priority: "0.7" })),
    ...prods.map((p) => ({ loc: `${base}/products/${p.slug}`, at: p.at, priority: "0.8" })),
    ...pgs.map((p) => ({ loc: `${base}/pages/${p.slug}`, at: p.at, priority: "0.4" })),
    ...(posts.length ? [{ loc: `${base}/blog`, priority: "0.5" }] : []),
    ...posts.map((p) => ({ loc: `${base}/blog/${p.slug}`, at: p.at, priority: "0.5" })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.at ? `<lastmod>${u.at.toISOString()}</lastmod>` : ""}<priority>${u.priority}</priority></url>`)
    .join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=600, s-maxage=3600" } });
}
