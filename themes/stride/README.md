# Stride

A bold, high-energy PaiCommerce theme for **sports, fitness and activewear** stores. It has heavy condensed uppercase type, a full-bleed video hero, loud scrolling text bands and sharp image tiles. It's built on `@pai/theme-kit`.

- **Categories:** sports (default), fashion, health
- **Price:** ৳2,900
- **Demo store:** `stride-demo`

## Sections

| Type | Name | What it does |
| --- | --- | --- |
| `header` | Header (replaces kit) | Logo on the left, bold uppercase nav with an accent underline, and search, account and cart icons. On the home page it's **transparent over the hero** (`transparent_on_home`). Menu items with children open a **sport mega menu**: a links column, image tiles for the linked collections (falling back to store collections) and a promo card. It also has an accent "Sale" highlight link and uses the kit `MobileMenu`. |
| `footer` | Footer (replaces kit) | A "Join the club" newsletter band with member-perk blocks, then bold link columns and contact details. Below that is a **giant brand wordmark** (solid, outline or accent), then socials, payment icons and copyright. Anchor: `#join-the-club`. |
| `stride-hero` | Video hero | Full-bleed media: an mp4/webm file or a YouTube/Vimeo URL played muted and looped, with a poster image fallback. The headline is 1–4 stacked **line** blocks, each solid, outline or accent. It also has an eyebrow, a subheading, two CTAs and a **stat ticker** built from stat blocks. It has a visible pause/play button, and video never plays with `prefers-reduced-motion`. |
| `stride-marquee` | Scrolling text band | Oversized looping words that alternate solid and outline, with a choice of separator, size, speed, direction and tilt. It can be a link. |
| `stride-sport-tiles` | Shop by sport | One **sport** block per tile, each with a collection, label, caption and image. Tiles show index numbers, product counts and hover motion, and the first tile can be large. A missing collection falls back to `/collections/all`. |
| `stride-product-tabs` | Product rail with tabs | One **tab** block per collection, shown as a carousel or grid of Stride cards. An empty or missing collection falls back to best sellers, newest or top rated. Optional rank numbers. |
| `stride-feature-callouts` | Feature callouts | A product image inside an accent ring, a giant outlined backdrop word and numbered **feature** blocks (icon, title, text) on the left and right. Picking a product adds its price and a buy button. |
| `stride-athlete` | Athlete story | A portrait with the athlete's name running vertically, a pull-quote, name and discipline, **stat** blocks, a CTA, and a "shop the kit" row. The kit row uses hand-picked products, then a collection, then best sellers. |
| `stride-drop` | Countdown drop | A big image and sticker next to a countdown. It uses a set date, or the next weekly drop day and hour in Dhaka time. Shows the product price and two CTAs. |
| `main-product` | Product (kit + extension) | All kit blocks, plus a **`fit_feel`** block: three labelled 5-step scales (fit, cushioning, support) and a sizing note. |

Kit sections such as `multicolumn`, `testimonials`, `blog-posts`, `main-*` and `announcement-bar` stay available and are restyled by the theme CSS.

## Product card

`components/card.tsx` (`StrideCard`) is a sharp "drop card". It has a 4:5 media well with an image swap on hover, a sale, new or sold-out tag, and a wishlist button. It shows a **category · colour count** label, an uppercase condensed title and a big price. A black **"Quick add +"** bar slides up on hover and turns accent on hover. The theme CSS restyles the kit `.pai-product-card` the same way, so collection, search and related-product listings match.

## Presets

| Preset | Category | Look |
| --- | --- | --- |
| Sports — Blaze (default) | `sports` | White and near-black with a `#ff4d00` accent, Bebas Neue and Archivo, pill buttons |
| Activewear — Studio | `fashion` | Bone, ink and acid lime, Oswald 600 and Inter, sharp buttons, activewear home page |
| Fitness & nutrition — Power | `health` | White, navy and electric blue, a home-gym home page with a coach's-corner story |

Each preset ships its own settings, home template and header/footer groups. `defaultConfig` covers every template: index, product, collection, collections, search, cart, page, blog, article, account and 404.

## Settings added

- `color_card` (Colors): the background for card image wells and panels.
- `heading_weight` (Typography): Bebas Neue only has weight 400, so the theme sets the heading weight explicitly. Use 600–700 with Oswald or Archivo.
- CSS variables: `--stride-accent-fg` is black or white, whichever contrasts more with the accent. Accent buttons, tags and the accent colour scheme use it. The heading weight is exposed as `--stride-heading-weight`.

## Notes

- All imagery is verified Unsplash (`src/images.ts`). The default hero video is empty, and merchants can paste an mp4 URL or a YouTube/Vimeo link.
- Links use `context.url` or `resolveHref`, and `Link` comes from `@pai/theme-kit`. Client islands live in `src/client` (`mega-menu`, `hero-media`).
- Motion (the marquee, ticker and hover transforms) is disabled under `prefers-reduced-motion`. Decorative duplicates are `aria-hidden`, and the marquee text is exposed once through `sr-only`.
- Keyframes can't be nested in the scoped theme CSS, so the bands reuse the kit's global `pai-marquee` keyframes.

Checks: `npx tsc --noEmit -p themes/stride` · `node tools/create-theme/validate.mjs stride` · `node tools/verify-images.mjs themes/stride`
