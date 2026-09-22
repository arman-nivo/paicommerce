---
title: Storefront context & data
description: Reference for StorefrontContext, the StorefrontDataAPI and every Sf* type — store, products, variants, collections, pages, posts, reviews and menus — plus context.url() and formatMoney.
---

Every section receives a `context: StorefrontContext`. It's the theme's entire view of the world: the store, the resolved theme settings, the resources for the current template and a read-only `data` API. **Themes never import a database client or call internal APIs** — which is why the same theme works in production, in the customizer preview and against mock data.

## StorefrontContext

```ts
type StorefrontContext = {
  store: SfStore;
  /** Resolved global theme settings (merchant values merged over defaults). */
  theme: SettingValues;
  template: TemplateType;
  /** Current path, e.g. "/collections/new-arrivals". */
  path: string;
  searchParams: Record<string, string | undefined>;

  /** Template-specific resources. */
  product?: SfProduct | null; // product template
  collection?: SfCollection | null; // collection template
  products?: Paginated<SfProduct>; // collection & search results
  page?: SfPage | null; // page template
  post?: SfPost | null; // article template
  posts?: Paginated<SfPost>; // blog template
  customer?: SfCustomer | null; // logged-in customer, if any

  data: StorefrontDataAPI;
  /** True inside the theme customizer — render placeholders for empty settings. */
  isPreview: boolean;
  formatMoney: (amount: Money) => string;
  /** Build a store-relative URL (handles path-based tenants). */
  url: (path: string) => string;
};
```

### Template resources

| Template | Populated fields |
| --- | --- |
| `product` | `product` |
| `collection` | `collection`, `products` (current page, honouring `?sort=`, `?page=` and filter params) |
| `collections` | — (use `data.getCollections()`) |
| `search` | `products` (results for `searchParams.q`) |
| `page` | `page` |
| `blog` | `posts` |
| `article` | `post` |
| `account` | `customer` |
| all | `store`, `theme`, `template`, `path`, `searchParams`, `customer` (when logged in) |

### Building URLs

A store can be served from a subdomain (`rongdhonu.paicommerce.com`), a custom domain (`shop.rongdhonu.com.bd`), the path fallback (`/s/rongdhonu`) or the customizer preview (`/preview/<token>`). **Never hard-code absolute paths** — build every internal link with `context.url()`:

```tsx
<a href={context.url("/")}>Home</a>
<a href={context.url("/collections/new-arrivals")}>New arrivals</a>
<a href={context.url(`/search?q=${encodeURIComponent(query)}`)}>Search</a>
<form action={context.url("/search")} method="get">…</form>
```

On `rongdhonu.paicommerce.com`, `context.url("/cart")` returns `/cart`; under the path fallback it returns `/s/rongdhonu/cart`; in the customizer it returns `/preview/<token>/cart`, so navigation inside the preview keeps working.

Absolute URLs (`https://…`), `mailto:`, `tel:` and `#anchors` are returned unchanged, so it's safe to pass merchant-entered links straight through `context.url()`.

Resources that carry a `url` field — `SfProduct`, `SfCollection`, `SfPage`, `SfPost`, `SfMenuItem` — are **already** resolved for the current base path. Use them as-is; don't wrap them in `context.url()` again.

> [!TIP]
> `/collections/all` is a built-in pseudo-collection containing every active product — a safe default for "Shop now" buttons.

### Formatting money

Amounts are integers in minor units (poisha). `context.formatMoney` formats them in the store's currency:

```tsx
context.formatMoney(125000); // "৳1,250"
context.formatMoney(product.price);
```

Never divide by 100 and format numbers yourself — the store may use a different currency, and the formatter handles symbols and decimals consistently with checkout, emails and invoices. Client components that can't receive the context can use `formatMoney(amount, currency)` from `@pai/theme-kit`, passing `context.store.currency` down as a prop.

### Preview mode

`context.isPreview` is `true` when the page is rendered inside the customizer. Use it to show helpful placeholders instead of empty space, and to skip side effects:

```tsx
if (!settings.image) {
  return context.isPreview ? <ImagePlaceholder label="Add an image in the sidebar" /> : null;
}
```

See [Customizer integration](/docs/themes/customizer).

## StorefrontDataAPI

`context.data` is a read-only, tenant-scoped API. Every method is async and safe to call from any section. Results are memoised per request, so two sections asking for the same menu or product don't hit the database twice. Only `active` products are ever returned.

```ts
interface StorefrontDataAPI {
  getProducts(q?: ProductQuery): Promise<Paginated<SfProduct>>;
  getProduct(slug: string): Promise<SfProduct | null>;
  getCollections(opts?: { limit?: number; slugs?: string[] }): Promise<SfCollection[]>;
  getCollection(slug: string): Promise<SfCollection | null>;
  getRelatedProducts(productId: string, limit?: number): Promise<SfProduct[]>;
  getReviews(productId: string, limit?: number): Promise<SfReview[]>;
  getPosts(opts?: { limit?: number; page?: number }): Promise<Paginated<SfPost>>;
  getMenu(handle: string): Promise<SfMenuItem[]>;
}
```

### getProducts(query)

The workhorse. All fields are optional:

