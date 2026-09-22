---
title: Presets
description: Theme presets are ready-made starting configurations per business category; section presets populate the "Add section" picker. Learn how both are merged into a store's ThemeConfig.
---

PaiCommerce has two kinds of presets:

| | Theme preset (`ThemePreset`) | Section preset (`SectionPreset`) |
| --- | --- | --- |
| Where | `ThemeDefinition.presets` | `SectionSchema.presets` |
| Purpose | A complete starting look for a business category — "Fashion", "Grocery", "Beauty" | An entry in the customizer's "Add section" picker |
| Applied | When a merchant installs the theme or switches preset | When a merchant adds a section |
| Contains | Global setting overrides, and optionally full templates and groups | Setting overrides and starter blocks for one section |

## Theme presets

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

```ts title="themes/monsoon/src/presets.ts"
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

### How presets are merged

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

### Guidelines for theme presets

- **Ship at least one preset per category** listed in your manifest. Reviewers check this.
- **Change more than colours.** The best presets also swap fonts, corner radius and the home page layout — grocery stores want category tiles and deals up top; fashion wants imagery.
- **Reference demo content by slug.** Collection and product settings in presets should use slugs that exist in the seeded demo store for that category (e.g. `skincare`, `new-arrivals`). In a merchant's store, missing slugs simply render an empty state.
- **Keep `id` stable.** Stores remember their preset id; renaming it makes those stores fall back to the default.

## Section presets

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
