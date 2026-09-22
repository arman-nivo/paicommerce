# PaiCommerce

**The all-in-one e-commerce SaaS for Bangladesh and emerging markets.** Launch a store in minutes, sell with bKash, Nagad, SSLCommerz and cash on delivery, and ship with Steadfast, Pathao or RedX. Customize it with a Shopify-grade theme editor, then grow with a developer theme marketplace.

| App | URL (dev) | What it is |
|---|---|---|
| Marketing site + Theme Store + Docs | http://localhost:3000 | `apps/web` |
| Merchant dashboard | http://localhost:3001 | `apps/dashboard` |
| Platform admin | http://localhost:3002 | `apps/admin` |
| Storefronts | http://{store}.localhost:3003 | `apps/storefront` |

## Quickstart

```bash
# Requirements: Node 20+, pnpm 10+, PostgreSQL 15+
pnpm install
cp .env.example .env          # set DATABASE_URL and AUTH_SECRET (openssl rand -base64 32)
createdb paicommerce
pnpm db:reset                 # create schema + seed demo data (~5s)
pnpm dev                      # runs all four apps
```

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Platform superadmin (admin :3002) | admin@paicommerce.com | admin123 |
| Merchant with 400 orders (dashboard :3001) | demo@paicommerce.com | demo1234 |
| Staff (limited permissions) | staff@paicommerce.com | staff123 |
| Theme developer | dev@paicommerce.com | dev12345 |

Demo storefronts: http://demo.localhost:3003 and one per theme, e.g. http://aurora-demo.localhost:3003, `volt-demo`, `freshmart-demo`, `bloom-demo`, `nest-demo`, `savor-demo`, `lumiere-demo`, `playhouse-demo`, `stride-demo`, `folio-demo`, `bazaar-demo`, `artisan-demo`, `pulse-demo`.
If `*.localhost` doesn't resolve in your browser, use path mode instead: http://localhost:3003/s/aurora-demo.

## Features

**Merchants**
- Guided onboarding: pick your business category and get a matching theme preset
- Products with variants, inventory, collections, reviews, CSV import/export, and an AI description writer (English and Bangla)
- Orders: status workflow, invoices, one-click courier booking, fraud check (the customer's past success/cancel ratio), manual orders
- Incomplete-order recovery that captures half-filled checkouts
- Discounts, customers, analytics funnel, staff roles and permissions
- Theme library and Theme Store, plus a visual customizer with drag-and-drop sections and blocks, live preview, undo/redo and publish
- Pages, blog, navigation, media, custom domains
- Payments: COD, bKash (API or send money), Nagad, SSLCommerz, aamarPay, Stripe, PayPal
- Couriers: Steadfast, Pathao, RedX, Paperfly
- Marketing: Meta Pixel with Conversions API, GA4, GTM, TikTok, Google Merchant and Facebook catalog feeds
- Developer tools: API keys, webhooks, REST API `/api/v1`

**Platform admin:** MRR/ARR/GMV dashboards, merchant management with impersonation, plans and billing, theme review queue, developer payouts, support tickets, announcements, leads, audit log and platform settings.

**Themes:** 13 production themes that cover every business category:

| Theme | For | Price |
|---|---|---|
| Aurora | Fashion | Free |
| Volt | Electronics | Premium |
| FreshMart | Grocery | Free |
| Bloom | Beauty | Premium |
| Nest | Home | Premium |
| Savor | Food | Free |
| Lumière | Jewelry | Premium |
| Playhouse | Kids & pets | Free |
| Stride | Sports | Premium |
| Folio | Books & digital | Free |
| Bazaar | Marketplace | Free |
| Artisan | Handicrafts | Premium |
| Pulse | Health | Free |

## Build a theme

```bash
pnpm theme:new my-theme --name "My Theme" --categories fashion,beauty
node tools/create-theme/validate.mjs my-theme
```

A theme is a package in `themes/<slug>` built with `@pai/theme-sdk` + `@pai/theme-kit`. Read [docs/THEME_GUIDE.md](docs/THEME_GUIDE.md), [packages/theme-kit/README.md](packages/theme-kit/README.md) and the reference theme [themes/aurora](themes/aurora). You can sell themes in the PaiCommerce Theme Store for a 70% revenue share; see [CONTRIBUTING.md](CONTRIBUTING.md).

## Docs
- [Architecture](docs/ARCHITECTURE.md)
- Full developer docs: http://localhost:3000/docs (source in `apps/web/content/docs`), covering the API, webhooks, integrations and deployment
- [Deployment files](deploy/) (Dockerfile, docker-compose, Caddy with on-demand TLS for custom domains)

## Scripts
| Command | Description |
|---|---|
| `pnpm dev` | Run all apps |
| `pnpm build` | Production build |
| `pnpm typecheck` | Type-check the workspace |
| `pnpm db:push` / `db:seed` / `db:reset` / `db:studio` | Database |
| `pnpm theme:new` | Scaffold a theme |
