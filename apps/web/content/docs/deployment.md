---
title: Deployment
description: Run PaiCommerce in production on Vercel or Docker — Postgres with PgBouncer, environment variables, wildcard DNS for store subdomains, custom domains with automatic SSL, S3/R2 media storage and scaling.
---

PaiCommerce is four stateless Next.js apps and a PostgreSQL database. You can deploy the apps to **Vercel** (or any Next.js host) or run them as **Docker** containers behind a reverse proxy. This guide covers both, plus the pieces that are specific to a multi-tenant commerce platform: wildcard subdomains, merchant custom domains and SSL.

## Production topology

| Hostname | App | Notes |
| --- | --- | --- |
| `paicommerce.com`, `www.paicommerce.com` | `web` | Marketing site, Theme Store, docs |
| `app.paicommerce.com` | `dashboard` | Merchant panel |
| `admin.paicommerce.com` | `admin` | Platform admin — restrict by IP/VPN if you can |
| `*.paicommerce.com` | `storefront` | Every store's subdomain |
| Merchant custom domains (`shop.example.com.bd`) | `storefront` | CNAME to the storefront, SSL issued on demand |

All four apps share one database and the same `AUTH_SECRET`, and set `AUTH_COOKIE_DOMAIN=.paicommerce.com` so a login on the dashboard is recognised by the admin panel.

## Environment variables

Every app reads the same variables (locally they come from the root `.env`, which each app symlinks):

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string. In production, point it at **PgBouncer** (see below). |
| `AUTH_SECRET` | Yes | At least 32 random characters — `openssl rand -base64 32`. Signs session, customer and preview tokens. Rotating it logs everyone out. |
| `AUTH_COOKIE_DOMAIN` | Prod | `.paicommerce.com` so sessions are shared across subdomains. Empty on localhost. |
| `NEXT_PUBLIC_WEB_URL` | Yes | `https://paicommerce.com` |
| `NEXT_PUBLIC_DASHBOARD_URL` | Yes | `https://app.paicommerce.com` |
| `NEXT_PUBLIC_ADMIN_URL` | Yes | `https://admin.paicommerce.com` |
| `NEXT_PUBLIC_STOREFRONT_URL` | Yes | Base URL of the storefront app, used for previews and path-based links. |
| `STOREFRONT_ROOT_DOMAIN` | Yes | `paicommerce.com` — stores are served at `{slug}.{STOREFRONT_ROOT_DOMAIN}`. |
| `STORAGE_DRIVER` | Yes | `local` (development only) or `s3`. |
| `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | With `s3` | Bucket credentials (AWS S3, Cloudflare R2, DigitalOcean Spaces, MinIO…). |
| `S3_PUBLIC_URL` | With `s3` | Public/CDN base URL for uploaded files, e.g. `https://media.paicommerce.com`. |
| `ANTHROPIC_API_KEY` | No | Enables the AI product-description and SEO writer. |
| `STRIPE_SECRET_KEY` | No | Platform billing (merchant subscriptions) by card. |
| `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`, `SSLCOMMERZ_SANDBOX` | No | Platform billing via SSLCommerz. Set `SSLCOMMERZ_SANDBOX=false` in production. |

> [!WARNING]
> Merchant payment and courier credentials are **not** environment variables — merchants enter them in their dashboard and they are stored per store. The billing variables above are only for charging merchants for their PaiCommerce plan.

A production `.env` looks like this:

```env title=".env.production"
DATABASE_URL=postgres://pai:••••@pgbouncer.internal:6432/paicommerce
AUTH_SECRET=hP6r…generated-with-openssl…Q2s=
AUTH_COOKIE_DOMAIN=.paicommerce.com
NEXT_PUBLIC_WEB_URL=https://paicommerce.com
NEXT_PUBLIC_DASHBOARD_URL=https://app.paicommerce.com
NEXT_PUBLIC_ADMIN_URL=https://admin.paicommerce.com
NEXT_PUBLIC_STOREFRONT_URL=https://store.paicommerce.com
STOREFRONT_ROOT_DOMAIN=paicommerce.com
STORAGE_DRIVER=s3
S3_BUCKET=paicommerce-media
S3_REGION=auto
S3_ACCESS_KEY_ID=••••
S3_SECRET_ACCESS_KEY=••••
S3_PUBLIC_URL=https://media.paicommerce.com
SSLCOMMERZ_SANDBOX=false
```

