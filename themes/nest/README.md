# Nest — home & furniture theme

Warm, spacious and calm, in the style of a premium furniture retailer: linen and walnut palettes, Lora + Manrope
typography, big landscape imagery, thin rules and plenty of whitespace. Sections are built for furniture, decor and
handicraft stores: shop a whole room from one photograph, browse by room from a mega menu, explain materials and
care, show dimensions and 0% EMI on every product, and promise white-glove delivery and assembly.

- **Categories / presets:** `home` (default), `handicraft`, `general`
- **Price:** ৳3,500
- **Built on:** `@pai/theme-kit` (`createBaseTheme`). Every kit section stays available in the customizer.

## Structure

```
src/manifest.ts          Theme Store listing
src/images.ts            Every default image (verified Unsplash, checked by eye)
src/settings.ts          Palettes (HOME / HANDICRAFT / GENERAL), the "Nest style" settings group, CSS variable mapper
src/config.ts            Header/footer groups (with room blocks), home pages per preset, every other template
src/presets.ts           Home & Furniture · Handicrafts & Artisan Decor · Home & Lifestyle Store
src/index.ts             createBaseTheme(...) + theme CSS (type, buttons, header, cards, footer)
src/sections/            header.tsx (utility bar + header), footer.tsx, hero.tsx, shop-the-room.tsx, room-tiles.tsx,
                         materials.tsx, editorial-split.tsx, delivery-promise.tsx, emi-banner.tsx, main-product.tsx,
                         _nest.tsx (shared helpers)
src/client/              mega-menu.tsx (room mega menu), emi.tsx (EMI calculator + product EMI line), add-all.tsx
```

## Header, footer & cards

| Piece | What's different |
| --- | --- |
| **Utility bar** (`announcement-bar`) | Slim espresso bar: showroom link on the left, up to 4 service messages separated by thin rules, store phone and "Track order" on the right. |
| **Header** (`header`) | Search bar · centred logo · icons, with the menu on its own row under a thin rule (or logo-left inline layout). **Room mega menu:** add `room` blocks (title, image, collection, link, sub-links as `Label \| /url` lines) and a "Shop by room" trigger opens a full-width panel of landscape room cards with live piece counts from the collection and sub-links. Menu items that have sub-items also open a full-width panel (link columns + matching room cards). Hover with delay, click/Enter toggles, **Escape** closes and returns focus, focus-out / scroll / link click closes, `aria-expanded` + `aria-controls`. Mobile uses the kit `MobileMenu` with a room thumbnail grid in its footer. |
| **Footer** (`footer`) | Inverse (espresso) by default. Blocks: `promise` (delivery & assembly strip, up to 4), `showroom` (image, address — defaults to the store address — opening hours, phone, directions link), `link_list`, `text`, `newsletter` (with social icons). Bottom bar with store name, copyright and payment icons. |
| **Product cards** | Landscape 4:3 images in 3-column grids, serif titles, slow image zoom, a thin rule and a configurable service note under the price (`nest_card_note`, e.g. "Free delivery & assembly in Dhaka"), optional framed style. Applies to every kit listing. |

## Signature sections

| Type | Name | Highlights |
| --- | --- | --- |
| `nest-hero` | Nest hero | Full-width room photo with an overlapping caption card and numbered highlights, or a 40/60 split (either side). Optional "In the picture" product chip. One `h1`. |
| `shop-the-room` | Shop the room | Room photo with numbered hotspots (native `<details>`, keyboard accessible, one open at a time), list of pieces with notes, room total and **Add the room to cart**. Side / reversed / stacked layouts. Empty spots fill from a collection, then newest products; sample products + notice in the customizer. |
| `room-tiles` | Shop by room | Up to 8 `room` blocks (collection, title, short line, image, link) as a mosaic (first room large), grid or scrolling row. Live product counts from `getCollection`; images fall back to the collection image. With no blocks it lists the store's collections. |
| `materials` | Materials & craftsmanship | Workshop image + story beside `material` blocks (round swatch, name, origin/finish, description, **care notes** disclosure), or a swatch-card grid. |
| `editorial-split` | Editorial split | Big edge-to-edge image beside a rich-text story, `fact` rows (label/value), CTA, optional inset detail image; image left or right. |
| `delivery-promise` | Delivery & assembly promise | Numbered steps joined by a thin line, or bordered icon columns (`step` blocks: icon, title, text), plus a delivery-charges note with link. |
| `emi-banner` | Financing / EMI banner | "0% EMI for up to 12 months" with an accessible tenure calculator (radio group, arrow keys) computing the monthly instalment from a chosen product's price (falls back to the best seller) or a set amount; "from ৳X/month" badge; `bank` text blocks for partner banks; footnote. |

