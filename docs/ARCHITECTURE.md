# PaiCommerce — Architecture

PaiCommerce is a multi-tenant e-commerce SaaS (think Shopify × Zatiq, built for Bangladesh and emerging markets first).

## Monorepo layout

| Path | What | Port |
|---|---|---|
| `apps/web` | Marketing site, pricing, theme store, developer docs | 3000 |
| `apps/dashboard` | Merchant panel (auth, onboarding, store management, theme customizer) | 3001 |
| `apps/admin` | Platform admin (merchants, plans, billing, theme review, developers, support) | 3002 |
| `apps/storefront` | Multi-tenant storefront renderer + checkout + storefront API | 3003 |
| `packages/db` | Drizzle schema, client, seed (`@pai/db`) | |
| `packages/core` | Auth/session, permissions, money, pricing & order creation, payments, couriers, storage, AI (`@pai/core`) | |
| `packages/ui` | Design system for dashboard/admin/web (`@pai/ui`) | |
| `packages/theme-sdk` | Theme contract: types, schema helpers, renderer, customizer protocol (`@pai/theme-sdk`) | |
| `packages/theme-kit` | Reusable storefront sections + commerce client components + `createBaseTheme` (`@pai/theme-kit`) | |
| `packages/theme-registry` | Lazy loaders + manifests for every installed theme | |
| `themes/<slug>` | One package per theme (`@pai-theme/<slug>`) | |
| `tools/create-theme` | `pnpm theme:new` scaffolder + validator | |

Workspace packages ship **TypeScript source** (no build step); Next apps transpile them via `transpilePackages` (see `packages/core/next-config.mjs`).

## Stack
Next.js 16 (App Router, RSC, server actions) · React 19 · TypeScript · Tailwind CSS 4 · Drizzle ORM · PostgreSQL · jose (JWT) · zod · lucide-react · recharts · dnd-kit.

## Multi-tenancy
- Every tenant table has `store_id` + indexes. All queries MUST filter by `storeId`.
- Storefront resolves the tenant from the request host:
  - `{slug}.{STOREFRONT_ROOT_DOMAIN}` (dev: `http://{slug}.localhost:3003`)
  - verified custom domain (`stores.custom_domain`)
  - path fallback: `http://localhost:3003/s/{slug}/...`
  - customizer preview: `http://localhost:3003/preview/{token}/...` (token from `signPreviewToken`, renders the store theme's `draftConfig ?? config`)
- Theme links MUST go through `context.url(path)` so they work under every base path.

## Auth
- Platform users (merchants, staff, admins, developers) → table `users`, JWT cookie `pai_session` (`@pai/core/session`). On localhost, cookies are shared across ports, so logging in on :3001 also works on :3002 (admin checks `role`).
- Active store → cookie `pai_store`. `requireStore({ permission })` resolves user + store + membership.
- Storefront customers → table `customers`, per-store cookie (`pai_customer`), token kind `customer` with `sid`.

## Money
Integers in minor units (poisha/cents). `formatMoney(minor, currency)` / `toMinor(major)` in `@pai/core`.

## Themes (Shopify Online Store 2.0-style)
- A theme exports a `ThemeDefinition` (`@pai/theme-sdk`): manifest, global `settingsSchema`, `sections` (component + schema with settings & blocks), `presets`, `defaultConfig`.
- A store's theme config (`store_themes.config` / `draftConfig`) is a `ThemeConfig` JSON: global settings, header/footer groups, per-template ordered section lists. Null ⇒ theme default (+ preset).
- `resolveThemeConfig(theme, stored, presetId)` merges; `RenderSections` renders a list, wrapping each section in `data-pai-section` for the customizer.
- Sections receive `context: StorefrontContext` with the store, resolved theme settings, template resources and a `data: StorefrontDataAPI` (themes never touch the DB).
- Global settings with standard ids (`color_background`, `color_primary`, `font_heading`, `radius`, …) become CSS variables (`--pai-bg`, `--pai-primary`, `--pai-font-heading`, `--pai-radius`, …) via `defaultCssVariables`.
- Customizer ↔ preview messaging: `@pai/theme-sdk/preview-protocol`.

## Orders
`@pai/core/orders`: `priceCart` (lines, stock, discount, delivery zone) and `createOrder` (transaction: atomic order number, customer upsert, inventory, discount usage, analytics, timeline). Used by storefront checkout, dashboard manual orders and the API.

## Scaling notes
Stateless Next apps behind a CDN/load balancer; Postgres with read replicas + PgBouncer; per-store cache tags for storefront ISR (`revalidateTag("store:{id}")`); object storage for media (S3/R2); background jobs (webhooks, emails, courier sync) via a queue in production (BullMQ/Redis) — the code paths are isolated in `@pai/core` to allow that swap.
