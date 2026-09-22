import { cartesian, variantTitle, type ProductStatusValue } from "../../_lib/shared";

export type VariantRow = {
  id: string | null;
  values: string[];
  price: number;
  compareAtPrice: number | null;
  sku: string;
  inventory: number;
  imageUrl: string | null;
};

export type OptionRow = { name: string; values: string[] };

export type ProductFormValue = {
  title: string;
  description: string;
  status: ProductStatusValue;
  vendor: string;
  productType: string;
  tags: string[];
  images: { url: string; alt?: string }[];
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  sku: string;
  barcode: string;
  trackInventory: boolean;
  inventory: number;
  allowBackorder: boolean;
  weightGrams: number | null;
  options: OptionRow[];
  variants: VariantRow[];
  seoTitle: string;
  seoDescription: string;
  slug: string;
  featured: boolean;
  collectionIds: string[];
};

export type EditorMeta = {
  collections: { id: string; title: string }[];
  vendors: string[];
  types: string[];
  tags: string[];
  storeUrl: string;
};

export type FieldErrors = Record<string, string>;

export const EMPTY_PRODUCT: ProductFormValue = {
  title: "",
  description: "",
  status: "active",
  vendor: "",
  productType: "",
  tags: [],
  images: [],
  price: 0,
  compareAtPrice: null,
  costPrice: null,
  sku: "",
  barcode: "",
  trackInventory: true,
  inventory: 0,
  allowBackorder: false,
  weightGrams: null,
  options: [],
  variants: [],
  seoTitle: "",
  seoDescription: "",
  slug: "",
  featured: false,
  collectionIds: [],
};

const same = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i]);

/**
 * Rebuild the variant matrix for new options, preserving existing rows:
 * 1) exact value match, 2) an unused old row whose values are all contained (same positions) in the new combo
 *    (e.g. adding a "Color" option keeps "S" → "S / Red").
 */
export function regenerateVariants(options: OptionRow[], old: VariantRow[], defaults: { price: number; compareAtPrice: number | null; sku: string }): VariantRow[] {
  const usable = options.filter((o) => o.name.trim() && o.values.length);
  const combos = cartesian(usable);
  const used = new Set<number>();
  const rows = combos.map((values) => {
    let idx = old.findIndex((v, i) => !used.has(i) && same(v.values, values));
    if (idx < 0) idx = old.findIndex((v, i) => !used.has(i) && v.values.length > 0 && v.values.length < values.length && v.values.every((x, j) => x === values[j]));
    if (idx < 0) idx = old.findIndex((v, i) => !used.has(i) && v.values.length > values.length && values.every((x, j) => x === v.values[j]));
    if (idx >= 0) {
      used.add(idx);
      return { ...old[idx]!, values };
    }
    return { id: null, values, price: defaults.price, compareAtPrice: defaults.compareAtPrice, sku: "", inventory: 0, imageUrl: null };
  });
  // Ids must stay unique — only the first reuse keeps the id (already guaranteed by `used`).
  return rows;
}

export function toOptionsRecord(options: OptionRow[], values: string[]) {
  const o: Record<string, string> = {};
  options.forEach((opt, i) => {
    if (values[i] != null) o[opt.name] = values[i]!;
  });
  return o;
}

export { variantTitle };
