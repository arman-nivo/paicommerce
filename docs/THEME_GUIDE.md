# PaiCommerce Theme Development Guide

> This guide is generated from the developer docs in `apps/web/content/docs/themes/`. The web version lives at [paicommerce.com/docs/themes](https://paicommerce.com/docs/themes) (locally http://localhost:3000/docs/themes).

## Contents

1. [Theme development](#theme-development)
2. [Theme CLI](#theme-cli)
3. [Theme structure](#theme-structure)
4. [Theme manifest](#theme-manifest)
5. [Settings reference](#settings-reference)
6. [Sections](#sections)
7. [Blocks](#blocks)
8. [Presets](#presets)
9. [Storefront context & data](#storefront-context--data)
10. [Theme Kit](#theme-kit)
11. [Styling & design tokens](#styling--design-tokens)
12. [Customizer integration](#customizer-integration)
13. [Local development](#local-development)
14. [Validation](#validation)
15. [Performance & accessibility checklist](#performance--accessibility-checklist)
16. [Submitting to the Theme Store](#submitting-to-the-theme-store)

---

## Theme development

A PaiCommerce theme controls everything a shopper sees: the header, the home page, product and collection pages, the cart, blog and account pages. Merchants pick a theme from the Theme Store, choose a preset ("Fashion", "Grocery", …) and then customise it visually in the dashboard's **theme customizer** — reordering sections, editing copy and swapping images — without ever touching code.

This page explains the concepts. When you are ready to write code, jump to the [Theme CLI](https://paicommerce.com/docs/themes/cli).

### A theme is a package

Every theme lives in `themes/<slug>` and is a normal workspace package named `@pai-theme/<slug>`. Its default export is a `ThemeDefinition` created with `defineTheme` from `@pai/theme-sdk`:

<sub>`themes/monsoon/src/index.ts`</sub>

```ts
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

Most themes don't start from zero: [`createBaseTheme`](https://paicommerce.com/docs/themes/theme-kit) from `@pai/theme-kit` gives you a complete, accessible theme (header, footer, product page, cart, search, account…) that you then restyle and extend with your own sections.

### Core concepts

| Concept | What it is | Defined by |
| --- | --- | --- |
| **Manifest** | Store listing metadata: slug, name, version, price, categories, screenshots | [`ThemeManifest`](https://paicommerce.com/docs/themes/manifest) |
| **Global settings** | Theme-wide options (colours, fonts, spacing) grouped into panels | [`SettingsGroup[]`](https://paicommerce.com/docs/themes/settings) |
| **Section** | A full-width, reorderable building block — a hero, a product grid, the product page body | [`SectionDefinition`](https://paicommerce.com/docs/themes/sections) |
| **Block** | A repeatable item inside a section — a slide, a FAQ item, a "Buy" button | [`BlockSchema`](https://paicommerce.com/docs/themes/blocks) |
| **Setting field** | One input in the customizer (`text`, `image`, `color`, `collection`, …) | [`SettingField`](https://paicommerce.com/docs/themes/settings) |
| **Template** | A page type: `index`, `product`, `collection`, `cart`, `search`, `page`, `blog`, `article`, `account`, `404`, `collections` | `TemplateType` |
| **Section group** | The `header` and `footer` section lists shared by every page | `SectionGroup` |
| **Preset** | A named starting configuration for a business category | [`ThemePreset`](https://paicommerce.com/docs/themes/presets) |
| **ThemeConfig** | The JSON document that stores a merchant's customisations | `ThemeConfig` |

#### Sections

Sections are **React Server Components**. They receive their resolved settings, their blocks and a [`StorefrontContext`](https://paicommerce.com/docs/themes/context), and they may be `async` to fetch data:

```tsx
async function FeaturedProducts({ settings, context }: SectionProps<Settings>) {
  const { items } = await context.data.getProducts({ collection: settings.collection, limit: 8 });
  return <ProductGrid products={items} />;
}
```

Each section also has a **schema** describing its settings, its block types, which templates it may be added to, and the presets shown in the "Add section" picker. The schema is what powers the customizer's sidebar.

#### Templates and groups

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

#### ThemeConfig: the merchant's document

Everything a merchant changes in the customizer is saved as one JSON document. Section instances are keyed by a stable id, and `order` controls rendering order:

<sub>`store_themes.config`</sub>

```json
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

### The theme lifecycle

1. **Scaffold** a theme with `pnpm theme:new` — see [Theme CLI](https://paicommerce.com/docs/themes/cli).
2. **Develop** locally against a demo store at `http://<slug>-demo.localhost:3003` — see [Local development](https://paicommerce.com/docs/themes/local-development).
3. **Validate** with `node tools/create-theme/validate.mjs <slug>` — see [Validation](https://paicommerce.com/docs/themes/validation).
4. **Polish** using the [performance & accessibility checklist](https://paicommerce.com/docs/themes/checklist).
5. **Submit** to the Theme Store for review and start earning 70% of every sale — see [Submitting](https://paicommerce.com/docs/themes/submitting).

### Where to go next

- [Theme structure](https://paicommerce.com/docs/themes/structure) — the files in a theme package.
- [Sections](https://paicommerce.com/docs/themes/sections) — the complete `SectionSchema` reference with a real-world example.
- [Settings reference](https://paicommerce.com/docs/themes/settings) — every setting type, with examples.
- [Storefront context](https://paicommerce.com/docs/themes/context) — the data available to your sections.

---

## Theme CLI

`pnpm theme:new` creates a new theme package in `themes/<slug>`, built on [`@pai/theme-kit`](https://paicommerce.com/docs/themes/theme-kit), and registers it in `@pai/theme-registry` so the storefront, dashboard and marketing site can load it. It uses only Node built-ins (Node 20+), and the CLI lives in `tools/create-theme/index.mjs`.

### Create a theme

Run it without arguments for interactive prompts:

```bash
$ pnpm theme:new
```

Or pass everything as flags:

```bash
$ pnpm theme:new monsoon --name "Monsoon" --categories fashion,beauty --price 4900 --author "Rahim Studio"
```

Then link the new workspace package and validate it:

```bash
$ pnpm install
$ node tools/create-theme/validate.mjs monsoon
```

### Options

| Flag | Description |
| --- | --- |
| `[slug]` | Folder and package id. Must match `/^[a-z0-9][a-z0-9-]{1,40}$/` and not already exist in `themes/`. |
| `--name <name>` | Display name. Defaults to the Title Case of the slug. |
| `--categories <ids>` | Comma-separated [business categories](https://paicommerce.com/docs/themes/manifest#business-categories). The **first one is the primary** category: it drives the default palette and home page. In interactive mode you can also type numbers from the list. |
| `--price <taka>` | Theme Store price in **taka** (major units, e.g. `4900`). `0` = free (default). The CLI converts it to minor units for the manifest (`490000`). |
| `--author <name>` | Author or studio name. Defaults to your `git config user.name`. |
| `--tagline <text>` | One-line Theme Store tagline. |
| `--dry-run` | Print the file tree and registry diffs without writing anything. |
| `-y`, `--yes` | Don't ask for confirmation; use defaults for anything missing. |
| `--no-register` | Don't add the theme to `packages/theme-registry`. |
| `--interactive` | Prompt for missing values even when stdin is not a TTY. |
| `-h`, `--help` | Show help. |

### Preview with `--dry-run`

```bash
$ pnpm theme:new monsoon --categories fashion,beauty --price 4900 --dry-run
```

```text
◆ PaiCommerce theme scaffolder  [dry run]

  slug        monsoon  → themes/monsoon, @pai-theme/monsoon
  name        Monsoon
  tagline     A fast, flexible theme for fashion, beauty stores
  categories  fashion, beauty
  price       ৳4,900 (490000 minor units)
  author      Rahim Studio
  register    yes (packages/theme-registry)

Files that would be created:

themes/monsoon/
  package.json
  README.md
  src/
    index.ts
    manifest.ts
    presets.ts
    sections/
      promo-banner.tsx
    settings.ts
  tsconfig.json

Registry changes:

packages/theme-registry/src/index.ts
+   monsoon: () => import("@pai-theme/monsoon").then((m) => m.default),

packages/theme-registry/src/manifests.ts
+ import { manifest as monsoon } from "@pai-theme/monsoon/manifest";
+ export const manifests: ThemeManifest[] = [aurora, …, pulse, monsoon];

packages/theme-registry/package.json
+     "@pai-theme/monsoon": "workspace:*"

Dry run — nothing was written. Re-run without --dry-run to create the theme.
```

### What gets generated

| File | Contents |
| --- | --- |
| `package.json` | `@pai-theme/<slug>` with `exports` for `.` and `./manifest`, `typecheck` and `validate` scripts, dependencies on `@pai/theme-sdk` and `@pai/theme-kit`. |
| `tsconfig.json` | Extends the repo's `tsconfig.base.json`. |
| `README.md` | Structure, development workflow, the pre-submit checklist and submission steps. |
| `src/manifest.ts` | Your [manifest](https://paicommerce.com/docs/themes/manifest): version `0.1.0`, categories, price in minor units, a placeholder Unsplash thumbnail (replace it before submitting). |
| `src/settings.ts` | `settingsDefaults` (brand colours, fonts, radius…) and `extraSettings` merged into the kit's schema with `extendSettingsSchema`. |
| `src/presets.ts` | Three presets for the primary category: the signature look, a dark "Midnight" variant and a warm "Soft" variant. |
| `src/sections/promo-banner.tsx` | A complete example section (`<slug>-promo-banner`): heading, CTA, image, colour scheme and "perk" blocks, two section presets. |
| `src/index.ts` | `createBaseTheme({ manifest, sections, settingsSchema, settingsDefaults, defaultConfig, presets, css })` — inserts the promo banner after the hero on the home page, and puts your presets first. |

The generated `src/index.ts` looks like this (abridged):

<sub>`themes/monsoon/src/index.ts`</sub>

```ts
import { createBaseTheme, sectionList } from "@pai/theme-kit";
import { manifest } from "./manifest";
import { settingsDefaults, settingsSchema } from "./settings";
import { presets } from "./presets";
import { promoBanner } from "./sections/promo-banner";

export default createBaseTheme({
  manifest,
  // Custom sections. A section whose schema.type matches a kit section replaces it.
  sections: [promoBanner],
  settingsSchema,
  settingsDefaults,
  // Home page: kit default for the primary category + the promo banner after the hero.
  defaultConfig: (base) => ({
    ...base,
    templates: { ...base.templates, index: insertAfter(base.templates.index, "hero-banner", promo) },
  }),
  // Our presets first, then the kit's presets for any secondary categories.
  presets: (kitPresets) => [...presets, ...kitPresets.filter((p) => p.category !== manifest.categories[0])],
  css,
});
```

> [!TIP]
> Prefix your own section types with the theme slug (the generated banner is `monsoon-promo-banner`). Kit section types like `hero-banner` are shared by every theme; a section with the same type **replaces** the kit's version, which is useful when intended and confusing when not.

### Registration

Unless you pass `--no-register`, the CLI edits three files so your theme is loadable:

- `packages/theme-registry/src/index.ts` — adds a lazy loader to `themeLoaders`.
- `packages/theme-registry/src/manifests.ts` — imports your manifest and appends it to `manifests`.
- `packages/theme-registry/package.json` — adds `"@pai-theme/<slug>": "workspace:*"`.

Re-running for an already registered slug leaves these files unchanged. **Run `pnpm install` afterwards** to create the workspace link — until you do, imports of `@pai-theme/<slug>` fail with "Module not found".

### Next steps printed by the CLI

```text
Next steps
  1. pnpm install                                link the new @pai-theme/monsoon workspace package
  2. node tools/create-theme/validate.mjs monsoon   check sections, templates & presets
  3. pnpm dev                                    start all apps
  4. open http://localhost:3001                  → Themes → add “Monsoon” and customize
  5. read http://localhost:3000/docs/themes      theme developer docs (also docs/THEME_GUIDE.md)
```

Start editing with `src/settings.ts`, `src/presets.ts` and `src/sections/promo-banner.tsx`. See [Local development](https://paicommerce.com/docs/themes/local-development) for the day-to-day workflow.

### Validate

```bash
$ node tools/create-theme/validate.mjs monsoon            # one theme
$ node tools/create-theme/validate.mjs monsoon aurora     # several
$ node tools/create-theme/validate.mjs --all              # every theme in /themes
$ pnpm --filter @pai-theme/monsoon validate               # the same, via the theme's script
```

The validator loads your theme through `tsx` and runs `validateTheme` from `@pai/theme-sdk` plus extra Theme Store checks. See [Validation](https://paicommerce.com/docs/themes/validation) for every rule, the `--json` and `--strict` flags and exit codes.

---

## Theme structure

A theme is a workspace package in `themes/<slug>`, named `@pai-theme/<slug>`. It ships TypeScript source — no build step — and is transpiled by the storefront, dashboard and marketing site.

### Directory layout

```text
themes/monsoon/
├── package.json            # @pai-theme/monsoon — exports "." and "./manifest"
├── tsconfig.json
├── README.md               # what the theme is, sections list, changelog
└── src/
    ├── index.ts            # default export: the ThemeDefinition
    ├── manifest.ts         # Theme Store listing (pure data, no React)
    ├── settings.ts         # global settings schema (SettingsGroup[])
    ├── presets.ts          # ThemePreset[] — one per business category
    └── sections/
        ├── promo-banner/
        │   ├── index.tsx       # defineSection({ schema, component })
        │   └── countdown.tsx   # "use client" island
        ├── featured-products.tsx
        └── …
```

Larger themes typically add `src/components/` (shared UI such as a product card), `src/layout.tsx` (a custom `Layout`) and `src/styles.ts` (the theme CSS string).

### package.json

<sub>`themes/monsoon/package.json`</sub>

```json
{
  "name": "@pai-theme/monsoon",
  "version": "1.0.0",
  "description": "Monsoon — Bold, mobile-first storefront for fashion drops",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./manifest": "./src/manifest.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "validate": "node ../../tools/create-theme/validate.mjs monsoon"
  },
  "dependencies": {
    "@pai/theme-sdk": "workspace:*",
    "@pai/theme-kit": "workspace:*"
  },
  "peerDependencies": { "react": "^19.0.0" },
  "devDependencies": { "@types/react": "^19.0.0", "react": "^19.3.0", "lucide-react": "^1.47.0", "typescript": "5.9.3" }
}
```

- **`exports["./manifest"]`** is required: the marketing site, the admin panel and the seed script import manifests without loading any React code.
- **Dependencies** are limited to `@pai/theme-sdk`, `@pai/theme-kit` and peer `react`. Icons from `lucide-react` are available. Other third-party runtime dependencies are not accepted in Theme Store themes — see [review guidelines](https://paicommerce.com/docs/themes/submitting#review-guidelines).

### The theme definition

`src/index.ts` default-exports a `ThemeDefinition`:

```ts
type ThemeDefinition = {
  manifest: ThemeManifest;
  settingsSchema: SettingsGroup[];
  sections: SectionDefinition<any>[];
  defaultConfig: ThemeConfig;
  presets?: ThemePreset[];
  /** Optional layout wrapper. Defaults to header → main → footer. */
  Layout?: ComponentType<ThemeLayoutProps>;
  /** Theme-level CSS, scoped under `.pai-theme-<slug>`. */
  css?: string;
  /** Map global settings → CSS custom properties. Defaults to `defaultCssVariables`. */
  cssVariables?: (settings: SettingValues) => Record<string, string>;
  /** Setting ids of `font` fields whose Google Fonts should be loaded. */
  fontSettings?: string[];
};
```

| Field | Page |
| --- | --- |
| `manifest` | [Manifest](https://paicommerce.com/docs/themes/manifest) |
| `settingsSchema` | [Settings reference](https://paicommerce.com/docs/themes/settings) |
| `sections` | [Sections](https://paicommerce.com/docs/themes/sections), [Blocks](https://paicommerce.com/docs/themes/blocks) |
| `defaultConfig` | [below](#default-config) |
| `presets` | [Presets](https://paicommerce.com/docs/themes/presets) |
| `css`, `cssVariables`, `fontSettings` | [Styling](https://paicommerce.com/docs/themes/styling) |
| `Layout` | [below](#custom-layout) |

#### Default config

`defaultConfig` is the `ThemeConfig` a store gets before the merchant edits anything. It must reference only section types your theme defines, and must include at least the `index`, `product`, `collection` and `cart` templates:

```ts
defaultConfig: {
  settings: {}, // global settings: empty = use schema defaults
  groups: {
    header: { order: ["announcement", "header"], sections: { announcement: { type: "announcement-bar", settings: {} }, header: { type: "header", settings: {} } } },
    footer: { order: ["footer"], sections: { footer: { type: "footer", settings: {} } } },
  },
  templates: {
    index: {
      order: ["hero", "best_sellers"],
      sections: {
        hero: {
          type: "promo-banner",
          settings: { heading: "Eid Collection is live", height: "lg" },
          blocks: [{ id: "b_badge", type: "badge", settings: { text: "New season" } }],
        },
        best_sellers: { type: "featured-products", settings: { heading: "Best sellers", limit: 8 } },
      },
    },
    product: { order: ["main"], sections: { main: { type: "main-product", settings: {} } } },
    collection: { order: ["main"], sections: { main: { type: "main-collection", settings: {} } } },
    cart: { order: ["main"], sections: { main: { type: "main-cart", settings: {} } } },
  },
},
```

Section instance keys (`hero`, `best_sellers`, `main`) are ids — any string unique within that list. Keep them short and readable in hand-written configs; the customizer generates `s_…` ids for sections merchants add.

#### Custom layout

By default the storefront renders `header group → <main> template sections → footer group`. Provide `Layout` to wrap them differently — for example to add a sticky mobile bottom bar or a cart drawer that lives outside `<main>`:

<sub>`themes/monsoon/src/layout.tsx`</sub>

```tsx
import type { ThemeLayoutProps } from "@pai/theme-sdk";

export function Layout({ context, header, footer, children }: ThemeLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--pai-bg)] font-[family-name:var(--pai-font-body)] text-[var(--pai-fg)]">
      {header}
      <main id="main" className="flex-1">
        {children}
      </main>
      {footer}
      {context.store.showBranding && (
        <p className="py-4 text-center text-xs opacity-60">
          Powered by <a href="https://paicommerce.com">PaiCommerce</a>
        </p>
      )}
    </div>
  );
}
```

### Registering the theme

The storefront discovers themes through `@pai/theme-registry`. A theme must be added in three places (the [Theme CLI](https://paicommerce.com/docs/themes/cli) does this for you):

<sub>`packages/theme-registry/src/index.ts`</sub>

```ts
export const themeLoaders: Record<string, () => Promise<ThemeDefinition>> = {
  // …
  monsoon: () => import("@pai-theme/monsoon").then((m) => m.default),
};
```

<sub>`packages/theme-registry/src/manifests.ts`</sub>

```ts
import { manifest as monsoon } from "@pai-theme/monsoon/manifest";

export const manifests: ThemeManifest[] = [/* …, */ monsoon];
```

<sub>`packages/theme-registry/package.json`</sub>

```json
{
  "dependencies": {
    "@pai-theme/monsoon": "workspace:*"
  }
}
```

Then run `pnpm install` so the workspace link is created. The Next.js apps pick up every package in `themes/` automatically for transpilation — no config change needed.

---

## Theme manifest

The manifest is pure data: it describes your theme's listing on the Theme Store and is imported by the marketing site, the admin review queue and the seed script **without loading any React code**. That's why it lives in its own file and is exposed as a separate package export.

<sub>`themes/monsoon/src/manifest.ts`</sub>

```ts
import type { ThemeManifest } from "@pai/theme-sdk";

export const manifest: ThemeManifest = {
  slug: "monsoon",
  name: "Monsoon",
  version: "1.0.0",
  tagline: "Bold, mobile-first storefront for fashion drops",
  description:
    "A fast, image-led theme for apparel and lifestyle brands selling on Facebook and Instagram. Campaign banners with countdowns, lookbooks and a sticky mobile add-to-cart.",
  author: { name: "Rahim Studio", url: "https://rahim.studio", email: "hello@rahim.studio" },
  categories: ["fashion", "beauty"],
  tags: ["minimal", "mobile-first", "campaigns"],
  price: 490000, // ৳4,900 in poisha (minor units)
  thumbnail: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
  screenshots: [],
  features: ["Campaign banners with countdown", "Lookbook", "Sticky add to cart", "Bangla-ready typography"],
  supportUrl: "https://rahim.studio/support",
  docsUrl: "https://rahim.studio/monsoon/docs",
  sdk: "1.0.0",
};
```

And in `package.json`, expose it as `./manifest`:

<sub>`themes/monsoon/package.json`</sub>

```json
{
  "name": "@pai-theme/monsoon",
  "exports": {
    ".": "./src/index.ts",
    "./manifest": "./src/manifest.ts"
  }
}
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `slug` | `string` | Yes | Unique, URL-safe id. Lowercase kebab-case, 2–41 characters (`/^[a-z0-9][a-z0-9-]{1,40}$/`). Must match the Theme Store `themes.slug` and your folder name. **Never change it after publishing.** |
| `name` | `string` | Yes | Display name, e.g. `"Monsoon"`. |
| `version` | `string` | Yes | Semantic version (`1.4.2`). Bump it for every submission — see [versioning](https://paicommerce.com/docs/themes/submitting#versioning). |
| `tagline` | `string` | Yes | One line shown on theme cards (≈ 60 characters). |
| `description` | `string` | Yes | A paragraph for the theme detail page. |
| `author` | `{ name; url?; email? }` | Yes | Shown as "by …" on the listing. |
| `categories` | `BusinessCategory[]` | Yes | At least one. Drives Theme Store filters and onboarding recommendations. |
| `tags` | `string[]` | No | Free-form style keywords (`minimal`, `dark`, `bold`). |
| `price` | `number` | Yes | Price in **BDT minor units** (poisha). `0` = free. `490000` = ৳4,900. |
| `thumbnail` | `string` | Recommended | 16:10 image, at least 1600 px wide. Validation warns if missing. |
| `screenshots` | `string[]` | No | Additional desktop/mobile screenshots for the detail page. |
| `features` | `string[]` | No | Bullet list of highlights ("Mega menu", "Quick view"). |
| `supportUrl` | `string` | Paid themes | Where merchants get help. Required for review of paid themes. |
| `docsUrl` | `string` | No | Your theme's own merchant documentation. |
| `sdk` | `string` | No | Minimum `@pai/theme-sdk` version the theme supports, e.g. `"1.0.0"`. |

### Business categories

`categories` must use ids from `BUSINESS_CATEGORIES` (exported by `@pai/theme-sdk`):

| id | Label |
| --- | --- |
| `fashion` | Fashion & Apparel |
| `electronics` | Electronics & Gadgets |
| `grocery` | Grocery & Supermarket |
| `beauty` | Beauty & Cosmetics |
| `home` | Home, Furniture & Decor |
| `food` | Food, Restaurant & Bakery |
| `jewelry` | Jewelry & Accessories |
| `health` | Health, Pharmacy & Wellness |
| `kids` | Kids, Baby & Toys |
| `sports` | Sports, Fitness & Outdoor |
| `books` | Books, Stationery & Education |
| `digital` | Digital Products & Courses |
| `handicraft` | Handicrafts & Art |
| `automotive` | Automotive & Tools |
| `pets` | Pet Supplies |
| `gifts` | Gifts & Flowers |
| `general` | General Store / Multi-category |

List the categories your theme is genuinely designed for — reviewers check that your presets and demo content match. A grocery store needs a very different product card from a fashion brand.

### Pricing

Prices are integers in **poisha** (1 BDT = 100 poisha), exactly like every other amount in PaiCommerce:

| Listing price | `price` value |
| --- | --- |
| Free | `0` |
| ৳2,500 | `250000` |
| ৳4,900 | `490000` |
| ৳9,900 | `990000` |

Merchants pay once per store and get free updates for that major version. You receive **70%** of the sale price; see [Submitting](https://paicommerce.com/docs/themes/submitting#revenue-share-and-payouts).

> [!NOTE]
> The listing price in the Theme Store is taken from the `themes` table, which is populated from your manifest when your submission is approved. Changing `price` in a later version is treated as a price change and needs reviewer approval.

---

## Settings reference

Settings are the inputs merchants see in the customizer. The same `SettingField` type is used in three places:

- **Global theme settings** — `ThemeDefinition.settingsSchema`, grouped into panels (`SettingsGroup[]`).
- **Section settings** — `SectionSchema.settings`.
- **Block settings** — `BlockSchema.settings`.

Every field (except `header`) has this shape:

```ts
type BaseField<T extends string, V> = {
  type: T;
  id: string; // unique within the section / block / theme settings
  label: string; // shown above the input
  default?: V; // value used when the merchant hasn't set one
  info?: string; // helper text shown under the input
};
```

At render time, values missing from the stored config are filled in with `default` — or, when there is no default, with a type-specific fallback (see the table below). Your component therefore always receives a complete settings object.

### Field types at a glance

| Type | Value | Fallback when no `default` | Extra options |
| --- | --- | --- | --- |
| `text` | `string` | `""` | `placeholder` |
| `textarea` | `string` | `""` | `placeholder` |
| `richtext` | `string` (HTML) | `""` | |
| `url` | `string` | `""` | `placeholder` |
| `image` | `string` (URL) | `""` | |
| `video` | `string` (URL) | `""` | |
| `color` | `string` (`#rrggbb`) | `""` | |
| `range` | `number` | `min` | `min`, `max`, `step?`, `unit?` |
| `number` | `number` | `min ?? 0` | `min?`, `max?` |
| `select` | `string` | first option's `value` | `options` |
| `radio` | `string` | first option's `value` | `options` |
| `checkbox` | `boolean` | `false` | |
| `font` | `string` (family name) | `""` | `options?` |
| `product` | `string` (product slug) | `""` | |
| `collection` | `string` (collection slug) | `""` | |
| `product_list` | `string[]` (product slugs) | `[]` | `limit?` |
| `menu` | `string` (menu handle) | `""` | |
| `datetime` | `string` (ISO 8601) | `""` | |
| `header` | — (visual divider) | — | `label`, `info?` |

> [!TIP]
> Always give fields a sensible `default`. A section added from the "Add section" picker should look finished immediately — merchants judge a theme in the first 30 seconds of the customizer.

### Text inputs

#### text

A single-line text input. Use it for headings, button labels and short captions.

```ts
{ type: "text", id: "heading", label: "Heading", default: "Eid Collection is live", placeholder: "Your headline" }
```

#### textarea

A multi-line plain-text input. Line breaks are preserved in the value — render with `whitespace-pre-line` if they matter.

```ts
{ type: "textarea", id: "subheading", label: "Subheading", default: "Up to 40% off. Free delivery inside Dhaka." }
```

#### richtext

A rich-text editor that produces **HTML** (paragraphs, bold, italic, links, lists). Render it with `dangerouslySetInnerHTML` inside a typographic wrapper, and sanitise it first — `sanitizeHtml` from `@pai/theme-kit` strips scripts, event handlers and `javascript:` URLs.

```ts
{ type: "richtext", id: "body", label: "Text", default: "<p>Handwoven in Tangail by master weavers.</p>" }
```

```tsx
import { sanitizeHtml } from "@pai/theme-kit";

<div className="prose" dangerouslySetInnerHTML={{ __html: sanitizeHtml(settings.body) }} />;
```

#### url

A link input. The value is either an absolute URL (`https://facebook.com/…`) or a **store-relative path** such as `/collections/eid-sale` or `/pages/about`.

```ts
{ type: "url", id: "cta_link", label: "Button link", placeholder: "/collections/eid-sale" }
```

> [!WARNING]
> Pass link values through `context.url()` before rendering them, so store-relative paths work on subdomains, custom domains **and** the `/s/<slug>` path fallback. Absolute URLs pass through unchanged: `href={context.url(settings.cta_link || "/collections/all")}`. (`resolveHref` from `@pai/theme-kit` does the same with a fallback.)

### Media

#### image

An image picker backed by the store's media library. The value is an absolute URL. Always render a meaningful `alt` (usually from a sibling text setting, or `""` for decorative images).

```ts
{ type: "image", id: "image", label: "Background image", info: "2400 × 1200 px recommended" }
```

#### video

A video URL — an uploaded MP4/WebM file or a YouTube/Vimeo link. `isVideoFile(url)` and `embedUrl(url, opts)` from `@pai/theme-kit` tell them apart and build privacy-friendly embed URLs.

```ts
{ type: "video", id: "video", label: "Video", info: "MP4 upload or a YouTube / Vimeo link" }
```

### Choices

#### select

A dropdown. Use it for more than three options.

```ts
{
  type: "select",
  id: "height",
  label: "Height",
  default: "md",
  options: [
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Large" },
  ],
}
```

#### radio

A segmented control. Best for two or three short options.

```ts
{
  type: "radio",
  id: "alignment",
  label: "Text alignment",
  default: "left",
  options: [
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
  ],
}
```

#### checkbox

A toggle. The value is always a boolean (`false` when unset).

```ts
{ type: "checkbox", id: "show_countdown", label: "Show countdown timer", default: false }
```

### Numbers

#### range

A slider. `min` and `max` are required; `step` defaults to 1, and `unit` is displayed next to the value (`px`, `%`, `s`).

```ts
{ type: "range", id: "overlay_opacity", label: "Image overlay", min: 0, max: 80, step: 5, unit: "%", default: 35 }
```

#### number

A free numeric input with optional bounds. Prefer `range` when the useful interval is small.

```ts
{ type: "number", id: "free_shipping_threshold", label: "Free delivery threshold (৳)", min: 0, default: 2000 }
```

> [!NOTE]
> Settings values are what the merchant typed. If you store a *money* amount in a `number` setting, document whether it's in taka or poisha. The convention in PaiCommerce themes is **taka** for merchant-entered values (multiply by 100 before comparing with `SfProduct.price`).

### Design

#### color

A colour picker. Values are hex strings (`#0f766e`). For global colours, use the [standard ids](#standard-global-settings-and-css-variables) so they become CSS variables automatically.

```ts
{ type: "color", id: "text_color", label: "Text color", default: "#ffffff" }
```

#### font

A Google Fonts family picker. Pass `options` to restrict the list — `FONT_CHOICES` from `@pai/theme-sdk` is a curated list of 32 families that render well in English **and** Bangla (including *Hind Siliguri*).

```ts
import { FONT_CHOICES } from "@pai/theme-sdk";

{ type: "font", id: "font_heading", label: "Heading font", default: "Poppins", options: FONT_CHOICES }
```

List the setting ids of your font fields in `ThemeDefinition.fontSettings` so the storefront loads them — see [Styling](https://paicommerce.com/docs/themes/styling#fonts).

### Store resources

Resource pickers store **slugs/handles**, never database ids, so configs remain portable between a demo store and a merchant's store. Resolve them at render time through `context.data`.

#### product

A single product picker (value: product slug).

```ts
{ type: "product", id: "product", label: "Featured product" }
```

```tsx
const product = settings.product ? await context.data.getProduct(settings.product) : null;
```

#### collection

A single collection picker (value: collection slug).

```ts
{ type: "collection", id: "collection", label: "Collection", info: "Leave empty to show best sellers." }
```

```tsx
const { items } = await context.data.getProducts({ collection: settings.collection || undefined, limit: 8 });
```

#### product_list

A multi-product picker (value: `string[]` of slugs). `limit` caps how many can be chosen.

```ts
{ type: "product_list", id: "products", label: "Products", limit: 6 }
```

```tsx
const { items } = await context.data.getProducts({ slugs: settings.products, limit: settings.products.length });
```

#### menu

A navigation menu picker (value: menu handle such as `main-menu` or `footer`). Merchants manage menus under **Online store → Navigation**.

```ts
{ type: "menu", id: "menu", label: "Menu", default: "main-menu" }
```

```tsx
const items = await context.data.getMenu(settings.menu); // SfMenuItem[] (with children)
```

#### datetime

A date & time picker. The value is an ISO 8601 string — convenient for countdowns and scheduled announcements.

```ts
{ type: "datetime", id: "ends_at", label: "Offer ends at", info: "Uses the shopper's local time zone." }
```

### Organising fields

#### header

Not an input: renders a heading that groups the fields below it in the customizer. It has no `id` and produces no value.

```ts
{ type: "header", label: "Countdown", info: "Show a timer until the offer ends." }
```

#### Global settings groups

Global settings are grouped into panels — each `SettingsGroup` becomes a collapsible section in the customizer's **Theme settings** tab:

<sub>`themes/monsoon/src/settings.ts`</sub>

```ts
import { FONT_CHOICES, type SettingsGroup } from "@pai/theme-sdk";

export const settingsSchema: SettingsGroup[] = [
  {
    name: "Colors",
    settings: [
      { type: "color", id: "color_background", label: "Background", default: "#ffffff" },
      { type: "color", id: "color_foreground", label: "Text", default: "#18181b" },
      { type: "color", id: "color_primary", label: "Buttons", default: "#0f766e" },
      { type: "color", id: "color_primary_foreground", label: "Button text", default: "#ffffff" },
      { type: "color", id: "color_accent", label: "Accent", default: "#f59e0b" },
      { type: "color", id: "color_muted", label: "Muted background", default: "#f4f4f5" },
      { type: "color", id: "color_border", label: "Borders", default: "#e4e4e7" },
      { type: "color", id: "color_sale", label: "Sale price", default: "#dc2626" },
    ],
  },
  {
    name: "Typography",
    settings: [
      { type: "font", id: "font_heading", label: "Heading font", default: "Poppins", options: FONT_CHOICES },
      { type: "font", id: "font_body", label: "Body font", default: "Inter", options: FONT_CHOICES },
      { type: "range", id: "heading_scale", label: "Heading size", min: 80, max: 130, step: 5, unit: "%", default: 100 },
    ],
  },
  {
    name: "Layout",
    settings: [
      { type: "range", id: "container_width", label: "Page width", min: 1024, max: 1600, step: 16, unit: "px", default: 1280 },
      { type: "range", id: "section_spacing", label: "Space between sections", min: 24, max: 128, step: 8, unit: "px", default: 72 },
      { type: "range", id: "radius", label: "Corner radius", min: 0, max: 24, step: 1, unit: "px", default: 10 },
      { type: "range", id: "button_radius", label: "Button radius", min: 0, max: 32, step: 1, unit: "px", default: 999 },
    ],
  },
  {
    name: "Cart & checkout",
    settings: [
      { type: "checkbox", id: "cart_drawer", label: "Open cart drawer after adding to cart", default: true },
      { type: "number", id: "free_shipping_threshold", label: "Free delivery threshold (৳)", min: 0, default: 2000, info: "Shows a progress bar in the cart. 0 hides it." },
    ],
  },
];
```

Resolved global settings are available to every section as `context.theme`:

```tsx
const drawer = context.theme.cart_drawer === true;
```

### Standard global settings and CSS variables

Global settings with these ids are mapped to CSS custom properties by `defaultCssVariables` and emitted on the theme's root element. Use them in your components instead of hard-coded colours so presets and merchant edits restyle every section at once.

| Setting id | CSS variable | Fallback |
| --- | --- | --- |
| `color_background` | `--pai-bg` (+ `--pai-bg-rgb`) | `#ffffff` |
| `color_foreground` | `--pai-fg` (+ `--pai-fg-rgb`) | `#111111` |
| `color_primary` | `--pai-primary` (+ `--pai-primary-rgb`) | `#111111` |
| `color_primary_foreground` | `--pai-primary-fg` (+ `--pai-primary-fg-rgb`) | `#ffffff` |
| `color_accent` | `--pai-accent` (+ `--pai-accent-rgb`) | `#e11d48` |
| `color_muted` | `--pai-muted` (+ `--pai-muted-rgb`) | `#f5f5f4` |
| `color_border` | `--pai-border` (+ `--pai-border-rgb`) | `#e7e5e4` |
| `color_sale` | `--pai-sale` (+ `--pai-sale-rgb`) | `#dc2626` |
| `font_heading` | `--pai-font-heading` | `"Inter", ui-sans-serif, system-ui, sans-serif` |
| `font_body` | `--pai-font-body` | `"Inter", ui-sans-serif, system-ui, sans-serif` |
| `radius` | `--pai-radius` | `8px` |
| `button_radius` | `--pai-button-radius` | value of `radius`, else `8px` |
| `container_width` | `--pai-container` | `1280px` |
| `heading_scale` | `--pai-heading-scale` | `1` (the setting is a percentage: `110` → `1.1`) |
| `section_spacing` | `--pai-section-spacing` | `64px` |

Each colour also gets an `-rgb` variant containing a space-separated triplet (`15 118 110`), so you can apply opacity: `rgb(var(--pai-primary-rgb) / 0.12)`.

See [Styling & design tokens](https://paicommerce.com/docs/themes/styling) for how to use them with Tailwind and how to add your own variables.

---

## Sections

A **section** is a full-width, reorderable building block of a page: a hero banner, a product grid, testimonials, the main product area. Merchants add, remove, reorder and configure sections in the customizer; you define what each section *can* be.

A section is created with `defineSection` and has two parts:

- **`component`** — a React component (usually a Server Component) that receives `SectionProps`.
- **`schema`** — a `SectionSchema` describing its settings, blocks, where it can be used and how it appears in the "Add section" picker.

### A complete example: promo banner

This is the section used throughout the theme docs. It shows text settings, an image, select/radio/range/color/checkbox/datetime inputs, two block types, template restrictions, and two presets.

<sub>`themes/monsoon/src/sections/promo-banner/index.tsx`</sub>

```tsx
import { defineSection, type SectionProps } from "@pai/theme-sdk";
import { Countdown } from "./countdown";

type PromoBannerSettings = {
  heading: string;
  subheading: string;
  image: string;
  cta_label: string;
  cta_link: string;
  alignment: "left" | "center";
  height: "sm" | "md" | "lg";
  overlay_opacity: number;
  text_color: string;
  show_countdown: boolean;
  ends_at: string;
};

type BadgeSettings = { text: string; style: "solid" | "outline" };
type PerkSettings = { icon: "truck" | "cash" | "return" | "shield"; title: string };

const HEIGHT = { sm: "min-h-[320px]", md: "min-h-[460px]", lg: "min-h-[620px]" } as const;
const ICON = { truck: "🚚", cash: "💵", return: "↩️", shield: "🛡️" } as const;

function PromoBanner({ id, settings, blocks, context }: SectionProps<PromoBannerSettings>) {
  const badges = blocks.filter((b) => b.type === "badge");
  const perks = blocks.filter((b) => b.type === "perk");
  const centered = settings.alignment === "center";
  // Store-relative links must go through context.url() so they work on subdomains,
  // custom domains and the /s/<slug> path fallback. Absolute URLs are used as-is.
  const link = settings.cta_link || "/collections";
  const href = link.startsWith("/") ? context.url(link) : link;

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className={`relative isolate flex items-center overflow-hidden ${HEIGHT[settings.height]}`}
      style={{ color: settings.text_color }}
    >
      {settings.image ? (
        <img src={settings.image} alt="" className="absolute inset-0 -z-20 size-full object-cover" fetchPriority="high" />
      ) : (
        <div className="absolute inset-0 -z-20 bg-[var(--pai-primary)]" aria-hidden />
      )}
      <div className="absolute inset-0 -z-10 bg-black" style={{ opacity: settings.overlay_opacity / 100 }} aria-hidden />

      <div className={`mx-auto w-full max-w-[var(--pai-container)] px-4 py-16 ${centered ? "text-center" : ""}`}>
        {badges.length > 0 && (
          <div className={`mb-4 flex flex-wrap gap-2 ${centered ? "justify-center" : ""}`}>
            {badges.map((block) => {
              const b = block.settings as BadgeSettings;
              return (
                <span
                  key={block.id}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                    b.style === "solid" ? "bg-[var(--pai-accent)] text-white" : "border border-current"
                  }`}
                >
                  {b.text}
                </span>
              );
            })}
          </div>
        )}

        <h2 id={`${id}-heading`} className="max-w-2xl font-[family-name:var(--pai-font-heading)] text-4xl font-bold md:text-6xl" style={centered ? { marginInline: "auto" } : undefined}>
          {settings.heading || (context.isPreview ? "Add a heading" : "")}
        </h2>
        {settings.subheading && <p className="mt-4 max-w-xl text-lg opacity-90" style={centered ? { marginInline: "auto" } : undefined}>{settings.subheading}</p>}

        {settings.cta_label && (
          <a href={href} className="mt-8 inline-flex h-12 items-center rounded-[var(--pai-button-radius)] bg-[var(--pai-primary)] px-7 font-semibold text-[var(--pai-primary-fg)]">
            {settings.cta_label}
          </a>
        )}

        {settings.show_countdown && settings.ends_at && <Countdown endsAt={settings.ends_at} label="Offer ends in" />}

        {perks.length > 0 && (
          <ul className={`mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm ${centered ? "justify-center" : ""}`}>
            {perks.map((block) => {
              const p = block.settings as PerkSettings;
              return (
                <li key={block.id} className="flex items-center gap-2">
                  <span aria-hidden>{ICON[p.icon]}</span>
                  {p.title}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

export default defineSection<PromoBannerSettings>({
  component: PromoBanner,
  schema: {
    type: "promo-banner",
    name: "Promo banner",
    description: "Full-width campaign banner with badges, perks and an optional countdown.",
    category: "marketing",
    icon: "Megaphone",
    settings: [
      { type: "header", label: "Content" },
      { type: "text", id: "heading", label: "Heading", default: "Eid Collection is live" },
      { type: "textarea", id: "subheading", label: "Subheading", default: "Up to 40% off. Free delivery inside Dhaka on orders over ৳2,000." },
      { type: "text", id: "cta_label", label: "Button label", default: "Shop the sale" },
      { type: "url", id: "cta_link", label: "Button link", placeholder: "/collections/eid-sale", info: "Leave empty to link to all collections." },
      { type: "header", label: "Design" },
      { type: "image", id: "image", label: "Background image" },
      {
        type: "select",
        id: "height",
        label: "Height",
        default: "md",
        options: [
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
        ],
      },
      {
        type: "radio",
        id: "alignment",
        label: "Text alignment",
        default: "left",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
        ],
      },
      { type: "range", id: "overlay_opacity", label: "Image overlay", min: 0, max: 80, step: 5, unit: "%", default: 35 },
      { type: "color", id: "text_color", label: "Text color", default: "#ffffff" },
      { type: "header", label: "Countdown" },
      { type: "checkbox", id: "show_countdown", label: "Show countdown timer", default: false },
      { type: "datetime", id: "ends_at", label: "Offer ends at", info: "Uses the shopper's local time zone." },
    ],
    blocks: [
      {
        type: "badge",
        name: "Badge",
        limit: 3,
        settings: [
          { type: "text", id: "text", label: "Text", default: "Limited time" },
          {
            type: "select",
            id: "style",
            label: "Style",
            default: "solid",
            options: [
              { value: "solid", label: "Solid" },
              { value: "outline", label: "Outline" },
            ],
          },
        ],
      },
      {
        type: "perk",
        name: "Perk",
        limit: 4,
        settings: [
          {
            type: "select",
            id: "icon",
            label: "Icon",
            default: "truck",
            options: [
              { value: "truck", label: "Delivery" },
              { value: "cash", label: "Cash on delivery" },
              { value: "return", label: "Easy returns" },
              { value: "shield", label: "Secure payment" },
            ],
          },
          { type: "text", id: "title", label: "Title", default: "Cash on delivery all over Bangladesh" },
        ],
      },
    ],
    maxBlocks: 7,
    templates: ["index", "collection", "page"],
    presets: [
      {
        name: "Promo banner",
        blocks: [
          { type: "badge", settings: { text: "Eid Sale" } },
          { type: "perk", settings: { icon: "truck", title: "Free delivery in Dhaka over ৳2,000" } },
          { type: "perk", settings: { icon: "cash", title: "Cash on delivery" } },
        ],
      },
      {
        name: "Flash sale with countdown",
        settings: { heading: "Flash sale — 12 hours only", alignment: "center", show_countdown: true, overlay_opacity: 50 },
        blocks: [{ type: "badge", settings: { text: "Flash sale", style: "outline" } }],
      },
    ],
  },
});
```

The countdown is the only interactive part, so it is the only part that ships JavaScript — a small client component next to the section:

<sub>`themes/monsoon/src/sections/promo-banner/countdown.tsx`</sub>

```tsx
"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/** Client island: only this small component ships JavaScript. */
export function Countdown({ endsAt, label }: { endsAt: string; label: string }) {
  const end = new Date(endsAt).getTime();
  const [left, setLeft] = useState<number | null>(null); // null on the server → no hydration mismatch

  useEffect(() => {
    const tick = () => setLeft(end - Date.now());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [end]);

  if (Number.isNaN(end) || (left !== null && left <= 0)) return null;
  const p = parts(left ?? 0);
  return (
    <div className="mt-6 inline-flex items-center gap-3" role="timer" aria-label={label}>
      <span className="text-sm opacity-80">{label}</span>
      {(["d", "h", "m", "s"] as const).map((k) => (
        <span key={k} className="min-w-12 rounded-[var(--pai-radius)] bg-white/15 px-2 py-1 text-center font-semibold tabular-nums backdrop-blur">
          {left === null ? "--" : String(p[k]).padStart(2, "0")}
          <span className="ml-0.5 text-xs opacity-70">{k}</span>
        </span>
      ))}
    </div>
  );
}
```

Finally, register the section in your theme:

<sub>`themes/monsoon/src/index.ts`</sub>

```ts
import promoBanner from "./sections/promo-banner";

export default defineTheme({
  // …
  sections: [promoBanner /* , … */],
});
```

### SectionProps

Every section component receives the same four props:

```ts
type SectionProps<S extends SettingValues = SettingValues> = {
  /** Section instance id — unique within the template/group. Rendered as data-pai-section by the renderer. */
  id: string;
  /** Resolved settings: stored values merged over schema defaults. */
  settings: S;
  /** Enabled blocks, in merchant order, with block settings merged over defaults. */
  blocks: BlockInstance[];
  /** Store, theme settings, template resources and the data API. */
  context: StorefrontContext;
};

type BlockInstance = { id: string; type: string; settings: SettingValues; disabled?: boolean };
```

- `settings` is typed by the generic you pass (`SectionProps<PromoBannerSettings>`). The SDK fills every declared setting with its default, so you don't need to null-check declared fields — but keep the type honest: values come from JSON that merchants edit.
- `blocks` never contains disabled blocks; they are filtered out before your component runs.
- `id` is stable for the life of the section instance. Use it to build unique DOM ids (`aria-labelledby`, form field ids), never `Math.random()`.

### Async sections and data

Sections are React Server Components and can be `async`. Fetch whatever you need from `context.data` — it is request-scoped and tenant-aware:

<sub>`themes/monsoon/src/sections/featured-products.tsx`</sub>

```tsx
import { defineSection, type SectionProps } from "@pai/theme-sdk";

type Settings = { heading: string; collection: string; limit: number; show_vendor: boolean };

// Sections are React Server Components — they can be async and fetch data directly.
async function FeaturedProducts({ id, settings, context }: SectionProps<Settings>) {
  const { items } = await context.data.getProducts({
    collection: settings.collection || undefined,
    sort: "best-selling",
    limit: settings.limit,
  });

  if (!items.length) {
    return context.isPreview ? (
      <p className="mx-auto max-w-[var(--pai-container)] px-4 py-12 text-center opacity-60">Choose a collection with active products.</p>
    ) : null;
  }

  return (
    <section aria-labelledby={`${id}-heading`} className="mx-auto max-w-[var(--pai-container)] px-4 py-[var(--pai-section-spacing)]">
      <h2 id={`${id}-heading`} className="text-2xl font-bold">{settings.heading}</h2>
      <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((p) => (
          <li key={p.id}>
            <a href={p.url} className="group block">
              {p.featuredImage && (
                <img src={p.featuredImage.url} alt={p.featuredImage.alt ?? p.title} loading="lazy" className="aspect-square w-full rounded-[var(--pai-radius)] object-cover" />
              )}
              {settings.show_vendor && p.vendor && <p className="mt-3 text-xs uppercase opacity-60">{p.vendor}</p>}
              <h3 className="mt-1 font-medium group-hover:underline">{p.title}</h3>
              <p className="mt-1">
                <span className={p.onSale ? "text-[var(--pai-sale)]" : ""}>{context.formatMoney(p.price)}</span>
                {p.compareAtPrice && p.onSale && <s className="ml-2 opacity-50">{context.formatMoney(p.compareAtPrice)}</s>}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default defineSection<Settings>({
  component: FeaturedProducts,
  schema: {
    type: "featured-products",
    name: "Featured products",
    category: "products",
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Best sellers" },
      { type: "collection", id: "collection", label: "Collection", info: "Leave empty to show best sellers from the whole store." },
      { type: "range", id: "limit", label: "Products to show", min: 2, max: 12, step: 1, default: 8 },
      { type: "checkbox", id: "show_vendor", label: "Show vendor", default: false },
    ],
    presets: [{ name: "Featured products" }],
  },
});
```

> [!TIP]
> Async sections on the same page render concurrently as independent Server Components. Keep each section's data needs self-contained, and ask for exactly what you render (`limit: settings.limit`) — never fetch a whole catalog to show four products.

Template sections don't need to fetch their main resource: on the product template `context.product` is already loaded, and on collection/search templates `context.products` holds the current page of results.

### SectionSchema reference

| Field | Type | Description |
| --- | --- | --- |
| `type` | `string` | **Required.** Unique section type within the theme, kebab-case (`"promo-banner"`). This is what `ThemeConfig` stores — don't rename it after release. |
| `name` | `string` | **Required.** Display name in the customizer. |
| `description` | `string` | Shown in the "Add section" picker. |
| `category` | `SectionCategory` | **Required.** Groups sections in the picker: `header`, `footer`, `hero`, `products`, `collections`, `content`, `media`, `social-proof`, `marketing`, `template`. |
| `icon` | `string` | A [lucide](https://lucide.dev/icons) icon name (PascalCase, e.g. `"Megaphone"`, `"LayoutGrid"`) for the customizer sidebar. |
| `settings` | `SettingField[]` | **Required** (may be empty). See [Settings reference](https://paicommerce.com/docs/themes/settings). |
| `blocks` | `BlockSchema[]` | Block types the section accepts. See [Blocks](https://paicommerce.com/docs/themes/blocks). |
| `maxBlocks` | `number` | Maximum total number of blocks across all types. |
| `templates` | `TemplateType[]` | Restrict the section to these templates. Omit to allow it everywhere. |
| `group` | `"header" \| "footer"` | Restrict the section to a section group. |
| `limit` | `number` | Maximum instances per template or group (e.g. the main product section: `1`). |
| `presets` | `SectionPreset[]` | Entries in the "Add section" picker. **A section without presets cannot be added by merchants** — it can only appear via your default config. |

#### Categories

Use `template` for sections that render a template's main resource — the product page's gallery and buy box, the collection grid, the cart, search results, the article body. Give them `templates: [...]` and `limit: 1`:

```ts
schema: {
  type: "main-product",
  name: "Product information",
  category: "template",
  templates: ["product"],
  limit: 1,
  settings: [/* … */],
  blocks: [/* title, price, variant picker, buy buttons, description, … */],
  // no presets: it's placed by the default config and can't be added twice
}
```

#### Restricting to templates and groups

```ts
// Only on the home page and landing pages
templates: ["index", "page"],

// Only in the header group (e.g. an announcement bar or the header itself)
group: "header",
```

The full list of template types, with their storefront paths:

| Template | Page | Path |
| --- | --- | --- |
| `index` | Home page | `/` |
| `product` | Product page | `/products/{product}` |
| `collection` | Collection page | `/collections/{collection}` |
| `collections` | Collections list | `/collections` |
| `search` | Search | `/search` |
| `cart` | Cart | `/cart` |
| `page` | Content page | `/pages/{page}` |
| `blog` | Blog | `/blog` |
| `article` | Blog post | `/blog/{post}` |
| `account` | Customer account | `/account` |
| `404` | Not found | `/404` |

#### Section presets

A `SectionPreset` is a named starting point for a new section instance. When a merchant picks it, the customizer calls `instantiateSection(schema, presetIndex)`, which applies your defaults, overlays the preset's `settings`, and creates the preset's blocks with fresh ids:

```ts
type SectionPreset = {
  name: string;
  settings?: SettingValues;
  blocks?: { type: string; settings?: SettingValues }[];
};
```

Offering two or three presets for the same section ("Promo banner", "Flash sale with countdown") is an easy way to make a theme feel richer without writing more components.

### Rendering pipeline

For each request, the storefront:

1. Loads the store's live theme (`loadTheme(slug)`) and its stored config.
2. Resolves the config: `resolveThemeConfig(theme, stored, presetId)`.
3. Builds the `StorefrontContext` for the current template.
4. Renders the `header` group, the template's sections and the `footer` group with `RenderSections`, inside your theme's `Layout`.

`RenderSections` skips disabled sections, resolves settings and blocks with `resolveSectionSettings`, and wraps each section in:

```html
<div id="section-{id}" data-pai-section="{id}" data-pai-section-type="{type}" data-pai-group="header|footer" style="display: contents">
  <!-- your section -->
</div>
```

`display: contents` means the wrapper does not affect your layout. In the customizer preview, unknown section types render a visible warning instead of silently disappearing. See [Customizer integration](https://paicommerce.com/docs/themes/customizer).

### Best practices

- **One job per section.** Prefer a focused "Image with text" section over a mega-section with 40 settings.
- **Semantic landmarks.** Wrap content in `<section aria-labelledby>` and give each section a heading (visually hidden if needed).
- **Design tokens over literals.** Use `var(--pai-primary)`, `var(--pai-radius)` and friends, so global settings restyle your section.
- **Graceful empties.** When a required setting is empty, render a helpful placeholder when `context.isPreview` is true and nothing (or a sensible fallback) in production.
- **Stable types and ids.** Changing a section `type` or setting `id` orphans merchants' saved configuration. Add new settings instead, and keep reading old ids for a version or two if you must migrate.

---

## Blocks

Blocks let merchants compose the *inside* of a section. A slideshow has slide blocks; an FAQ has question blocks; the main product section has title, price, variant picker and buy-button blocks that merchants can reorder or hide.

### Defining block types

Block types are declared in the section schema's `blocks` array. Each `BlockSchema` has its own settings:

```ts
type BlockSchema = {
  type: string; // unique within the section, e.g. "badge"
  name: string; // shown in the customizer ("Badge")
  settings: SettingField[];
  limit?: number; // max instances of this block type in one section
};
```

The [promo banner](https://paicommerce.com/docs/themes/sections#a-complete-example-promo-banner) declares two block types and caps the total with `maxBlocks`:

```ts
blocks: [
  {
    type: "badge",
    name: "Badge",
    limit: 3,
    settings: [
      { type: "text", id: "text", label: "Text", default: "Limited time" },
      {
        type: "select",
        id: "style",
        label: "Style",
        default: "solid",
        options: [
          { value: "solid", label: "Solid" },
          { value: "outline", label: "Outline" },
        ],
      },
    ],
  },
  {
    type: "perk",
    name: "Perk",
    limit: 4,
    settings: [
      { type: "select", id: "icon", label: "Icon", default: "truck", options: [/* … */] },
      { type: "text", id: "title", label: "Title", default: "Cash on delivery all over Bangladesh" },
    ],
  },
],
maxBlocks: 7,
```

### Rendering blocks

Your component receives `blocks: BlockInstance[]` — already filtered (disabled blocks removed), in the merchant's order, with each block's settings merged over its schema defaults:

```ts
type BlockInstance = { id: string; type: string; settings: SettingValues; disabled?: boolean };
```

Block `settings` are typed as `SettingValues` (`Record<string, unknown>`), so narrow them with a type per block:

```tsx
type BadgeSettings = { text: string; style: "solid" | "outline" };

{blocks
  .filter((b) => b.type === "badge")
  .map((block) => {
    const b = block.settings as BadgeSettings;
    return (
      <span key={block.id} className={b.style === "solid" ? "badge-solid" : "badge-outline"}>
        {b.text}
      </span>
    );
  })}
```

Always use `block.id` as the React `key`. Block ids are generated once (`b_…`) and stay stable when merchants reorder blocks.

#### Rendering blocks in merchant order

When the order of different block types matters — typical for a product page — map over `blocks` once and switch on `type`:

<sub>`themes/monsoon/src/sections/main-product.tsx`</sub>

```tsx
import { defineSection, type SectionProps } from "@pai/theme-sdk";

function MainProduct({ blocks, context }: SectionProps) {
  const product = context.product;
  if (!product) return null;

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <Gallery images={product.images} />
      <div className="flex flex-col gap-5">
        {blocks.map((block) => {
          switch (block.type) {
            case "title":
              return <h1 key={block.id} className="text-3xl font-bold">{product.title}</h1>;
            case "price":
              return (
                <p key={block.id} className="text-xl">
                  {context.formatMoney(product.price)}
                  {product.onSale && product.compareAtPrice && (
                    <s className="ml-2 opacity-50">{context.formatMoney(product.compareAtPrice)}</s>
                  )}
                </p>
              );
            case "text":
              return <p key={block.id}>{String(block.settings.text ?? "")}</p>;
            case "buy_buttons":
              return <BuyButtons key={block.id} product={product} />; // a client component
            default:
              return null; // ignore unknown block types (forward compatibility)
          }
        })}
      </div>
    </div>
  );
}

export default defineSection({
  component: MainProduct,
  schema: {
    type: "main-product",
    name: "Product information",
    category: "template",
    templates: ["product"],
    limit: 1,
    settings: [],
    blocks: [
      { type: "title", name: "Title", limit: 1, settings: [] },
      { type: "price", name: "Price", limit: 1, settings: [] },
      { type: "text", name: "Text", settings: [{ type: "textarea", id: "text", label: "Text", default: "Cash on delivery available across Bangladesh." }] },
      { type: "buy_buttons", name: "Buy buttons", limit: 1, settings: [] },
    ],
  },
});
```

`Gallery` and `BuyButtons` stand in for your own components — or use the ready-made ones from [`@pai/theme-kit`](https://paicommerce.com/docs/themes/theme-kit).

### Blocks in presets and default config

Section presets list blocks **without ids** — ids are generated when the merchant adds the section:

```ts
presets: [
  {
    name: "Promo banner",
    blocks: [
      { type: "badge", settings: { text: "Eid Sale" } },
      { type: "perk", settings: { icon: "cash", title: "Cash on delivery" } },
    ],
  },
],
```

In a `ThemeConfig` (your `defaultConfig`, theme presets, and what merchants save), blocks are full `BlockInstance`s **with** ids. Pick short, readable ids in hand-written configs:

```ts
hero: {
  type: "promo-banner",
  settings: { heading: "Eid Collection is live" },
  blocks: [
    { id: "b_badge", type: "badge", settings: { text: "New season" } },
    { id: "b_cod", type: "perk", settings: { icon: "cash", title: "Cash on delivery" } },
  ],
},
```

### Guidelines

- **Use blocks for repetition and ordering**, settings for everything else. "Show vendor" is a setting; "a list of trust badges" is blocks.
- **Set `limit`** on block types that make no sense twice (a product title) and `maxBlocks` on the section so merchants can't build a 40-slide slideshow that tanks performance.
- **Ignore unknown types.** Return `null` for block types you don't recognise — a merchant may have a block from a newer version of your theme in their config.
- **Keep block settings small.** Two to five fields per block keeps the customizer usable on a laptop screen.

---

## Presets

PaiCommerce has two kinds of presets:

| | Theme preset (`ThemePreset`) | Section preset (`SectionPreset`) |
| --- | --- | --- |
| Where | `ThemeDefinition.presets` | `SectionSchema.presets` |
| Purpose | A complete starting look for a business category — "Fashion", "Grocery", "Beauty" | An entry in the customizer's "Add section" picker |
| Applied | When a merchant installs the theme or switches preset | When a merchant adds a section |
| Contains | Global setting overrides, and optionally full templates and groups | Setting overrides and starter blocks for one section |

### Theme presets

During onboarding a merchant tells us what they sell. We recommend themes whose `manifest.categories` match, and pre-select the preset for that category. A great preset is the fastest way to make a theme feel "made for me".

```ts
type ThemePreset = {
  id: string; // stored in store_themes.preset_id — never change it
  name: string;
  category: BusinessCategory;
  description?: string;
  thumbnail?: string;
  /** Overrides applied on top of the default config. */
  settings?: SettingValues;
  templates?: ThemeConfig["templates"];
  groups?: Partial<ThemeConfig["groups"]>;
};
```

<sub>`themes/monsoon/src/presets.ts`</sub>

```ts
import type { ThemePreset } from "@pai/theme-sdk";

export const presets: ThemePreset[] = [
  {
    id: "fashion",
    name: "Fashion",
    category: "fashion",
    description: "Monochrome palette with bold campaign banners.",
    settings: { color_primary: "#111111", color_accent: "#e11d48", font_heading: "Syne" },
  },
  {
    id: "beauty",
    name: "Beauty",
    category: "beauty",
    description: "Soft blush palette, rounded corners and serif headings.",
    settings: { color_primary: "#be185d", color_muted: "#fdf2f8", font_heading: "Fraunces", radius: 16 },
    templates: {
      index: {
        order: ["hero", "best_sellers"],
        sections: {
          hero: {
            type: "promo-banner",
            settings: { heading: "Glow for Eid", alignment: "center", text_color: "#ffffff" },
            blocks: [{ id: "b_badge", type: "badge", settings: { text: "Up to 30% off", style: "solid" } }],
          },
          best_sellers: {
            type: "featured-products",
            settings: { heading: "Skincare best sellers", collection: "skincare", limit: 4 },
          },
        },
      },
    },
  },
];
```

#### How presets are merged

`resolveThemeConfig(theme, stored, presetId)` builds the config a store renders:

1. Start from `theme.defaultConfig`.
2. Apply the preset (`applyPreset`):
   - `settings` are **shallow-merged** over the default settings.
   - Each template in `templates` **replaces** the default template of the same name entirely. Templates you don't list keep the default.
   - Each group in `groups` (`header`, `footer`) **replaces** the default group.
3. Apply the merchant's stored config the same way: settings merged, stored templates and groups replace preset/default ones.

```ts
import { resolveThemeConfig } from "@pai/theme-sdk";

const config = resolveThemeConfig(theme, null, "beauty");
config.settings.color_primary; // "#be185d" (from the preset)
config.settings.color_background; // default value, preset didn't override it
config.templates.index?.order; // ["hero", "best_sellers"] from the preset
config.templates.product; // the theme default product template
```

> [!WARNING]
> Because templates are replaced wholesale, a preset template must be complete — include every section you want on that page, not just the ones that differ.

#### Guidelines for theme presets

- **Ship at least one preset per category** listed in your manifest. Reviewers check this.
- **Change more than colours.** The best presets also swap fonts, corner radius and the home page layout — grocery stores want category tiles and deals up top; fashion wants imagery.
- **Reference demo content by slug.** Collection and product settings in presets should use slugs that exist in the seeded demo store for that category (e.g. `skincare`, `new-arrivals`). In a merchant's store, missing slugs simply render an empty state.
- **Keep `id` stable.** Stores remember their preset id; renaming it makes those stores fall back to the default.

### Section presets

Section presets appear in the customizer's **Add section** picker. A section with no presets can't be added by merchants at all — use that for template sections that are placed by your default config.

```ts
type SectionPreset = {
  name: string;
  settings?: SettingValues;
  blocks?: { type: string; settings?: SettingValues }[];
};
```

```ts
presets: [
  {
    name: "Promo banner",
    blocks: [
      { type: "badge", settings: { text: "Eid Sale" } },
      { type: "perk", settings: { icon: "truck", title: "Free delivery in Dhaka over ৳2,000" } },
      { type: "perk", settings: { icon: "cash", title: "Cash on delivery" } },
    ],
  },
  {
    name: "Flash sale with countdown",
    settings: { heading: "Flash sale — 12 hours only", alignment: "center", show_countdown: true, overlay_opacity: 50 },
    blocks: [{ type: "badge", settings: { text: "Flash sale", style: "outline" } }],
  },
],
```

When a preset is picked, the customizer calls `instantiateSection(schema, presetIndex)`, which:

- fills every setting with its schema default, then applies the preset's `settings`;
- creates each preset block with a fresh id (`generateId("b")`) and its block defaults applied.

You can use the same helper in tests to check that every preset produces a sensible section:

```ts
import { getSection, instantiateSection } from "@pai/theme-sdk";
import theme from "@pai-theme/monsoon";

const schema = getSection(theme, "promo-banner")!.schema;
const flashSale = instantiateSection(schema, 1);
// → { type: "promo-banner", settings: { heading: "Flash sale — 12 hours only", …defaults }, blocks: [{ id: "b_…", type: "badge", … }] }
```

---

## Storefront context & data

Every section receives a `context: StorefrontContext`. It's the theme's entire view of the world: the store, the resolved theme settings, the resources for the current template and a read-only `data` API. **Themes never import a database client or call internal APIs** — which is why the same theme works in production, in the customizer preview and against mock data.

### StorefrontContext

```ts
type StorefrontContext = {
  store: SfStore;
  /** Resolved global theme settings (merchant values merged over defaults). */
  theme: SettingValues;
  template: TemplateType;
  /** Current path, e.g. "/collections/new-arrivals". */
  path: string;
  searchParams: Record<string, string | undefined>;

  /** Template-specific resources. */
  product?: SfProduct | null; // product template
  collection?: SfCollection | null; // collection template
  products?: Paginated<SfProduct>; // collection & search results
  page?: SfPage | null; // page template
  post?: SfPost | null; // article template
  posts?: Paginated<SfPost>; // blog template
  customer?: SfCustomer | null; // logged-in customer, if any

  data: StorefrontDataAPI;
  /** True inside the theme customizer — render placeholders for empty settings. */
  isPreview: boolean;
  formatMoney: (amount: Money) => string;
  /** Build a store-relative URL (handles path-based tenants). */
  url: (path: string) => string;
};
```

#### Template resources

| Template | Populated fields |
| --- | --- |
| `product` | `product` |
| `collection` | `collection`, `products` (current page, honouring `?sort=`, `?page=` and filter params) |
| `collections` | — (use `data.getCollections()`) |
| `search` | `products` (results for `searchParams.q`) |
| `page` | `page` |
| `blog` | `posts` |
| `article` | `post` |
| `account` | `customer` |
| all | `store`, `theme`, `template`, `path`, `searchParams`, `customer` (when logged in) |

#### Building URLs

A store can be served from a subdomain (`rongdhonu.paicommerce.com`), a custom domain (`shop.rongdhonu.com.bd`), the path fallback (`/s/rongdhonu`) or the customizer preview (`/preview/<token>`). **Never hard-code absolute paths** — build every internal link with `context.url()`:

```tsx
<a href={context.url("/")}>Home</a>
<a href={context.url("/collections/new-arrivals")}>New arrivals</a>
<a href={context.url(`/search?q=${encodeURIComponent(query)}`)}>Search</a>
<form action={context.url("/search")} method="get">…</form>
```

On `rongdhonu.paicommerce.com`, `context.url("/cart")` returns `/cart`; under the path fallback it returns `/s/rongdhonu/cart`; in the customizer it returns `/preview/<token>/cart`, so navigation inside the preview keeps working.

Absolute URLs (`https://…`), `mailto:`, `tel:` and `#anchors` are returned unchanged, so it's safe to pass merchant-entered links straight through `context.url()`.

Resources that carry a `url` field — `SfProduct`, `SfCollection`, `SfPage`, `SfPost`, `SfMenuItem` — are **already** resolved for the current base path. Use them as-is; don't wrap them in `context.url()` again.

> [!TIP]
> `/collections/all` is a built-in pseudo-collection containing every active product — a safe default for "Shop now" buttons.

#### Formatting money

Amounts are integers in minor units (poisha). `context.formatMoney` formats them in the store's currency:

```tsx
context.formatMoney(125000); // "৳1,250"
context.formatMoney(product.price);
```

Never divide by 100 and format numbers yourself — the store may use a different currency, and the formatter handles symbols and decimals consistently with checkout, emails and invoices. Client components that can't receive the context can use `formatMoney(amount, currency)` from `@pai/theme-kit`, passing `context.store.currency` down as a prop.

#### Preview mode

`context.isPreview` is `true` when the page is rendered inside the customizer. Use it to show helpful placeholders instead of empty space, and to skip side effects:

```tsx
if (!settings.image) {
  return context.isPreview ? <ImagePlaceholder label="Add an image in the sidebar" /> : null;
}
```

See [Customizer integration](https://paicommerce.com/docs/themes/customizer).

### StorefrontDataAPI

`context.data` is a read-only, tenant-scoped API. Every method is async and safe to call from any section. Results are memoised per request, so two sections asking for the same menu or product don't hit the database twice. Only `active` products are ever returned.

```ts
interface StorefrontDataAPI {
  getProducts(q?: ProductQuery): Promise<Paginated<SfProduct>>;
  getProduct(slug: string): Promise<SfProduct | null>;
  getCollections(opts?: { limit?: number; slugs?: string[] }): Promise<SfCollection[]>;
  getCollection(slug: string): Promise<SfCollection | null>;
  getRelatedProducts(productId: string, limit?: number): Promise<SfProduct[]>;
  getReviews(productId: string, limit?: number): Promise<SfReview[]>;
  getPosts(opts?: { limit?: number; page?: number }): Promise<Paginated<SfPost>>;
  getMenu(handle: string): Promise<SfMenuItem[]>;
}
```

#### getProducts(query)

The workhorse. All fields are optional:

| Field | Type | Description |
| --- | --- | --- |
| `collection` | `string` | Collection **slug**. |
| `ids` | `string[]` | Product ids. |
| `slugs` | `string[]` | Product slugs (e.g. from a `product_list` setting). |
| `query` | `string` | Full-text search over title, description, vendor, tags. |
| `tag` | `string` | Products with this tag. |
| `featured` | `boolean` | Only products marked as featured. |
| `sort` | `"manual" \| "newest" \| "price-asc" \| "price-desc" \| "best-selling" \| "rating" \| "title"` | Sort order. `manual` uses the collection's manual order. |
| `minPrice` / `maxPrice` | `number` | Price bounds in minor units. |
| `inStock` | `boolean` | Only available products. |
| `limit` | `number` | Page size. |
| `page` | `number` | 1-based page number. |

It returns a `Paginated<SfProduct>`:

```ts
type Paginated<T> = { items: T[]; total: number; page: number; pageSize: number; pageCount: number };
```

```tsx
// Best sellers from a collection
const { items } = await context.data.getProducts({ collection: "eid-sale", sort: "best-selling", limit: 8 });

// Products picked in a product_list setting, in stock only
const picked = await context.data.getProducts({ slugs: settings.products, inStock: true, limit: 12 });

// Under ৳1,000
const deals = await context.data.getProducts({ maxPrice: 100000, sort: "price-asc", limit: 12 });
```

#### Other methods

```tsx
const product = await context.data.getProduct("jamdani-saree-red");
const collections = await context.data.getCollections({ limit: 6 });
const picked = await context.data.getCollections({ slugs: ["men", "women", "kids"] });
const collection = await context.data.getCollection("new-arrivals");
const related = await context.data.getRelatedProducts(product!.id, 4);
const reviews = await context.data.getReviews(product!.id, 10);
const { items: posts } = await context.data.getPosts({ limit: 3 });
const mainMenu = await context.data.getMenu("main-menu");
```

### Types

#### SfStore

```ts
type SfStore = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  currency: string; // "BDT"
  locale: string; // "en" | "bn" …
  social: Record<string, string>; // { facebook, instagram, youtube, tiktok, x, whatsapp, messenger }
  /** Show "Powered by PaiCommerce" (false on paid plans that remove branding). */
  showBranding: boolean;
};
```

> [!NOTE]
> Respect `showBranding`. Footers must render the "Powered by PaiCommerce" credit when it is `true` and hide it when it is `false` — this is checked during theme review.

#### SfProduct and SfVariant

```ts
type SfProduct = {
  id: string;
  slug: string;
  url: string; // store-relative, ready to use
  title: string;
  description: string; // HTML
  vendor: string | null;
  productType: string | null;
  tags: string[];
  images: SfImage[];
  featuredImage: SfImage | null;
  price: Money; // minor units
  compareAtPrice: Money | null;
  priceMin: Money; // lowest variant price (equal to price when no variants)
  priceMax: Money;
  onSale: boolean;
  available: boolean;
  inventory: number;
  options: { name: string; values: string[] }[]; // e.g. [{ name: "Size", values: ["S","M","L"] }]
  variants: SfVariant[];
  rating: { average: number; count: number };
  createdAt: string; // ISO 8601
};

type SfVariant = {
  id: string;
  title: string; // "Red / M"
  options: Record<string, string>; // { Color: "Red", Size: "M" }
  price: Money;
  compareAtPrice: Money | null;
  available: boolean;
  inventory: number;
  imageUrl: string | null;
  sku: string | null;
};

type SfImage = { url: string; alt?: string };
```

Show a price range when variants differ in price:

```tsx
const price =
  product.priceMin !== product.priceMax
    ? `${context.formatMoney(product.priceMin)} – ${context.formatMoney(product.priceMax)}`
    : context.formatMoney(product.price);
```

`description` is merchant-authored HTML — sanitise it (`sanitizeHtml` from `@pai/theme-kit`) before rendering with `dangerouslySetInnerHTML`.

#### SfCollection

```ts
type SfCollection = {
  id: string;
  slug: string;
  url: string;
  title: string;
  description: string | null;
  image: SfImage | null;
  productsCount: number;
};
```

#### SfPage and SfPost

```ts
type SfPage = { id: string; slug: string; url: string; title: string; content: string /* HTML */ };

type SfPost = {
  id: string;
  slug: string;
  url: string;
  title: string;
  excerpt: string | null;
  content: string; // HTML
  coverUrl: string | null;
  author: string | null;
  tags: string[];
  publishedAt: string | null;
};
```

#### SfReview

```ts
type SfReview = { id: string; customerName: string; rating: number; title: string | null; body: string | null; createdAt: string };
```

#### SfMenuItem

```ts
type SfMenuItem = { id: string; label: string; url: string; active?: boolean; children?: SfMenuItem[] };
```

`active` is `true` when the item's URL matches the current path. Menus can nest; most themes support two levels (mega menus: three).

#### SfCustomer

```ts
type SfCustomer = { id: string; name: string; email: string | null; phone: string | null };
```

Many Bangladeshi shoppers check out with only a phone number, so `email` is often `null`. Don't design account pages that assume an email address.

### Mock data

Because sections only depend on `StorefrontContext`, you can render them against mock data in tests or a component playground. `@pai/theme-kit` ships sample products and collections used by the customizer's placeholders — see [Theme Kit](https://paicommerce.com/docs/themes/theme-kit).

---

## Theme Kit

`@pai/theme-kit` is the fastest way to build a PaiCommerce theme. It gives you a complete, accessible, conversion-tested storefront — header, footer, home page sections, product page, collection filters, cart drawer, search, blog and customer account — that you restyle and extend with your own sections. Every theme in the Theme Store is built on it.

The kit has two entry points:

| Import | Contains | Runs on |
| --- | --- | --- |
| `@pai/theme-kit` | `createBaseTheme`, base sections, config builders, settings helpers, server-safe components (`ProductCard`, `Price`, `Section` …), utilities | Server (and safe in client components) |
| `@pai/theme-kit/client` | Interactive components and hooks: cart, variant picker, gallery, quick view, search, forms, carousels, countdown | Client (`"use client"`) |

### createBaseTheme

With nothing but a manifest, `createBaseTheme` returns a complete `ThemeDefinition`:

<sub>`themes/monsoon/src/index.ts`</sub>

```ts
import { createBaseTheme } from "@pai/theme-kit";
import { manifest } from "./manifest";

export default createBaseTheme({ manifest });
```

You get:

- **Every base section** (listed [below](#base-sections)).
- **The kit's global settings** (colours, typography, layout, logo, header, product cards, cart, currency, social, announcement), with defaults tuned for the manifest's **first category** via `CATEGORY_STYLES`.
- **A full default config** for all eleven templates, with a category-specific home page.
- **One preset per manifest category** (`categoryPreset`): palette, fonts and home page for that niche.
- **`kitCssVariables`** as the CSS variable mapper and `fontSettings: ["font_heading", "font_body"]`.

Then customise as much as you like:

<sub>`themes/monsoon/src/index.ts`</sub>

```ts
import { createBaseTheme, extendSettingsSchema, sectionList } from "@pai/theme-kit";
import { manifest } from "./manifest";
import promoBanner from "./sections/promo-banner";
import lookbook from "./sections/lookbook";

export default createBaseTheme({
  manifest,
  // New sections are added; a section whose type matches a base section replaces it.
  sections: [promoBanner, lookbook],
  // Drop base sections you don't want merchants to use.
  excludeSections: ["custom-html"],
  // Brand defaults applied on top of the category palette.
  settingsDefaults: { color_primary: "#0f766e", color_accent: "#f59e0b", font_heading: "Poppins", radius: 10, button_radius: 999 },
  // Add theme-specific global settings to the kit's schema.
  settingsSchema: (base) =>
    extendSettingsSchema(base, [
      { name: "Product cards", settings: [{ type: "checkbox", id: "card_shadow", label: "Soft shadow on cards", default: false }] },
    ]),
  // Start from the kit's default config and change the home page.
  defaultConfig: (base) => ({
    ...base,
    templates: {
      ...base.templates,
      index: sectionList([
        { id: "hero", type: "promo-banner", settings: { height: "lg" }, blocks: [{ type: "badge", settings: { text: "New season" } }] },
        { type: "featured-collection", settings: { heading: "New arrivals", source: "newest", limit: 8 } },
        { type: "lookbook" },
        { type: "testimonials" },
        { type: "newsletter" },
      ]),
    },
  }),
  css: `.pai-card { transition: box-shadow .2s ease; }`,
});
```

#### Options

```ts
type CreateBaseThemeOptions = {
  manifest: ThemeManifest;
  /** Extra sections. A section whose `schema.type` matches a base section replaces it. */
  sections?: SectionDefinition<any>[];
  /** Replace/patch base sections by type: a full definition, or a function of the base definition. */
  overrideSections?: Record<string, SectionDefinition<any> | ((base: SectionDefinition<any>) => SectionDefinition<any>)>;
  /** Base section types to drop entirely. */
  excludeSections?: string[];
  /** Global settings schema, or a function extending `baseSettingsSchema`. */
  settingsSchema?: SettingsGroup[] | ((base: SettingsGroup[]) => SettingsGroup[]);
  /** New default values for global settings, applied on top of the category palette. */
  settingsDefaults?: SettingValues;
  /** Default config, or a function transforming the kit's default config. Partial objects are merged. */
  defaultConfig?: Partial<ThemeConfig> | ((base: ThemeConfig) => ThemeConfig);
  /** Presets, or a function transforming the kit's category presets. */
  presets?: ThemePreset[] | ((base: ThemePreset[]) => ThemePreset[]);
  css?: string; // scoped under .pai-theme-<slug>
  Layout?: ComponentType<ThemeLayoutProps>;
  cssVariables?: ThemeDefinition["cssVariables"]; // default: kitCssVariables
  fontSettings?: string[]; // default: ["font_heading", "font_body"]
};
```

Sections are resolved in this order: **base → `overrideSections` → `excludeSections` → `sections`**. So `overrideSections` is ideal for patching a base section — for example keeping the schema but swapping the component:

```ts
overrideSections: {
  "hero-banner": (base) => ({ ...base, component: MonsoonHero }),
},
```

#### Config builders

| Export | Returns |
| --- | --- |
| `sectionList(specs)` | A `SectionList` with **deterministic ids** from a readable array. Ids default to the section type (`hero-banner`, then `hero-banner-2` …); block ids to `<section>--<type>-<n>`. Deterministic ids matter because the customizer and the storefront are different processes and must agree on ids for theme defaults. |
| `baseDefaultConfig(category, settings?)` | The kit's full `ThemeConfig` for a category. |
| `baseHeaderGroup()` / `baseFooterGroup()` | The default header (announcement bar + header) and footer groups. |
| `baseIndexTemplate(category)` | The default home page for a category (hero, trust icons, collection list, new arrivals, image with text, best sellers, testimonials, blog posts). |
| `baseProductTemplate()` | Main product (vendor, title, rating, price, variant picker, stock, buy buttons, trust, description, delivery tab, share), reviews and related products. |
| `categoryPreset(category, overrides?)` | A `ThemePreset` with the category's palette, fonts, hero image and home page. |

```ts
import { categoryPreset } from "@pai/theme-kit";

presets: (base) => [
  ...base,
  categoryPreset("beauty", { name: "Blush", settings: { color_primary: "#be185d", font_heading: "Fraunces" } }),
],
```

### Base sections

All base sections are exported individually (camelCase) and as `baseSectionMap` / `baseSections`:

| Group | Section types |
| --- | --- |
| Header & footer | `announcement-bar`, `header`, `footer` |
| Hero & media | `hero-banner`, `slideshow`, `image-with-text`, `video`, `countdown` |
| Products & collections | `featured-collection`, `product-grid`, `collection-list`, `category-tiles`, `blog-posts` |
| Content | `rich-text`, `multicolumn`, `trust-badges`, `testimonials`, `logo-list`, `newsletter`, `faq`, `image-gallery`, `contact-form`, `custom-html`, `spacer`, `divider` |
| Templates | `main-product`, `product-reviews`, `related-products`, `main-collection`, `main-collections-list`, `main-search`, `main-cart`, `main-page`, `main-blog`, `main-article`, `main-account`, `main-404` |

```ts
import { heroBanner, featuredCollection, baseSectionMap, type BaseSectionType } from "@pai/theme-kit";
```

Base sections share a consistent vocabulary of settings, so merchants learn one customizer: `color_scheme` (default, muted, inverse, primary, accent), `padding` (none, small, medium, large), heading fields (`eyebrow`, `heading`, `subheading`, `align`), button fields and a product source (`source`, `collection`, `products`, `limit`).

### Building your own sections with the kit

The field factories and helpers used by the base sections are exported, so your sections behave like the built-in ones:

<sub>`themes/monsoon/src/sections/lookbook.tsx`</sub>

```tsx
import { defineSection, type SectionProps } from "@pai/theme-sdk";
import {
  Section,
  SectionHeading,
  ProductGrid,
  PreviewNotice,
  loadSectionProducts,
  productSourceFields,
  headingFields,
  schemeField,
  paddingField,
  str,
} from "@pai/theme-kit";

async function Lookbook({ settings, context }: SectionProps) {
  const { products, sample } = await loadSectionProducts(context, settings, 4);
  return (
    <Section settings={settings}>
      <SectionHeading
        eyebrow={str(settings.eyebrow)}
        title={str(settings.heading)}
        subtitle={str(settings.subheading)}
        align={settings.align === "center" ? "center" : "left"}
      />
      {sample && <PreviewNotice context={context}>Showing sample products — pick a collection in the sidebar.</PreviewNotice>}
      <ProductGrid products={products} context={context} columns={4} />
    </Section>
  );
}

export default defineSection({
  component: Lookbook,
  schema: {
    type: "lookbook",
    name: "Lookbook",
    category: "products",
    icon: "Images",
    settings: [
      ...headingFields({ eyebrow: "Lookbook", heading: "Styled for Eid", align: "center" }),
      ...productSourceFields({ source: "collection", limit: 4 }),
      schemeField("muted"),
      paddingField("large"),
    ],
    presets: [{ name: "Lookbook" }],
  },
});
```

#### Section helpers

| Export | Description |
| --- | --- |
| `headingFields({ eyebrow?, heading?, subheading?, align? })` | Eyebrow, heading, subheading and alignment settings. |
| `buttonFields(prefix?, defaults?, title?)` / `readButton(context, settings, prefix?)` | Button label/link/style settings, and a reader that resolves the link through `context.url()`. |
| `productSourceFields({ source?, limit? })` | `source` (collection, featured, newest, best-selling, on-sale, manual), `collection`, `products`, `limit`. |
| `loadSectionProducts(context, settings, fallbackLimit?)` | Resolves products for `productSourceFields`. Returns `{ products, sample, collectionUrl }` — in the customizer, empty results fall back to sample products so the layout stays visible. |
| `schemeField(default?)`, `paddingField(default?)` | Colour scheme and vertical padding settings, read by `<Section>`. |
| `columnsField(default?, min?, max?)`, `mobileColumnsField(default?)`, `imageRatioField(default?, id?, label?)` | Common layout settings. |
| `PreviewNotice` | A dashed notice rendered only when `context.isPreview`. |
| `loadMenu`, `Logo`, `HeroText`, `HERO_HEIGHTS`, `heroPositionClasses` | Building blocks of the header and hero sections. |

#### Server-safe components

| Export | Description |
| --- | --- |
| `Section` | Section wrapper: colour scheme, padding from settings, container. |
| `Container` | Max-width container (`default`, `narrow`, `wide`, `full`). |
| `SectionHeading` | Eyebrow + title + subtitle + optional "View all" action. |
| `Button`, `ButtonLink` | Buttons in the theme's style (`primary`, `secondary`, `outline`, `accent`, `light`, `ghost`, `link`). |
| `SmartLink`, `resolveHref(context, href, fallback?)` | Internal links via `next/link`, external links in a new tab; `resolveHref` sends store-relative paths through `context.url()`. |
| `Image`, `Placeholder` | Responsive image with lazy loading; placeholders for empty image settings. |
| `Price`, `moneyOf(context)` | Price with compare-at, "From" ranges and discount badge, in the store currency and the theme's currency display. |
| `ProductCard`, `ProductGrid`, `ProductList`, `cardOptions(context, overrides?)` | Product cards that honour the global "Product cards" settings (ratio, style, quick add, hover image, badges, wishlist). |
| `CollectionCard`, `ArticleCard` | Collection and blog cards. |
| `Rating`, `Badge`, `RichText`, `EmptyState`, `Breadcrumbs`, `Pagination`, `withQuery` | Everyday UI. `RichText` sanitises HTML; `withQuery` builds URLs that patch the current query string. |
| `Icon`, `resolveIcon`, `ICON_OPTIONS`, `SocialIcon`, `SocialLinks`, `getSocialLinks`, `PaymentIcons` | Icons for settings-driven UIs, social links and payment method logos (bKash, Nagad, COD …). |

#### Utilities

`cn`, `str`, `num`, `bool`, `list` (safe setting readers), `formatMoney(amount, currency?, display?)`, `discountPercent`, `sanitizeHtml`, `stripHtml`, `truncate`, `aspectClass`, `gridColsClass`, `textAlignClass`, `isVideoFile`, `embedUrl`, `kitCssVariables`, `schemeClass`, `luminance`, `readableOn`, `listingQuery`, `DEFAULT_PAGE_SIZE`, plus sample data (`SAMPLE_PRODUCTS`, `SAMPLE_COLLECTIONS`, `SAMPLE_POSTS`, `STOCK_IMAGES`, `CATEGORY_HERO`) for previews and tests.

#### Settings helpers

| Export | Description |
| --- | --- |
| `baseSettingsSchema` | The kit's global settings groups. |
| `BASE_SETTING_IDS` | Every base setting id. |
| `withSettingDefaults(groups, defaults)` | Copy of a schema with new default values. |
| `extendSettingsSchema(base, extra)` | Merge groups: same-name groups are appended to, settings with an existing id replace it, and an id only lives in one group. |
| `CATEGORY_STYLES` | Colour/typography defaults for each business category. |

### Client components: `@pai/theme-kit/client`

Interactive pieces are small client islands. The storefront renders `StorefrontProvider`, `CartProvider` and `ToastProvider` once at the top of every store page, so they work anywhere in your sections.

#### Storefront context

```ts
import { useStorefront, useMoney, trackEvent } from "@pai/theme-kit/client";

const sf = useStorefront();
sf.base; // "" | "/s/{slug}" | "/preview/{token}"
sf.url("/cart"); // store-relative URL including the tenant base
sf.api("/cart"); // storefront API URL, e.g. "/s/demo/api/cart"
sf.format(125000); // "৳1,250" in the store currency & theme currency display
sf.customer; // { id, name } | null
sf.isPreview;

const money = useMoney(); // shorthand for sf.format
trackEvent({ event: "AddToCart", value: 1250, currency: "BDT", contentIds: [product.id] });
```

`trackEvent` dispatches a `pai:track` event that the storefront forwards to the Meta Pixel, GA4, GTM and TikTok integrations the merchant has enabled. The kit's components already fire `ViewContent` (product view), `AddToCart`, `Search`, `AddToWishlist` and `Lead` (newsletter sign-up); checkout events are fired by the storefront. Only call it for custom interactions.

#### Cart

```tsx
"use client";
import { useCart, useMoney } from "@pai/theme-kit/client";

export function MiniCart() {
  const { cart, openDrawer, pending } = useCart();
  const money = useMoney();
  return (
    <button type="button" onClick={openDrawer} aria-busy={pending} className="pai-btn pai-btn-outline">
      Cart · {cart.itemCount} · {money(cart.total)}
    </button>
  );
}
```

`useCart()` returns:

```ts
type CartApi = {
  cart: CartView; // lines, itemCount, subtotal, discountTotal, shippingTotal, total, discount, deliveryZone, errors, currency, freeShippingOver
  loading: boolean;
  pending: boolean;
  drawerOpen: boolean;
  openDrawer(): void;
  closeDrawer(): void;
  add(input: { productId: string; variantId?: string | null; quantity?: number; optimistic?: {…} }, opts?: { openDrawer?: boolean; silent?: boolean }): Promise<boolean>;
  update(key: string, quantity: number): Promise<void>;
  remove(key: string): Promise<void>;
  applyDiscount(code: string): Promise<{ ok: boolean; error?: string }>;
  removeDiscount(): Promise<void>;
  refresh(): Promise<void>;
  setCart(cart: CartView): void;
};
```

Updates are optimistic and reconciled with the server. The cart talks to the storefront's cart endpoints under the tenant base: `GET {base}/api/cart`, `POST {base}/api/cart/add`, `POST {base}/api/cart/update`, `POST {base}/api/cart/remove`, `POST`/`DELETE {base}/api/cart/discount`.

Ready-made cart UI: `CartButton`, `CartCount`, `CartDrawer`, `CartPageView`, `CartLineItem`, `CartTotals`, `DiscountForm`, `FreeShippingBar`.

#### Product form

`ProductProvider` keeps price, variant picker, gallery, stock and buttons in sync — and mirrors the selected variant in `?variant=` so it can be shared:

<sub>`themes/monsoon/src/components/buy-box.tsx`</sub>

```tsx
import type { SfProduct } from "@pai/theme-sdk";
import { ProductProvider, ProductPrice, VariantPicker, StockIndicator, AddToCartButton, BuyNowButton, ProductGallery } from "@pai/theme-kit/client";

export function BuyBox({ product }: { product: SfProduct }) {
  return (
    <ProductProvider product={product}>
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} layout="thumbnails-left" />
        <div className="flex flex-col gap-5">
          <h1 className="pai-h2">{product.title}</h1>
          <ProductPrice />
          <VariantPicker style="swatch" />
          <StockIndicator lowStockThreshold={5} />
          <AddToCartButton block size="lg" />
          <BuyNowButton />
        </div>
      </div>
    </ProductProvider>
  );
}
```

This file has no `"use client"` directive: it's a Server Component that renders the kit's client components, passing the product as a prop.

| Export | Description |
| --- | --- |
| `ProductProvider`, `useProductForm()` | Selection state: `selected`, `setOption`, `variant`, `price`, `compareAtPrice`, `available`, `inventory`, `imageUrl`, `quantity`, `setQuantity`, `needsSelection`. |
| `VariantPicker` | `style`: `"buttons"`, `"dropdown"` or `"swatch"`. Unavailable combinations are greyed out. |
| `ProductPrice`, `StockIndicator`, `QuantitySelector` | Live price, stock level ("Only 3 left") and quantity stepper. |
| `AddToCartButton`, `BuyNowButton` | Use the provider's selection, or an explicit `product`/`variantId` outside a provider. "Buy now" can go straight to checkout (theme setting). |
| `ProductGallery` | Thumbnails (bottom/left), grid or stacked layouts; swipe, zoom lightbox and variant image sync. |
| `StickyAddToCart` | Mobile sticky bar that appears when the main add-to-cart scrolls out of view. |
| `TrackProductView` | Fires `ViewContent` once. |
| `QuickView`, `QuickAddButton` | Quick view dialog and quick add from product cards. |

#### Navigation, search and forms

| Export | Description |
| --- | --- |
| `HeaderShell`, `MobileMenu`, `MenuDropdown`, `AccountLink` | Sticky/transparent header behaviour, accessible mobile drawer and dropdown menus. |
| `SearchBox`, `SearchToggle` | Search with predictive results from `{base}/api/search`. |
| `SortSelect`, `CollectionFilters`, `FilterDrawerButton`, `SORT_OPTIONS` | Collection sorting and filtering via URL query parameters. |
| `ContactForm`, `LoginForm`, `RegisterForm`, `NewsletterForm` | Storefront forms. Customers log in with a phone number or email; registration requires a phone number. |

#### Widgets

`Accordion`, `Tabs`, `Carousel`, `Slideshow`, `Countdown` (`<Countdown to={iso} />`), `WishlistButton` / `useWishlist`, `ShareButtons`, `VideoPlayer`, and `ToastProvider` / `useToast`.

> [!TIP]
> The kit's `Countdown` is a drop-in alternative to the hand-written countdown in the [promo banner example](https://paicommerce.com/docs/themes/sections#a-complete-example-promo-banner): `import { Countdown } from "@pai/theme-kit/client"` and render `<Countdown to={settings.ends_at} />`.

### Styling with the kit

The storefront loads `@pai/theme-kit/styles.css`, which maps the theme's CSS variables to Tailwind tokens and component classes:

| Tailwind utility | Maps to |
| --- | --- |
| `bg-pai-bg`, `text-pai-fg`, `bg-pai-primary`, `text-pai-primary-fg`, `bg-pai-accent`, `bg-pai-muted`, `border-pai-border`, `text-pai-sale`, `bg-pai-card` | The colour variables (opacity modifiers work: `text-pai-fg/70`) |
| `font-heading`, `font-body` | `--pai-font-heading`, `--pai-font-body` |
| `rounded-pai`, `rounded-pai-btn` | `--pai-radius`, `--pai-button-radius` |
| `animate-pai-marquee`, `animate-pai-fade`, `animate-pai-slide-in` | Kit animations |

Component classes: `pai-section`, `pai-h1` … `pai-h4`, `pai-eyebrow`, `pai-btn` with `pai-btn-primary | secondary | outline | accent | light | ghost | link` and `pai-btn-sm | lg | block`, and colour schemes `pai-scheme-muted | inverse | primary | accent`.

`kitCssVariables` extends `defaultCssVariables` with colour-scheme tokens (`--pai-scheme-inverse-bg`, `--pai-scheme-primary-muted` …), `--pai-card`, `--pai-heading-transform` (from `heading_case`) and `--pai-logo-width`.

```tsx
<div className="rounded-pai border border-pai-border bg-pai-card p-6">
  <h3 className="font-heading text-lg">Cash on delivery</h3>
  <p className="text-pai-fg/70">Pay when your parcel arrives — anywhere in Bangladesh.</p>
  <a className="pai-btn pai-btn-primary mt-4" href={context.url("/collections/all")}>Shop now</a>
</div>
```

---

## Styling & design tokens

Themes are styled with **Tailwind CSS 4 utility classes** plus a small set of **CSS custom properties** generated from the merchant's global settings. Merchants change colours, fonts and corner radius in the customizer; your sections pick them up automatically through the variables.

### How theme styles reach the page

When the storefront renders your theme it:

1. Resolves the global settings (`resolveThemeSettings`).
2. Converts them into CSS variables with `theme.cssVariables` — or `defaultCssVariables` if you don't provide one.
3. Emits those variables on a root element carrying the class `pai-theme-<slug>`.
4. Injects your `theme.css` string, scoped under `.pai-theme-<slug>`.
5. Loads the Google Fonts named by the settings listed in `theme.fontSettings`.

### Design tokens

`defaultCssVariables` maps the [standard setting ids](https://paicommerce.com/docs/themes/settings#standard-global-settings-and-css-variables) to these variables:

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

#### Using tokens with Tailwind

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
> Themes built on [`createBaseTheme`](https://paicommerce.com/docs/themes/theme-kit) get the Theme Kit's stylesheet, which maps these variables to semantic utility classes and adds colour-scheme classes (`pai-scheme-muted`, `pai-scheme-inverse`, `pai-scheme-primary`, `pai-scheme-accent`) for alternating section backgrounds.

#### Tailwind class detection

Theme packages ship source, and the storefront's Tailwind build scans the `themes/` directory for class names. Two rules follow from that:

- **Write complete class names.** Tailwind can't see classes you build by concatenation: use `const HEIGHT = { sm: "min-h-[320px]", lg: "min-h-[620px]" }` rather than `` `min-h-[${px}px]` ``.
- **Use inline styles for truly dynamic values** — an opacity from a range setting, a merchant-picked colour: `style={{ opacity: settings.overlay_opacity / 100 }}`.

### Custom variables: `cssVariables`

Need more tokens? Provide your own mapper. Start from `defaultCssVariables` so you keep the standard ones:

<sub>`themes/monsoon/src/index.ts`</sub>

```ts
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

### Theme CSS: `css`

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

### Fonts

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

#### Bangla typography

Many stores publish product names and descriptions in Bangla. Latin-only display fonts fall back to the system Bangla font, which can look mismatched. Good practice:

- Offer **Hind Siliguri** (included in `FONT_CHOICES`) as the body font in at least one preset.
- Keep `line-height` at 1.5 or more for body text — Bangla conjuncts need vertical room.
- Avoid `text-transform: uppercase` on content that may be Bangla; it has no effect and breaks the visual rhythm your design expects.

### Colour contrast

Merchants can pick any colours, so design for it:

- Pair every background token with its foreground token (`--pai-primary` / `--pai-primary-fg`).
- When a merchant picks a colour for a single section (like the promo banner's `text_color`), give the setting a safe default and mention contrast in the `info` text.
- Test every preset with a contrast checker before submitting — see the [checklist](https://paicommerce.com/docs/themes/checklist).

---

## Customizer integration

The **theme customizer** in the merchant dashboard (`Online store → Themes → Customize`) is a split view: a sidebar that edits the store's `ThemeConfig`, and an iframe showing the live storefront. You don't need to write any customizer code — but understanding how it works helps you build sections that feel great to edit.

### Draft and published configs

A store's installed theme (`store_themes` row) holds two documents:

| Column | Meaning |
| --- | --- |
| `config` | The **published** `ThemeConfig` that shoppers see. `null` = theme default + preset. |
| `draftConfig` | Unsaved customizer edits. `null` = no pending changes. |

While editing, the customizer saves changes to `draftConfig`. The preview iframe loads the store through a signed preview URL:

```text
http://localhost:3003/preview/{token}/            # home page
http://localhost:3003/preview/{token}/products/…  # any storefront path
```

The token is created by the dashboard (`signPreviewToken`) and identifies the store theme being edited. The preview renders `draftConfig ?? config` with `context.isPreview = true`. **Publish** copies the draft to `config` and clears the draft; shoppers see the change immediately (the store's cache tag is revalidated).

Because preview URLs live under `/preview/{token}`, links built with `context.url()` keep the merchant inside the preview as they click around. Hard-coded `/products/...` links would break out of it.

### Section wrappers

`RenderSections` wraps every section it renders:

```html
<div id="section-hero" data-pai-section="hero" data-pai-section-type="promo-banner" style="display: contents">
  <section>…your markup…</section>
</div>
```

Header and footer sections also carry `data-pai-group="header"` / `"footer"`. The customizer uses these attributes to:

- **highlight** the section under the mouse (and the one selected in the sidebar),
- **select** a section when the merchant clicks it in the preview,
- **scroll** the preview to a section when it's selected in the sidebar.

Your responsibilities are small:

- **Render a single root element.** Because the wrapper uses `display: contents`, the preview scrolls to your section's first element when it is selected. Fragments with several top-level siblings scroll and highlight unpredictably.
- **Don't reuse `section-{id}` ids** for your own elements.
- **Expect a preview badge.** The preview shows a small "Preview · changes are not live yet" pill in the bottom-left corner; don't place critical UI there.

### The preview protocol

The dashboard (parent window) and the storefront preview (iframe) talk over `window.postMessage`. The message types are exported from `@pai/theme-sdk/preview-protocol`:

```ts
import { isEditorMessage, isPreviewMessage, type EditorToPreview, type PreviewToEditor } from "@pai/theme-sdk/preview-protocol";

// Customizer → preview
type EditorToPreview =
  | { source: "pai-editor"; type: "refresh" }
  | { source: "pai-editor"; type: "select-section"; sectionId: string | null }
  | { source: "pai-editor"; type: "hover-section"; sectionId: string | null }
  | { source: "pai-editor"; type: "navigate"; path: string };

// Preview → customizer
type PreviewToEditor =
  | { source: "pai-preview"; type: "ready"; path: string; template: string }
  | { source: "pai-preview"; type: "section-click"; sectionId: string; group?: string }
  | { source: "pai-preview"; type: "navigated"; path: string; template: string };
```

| Message | When |
| --- | --- |
| `ready` | The preview page has loaded. Carries the current path and template so the sidebar shows the right section list. |
| `refresh` | The draft was saved; the preview re-renders the server components with the new config. |
| `select-section` / `hover-section` | The merchant selected or hovered a section in the sidebar; the preview outlines and scrolls to it. |
| `section-click` | The merchant clicked a section in the preview; the sidebar opens its settings. |
| `navigate` / `navigated` | The merchant switched template in the sidebar's page picker, or navigated inside the preview. |

The storefront implements the preview side for you. Theme code only needs the protocol if it builds custom preview behaviour — for example, a slideshow that jumps to the slide containing the selected block:

<sub>`themes/monsoon/src/sections/slideshow/slideshow-client.tsx`</sub>

```tsx
"use client";

import { useEffect } from "react";
import { isEditorMessage } from "@pai/theme-sdk/preview-protocol";

export function useSelectedSection(sectionId: string, onSelect: () => void) {
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!isEditorMessage(e.data)) return;
      if (e.data.type === "select-section" && e.data.sectionId === sectionId) onSelect();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sectionId, onSelect]);
}
```

Only run this in preview mode — pass `context.isPreview` down as a prop and skip the listener otherwise.

### Designing for the customizer

#### Placeholders when content is missing

A freshly added section must never be invisible. When required content is missing and `context.isPreview` is true, render a placeholder that tells the merchant what to do; in production, render nothing (or a graceful fallback):

```tsx
function ImageWithText({ settings, context }: SectionProps<{ image: string; heading: string }>) {
  if (!settings.image && !settings.heading) {
    if (!context.isPreview) return null;
    return (
      <section className="mx-auto max-w-[var(--pai-container)] px-4 py-16">
        <div className="grid h-64 place-items-center rounded-[var(--pai-radius)] border-2 border-dashed border-[var(--pai-border)] text-sm opacity-60">
          Add an image and a heading in the sidebar
        </div>
      </section>
    );
  }
  // …
}
```

Theme Kit sections use sample products and images from `@pai/theme-kit` as placeholders, so a product grid pointed at an empty collection still looks like a product grid in the preview.

#### No side effects in preview

The preview is a real storefront render. Avoid anything that would pollute the merchant's data or analytics when `context.isPreview` is true: auto-opening popups, firing custom tracking pixels, or starting autoplaying video with sound. (Platform analytics and marketing pixels are already disabled in preview.)

#### Fast re-renders

Every edit triggers a server re-render of the preview. Keep sections cheap: fetch only what you render, avoid heavy client-side initialisation, and don't block rendering on third-party scripts.

---

## Local development

You develop themes against a real storefront with real (seeded) data. There is no separate theme dev server: the storefront transpiles your theme's source directly, so edits appear with Fast Refresh.

### Start the apps

After the [Quickstart](https://paicommerce.com/docs/quickstart) setup, you need two apps for theme work:

```bash
$ pnpm --filter @pai/storefront dev   # http://localhost:3003
$ pnpm --filter @pai/dashboard dev    # http://localhost:3001 — for the customizer
```

Or just run everything with `pnpm dev`.

### Demo stores

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

### Install your theme on a store

To try your theme on any store — for example your own test store with realistic data:

1. Log in to the dashboard at `http://localhost:3001`.
2. Go to **Online store → Themes**. Locally, every theme registered in `@pai/theme-registry` is available in the theme library, including themes that haven't been through Theme Store review.
3. Click **Add theme** on yours, choose a preset, then **Customize** to open the customizer or **Publish** to make it live on the store.

The store's live theme is rendered at `http://<store-slug>.localhost:3003`.

### Preview in the customizer

**Customize** opens the customizer with your theme in the preview iframe (served from `/preview/{token}/…` on the storefront). Use it to check:

- every section's settings update the preview as expected;
- sections added from the "Add section" picker look finished without edits (good defaults and presets);
- placeholders appear for empty settings (`context.isPreview`);
- each template in the page picker (Home, Product, Collection, Cart, Search, Blog, …) renders.

See [Customizer integration](https://paicommerce.com/docs/themes/customizer) for how the preview works.

### Typecheck and validate

```bash
$ pnpm --filter @pai-theme/monsoon typecheck
$ node tools/create-theme/validate.mjs monsoon
```

Run both before every commit — see [Validation](https://paicommerce.com/docs/themes/validation).

### Debugging tips

**The storefront shows the default theme instead of mine.** Your slug isn't in `themeLoaders` — `loadTheme()` falls back to the default theme for unknown slugs. Check `packages/theme-registry/src/index.ts` and run `pnpm install`.

**`Module not found: @pai-theme/monsoon`.** The workspace link is missing. Run `pnpm install` at the repo root after the theme is added to `packages/theme-registry/package.json`.

**"Unknown section type" boxes in the preview.** The stored config references a section `type` your theme doesn't define — usually after renaming a section. Rename it back, or reset the theme in the customizer.

**Tailwind classes have no effect.** The class is built dynamically (`` `bg-${color}` ``) and Tailwind can't detect it. Use complete class names or inline styles — see [Styling](https://paicommerce.com/docs/themes/styling#tailwind-class-detection).

**Hydration errors.** A client component rendered something different on the server and the client — typically `Date.now()`, `Math.random()` or `window` during render. Initialise such values in `useEffect`, as the promo banner's countdown does.

**Links jump out of the customizer or to the wrong store.** A link was hard-coded (`href="/cart"`). Use `context.url("/cart")`.

---

## Validation

Themes are validated in two layers:

1. **`validateTheme(theme)`** from `@pai/theme-sdk` — structural checks on a `ThemeDefinition`. It's a plain function you can call anywhere (tests, CI, the admin review queue).
2. **`tools/create-theme/validate.mjs`** — loads your theme from source, runs `validateTheme`, and adds **Theme Store checks** (price, block types, presets, duplicate ids…).

A theme must have **zero errors** to be submitted. Warnings don't block submission, but reviewers read them.

### Running the validator

```bash
$ node tools/create-theme/validate.mjs monsoon            # one theme
$ node tools/create-theme/validate.mjs monsoon aurora     # several themes
$ node tools/create-theme/validate.mjs --all              # every theme in /themes
$ pnpm --filter @pai-theme/monsoon validate               # the theme's own script
```

| Flag | Description |
| --- | --- |
| `--all` | Validate every theme that has a `src/index.ts` in `/themes`. |
| `--json` | Print the raw results as JSON (for CI annotations and dashboards). |
| `--strict` | Treat warnings as errors. Recommended in CI before a submission. |
| `-h`, `--help` | Show help. |

**Exit codes:** `0` — no errors (warnings allowed unless `--strict`); `1` — errors, or a theme could not be loaded; `2` — usage error (unknown flag, invalid slug, theme not found).

Themes are TypeScript/TSX, so the validator runs them through `tsx`, which ships with the monorepo (`packages/db` dev dependency). If a theme fails to load, the validator prints the first lines of the error and a hint — most often "run `pnpm install`" for a freshly created theme.

#### Example output

```text
◆ aurora themes/aurora
  theme      Aurora v1.0.0 · free · fashion, jewelry, general
  sections   37 (header 2, footer 1 in default config)
  templates  index(8) product(3) collection(1) collections(1) search(1) cart(2) page(1) blog(1) article(2) account(1) 404(1)
  settings   41 in 10 groups
  presets    Fashion & Apparel [fashion], Jewelry & Accessories [jewelry], General Store / Multi-category [general]
  ✔ valid

✔ 1 theme(s) valid
```

With problems:

```text
◆ monsoon themes/monsoon
  ✖ error   sections[38].blocks.perk duplicate block type
  ✖ error   defaultConfig.templates.index.order order references missing section "testimonials"
  ✖ error   manifest.price price must be a non-negative integer in BDT minor units
  ⚠ warning sections[39] (monsoon-lookbook) no presets — merchants can't add this section from the picker
  …
  ✖ 3 error(s), 1 warning(s)

✖ 1 of 1 theme(s) failed
```

### validateTheme rules

`validateTheme` returns a flat list of issues:

```ts
type ValidationIssue = { level: "error" | "warning"; path: string; message: string };
```

#### Manifest

| Path | Level | Rule |
| --- | --- | --- |
| `manifest.slug` | error | Must match `/^[a-z0-9][a-z0-9-]{1,40}$/` — lowercase letters, digits and hyphens, starting with a letter or digit, 2–41 characters. |
| `manifest.name` | error | Required (non-empty). |
| `manifest.version` | error | Must start with `MAJOR.MINOR.PATCH` (`/^\d+\.\d+\.\d+/`). Pre-release suffixes like `1.2.0-beta.1` pass. |
| `manifest.categories` | error | At least one business category. |
| `manifest.thumbnail` | warning | Recommended for the Theme Store. |

#### Sections

For each entry in `theme.sections` (reported as `sections[i]`):

| Path | Level | Rule |
| --- | --- | --- |
| `sections[i]` | error | `schema.type` is required (other checks for that section are skipped). |
| `sections[i]` | error | Section types must be unique across the theme — `duplicate section type "…"`. |
| `sections[i]` | error | `component` must be a function (a React function component, sync or async). |
| `sections[i].settings.<id>` | error | Setting ids must be unique within the section (`header` fields are ignored). |

#### Default config

| Path | Level | Rule |
| --- | --- | --- |
| `defaultConfig.groups.header.order`, `defaultConfig.groups.footer.order`, `defaultConfig.templates.<t>.order` | error | Every id in `order` must exist in that list's `sections` — `order references missing section "…"`. |
| `….sections.<id>` | error | Every section instance must use a section `type` the theme defines — `unknown section type "…"`. |
| `defaultConfig.templates.index` / `.product` / `.collection` / `.cart` | error | These four templates are required. |

#### Presets

| Path | Level | Rule |
| --- | --- | --- |
| `presets.<id>.templates.<t>.order` | error | `order` must reference existing section instances. |
| `presets.<id>.templates.<t>.sections.<id>` | error | Section types must exist in the theme. |

### Theme Store checks (validate.mjs)

On top of `validateTheme`, the CLI validator checks:

| Path | Level | Rule |
| --- | --- | --- |
| `manifest.slug` | error | Must match the theme's folder name. |
| `manifest.price` | error | Must be a non-negative **integer** in BDT minor units. |
| `manifest.thumbnail` | warning | Should be an `https://images.unsplash.com/photo-…` URL (or your own screenshot at review time); verify with `node tools/verify-images.mjs`. |
| `manifest.description` | warning | Recommended for the Theme Store. |
| `sections[i] (<type>)` | warning | A section with no `presets`, no `group` and no `templates` restriction can't be added from the "Add section" picker. |
| `sections[i].blocks.<type>` | error | Block types must be unique within a section. |
| `sections[i].presets[j]` | error | Section presets may only use block types the section declares. |
| `presets.<id>` | error | Theme preset ids must be unique. |
| `settingsSchema.<group>.<id>` | error | Global setting ids must be unique across all groups. |

### What validation does not cover

Validation is structural. It does **not** check:

- that a section instance's settings and blocks match its schema, or that `templates` / `group` / `limit` restrictions are respected by your configs;
- preset `groups` (only preset `templates` are checked);
- rendering, accessibility or performance.

Those are covered by the [performance & accessibility checklist](https://paicommerce.com/docs/themes/checklist) and human review. A good habit is a small render test that renders every template of your default config and every preset against sample data (`SAMPLE_PRODUCTS` and friends from `@pai/theme-kit`).

### In tests and CI

```ts
import { validateTheme } from "@pai/theme-sdk";
import theme from "@pai-theme/monsoon";

const errors = validateTheme(theme).filter((i) => i.level === "error");
if (errors.length) throw new Error(errors.map((e) => `${e.path}: ${e.message}`).join("\n"));
```

```bash
# CI step
$ node tools/create-theme/validate.mjs monsoon --strict --json > validation.json
```

---

## Performance & accessibility checklist

Most PaiCommerce shoppers arrive from a Facebook or Instagram ad, on a mid-range Android phone, over a 4G connection that is often congested. A theme that feels instant there converts; one that doesn't burns the merchant's ad budget. Reviewers test every submission against this checklist.

### Performance targets

Measured with Lighthouse (mobile, simulated throttling) and field data from demo stores:

| Metric | Target |
| --- | --- |
| Largest Contentful Paint (LCP) | **< 2.5 s** |
| Interaction to Next Paint (INP) | **< 200 ms** |
| Cumulative Layout Shift (CLS) | **< 0.1** |
| Lighthouse Performance, mobile (home, collection, product) | **≥ 90** |
| Lighthouse Accessibility, mobile (home, collection, product) | **≥ 95** |
| Client JavaScript added by the theme (gzip) | **≤ 60 KB** on the home page |

### Performance

- [ ] **Server Components by default.** Only interactive leaves (`"use client"`) ship JavaScript: cart drawer, variant picker, image gallery, countdown. Never mark a whole section as a client component just to use one hook.
- [ ] **Pass minimal props to client components.** Send `{ id, title, price }`, not the full `SfProduct` with every image and variant, across the server/client boundary.
- [ ] **Hero image is prioritised.** The first above-the-fold image uses `fetchPriority="high"` and no `loading="lazy"`; every other image uses `loading="lazy"`.
- [ ] **Images have dimensions.** Use `width`/`height` attributes or an aspect-ratio box (`aspect-square`, `aspect-[4/5]`) so nothing shifts while images load.
- [ ] **Sensible image sizes.** Merchant images come from the media library and Unsplash-style CDNs; request appropriate widths where the host supports it, and use `sizes`/`srcSet` for grids.
- [ ] **Fetch only what you render.** Pass `limit` to `getProducts`; never load a whole collection to show four products.
- [ ] **At most two font families**, loaded through `fontSettings` (which uses `display=swap`). No `@import` of extra font CSS.
- [ ] **No layout shift from late content.** Announcement bars, cookie notices and cart counts reserve their space.
- [ ] **No third-party runtime scripts.** Chat widgets, pixels and analytics are platform integrations the merchant configures — themes must not embed their own.
- [ ] **Carousels don't autoplay by default**, and never autoplay video with sound.
- [ ] **Theme CSS stays small** (≤ 15 KB). Prefer utilities.

### Accessibility (WCAG 2.1 AA)

- [ ] **Landmarks:** one `<header>`, one `<main id="main">`, one `<footer>`; sections use `<section aria-labelledby>`.
- [ ] **Skip link:** the first focusable element is "Skip to content" targeting `#main`.
- [ ] **One `<h1>` per page** (product title, collection title, page title; the store name or hero heading on the home page) and no skipped heading levels.
- [ ] **Keyboard:** every interactive element is reachable and operable with the keyboard; focus order follows visual order; no keyboard traps (drawers and modals trap focus *while open* and restore it on close).
- [ ] **Visible focus:** focus rings are clearly visible on every background preset — don't remove outlines without a replacement.
- [ ] **Buttons vs links:** navigation uses `<a href>`, actions use `<button type="button">`.
- [ ] **Labels:** every form field has a `<label>`; icon-only buttons have `aria-label` ("Open cart", "Remove Jamdani Saree from cart").
- [ ] **Alt text:** product images use `image.alt ?? product.title`; decorative images use `alt=""`.
- [ ] **Contrast:** text meets 4.5:1 (3:1 for large text) in **every preset**, including text over images (use an overlay).
- [ ] **Motion:** respect `prefers-reduced-motion` for parallax, marquees and animated transitions.
- [ ] **Live regions:** cart updates and "Added to cart" confirmations are announced (`aria-live="polite"`).
- [ ] **Touch targets** are at least 44 × 44 px on mobile.
- [ ] **Zoom & small screens:** the layout works from 360 px to wide desktop, and at 200% zoom, without horizontal scrolling.
- [ ] **Variant pickers** expose state: selected options use `aria-pressed` or radio semantics; unavailable options are announced as such.

### Commerce correctness

- [ ] Prices always use `context.formatMoney()` — no manual division by 100.
- [ ] Sale prices show the compare-at price struck through and are not conveyed by colour alone.
- [ ] Variant selection updates price, availability, SKU and image.
- [ ] Sold-out products and variants can't be added to the cart and are clearly labelled.
- [ ] Every internal link uses `context.url()` (or a resource's `url`) and works under `/s/<slug>` and in the customizer preview.
- [ ] The footer shows "Powered by PaiCommerce" exactly when `context.store.showBranding` is `true`.
- [ ] Empty states exist for empty collections, no search results, an empty cart and a blog with no posts.
- [ ] Account pages work for customers with a phone number and **no email**.

### Bangla & localisation

- [ ] Long Bangla product titles wrap cleanly (no `truncate` on product-card titles without `title` attribute).
- [ ] At least one preset uses a Bangla-capable body font (e.g. *Hind Siliguri*), and line-height is ≥ 1.5 for body text.
- [ ] No text is baked into images; all copy is editable through settings.
- [ ] Demo and preset images are verified: `node tools/verify-images.mjs themes/<slug>`.
- [ ] Phone numbers and prices render correctly with the `৳` symbol and Bangladeshi number formats from the formatter.

### Customizer experience

- [ ] Every section has an `icon`, a `description` and at least one preset (except template sections).
- [ ] Settings have defaults that look finished; related settings are grouped with `header` fields.
- [ ] `info` text explains non-obvious settings (image sizes, what an empty value does).
- [ ] Empty required settings render a helpful placeholder in preview and nothing broken in production.
- [ ] Every preset renders all templates without errors, with the seeded demo store for its category.

### Tools

- Lighthouse in Chrome DevTools (mobile) or `npx lighthouse http://aurora-demo.localhost:3003 --preset=perf --form-factor=mobile`.
- Chrome DevTools → Performance → CPU 4× slowdown + "Fast 4G" network.
- axe DevTools or the Accessibility pane in Chrome for automated a11y checks — then test with the keyboard and a screen reader (TalkBack on Android, VoiceOver on macOS/iOS).

---

## Submitting to the Theme Store

The PaiCommerce Theme Store puts your theme in front of every merchant who signs up — and onboarding recommends themes by business category, so a great grocery or fashion theme gets seen by exactly the right stores. You keep **70% of every sale**.

### 1. Create a developer account

1. Click **Become a theme partner** on the [Theme partners](/developers) page. It opens sign-up with the developer intent — or log in if you already have a PaiCommerce account.
2. Complete your developer profile: display name, public slug (your partner page URL), website, bio and avatar.
3. Choose a payout method and payout email (see [payouts](#revenue-share-and-payouts)). This unlocks the **developer dashboard**, where you manage listings, submissions, sales and payouts.

Your developer profile is stored separately from your merchant stores — you can be a merchant and a theme partner with the same login. New partners start unverified; the **Verified partner** badge is granted after your first approved theme and a completed identity check for payouts.

### 2. Prepare your theme

Before submitting, make sure that:

- `node tools/create-theme/validate.mjs <slug>` reports **no errors** ([Validation](https://paicommerce.com/docs/themes/validation));
- the theme passes the [performance & accessibility checklist](https://paicommerce.com/docs/themes/checklist);
- `manifest.version` is bumped and `README.md` has a changelog entry for it;
- your theme has a **preset for every category** in `manifest.categories`, and each renders well with that category's demo store;
- `manifest.thumbnail` and `screenshots` show the theme with realistic content — no lorem ipsum, no competitor brands, and only images you have the rights to (Unsplash is fine).

### 3. Submit

From your developer dashboard, create a theme listing and submit a version:

- **Repository** — a Git URL reviewers can clone (a private GitHub repo with read access for `paicommerce-review` works). The repo must contain your `themes/<slug>` package.
- **Version** — must match `manifest.version`.
- **Changelog** — what changed, in plain language merchants will understand.
- **Demo content notes** — which demo store / preset best shows each feature.

Submitting creates a row in `theme_versions` with status `in_review` and adds it to the admin review queue.

Alternatively, open a pull request against the PaiCommerce repository titled `feat(theme-<slug>): …` that contains `themes/<slug>` and the registry entries the CLI generated. The review is the same either way.

Theme authors keep their copyright. By submitting, you grant PaiCommerce the right to distribute the theme to merchants through the Theme Store.

### Review statuses

A theme listing (`themes.status`) and each submitted version (`theme_versions.status`) move through the same states:

| Status | Meaning |
| --- | --- |
| `draft` | Listing created, nothing submitted yet. Only you can see it. |
| `in_review` | Submitted and waiting for, or undergoing, review. Typical turnaround: **5 business days** for a new theme, **2 business days** for an update. |
| `approved` | Live on the Theme Store (for a listing) or published to stores (for a version). `approvedAt` is set. |
| `rejected` | Changes required. Reviewer notes (`reviewNotes`) explain what to fix; resubmit a new version. |
| `unlisted` | Hidden from the Theme Store — by you or by the platform — but stores that already installed it keep it and continue to receive fixes. |

### Review guidelines

Reviewers install your theme on the demo store for each category, walk through every template and preset, and run the checklist. The most common reasons for rejection:

**Functionality**
- A template errors or renders empty with the demo data (empty states are required, errors are not acceptable).
- Links that ignore `context.url()` and break under `/s/<slug>` or in the customizer.
- Prices formatted manually instead of with `context.formatMoney()`.
- Sold-out variants that can still be added to the cart.
- The "Powered by PaiCommerce" credit ignores `store.showBranding`.

**Customizer**
- Sections that are invisible or broken right after being added (missing defaults or presets).
- Settings with unclear labels, no `info` for non-obvious behaviour, or ids renamed between versions (which wipes merchants' customisations).

**Performance & accessibility**
- Lighthouse mobile performance below 90, or accessibility below 95, on home, collection or product pages.
- Keyboard traps, missing focus styles, missing labels, insufficient contrast in any preset.

**Code & content policy**
- Third-party runtime dependencies beyond `@pai/theme-sdk`, `@pai/theme-kit`, React and `lucide-react`.
- Any network requests to your own servers, tracking scripts, obfuscated code, or code that reads cookies/storage it doesn't own.
- Licensing: all fonts, icons and images must be licensed for commercial redistribution.
- Misleading listing: screenshots or features the theme doesn't actually have.

### Pricing

Set your price in `manifest.price` in **BDT minor units** (poisha):

| Tier | Typical price | `price` |
| --- | --- | --- |
| Free | ৳0 | `0` |
| Standard | ৳1,900 – ৳3,900 | `190000` – `390000` |
| Premium | ৳4,900 – ৳6,900 | `490000` – `690000` |

We recommend pricing between **৳1,900 and ৳6,900** — the range merchants in Bangladesh buy most readily.

Free themes are a great way to build a reputation (installs and ratings show on your partner page). Premium themes are only available to stores on plans that include premium themes (Growth and above).

A merchant buys a theme **once per store** (recorded in `theme_purchases`) and receives all updates within the same major version. A new major version (`2.0.0`) may be sold as a new purchase only if it is a substantially new theme — otherwise it's an update.

### Revenue share and payouts

For every sale, the split is recorded on the purchase:

- **Developer share: 70%** — added to your developer balance (`developers.revenueSharePct` defaults to `70`).
- **Platform share: 30%** — covers payment processing, hosting of demo stores, review and marketing.

Verified partners with top-rated themes can qualify for an **80%** share; the percentage is stored per developer, so the split on each purchase always reflects your current rate.

Example: a ৳4,900 theme earns you ৳3,430.

| | Amount | Minor units |
| --- | --- | --- |
| Sale price | ৳4,900 | `490000` |
| Your share (70%) | ৳3,430 | `343000` |
| Platform share (30%) | ৳1,470 | `147000` |

Payouts run **monthly**, in the first week of the month, for the previous month's balance:

| Method | Currency | Notes |
| --- | --- | --- |
| Bank transfer (BEFTN) | BDT | Any Bangladeshi bank account in your legal name. |
| bKash | BDT | Personal or merchant wallet; subject to bKash transaction limits. |
| PayPal | USD | For partners outside Bangladesh. Converted at the payout-day rate. |
| Wise | USD / local currency | For partners outside Bangladesh. |

The **minimum payout is ৳5,000** (500000 poisha). Balances below the threshold roll over to the next month. Each payout appears in your developer dashboard with its status (`pending` → `processing` → `paid`, or `failed` with a reason) and a transfer reference.

### Versioning

Themes use **semantic versioning**, and every submission is a new `theme_versions` row:

| Change | Bump | Example |
| --- | --- | --- |
| Bug fixes, performance, copy | PATCH | `1.4.2` → `1.4.3` |
| New sections, settings, blocks or presets (backwards compatible) | MINOR | `1.4.3` → `1.5.0` |
| Removed or renamed section types / setting ids, or redesigned templates | MAJOR | `1.5.0` → `2.0.0` |

Rules that keep merchants safe:

- **Never rename a section `type`, block `type` or setting `id` in a minor or patch release.** Stored configs reference them; renaming silently resets merchants' work. Add new ids and keep reading the old ones until the next major.
- **New settings need defaults**, because existing stores won't have values for them.
- Approved updates roll out to every store using the theme. Merchants' `config` documents are untouched — only your code changes — which is exactly why ids must stay stable.

### After approval

- Your theme appears in the Theme Store with a live demo store at `https://<slug>-demo.paicommerce.com`.
- You can see installs, sales, ratings and reviews in your developer dashboard.
- Merchants contact you through `manifest.supportUrl` for theme-specific questions. Aim to respond within 3 business days — responsiveness is part of how partner quality is assessed.

Questions about the programme? Email **partners@paicommerce.com**.
