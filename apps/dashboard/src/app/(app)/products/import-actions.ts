"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { slugify } from "@pai/core";
import { and, collections, db, eq, inArray, productCollections, products, productVariants, sql, type ProductOption } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { IMPORT_MAX_ROWS, parseMoneyText, PRODUCT_STATUSES, type ProductStatusValue } from "./_lib/shared";
import { nextFreeSlug, productUsage } from "./_lib/server";

const rowSchema = z.record(z.string(), z.string().max(100_000));

type Row = Record<string, string>;
type Group = { line: number; row: Row; variants: { line: number; row: Row }[] };

const splitList = (v: string | undefined, seps = /[|,]/) =>
  (v ?? "")
    .split(seps)
    .map((s) => s.trim())
    .filter(Boolean);

function parseStatus(v: string | undefined): ProductStatusValue | null {
  const s = (v ?? "").trim().toLowerCase();
  if (!s) return "active";
  if ((PRODUCT_STATUSES as readonly string[]).includes(s)) return s as ProductStatusValue;
  if (["true", "yes", "published", "1"].includes(s)) return "active";
  if (["false", "no", "unpublished", "0", "hidden"].includes(s)) return "draft";
  return null;
}

function parseIntText(v: string | undefined): number | null {
  const s = (v ?? "").replace(/[^0-9\-]/g, "");
  if (!s) return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * Import products from mapped CSV rows (keys = known field names).
 * Rows with an empty title but a variant_title are treated as variants of the preceding product.
 */
export const importProducts = action(z.object({ rows: z.array(rowSchema).min(1, "The file has no rows").max(IMPORT_MAX_ROWS, `Import up to ${IMPORT_MAX_ROWS} rows at a time`), firstLine: z.number().int().min(1).default(2) }), { permission: "products.manage" }, async ({ rows, firstLine }, ctx) => {
  const storeId = ctx.store.id;
  const errors: { row: number; message: string }[] = [];

  // Group variant lines under their product line.
  const groups: Group[] = [];
  rows.forEach((row, i) => {
    const line = firstLine + i;
    const title = row.title?.trim();
    if (!title && row.variant_title?.trim()) {
      const g = groups[groups.length - 1];
      if (g) g.variants.push({ line, row });
      else errors.push({ row: line, message: "Variant row has no product above it — skipped" });
      return;
    }
    groups.push({ line, row, variants: [] });
  });

  const usage = await productUsage(ctx.store);
  const [slugRows, colRows] = await Promise.all([
    db.select({ slug: products.slug }).from(products).where(eq(products.storeId, storeId)),
    db.select({ id: collections.id, title: collections.title, slug: collections.slug }).from(collections).where(eq(collections.storeId, storeId)),
  ]);
  const taken = new Set(slugRows.map((r) => r.slug));
  const colByKey = new Map<string, string>();
  for (const c of colRows) {
    colByKey.set(c.title.toLowerCase(), c.id);
    colByKey.set(c.slug, c.id);
  }
  const colSlugs = new Set(colRows.map((c) => c.slug));

  // Existing product ids (re-importing an export shouldn't duplicate).
  const idCandidates = groups.map((g) => g.row.id?.trim()).filter((v): v is string => !!v && /^[0-9a-f-]{36}$/i.test(v));
  const existingIds = new Set(
    idCandidates.length ? (await db.select({ id: products.id }).from(products).where(and(eq(products.storeId, storeId), inArray(products.id, idCandidates)))).map((r) => r.id) : [],
  );

  let created = 0;
  let skipped = 0;
  let remaining = usage.remaining;
  let collectionsCreated = 0;

  for (const g of groups) {
    const r = g.row;
    const title = r.title?.trim();
    if (!title) {
      errors.push({ row: g.line, message: "Missing title — skipped" });
      skipped++;
      continue;
    }
    if (r.id && existingIds.has(r.id.trim())) {
      errors.push({ row: g.line, message: `“${title}” already exists in your store — skipped` });
      skipped++;
      continue;
    }
    if (remaining <= 0) {
      errors.push({ row: g.line, message: `Plan limit of ${usage.limit} products reached — skipped` });
      skipped++;
      continue;
    }
    const status = parseStatus(r.status);
    if (!status) {
      errors.push({ row: g.line, message: `Unknown status “${r.status}” (use active, draft or archived) — skipped` });
      skipped++;
      continue;
    }
    const price = parseMoneyText(r.price);
    if (r.price?.trim() && price == null) {
      errors.push({ row: g.line, message: `Invalid price “${r.price}” — skipped` });
      skipped++;
      continue;
    }
    const compareAt = parseMoneyText(r.compare_at_price);
    const cost = parseMoneyText(r.cost);
    const inventoryRaw = parseIntText(r.inventory);
    const weight = parseIntText(r.weight_grams);
    const images = splitList(r.image_urls, /[|\n]/)
      .filter((u) => /^https?:\/\//i.test(u) || u.startsWith("/"))
      .map((url) => ({ url }));
    const tags = [...new Set(splitList(r.tags))].slice(0, 50);

    // Variants
    const optionNames = splitList(r.option_names, /[|,]/);
    const variantLines = [...(r.variant_title?.trim() ? [{ line: g.line, row: r }] : []), ...g.variants];
    const variants: { title: string; options: Record<string, string>; price: number; sku: string | null; inventory: number; position: number }[] = [];
    const options: ProductOption[] = [];
    if (variantLines.length) {
      for (const vl of variantLines) {
        const parts = vl.row.variant_title!.split("/").map((s) => s.trim()).filter(Boolean);
        const opts: Record<string, string> = {};
        parts.forEach((p, i) => {
          const name = optionNames[i] || (parts.length === 1 ? "Option" : `Option ${i + 1}`);
          opts[name] = p;
          let o = options.find((x) => x.name === name);
          if (!o) {
            o = { name, values: [] };
            options.push(o);
          }
          if (!o.values.includes(p)) o.values.push(p);
        });
        if (variants.some((v) => v.title === parts.join(" / "))) continue;
        variants.push({
          title: parts.join(" / "),
          options: opts,
          price: parseMoneyText(vl.row.variant_price) ?? price ?? 0,
          sku: vl.row.variant_sku?.trim() || null,
          inventory: parseIntText(vl.row.variant_inventory) ?? 0,
          position: variants.length,
        });
      }
      if (options.length > 3) {
        errors.push({ row: g.line, message: "More than 3 options — variants ignored" });
        variants.length = 0;
        options.length = 0;
      }
    }

    const slug = nextFreeSlug(slugify(r.slug?.trim() || title), taken);
    try {
      await db.transaction(async (tx) => {
        const [p] = await tx
          .insert(products)
          .values({
            storeId,
            title: title.slice(0, 255),
            slug,
            description: r.description?.trim() || null,
            status,
            vendor: r.vendor?.trim() || null,
            productType: r.type?.trim() || null,
            tags,
            images,
            price: variants.length ? Math.min(...variants.map((v) => v.price)) : (price ?? 0),
            compareAtPrice: compareAt || null,
            costPrice: cost,
            sku: r.sku?.trim() || null,
            barcode: r.barcode?.trim() || null,
            trackInventory: variants.length ? true : inventoryRaw != null,
            inventory: variants.length ? variants.reduce((s, v) => s + v.inventory, 0) : (inventoryRaw ?? 0),
            weightGrams: weight,
            options: variants.length ? options : [],
          })
          .returning({ id: products.id });
        if (variants.length) await tx.insert(productVariants).values(variants.map((v) => ({ ...v, productId: p!.id, storeId })));
        for (const name of splitList(r.collection, /[|]/)) {
          let cid = colByKey.get(name.toLowerCase()) ?? colByKey.get(slugify(name));
          if (!cid) {
            const cslug = nextFreeSlug(slugify(name), colSlugs);
            const [c] = await tx.insert(collections).values({ storeId, title: name.slice(0, 120), slug: cslug, position: colRows.length + collectionsCreated }).returning({ id: collections.id });
            cid = c!.id;
            colSlugs.add(cslug);
            colByKey.set(name.toLowerCase(), cid);
            colByKey.set(cslug, cid);
            collectionsCreated++;
          }
          const [m] = await tx
            .select({ max: sql<number>`coalesce(max(${productCollections.position}), -1)` })
            .from(productCollections)
            .where(eq(productCollections.collectionId, cid));
          await tx.insert(productCollections).values({ productId: p!.id, collectionId: cid, position: Number(m?.max ?? -1) + 1 }).onConflictDoNothing();
        }
      });
      taken.add(slug);
      created++;
      remaining--;
    } catch (e) {
      console.error("[import]", e);
      errors.push({ row: g.line, message: `Could not import “${title}” — skipped` });
      skipped++;
    }
  }

  if (created) {
    await audit(ctx, "product.import", undefined, { created, skipped });
    revalidatePath("/products");
    revalidatePath("/products/inventory");
    revalidatePath("/products/collections");
  }
  return { created, skipped, collectionsCreated, errors: errors.slice(0, 200), limitReached: usage.limit != null && remaining <= 0 };
});
