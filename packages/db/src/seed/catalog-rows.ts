/** Turns a catalogue definition into product/collection/variant/review rows for one store. */
import type { collections, productCollections, productReviews, products, productVariants } from "../schema";
import type { Catalog, ProductDef } from "./catalog";
import { personName } from "./lib/bd";
import { IMG } from "./lib/images";
import type { Rng } from "./lib/rng";
import { uuid } from "./lib/rng";
import { addMinutes, daysAgo, escapeHtml, slugify, tk } from "./lib/util";

export type ProductRow = typeof products.$inferInsert & { id: string; salesCount: number };
export type VariantRow = typeof productVariants.$inferInsert & { id: string };
export type SeedProduct = { row: ProductRow; variants: VariantRow[]; pop: number; def: ProductDef };

const REVIEW_TITLES: Record<number, string[]> = {
  5: ["Excellent!", "Highly recommended", "Loved it", "Worth every taka", "Perfect", "Amazing quality"],
  4: ["Very good", "Happy with it", "Good product", "Nice quality"],
  3: ["It's okay", "Average", "Decent for the price"],
  2: ["Not as expected", "Could be better"],
  1: ["Disappointed"],
};
const GENERIC_REVIEWS: Record<number, string[]> = {
  5: ["Exactly as described. Delivery was quick and the rider was polite.", "Second time ordering, quality is consistent. Thank you!", "Cash on delivery made it easy. Very satisfied."],
  4: ["Good product, delivery took one extra day.", "Quality is good, packaging could be a little better.", "Nice, but the colour is a shade different from the photo."],
  3: ["Product is fine but delivery was late.", "Average quality for the price."],
  2: ["Took a week to arrive and the box was dented.", "Expected better quality."],
  1: ["Wrong item delivered, waiting for exchange."],
};

