import type { ImgKey } from "../lib/images";

export type OptionDef = { name: string; values: string[] };

export type ProductDef = {
  /** Title */
  t: string;
  /** Price in BDT (major units). For variant products this is the base (first variant) price. */
  price: number;
  /** Compare-at price in BDT (sale). */
  cmp?: number;
  img: ImgKey[];
  type: string;
  col: string[];
  /** Short description paragraph. */
  d: string;
  /** Bullet highlights. */
  h?: string[];
  /** Spec table rows. */
  specs?: [string, string][];
  vendor?: string;
  tags?: string[];
  feat?: boolean;
  opt?: OptionDef[];
  /** Price delta (BDT) per option value, e.g. { "256GB": 12000 }. */
  delta?: Record<string, number>;
  /** Absolute price per option value (overrides base + delta), e.g. weight variants. */
  abs?: Record<string, number>;
  /** Stock range per variant (or per product when no variants). */
  stock?: [number, number];
  weight?: number;
  /** Digital/service item — no inventory tracking. */
  digital?: boolean;
  /** Only used in the extended catalogue (merchant demo stores), not the theme demo. */
  ext?: boolean;
  /** Relative popularity for order generation (default 1). */
  pop?: number;
};

export type CollectionDef = { slug: string; title: string; description: string; img: ImgKey; sortOrder?: string };

export type BlogDef = { title: string; excerpt: string; cover: ImgKey; tags: string[]; points: [string, string][] };

export type Catalog = {
  key: string;
  vendor: string;
  collections: CollectionDef[];
  products: ProductDef[];
  blog: BlogDef[];
  /** About-page paragraphs; `{store}` is replaced with the store name. */
  about: string[];
  /** Always-appended product highlights (shipping/returns etc.). */
  perks: string[];
  /** Category-specific review snippets. */
  reviews: string[];
  /** Free shipping threshold in BDT (null = none). */
  freeShippingOver: number | null;
  /** Typical line quantity distribution for orders. */
  qty?: [number, number][];
};
