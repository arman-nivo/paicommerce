/**
 * Schema building blocks shared by the base sections. Theme authors can reuse them in their own
 * sections so every section in the customizer feels consistent.
 */
import type { SettingField, SettingValues, SfProduct, StorefrontContext } from "@pai/theme-sdk";
import { list, num, str } from "../lib/utils";
import { SAMPLE_PRODUCTS } from "../lib/samples";
import { resolveHref } from "../components/primitives";

/** `color_scheme` select: default / muted / inverse / primary / accent. */
export const schemeField = (def = "default"): SettingField => ({
  type: "select",
  id: "color_scheme",
  label: "Color scheme",
  default: def,
  options: [
    { value: "default", label: "Default" },
    { value: "muted", label: "Muted" },
    { value: "inverse", label: "Inverse (dark)" },
    { value: "primary", label: "Primary" },
    { value: "accent", label: "Accent" },
  ],
});

/** `padding` select used by `<Section>`. */
export const paddingField = (def = "medium"): SettingField => ({
  type: "select",
  id: "padding",
  label: "Vertical spacing",
  default: def,
  options: [
    { value: "none", label: "None" },
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ],
});

/** Eyebrow / heading / subheading / alignment fields. */
export function headingFields(d: { eyebrow?: string; heading?: string; subheading?: string; align?: "left" | "center" } = {}): SettingField[] {
  return [
    { type: "text", id: "eyebrow", label: "Eyebrow", default: d.eyebrow ?? "" },
    { type: "text", id: "heading", label: "Heading", default: d.heading ?? "" },
    { type: "textarea", id: "subheading", label: "Subheading", default: d.subheading ?? "" },
    {
      type: "select",
      id: "heading_align",
      label: "Heading alignment",
      default: d.align ?? "left",
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
      ],
    },
  ];
}

/** Label + link + style fields for a button, ids prefixed (`button_label`, `button_link`, `button_style`). */
export function buttonFields(prefix = "button", d: { label?: string; link?: string; style?: string } = {}, title = "Button"): SettingField[] {
  return [
    { type: "header", label: title },
    { type: "text", id: `${prefix}_label`, label: "Label", default: d.label ?? "" },
    { type: "url", id: `${prefix}_link`, label: "Link", default: d.link ?? "" },
    {
      type: "select",
      id: `${prefix}_style`,
      label: "Style",
      default: d.style ?? "primary",
      options: [
        { value: "primary", label: "Primary" },
        { value: "secondary", label: "Outline (text colour)" },
        { value: "light", label: "White" },
        { value: "accent", label: "Accent" },
        { value: "link", label: "Link" },
      ],
    },
  ];
}

/** Read a button defined with `buttonFields`. Returns null when the label is empty. */
export function readButton(context: StorefrontContext, s: SettingValues, prefix = "button") {
  const label = str(s[`${prefix}_label`]);
  if (!label) return null;
  return {
    label,
    href: resolveHref(context, s[`${prefix}_link`], "/collections/all"),
    variant: (str(s[`${prefix}_style`], "primary") as "primary" | "secondary" | "light" | "accent" | "link") ?? "primary",
  };
}

export const columnsField = (def = 4, min = 2, max = 6): SettingField => ({ type: "range", id: "columns", label: "Columns (desktop)", min, max, step: 1, default: def });
export const mobileColumnsField = (def = 2): SettingField => ({
  type: "select",
  id: "mobile_columns",
  label: "Columns (mobile)",
  default: String(def),
  options: [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
  ],
});

export const imageRatioField = (def = "portrait", id = "image_ratio", label = "Image ratio"): SettingField => ({
  type: "select",
  id,
  label,
  default: def,
  options: [
    { value: "square", label: "Square" },
    { value: "portrait", label: "Portrait" },
    { value: "tall", label: "Tall" },
    { value: "landscape", label: "Landscape" },
    { value: "wide", label: "Wide (16:9)" },
  ],
});

/** Product source fields: collection picker + fallback source + limit. */
export function productSourceFields(d: { source?: string; limit?: number } = {}): SettingField[] {
  return [
    {
      type: "select",
      id: "source",
      label: "Products",
      default: d.source ?? "collection",
      options: [
        { value: "collection", label: "From a collection" },
        { value: "featured", label: "Featured products" },
        { value: "newest", label: "Newest arrivals" },
        { value: "best-selling", label: "Best sellers" },
        { value: "on-sale", label: "On sale" },
        { value: "manual", label: "Hand-picked products" },
      ],
    },
    { type: "collection", id: "collection", label: "Collection", info: "Used when Products = From a collection." },
    { type: "product_list", id: "products", label: "Hand-picked products", limit: 24 },
    { type: "range", id: "limit", label: "Maximum products", min: 2, max: 24, step: 1, default: d.limit ?? 8 },
  ];
}

/**
 * Resolve products for a section configured with `productSourceFields`.
 * In the customizer preview, empty results fall back to sample products so the layout is visible.
 */
export async function loadSectionProducts(context: StorefrontContext, s: SettingValues, fallbackLimit = 8): Promise<{ products: SfProduct[]; sample: boolean; collectionUrl: string | null }> {
  const limit = num(s.limit, fallbackLimit);
  const source = str(s.source, "collection");
  const collection = str(s.collection);
  let products: SfProduct[] = [];
  let collectionUrl: string | null = null;
  try {
    if (source === "manual") {
      const slugs = list(s.products);
      if (slugs.length) {
        const r = await context.data.getProducts({ slugs, limit: Math.max(limit, slugs.length) });
        const order = new Map(slugs.map((x, i) => [x, i]));
        products = r.items.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0)).slice(0, limit);
      }
    } else if (source === "collection" && collection) {
      const [r, c] = await Promise.all([context.data.getProducts({ collection, limit }), context.data.getCollection(collection)]);
      products = r.items;
      collectionUrl = c?.url ?? null;
    } else if (source === "featured") {
      products = (await context.data.getProducts({ featured: true, limit })).items;
    } else if (source === "on-sale") {
      const r = await context.data.getProducts({ limit: 60, sort: "best-selling" });
      products = r.items.filter((p) => p.onSale).slice(0, limit);
    } else {
      const sort = source === "best-selling" ? "best-selling" : "newest";
      products = (await context.data.getProducts({ sort, limit })).items;
    }
    // Nothing configured / empty collection: show newest products on the live store.
    if (!products.length && !(source === "collection" && collection)) {
      products = (await context.data.getProducts({ sort: "newest", limit })).items;
    }
  } catch {
    products = [];
  }
  if (!products.length && context.isPreview) return { products: SAMPLE_PRODUCTS.slice(0, limit), sample: true, collectionUrl };
  return { products, sample: false, collectionUrl };
}

/** Small notice rendered only in the customizer preview (e.g. "Pick a collection"). */
export function PreviewNotice({ context, children }: { context: StorefrontContext; children: React.ReactNode }) {
  if (!context.isPreview) return null;
  return <p className="mb-4 rounded-pai border border-dashed border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-800">{children}</p>;
}
