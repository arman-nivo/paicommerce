# Artisan — handicrafts & art theme

Earthy and story-driven: unbleached-paper textures, kantha running-stitch details, handwritten notes and framed "gallery"
product cards with museum labels. Built for handmade marketplaces, craft cooperatives, homeware and art studios that sell on
the story of the maker.

- **Categories / presets:** `handicraft` (default), `home`, `gifts`
- **Price:** ৳2,500
- **Built on:** `@pai/theme-kit` (`createBaseTheme`) — every kit section stays available in the customizer.

## Structure

```
src/manifest.ts          Theme Store listing
src/images.ts            Every default image (verified Unsplash) + the workshop gallery set
src/settings.ts          Palettes (HANDICRAFT / HOME / GIFTS), the "Artisan style" settings group, CSS variable mapper
src/config.ts            Header/footer groups, home pages per preset, every other template
src/presets.ts           Handicrafts & Art · Handmade Home · Handmade Gifts
src/index.ts             createBaseTheme(...) + theme CSS (paper, stitches, framed cards, header, footer, sections)
src/sections/            _artisan.tsx (helpers), header.tsx (announcement + header), footer.tsx, hero.tsx, maker-story.tsx,
                         artisan-profiles.tsx, made-to-order.tsx, gallery-grid.tsx, craft-regions.tsx, impact-numbers.tsx,
                         main-product.tsx
src/client/              count-up.tsx (the only client island — impact counters)
```

## Header, footer & cards

| Piece | What's different |
| --- | --- |
| **Announcement bar** (`announcement-bar`) | Bark-coloured strip (colour setting, auto-contrast text) with a handwritten note on the left, up to 4 messages joined by cross-stitch knots (first message only on mobile) and a dashed "Visit the workshop" link. |
| **Header** (`header`) | Paper-textured, centred wordmark (store name in spaced small caps when no logo) with a **handwritten tagline**, underlined "notebook" search with predictive results, menu on a dashed rule with diamond separators and a running-stitch hover underline, "Basket" cart label, and a kantha **running-stitch hem** in the stitch colour. Inline layout available. |
| **Footer** (`footer`) | Stitched "Made by hand in Bangladesh" story line, a **postcard newsletter** ("Letters from the workshop") with airmail-striped border, postage stamp and postmark, brand story with a fair-trade **impact note**, link columns, "Visit the workshop" address/hours/contact, hand-signed sign-off, payment icons. Blocks: `newsletter`, `brand`, `link_list`, `text`, `contact`. |
| **Product cards** | Framed gallery pieces: a paper **passe-partout mat** around the image (or a wooden frame + mat, or unframed), recessed image edge, and a **museum label** — serif title, "by *maker*" (vendor), price in tabular figures and a catalogue number ("No. 03") per section. Portrait ratio and vendor shown by default. Applies to every kit listing. |

## Signature sections

