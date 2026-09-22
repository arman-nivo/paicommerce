---
title: Theme structure
description: The files and folders of a PaiCommerce theme package, how it is registered in the theme registry, and how the pieces map to the ThemeDefinition.
---

A theme is a workspace package in `themes/<slug>`, named `@pai-theme/<slug>`. It ships TypeScript source — no build step — and is transpiled by the storefront, dashboard and marketing site.

## Directory layout

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

## package.json

```json title="themes/monsoon/package.json"
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
- **Dependencies** are limited to `@pai/theme-sdk`, `@pai/theme-kit` and peer `react`. Icons from `lucide-react` are available. Other third-party runtime dependencies are not accepted in Theme Store themes — see [review guidelines](/docs/themes/submitting#review-guidelines).

## The theme definition

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
| `manifest` | [Manifest](/docs/themes/manifest) |
| `settingsSchema` | [Settings reference](/docs/themes/settings) |
| `sections` | [Sections](/docs/themes/sections), [Blocks](/docs/themes/blocks) |
| `defaultConfig` | [below](#default-config) |
| `presets` | [Presets](/docs/themes/presets) |
| `css`, `cssVariables`, `fontSettings` | [Styling](/docs/themes/styling) |
| `Layout` | [below](#custom-layout) |

### Default config

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

### Custom layout

By default the storefront renders `header group → <main> template sections → footer group`. Provide `Layout` to wrap them differently — for example to add a sticky mobile bottom bar or a cart drawer that lives outside `<main>`:

```tsx title="themes/monsoon/src/layout.tsx"
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

## Registering the theme

The storefront discovers themes through `@pai/theme-registry`. A theme must be added in three places (the [Theme CLI](/docs/themes/cli) does this for you):

```ts title="packages/theme-registry/src/index.ts"
export const themeLoaders: Record<string, () => Promise<ThemeDefinition>> = {
  // …
  monsoon: () => import("@pai-theme/monsoon").then((m) => m.default),
};
```

```ts title="packages/theme-registry/src/manifests.ts"
import { manifest as monsoon } from "@pai-theme/monsoon/manifest";

export const manifests: ThemeManifest[] = [/* …, */ monsoon];
```

```json title="packages/theme-registry/package.json"
{
  "dependencies": {
    "@pai-theme/monsoon": "workspace:*"
  }
}
```

Then run `pnpm install` so the workspace link is created. The Next.js apps pick up every package in `themes/` automatically for transpilation — no config change needed.
