---
title: Quickstart
description: Run the entire PaiCommerce platform on your machine — marketing site, merchant dashboard, admin and multi-tenant storefront — with demo stores for every theme.
---

This guide takes you from a fresh clone to a running platform with seeded demo stores. It takes about five minutes on a decent connection.

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | **20 or newer** | Node 22 LTS recommended |
| pnpm | **11.x** | `corepack enable` installs the pinned version automatically |
| PostgreSQL | **15 or newer** | Local install, Docker or Postgres.app all work |
| Git | any | |

> [!NOTE]
> You do not need Redis, S3 or any payment credentials to develop locally. Uploads are written to disk, and payment gateways run in sandbox mode or fall back to cash on delivery.

## 1. Clone and install

```bash
$ git clone https://github.com/paicommerce/paicommerce.git
$ cd paicommerce
$ corepack enable
$ pnpm i
```

The repository is a pnpm + Turborepo monorepo. Workspace packages ship TypeScript source, so there is no separate build step for `packages/*` or `themes/*` — the Next.js apps transpile them on the fly.

## 2. Configure the environment

```bash
$ cp .env.example .env
```

The defaults work for local development. The only value you may need to change is `DATABASE_URL`:

```env title=".env"
DATABASE_URL=postgres://localhost:5432/paicommerce
# openssl rand -base64 32
AUTH_SECRET=change-me-to-a-long-random-string-at-least-32-chars
STOREFRONT_ROOT_DOMAIN=localhost:3003
STORAGE_DRIVER=local
```

Create the database if it does not exist yet:

```bash
$ createdb paicommerce
```

The root `.env` is shared by every app (each app symlinks it). See [Deployment](/docs/deployment#environment-variables) for the full list of variables.

## 3. Create the schema and seed demo data

```bash
$ pnpm db:push   # create tables from packages/db/src/schema.ts (Drizzle)
$ pnpm db:seed   # plans, a demo merchant, one demo store per theme, products & orders
```

`db:seed` is idempotent enough to re-run, but if you want a completely clean slate use `pnpm db:reset`, which drops everything, pushes the schema and seeds again. You can browse the data with `pnpm db:studio`.

## 4. Start everything

```bash
$ pnpm dev
```

Turborepo starts all four apps in parallel:

| App | URL | What to try |
| --- | --- | --- |
| Marketing site & docs | <http://localhost:3000> | Browse the Theme Store at `/themes` |
| Merchant dashboard | <http://localhost:3001> | Sign up, or log in with the seeded demo merchant |
| Platform admin | <http://localhost:3002> | Review themes, manage plans and merchants |
| Storefront | <http://localhost:3003> | Multi-tenant — see below |

> [!TIP]
> Run a single app with `pnpm --filter @pai/storefront dev` (or `@pai/web`, `@pai/dashboard`, `@pai/admin`). When you only work on themes, the storefront and dashboard are all you need.

## 5. Open a demo store

The storefront resolves the tenant from the **host name**. Browsers resolve any `*.localhost` name to `127.0.0.1`, so subdomains work locally without editing `/etc/hosts`:

```text
http://aurora-demo.localhost:3003      # the "Aurora" theme's demo store
http://volt-demo.localhost:3003        # the "Volt" theme's demo store
http://freshmart-demo.localhost:3003   # …one demo store per installed theme
```

If your environment does not resolve `*.localhost` (some corporate proxies and older Safari versions), use the **path fallback** instead:

```text
http://localhost:3003/s/aurora-demo
http://localhost:3003/s/aurora-demo/products/<product-slug>
```

Log in to the dashboard, open **Online store → Themes** and click **Customize** to open the theme customizer with a live preview of your store.

## 6. Sign in

Logging in on `:3001` also works on `:3002` because session cookies are shared across ports on `localhost` (`AUTH_COOKIE_DOMAIN` is empty in development). The admin panel additionally checks that the user has an `admin` or `superadmin` role. The seed script prints the demo credentials it created at the end of its output.

## What's next

- **Build your first theme:** [Theme CLI](/docs/themes/cli) scaffolds one in seconds.
- **Understand the moving parts:** [Architecture](/docs/architecture).
- **Automate a store:** create an API key under **Settings → Developers** and follow the [REST API](/docs/api) guide.

## Troubleshooting

**`ECONNREFUSED 127.0.0.1:5432`** — PostgreSQL is not running, or `DATABASE_URL` points to the wrong host/port.

**`relation "stores" does not exist`** — you skipped `pnpm db:push`.

**A demo store shows "Store not found"** — the slug is wrong or the seed did not finish. Re-run `pnpm db:seed` and check the store list in the admin panel.

**Port already in use** — another process is using `3000`–`3003`. Stop it, or run a single app with a different port: `pnpm --filter @pai/storefront exec next dev --port 4003` (and update `NEXT_PUBLIC_STOREFRONT_URL` / `STOREFRONT_ROOT_DOMAIN` accordingly).
