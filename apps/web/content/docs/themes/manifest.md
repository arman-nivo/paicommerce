---
title: Theme manifest
description: The ThemeManifest describes your theme's Theme Store listing — slug, version, price in BDT minor units, categories, screenshots and support links.
---

The manifest is pure data: it describes your theme's listing on the Theme Store and is imported by the marketing site, the admin review queue and the seed script **without loading any React code**. That's why it lives in its own file and is exposed as a separate package export.

```ts title="themes/monsoon/src/manifest.ts"
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

```json title="themes/monsoon/package.json"
{
  "name": "@pai-theme/monsoon",
  "exports": {
    ".": "./src/index.ts",
    "./manifest": "./src/manifest.ts"
  }
}
```

## Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `slug` | `string` | Yes | Unique, URL-safe id. Lowercase kebab-case, 2–41 characters (`/^[a-z0-9][a-z0-9-]{1,40}$/`). Must match the Theme Store `themes.slug` and your folder name. **Never change it after publishing.** |
| `name` | `string` | Yes | Display name, e.g. `"Monsoon"`. |
| `version` | `string` | Yes | Semantic version (`1.4.2`). Bump it for every submission — see [versioning](/docs/themes/submitting#versioning). |
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

## Business categories

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

## Pricing

Prices are integers in **poisha** (1 BDT = 100 poisha), exactly like every other amount in PaiCommerce:

| Listing price | `price` value |
| --- | --- |
| Free | `0` |
| ৳2,500 | `250000` |
| ৳4,900 | `490000` |
| ৳9,900 | `990000` |

Merchants pay once per store and get free updates for that major version. You receive **70%** of the sale price; see [Submitting](/docs/themes/submitting#revenue-share-and-payouts).

> [!NOTE]
> The listing price in the Theme Store is taken from the `themes` table, which is populated from your manifest when your submission is approved. Changing `price` in a later version is treated as a price change and needs reviewer approval.
