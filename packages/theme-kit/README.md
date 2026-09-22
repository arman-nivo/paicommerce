# @pai/theme-kit

Build PaiCommerce storefront themes quickly. The kit gives you a complete, working theme from a manifest alone. Every section works with the customizer, and the cart, checkout links, search, accounts and quick view are already wired up. You then add or replace sections, settings, presets and CSS to give the theme its own identity.

- `@pai/theme-kit`: the theme builder, base sections, server-safe components and utilities.
- `@pai/theme-kit/client`: interactive Client Components and hooks for the cart, product form, search and navigation.
- `@pai/theme-kit/styles.css`: design tokens and `pai-*` component classes. The storefront already imports it; themes don't.

Read `packages/theme-sdk/src/types.ts` for the contract, which covers `ThemeDefinition`, `SectionSchema`, `StorefrontContext` and `SettingField`. Aurora (`themes/aurora`) is the reference theme.

## Rules for theme packages

1. **Themes never touch the database.** All data comes from `context`: `context.product`, `context.collection`, `context.products`, `context.page`, `context.post`, `context.customer`, and `context.data.getProducts()`, `getProduct()`, `getCollections()`, `getCollection()`, `getRelatedProducts()`, `getReviews()`, `getPosts()` and `getMenu()`. Don't import `@pai/db` or `@pai/core`.
2. **Build every internal link with `context.url(path)`.** Stores are served at `{slug}.domain`, at a custom domain, at `/s/{slug}/…` and in the customizer preview `/preview/{token}/…`. A hard-coded `href="/cart"` breaks three of those. Merchant-entered links (`url` settings) go through `resolveHref(context, value)`. Objects from `context.data` (`product.url`, `collection.url`, menu items) are already prefixed with the base path, so use them as-is. In client components, use `useStorefront().url(path)`.
3. **Don't import `next/*` from a theme.** `next` isn't a dependency of theme packages, and pnpm's strict `node_modules` means `next/link` won't resolve from `/themes`. Use the kit's re-exports instead:
   - `Link` from `@pai/theme-kit` in server code;
   - `Link`, `usePathname`, `useRouter` and `useSearchParams` from `@pai/theme-kit/client`;
   - `SmartLink` for merchant URLs, since it opens external links in a new tab.
