# Bazaar — marketplace theme

A dense, high-conversion multi-category storefront in the style of large marketplaces: grey page with white panels, a big search bar with a category picker, a category-sidebar hero, flash sales with countdowns, dense product rails, top brands and an endless "Just for you" feed. It's built on `@pai/theme-kit`.

- **Slug:** `bazaar`
- **Categories:** general, electronics, grocery, fashion
- **Price:** free
- **Demo store:** `bazaar-demo`

## Structure

```
src/manifest.ts          Theme Store listing
src/images.ts            every default image (verified Unsplash URLs)
src/config.ts            palettes, header/footer groups, index templates per preset, all other templates
src/index.ts             createBaseTheme(): sections, overrides, extra settings, presets, scoped CSS
src/components/card.tsx  BazaarCard (dense marketplace card) + deterministic sold % helper
src/components/shared.tsx loadProducts (collection → fallback sort → samples), BzSection, BzHead, fields
src/client/*.tsx         mega-menu, search-bar (category select + SearchBox + button), header-actions
                         (account / cart entries), load-more (Just for you), copy-code (voucher)
src/sections/*.tsx       one file per section
```

## Sections

| Type | Name | What it does |
| --- | --- | --- |
| `header` *(replaces kit)* | Header | Has three rows. The top bar holds a promo text and the Sell with us, Help, Track order, app and language links, plus the store hotline. The main row holds the logo, a **big search** (category select, predictive `SearchBox` and search button, with popular searches below), "Hello, sign in", and the cart with its live count and subtotal. The category bar holds an **All categories** dropdown (collections with images plus a promo card), quick links from a menu, a note, and a highlighted **Flash sale** link. Two colour styles: *classic* (white header with a primary bar) and *bold* (primary header with a dark bar). On mobile you get a hamburger (kit `MobileMenu`), the logo, account, cart and a full-width search. |
| `footer` *(replaces kit)* | Footer | Promise strip, a dark footer with an about text, app-download buttons (text only), social links, and menu, custom-link and contact columns, plus payment methods, trust badges, a copyright bar and a delivery note. Blocks: `promise`, `link_list`, `links` (`Label \| /url` lines), `contact`, `app`, `payments`. |
| `bazaar-hero` | Marketplace hero | Category sidebar from collections (with images) or from a menu. A slideshow of `slide` blocks built on the kit `Slideshow`, and two `promo` banners. The sidebar is hidden on mobile. |
| `bazaar-flash-sale` | Flash sale | A "Flash Sale · On sale now · Ending in HH:MM:SS" bar with a daily timer (Dhaka midnight), a date timer or no timer, followed by a rail or 6-column grid of deal cards. The **sold meters** are deterministic, with no `Math.random`. Uses the `flash-sale` collection and falls back to on-sale products, then best sellers. |
| `bazaar-product-rail` | Product rail | Heading with a tagline and "See more", then 12 compact cards in a carousel or grid with 5 or 6 per row, plus an optional tall side banner. Uses the collection and falls back to a sort. |
| `bazaar-top-brands` | Top brands | `brand` blocks with an image, a logo or monogram, a name and an offer line. Links to a search for the brand by default. |
| `bazaar-just-for-you` | Just for you | Server-renders up to 60 products. A client "Load more" button (or infinite scroll) reveals them in steps, then links to `/collections/all`. |
| `bazaar-category-icons` | Category icons | 8–16 round (or square) category icons from `category` blocks. With no blocks it shows the store's collections. |
| `bazaar-promo-banners` | Promo banners | A row of 2–4 image banners. |
| `bazaar-trust-bar` | Trust bar | A compact strip of promises such as COD, delivery, returns and genuine products. |
| `main-product` *(extended)* | Product information | Every kit block, plus **`voucher`** (store voucher with a copy-code button) and **`seller`** (a "Sold by" card with a verified badge). |
| `related-products` *(re-rendered)* | Related products | Keeps the kit schema but renders as a Bazaar rail. |

The kit's collection, search and cart listings use `ProductCard`. Theme CSS restyles it to match `BazaarCard`: white card, square image, small two-line title, bold primary price and tight grid gaps.

## Product card

`BazaarCard` shows the following:

- square image with a −% ribbon;
- a wishlist button (hover on desktop, hidden on phones) and a one-tap quick add (`QuickAddButton`, which opens quick view for products with variants);
- a two-line 13px title;
- the price in bold in the primary colour, with the strike price and −%;
- ★ rating with its count;
- the **Free delivery** and **COD** micro-chips.

The `deal` variant, used in the flash sale, swaps the rating and chips for a sold meter.

## Presets

| Preset id | Name | Look |
| --- | --- | --- |
| `general` *(default)* | Marketplace — Orange | `#f4f5f7` page, white cards, orange `#f5600a`, yellow accent, red sale. Rubik + Inter, 8px radius, 28px section spacing. Classic header. The home page has 12 sections across every category. |
| `grocery` | Grocery — Fresh market | Green `#10913f`, Plus Jakarta Sans, a 60-minute delivery promise, aisle icons, "Fresh Deals" and basket-friendly rails. The free-delivery chip starts at ৳499. |
| `electronics` | Electronics — Tech mall | Electric blue `#1d5bf0` with the **bold** header, "Lightning Deals", official brand stores, EMI and warranty promises, and New arrivals / Top rated rails. |

Every preset ships `settings`, an `index` template and `header` / `footer` groups. Every template has a default config: index, product, collection, collections, search, cart, page, blog, article, account and 404.

## Settings added to the kit schema

- `color_card` (Colors): card and panel background.
- `card_free_delivery_over` (৳, 0 hides it), `card_free_label`, `card_show_cod`, `card_cod_label` (Product cards): the marketplace chips.

Bazaar also reads these base card settings: `card_show_rating`, `card_show_sale_badge`, `card_quick_add` and `card_show_wishlist`.

## Notes

- Demo collections: `flash-sale`, `electronics`, `fashion`, `home-living`, `groceries` and `beauty-health`. Every product section falls back to `getProducts({ sort })` when a collection is missing or empty, and to sample products in the customizer.
- The search category select navigates straight to the chosen collection. The search button submits the kit `SearchBox` form with `requestSubmit()`, or opens the chosen category when the query is empty.
- Accessibility:
  - visible focus rings, in the accent colour on coloured bars;
  - labelled landmarks such as `nav` "Store links", "Quick links" and "Categories";
  - `aria-expanded` menus that close on Escape;
  - alt text settings on every banner;
  - rating and sold-meter labels;
  - "Load more" moves focus to the first revealed card;
  - `prefers-reduced-motion` respected.
- Verify with:
  - `npx tsc --noEmit -p themes/bazaar`
  - `node tools/create-theme/validate.mjs bazaar`
  - `node tools/verify-images.mjs themes/bazaar`
