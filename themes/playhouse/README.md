# Playhouse

A playful, colourful PaiCommerce theme for **kids, toys, baby and pet** stores — rounded "toy box" cards, wavy edges, blob shapes, gentle wiggles and a bright palette on a warm off-white. Built on `@pai/theme-kit`.

- **Categories / presets:** `kids` (default), `pets`, `gifts`
- **Fonts:** Fredoka or Baloo 2 headings, Nunito or Quicksand body
- **Demo store:** `playhouse-demo` (Playhouse Kids & Pets, Uttara, Dhaka)

## What's included

| Piece | File | Notes |
| --- | --- | --- |
| Header | `src/sections/header.tsx` | Floating rounded bar: rainbow wordmark (or logo), big search, wishlist panel, account, cart. Second row with a **"Shop by age"** dropdown and colourful menu pills. Phones get a swipeable age-chip row and the age chips inside the drawer. |
| Announcement strip | `src/sections/header.tsx` (`playhouseAnnouncement`) | Kit schema, Playhouse look — marquee with coloured sparkles. |
| Footer | `src/sections/footer.tsx` | Wavy top edge, "Join the Playhouse club" newsletter card, trust badges, colourful menu columns with squiggle underlines, contact (address JSON rendered safely), social, payment icons, "Powered by PaiCommerce". |
| Product card | `src/sections/card.tsx` | Rotating soft colour backdrop, sticker badges (**New!**, **−20%**, **Bestseller**, sold out), **age badge** (e.g. "3+ yrs", "2–7 yrs", "0–12m", "Newborn"), rating stars, colour swatches and a pill quick-add (opens Quick view for products with options). Used by every listing through `listingOverrides`. |
| Listings | `src/sections/listings.tsx` + `collection-chips.tsx` | Kit listing sections re-rendered with the Playhouse card; collection pages get colourful category chips above the grid. |
| Product page | `src/sections/main-product.tsx` | Kit `main-product` + `age_safety` block (recommended age + safety chips) and `gift_note` block. |
| Client islands | `src/client/*` | `quick-add`, `popover` (Shop by age dropdown), `wishlist-panel`, `gift-finder`. |

## Signature sections

| Section (type) | Settings | Blocks |
| --- | --- | --- |
| **Playful hero** (`playhouse-hero`) | eyebrow, heading, highlighted words (squiggle), subheading, 2 buttons, main + bubble image (with alt text), image side, background & highlight colour, sticker, shapes, wavy edge | `chip` (icon, text) ×4 |
| **Shop by age** (`shop-by-age`) | heading fields, style (emoji tiles / photo tiles / round stickers), small tile label, background | `age` (label, caption, emoji, image, colour, collection or link) ×8 |
| **Category bubbles** (`category-bubbles`) | heading fields, fallback count, product count, bubble size, background | `bubble` (collection, title, image, ring colour) ×12 — with no blocks it shows the store's collections |
| **Gift finder** (`gift-finder`) | heading fields, start with (kid/baby/pet), label + collection per answer, include pets, budget steps (৳), show products, products shown, background | — |
| **Bundle deals** (`bundle-deals`) | heading fields, button label, background | `bundle` (title, image, items one per line, bundle price, separate price, badge, product picker, link, colour) ×4 |
| **Parent testimonials** (`parent-testimonials`) | heading fields, rating summary, grid/carousel, background | `review` (quote, name, location, photo, child/pet line, product picker or product name, rating) ×12 |
| **Pet corner** (`pet-corner`) | eyebrow, heading, text, button, image (+alt), image side, panel colour, paw prints, collection, product count, grid/carousel | `perk` (icon, text) ×4 |

All sections render placeholders/sample data in the customizer preview and fall back gracefully on the live store (missing collection → best sellers / pet-tagged products; nothing at all → hidden).

## Global settings ("Playhouse" group)

- **Playful colours:** Sunshine, Bubblegum, Sky, Grape, Mint (`color_fun_1…5` → CSS `--ph-c1…5`) and card background (`color_card`).
- **Personality:** playful motion (wiggles & floating shapes — always off for `prefers-reduced-motion`), wavy section edges, product image backdrop (rotating colours / muted / none), age badges on cards, bestseller tag (default `bestseller`), "New!" badge window in days.
- All kit settings still apply (colours, fonts, radius, card options, cart type …).

Colour selects in sections accept `sunshine | bubblegum | sky | grape | mint | primary | accent`, so presets and merchants can recolour everything from the global palette.

## Presets

| Preset | Palette | Home page |
| --- | --- | --- |
| `kids` (default) | Grape primary, coral accent, sunshine/bubblegum/sky/grape/mint on `#fff9f0`; Fredoka + Nunito | Hero → trust strip → shop by age → category bubbles → new arrivals carousel → bundle deals → best sellers → gift finder → pet corner → parent testimonials → FAQ |
| `pets` | Tangerine + teal on cream; Baloo 2 + Nunito; "Shop by pet" header menu | Pet hero → shop by pet tiles → pet corner (dogs) → pet-supplies bestsellers → starter-kit bundles → treat finder (starts on pets) → pet-parent reviews → category bubbles → FAQ |
| `gifts` | Raspberry + gold with candy pastels on blush; Fredoka + Quicksand | Gift hero → gift finder → gifts by age stickers → gift boxes → birthday bestsellers → gifting perks → category bubbles → reviews → FAQ |

Each preset also ships its own announcement messages, header age/pet groups, footer club copy and trust badges.

## Customisation tips

- **Age badges** are read from product tags (`age-3+`, `3-5y`, `ages:0-12m`, `newborn`), the title (`… (3+ yrs)`) or `Age` / `Size` option values like `2–3Y`, `0–3M`. Tag products consistently to get the best badges and gift-finder matches.
- Add the tag set in **Bestseller tag** to any product to show the "Bestseller" sticker (products with 25+ reviews averaging 4.6+ get it automatically).
- The header's "Shop by age" groups are header blocks — point them at collections or searches (`/search?q=montessori`).
- The wishlist panel lists saved items from the store's 48 best sellers; other saved items are counted.
- Images live in `src/images.ts`; run `node tools/verify-images.mjs themes/playhouse` after changing them.

## Develop

```bash
npx tsc --noEmit -p themes/playhouse
node tools/create-theme/validate.mjs playhouse
node tools/verify-images.mjs themes/playhouse
```
