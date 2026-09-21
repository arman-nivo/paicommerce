# Build brief (shared by all build agents)

Read `docs/ARCHITECTURE.md` first. Then read the source of the packages you depend on:
`packages/db/src/schema.ts`, `packages/core/src/*`, `packages/ui/src/*`, `packages/theme-sdk/src/*`.

Ground rules
- Stay inside the directories you own. Do NOT edit files owned by another agent. If you need a change in a shared package
  (`packages/db`, `packages/core`, `packages/ui`, `packages/theme-sdk`), you MAY add NEW files/exports, but do not change
  existing signatures/behaviour. Never change `schema.ts` — if you truly need a column, note it in your final report.
- Do NOT add npm dependencies (a concurrent `pnpm install` would corrupt the lockfile). Everything you need is installed:
  next 16, react 19, tailwind 4, drizzle, zod 4, jose, bcryptjs, lucide-react, recharts, sonner, dnd-kit (dashboard), clsx.
- Next.js 16: read the bundled docs in `node_modules/next/dist/docs/` when unsure (e.g. `proxy.ts` replaces `middleware.ts`,
  async `params`/`searchParams`/`cookies()`/`headers()`).
- Tailwind 4: each app's `src/app/globals.css` starts with
  `@import "tailwindcss"; @import "@pai/ui/styles.css"; @source "../../../../packages/ui/src";` (adjust relative path),
  plus `@source` for any other workspace packages whose classes you use.
- Images: only use `https://images.unsplash.com/photo-...` URLs and verify them with `node tools/verify-images.mjs <dirs>`
  (replace any that are broken). Use plain `<img>` for remote/merchant images (they come from arbitrary hosts).
- The DB is local Postgres `paicommerce` (already migrated). `.env` is symlinked into each app.
- Quality bar: this is a launch-ready commercial SaaS. Polished, responsive, accessible UI; real data from the DB;
  loading/empty/error states; zod validation on every mutation; tenant isolation on every query.
- Verify your work: `npx tsc --noEmit -p apps/<app>` must pass, and `next build` for your app should succeed
  (run `pnpm --filter @pai/<app> build`). Start the dev server and curl key pages to make sure they render (HTTP 200,
  no runtime errors). Kill any dev servers you started before finishing.
- Final report: what you built (routes/features), anything incomplete, and any cross-team contract you depend on.
