# Contributing to PaiCommerce

Thanks for helping build PaiCommerce, the multi-tenant e-commerce platform for Bangladeshi merchants.
This guide covers two kinds of contributions:

1. [Contributing code](#contributing-code): apps, shared packages and tooling
2. [Contributing themes](#contributing-themes): storefront themes for the Theme Store

Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) before your first change. It's short and explains
tenancy, auth, money and the theme system.

---

## Contributing code

### Prerequisites

- **Node.js ≥ 20** and **pnpm** (the version is pinned in `package.json → packageManager`; run `corepack enable`)
- **PostgreSQL 15+** running locally
- Git, plus an editor with TypeScript support

### Setup

```bash
git clone <repo-url> paicommerce && cd paicommerce
pnpm install
cp .env.example .env              # set DATABASE_URL and AUTH_SECRET (openssl rand -base64 32)
createdb paicommerce
pnpm db:push                      # create the schema
pnpm db:seed                      # demo merchants, stores, products and themes
pnpm dev                          # runs every app through turbo
```

| App | URL | What it is |
| --- | --- | --- |
| `apps/web` | http://localhost:3000 | Marketing site, pricing, Theme Store, developer docs |
| `apps/dashboard` | http://localhost:3001 | Merchant panel and theme customizer |
| `apps/admin` | http://localhost:3002 | Platform admin |
| `apps/storefront` | http://localhost:3003 | Multi-tenant storefront (`/s/<store-slug>` locally) |

Run one app with `pnpm --filter @pai/dashboard dev`. Reset the database with `pnpm db:reset`
(it drops all data) and browse it with `pnpm db:studio`.

### Monorepo layout

```
apps/                 Next.js 16 apps (web, dashboard, admin, storefront)
packages/
  db/                 Drizzle schema, client, migrations and seed (@pai/db)
  core/               auth/session, permissions, money, orders, payments, couriers, storage, AI (@pai/core)
  ui/                 shared React UI components and styles (@pai/ui)
  theme-sdk/          theme contract: types, schema helpers, renderer, customizer protocol (@pai/theme-sdk)
  theme-kit/          reusable storefront sections, commerce components and createBaseTheme (@pai/theme-kit)
  theme-registry/     lazy loaders and manifests for every installed theme
themes/<slug>/        one package per theme (@pai-theme/<slug>)
tools/create-theme/   `pnpm theme:new` scaffolder and theme validator
docs/                 architecture and guides
deploy/               Dockerfile, docker-compose and Caddy config
```

Workspace packages ship **TypeScript source** with no build step. The Next apps transpile them through
`transpilePackages`.

### Branches and commits

- Branch from `main`: `feat/<short-topic>`, `fix/<short-topic>`, `chore/…`, `docs/…`, `theme/<slug>`.
- Use [Conventional Commits](https://www.conventionalcommits.org/) with a scope:
  `feat(dashboard): bulk edit product prices`, `fix(storefront): keep cart on locale switch`,
  `feat(theme-aurora): lookbook section`.
- Keep pull requests small and focused. Describe **what** changed and **why**, add screenshots for UI
  changes, and link the issue.
- Rebase on `main` before asking for review. Don't merge your own PR without an approval.

### Before you open a PR

```bash
pnpm typecheck                                   # every workspace (turbo)
npx tsc --noEmit -p apps/<app>                   # one app
pnpm --filter @pai/<app> build                   # production build must succeed
node tools/create-theme/validate.mjs --all       # if you touched themes, theme-kit or theme-sdk
node tools/verify-images.mjs <dirs you changed>  # if you added image URLs
```

Start the app you changed and check its key pages (HTTP 200, no runtime errors in the console),
including loading, empty and error states.

### Code style

- TypeScript `strict` everywhere. Don't use `any` in app code. Parse unknown input with **zod**.
- React Server Components by default. Add `"use client"` only where you need interactivity.
- Next.js 16 conventions: `params`, `searchParams`, `cookies()` and `headers()` are async, and
  `proxy.ts` replaces `middleware.ts`. The bundled docs are in `node_modules/next/dist/docs/`.
- Tailwind CSS 4 utilities and the `@pai/ui` components. Don't add one-off CSS files.
- Validate every mutation (server action or route handler) with a zod schema and check permissions with
  `requireStore({ permission })`.
- UI is responsive and accessible: semantic HTML, labelled inputs, visible focus, 4.5:1 contrast.
- Name files in kebab-case, components in PascalCase, and use camelCase for everything else. Prefer
  small, pure functions in `@pai/core` over logic inside route files.
- Remote or merchant images use a plain `<img>`. Demo and seed images must be
  `https://images.unsplash.com/photo-…` URLs that pass `tools/verify-images.mjs`.

### Tenant isolation (non-negotiable)

Every tenant table has a `store_id` column. **Every query must filter by `storeId`.** That includes
reads, updates, deletes, joins and sub-queries, and each one resolves the store from the session
(`requireStore`) or the storefront host, never from client input. A PR that adds an unscoped query to
a tenant table will not be merged. When in doubt, add the `storeId` condition to the `where` clause
and to the join.

### Money

Money is always an **integer in minor units** (poisha or cents): `125000` means ৳1,250.00.
Convert at the edges with `toMinor(major)` and display with `formatMoney(minor, currency)` from
`@pai/core`. Never store or add floats, and never format currency by hand.

### Dependencies

**Don't add npm dependencies without discussing it first** in an issue or on the PR. The stack
already includes Next 16, React 19, Tailwind 4, Drizzle, zod 4, jose, bcryptjs, lucide-react,
recharts, sonner, dnd-kit and clsx. If a new dependency gets approved, add it in its own PR together with the
`pnpm-lock.yaml` change. Tooling in `tools/` uses Node built-ins only.

### Database changes

`packages/db/src/schema.ts` is the single source of truth. Schema changes need a migration
(`pnpm --filter @pai/db db:generate`), must be backwards-compatible with running code, and every new
tenant table needs `store_id` with an index.

### Security

Never commit secrets or `.env`. Report vulnerabilities privately to the maintainers, not in public
issues.

---

## Contributing themes

PaiCommerce themes work like Shopify Online Store 2.0 themes. A theme is a package that exports a
`ThemeDefinition` with a manifest, a global settings schema, **sections** (a React component plus a
JSON schema of settings and blocks), **presets** and a default config. Merchants edit everything
visually in the customizer and never touch code.

Full reference: [`docs/THEME_GUIDE.md`](docs/THEME_GUIDE.md) and the developer docs at
<http://localhost:3000/docs/themes> (production: `/docs/themes` on the PaiCommerce website).

### 1. Scaffold

```bash
pnpm theme:new                                   # interactive
pnpm theme:new sunrise --name "Sunrise" --categories fashion,beauty --price 2900 --author "Acme Studio"
pnpm theme:new sunrise --categories grocery --dry-run   # preview files and registry changes only
pnpm install                                     # link the new workspace package
```

| Flag | Meaning |
| --- | --- |
| `[slug]` | Folder and package id, `/^[a-z0-9][a-z0-9-]{1,40}$/`, must be unique |
| `--name` | Display name (defaults to the Title Case of the slug) |
| `--categories` | Comma-separated business categories; the first is the primary one |
| `--price` | Price in taka (`0` = free); stored as minor units in the manifest |
| `--author` | Author or studio name |
| `--tagline` | One-line Theme Store tagline |
| `--dry-run` | Print the file tree and registry diffs without writing anything |
| `--yes` | Skip prompts and confirmation and use defaults |
| `--no-register` | Don't add the theme to `packages/theme-registry` |

The CLI creates `themes/<slug>` and registers it in `packages/theme-registry` (`src/index.ts`,
`src/manifests.ts` and `package.json`).

### 2. Structure

```
themes/<slug>/
├── package.json            @pai-theme/<slug>: exports "." (theme) and "./manifest" (pure data)
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts            composes the theme with createBaseTheme from @pai/theme-kit
    ├── manifest.ts         Theme Store listing (name, categories, price in minor units, thumbnail)
    ├── settings.ts         global settings; standard ids become CSS variables
    ├── presets.ts          one-click starting looks
    └── sections/*.tsx      your custom sections (defineSection)
```

- Standard setting ids (`color_background`, `color_foreground`, `color_primary`,
  `color_primary_foreground`, `color_accent`, `font_heading`, `font_body`, `radius`,
  `container_width` and others) map to CSS variables (`--pai-bg`, `--pai-primary`, `--pai-font-heading`,
  `--pai-radius`, `--pai-container` …). Style with those variables so merchant choices apply everywhere.
- Build every link with `context.url(path)`, because stores can be served under a path prefix.
- Read data only through `context.data`. Themes never import `@pai/db` or `@pai/core`.
- Prices are minor units. Display them with `context.formatMoney`.
- Keep `manifest.ts` free of React so Node scripts and the marketing site can import it.

### 3. Develop and validate

```bash
pnpm dev                                          # dashboard :3001 → Themes → add your theme → Customize
node tools/create-theme/validate.mjs <slug>       # schema, config and preset checks (exit 1 on errors)
npx tsc --noEmit -p themes/<slug>
node tools/verify-images.mjs themes/<slug>
```

### 4. Performance and accessibility checklist

- [ ] Lighthouse (mobile) scores at least **90 for performance** and at least **95 for accessibility** on the home, collection and product pages
- [ ] No layout shift from images: give them explicit dimensions or aspect ratios, and lazy-load everything below the fold
- [ ] Sections are Server Components; client JS stays limited to interactive islands; no heavy libraries
- [ ] Only Google Fonts through the font settings; no extra font or icon files
- [ ] Semantic landmarks and headings in order (one `h1` per page); every image has `alt` (decorative ones get `alt=""`)
- [ ] Text contrast of at least 4.5:1 in **every preset**; visible focus rings; tap targets of at least 44×44px; full keyboard navigation
- [ ] Respects `prefers-reduced-motion`
- [ ] Renders sensibly with empty data (no products, no images, blank settings) and inside the customizer preview
- [ ] Works from 360px to wide desktop without horizontal scroll

### 5. Submit to the Theme Store

1. Create a developer account on the PaiCommerce website and read `/docs/themes`.
2. Bump `version` in `src/manifest.ts` and `package.json`, and replace the placeholder thumbnail with
   real 1600px screenshots.
3. Open a PR titled `feat(theme-<slug>): …` containing `themes/<slug>` and the registry entries, or submit
   through the developer portal. The review covers code quality, security (no tracking or external
   scripts without disclosure), performance and accessibility.
4. Once approved, the theme is listed in the Theme Store. **Paid themes earn a 70/30 revenue share**:
   70% goes to the developer and 30% to PaiCommerce. Free themes are welcome too.

Theme authors keep their copyright. By submitting, you grant PaiCommerce the right to distribute the
theme to merchants through the Theme Store.
