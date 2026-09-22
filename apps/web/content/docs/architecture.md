---
title: Architecture
description: How the PaiCommerce monorepo is organised — apps, shared packages, multi-tenancy, themes, money, orders and the path to scale.
---

PaiCommerce is a TypeScript monorepo managed with **pnpm workspaces** and **Turborepo**. It contains four Next.js 16 apps and a set of shared packages. Workspace packages ship TypeScript source — there is no build step for them; each app transpiles them via `transpilePackages`.

## Monorepo layout

| Path | Package | Purpose | Port |
| --- | --- | --- | --- |
| `apps/web` | `@pai/web` | Marketing site, pricing, Theme Store, developer docs | 3000 |
| `apps/dashboard` | `@pai/dashboard` | Merchant panel: auth, onboarding, catalog, orders, theme customizer | 3001 |
| `apps/admin` | `@pai/admin` | Platform admin: merchants, plans, billing, theme review, developers, support | 3002 |
| `apps/storefront` | `@pai/storefront` | Multi-tenant storefront renderer, checkout and `/api/v1` | 3003 |
| `packages/db` | `@pai/db` | Drizzle schema, client and seed | |
| `packages/core` | `@pai/core` | Auth/session, permissions, money, pricing & order creation, payments, couriers, storage, AI | |
| `packages/ui` | `@pai/ui` | Design system for dashboard, admin and web | |
| `packages/theme-sdk` | `@pai/theme-sdk` | The theme contract: types, schema helpers, renderer, customizer protocol | |
| `packages/theme-kit` | `@pai/theme-kit` | Reusable storefront sections, commerce client components and `createBaseTheme` | |
| `packages/theme-registry` | `@pai/theme-registry` | Lazy loaders and manifests for every installed theme | |
| `themes/<slug>` | `@pai-theme/<slug>` | One package per theme | |
| `tools/create-theme` | — | `pnpm theme:new` scaffolder and validator | |

**Stack:** Next.js 16 (App Router, React Server Components, server actions) · React 19 · TypeScript · Tailwind CSS 4 · Drizzle ORM · PostgreSQL · jose (JWT) · zod · lucide-react · recharts · dnd-kit.

## Multi-tenancy

Every tenant-owned table carries a `store_id` column with an index, and **every query filters by `storeId`**. There is no shared-nothing database per tenant — isolation is enforced in the data-access layer, which keeps operations simple and makes cross-store analytics for the platform cheap.

The storefront resolves the tenant from the incoming request:

1. **Subdomain** — `{slug}.{STOREFRONT_ROOT_DOMAIN}`, e.g. `https://rongdhonu.paicommerce.com` (locally `http://rongdhonu.localhost:3003`).
2. **Custom domain** — a verified `stores.custom_domain`, e.g. `https://shop.rongdhonu.com.bd`.
3. **Path fallback** — `http://localhost:3003/s/{slug}/...`, useful where wildcard DNS is not available.
4. **Customizer preview** — `http://localhost:3003/preview/{token}/...`. The token is signed by the dashboard (`signPreviewToken`) and renders the store theme's `draftConfig ?? config`.

