import { NextResponse } from "next/server";
import { and, asc, collections, db, desc, eq, inArray, productCollections, products, productVariants } from "@pai/db";
import { getActionCtx } from "@/lib/ctx";
import { csvResponse } from "@/lib/csv";

export const dynamic = "force-dynamic";

const HEADERS = [
  "id",
  "slug",
  "title",
  "description",
  "price",
  "compare_at_price",
  "cost",
  "sku",
  "barcode",
  "inventory",
  "status",
  "vendor",
  "type",
  "tags",
  "image_urls",
  "collection",
  "weight_grams",
  "option_names",
  "variant_title",
  "variant_sku",
  "variant_price",
  "variant_inventory",
];

const major = (minor: number | null | undefined) => (minor == null ? "" : String(minor / 100));

/**
 * GET /api/products/export[?status=active|draft|archived][&ids=uuid,uuid]
 * One row per product; products with variants get one extra line per variant (title empty, variant_* filled),
 * which the importer attaches back to the product above.
 */
export async function GET(req: Request) {
  let ctx;
  try {
    ctx = await getActionCtx("products.view");
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
  const sp = new URL(req.url).searchParams;
  const status = sp.get("status");
  const ids = (sp.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[0-9a-f-]{36}$/i.test(s));
  const storeId = ctx.store.id;
  const where = and(
    eq(products.storeId, storeId),
    status === "active" || status === "draft" || status === "archived" ? eq(products.status, status) : undefined,
    ids.length ? inArray(products.id, ids) : undefined,
  );
  const list = await db.select().from(products).where(where).orderBy(desc(products.createdAt)).limit(20000);
  const pids = list.map((p) => p.id);

  const variants = new Map<string, (typeof productVariants.$inferSelect)[]>();
  const cols = new Map<string, string[]>();
  for (let i = 0; i < pids.length; i += 1000) {
    const chunk = pids.slice(i, i + 1000);
    const [vs, pcs] = await Promise.all([
      db
        .select()
        .from(productVariants)
        .where(and(eq(productVariants.storeId, storeId), inArray(productVariants.productId, chunk)))
        .orderBy(asc(productVariants.position)),
      db
        .select({ productId: productCollections.productId, title: collections.title })
        .from(productCollections)
        .innerJoin(collections, eq(collections.id, productCollections.collectionId))
        .where(and(eq(collections.storeId, storeId), inArray(productCollections.productId, chunk))),
    ]);
    for (const v of vs) variants.set(v.productId, [...(variants.get(v.productId) ?? []), v]);
    for (const c of pcs) cols.set(c.productId, [...(cols.get(c.productId) ?? []), c.title]);
  }

  const rows: (string | number | null)[][] = [HEADERS];
  for (const p of list) {
    const vs = variants.get(p.id) ?? [];
    rows.push([
      p.id,
      p.slug,
      p.title,
      p.description ?? "",
      major(p.price),
      major(p.compareAtPrice),
      major(p.costPrice),
      p.sku ?? "",
      p.barcode ?? "",
      p.trackInventory ? p.inventory : "",
      p.status,
      p.vendor ?? "",
      p.productType ?? "",
      p.tags.join(", "),
      p.images.map((im) => im.url).join("|"),
      (cols.get(p.id) ?? []).join("|"),
      p.weightGrams ?? "",
      vs.length ? p.options.map((o) => o.name).join("|") : "",
      "",
      "",
      "",
      "",
    ]);
    for (const v of vs) {
      rows.push([p.id, p.slug, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", v.title, v.sku ?? "", major(v.price), v.inventory]);
    }
  }
  const date = new Date().toISOString().slice(0, 10);
  return csvResponse(`products-${ctx.store.slug}-${date}.csv`, rows);
}
