/**
 * PaiCommerce Theme SDK — core types.
 *
 * A theme is a package that exports a `ThemeDefinition` (via `defineTheme`). It contains:
 *  - a manifest (store listing metadata)
 *  - global settings schema (colors, typography, layout …) editable in the customizer
 *  - sections: React components + a JSON schema describing their settings and blocks
 *  - presets: ready-made configurations (e.g. "Fashion", "Grocery") merchants can start from
 *  - a default ThemeConfig: which sections appear on each template, in which order
 *
 * Merchants never touch code: the customizer edits a `ThemeConfig` JSON document which the
 * storefront renders by looking up section components in the theme.
 */
import type { ComponentType, ReactNode } from "react";

/* ─────────────────────────── Business categories ─────────────────────────── */

export const BUSINESS_CATEGORIES = [
  { id: "fashion", label: "Fashion & Apparel" },
  { id: "electronics", label: "Electronics & Gadgets" },
  { id: "grocery", label: "Grocery & Supermarket" },
  { id: "beauty", label: "Beauty & Cosmetics" },
  { id: "home", label: "Home, Furniture & Decor" },
  { id: "food", label: "Food, Restaurant & Bakery" },
  { id: "jewelry", label: "Jewelry & Accessories" },
  { id: "health", label: "Health, Pharmacy & Wellness" },
  { id: "kids", label: "Kids, Baby & Toys" },
  { id: "sports", label: "Sports, Fitness & Outdoor" },
  { id: "books", label: "Books, Stationery & Education" },
  { id: "digital", label: "Digital Products & Courses" },
  { id: "handicraft", label: "Handicrafts & Art" },
  { id: "automotive", label: "Automotive & Tools" },
  { id: "pets", label: "Pet Supplies" },
  { id: "gifts", label: "Gifts & Flowers" },
  { id: "general", label: "General Store / Multi-category" },
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number]["id"];

/* ─────────────────────────── Settings schema ─────────────────────────── */

type BaseField<T extends string, V> = {
  type: T;
  /** Unique key within the section/block/theme settings. */
  id: string;
  label: string;
  default?: V;
  /** Helper text shown under the input. */
  info?: string;
};

export type Option = { value: string; label: string };

export type SettingField =
  | (BaseField<"text", string> & { placeholder?: string })
  | (BaseField<"textarea", string> & { placeholder?: string })
  | BaseField<"richtext", string>
  | (BaseField<"url", string> & { placeholder?: string })
  | BaseField<"image", string>
  | BaseField<"video", string>
  | BaseField<"color", string>
  | (BaseField<"range", number> & { min: number; max: number; step?: number; unit?: string })
  | (BaseField<"number", number> & { min?: number; max?: number })
  | (BaseField<"select", string> & { options: Option[] })
  | (BaseField<"radio", string> & { options: Option[] })
  | BaseField<"checkbox", boolean>
  | (BaseField<"font", string> & { /** Google font family names */ options?: string[] })
  | BaseField<"product", string> // product slug
  | BaseField<"collection", string> // collection slug
  | (BaseField<"product_list", string[]> & { limit?: number })
  | BaseField<"menu", string> // menu handle
  | BaseField<"datetime", string>
  | { type: "header"; id?: never; label: string; info?: string };

export type SettingFieldType = SettingField["type"];
export type SettingValues = Record<string, unknown>;

export type SettingsGroup = { name: string; settings: SettingField[] };

/* ─────────────────────────── Sections & blocks ─────────────────────────── */

export type TemplateType =
  | "index"
  | "product"
  | "collection"
  | "collections"
  | "search"
  | "cart"
  | "page"
  | "blog"
  | "article"
  | "account"
  | "404";

export const TEMPLATE_TYPES: { id: TemplateType; label: string; path: string }[] = [
  { id: "index", label: "Home page", path: "/" },
  { id: "product", label: "Product page", path: "/products/{product}" },
  { id: "collection", label: "Collection page", path: "/collections/{collection}" },
  { id: "collections", label: "Collections list", path: "/collections" },
  { id: "search", label: "Search", path: "/search" },
  { id: "cart", label: "Cart", path: "/cart" },
  { id: "page", label: "Content page", path: "/pages/{page}" },
  { id: "blog", label: "Blog", path: "/blog" },
  { id: "article", label: "Blog post", path: "/blog/{post}" },
  { id: "account", label: "Customer account", path: "/account" },
  { id: "404", label: "404 page", path: "/404" },
];

