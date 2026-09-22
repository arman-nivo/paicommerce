---
title: Theme development
description: The PaiCommerce theme model — a theme is a typed package of React Server Component sections, JSON schemas and presets that merchants customise without code.
---

A PaiCommerce theme controls everything a shopper sees: the header, the home page, product and collection pages, the cart, blog and account pages. Merchants pick a theme from the Theme Store, choose a preset ("Fashion", "Grocery", …) and then customise it visually in the dashboard's **theme customizer** — reordering sections, editing copy and swapping images — without ever touching code.

This page explains the concepts. When you are ready to write code, jump to the [Theme CLI](/docs/themes/cli).

## A theme is a package

Every theme lives in `themes/<slug>` and is a normal workspace package named `@pai-theme/<slug>`. Its default export is a `ThemeDefinition` created with `defineTheme` from `@pai/theme-sdk`:

```ts title="themes/monsoon/src/index.ts"
import { defineTheme } from "@pai/theme-sdk";
import { manifest } from "./manifest";
import { settingsSchema } from "./settings";
import { presets } from "./presets";
import promoBanner from "./sections/promo-banner";
import featuredProducts from "./sections/featured-products";

export default defineTheme({
  manifest, // Theme Store listing: name, version, price, categories…
  settingsSchema, // global settings: colours, fonts, layout
  sections: [promoBanner, featuredProducts], // React components + schemas
  presets, // ready-made starting points per business category
  fontSettings: ["font_heading", "font_body"],
  defaultConfig: {
    /* which sections appear on which template — see below */
  },
});
```

Most themes don't start from zero: [`createBaseTheme`](/docs/themes/theme-kit) from `@pai/theme-kit` gives you a complete, accessible theme (header, footer, product page, cart, search, account…) that you then restyle and extend with your own sections.

## Core concepts

| Concept | What it is | Defined by |
| --- | --- | --- |
| **Manifest** | Store listing metadata: slug, name, version, price, categories, screenshots | [`ThemeManifest`](/docs/themes/manifest) |
| **Global settings** | Theme-wide options (colours, fonts, spacing) grouped into panels | [`SettingsGroup[]`](/docs/themes/settings) |
| **Section** | A full-width, reorderable building block — a hero, a product grid, the product page body | [`SectionDefinition`](/docs/themes/sections) |
| **Block** | A repeatable item inside a section — a slide, a FAQ item, a "Buy" button | [`BlockSchema`](/docs/themes/blocks) |
| **Setting field** | One input in the customizer (`text`, `image`, `color`, `collection`, …) | [`SettingField`](/docs/themes/settings) |
| **Template** | A page type: `index`, `product`, `collection`, `cart`, `search`, `page`, `blog`, `article`, `account`, `404`, `collections` | `TemplateType` |
| **Section group** | The `header` and `footer` section lists shared by every page | `SectionGroup` |
| **Preset** | A named starting configuration for a business category | [`ThemePreset`](/docs/themes/presets) |
| **ThemeConfig** | The JSON document that stores a merchant's customisations | `ThemeConfig` |

### Sections

Sections are **React Server Components**. They receive their resolved settings, their blocks and a [`StorefrontContext`](/docs/themes/context), and they may be `async` to fetch data:

```tsx
async function FeaturedProducts({ settings, context }: SectionProps<Settings>) {
  const { items } = await context.data.getProducts({ collection: settings.collection, limit: 8 });
  return <ProductGrid products={items} />;
}
```

Each section also has a **schema** describing its settings, its block types, which templates it may be added to, and the presets shown in the "Add section" picker. The schema is what powers the customizer's sidebar.

### Templates and groups

Each page type (template) has an **ordered list of sections**. The header and footer are special *groups* that render on every page, around the template's sections:

```text
┌──────────────────────────── groups.header ─────────────────────────────┐
│ announcement-bar · header                                              │
├─────────────────────────── templates.index ────────────────────────────┤
│ promo-banner · featured-products · collection-list · testimonials      │
├──────────────────────────── groups.footer ─────────────────────────────┤
│ newsletter · footer                                                    │
└────────────────────────────────────────────────────────────────────────┘
```

A validated theme must provide at least the `index`, `product`, `collection` and `cart` templates.

### ThemeConfig: the merchant's document

Everything a merchant changes in the customizer is saved as one JSON document. Section instances are keyed by a stable id, and `order` controls rendering order:

```json title="store_themes.config"
{
  "settings": {
    "color_primary": "#0f766e",
    "font_heading": "Poppins",
    "radius": 12
  },
  "groups": {
    "header": {
      "order": ["announcement", "header"],
      "sections": {
        "announcement": { "type": "announcement-bar", "settings": { "text": "Free delivery in Dhaka over ৳2,000" } },
        "header": { "type": "header", "settings": { "menu": "main-menu", "sticky": true } }
      }
    },
    "footer": {
      "order": ["footer"],
      "sections": { "footer": { "type": "footer", "settings": {} } }
    }
  },
  "templates": {
    "index": {
      "order": ["hero", "best_sellers"],
      "sections": {
        "hero": {
          "type": "promo-banner",
          "settings": { "heading": "Eid Collection is live", "height": "lg" },
          "blocks": [
            { "id": "b_k3x9a1", "type": "badge", "settings": { "text": "Eid Sale" } },
            { "id": "b_q7m2z4", "type": "perk", "settings": { "icon": "cash", "title": "Cash on delivery" }, "disabled": true }
          ]
        },
        "best_sellers": {
          "type": "featured-products",
          "settings": { "heading": "Best sellers", "collection": "new-arrivals", "limit": 8 }
        }
      }
    }
  }
}
```

A few rules make this model robust:

- **Defaults fill the gaps.** Settings missing from the document are filled from the schema's `default` values at render time (`applyDefaults`), so adding a new setting in a theme update never breaks existing stores.
- **Unknown keys are kept.** Removing a setting from your schema won't delete merchants' stored values — they are simply ignored.
- **Disabled is not deleted.** Sections and blocks with `"disabled": true` are skipped by the renderer but stay in the document, so merchants can toggle them back on.
- **Templates fall back.** If a stored config doesn't contain a template, the theme's default template (plus the preset) is used.

The storefront resolves the config to render with:

```ts
import { resolveThemeConfig } from "@pai/theme-sdk";

// Priority: stored merchant edits → preset → theme default
const config = resolveThemeConfig(theme, storeTheme.config, storeTheme.presetId);
```

## The theme lifecycle

1. **Scaffold** a theme with `pnpm theme:new` — see [Theme CLI](/docs/themes/cli).
2. **Develop** locally against a demo store at `http://<slug>-demo.localhost:3003` — see [Local development](/docs/themes/local-development).
3. **Validate** with `node tools/create-theme/validate.mjs <slug>` — see [Validation](/docs/themes/validation).
4. **Polish** using the [performance & accessibility checklist](/docs/themes/checklist).
5. **Submit** to the Theme Store for review and start earning 70% of every sale — see [Submitting](/docs/themes/submitting).

## Where to go next

- [Theme structure](/docs/themes/structure) — the files in a theme package.
- [Sections](/docs/themes/sections) — the complete `SectionSchema` reference with a real-world example.
- [Settings reference](/docs/themes/settings) — every setting type, with examples.
- [Storefront context](/docs/themes/context) — the data available to your sections.