Because a store can live under any of these base paths, **themes must build every internal link with [`context.url(path)`](/docs/themes/context#building-urls)**.

## Authentication

| Who | Table | Cookie | Notes |
| --- | --- | --- | --- |
| Merchants, staff, platform admins, theme developers | `users` | `pai_session` (JWT) | Shared across apps. On localhost cookies are shared across ports, so a login on `:3001` also works on `:3002`. |
| Active store | — | `pai_store` | `requireStore({ permission })` resolves user + store + membership in one call. |
| Storefront customers | `customers` | `pai_customer` | Per-store token (kind `customer`, with `sid`). |
| API clients | `api_keys` | — | `Authorization: Bearer <key>`, see [REST API](/docs/api#authentication). |

Staff access is permission-based (`orders.view`, `orders.manage`, `products.manage`, `themes.manage`, `integrations.manage`, …) with role presets such as *Order processor* and *Catalog editor*. Owners and admins have every permission.

## Money

All amounts are **integers in minor units** — poisha for BDT, cents for USD. `৳1,250` is stored as `125000`. Use `formatMoney(minor, currency)` and `toMinor(major)` from `@pai/core` on the server; themes receive a pre-bound `context.formatMoney(amount)`.

> [!WARNING]
> Never store or compute prices as floating-point numbers. Courier APIs are the one exception: COD amounts are sent to couriers in major units (whole taka), and the conversion happens inside the courier adapters.

## Themes

Themes follow the Shopify *Online Store 2.0* model, with typed React instead of Liquid:

- A theme exports a `ThemeDefinition` from `@pai/theme-sdk`: a manifest, a global `settingsSchema`, `sections` (component + schema with settings and blocks), `presets` and a `defaultConfig`.
- A store's theme configuration (`store_themes.config`, and the unsaved `draftConfig`) is a `ThemeConfig` JSON document: global settings, header/footer groups and an ordered section list per template. `null` means "use the theme default (plus the chosen preset)".
- `resolveThemeConfig(theme, stored, presetId)` merges stored edits over the preset and the default.
- `RenderSections` renders a section list and wraps each section in a `data-pai-section` element for the customizer.
- Sections receive a `StorefrontContext` with the store, resolved theme settings, template resources and a `data: StorefrontDataAPI`. Themes never touch the database.
- Global settings with standard ids (`color_background`, `color_primary`, `font_heading`, `radius`, …) become CSS variables (`--pai-bg`, `--pai-primary`, `--pai-font-heading`, `--pai-radius`, …) via `defaultCssVariables`.

`@pai/theme-registry` maps theme slugs to lazy loaders so a storefront only loads the code of the theme it is rendering:

```ts title="packages/theme-registry/src/index.ts"
export const themeLoaders: Record<string, () => Promise<ThemeDefinition>> = {
  aurora: () => import("@pai-theme/aurora").then((m) => m.default),
  volt: () => import("@pai-theme/volt").then((m) => m.default),
  // … one entry per theme — `pnpm theme:new` adds yours
};

/** Load a theme by slug; unknown slugs fall back to the default theme. */
export function loadTheme(slug: string | null | undefined): Promise<ThemeDefinition>;
```

## Orders

`@pai/core/orders` is the single source of truth for pricing and order creation, used by storefront checkout, dashboard manual orders and the REST API alike:

- `priceCart` — validates lines against stock, applies discount codes and the delivery zone charge, and returns a fully priced cart.
- `createOrder` — one database transaction: atomic per-store order number, customer upsert (matched by phone/email), inventory decrement, discount usage, analytics counters and the order timeline.

Order state is split into three independent axes:

| Field | Values |
| --- | --- |
| `status` | `open`, `completed`, `cancelled`, `archived` |
| `paymentStatus` | `pending`, `authorized`, `paid`, `partially_refunded`, `refunded`, `failed` |
| `fulfillmentStatus` | `unfulfilled`, `confirmed`, `processing`, `shipped`, `delivered`, `returned`, `cancelled` |

## Scaling

The apps are stateless and designed to scale horizontally:

- **Compute:** stateless Next.js instances behind a CDN / load balancer.
- **Database:** PostgreSQL with read replicas and **PgBouncer** in transaction mode.
- **Caching:** per-store cache tags for storefront ISR — publishing a theme or editing a product calls `revalidateTag("store:{id}")`.
- **Media:** object storage (S3, Cloudflare R2, DigitalOcean Spaces) via `STORAGE_DRIVER=s3`.
- **Background jobs:** webhooks, transactional email/SMS and courier status sync run through a queue in production (BullMQ + Redis). The code paths are isolated in `@pai/core` so the in-process implementation can be swapped for a queue without touching callers.

See [Deployment](/docs/deployment) for a production checklist.