export type SectionGroup = "header" | "footer";

export type SectionCategory =
  | "header"
  | "footer"
  | "hero"
  | "products"
  | "collections"
  | "content"
  | "media"
  | "social-proof"
  | "marketing"
  | "template"; // main template sections (product main, collection grid …)

export type BlockSchema = {
  type: string;
  name: string;
  settings: SettingField[];
  /** Max instances of this block type in one section. */
  limit?: number;
};

export type SectionPreset = {
  name: string;
  settings?: SettingValues;
  blocks?: { type: string; settings?: SettingValues }[];
};

export type SectionSchema = {
  /** Unique section type within the theme, e.g. "hero-banner". */
  type: string;
  name: string;
  description?: string;
  category: SectionCategory;
  /** lucide icon name used in the customizer sidebar. */
  icon?: string;
  settings: SettingField[];
  blocks?: BlockSchema[];
  maxBlocks?: number;
  /** Restrict to templates; omit to allow everywhere. */
  templates?: TemplateType[];
  /** Restrict to a section group (header/footer). */
  group?: SectionGroup;
  /** Max instances per template (e.g. main product = 1). */
  limit?: number;
  /** Shown in "Add section" picker. At least one preset makes a section addable. */
  presets?: SectionPreset[];
};

/* ─────────────────────────── Config documents ─────────────────────────── */

export type BlockInstance = { id: string; type: string; settings: SettingValues; disabled?: boolean };

export type SectionInstance = {
  type: string;
  settings: SettingValues;
  blocks?: BlockInstance[];
  disabled?: boolean;
};

/** Ordered list of sections for a template or group. */
export type SectionList = {
  sections: Record<string, SectionInstance>;
  order: string[];
};

export type ThemeConfig = {
  /** Global theme settings (values for `ThemeDefinition.settingsSchema`). */
  settings: SettingValues;
  /** Header & footer groups rendered on every page. */
  groups: Record<SectionGroup, SectionList>;
  templates: Partial<Record<TemplateType, SectionList>>;
};

/* ─────────────────────────── Storefront data (theme-facing) ─────────────────────────── */

export type Money = number; // minor units

export type SfImage = { url: string; alt?: string };

export type SfVariant = {
  id: string;
  title: string;
  options: Record<string, string>;
  price: Money;
  compareAtPrice: Money | null;
  available: boolean;
  inventory: number;
  imageUrl: string | null;
  sku: string | null;
};

export type SfProduct = {
  id: string;
  slug: string;
  url: string;
  title: string;
  description: string; // HTML
  vendor: string | null;
  productType: string | null;
  tags: string[];
  images: SfImage[];
  featuredImage: SfImage | null;
  price: Money;
  compareAtPrice: Money | null;
  /** Lowest/highest variant price (equal to price when no variants). */
  priceMin: Money;
  priceMax: Money;
  onSale: boolean;
  available: boolean;
  inventory: number;
  options: { name: string; values: string[] }[];
  variants: SfVariant[];
  rating: { average: number; count: number };
  createdAt: string;
};

export type SfCollection = {
  id: string;
  slug: string;
  url: string;
  title: string;
  description: string | null;
  image: SfImage | null;
  productsCount: number;
};

export type SfPage = { id: string; slug: string; url: string; title: string; content: string };

export type SfPost = {
  id: string;
  slug: string;
  url: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverUrl: string | null;
  author: string | null;
  tags: string[];
  publishedAt: string | null;
};

export type SfReview = { id: string; customerName: string; rating: number; title: string | null; body: string | null; createdAt: string };

export type SfMenuItem = { id: string; label: string; url: string; active?: boolean; children?: SfMenuItem[] };

export type SfStore = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  currency: string;
  locale: string;
  social: Record<string, string>;
  /** Show "Powered by PaiCommerce" (false on paid plans that remove branding). */
  showBranding: boolean;
};

export type SfCustomer = { id: string; name: string; email: string | null; phone: string | null };

export type ProductQuery = {
  collection?: string; // collection slug
  ids?: string[];
  slugs?: string[];
  query?: string;
  tag?: string;
  featured?: boolean;
  sort?: "manual" | "newest" | "price-asc" | "price-desc" | "best-selling" | "rating" | "title";
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  limit?: number;
  page?: number;
};