4. **Sections are Server Components by default and may be `async`.** Put interactivity in a small `"use client"` file inside the theme, like `themes/aurora/src/client/*`, or use the kit client components.
5. **Don't add npm dependencies.** Available: react, lucide-react, `@pai/theme-sdk`, `@pai/theme-kit`.
6. **Images** must be `https://images.unsplash.com/photo-…` URLs. Check them with `node tools/verify-images.mjs themes/<slug>`. Use plain `<img>` (or the kit's `Image`), not `next/image`.
7. **Before you hand off**, run all of:
   - `npx tsc --noEmit -p themes/<slug>`
   - `node tools/create-theme/validate.mjs <slug>`
   - `node tools/verify-images.mjs themes/<slug>`

   Then curl `http://localhost:3003/s/<store-using-your-theme>/`. The seeded `<slug>-demo` stores use the matching theme.

## `createBaseTheme(options)`

```ts
import { createBaseTheme, sectionList, categoryPreset } from "@pai/theme-kit";
export default createBaseTheme({ manifest, /* options */ });
```

| Option | Type | Purpose |
| --- | --- | --- |
| `manifest` | `ThemeManifest` | Required. `manifest.categories[0]` picks the base palette (`CATEGORY_STYLES`) and home page. |
| `sections` | `SectionDefinition[]` | New sections. A section whose `schema.type` matches a base section **replaces** it. |
| `overrideSections` | `Record<type, SectionDefinition \| (base) => SectionDefinition>` | Patch a base section. The function form receives the kit definition, so you can keep its schema and swap only the component, or extend it. |
| `excludeSections` | `string[]` | Remove base section types from the customizer. |
| `settingsSchema` | `SettingsGroup[] \| (base) => SettingsGroup[]` | Global settings. Usually `(base) => extendSettingsSchema(base, [{ name: "Aurora", settings: [...] }])`. |
| `settingsDefaults` | `SettingValues` | New defaults for global settings such as colours, fonts and card style. Applied on top of the category palette. |
| `defaultConfig` | `Partial<ThemeConfig> \| (base) => ThemeConfig` | Which sections appear on each template. A partial object is merged into the kit default. |
| `presets` | `ThemePreset[] \| (base) => ThemePreset[]` | One preset per category you support. `preset.id` **must equal** the category id; new stores pick a preset by their category. |
| `css` | `string` | Theme CSS, nested under `.pai-theme-<slug>`. Use `&` selectors (`& .pai-btn { … }`) and keep it small. `@keyframes`, `@font-face`, `@property` and `@import` are hoisted to the top level automatically, so declare them normally. |
| `Layout` | `ComponentType<ThemeLayoutProps>` | Page wrapper (`header`, `footer`, `children`, `context`). |
| `cssVariables` | `(settings) => Record<string,string>` | Defaults to `kitCssVariables`. Wrap it if you add variables: `(s) => ({ ...kitCssVariables(s), "--x": … })`. |
| `fontSettings` | `string[]` | Ids of `font` settings to load from Google Fonts. Default `["font_heading","font_body"]`. |

### Config helpers

- **`sectionList([{ type, settings?, blocks?, id? }])`** builds a `SectionList` with **deterministic ids**: the type, then `type-2` and so on. Blocks get `{sectionId}--{type}-{n}`. Always use it for defaults, because the customizer and the storefront must agree on ids.
- **`baseDefaultConfig(category, settings)`** returns the kit's full default config, for templates you don't customise.
- Pieces of that config: `baseHeaderGroup()`, `baseFooterGroup()`, `baseIndexTemplate(category)`, `baseProductTemplate()`.
- **`categoryPreset(category, overrides)`** is a preset with the category palette and hero. Override `settings`, `templates` and `groups`.

```ts
defaultConfig: (base) => ({
  settings: { ...base.settings, ...MY_SETTINGS },
  groups: { header: myHeader(), footer: base.groups.footer },
  templates: { ...base.templates, index: sectionList([{ type: "my-hero" }, { type: "featured-collection", settings: { heading: "New in" } }]) },
}),
presets: [
  categoryPreset("fashion", { settings: FASHION, templates: { index: fashionIndex() } }),
  categoryPreset("beauty", { settings: BEAUTY, templates: { index: beautyIndex() } }),
],
```

## Sections

### Writing a section

```tsx
import { defineSection } from "@pai/theme-sdk";
import { Section, SectionHeading, ProductGrid, loadSectionProducts, productSourceFields, schemeField, paddingField, headingFields } from "@pai/theme-kit";

export const newArrivals = defineSection({
  schema: {
    type: "new-arrivals",               // unique within the theme
    name: "New arrivals",
    category: "products",               // header|footer|hero|products|collections|content|media|social-proof|marketing|template
    icon: "sparkles",                   // lucide icon name (customizer sidebar)
    settings: [...headingFields({ heading: "New in" }), ...productSourceFields({ source: "newest", limit: 8 }), schemeField(), paddingField()],
    blocks: [],                         // optional BlockSchema[] (+ maxBlocks)
    presets: [{ name: "New arrivals" }],// required for the section to be addable in the customizer
  },
  component: async ({ settings: s, blocks, context }) => {
    const { products } = await loadSectionProducts(context, s);
    return (
      <Section settings={s}>
        <SectionHeading title={String(s.heading)} />
        <ProductGrid products={products} context={context} />
      </Section>
    );
  },
});
```

- **`<Section settings={s}>`** applies `color_scheme` (`default|muted|inverse|primary|accent`) and `padding` (`none|small|medium|large`), plus the container. Using `schemeField()` and `paddingField()` gives merchants those controls.
- **Empty states:** when `context.isPreview` is true, show placeholders or sample data instead of rendering nothing. `SAMPLE_PRODUCTS`, `SAMPLE_COLLECTIONS`, `SAMPLE_POSTS` and `<PreviewNotice>` help here. On the live store, render `null` or an `EmptyState`.
- **Template sections** such as `main-product`, `main-collection` and `main-cart` use `templates: [...]` and `limit: 1`. Header and footer sections use `group: "header" | "footer"`.

### Overriding and extending base sections

- **Replace a base section:** add a section with the same `type` to `sections`, as Aurora does with `header`.
- **Keep the schema, change the look:**
  ```ts
  overrideSections: { "hero-banner": (base) => ({ ...base, component: MyHero }) }
  ```
- **Add blocks to the product page without copying the kit renderer:** use `extendMainProduct`. Custom block components receive `{ block, product, context }` and render inside the product form, so client children can call `useProductForm()`. A custom block with a base block's type replaces that block. `ProductBlock` is exported so you can fall back to the kit rendering.
  ```ts
  import { extendMainProduct, type ProductBlockProps } from "@pai/theme-kit";
  const SizeGuide = ({ block, product }: ProductBlockProps) => /* … */;
  overrideSections: { "main-product": (base) => extendMainProduct([{ schema: sizeGuideSchema, component: SizeGuide }], base) }
  ```

### Base section types

| Group | Types |
| --- | --- |
| Header & footer | `announcement-bar`, `header`, `footer` |
| Hero & media | `hero-banner`, `slideshow`, `image-with-text`, `video`, `countdown`, `image-gallery` |
| Products | `featured-collection`, `product-grid`, `collection-list`, `category-tiles`, `blog-posts` |
| Content | `rich-text`, `multicolumn`, `trust-badges`, `testimonials`, `logo-list`, `newsletter`, `faq`, `contact-form`, `custom-html`, `spacer`, `divider` |
| Templates | `main-product` (with `product-reviews` and `related-products`), `main-collection`, `main-collections-list`, `main-search`, `main-cart`, `main-page`, `main-blog`, `main-article`, `main-account`, `main-404` |

Every base section is exported by name (for example `heroBanner`, `mainProduct`) and via `baseSectionMap`. Helpers include:
- `Logo` and `loadMenu(context, handle, fallback)`;
- `HeroText`, `HERO_HEIGHTS` and `heroPositionClasses`;
- the field builders `schemeField`, `paddingField`, `headingFields`, `buttonFields` (read them with `readButton`), `columnsField`, `mobileColumnsField`, `imageRatioField` and `productSourceFields` (load them with `loadSectionProducts`).

**`main-product` block types:** `vendor`, `title`, `rating`, `price`, `sku`, `variant_picker`, `stock`, `buy_buttons`, `trust`, `description`, `collapsible_tab`, `text` and `share`. Read `sections/templates.tsx` for each block's settings.

## Global settings ids

These come from `baseSettingsSchema`; `BASE_SETTING_IDS` lists them all. Override defaults with `settingsDefaults`, and add your own with `extendSettingsSchema`.

| Group | Ids |
| --- | --- |
| Colours | `color_background`, `color_foreground`, `color_primary`, `color_primary_foreground`, `color_accent`, `color_muted`, `color_border`, `color_sale` |
| Typography | `font_heading`, `font_body` (Google font family names, from `FONT_CHOICES` in the SDK), `heading_scale` (80–130 %), `heading_case` (`normal` \| `uppercase`) |
| Layout | `container_width`, `section_spacing`, `radius`, `button_radius` |
| Logo | `logo_width`, `favicon` |
| Header | `header_style` (`logo_left` \| `logo_center` \| `minimal`), plus the header options in `settings.ts` |
| Product cards | `card_image_ratio`, `card_style`, `card_text_align`, `card_show_vendor`, `card_show_rating`, `card_quick_add`, `card_hover_swap`, `card_show_sale_badge`, `card_show_wishlist` |
| Cart | `cart_type` (`drawer` \| `page`), `cart_show_free_shipping`, `cart_show_note`, `buy_now_direct_checkout` |
| Currency | `currency_display` (`symbol` \| `code` \| `symbol_code`) |
| Social & announcement | `social_facebook`, `social_instagram`, `social_youtube`, `social_tiktok`, `social_x`, `social_whatsapp`, `announcement_text`, `announcement_link` |

Read settings with the tolerant helpers `str(v, fallback)`, `num(v, fallback)`, `bool(v, fallback)` and `list(v)`. Settings values come from merchants, so never trust their types.

## Styling

- **Tailwind 4 utilities, plus the `pai-*` classes from `styles.css`.** The storefront scans `themes/*/src`, so any Tailwind class in your theme works.
- **Theme tokens, as CSS variables set from global settings:**

  | Variable | What it holds |
  | --- | --- |
  | `--pai-bg`, `--pai-fg` | page background and text |
  | `--pai-primary`, `--pai-primary-fg`, `--pai-accent` | primary colour, text on primary, accent |
  | `--pai-muted`, `--pai-border`, `--pai-sale`, `--pai-card` | muted surfaces, borders, sale colour, card background |
  | `--pai-font-heading`, `--pai-font-body` | the two font families |
  | `--pai-radius`, `--pai-button-radius` | corner radii |
  | `--pai-container`, `--pai-section-spacing` | page width and section spacing |
  | `--pai-heading-scale`, `--pai-heading-transform`, `--pai-logo-width` | heading size, heading case, logo width |
- **Tailwind aliases for those tokens:** `bg-pai-bg`, `text-pai-fg`, `bg-pai-primary`, `text-pai-primary-fg`, `border-pai-border`, `bg-pai-muted`, `text-pai-sale`, `bg-pai-card`, `rounded-pai`, `rounded-pai-btn`, `font-heading` and `font-body`. Opacity modifiers work, for example `text-pai-fg/70`.
- **Use tokens, not hard-coded colours**, so the customizer's colour settings and presets keep working.
- **Component classes:**
  - layout: `pai-container`, `pai-section` and `pai-section-tight`;
  - headings: `pai-h1` to `pai-h4` and `pai-eyebrow`;
  - buttons: `pai-btn` plus `-primary|-secondary|-outline|-ghost|-link|-accent|-light`, `-sm|-lg` and `-block`;
  - forms: `pai-input` and `pai-label`;
  - other: `pai-card`, `pai-rte` (rich text), `pai-img-cover`, `pai-skeleton`, `pai-line-clamp-2/3`, and `pai-no-scrollbar`, `pai-snap-x` and `pai-snap-start` for carousels.
- **Colour schemes:** `pai-scheme-muted|inverse|primary|accent` restyle a block and its children. `<Section>` applies them from the `color_scheme` setting.
- **Theme-specific class names** should use a prefix, as Aurora does with `aurora-*`, and be styled in the theme `css`.

## Components (`@pai/theme-kit`, server-safe)

| Kind | Exports |
| --- | --- |
| Links | `Link` (Next.js), `SmartLink`, `resolveHref` |
| Layout | `Container`, `Section`, `SectionHeading` |
| Buttons & media | `Button`, `ButtonLink`, `Image`, `Placeholder` |
| Pricing & ratings | `Price`, `moneyOf(context)`, `Rating`, `Badge` |
| Content | `RichText`, `EmptyState`, `Breadcrumbs`, `Pagination`, `withQuery` |
| Icons | `Icon` / `resolveIcon` (lucide name to icon), `ICON_OPTIONS` (the select options for icon settings), `SocialLinks`, `SocialIcon`, `getSocialLinks`, `PaymentIcons` |
| Cards | `ProductCard`, `ProductGrid`, `ProductList`, `CollectionCard`, `ArticleCard`, `cardOptions(context, overrides)` (reads the `card_*` settings) |

**Utilities:**
- general: `cn`, `str`, `num`, `bool` and `list`;
- money: `formatMoney(minor, currency, display)` and `discountPercent`;
- text: `sanitizeHtml`, `stripHtml` and `truncate`;
- class helpers: `aspectClass`, `gridColsClass` and `textAlignClass`;
- media: `isVideoFile` and `embedUrl`;
- colour: `kitCssVariables`, `schemeClass`, `luminance` and `readableOn`;
- listings: `listingQuery` and `DEFAULT_PAGE_SIZE`;
- account and store data: `getAccountData(context)` and `getStoreUrl(context)`;
- samples: `SAMPLE_*`, `STOCK_IMAGES` and `CATEGORY_HERO` (verified images).

Money is always an integer in **minor units**. Format it with `context.formatMoney(n)`, or `useStorefront().format(n)` on the client.

## Client components (`@pai/theme-kit/client`)

All client components talk to the storefront API through the tenant base path and work in every hosting mode.

| Area | Exports |
| --- | --- |
| Context | `useStorefront()` returns `{ base, url(), api(), format(), currency, customer, isPreview, cartType, … }`. Also `useMoney`, `trackEvent` (pixel events) and `joinUrl` |
| Navigation | `Link`, `usePathname`, `useRouter`, `useSearchParams` |
| Cart | `useCart()` returns `{ cart, add, update, remove, applyDiscount, openDrawer, … }`. Components: `CartButton`, `CartCount`, `CartDrawer` (the storefront mounts it), `CartPageView`, `CartLineItem`, `CartTotals`, `DiscountForm`, `FreeShippingBar` |
| Product | `ProductProvider` and `useProductForm()`; `ProductPrice`, `VariantPicker`, `StockIndicator`, `QuantitySelector`; `AddToCartButton`, `BuyNowButton`; `ProductGallery`, `StickyAddToCart`, `TrackProductView`; `QuickView`, `QuickAddButton` |
| Search | `SearchBox` (predictive), `SearchToggle` |
| Header | `HeaderShell` (sticky/transparent via `data-scrolled` and `data-transparent`), `MobileMenu`, `MenuDropdown` (hover with close delay, click, Escape, focus-out), `AccountLink` |
| Widgets | `Accordion`, `Tabs`, `Carousel`, `Slideshow`, `Countdown`, `NewsletterForm`, `WishlistButton` / `useWishlist`, `ShareButtons`, `VideoPlayer` |
| Forms | `SortSelect`, `CollectionFilters`, `FilterDrawerButton`, `ContactForm`, `LoginForm`, `RegisterForm` |
| Feedback | `useToast()` |

The storefront mounts `StorefrontProvider`, `ToastProvider`, `CartProvider` and `CartDrawer` on every page. Themes never mount them.

## Aurora: reference structure

```
themes/aurora/
  package.json            name @pai-theme/aurora; exports "." and "./manifest"
  src/manifest.ts         ThemeManifest (slug must equal the DB themes.slug)
  src/index.ts            createBaseTheme({ sections, overrideSections, settingsDefaults, css, defaultConfig, presets })
  src/config.ts           palettes (FASHION_SETTINGS …), header/footer groups, index/product templates via sectionList
  src/images.ts           every image URL in one place (verified Unsplash)
  src/sections/*.tsx      aurora-hero, lookbook, editorial-collection, split-banner, size-guide,
                          header (replaces the kit header, mega menu), main-product (extendMainProduct + size_guide block)
  src/client/*.tsx        small "use client" pieces (mega-menu, size-guide-dialog)
```

Start a new theme with `pnpm theme:new`, or copy this layout. Keep `index.ts` declarative, put the configs in `config.ts` and give each section its own file.