## Database

1. Provision **PostgreSQL 15+** (managed: Neon, Supabase, AWS RDS, DigitalOcean; or self-hosted).
2. Create the schema from a machine that can reach it:

```bash
$ DATABASE_URL=postgres://… pnpm db:push
$ DATABASE_URL=postgres://… pnpm db:seed   # plans, theme catalogue and demo stores
```

3. Put **PgBouncer** (or your provider's pooler) in front of Postgres in **transaction mode** and use the pooled URL as `DATABASE_URL` for the apps. Serverless and horizontally scaled Next.js instances open many short-lived connections; without a pooler you will exhaust `max_connections` under load.
4. Enable daily backups with point-in-time recovery. Orders and payments live here.

> [!TIP]
> For schema changes in production, prefer generated migrations (`pnpm --filter @pai/db db:generate` then `db:migrate`) over `db:push`, and run them from CI before deploying the apps.

## Option A: Vercel

Create **four Vercel projects** from the same repository, one per app:

| Project | Root directory | Domains |
| --- | --- | --- |
| `paicommerce-web` | `apps/web` | `paicommerce.com`, `www.paicommerce.com` |
| `paicommerce-dashboard` | `apps/dashboard` | `app.paicommerce.com` |
| `paicommerce-admin` | `apps/admin` | `admin.paicommerce.com` |
| `paicommerce-storefront` | `apps/storefront` | `*.paicommerce.com` + merchant custom domains |

For each project:

- Framework preset **Next.js**; install command `pnpm install`; build command `pnpm --filter @pai/<app> build` (Vercel detects the pnpm workspace and Turborepo).
- Add the environment variables above (Production and Preview).
- Keep "Include files outside the root directory" enabled — the apps import `packages/*` and `themes/*` source.

**Wildcard subdomains** on Vercel require the domain's nameservers to point to Vercel. Add `*.paicommerce.com` to the storefront project.

**Custom domains** are added to the storefront project programmatically with the Vercel Domains API when a merchant connects a domain; Vercel then issues SSL automatically once the merchant's DNS points to Vercel:

```bash
$ curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/domains?teamId=$TEAM_ID" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"shop.rongdhonu.com.bd"}'
```

## Option B: Docker

The repository ships a multi-app Dockerfile, a Compose stack and a Caddy config in `deploy/`:

```bash
# one image per app
$ docker build -f deploy/Dockerfile --build-arg APP=storefront -t paicommerce-storefront .
$ docker build -f deploy/Dockerfile --build-arg APP=dashboard -t paicommerce-dashboard .

# or the whole stack: Postgres, Redis and the four apps
$ docker compose -f deploy/docker-compose.yml up -d --build
```

Every container listens on port `3000`; the Compose file maps them to `3000`–`3003` on the host. Put a reverse proxy in front — the included Caddy config routes hostnames to apps and issues certificates automatically:

```caddyfile title="deploy/Caddyfile"
# On-demand TLS issues certificates for merchant custom domains automatically.
{
  on_demand_tls {
    ask http://storefront:3000/api/domains/verify
  }
}
paicommerce.com, www.paicommerce.com {
  reverse_proxy web:3000
}
app.paicommerce.com {
  reverse_proxy dashboard:3000
}
admin.paicommerce.com {
  reverse_proxy admin:3000
}
*.paicommerce.com, https:// {
  tls { on_demand }
  reverse_proxy storefront:3000
}
```

Caddy's **on-demand TLS** requests a certificate the first time a hostname is visited, but only after the `ask` endpoint confirms the hostname belongs to a store — this prevents attackers from making your server request certificates for arbitrary domains. The storefront answers `200` for `{slug}.paicommerce.com` hosts and for verified custom domains, and `404` otherwise.

> [!NOTE]
> A certificate for `*.paicommerce.com` itself needs a DNS-01 challenge. Either use Caddy's on-demand issuance per subdomain (as above), or build Caddy with your DNS provider's module (e.g. Cloudflare) and issue a single wildcard certificate.

## DNS

For the platform domain:

```text
paicommerce.com          A      <load balancer / proxy IP>
www.paicommerce.com      CNAME  paicommerce.com
app.paicommerce.com      CNAME  paicommerce.com
admin.paicommerce.com    CNAME  paicommerce.com
*.paicommerce.com        A      <load balancer / proxy IP>      # every store subdomain
```

Store subdomains need no per-store DNS: `rongdhonu.paicommerce.com` matches the wildcard, and the storefront resolves the tenant from the `Host` header.

## Custom domains & SSL

Merchants on Growth and above connect their own domain under **Online store → Domains**:

1. The merchant enters `shop.rongdhonu.com.bd`; it is saved on `stores.custom_domain` as unverified.
2. They add a DNS record at their registrar:
   - **Subdomain** (`shop.` or `www.`): `CNAME` → `stores.paicommerce.com` (a hostname that resolves to your proxy).
   - **Apex domain** (`rongdhonu.com.bd`): an `A` record → your proxy's IP, since apex CNAMEs aren't allowed by most registrars.
3. The dashboard checks DNS and marks the domain verified (`domainVerified`).
4. On the first HTTPS request, the proxy obtains a certificate (Caddy on-demand TLS, or the Vercel Domains API).
5. `storeUrl()` now returns `https://shop.rongdhonu.com.bd`, and the store's subdomain keeps working.

## Media storage (S3 / R2)

`STORAGE_DRIVER=local` writes uploads to each app's `public/uploads` folder — fine for development, wrong for production (containers are ephemeral and apps don't share disks). In production set `STORAGE_DRIVER=s3` and point the `S3_*` variables at any S3-compatible bucket:

