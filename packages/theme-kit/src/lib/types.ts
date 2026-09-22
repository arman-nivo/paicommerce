/**
 * Types shared between the storefront (server) and the kit's client components.
 * These describe the storefront HTTP API contract (`{base}/api/cart`, `{base}/api/search` …).
 */
import type { SfProduct, SfCollection, StorefrontContext, Money } from "@pai/theme-sdk";

/** One priced cart line as returned by `GET {base}/api/cart`. */
export type CartLineView = {
  /** Stable line key: `${productId}:${variantId ?? ""}`. Used by update/remove. */
  key: string;
  productId: string;
  variantId: string | null;
  title: string;
  variantTitle: string | null;
  slug: string;
  /** Store-relative product URL (already includes the tenant base path). */
  url: string;
  imageUrl: string | null;
  unitPrice: Money;
  compareAtPrice: Money | null;
  quantity: number;
  total: Money;
  /** Units available, or null when stock isn't tracked. */
  available: number | null;
  inStock: boolean;
};

/** Cart state returned by every cart endpoint. */
export type CartView = {
  lines: CartLineView[];
  itemCount: number;
  subtotal: Money;
  discountTotal: Money;
  shippingTotal: Money;
  total: Money;
  discount: { code: string; type: string; value: number } | null;
  deliveryZone: { id: string; name: string; charge: Money } | null;
  /** Validation messages (stock, discount errors). */
  errors: string[];
  currency: string;
  /** Free-shipping threshold (minor units) from store delivery settings, if any. */
  freeShippingOver: Money | null;
};

export const EMPTY_CART: CartView = {
  lines: [],
  itemCount: 0,
  subtotal: 0,
  discountTotal: 0,
  shippingTotal: 0,
  total: 0,
  discount: null,
  deliveryZone: null,
  errors: [],
  currency: "BDT",
  freeShippingOver: null,
};

/** `GET {base}/api/search?q=` response (predictive search). */
export type PredictiveSearchResult = {
  query: string;
  products: Pick<SfProduct, "id" | "slug" | "url" | "title" | "price" | "compareAtPrice" | "featuredImage" | "vendor">[];
  collections: Pick<SfCollection, "id" | "slug" | "url" | "title">[];
};

/* ─────────────────────────── account template data ─────────────────────────── */

export type AccountOrderSummary = {
  id: string;
  number: number;
  createdAt: string;
  total: Money;
  currency: string;
  itemCount: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  paymentMethod: string;
};

export type AccountOrderDetail = AccountOrderSummary & {
  subtotal: Money;
  discountTotal: Money;
  shippingTotal: Money;
  deliveryZone: string | null;
  shippingAddress: Record<string, string | undefined> | null;
  items: { title: string; variantTitle: string | null; imageUrl: string | null; price: Money; quantity: number; total: Money }[];
  events: { type: string; message: string; createdAt: string }[];
  trackingUrl: string | null;
};

/**
 * Extra data the storefront attaches to the context on the `account` template.
 * Read it with `getAccountData(context)`.
 */
export type AccountData = {
  view: "login" | "register" | "overview" | "order";
  orders?: AccountOrderSummary[];
  order?: AccountOrderDetail | null;
  /** Where to go after login (store-relative). */
  returnTo?: string;
};

/** Storefront-provided extras on top of the SDK context (all optional). */
export type KitContextExtras = {
  account?: AccountData;
  /** Absolute origin + base of the store, e.g. "https://demo.paicommerce.com" (for share links). */
  storeUrl?: string;
};

export type KitContext = StorefrontContext & KitContextExtras;

export function getAccountData(context: StorefrontContext): AccountData | undefined {
  return (context as KitContext).account;
}
export function getStoreUrl(context: StorefrontContext): string {
  return (context as KitContext).storeUrl ?? "";
}
