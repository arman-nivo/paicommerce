---
title: PaiCommerce developer documentation
description: Everything you need to build themes, integrate with the REST API and webhooks, and run the PaiCommerce platform — the commerce stack built for Bangladesh.
---

PaiCommerce is a multi-tenant e-commerce platform built for Bangladesh and emerging markets. Merchants launch a store in minutes, get paid through **bKash, Nagad, SSLCommerz and cash on delivery**, book parcels with **Steadfast, Pathao and RedX** in one click, and pick a design from the **Theme Store**.

These docs are for three kinds of people:

- **Theme developers** who build and sell themes on the Theme Store. You keep **70% of every sale**.
- **Integrators and agencies** who connect stores to ERPs, accounting tools, WhatsApp bots or custom apps through the REST API and webhooks.
- **Platform engineers** who run, extend or self-host the PaiCommerce monorepo.

## How the platform fits together

PaiCommerce is a single TypeScript monorepo with four Next.js apps and a handful of shared packages:

| App | What it does | Local URL |
| --- | --- | --- |
| `apps/web` | Marketing site, pricing, Theme Store and these docs | `http://localhost:3000` |
| `apps/dashboard` | Merchant panel: products, orders, customers, theme customizer, settings | `http://localhost:3001` |
| `apps/admin` | Platform admin: merchants, plans, billing, theme review, developer payouts | `http://localhost:3002` |
| `apps/storefront` | Multi-tenant storefront renderer, checkout and the `/api/v1` REST API | `http://localhost:3003` |

Every storefront is rendered by a **theme** — a package that exports React Server Components for its sections plus JSON schemas describing what merchants can customise. Read [Architecture](/docs/architecture) for the full picture.

## Start here

1. **[Quickstart](/docs/quickstart)** — clone the repo, seed demo data and open a running store in about five minutes.
2. **[Theme development overview](/docs/themes)** — the mental model: themes, sections, blocks, settings, templates and presets.
3. **[Create a theme with the CLI](/docs/themes/cli)** — `pnpm theme:new` scaffolds a working theme wired into the registry.
4. **[REST API](/docs/api)** and **[Webhooks](/docs/webhooks)** — automate orders and sync your catalog.

> [!TIP]
> New to Online Store 2.0-style themes? Read [Sections](/docs/themes/sections) and [Blocks](/docs/themes/blocks) first. If you have built a Shopify theme before, you already know the model — PaiCommerce just uses typed React components instead of Liquid.

## Principles

**Merchants never touch code.** Everything a merchant can change — colours, fonts, section order, copy, images — is described by a schema and stored as a JSON document (`ThemeConfig`). The customizer edits that document; the storefront renders it.

**Themes never touch the database.** Sections receive a typed, read-only [`StorefrontContext`](/docs/themes/context) with the store, the current product or collection, and a `data` API for everything else. The same theme runs unchanged in production, in the customizer preview and against mock data.

**Built for Bangladesh.** Prices are stored as integers in **poisha** (minor units), BDT is the default currency, cash on delivery is a first-class payment method, and courier booking, fraud checks and incomplete-order recovery are part of the core — not paid add-ons.

**Fast by default.** Sections are React Server Components. They ship zero JavaScript unless you opt into a client component for interactivity (cart drawer, variant picker, countdown), which keeps storefronts fast on mid-range Android phones and 4G connections.

## Getting help

- Found a mistake in the docs? Every page has an **Edit this page on GitHub** link at the bottom.
- Theme partners can email **partners@paicommerce.com** for review questions and payouts.
- Merchants on the Pro plan get priority support from the dashboard's **Help** menu.
