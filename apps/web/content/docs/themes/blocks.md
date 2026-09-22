---
title: Blocks
description: Blocks are repeatable, reorderable items inside a section — slides, FAQ entries, badges, the parts of a product page. Define block types with BlockSchema and render BlockInstance lists.
---

Blocks let merchants compose the *inside* of a section. A slideshow has slide blocks; an FAQ has question blocks; the main product section has title, price, variant picker and buy-button blocks that merchants can reorder or hide.

## Defining block types

Block types are declared in the section schema's `blocks` array. Each `BlockSchema` has its own settings:

```ts
type BlockSchema = {
  type: string; // unique within the section, e.g. "badge"
  name: string; // shown in the customizer ("Badge")
  settings: SettingField[];
  limit?: number; // max instances of this block type in one section
};
```

The [promo banner](/docs/themes/sections#a-complete-example-promo-banner) declares two block types and caps the total with `maxBlocks`:

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

## Rendering blocks

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

### Rendering blocks in merchant order

When the order of different block types matters — typical for a product page — map over `blocks` once and switch on `type`:

```tsx title="themes/monsoon/src/sections/main-product.tsx"
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

`Gallery` and `BuyButtons` stand in for your own components — or use the ready-made ones from [`@pai/theme-kit`](/docs/themes/theme-kit).

## Blocks in presets and default config

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

## Guidelines

- **Use blocks for repetition and ordering**, settings for everything else. "Show vendor" is a setting; "a list of trust badges" is blocks.
- **Set `limit`** on block types that make no sense twice (a product title) and `maxBlocks` on the section so merchants can't build a 40-slide slideshow that tanks performance.
- **Ignore unknown types.** Return `null` for block types you don't recognise — a merchant may have a block from a newer version of your theme in their config.
- **Keep block settings small.** Two to five fields per block keeps the customizer usable on a laptop screen.