## Product page blocks (`main-product` via `extendMainProduct`)

- `emi` — "Or ৳5,375/month for 12 months at 0% EMI", computed from the **selected variant's price × quantity** on the client; hidden below the minimum EMI amount (`emi_min_price`). Text supports `{amount}` and `{months}`.
- `dimensions` — W × D × H table with a small line drawing. Sizes come from a product tag `dims:210x95x85` (plus `seat:45`, `weight:62kg`), else from the block settings, else from a "213 × 88 × 84 cm" line in the description. Extra rows as `Label | value` lines. Hidden when a product has no sizes (configurable).
- `delivery_estimate` — delivery date window inside Dhaka / other districts (configurable day ranges) and an assembly line.

## Global settings

Standard kit settings with Nest defaults (landscape cards, 1440px container, 88px section spacing, 4px radius,
2px buttons) plus a **Nest style** group:

| Id | Purpose |
| --- | --- |
| `color_card` | Card / panel background |
| `nest_card_frame` | `plain` (image on page + thin rule) · `framed` (soft card with border) |
| `nest_card_note` | Small line under the price on every product card (empty = hidden) |
| `nest_image_zoom` | Slow zoom on image hover |
| `emi_months` | Default EMI tenure (product EMI block, banner fallback) |
| `emi_min_price` | Minimum price (৳) before EMI is shown |

`nestCssVariables` wraps `kitCssVariables` and adds `--nest-card-note`, `--nest-card-note-display`, `--nest-card-pad`,
`--nest-card-border`, `--nest-card-surface` and `--nest-zoom`.

## Presets

| Id | Palette & type | Home page |
| --- | --- | --- |
| `home` | Linen `#f6f1ea`, espresso `#2e2520`, terracotta `#b4613d` · Lora / Manrope | Hero with caption card, shop by room mosaic, new in, shop the room, materials, living room favourites, EMI banner, bedroom editorial, delivery promise, decor, journal |
| `handicraft` | Oat, olive `#4a4a2c`, clay `#a8552d` · Marcellus / Work Sans | Split pottery hero, craft perks, crafts grid, new this month, four crafts materials grid, meet the makers, jute corner, careful delivery, stories |
| `general` | Chalk, charcoal `#23221f`, olive `#6b7349` · Playfair Display / Manrope, framed cards | Calm hero, COD perks, departments row, bestsellers, get the look (stacked), EMI by amount, new arrivals, editorial, why shop with us, journal |

## Demo data

The default config uses the seeded furniture catalogue (`nest-demo`): collections `living-room`, `bedroom`, `dining`,
`lighting`, `decor`, `home-office` and products such as `tufted-fabric-sofa-grey`, `velvet-3-seater-sofa-emerald`,
`scandi-pendant-light`, `hand-knotted-area-rug-5-8-ft`, `minimal-ceramic-vase`. Every section falls back gracefully when
a slug is missing (collection → newest / best seller, or the store's own collections), and header sub-links use
search URLs, so the defaults also work for new stores.

## Checks

```
npx tsc --noEmit -p themes/nest
node tools/create-theme/validate.mjs nest
node tools/verify-images.mjs themes/nest
```
