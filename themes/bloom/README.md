# Bloom — beauty & cosmetics theme

Soft, elegant and conversion-minded: blush palettes, Fraunces + DM Sans typography, pillowy soft-shadow cards and a set of
beauty-specific sections for skincare, makeup, fragrance and wellness brands.

- **Categories / presets:** `beauty` (default), `health`, `gifts`
- **Price:** ৳2,900
- **Built on:** `@pai/theme-kit` (`createBaseTheme`) — every kit section stays available in the customizer.

## Structure

```
src/manifest.ts          Theme Store listing
src/images.ts            Every default image (verified Unsplash)
src/settings.ts          Palettes (BEAUTY / WELLNESS / GIFTS), the "Bloom style" settings group, CSS variable mapper
src/config.ts            Header/footer groups, home pages per preset, every other template
src/presets.ts           Beauty & Cosmetics · Wellness & Self-care · Beauty Gifts
src/index.ts             createBaseTheme(...) + theme CSS (cards, header, footer)
src/sections/            header.tsx (announcement + header), footer.tsx, hero.tsx, ingredients.tsx, before-after.tsx,
                         routine-builder.tsx, reviews-wall.tsx, shop-the-look.tsx, social-gallery.tsx, main-product.tsx
src/client/              rotator.tsx, compare-slider.tsx, routine-tabs.tsx, add-all.tsx (small "use client" islands)
```

## Header, footer & cards

| Piece | What's different |
| --- | --- |
| **Announcement bar** (`announcement-bar`) | Pastel background colour setting (auto-contrast text), messages rotate one at a time with prev/next buttons (pauses on hover/focus and for reduced motion), side text + social icons on desktop. |
| **Header** (`header`) | Airy centred logo (store name in italic serif when no logo), pill search with predictive results, small-caps spaced menu with dot indicator, kit dropdowns restyled, frosted-glass sticky state. Alternative inline layout. |
| **Footer** (`footer`) | Floating "club" newsletter card with optional image, soft link columns, contact with opening hours, oversized italic wordmark of the store name. Blocks: `newsletter`, `brand`, `link_list`, `text`, `contact`. |
| **Product cards** | White "pillow" cards with soft shadow (Soft glow / Floating / None), serif titles, rounded quick-add. Applies to every kit listing (collections, search, related, featured). |

## Signature sections

| Type | Name | Highlights |
| --- | --- | --- |
| `bloom-hero` | Bloom hero | Arched portrait (left or right) or full-bleed; small round secondary image; floating rating badge; `*word*` italic accent headline; 2 buttons. |
| `ingredient-highlights` | Ingredient highlights | Up to 8 `ingredient` blocks (image, name, concentration/source, benefit) orbiting a round product image, or a cards grid. |
| `before-after` | Before / after | Accessible drag slider (native range input, keyboard + touch), labels, up to 4 `stat` blocks, optional featured product card, footnote. “Dull” before-treatment is for illustrative demos only. |
| `routine-builder` | Routine builder | Up to 6 `concern` tiles (accessible tablist). Each builds a numbered routine from picked products → collection → tag → best sellers, with routine total and **Add routine to bag**. |
| `reviews-wall` | Reviews wall | Masonry of curated `review` blocks (photo, skin type, verified, linked product) plus optional live reviews of a chosen product; average-rating pill. |
| `shop-the-look` | Shop the look | Editorial image with numbered hotspots, step list with notes, full-look total and **Add the look to bag**; empty spots auto-fill with newest products. |
| `social-gallery` | Instagram gallery | Mosaic / grid / strip; posts can tag a product (“Shop it” overlay); follow button uses the store's Instagram link. |

Product page (`main-product` via `extendMainProduct`) adds two blocks:
- `skin_profile` — “Best for” chips (also derived from product tags like `oily`, `dry`, `sensitive`), key-ingredient pills, free-from badges.
- `how_to_use` — numbered application steps.

## Global settings

Standard kit settings (colours, fonts, layout, cards, cart …) with Bloom defaults, plus a **Bloom style** group:

| Id | Purpose |
| --- | --- |
| `color_card` | Card / panel background |
| `bloom_card_shadow` | `soft` · `float` (lifts on hover) · `none` |
| `bloom_italic_accent` | Render `*word*` in Bloom headings as italic accent-coloured text |
| `bloom_blobs` | Blurred pastel shapes behind hero/feature sections |

## Presets

| Id | Palette & type | Home page |
| --- | --- | --- |
| `beauty` | Blush `#fffaf8`, cocoa `#3b2a2f`, rose `#d9788f` · Fraunces / DM Sans | Arched hero, trust strip, category circles, bestsellers carousel, routine builder, ingredients, before/after, shop the look, new arrivals, reviews wall, Instagram, journal |
| `health` | Cream, forest `#2f4a3f`, sage · Fraunces / Manrope | Wellness hero, trust strip, needs, daily-ritual routine builder (by tag), botanicals grid, bestsellers, reviews, FAQ, gallery |
| `gifts` | Lilac, plum `#5b3b73`, peony · DM Serif Display / DM Sans | Full-bleed gift hero, gift perks, gift sets, categories, build-a-box look, gift-wrap story, little luxuries, reviews, gallery |

## Demo data

The default config uses the seeded beauty catalogue (`bloom-demo`): collections `skincare`, `makeup`, `fragrance`, `hair-body`,
`gift-sets` and product slugs such as `vitamin-c-brightening-serum-30-ml`. Every section falls back gracefully when a slug is
missing, so the defaults also work for new stores.

## Checks

```
npx tsc --noEmit -p themes/bloom
node tools/create-theme/validate.mjs bloom
node tools/verify-images.mjs themes/bloom
```
