/**
 * Client-safe shared definitions for the products module (schemas, constants, pure helpers).
 */
import { z } from "zod";

export const PRODUCT_STATUSES = ["active", "draft", "archived"] as const;
export type ProductStatusValue = (typeof PRODUCT_STATUSES)[number];

export const STATUS_HELP: Record<ProductStatusValue, string> = {
  active: "Visible on your store and available to buy.",
  draft: "Hidden from your store. Finish it and set it to Active when ready.",
  archived: "Hidden and kept for your records. You can restore it later.",
};

export const MAX_OPTIONS = 3;
export const MAX_VARIANTS = 100;

export const COLLECTION_SORT_ORDERS = [
  { value: "manual", label: "Manual (drag to reorder)" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "best-selling", label: "Best selling" },
] as const;
export type CollectionSortOrder = (typeof COLLECTION_SORT_ORDERS)[number]["value"];

export const PRODUCT_SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title A–Z" },
  { value: "title-desc", label: "Title Z–A" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "inventory-asc", label: "Inventory: low to high" },
  { value: "inventory-desc", label: "Inventory: high to low" },
  { value: "best-selling", label: "Best selling" },
] as const;

const minor = z.number({ error: "Enter a valid amount" }).int().min(0, "Can't be negative").max(10_000_000_000, "That amount is too large");
const optMinor = minor.nullable();
const text = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters`);

export const variantInputSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  title: text(200).min(1),
  options: z.record(z.string(), z.string()),
  price: minor,
  compareAtPrice: optMinor,
  sku: text(100),
  inventory: z.number().int().min(-1_000_000).max(10_000_000),
  imageUrl: z.string().max(2000).nullable(),
});

export const productInputSchema = z
  .object({
    id: z.string().uuid().optional().nullable(),
    title: text(255).min(1, "Give your product a title"),
    description: z.string().max(100_000),
    status: z.enum(PRODUCT_STATUSES),
    vendor: text(120),
    productType: text(120),
    tags: z.array(text(60).min(1)).max(50, "Up to 50 tags"),
    images: z.array(z.object({ url: z.string().min(1).max(2000), alt: text(300).optional() })).max(50, "Up to 50 images"),
    price: minor,
    compareAtPrice: optMinor,
    costPrice: optMinor,
    sku: text(100),
    barcode: text(100),
    trackInventory: z.boolean(),
    inventory: z.number({ error: "Enter a whole number" }).int().min(-1_000_000).max(10_000_000),
    allowBackorder: z.boolean(),
    weightGrams: z.number().int().min(0, "Can't be negative").max(1_000_000).nullable(),
    options: z
      .array(z.object({ name: text(40).min(1, "Name this option"), values: z.array(text(60).min(1)).min(1, "Add at least one value").max(50) }))
      .max(MAX_OPTIONS, `Up to ${MAX_OPTIONS} options`),
    variants: z.array(variantInputSchema).max(MAX_VARIANTS, `Up to ${MAX_VARIANTS} variants`),
    seoTitle: text(120),
    seoDescription: text(320),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .max(80)
      .regex(/^([a-z0-9ঀ-৿]+(?:-[a-z0-9ঀ-৿]+)*)?$/, "Use lowercase letters, numbers and dashes"),
    featured: z.boolean(),
    collectionIds: z.array(z.string().uuid()).max(100),
  })
  .superRefine((v, ctx) => {
    if (v.compareAtPrice != null && v.compareAtPrice > 0 && v.compareAtPrice <= v.price && !v.variants.length)
      ctx.addIssue({ code: "custom", path: ["compareAtPrice"], message: "Compare-at price should be higher than the price" });
    const names = v.options.map((o) => o.name.toLowerCase());
    if (new Set(names).size !== names.length) ctx.addIssue({ code: "custom", path: ["options"], message: "Option names must be unique" });
    if (v.options.length && !v.variants.length) ctx.addIssue({ code: "custom", path: ["variants"], message: "Add option values to create variants" });
  });

export type ProductInput = z.input<typeof productInputSchema>;
export type VariantInput = z.input<typeof variantInputSchema>;

/** Cartesian product of option values → list of value tuples. */
export function cartesian(options: { name: string; values: string[] }[]): string[][] {
  const opts = options.filter((o) => o.name.trim() && o.values.length);
  if (!opts.length) return [];
  return opts.reduce<string[][]>((acc, o) => acc.flatMap((combo) => o.values.map((v) => [...combo, v])), [[]]);
}

export function variantTitle(values: string[]) {
  return values.join(" / ");
}

/** Minimal HTML hardening for generated copy: drops scripts/embeds, inline handlers and javascript: URLs. */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed|form|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|form|link|meta)[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["']?)\s*javascript:[^"'>\s]*\2/gi, '$1="#"');
}

/** Parse "1,250.50" / "৳1250" → minor units (null when blank / invalid). */
export function parseMoneyText(v: string | undefined | null): number | null {
  if (v == null) return null;
  const s = String(v).replace(/[^0-9.\-]/g, "");
  if (!s) return null;
  const n = parseFloat(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

/** Known CSV columns (import + export). */
export const CSV_FIELDS = [
  { key: "title", label: "Title", aliases: ["name", "product", "product title", "product name"], required: true },
  { key: "description", label: "Description", aliases: ["body", "body html", "body (html)", "details"] },
  { key: "price", label: "Price", aliases: ["variant price", "selling price", "sale price"] },
  { key: "compare_at_price", label: "Compare-at price", aliases: ["compare at price", "regular price", "mrp", "old price", "variant compare at price"] },
  { key: "cost", label: "Cost per item", aliases: ["cost price", "cost per item", "buying price"] },
  { key: "sku", label: "SKU", aliases: ["variant sku", "code"] },
  { key: "barcode", label: "Barcode", aliases: ["variant barcode", "upc", "ean", "isbn"] },
  { key: "inventory", label: "Inventory", aliases: ["stock", "quantity", "qty", "inventory quantity", "variant inventory qty"] },
  { key: "status", label: "Status", aliases: ["published", "state"] },
  { key: "vendor", label: "Vendor", aliases: ["brand", "manufacturer"] },
  { key: "type", label: "Product type", aliases: ["product type", "category", "product_type"] },
  { key: "tags", label: "Tags", aliases: ["tag", "keywords"] },
  { key: "image_urls", label: "Image URLs", aliases: ["images", "image", "image url", "image src", "image_url", "photos"] },
  { key: "collection", label: "Collection", aliases: ["collections", "category collection"] },
  { key: "slug", label: "URL handle", aliases: ["handle", "url handle"] },
  { key: "weight_grams", label: "Weight (grams)", aliases: ["weight", "grams", "variant grams"] },
  { key: "option_names", label: "Option names", aliases: ["options"] },
  { key: "variant_title", label: "Variant title", aliases: ["variant"] },
  { key: "variant_sku", label: "Variant SKU", aliases: [] },
  { key: "variant_price", label: "Variant price", aliases: [] },
  { key: "variant_inventory", label: "Variant inventory", aliases: ["variant stock"] },
] as const;
export type CsvFieldKey = (typeof CSV_FIELDS)[number]["key"];

/** Guess the known field for a CSV header. */
export function guessCsvField(header: string): CsvFieldKey | "" {
  const h = header.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  for (const f of CSV_FIELDS) {
    if (f.key.replace(/_/g, " ") === h || f.label.toLowerCase() === h || (f.aliases as readonly string[]).includes(h)) return f.key;
  }
  return "";
}

export const TEMPLATE_HEADERS = [
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
] as const;

export const IMPORT_MAX_ROWS = 2000;