export type Paginated<T> = { items: T[]; total: number; page: number; pageSize: number; pageCount: number };

/**
 * Read-only data API the storefront hands to sections. Themes never import a database;
 * they ask for data through this interface, so they run identically in every environment
 * (production, the customizer preview, the theme dev server with mock data).
 */
export interface StorefrontDataAPI {
  getProducts(q?: ProductQuery): Promise<Paginated<SfProduct>>;
  getProduct(slug: string): Promise<SfProduct | null>;
  getCollections(opts?: { limit?: number; slugs?: string[] }): Promise<SfCollection[]>;
  getCollection(slug: string): Promise<SfCollection | null>;
  getRelatedProducts(productId: string, limit?: number): Promise<SfProduct[]>;
  getReviews(productId: string, limit?: number): Promise<SfReview[]>;
  getPosts(opts?: { limit?: number; page?: number }): Promise<Paginated<SfPost>>;
  getMenu(handle: string): Promise<SfMenuItem[]>;
}

/** Everything a section needs to render. */
export type StorefrontContext = {
  store: SfStore;
  /** Resolved global theme settings. */
  theme: SettingValues;
  template: TemplateType;
  /** Current path, e.g. "/collections/new-arrivals". */
  path: string;
  searchParams: Record<string, string | undefined>;
  /** Template-specific resources. */
  product?: SfProduct | null;
  collection?: SfCollection | null;
  products?: Paginated<SfProduct>; // collection/search results
  page?: SfPage | null;
  post?: SfPost | null;
  posts?: Paginated<SfPost>;
  customer?: SfCustomer | null;
  data: StorefrontDataAPI;
  /** True inside the theme customizer — sections may render placeholders for empty settings. */
  isPreview: boolean;
  formatMoney: (amount: Money) => string;
  /** Build a store-relative URL (handles path-based tenants). */
  url: (path: string) => string;
};

/* ─────────────────────────── Section components ─────────────────────────── */

export type SectionProps<S extends SettingValues = SettingValues> = {
  /** Section instance id — also rendered as `data-section-id` for the customizer. */
  id: string;
  settings: S;
  blocks: BlockInstance[];
  context: StorefrontContext;
};

export type SectionComponent<S extends SettingValues = SettingValues> = ComponentType<SectionProps<S>>;

export type SectionDefinition<S extends SettingValues = SettingValues> = {
  schema: SectionSchema;
  component: SectionComponent<S>;
};

/* ─────────────────────────── Theme definition ─────────────────────────── */

export type ThemeManifest = {
  /** Unique, URL-safe id. Must match the DB `themes.slug`. */
  slug: string;
  name: string;
  version: string;
  tagline: string;
  description: string;
  author: { name: string; url?: string; email?: string };
  categories: BusinessCategory[];
  tags?: string[];
  /** Price in BDT minor units; 0 = free. */
  price: number;
  thumbnail: string;
  screenshots?: string[];
  features?: string[];
  supportUrl?: string;
  docsUrl?: string;
  /** Minimum SDK version this theme supports. */
  sdk?: string;
};

export type ThemePreset = {
  id: string;
  name: string;
  category: BusinessCategory;
  description?: string;
  thumbnail?: string;
  /** Overrides applied on top of the default config. */
  settings?: SettingValues;
  templates?: ThemeConfig["templates"];
  groups?: Partial<ThemeConfig["groups"]>;
};

export type ThemeLayoutProps = {
  context: StorefrontContext;
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

export type ThemeDefinition = {
  manifest: ThemeManifest;
  settingsSchema: SettingsGroup[];
  sections: SectionDefinition<any>[];
  defaultConfig: ThemeConfig;
  presets?: ThemePreset[];
  /**
   * Optional layout wrapper. Defaults to header → main → footer.
   */
  Layout?: ComponentType<ThemeLayoutProps>;
  /**
   * Theme-level CSS (string). Scoped automatically under `.pai-theme-<slug>`.
   * Prefer Tailwind utility classes + the CSS variables emitted from settings.
   */
  css?: string;
  /**
   * Map global settings → CSS custom properties. Defaults to `defaultCssVariables`.
   */
  cssVariables?: (settings: SettingValues) => Record<string, string>;
  /** Google Fonts to load: settings ids of `font` fields, resolved at runtime. */
  fontSettings?: string[];
};