| Provider | `S3_REGION` | Endpoint notes |
| --- | --- | --- |
| AWS S3 | e.g. `ap-south-1` (Mumbai, closest to Bangladesh) | Standard |
| Cloudflare R2 | `auto` | No egress fees; serve through an R2 custom domain as `S3_PUBLIC_URL` |
| DigitalOcean Spaces | e.g. `sgp1` | Singapore region is closest |

Serve media from a CDN hostname (`S3_PUBLIC_URL`) with long cache lifetimes — uploaded file names are unique, so they never need invalidation. The storage layer (`storeUpload` in `@pai/core/storage`) limits uploads to 10 MB and to images, MP4/WebM video and PDF.

## Scaling

- **Apps** are stateless: scale each horizontally behind the load balancer. The storefront takes the most traffic — give it the most instances and put a CDN in front.
- **Caching:** storefront pages are cached per store and invalidated with `revalidateTag("store:{id}")` when merchants publish a theme or edit products, so a campaign spike mostly hits the cache.
- **Database:** add read replicas for analytics-heavy dashboard queries; keep writes (checkout, order updates) on the primary. PgBouncer in transaction mode in front of both.
- **Background jobs:** webhook delivery, transactional email/SMS and courier status sync should run through a queue (BullMQ + Redis — Redis is already in the Compose file) with workers separate from web traffic. These code paths are isolated in `@pai/core` so the in-process implementation can be swapped for a queue without touching callers.
- **Observability:** ship logs to a central store, and alert on checkout error rates, payment verification failures and webhook failure rates per store.

## Production checklist

- [ ] `AUTH_SECRET` is long, random and identical across all four apps.
- [ ] `AUTH_COOKIE_DOMAIN` is set to the platform's parent domain.
- [ ] `DATABASE_URL` goes through PgBouncer; backups and PITR are enabled.
- [ ] `STORAGE_DRIVER=s3` with a CDN in front of the bucket.
- [ ] Wildcard DNS and the wildcard/on-demand certificate work: `https://<any-store>.paicommerce.com` loads.
- [ ] The on-demand TLS `ask` endpoint rejects unknown hostnames.
- [ ] Payment gateway sandboxes are off for platform billing (`SSLCOMMERZ_SANDBOX=false`).
- [ ] The admin app is restricted and every admin account uses a strong password.
- [ ] Webhook and courier-sync workers are running and monitored.
