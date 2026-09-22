---
title: Local development
description: Develop themes against real demo stores — run the storefront on :3003, open <slug>-demo.localhost, use the /s/<slug> path fallback, install your theme on a store and preview it in the customizer.
---

You develop themes against a real storefront with real (seeded) data. There is no separate theme dev server: the storefront transpiles your theme's source directly, so edits appear with Fast Refresh.

## Start the apps

After the [Quickstart](/docs/quickstart) setup, you need two apps for theme work:

```bash
$ pnpm --filter @pai/storefront dev   # http://localhost:3003
$ pnpm --filter @pai/dashboard dev    # http://localhost:3001 — for the customizer
```

Or just run everything with `pnpm dev`.

## Demo stores

The seed script creates **one demo store per theme**, with products, collections, pages and blog posts that fit the theme's categories. Its slug is `<theme-slug>-demo`:

```text
http://aurora-demo.localhost:3003
http://volt-demo.localhost:3003
http://monsoon-demo.localhost:3003   # after you create a theme and re-seed
```

Browsers resolve `*.localhost` to `127.0.0.1`, so no hosts-file changes are needed. If your setup can't resolve subdomains, use the **path fallback**:

```text
http://localhost:3003/s/aurora-demo
http://localhost:3003/s/aurora-demo/collections/new-arrivals
```

> [!TIP]
> After creating a new theme, run `pnpm db:seed` again so a `<your-slug>-demo` store is created with your theme installed and its first preset applied.

## Install your theme on a store

To try your theme on any store — for example your own test store with realistic data:

1. Log in to the dashboard at `http://localhost:3001`.
2. Go to **Online store → Themes**. Locally, every theme registered in `@pai/theme-registry` is available in the theme library, including themes that haven't been through Theme Store review.
3. Click **Add theme** on yours, choose a preset, then **Customize** to open the customizer or **Publish** to make it live on the store.

The store's live theme is rendered at `http://<store-slug>.localhost:3003`.

## Preview in the customizer

**Customize** opens the customizer with your theme in the preview iframe (served from `/preview/{token}/…` on the storefront). Use it to check:

- every section's settings update the preview as expected;
- sections added from the "Add section" picker look finished without edits (good defaults and presets);
- placeholders appear for empty settings (`context.isPreview`);
- each template in the page picker (Home, Product, Collection, Cart, Search, Blog, …) renders.

See [Customizer integration](/docs/themes/customizer) for how the preview works.

## Typecheck and validate

```bash
$ pnpm --filter @pai-theme/monsoon typecheck
$ node tools/create-theme/validate.mjs monsoon
```

Run both before every commit — see [Validation](/docs/themes/validation).

## Debugging tips

**The storefront shows the default theme instead of mine.** Your slug isn't in `themeLoaders` — `loadTheme()` falls back to the default theme for unknown slugs. Check `packages/theme-registry/src/index.ts` and run `pnpm install`.

**`Module not found: @pai-theme/monsoon`.** The workspace link is missing. Run `pnpm install` at the repo root after the theme is added to `packages/theme-registry/package.json`.

**"Unknown section type" boxes in the preview.** The stored config references a section `type` your theme doesn't define — usually after renaming a section. Rename it back, or reset the theme in the customizer.

**Tailwind classes have no effect.** The class is built dynamically (`` `bg-${color}` ``) and Tailwind can't detect it. Use complete class names or inline styles — see [Styling](/docs/themes/styling#tailwind-class-detection).

**Hydration errors.** A client component rendered something different on the server and the client — typically `Date.now()`, `Math.random()` or `window` during render. Initialise such values in `useEffect`, as the promo banner's countdown does.

**Links jump out of the customizer or to the wrong store.** A link was hard-coded (`href="/cart"`). Use `context.url("/cart")`.
