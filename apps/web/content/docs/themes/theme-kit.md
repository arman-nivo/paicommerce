---
title: Theme Kit
description: Build complete themes fast with @pai/theme-kit — createBaseTheme, 37 reusable base sections, server-safe components, settings helpers and the interactive client components (cart, variant picker, gallery, search) from @pai/theme-kit/client.
---

`@pai/theme-kit` is the fastest way to build a PaiCommerce theme. It gives you a complete, accessible, conversion-tested storefront — header, footer, home page sections, product page, collection filters, cart drawer, search, blog and customer account — that you restyle and extend with your own sections. Every theme in the Theme Store is built on it.

The kit has two entry points:

| Import | Contains | Runs on |
| --- | --- | --- |
| `@pai/theme-kit` | `createBaseTheme`, base sections, config builders, settings helpers, server-safe components (`ProductCard`, `Price`, `Section` …), utilities | Server (and safe in client components) |
| `@pai/theme-kit/client` | Interactive components and hooks: cart, variant picker, gallery, quick view, search, forms, carousels, countdown | Client (`"use client"`) |

## createBaseTheme

With nothing but a manifest, `createBaseTheme` returns a complete `ThemeDefinition`:

```ts title="themes/monsoon/src/index.ts"
import { createBaseTheme } from "@pai/theme-kit";
import { manifest } from "./manifest";

export default createBaseTheme({ manifest });
```

You get:

- **Every base section** (listed [below](#base-sections)).
- **The kit's global settings** (colours, typography, layout, logo, header, product cards, cart, currency, social, announcement), with defaults tuned for the manifest's **first category** via `CATEGORY_STYLES`.
- **A full default config** for all eleven templates, with a category-specific home page.
- **One preset per manifest category** (`categoryPreset`): palette, fonts and home page for that niche.
- **`kitCssVariables`** as the CSS variable mapper and `fontSettings: ["font_heading", "font_body"]`.

Then customise as much as you like:

```ts title="themes/monsoon/src/index.ts"
import { createBaseTheme, extendSettingsSchema, sectionList } from "@pai/theme-kit";
import { manifest } from "./manifest";
import promoBanner from "./sections/promo-banner";
import lookbook from "./sections/lookbook";

export default createBaseTheme({
  manifest,
  // New sections are added; a section whose type matches a base section replaces it.
  sections: [promoBanner, lookbook],
  // Drop base sections you don't want merchants to use.
  excludeSections: ["custom-html"],
  // Brand defaults applied on top of the category palette.
  settingsDefaults: { color_primary: "#0f766e", color_accent: "#f59e0b", font_heading: "Poppins", radius: 10, button_radius: 999 },
  // Add theme-specific global settings to the kit's schema.
  settingsSchema: (base) =>
    extendSettingsSchema(base, [
      { name: "Product cards", settings: [{ type: "checkbox", id: "card_shadow", label: "Soft shadow on cards", default: false }] },
    ]),
  // Start from the kit's default config and change the home page.
  defaultConfig: (base) => ({
    ...base,
    templates: {
      ...base.templates,
      index: sectionList([
        { id: "hero", type: "promo-banner", settings: { height: "lg" }, blocks: [{ type: "badge", settings: { text: "New season" } }] },
        { type: "featured-collection", settings: { heading: "New arrivals", source: "newest", limit: 8 } },
        { type: "lookbook" },
        { type: "testimonials" },
        { type: "newsletter" },
      ]),
    },
  }),
  css: `.pai-card { transition: box-shadow .2s ease; }`,
});
```

### Options

```ts
type CreateBaseThemeOptions = {
  manifest: ThemeManifest;
  /** Extra sections. A section whose `schema.type` matches a base section replaces it. */
  sections?: SectionDefinition<any>[];
  /** Replace/patch base sections by type: a full definition, or a function of the base definition. */
  overrideSections?: Record<string, SectionDefinition<any> | ((base: SectionDefinition<any>) => SectionDefinition<any>)>;
  /** Base section types to drop entirely. */
  excludeSections?: string[];
  /** Global settings schema, or a function extending `baseSettingsSchema`. */
  settingsSchema?: SettingsGroup[] | ((base: SettingsGroup[]) => SettingsGroup[]);
  /** New default values for global settings, applied on top of the category palette. */
  settingsDefaults?: SettingValues;
  /** Default config, or a function transforming the kit's default config. Partial objects are merged. */
  defaultConfig?: Partial<ThemeConfig> | ((base: ThemeConfig) => ThemeConfig);
  /** Presets, or a function transforming the kit's category presets. */
  presets?: ThemePreset[] | ((base: ThemePreset[]) => ThemePreset[]);
  css?: string; // scoped under .pai-theme-<slug>
  Layout?: ComponentType<ThemeLayoutProps>;
  cssVariables?: ThemeDefinition["cssVariables"]; // default: kitCssVariables
  fontSettings?: string[]; // default: ["font_heading", "font_body"]
};
```

Sections are resolved in this order: **base → `overrideSections` → `excludeSections` → `sections`**. So `overrideSections` is ideal for patching a base section — for example keeping the schema but swapping the component:

```ts
overrideSections: {
  "hero-banner": (base) => ({ ...base, component: MonsoonHero }),
},
```

### Config builders

| Export | Returns |
| --- | --- |
| `sectionList(specs)` | A `SectionList` with **deterministic ids** from a readable array. Ids default to the section type (`hero-banner`, then `hero-banner-2` …); block ids to `<section>--<type>-<n>`. Deterministic ids matter because the customizer and the storefront are different processes and must agree on ids for theme defaults. |
| `baseDefaultConfig(category, settings?)` | The kit's full `ThemeConfig` for a category. |
| `baseHeaderGroup()` / `baseFooterGroup()` | The default header (announcement bar + header) and footer groups. |
| `baseIndexTemplate(category)` | The default home page for a category (hero, trust icons, collection list, new arrivals, image with text, best sellers, testimonials, blog posts). |
| `baseProductTemplate()` | Main product (vendor, title, rating, price, variant picker, stock, buy buttons, trust, description, delivery tab, share), reviews and related products. |
| `categoryPreset(category, overrides?)` | A `ThemePreset` with the category's palette, fonts, hero image and home page. |

```ts
import { categoryPreset } from "@pai/theme-kit";

presets: (base) => [
  ...base,
  categoryPreset("beauty", { name: "Blush", settings: { color_primary: "#be185d", font_heading: "Fraunces" } }),
],
```

## Base sections

All base sections are exported individually (camelCase) and as `baseSectionMap` / `baseSections`:

| Group | Section types |
| --- | --- |
| Header & footer | `announcement-bar`, `header`, `footer` |
| Hero & media | `hero-banner`, `slideshow`, `image-with-text`, `video`, `countdown` |
| Products & collections | `featured-collection`, `product-grid`, `collection-list`, `category-tiles`, `blog-posts` |
| Content | `rich-text`, `multicolumn`, `trust-badges`, `testimonials`, `logo-list`, `newsletter`, `faq`, `image-gallery`, `contact-form`, `custom-html`, `spacer`, `divider` |
| Templates | `main-product`, `product-reviews`, `related-products`, `main-collection`, `main-collections-list`, `main-search`, `main-cart`, `main-page`, `main-blog`, `main-article`, `main-account`, `main-404` |

```ts
import { heroBanner, featuredCollection, baseSectionMap, type BaseSectionType } from "@pai/theme-kit";
```

Base sections share a consistent vocabulary of settings, so merchants learn one customizer: `color_scheme` (default, muted, inverse, primary, accent), `padding` (none, small, medium, large), heading fields (`eyebrow`, `heading`, `subheading`, `align`), button fields and a product source (`source`, `collection`, `products`, `limit`).

## Building your own sections with the kit

The field factories and helpers used by the base sections are exported, so your sections behave like the built-in ones:

```tsx title="themes/monsoon/src/sections/lookbook.tsx"
import { defineSection, type SectionProps } from "@pai/theme-sdk";
import {
  Section,
  SectionHeading,
  ProductGrid,
  PreviewNotice,
  loadSectionProducts,
  productSourceFields,
  headingFields,
  schemeField,
  paddingField,
  str,
} from "@pai/theme-kit";

async function Lookbook({ settings, context }: SectionProps) {
  const { products, sample } = await loadSectionProducts(context, settings, 4);
  return (
    <Section settings={settings}>
      <SectionHeading
        eyebrow={str(settings.eyebrow)}
        title={str(settings.heading)}
        subtitle={str(settings.subheading)}
        align={settings.align === "center" ? "center" : "left"}
      />
      {sample && <PreviewNotice context={context}>Showing sample products — pick a collection in the sidebar.</PreviewNotice>}
      <ProductGrid products={products} context={context} columns={4} />
    </Section>
  );
}

export default defineSection({
  component: Lookbook,
  schema: {
    type: "lookbook",
    name: "Lookbook",
    category: "products",
    icon: "Images",
    settings: [
      ...headingFields({ eyebrow: "Lookbook", heading: "Styled for Eid", align: "center" }),
      ...productSourceFields({ source: "collection", limit: 4 }),
      schemeField("muted"),
      paddingField("large"),
    ],
    presets: [{ name: "Lookbook" }],
  },
});
```

### Section helpers

| Export | Description |
| --- | --- |
| `headingFields({ eyebrow?, heading?, subheading?, align? })` | Eyebrow, heading, subheading and alignment settings. |
| `buttonFields(prefix?, defaults?, title?)` / `readButton(context, settings, prefix?)` | Button label/link/style settings, and a reader that resolves the link through `context.url()`. |
| `productSourceFields({ source?, limit? })` | `source` (collection, featured, newest, best-selling, on-sale, manual), `collection`, `products`, `limit`. |
| `loadSectionProducts(context, settings, fallbackLimit?)` | Resolves products for `productSourceFields`. Returns `{ products, sample, collectionUrl }` — in the customizer, empty results fall back to sample products so the layout stays visible. |
| `schemeField(default?)`, `paddingField(default?)` | Colour scheme and vertical padding settings, read by `<Section>`. |
| `columnsField(default?, min?, max?)`, `mobileColumnsField(default?)`, `imageRatioField(default?, id?, label?)` | Common layout settings. |
| `PreviewNotice` | A dashed notice rendered only when `context.isPreview`. |
| `loadMenu`, `Logo`, `HeroText`, `HERO_HEIGHTS`, `heroPositionClasses` | Building blocks of the header and hero sections. |

### Server-safe components

| Export | Description |
| --- | --- |
| `Section` | Section wrapper: colour scheme, padding from settings, container. |
| `Container` | Max-width container (`default`, `narrow`, `wide`, `full`). |
| `SectionHeading` | Eyebrow + title + subtitle + optional "View all" action. |
| `Button`, `ButtonLink` | Buttons in the theme's style (`primary`, `secondary`, `outline`, `accent`, `light`, `ghost`, `link`). |
| `SmartLink`, `resolveHref(context, href, fallback?)` | Internal links via `next/link`, external links in a new tab; `resolveHref` sends store-relative paths through `context.url()`. |
| `Image`, `Placeholder` | Responsive image with lazy loading; placeholders for empty image settings. |
| `Price`, `moneyOf(context)` | Price with compare-at, "From" ranges and discount badge, in the store currency and the theme's currency display. |
| `ProductCard`, `ProductGrid`, `ProductList`, `cardOptions(context, overrides?)` | Product cards that honour the global "Product cards" settings (ratio, style, quick add, hover image, badges, wishlist). |
| `CollectionCard`, `ArticleCard` | Collection and blog cards. |
| `Rating`, `Badge`, `RichText`, `EmptyState`, `Breadcrumbs`, `Pagination`, `withQuery` | Everyday UI. `RichText` sanitises HTML; `withQuery` builds URLs that patch the current query string. |
| `Icon`, `resolveIcon`, `ICON_OPTIONS`, `SocialIcon`, `SocialLinks`, `getSocialLinks`, `PaymentIcons` | Icons for settings-driven UIs, social links and payment method logos (bKash, Nagad, COD …). |

### Utilities

`cn`, `str`, `num`, `bool`, `list` (safe setting readers), `formatMoney(amount, currency?, display?)`, `discountPercent`, `sanitizeHtml`, `stripHtml`, `truncate`, `aspectClass`, `gridColsClass`, `textAlignClass`, `isVideoFile`, `embedUrl`, `kitCssVariables`, `schemeClass`, `luminance`, `readableOn`, `listingQuery`, `DEFAULT_PAGE_SIZE`, plus sample data (`SAMPLE_PRODUCTS`, `SAMPLE_COLLECTIONS`, `SAMPLE_POSTS`, `STOCK_IMAGES`, `CATEGORY_HERO`) for previews and tests.

### Settings helpers

| Export | Description |
| --- | --- |
| `baseSettingsSchema` | The kit's global settings groups. |
| `BASE_SETTING_IDS` | Every base setting id. |
| `withSettingDefaults(groups, defaults)` | Copy of a schema with new default values. |
| `extendSettingsSchema(base, extra)` | Merge groups: same-name groups are appended to, settings with an existing id replace it, and an id only lives in one group. |
| `CATEGORY_STYLES` | Colour/typography defaults for each business category. |

## Client components: `@pai/theme-kit/client`

Interactive pieces are small client islands. The storefront renders `StorefrontProvider`, `CartProvider` and `ToastProvider` once at the top of every store page, so they work anywhere in your sections.

### Storefront context

```ts
import { useStorefront, useMoney, trackEvent } from "@pai/theme-kit/client";

const sf = useStorefront();
sf.base; // "" | "/s/{slug}" | "/preview/{token}"
sf.url("/cart"); // store-relative URL including the tenant base
sf.api("/cart"); // storefront API URL, e.g. "/s/demo/api/cart"
sf.format(125000); // "৳1,250" in the store currency & theme currency display
sf.customer; // { id, name } | null
sf.isPreview;

const money = useMoney(); // shorthand for sf.format
trackEvent({ event: "AddToCart", value: 1250, currency: "BDT", contentIds: [product.id] });
```

`trackEvent` dispatches a `pai:track` event that the storefront forwards to the Meta Pixel, GA4, GTM and TikTok integrations the merchant has enabled. The kit's components already fire `ViewContent` (product view), `AddToCart`, `Search`, `AddToWishlist` and `Lead` (newsletter sign-up); checkout events are fired by the storefront. Only call it for custom interactions.

### Cart

```tsx
"use client";
import { useCart, useMoney } from "@pai/theme-kit/client";

export function MiniCart() {
  const { cart, openDrawer, pending } = useCart();
  const money = useMoney();
  return (
    <button type="button" onClick={openDrawer} aria-busy={pending} className="pai-btn pai-btn-outline">
      Cart · {cart.itemCount} · {money(cart.total)}
    </button>
  );
}
```

`useCart()` returns:

```ts
type CartApi = {
  cart: CartView; // lines, itemCount, subtotal, discountTotal, shippingTotal, total, discount, deliveryZone, errors, currency, freeShippingOver
  loading: boolean;
  pending: boolean;
  drawerOpen: boolean;
  openDrawer(): void;
  closeDrawer(): void;
  add(input: { productId: string; variantId?: string | null; quantity?: number; optimistic?: {…} }, opts?: { openDrawer?: boolean; silent?: boolean }): Promise<boolean>;
  update(key: string, quantity: number): Promise<void>;
  remove(key: string): Promise<void>;
  applyDiscount(code: string): Promise<{ ok: boolean; error?: string }>;
  removeDiscount(): Promise<void>;
  refresh(): Promise<void>;
  setCart(cart: CartView): void;
};
```

Updates are optimistic and reconciled with the server. The cart talks to the storefront's cart endpoints under the tenant base: `GET {base}/api/cart`, `POST {base}/api/cart/add`, `POST {base}/api/cart/update`, `POST {base}/api/cart/remove`, `POST`/`DELETE {base}/api/cart/discount`.

Ready-made cart UI: `CartButton`, `CartCount`, `CartDrawer`, `CartPageView`, `CartLineItem`, `CartTotals`, `DiscountForm`, `FreeShippingBar`.

### Product form

`ProductProvider` keeps price, variant picker, gallery, stock and buttons in sync — and mirrors the selected variant in `?variant=` so it can be shared:

```tsx title="themes/monsoon/src/components/buy-box.tsx"
import type { SfProduct } from "@pai/theme-sdk";
import { ProductProvider, ProductPrice, VariantPicker, StockIndicator, AddToCartButton, BuyNowButton, ProductGallery } from "@pai/theme-kit/client";

export function BuyBox({ product }: { product: SfProduct }) {
  return (
    <ProductProvider product={product}>
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} layout="thumbnails-left" />
        <div className="flex flex-col gap-5">
          <h1 className="pai-h2">{product.title}</h1>
          <ProductPrice />
          <VariantPicker style="swatch" />
          <StockIndicator lowStockThreshold={5} />
          <AddToCartButton block size="lg" />
          <BuyNowButton />
        </div>
      </div>
    </ProductProvider>
  );
}
```

This file has no `"use client"` directive: it's a Server Component that renders the kit's client components, passing the product as a prop.

| Export | Description |
| --- | --- |
| `ProductProvider`, `useProductForm()` | Selection state: `selected`, `setOption`, `variant`, `price`, `compareAtPrice`, `available`, `inventory`, `imageUrl`, `quantity`, `setQuantity`, `needsSelection`. |
| `VariantPicker` | `style`: `"buttons"`, `"dropdown"` or `"swatch"`. Unavailable combinations are greyed out. |
| `ProductPrice`, `StockIndicator`, `QuantitySelector` | Live price, stock level ("Only 3 left") and quantity stepper. |
| `AddToCartButton`, `BuyNowButton` | Use the provider's selection, or an explicit `product`/`variantId` outside a provider. "Buy now" can go straight to checkout (theme setting). |
| `ProductGallery` | Thumbnails (bottom/left), grid or stacked layouts; swipe, zoom lightbox and variant image sync. |
| `StickyAddToCart` | Mobile sticky bar that appears when the main add-to-cart scrolls out of view. |
| `TrackProductView` | Fires `ViewContent` once. |
| `QuickView`, `QuickAddButton` | Quick view dialog and quick add from product cards. |

### Navigation, search and forms

| Export | Description |
| --- | --- |
| `HeaderShell`, `MobileMenu`, `MenuDropdown`, `AccountLink` | Sticky/transparent header behaviour, accessible mobile drawer and dropdown menus. |
| `SearchBox`, `SearchToggle` | Search with predictive results from `{base}/api/search`. |
| `SortSelect`, `CollectionFilters`, `FilterDrawerButton`, `SORT_OPTIONS` | Collection sorting and filtering via URL query parameters. |
| `ContactForm`, `LoginForm`, `RegisterForm`, `NewsletterForm` | Storefront forms. Customers log in with a phone number or email; registration requires a phone number. |

### Widgets

`Accordion`, `Tabs`, `Carousel`, `Slideshow`, `Countdown` (`<Countdown to={iso} />`), `WishlistButton` / `useWishlist`, `ShareButtons`, `VideoPlayer`, and `ToastProvider` / `useToast`.

> [!TIP]
> The kit's `Countdown` is a drop-in alternative to the hand-written countdown in the [promo banner example](/docs/themes/sections#a-complete-example-promo-banner): `import { Countdown } from "@pai/theme-kit/client"` and render `<Countdown to={settings.ends_at} />`.

## Styling with the kit

The storefront loads `@pai/theme-kit/styles.css`, which maps the theme's CSS variables to Tailwind tokens and component classes:

| Tailwind utility | Maps to |
| --- | --- |
| `bg-pai-bg`, `text-pai-fg`, `bg-pai-primary`, `text-pai-primary-fg`, `bg-pai-accent`, `bg-pai-muted`, `border-pai-border`, `text-pai-sale`, `bg-pai-card` | The colour variables (opacity modifiers work: `text-pai-fg/70`) |
| `font-heading`, `font-body` | `--pai-font-heading`, `--pai-font-body` |
| `rounded-pai`, `rounded-pai-btn` | `--pai-radius`, `--pai-button-radius` |
| `animate-pai-marquee`, `animate-pai-fade`, `animate-pai-slide-in` | Kit animations |

Component classes: `pai-section`, `pai-h1` … `pai-h4`, `pai-eyebrow`, `pai-btn` with `pai-btn-primary | secondary | outline | accent | light | ghost | link` and `pai-btn-sm | lg | block`, and colour schemes `pai-scheme-muted | inverse | primary | accent`.

`kitCssVariables` extends `defaultCssVariables` with colour-scheme tokens (`--pai-scheme-inverse-bg`, `--pai-scheme-primary-muted` …), `--pai-card`, `--pai-heading-transform` (from `heading_case`) and `--pai-logo-width`.

```tsx
<div className="rounded-pai border border-pai-border bg-pai-card p-6">
  <h3 className="font-heading text-lg">Cash on delivery</h3>
  <p className="text-pai-fg/70">Pay when your parcel arrives — anywhere in Bangladesh.</p>
  <a className="pai-btn pai-btn-primary mt-4" href={context.url("/collections/all")}>Shop now</a>
</div>
```
