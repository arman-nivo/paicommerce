---
title: Styling & design tokens
description: Style themes with Tailwind CSS 4 and the --pai-* CSS variables generated from global settings. Scoped theme CSS, custom cssVariables mappers, Google Fonts and dark sections.
---

Themes are styled with **Tailwind CSS 4 utility classes** plus a small set of **CSS custom properties** generated from the merchant's global settings. Merchants change colours, fonts and corner radius in the customizer; your sections pick them up automatically through the variables.

## How theme styles reach the page

When the storefront renders your theme it:

1. Resolves the global settings (`resolveThemeSettings`).
2. Converts them into CSS variables with `theme.cssVariables` — or `defaultCssVariables` if you don't provide one.
3. Emits those variables on a root element carrying the class `pai-theme-<slug>`.
4. Injects your `theme.css` string, scoped under `.pai-theme-<slug>`.
5. Loads the Google Fonts named by the settings listed in `theme.fontSettings`.

## Design tokens

`defaultCssVariables` maps the [standard setting ids](/docs/themes/settings#standard-global-settings-and-css-variables) to these variables:

```css
.pai-theme-monsoon {
  --pai-bg: #ffffff;            --pai-bg-rgb: 255 255 255;
  --pai-fg: #18181b;            --pai-fg-rgb: 24 24 27;
  --pai-primary: #0f766e;       --pai-primary-rgb: 15 118 110;
  --pai-primary-fg: #ffffff;    --pai-primary-fg-rgb: 255 255 255;
  --pai-accent: #f59e0b;        --pai-accent-rgb: 245 158 11;
  --pai-muted: #f4f4f5;         --pai-muted-rgb: 244 244 245;
  --pai-border: #e4e4e7;        --pai-border-rgb: 228 228 231;
  --pai-sale: #dc2626;          --pai-sale-rgb: 220 38 38;
  --pai-font-heading: "Poppins", ui-sans-serif, system-ui, sans-serif;
  --pai-font-body: "Inter", ui-sans-serif, system-ui, sans-serif;
  --pai-radius: 10px;
  --pai-button-radius: 999px;
  --pai-container: 1280px;
  --pai-heading-scale: 1;
  --pai-section-spacing: 72px;
}
```

### Using tokens with Tailwind

Tailwind 4 arbitrary values accept CSS variables directly:

```tsx
<section className="bg-[var(--pai-bg)] py-[var(--pai-section-spacing)] text-[var(--pai-fg)]">
  <div className="mx-auto max-w-[var(--pai-container)] px-4">
    <h2 className="font-[family-name:var(--pai-font-heading)] text-3xl">Eid Collection</h2>
    <a className="rounded-[var(--pai-button-radius)] bg-[var(--pai-primary)] px-6 py-3 text-[var(--pai-primary-fg)]">Shop now</a>
    <div className="rounded-[var(--pai-radius)] border border-[var(--pai-border)] bg-[var(--pai-muted)]">…</div>
  </div>
</section>
```

The `-rgb` triplets let you apply opacity to theme colours:

```tsx
<div className="bg-[rgb(var(--pai-primary-rgb)/0.08)] ring-1 ring-[rgb(var(--pai-primary-rgb)/0.2)]">…</div>
```

Heading scale is a multiplier:

```css
.pai-theme-monsoon h1 { font-size: calc(2.5rem * var(--pai-heading-scale)); }
```

> [!TIP]
> Themes built on [`createBaseTheme`](/docs/themes/theme-kit) get the Theme Kit's stylesheet, which maps these variables to semantic utility classes and adds colour-scheme classes (`pai-scheme-muted`, `pai-scheme-inverse`, `pai-scheme-primary`, `pai-scheme-accent`) for alternating section backgrounds.

### Tailwind class detection

Theme packages ship source, and the storefront's Tailwind build scans the `themes/` directory for class names. Two rules follow from that:

- **Write complete class names.** Tailwind can't see classes you build by concatenation: use `const HEIGHT = { sm: "min-h-[320px]", lg: "min-h-[620px]" }` rather than `` `min-h-[${px}px]` ``.
- **Use inline styles for truly dynamic values** — an opacity from a range setting, a merchant-picked colour: `style={{ opacity: settings.overlay_opacity / 100 }}`.

## Custom variables: `cssVariables`

Need more tokens? Provide your own mapper. Start from `defaultCssVariables` so you keep the standard ones:

```ts title="themes/monsoon/src/index.ts"
import { defaultCssVariables, defineTheme, hexToRgbTriplet } from "@pai/theme-sdk";

export default defineTheme({
  // …
  cssVariables: (s) => {
    const vars = defaultCssVariables(s);
    const announcement = typeof s.color_announcement === "string" && s.color_announcement ? s.color_announcement : "#111111";
    vars["--monsoon-announcement"] = announcement;
    vars["--monsoon-announcement-rgb"] = hexToRgbTriplet(announcement);
    vars["--monsoon-card-shadow"] = s.card_shadow === true ? "0 10px 30px -12px rgb(0 0 0 / .25)" : "none";
    return vars;
  },
});
```

Prefix custom variables with your theme slug to avoid collisions with future platform tokens.

## Theme CSS: `css`

For things utilities can't express nicely — typography for merchant rich text, keyframes, `::selection` — add a CSS string. It is scoped automatically under `.pai-theme-<slug>`:

```ts
export default defineTheme({
  // …
  css: `
    h1, h2, h3 { font-family: var(--pai-font-heading); letter-spacing: -0.02em; }
    p, li { font-family: var(--pai-font-body); }
    ::selection { background: rgb(var(--pai-primary-rgb) / .2); }
    .rte a { color: var(--pai-primary); text-decoration: underline; text-underline-offset: 3px; }
    .rte ul { list-style: disc; padding-left: 1.25rem; }
    @keyframes monsoon-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
  `,
});
```

Keep it small. Every byte of theme CSS is sent on every page view; utilities are de-duplicated across the whole storefront build.

> [!WARNING]
> Keep theme CSS scoped to your own markup: don't style `html`, `body` or bare element selectors that could leak into storefront-owned UI such as checkout, and never rely on class names from the platform's own apps — they are not a public API and can change at any time.

## Fonts

Declare which `font` settings should be loaded:

```ts
export default defineTheme({
  // …
  fontSettings: ["font_heading", "font_body"],
});
```

At render time the storefront reads those settings, de-duplicates the families and builds a single Google Fonts stylesheet URL with `googleFontsUrl(families)`:

```ts
import { googleFontsUrl } from "@pai/theme-sdk";

googleFontsUrl(["Poppins", "Inter", "Poppins"]);
// → "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap"
```

Generic families (`system-ui`, `sans-serif`, `serif`, `monospace`) are skipped, and `display=swap` keeps text visible while fonts load.

### Bangla typography

Many stores publish product names and descriptions in Bangla. Latin-only display fonts fall back to the system Bangla font, which can look mismatched. Good practice:

- Offer **Hind Siliguri** (included in `FONT_CHOICES`) as the body font in at least one preset.
- Keep `line-height` at 1.5 or more for body text — Bangla conjuncts need vertical room.
- Avoid `text-transform: uppercase` on content that may be Bangla; it has no effect and breaks the visual rhythm your design expects.

## Colour contrast

Merchants can pick any colours, so design for it:

- Pair every background token with its foreground token (`--pai-primary` / `--pai-primary-fg`).
- When a merchant picks a colour for a single section (like the promo banner's `text_color`), give the setting a safe default and mention contrast in the `info` text.
- Test every preset with a contrast checker before submitting — see the [checklist](/docs/themes/checklist).
