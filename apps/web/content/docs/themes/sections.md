---
title: Sections
description: Sections are async React Server Components paired with a SectionSchema. Learn the full schema reference, SectionProps, template and group restrictions, limits and presets — with a complete promo-banner example.
---

A **section** is a full-width, reorderable building block of a page: a hero banner, a product grid, testimonials, the main product area. Merchants add, remove, reorder and configure sections in the customizer; you define what each section *can* be.

A section is created with `defineSection` and has two parts:

- **`component`** — a React component (usually a Server Component) that receives `SectionProps`.
- **`schema`** — a `SectionSchema` describing its settings, blocks, where it can be used and how it appears in the "Add section" picker.

## A complete example: promo banner

This is the section used throughout the theme docs. It shows text settings, an image, select/radio/range/color/checkbox/datetime inputs, two block types, template restrictions, and two presets.

```tsx title="themes/monsoon/src/sections/promo-banner/index.tsx"
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

```tsx title="themes/monsoon/src/sections/promo-banner/countdown.tsx"
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

```ts title="themes/monsoon/src/index.ts"
import promoBanner from "./sections/promo-banner";

export default defineTheme({
  // …
  sections: [promoBanner /* , … */],
});
```

## SectionProps

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

## Async sections and data

Sections are React Server Components and can be `async`. Fetch whatever you need from `context.data` — it is request-scoped and tenant-aware:

```tsx title="themes/monsoon/src/sections/featured-products.tsx"
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

## SectionSchema reference

| Field | Type | Description |
| --- | --- | --- |
| `type` | `string` | **Required.** Unique section type within the theme, kebab-case (`"promo-banner"`). This is what `ThemeConfig` stores — don't rename it after release. |
| `name` | `string` | **Required.** Display name in the customizer. |
| `description` | `string` | Shown in the "Add section" picker. |
| `category` | `SectionCategory` | **Required.** Groups sections in the picker: `header`, `footer`, `hero`, `products`, `collections`, `content`, `media`, `social-proof`, `marketing`, `template`. |
| `icon` | `string` | A [lucide](https://lucide.dev/icons) icon name (PascalCase, e.g. `"Megaphone"`, `"LayoutGrid"`) for the customizer sidebar. |
| `settings` | `SettingField[]` | **Required** (may be empty). See [Settings reference](/docs/themes/settings). |
| `blocks` | `BlockSchema[]` | Block types the section accepts. See [Blocks](/docs/themes/blocks). |
| `maxBlocks` | `number` | Maximum total number of blocks across all types. |
| `templates` | `TemplateType[]` | Restrict the section to these templates. Omit to allow it everywhere. |
| `group` | `"header" \| "footer"` | Restrict the section to a section group. |
| `limit` | `number` | Maximum instances per template or group (e.g. the main product section: `1`). |
| `presets` | `SectionPreset[]` | Entries in the "Add section" picker. **A section without presets cannot be added by merchants** — it can only appear via your default config. |

### Categories

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

### Restricting to templates and groups

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

### Section presets

A `SectionPreset` is a named starting point for a new section instance. When a merchant picks it, the customizer calls `instantiateSection(schema, presetIndex)`, which applies your defaults, overlays the preset's `settings`, and creates the preset's blocks with fresh ids:

```ts
type SectionPreset = {
  name: string;
  settings?: SettingValues;
  blocks?: { type: string; settings?: SettingValues }[];
};
```

Offering two or three presets for the same section ("Promo banner", "Flash sale with countdown") is an easy way to make a theme feel richer without writing more components.

## Rendering pipeline

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

`display: contents` means the wrapper does not affect your layout. In the customizer preview, unknown section types render a visible warning instead of silently disappearing. See [Customizer integration](/docs/themes/customizer).

## Best practices

- **One job per section.** Prefer a focused "Image with text" section over a mega-section with 40 settings.
- **Semantic landmarks.** Wrap content in `<section aria-labelledby>` and give each section a heading (visually hidden if needed).
- **Design tokens over literals.** Use `var(--pai-primary)`, `var(--pai-radius)` and friends, so global settings restyle your section.
- **Graceful empties.** When a required setting is empty, render a helpful placeholder when `context.isPreview` is true and nothing (or a sensible fallback) in production.
- **Stable types and ids.** Changing a section `type` or setting `id` orphans merchants' saved configuration. Add new settings instead, and keep reading old ids for a version or two if you must migrate.