| Field | Type | Description |
| --- | --- | --- |
| `collection` | `string` | Collection **slug**. |
| `ids` | `string[]` | Product ids. |
| `slugs` | `string[]` | Product slugs (e.g. from a `product_list` setting). |
| `query` | `string` | Full-text search over title, description, vendor, tags. |
| `tag` | `string` | Products with this tag. |
| `featured` | `boolean` | Only products marked as featured. |
| `sort` | `"manual" \| "newest" \| "price-asc" \| "price-desc" \| "best-selling" \| "rating" \| "title"` | Sort order. `manual` uses the collection's manual order. |
| `minPrice` / `maxPrice` | `number` | Price bounds in minor units. |
| `inStock` | `boolean` | Only available products. |
| `limit` | `number` | Page size. |
| `page` | `number` | 1-based page number. |

It returns a `Paginated<SfProduct>`:

```ts
type Paginated<T> = { items: T[]; total: number; page: number; pageSize: number; pageCount: number };
```

```tsx
// Best sellers from a collection
const { items } = await context.data.getProducts({ collection: "eid-sale", sort: "best-selling", limit: 8 });

// Products picked in a product_list setting, in stock only
const picked = await context.data.getProducts({ slugs: settings.products, inStock: true, limit: 12 });

// Under ৳1,000
const deals = await context.data.getProducts({ maxPrice: 100000, sort: "price-asc", limit: 12 });
```

### Other methods

```tsx
const product = await context.data.getProduct("jamdani-saree-red");
const collections = await context.data.getCollections({ limit: 6 });
const picked = await context.data.getCollections({ slugs: ["men", "women", "kids"] });
const collection = await context.data.getCollection("new-arrivals");
const related = await context.data.getRelatedProducts(product!.id, 4);
const reviews = await context.data.getReviews(product!.id, 10);
const { items: posts } = await context.data.getPosts({ limit: 3 });
const mainMenu = await context.data.getMenu("main-menu");
```

## Types

### SfStore

```ts
type SfStore = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  currency: string; // "BDT"
  locale: string; // "en" | "bn" …
  social: Record<string, string>; // { facebook, instagram, youtube, tiktok, x, whatsapp, messenger }
  /** Show "Powered by PaiCommerce" (false on paid plans that remove branding). */
  showBranding: boolean;
};
```

> [!NOTE]
> Respect `showBranding`. Footers must render the "Powered by PaiCommerce" credit when it is `true` and hide it when it is `false` — this is checked during theme review.

### SfProduct and SfVariant

```ts
type SfProduct = {
  id: string;
  slug: string;
  url: string; // store-relative, ready to use
  title: string;
  description: string; // HTML
  vendor: string | null;
  productType: string | null;
  tags: string[];
  images: SfImage[];
  featuredImage: SfImage | null;
  price: Money; // minor units
  compareAtPrice: Money | null;
  priceMin: Money; // lowest variant price (equal to price when no variants)
  priceMax: Money;
  onSale: boolean;
  available: boolean;
  inventory: number;
  options: { name: string; values: string[] }[]; // e.g. [{ name: "Size", values: ["S","M","L"] }]
  variants: SfVariant[];
  rating: { average: number; count: number };
  createdAt: string; // ISO 8601
};

type SfVariant = {
  id: string;
  title: string; // "Red / M"
  options: Record<string, string>; // { Color: "Red", Size: "M" }
  price: Money;
  compareAtPrice: Money | null;
  available: boolean;
  inventory: number;
  imageUrl: string | null;
  sku: string | null;
};

type SfImage = { url: string; alt?: string };
```

Show a price range when variants differ in price:

```tsx
const price =
  product.priceMin !== product.priceMax
    ? `${context.formatMoney(product.priceMin)} – ${context.formatMoney(product.priceMax)}`
    : context.formatMoney(product.price);
```

`description` is merchant-authored HTML — sanitise it (`sanitizeHtml` from `@pai/theme-kit`) before rendering with `dangerouslySetInnerHTML`.

### SfCollection

```ts
type SfCollection = {
  id: string;
  slug: string;
  url: string;
  title: string;
  description: string | null;
  image: SfImage | null;
  productsCount: number;
};
```

### SfPage and SfPost

```ts
type SfPage = { id: string; slug: string; url: string; title: string; content: string /* HTML */ };

type SfPost = {
  id: string;
  slug: string;
  url: string;
  title: string;
  excerpt: string | null;
  content: string; // HTML
  coverUrl: string | null;
  author: string | null;
  tags: string[];
  publishedAt: string | null;
};
```

### SfReview

```ts
type SfReview = { id: string; customerName: string; rating: number; title: string | null; body: string | null; createdAt: string };
```

### SfMenuItem

```ts
type SfMenuItem = { id: string; label: string; url: string; active?: boolean; children?: SfMenuItem[] };
```

`active` is `true` when the item's URL matches the current path. Menus can nest; most themes support two levels (mega menus: three).

### SfCustomer

```ts
type SfCustomer = { id: string; name: string; email: string | null; phone: string | null };
```

Many Bangladeshi shoppers check out with only a phone number, so `email` is often `null`. Don't design account pages that assume an email address.

## Mock data

Because sections only depend on `StorefrontContext`, you can render them against mock data in tests or a component playground. `@pai/theme-kit` ships sample products and collections used by the customizer's placeholders — see [Theme Kit](/docs/themes/theme-kit).
