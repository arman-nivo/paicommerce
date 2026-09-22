# __NAME__

__TAGLINE__

`@pai-theme/__SLUG__` · by __AUTHOR__ · categories: __CATEGORIES_LIST__ · price: __PRICE_LABEL__

This theme was scaffolded with `pnpm theme:new` and is built on
[`@pai/theme-kit`](../../packages/theme-kit) (header, footer, product, collection, cart and search
sections, plus client hooks) and the [`@pai/theme-sdk`](../../packages/theme-sdk) contract.

## Structure

```
themes/__SLUG__/
├── package.json              @pai-theme/__SLUG__ — exports "." (theme) and "./manifest" (pure data)
├── tsconfig.json
└── src/
    ├── index.ts              composes the ThemeDefinition (createBaseTheme + your sections/settings/presets)
    ├── manifest.ts           Theme Store listing: name, categories, price (BDT minor units), thumbnail
    ├── settings.ts           global settings schema (colors, fonts, layout …) → CSS variables
    ├── presets.ts            one-click starting looks shown when a merchant installs the theme
    └── sections/
        └── promo-banner.tsx  example custom section (settings + blocks + presets)
```

## Develop

```bash
pnpm install                                   # links the new workspace package (first time only)
pnpm dev                                       # starts web :3000, dashboard :3001, admin :3002, storefront :3003
```

1. Open the merchant dashboard at <http://localhost:3001> → **Themes** and add
   **__NAME__** to a test store (the theme is registered in `packages/theme-registry`).
2. Click **Customize** to open the theme customizer. Every save hot-reloads the preview.
3. Visit the storefront on <http://localhost:3003> to see the published theme.

### Adding a section

1. Copy `src/sections/promo-banner.tsx` → `src/sections/my-section.tsx`.
2. Give it a unique `schema.type` (prefix it with `__SLUG__-` to avoid clashes with kit sections),
   describe its `settings`/`blocks`, and add at least one entry to `presets` so merchants can add it
   from the **Add section** picker.
3. Register it in `src/index.ts`.

Rules of thumb:

- Style with the theme CSS variables: `var(--pai-bg)`, `var(--pai-fg)`, `var(--pai-primary)`,
  `var(--pai-primary-fg)`, `var(--pai-accent)`, `var(--pai-muted)`, `var(--pai-border)`,
  `var(--pai-font-heading)`, `var(--pai-font-body)`, `var(--pai-radius)`, `var(--pai-container)` …
- Build every link with `context.url("/collections/sale")` — stores can live under a path prefix.
- Fetch data only through `context.data` (`getProducts`, `getCollections`, …). Themes never import
  the database. Money values are integers in **minor units** — format them with `context.formatMoney`.
- Sections are React Server Components; move interactive bits into a `"use client"` file and use
  the hooks from `@pai/theme-kit/client` for cart, wishlist and search.
- Use plain `<img>` for merchant images; demo images must be `https://images.unsplash.com/photo-…`
  URLs (check them with `node tools/verify-images.mjs themes/__SLUG__`).

## Validate

```bash
node tools/create-theme/validate.mjs __SLUG__   # or: pnpm --filter @pai-theme/__SLUG__ validate
npx tsc --noEmit -p themes/__SLUG__            # or: pnpm --filter @pai-theme/__SLUG__ typecheck
node tools/verify-images.mjs themes/__SLUG__
```

The validator loads the theme and checks the manifest, section schemas (duplicate ids, unknown
block types, presets), the default config (required `index`, `product`, `collection` and `cart`
templates) and presets. It exits with code 1 on errors.

## Pre-submit checklist

- [ ] `validate.mjs` passes with no errors, `tsc` is clean, all images verified
- [ ] Real screenshots in `manifest.thumbnail` / `manifest.screenshots` (1600px wide)
- [ ] Looks right at 360px, 768px and 1280px+ widths; no horizontal scroll
- [ ] Lighthouse mobile performance ≥ 90, accessibility ≥ 95 on the home and product pages
- [ ] Every image has meaningful `alt` text (or `alt=""` if decorative); headings are in order
- [ ] Text contrast ≥ 4.5:1 in every preset; visible focus styles; tap targets ≥ 44px
- [ ] Works with empty data (no products, no image, empty settings) and in the customizer preview
- [ ] Bump `version` in `src/manifest.ts` and `package.json` for every release

## Submit to the Theme Store

1. Register as a developer on the PaiCommerce website and read the docs at
   <http://localhost:3000/docs/themes> (and `docs/THEME_GUIDE.md` in this repo).
2. Open a pull request with `themes/__SLUG__` and the registry entry, or submit it from the
   developer portal. The PaiCommerce team reviews code quality, performance and accessibility.
3. Once approved the theme is listed in the Theme Store. Paid themes earn a **70/30 revenue share**
   (70% to you, 30% to PaiCommerce).

---

© __YEAR__ __AUTHOR__
