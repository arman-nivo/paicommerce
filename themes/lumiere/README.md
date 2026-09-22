# Lumière — jewellery & luxury theme

Ivory, ink black and a whisper of gold. Cormorant Garamond set with generous negative space, thin gold hairlines,
square uppercase buttons and slow, cinematic motion — built for fine jewellery, watches, couture accessories and
luxury gifting.

- **Categories / presets:** `jewelry` (default), `fashion`, `gifts`
- **Price:** ৳4,900
- **Built on:** `@pai/theme-kit` (`createBaseTheme`) — every kit section stays available in the customizer.

## Structure

```
src/manifest.ts          Theme Store listing
src/images.ts            Every default image (verified Unsplash, checked by eye)
src/settings.ts          Palettes (JEWELRY / FASHION / GIFTS), the "Lumière style" group, CSS variable mapper
src/config.ts            Header/footer groups, home pages per preset, every other template
src/presets.ts           Fine Jewellery · Couture & Accessories · Luxury Gifting
src/index.ts             createBaseTheme(...) + theme CSS (type, buttons, header, cards, footer, motion)
src/sections/            header.tsx (announcement + header), footer.tsx, hero.tsx, collection-story.tsx,
                         heritage-timeline.tsx, gift-guide.tsx, appointment.tsx, press.tsx, main-product.tsx,
                         _lumiere.tsx (helpers), _keyframes.tsx (hoisted @keyframes)
src/client/              whisper.tsx (announcement cross-fade), guide-tabs.tsx (gift-guide tablist),
                         header-measure.tsx (exact overlap for the transparent header)
```

## Header, footer & cards

| Piece | What's different |
| --- | --- |
| **Announcement bar** (`announcement-bar`) | Thin black bar with gold small-caps lettering; messages cross-fade slowly (pauses on hover/focus, static for reduced motion). Left: atelier line with link; right: phone + WhatsApp (from store phone / WhatsApp social). |
| **Header** (`header`) | Centred serif wordmark in spaced capitals (or logo) with a tiny tagline, thin-stroke search / account / bag icons (optional text labels), "Book a private viewing" link, spaced small-caps menu between **gold hairline rules** with a gold underline on hover. Optional transparent mode over the home hero — its height is measured on the client so the overlap is exact. |
| **Footer** (`footer`) | Ink-black by default: "The Lumière Letter" newsletter with an underline-only field, gold ornament, **Visit our atelier** column (address, hours, phone, WhatsApp, email, appointment link), link columns, promise text, centred spaced wordmark between hairlines, social + payment icons. Blocks: `newsletter`, `atelier`, `link_list`, `text`. |
| **Product cards** | Minimal: square photo on an ivory tile (`color_card`), centred serif title, **gold price**, slow zoom + image swap on hover, no rating/wishlist/quick-add clutter by default (all switchable in *Product cards*). Applies to every kit listing. |

## Signature sections

| Type | Name | Highlights |
| --- | --- | --- |
| `lumiere-hero` | Cinematic hero | Full-screen image or muted MP4 loop (poster = image), optional mobile image, slow Ken Burns drift, letterbox bars edged in gold, centred or bottom-aligned serif headline (line breaks kept), two buttons, scroll cue to the next section. Motion off for `prefers-reduced-motion` and via the theme setting. |
| `collection-story` | Collection story | Up to 6 `chapter` blocks — image, outlined Roman numeral, eyebrow, title, story, 0–4 pieces from the linked collection (or tag) with gold prices, link. Alternating sides, hairline-framed images. |
| `heritage-timeline` | Heritage timeline | Up to 10 `milestone` blocks (year, title, text, image) on a vertical gold rule with lozenge markers; alternating sides on desktop, single rule on phones; optional button. |
| `gift-guide` | Gift guide | Up to 6 `guide` blocks by recipient / occasion / budget. Products: collection → tag → price range (৳ min/max) → best sellers, topped up so rows are full. Tabs layout (accessible tablist, arrow/Home/End keys) with an "Adviser's note" image panel, or image tiles. Links default to the collection, tag search or `/collections/all?min=…&max=…`. |
| `appointment-cta` | Book an appointment | Split layout: image + gold double-framed card with atelier address (defaults to store address), hours, telephone, email, and a WhatsApp (prefilled message), email or page button plus a secondary link. |
| `press-logos` | As seen in | Up to 8 `publication` blocks — logo image or serif wordmark (roman / italic / spaced capitals), optional article link, featured quote. |

Product page (`main-product` via `extendMainProduct`) adds two blocks:
- `certification` — hallmark / exchange / insurance seals, and a spec sheet (metal, stones, weight, certificate) auto-filled from tags
  like `22k`, `18k`, `diamond`, `pearl`, `sapphire`, `watch` when not set.
- `gift_message` — signature box & ribbon, handwritten card, gift receipt, and a disclosure explaining how to add the message
  (order note at checkout — enable *Cart → show note*).

The kit gallery keeps its zoom (`zoom: true`, thumbnails left, square images).

## Global settings

Standard kit settings with Lumière defaults (radius 0, square buttons, square minimal cards, centred text), plus **Lumière style**:

| Id | Purpose |
| --- | --- |
| `lumiere_gold` | Gold tone for rules, prices, numerals and ornaments |
| `color_card` | Ivory tile behind product photos and panels |
| `lumiere_hairlines` | Gold hairline rules (nav, eyebrows, dividers) |
| `lumiere_heading_tracking` | Heading letter spacing (−2 … 12 %) |
| `lumiere_caps_buttons` | Uppercase, letter-spaced buttons |
| `lumiere_motion` | Ken Burns + slow hover zoom (always off for reduced motion) |

## Presets

| Id | Palette & type | Home page |
| --- | --- | --- |
| `jewelry` | Ivory `#fbf8f2`, ink `#111`, gold `#b08d57` · Cormorant Garamond / Manrope | Cinematic hero (22K temple set), promises, collections, three collection chapters, signature pieces, gift guide (For her · Under ৳25,000 · Bridal · For him), heritage timeline, press, private viewing, journal |
| `fashion` | Bone, espresso, champagne · Marcellus / Lato | Saree hero (bottom-left), promises, new-season carousel, "How we're wearing it" chapters, categories, press, occasion tiles, styling appointment (dark), style notes |
| `gifts` | Porcelain, ink, warm gold · Bodoni Moda / Manrope | Gold-ribbon hero, gifting promises, gift guide tabs, most gifted, occasion chapters, gift-wrap story, press, gift consultation |

## Demo data

Defaults use the seeded `lumiere-demo` catalogue: collections `bridal`, `rings`, `necklaces`, `earrings`, `bracelets-bangles`,
`watches`; tags such as `gift`, `22k`, `diamond`. Every section falls back gracefully (and shows samples + a notice in the
customizer) when a slug is missing, so the defaults also work for new stores.

## Notes

- Theme CSS is nested under `.pai-theme-lumiere`, where `@keyframes` isn't valid, so keyframes ship as a hoisted React 19
  `<style href precedence>` from the header/hero (`sections/_keyframes.tsx`).

## Checks

```
npx tsc --noEmit -p themes/lumiere
node tools/create-theme/validate.mjs lumiere
node tools/verify-images.mjs themes/lumiere
```