function descriptionHtml(p: ProductDef, catalog: Catalog): string {
  const parts = [`<p>${escapeHtml(p.d)}</p>`];
  const hl = [...(p.h ?? []), ...catalog.perks];
  parts.push(`<ul>${hl.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ul>`);
  if (p.specs?.length) parts.push(`<h3>Specifications</h3><table><tbody>${p.specs.map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`).join("")}</tbody></table>`);
  return parts.join("\n");
}

function cartesian(opts: { name: string; values: string[] }[]): Record<string, string>[] {
  let out: Record<string, string>[] = [{}];
  for (const o of opts) out = out.flatMap((acc) => o.values.map((v) => ({ ...acc, [o.name]: v })));
  return out;
}

export function buildCatalog(storeId: string, storeCreatedAt: Date, catalog: Catalog, opts: { extended: boolean; rng: Rng; skuPrefix: string }) {
  const { rng } = opts;
  const defs = catalog.products.filter((p) => opts.extended || !p.ext);
  const usedSlugs = new Set<string>();

  const collectionRows: (typeof collections.$inferInsert & { id: string })[] = catalog.collections.map((c, i) => ({
    id: uuid(),
    storeId,
    title: c.title,
    slug: c.slug,
    description: c.description,
    imageUrl: IMG[c.img],
    published: true,
    sortOrder: c.sortOrder ?? "manual",
    position: i,
    seo: { title: c.title, description: c.description },
    createdAt: storeCreatedAt,
    updatedAt: storeCreatedAt,
  }));
  const colBySlug = new Map(collectionRows.map((c) => [c.slug, c]));

  const seedProducts: SeedProduct[] = [];
  const links: (typeof productCollections.$inferInsert)[] = [];
  const reviews: (typeof productReviews.$inferInsert)[] = [];
  const colPos = new Map<string, number>();
  const ageSpan = Math.max(10, Math.floor((Date.now() - storeCreatedAt.getTime()) / 86_400_000) - 2);

  defs.forEach((p, idx) => {
    const id = uuid();
    let slug = slugify(p.t);
    while (usedSlugs.has(slug)) slug += "-2";
    usedSlugs.add(slug);
    const sku = `${opts.skuPrefix}-${String(idx + 1).padStart(3, "0")}`;
    // Products listed later in the catalogue are "newer".
    const createdAt = addMinutes(daysAgo(Math.max(1, Math.round(ageSpan * (1 - idx / defs.length)) - rng.int(0, 3))), rng.int(0, 600));
    const stockRange = p.stock ?? [5, 40];
    const variants: VariantRow[] = [];
    let price = tk(p.price);
    let compareAt = p.cmp ? tk(p.cmp) : null;
    let inventory = p.digital ? 0 : rng.int(stockRange[0], stockRange[1]);
    if (p.opt?.length) {
      const combos = cartesian(p.opt);
      combos.forEach((combo, i) => {
        const vals = Object.values(combo);
        let vp = p.price;
        const absHit = vals.find((v) => p.abs && p.abs[v] !== undefined);
        if (absHit) vp = p.abs![absHit]!;
        for (const v of vals) vp += p.delta?.[v] ?? 0;
        const vcmp = p.cmp ? p.cmp + (vp - p.price) : null;
        variants.push({
          id: uuid(),
          productId: id,
          storeId,
          title: vals.join(" / "),
          options: combo,
          price: tk(vp),
          compareAtPrice: vcmp ? tk(vcmp) : null,
          sku: `${sku}-${vals.map((v) => slugify(v).toUpperCase().slice(0, 4)).join("-")}`,
          inventory: p.digital ? 0 : rng.chance(0.06) ? 0 : rng.int(stockRange[0], stockRange[1]),
          imageUrl: null,
          position: i,
        });
      });
      price = Math.min(...variants.map((v) => v.price));
      const withCmp = variants.filter((v) => v.compareAtPrice);
      compareAt = withCmp.length ? Math.min(...withCmp.map((v) => v.compareAtPrice!)) : null;
      inventory = variants.reduce((s, v) => s + (v.inventory ?? 0), 0);
    }

    // Reviews (2–5), consistent rating aggregates.
    const nReviews = rng.int(2, 5);
    let sum = 0;
    for (let r = 0; r < nReviews; r++) {
      const rating = rng.weighted([[5, 56], [4, 30], [3, 9], [2, 4], [1, 1]] as const);
      sum += rating;
      const body = rating >= 4 && rng.chance(0.65) ? rng.pick(catalog.reviews) : rng.pick(GENERIC_REVIEWS[rating]!);
      const at = addMinutes(createdAt, rng.int(3 * 1440, Math.max(3 * 1440 + 1, (Date.now() - createdAt.getTime()) / 60000 - 60)));
      reviews.push({ storeId, productId: id, customerName: personName(rng).name, rating, title: rng.pick(REVIEW_TITLES[rating]!), body, approved: rng.chance(0.93), createdAt: at > new Date() ? addMinutes(new Date(), -rng.int(30, 1440)) : at });
    }

    // Every product gets 2–4 images: single-shot products borrow an on-category lifestyle shot from their collection.
    const imgKeys = [...p.img];
    for (const c of [...p.col.map((s) => catalog.collections.find((x) => x.slug === s)), ...catalog.collections]) {
      if (imgKeys.length >= 2) break;
      if (c && !imgKeys.includes(c.img)) imgKeys.push(c.img);
    }
    const images = imgKeys.slice(0, 4).map((k, i) => ({ url: IMG[k], alt: i === 0 ? p.t : `${p.t} — view ${i + 1}` }));
    const row: ProductRow = {
      id,
      storeId,
      title: p.t,
      slug,
      description: descriptionHtml(p, catalog),
      status: "active",
      vendor: p.vendor ?? catalog.vendor,
      productType: p.type,
      tags: p.tags ?? [],
      images,
      price,
      compareAtPrice: compareAt,
      costPrice: Math.round((price * rng.float(0.45, 0.7)) / 100) * 100,
      sku,
      barcode: p.digital ? null : `89${rng.digits(11)}`,
      trackInventory: !p.digital,
      inventory,
      allowBackorder: false,
      weightGrams: p.digital ? null : (p.weight ?? rng.int(2, 30) * 50),
      options: p.opt ?? [],
      seo: { title: p.t, description: p.d.slice(0, 155), image: images[0]?.url },
      featured: !!p.feat,
      ratingAvg: Math.round((sum / nReviews) * 10) / 10,
      ratingCount: nReviews,
      salesCount: 0,
      createdAt,
      updatedAt: createdAt,
    };
    seedProducts.push({ row, variants, pop: p.pop ?? 1, def: p });

    const cols = new Set(p.col);
    if (p.cmp && colBySlug.has("sale")) cols.add("sale");
    for (const slugC of cols) {
      const c = colBySlug.get(slugC);
      if (!c) continue;
      const pos = colPos.get(c.id) ?? 0;
      colPos.set(c.id, pos + 1);
      links.push({ productId: id, collectionId: c.id, position: pos });
    }
  });

  // Recompute rating aggregates from approved reviews only.
  for (const sp of seedProducts) {
    const rs = reviews.filter((r) => r.productId === sp.row.id && r.approved);
    sp.row.ratingCount = rs.length;
    sp.row.ratingAvg = rs.length ? Math.round((rs.reduce((s, r) => s + r.rating, 0) / rs.length) * 10) / 10 : 0;
  }

  return { collections: collectionRows, products: seedProducts, links, reviews };
}
