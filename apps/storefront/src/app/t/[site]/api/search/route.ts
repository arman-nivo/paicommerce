import { NextResponse } from "next/server";
import { and, collections, db, eq, ilike } from "@pai/db";
import type { PredictiveSearchResult } from "@pai/theme-kit";
import { dataFor } from "@/lib/data";
import { json, siteFromParams, type SiteParams } from "@/lib/http";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/** GET {base}/api/search?q=&limit= → PredictiveSearchResult */
export async function GET(req: Request, { params }: SiteParams) {
  const site = await siteFromParams(params);
  if (site instanceof NextResponse) return site;
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const limit = Math.max(1, Math.min(12, parseInt(url.searchParams.get("limit") ?? "6", 10) || 6));
  if (q.length < 2) return json<PredictiveSearchResult>({ query: q, products: [], collections: [] });
  const like = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
  const [products, cols] = await Promise.all([
    dataFor(site, "/search").getProducts({ query: q, limit, sort: "best-selling" }),
    db
      .select({ id: collections.id, slug: collections.slug, title: collections.title })
      .from(collections)
      .where(and(eq(collections.storeId, site.store.id), eq(collections.published, true), ilike(collections.title, like)))
      .limit(4),
  ]);
  const result: PredictiveSearchResult = {
    query: q,
    products: products.items.map((p) => ({ id: p.id, slug: p.slug, url: p.url, title: p.title, price: p.price, compareAtPrice: p.compareAtPrice, featuredImage: p.featuredImage, vendor: p.vendor })),
    collections: cols.map((c) => ({ ...c, url: siteUrl(site, `/collections/${c.slug}`) })),
  };
  return json(result, { headers: { "Cache-Control": "private, max-age=30" } });
}
