# Volt — electronics & gadgets theme

A dark, high-contrast storefront for tech retailers. Volt is search-first, spec-focused and built to make products glow. It's built on `@pai/theme-kit`, so every kit section, template and commerce component (cart drawer, quick add, predictive search, sticky add to cart) works out of the box.

| | |
|---|---|
| Slug | `volt` |
| Categories | Electronics (primary), Automotive, General |
| Price | ৳3,900 |
| Fonts | Space Grotesk (headings) · Inter (body) |

## Presets

| Preset | Category | Look |
|---|---|---|
| **Electronics — Midnight** (default) | `electronics` | Near-black `#07090d`, volt-lime primary `#c6ff3d`, cyan accent. Launch hero, flash deals, spec comparison, brand marquee. |
| **Automotive — Garage** | `automotive` | Graphite, racing red and amber, uppercase Archivo headings, landscape cards. Parts, oils and car-care copy with a fitment promise. |
| **Tech store — Daylight** | `general` | Light `#f6f7fb` with an electric-blue primary. The same layouts in a light scheme. |

## Signature sections

| Type | Name | What it does |
|---|---|---|
| `header` | Header (replaces kit) | Utility bar (warranty promise, track order, hotline) → logo, large predictive search with trending searches, account and cart → category bar with **All categories** mega menu (collection tiles with counts and a promo card), menu items with mega panels, and a highlighted **Flash deals** link. |
| `footer` | Footer (replaces kit) | Glowing newsletter band, service-promise row (blocks), link columns, contact, payment icons. |
| `volt-hero` | Launch hero | Glowing product stage with badge, spec chips, the live "starting at" price of a picked product and two CTAs, plus up to 3 promo tiles (blocks). |
| `flash-deals` | Flash deals | Countdown that resets at Dhaka midnight (or ends on a date), with a carousel or grid of deals showing "claimed" meters. Source: on sale, a collection, best sellers, or hand-picked products. |
| `spec-compare` | Spec comparison | A 2–4 column comparison table. Each block is a product plus "Label: value" spec lines. Rows line up by label, `yes`/`no` show tick marks, and one column can be highlighted with a badge. The table is semantic (`<table>`, scoped headers, caption) and has a sticky label column on mobile. |
| `spec-highlight` | Tech specs highlight | A large product shot with up to 6 big-number spec tiles (icon, value, label), the live price and a buy button. |
| `brand-carousel` | Brand carousel | A marquee or grid of brand logos, or wordmarks when no logo is uploaded. Each brand links to a search for its name by default. Pauses on hover and respects reduced motion. |
| `bento-grid` | Bento feature grid | Up to 8 tiles in 4 sizes (1×1, 2×1, 1×2, 2×2) and 3 styles: image, glowing big-number stat, icon feature. |
| `product-tabs` | Product tabs | Tabbed product grids, one tab per collection. A missing or empty collection falls back to best sellers, newest or top rated, so a tab is never empty. |
| `main-product` | Product page | The kit's main product plus an **assurance** block (warranty, replacement, payment promises). |

Volt's own **spec card** (`components/card.tsx`) shows a vendor label, a glowing media well, the savings amount, stock status and a one-tap add button. The kit's product cards on collection, search and related-product pages get the same look through the scoped theme CSS.

## Templates

Every template has a default: `index` (12 sections), `product` (assurance block, reviews, "frequently bought together" carousel, brands), `collection` (sidebar filters), `collections` (+ brands), `search` (+ best sellers), `cart` (+ deals), `page`, `blog`, `article` (+ products), `account`, `404` (+ best sellers).

Default content targets the seeded `volt-demo` store's collections: `smartphones`, `laptops-tablets`, `audio`, `wearables`, `gaming` and `cameras-drones`. Every product source falls back gracefully when a collection or product is missing.

## Settings

Volt uses the kit's standard settings (colours, typography, layout, cards, cart, currency, social, announcement) with tuned defaults, plus one extra setting:

- `color_card`: the background for cards and panels (Colors group).

## Notes

- All links go through `context.url()` / `resolveHref()`, so the theme works on subdomains, custom domains, `/s/{slug}` and the customizer preview.
- Every default image is a verified Unsplash photo: `node tools/verify-images.mjs themes/volt`.
- Validate: `node tools/create-theme/validate.mjs volt` · Typecheck: `npx tsc --noEmit -p themes/volt`.