| Type | Name | Highlights |
| --- | --- | --- |
| `artisan-hero` | Artisan hero | Framed photo (left/right) with an inner stitch, a **taped polaroid** with handwritten caption and a **museum tag**; or full-bleed image with a paper card. One h1; `*word*` sets words in the handwritten font; 2 buttons + handwritten note. |
| `maker-story` | Maker story | Large framed portrait (sticky), long-form story with drop cap, **handwritten pull-quote**, **signature**, up to 4 `fact` blocks, one of the maker's pieces as a museum-label card, button. |
| `artisan-profiles` | Artisan profiles | Up to 8 `artisan` blocks: portrait, name, craft, region, **years of practice** badge, handwritten quote, link to their collection (falls back to all products if the collection doesn't exist). Optional "photos are illustrative" note. |
| `made-to-order` | Made-to-order process | Up to 6 numbered `step` blocks (icon or photo, title, text, duration) joined by a running stitch, **lead-time card** ("Ready in 3–4 weeks"), CTA and "each piece is unique" note. |
| `gallery-grid` | Gallery grid | Masonry of up to 16 `image` blocks (shape, caption, alt) on paper mats; captions handwritten under the photo or as museum labels on hover; optional **product link** shows title, region and price. |
| `craft-regions` | Craft regions map | Stylised Bangladesh silhouette with dashed "stitched" outline, rivers and compass; up to 10 `region` blocks with pins positioned by **x/y settings** (illustrative, not to scale — the map says so), and an accessible numbered list (region, craft, description, photo, collection link). Pins are links to their list entry (`:target` highlight). |
| `impact-numbers` | Impact numbers | Up to 6 `stat` blocks (number, decimals, prefix, suffix, label, small print) that **count up** when scrolled into view (server-rendered final value; respects reduced motion), link to an impact report, handwritten footnote. |

Product page (`main-product` via `extendMainProduct`) adds two blocks:
- `maker` — "*made by* {maker} in {region}" card with a small round portrait, time taken and a link. Maker defaults to the
  product vendor; region is derived from tags (`kantha` → Jamalpur, `jamdani` → Rupganj, `copper`/`brass` → Dhamrai,
  `terracotta`/`pottery` → Bijoypur, `shataranji`/`rug` → Rangpur, `jute` → Mymensingh, `leather` → Hazaribagh).
- `made_to_order` — lead time with note, "each piece is one of a kind" note and a care-instructions disclosure. Can be limited to
  products with a given tag (e.g. `made-to-order`).

## Global settings

Standard kit settings (colours, fonts, layout, cards, cart …) with Artisan defaults, plus an **Artisan style** group:

| Id | Purpose |
| --- | --- |
| `font_accent` | Handwritten accent font (Caveat, Kalam, Reenie Beanie, Nanum Pen Script, Patrick Hand, Homemade Apple — or a serif such as Fraunces, rendered italic). Loaded from Google Fonts via `fontSettings`. |
| `color_card` | Paper / mat colour for cards, labels and panels |
| `color_indigo` | Stitch & pin colour (header hem, map pins, process line) |
| `artisan_paper` / `artisan_paper_strength` | SVG fractal-noise paper grain (CSS only, no image files) and its strength |
| `artisan_stitch` | Kantha running-stitch details everywhere (rules, hems, inner button stitch, frames) |
| `artisan_card_frame` | `mat` · `frame` (wooden frame + mat) · `none` |

## Presets

| Id | Palette & type | Home page |
| --- | --- | --- |
| `handicraft` | Paper `#f6f0e6`, bark `#3a2a20`, terracotta `#b5552f`, indigo stitches · Marcellus / Work Sans / Caveat | Framed hero, trust strip, crafts, new from the workshop, maker story, craft map, made-to-order, makers, wall art, impact, workshop gallery, journal (12) |
| `home` | Linen, clay, leaf green `#3f4f36` · Fraunces / Lato / Kalam, wooden-frame cards | Full-bleed room hero, trust, home edit, home gallery, kantha maker story, custom-size process, wall art, map, impact, journal (10) |
| `gifts` | Kraft, madder `#7a2f2b`, turmeric · Cormorant Garamond / Work Sans / Caveat | Gift hero, gift perks, small luxuries, crafts, personalisation process, most gifted, makers, impact, wrapped gallery, gifting FAQ (10) |

## Demo data

The default config uses the seeded handicraft catalogue (`artisan-demo`): collections `pottery-ceramics`, `home-decor`,
`wall-art`, `leather-bags`, `candles-soaps` and products such as `nakshi-kantha-bedspread`, `hand-thrown-stoneware-vase-set`,
`hammered-copper-water-jug`. Missing products are simply not shown, missing collections fall back to `/collections/all` (or no
link), so the defaults also work for new stores. Makers and workshop photos in the defaults are illustrative ("hands at work"
shots rather than portraits of the named people).

## Customization notes

- Wrap words in `*asterisks*` in Artisan headings to set them in the handwritten accent font.
- Product-card museum labels come from CSS on the kit's card DOM, so the region isn't printed inside kit listings (the kit card
  has no slot for it); Artisan's own sections (maker story, gallery grid) and the `maker` product block do show the region.

## Checks

```
npx tsc --noEmit -p themes/artisan
node tools/create-theme/validate.mjs artisan
node tools/verify-images.mjs themes/artisan
```
