---
title: Settings reference
description: Every SettingField type supported by the theme customizer, with the value it produces, an example for each, and the standard global setting ids that become CSS variables.
---

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

## Field types at a glance

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

## Text inputs

### text

A single-line text input. Use it for headings, button labels and short captions.

```ts
{ type: "text", id: "heading", label: "Heading", default: "Eid Collection is live", placeholder: "Your headline" }
```

### textarea

A multi-line plain-text input. Line breaks are preserved in the value — render with `whitespace-pre-line` if they matter.

```ts
{ type: "textarea", id: "subheading", label: "Subheading", default: "Up to 40% off. Free delivery inside Dhaka." }
```

### richtext

A rich-text editor that produces **HTML** (paragraphs, bold, italic, links, lists). Render it with `dangerouslySetInnerHTML` inside a typographic wrapper, and sanitise it first — `sanitizeHtml` from `@pai/theme-kit` strips scripts, event handlers and `javascript:` URLs.

```ts
{ type: "richtext", id: "body", label: "Text", default: "<p>Handwoven in Tangail by master weavers.</p>" }
```

```tsx
import { sanitizeHtml } from "@pai/theme-kit";

<div className="prose" dangerouslySetInnerHTML={{ __html: sanitizeHtml(settings.body) }} />;
```

### url

A link input. The value is either an absolute URL (`https://facebook.com/…`) or a **store-relative path** such as `/collections/eid-sale` or `/pages/about`.

```ts
{ type: "url", id: "cta_link", label: "Button link", placeholder: "/collections/eid-sale" }
```

> [!WARNING]
> Pass link values through `context.url()` before rendering them, so store-relative paths work on subdomains, custom domains **and** the `/s/<slug>` path fallback. Absolute URLs pass through unchanged: `href={context.url(settings.cta_link || "/collections/all")}`. (`resolveHref` from `@pai/theme-kit` does the same with a fallback.)

## Media

### image

An image picker backed by the store's media library. The value is an absolute URL. Always render a meaningful `alt` (usually from a sibling text setting, or `""` for decorative images).

```ts
{ type: "image", id: "image", label: "Background image", info: "2400 × 1200 px recommended" }
```

### video

A video URL — an uploaded MP4/WebM file or a YouTube/Vimeo link. `isVideoFile(url)` and `embedUrl(url, opts)` from `@pai/theme-kit` tell them apart and build privacy-friendly embed URLs.

```ts
{ type: "video", id: "video", label: "Video", info: "MP4 upload or a YouTube / Vimeo link" }
```

## Choices

### select

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

### radio

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

### checkbox

A toggle. The value is always a boolean (`false` when unset).

```ts
{ type: "checkbox", id: "show_countdown", label: "Show countdown timer", default: false }
```

## Numbers

### range

A slider. `min` and `max` are required; `step` defaults to 1, and `unit` is displayed next to the value (`px`, `%`, `s`).

```ts
{ type: "range", id: "overlay_opacity", label: "Image overlay", min: 0, max: 80, step: 5, unit: "%", default: 35 }
```

### number

A free numeric input with optional bounds. Prefer `range` when the useful interval is small.

```ts
{ type: "number", id: "free_shipping_threshold", label: "Free delivery threshold (৳)", min: 0, default: 2000 }
```

> [!NOTE]
> Settings values are what the merchant typed. If you store a *money* amount in a `number` setting, document whether it's in taka or poisha. The convention in PaiCommerce themes is **taka** for merchant-entered values (multiply by 100 before comparing with `SfProduct.price`).

## Design

### color

A colour picker. Values are hex strings (`#0f766e`). For global colours, use the [standard ids](#standard-global-settings-and-css-variables) so they become CSS variables automatically.

```ts
{ type: "color", id: "text_color", label: "Text color", default: "#ffffff" }
```

### font

A Google Fonts family picker. Pass `options` to restrict the list — `FONT_CHOICES` from `@pai/theme-sdk` is a curated list of 32 families that render well in English **and** Bangla (including *Hind Siliguri*).

```ts
import { FONT_CHOICES } from "@pai/theme-sdk";

{ type: "font", id: "font_heading", label: "Heading font", default: "Poppins", options: FONT_CHOICES }
```

List the setting ids of your font fields in `ThemeDefinition.fontSettings` so the storefront loads them — see [Styling](/docs/themes/styling#fonts).

## Store resources

Resource pickers store **slugs/handles**, never database ids, so configs remain portable between a demo store and a merchant's store. Resolve them at render time through `context.data`.

### product

A single product picker (value: product slug).

```ts
{ type: "product", id: "product", label: "Featured product" }
```

```tsx
const product = settings.product ? await context.data.getProduct(settings.product) : null;
```

### collection

A single collection picker (value: collection slug).

```ts
{ type: "collection", id: "collection", label: "Collection", info: "Leave empty to show best sellers." }
```

```tsx
const { items } = await context.data.getProducts({ collection: settings.collection || undefined, limit: 8 });
```

### product_list

A multi-product picker (value: `string[]` of slugs). `limit` caps how many can be chosen.

```ts
{ type: "product_list", id: "products", label: "Products", limit: 6 }
```

```tsx
const { items } = await context.data.getProducts({ slugs: settings.products, limit: settings.products.length });
```

### menu

A navigation menu picker (value: menu handle such as `main-menu` or `footer`). Merchants manage menus under **Online store → Navigation**.

```ts
{ type: "menu", id: "menu", label: "Menu", default: "main-menu" }
```

```tsx
const items = await context.data.getMenu(settings.menu); // SfMenuItem[] (with children)
```

### datetime

A date & time picker. The value is an ISO 8601 string — convenient for countdowns and scheduled announcements.

```ts
{ type: "datetime", id: "ends_at", label: "Offer ends at", info: "Uses the shopper's local time zone." }
```

## Organising fields

### header

Not an input: renders a heading that groups the fields below it in the customizer. It has no `id` and produces no value.

```ts
{ type: "header", label: "Countdown", info: "Show a timer until the offer ends." }
```

### Global settings groups

Global settings are grouped into panels — each `SettingsGroup` becomes a collapsible section in the customizer's **Theme settings** tab:

```ts title="themes/monsoon/src/settings.ts"
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

## Standard global settings and CSS variables

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

See [Styling & design tokens](/docs/themes/styling) for how to use them with Tailwind and how to add your own variables.
