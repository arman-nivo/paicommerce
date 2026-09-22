---
title: Theme CLI
description: Scaffold a new theme with pnpm theme:new — interactive prompts or flags, dry runs, generated files, automatic registration in the theme registry, and the validator.
---

`pnpm theme:new` creates a new theme package in `themes/<slug>`, built on [`@pai/theme-kit`](/docs/themes/theme-kit), and registers it in `@pai/theme-registry` so the storefront, dashboard and marketing site can load it. It uses only Node built-ins (Node 20+), and the CLI lives in `tools/create-theme/index.mjs`.

## Create a theme

Run it without arguments for interactive prompts:

```bash
$ pnpm theme:new
```

Or pass everything as flags:

```bash
$ pnpm theme:new monsoon --name "Monsoon" --categories fashion,beauty --price 4900 --author "Rahim Studio"
```

Then link the new workspace package and validate it:

```bash
$ pnpm install
$ node tools/create-theme/validate.mjs monsoon
```

## Options

| Flag | Description |
| --- | --- |
| `[slug]` | Folder and package id. Must match `/^[a-z0-9][a-z0-9-]{1,40}$/` and not already exist in `themes/`. |
| `--name <name>` | Display name. Defaults to the Title Case of the slug. |
| `--categories <ids>` | Comma-separated [business categories](/docs/themes/manifest#business-categories). The **first one is the primary** category: it drives the default palette and home page. In interactive mode you can also type numbers from the list. |
| `--price <taka>` | Theme Store price in **taka** (major units, e.g. `4900`). `0` = free (default). The CLI converts it to minor units for the manifest (`490000`). |
| `--author <name>` | Author or studio name. Defaults to your `git config user.name`. |
| `--tagline <text>` | One-line Theme Store tagline. |
| `--dry-run` | Print the file tree and registry diffs without writing anything. |
| `-y`, `--yes` | Don't ask for confirmation; use defaults for anything missing. |
| `--no-register` | Don't add the theme to `packages/theme-registry`. |
| `--interactive` | Prompt for missing values even when stdin is not a TTY. |
| `-h`, `--help` | Show help. |

## Preview with `--dry-run`

```bash
$ pnpm theme:new monsoon --categories fashion,beauty --price 4900 --dry-run
```

```text
◆ PaiCommerce theme scaffolder  [dry run]

  slug        monsoon  → themes/monsoon, @pai-theme/monsoon
  name        Monsoon
  tagline     A fast, flexible theme for fashion, beauty stores
  categories  fashion, beauty
  price       ৳4,900 (490000 minor units)
  author      Rahim Studio
  register    yes (packages/theme-registry)

Files that would be created:

themes/monsoon/
  package.json
  README.md
  src/
    index.ts
    manifest.ts
    presets.ts
    sections/
      promo-banner.tsx
    settings.ts
  tsconfig.json

Registry changes:

packages/theme-registry/src/index.ts
+   monsoon: () => import("@pai-theme/monsoon").then((m) => m.default),

packages/theme-registry/src/manifests.ts
+ import { manifest as monsoon } from "@pai-theme/monsoon/manifest";
+ export const manifests: ThemeManifest[] = [aurora, …, pulse, monsoon];

packages/theme-registry/package.json
+     "@pai-theme/monsoon": "workspace:*"

Dry run — nothing was written. Re-run without --dry-run to create the theme.
```

## What gets generated

| File | Contents |
| --- | --- |
| `package.json` | `@pai-theme/<slug>` with `exports` for `.` and `./manifest`, `typecheck` and `validate` scripts, dependencies on `@pai/theme-sdk` and `@pai/theme-kit`. |
| `tsconfig.json` | Extends the repo's `tsconfig.base.json`. |
| `README.md` | Structure, development workflow, the pre-submit checklist and submission steps. |
| `src/manifest.ts` | Your [manifest](/docs/themes/manifest): version `0.1.0`, categories, price in minor units, a placeholder Unsplash thumbnail (replace it before submitting). |
| `src/settings.ts` | `settingsDefaults` (brand colours, fonts, radius…) and `extraSettings` merged into the kit's schema with `extendSettingsSchema`. |
| `src/presets.ts` | Three presets for the primary category: the signature look, a dark "Midnight" variant and a warm "Soft" variant. |
| `src/sections/promo-banner.tsx` | A complete example section (`<slug>-promo-banner`): heading, CTA, image, colour scheme and "perk" blocks, two section presets. |
| `src/index.ts` | `createBaseTheme({ manifest, sections, settingsSchema, settingsDefaults, defaultConfig, presets, css })` — inserts the promo banner after the hero on the home page, and puts your presets first. |

The generated `src/index.ts` looks like this (abridged):

```ts title="themes/monsoon/src/index.ts"
import { createBaseTheme, sectionList } from "@pai/theme-kit";
import { manifest } from "./manifest";
import { settingsDefaults, settingsSchema } from "./settings";
import { presets } from "./presets";
import { promoBanner } from "./sections/promo-banner";

export default createBaseTheme({
  manifest,
  // Custom sections. A section whose schema.type matches a kit section replaces it.
  sections: [promoBanner],
  settingsSchema,
  settingsDefaults,
  // Home page: kit default for the primary category + the promo banner after the hero.
  defaultConfig: (base) => ({
    ...base,
    templates: { ...base.templates, index: insertAfter(base.templates.index, "hero-banner", promo) },
  }),
  // Our presets first, then the kit's presets for any secondary categories.
  presets: (kitPresets) => [...presets, ...kitPresets.filter((p) => p.category !== manifest.categories[0])],
  css,
});
```

> [!TIP]
> Prefix your own section types with the theme slug (the generated banner is `monsoon-promo-banner`). Kit section types like `hero-banner` are shared by every theme; a section with the same type **replaces** the kit's version, which is useful when intended and confusing when not.

## Registration

Unless you pass `--no-register`, the CLI edits three files so your theme is loadable:

- `packages/theme-registry/src/index.ts` — adds a lazy loader to `themeLoaders`.
- `packages/theme-registry/src/manifests.ts` — imports your manifest and appends it to `manifests`.
- `packages/theme-registry/package.json` — adds `"@pai-theme/<slug>": "workspace:*"`.

Re-running for an already registered slug leaves these files unchanged. **Run `pnpm install` afterwards** to create the workspace link — until you do, imports of `@pai-theme/<slug>` fail with "Module not found".

## Next steps printed by the CLI

```text
Next steps
  1. pnpm install                                link the new @pai-theme/monsoon workspace package
  2. node tools/create-theme/validate.mjs monsoon   check sections, templates & presets
  3. pnpm dev                                    start all apps
  4. open http://localhost:3001                  → Themes → add “Monsoon” and customize
  5. read http://localhost:3000/docs/themes      theme developer docs (also docs/THEME_GUIDE.md)
```

Start editing with `src/settings.ts`, `src/presets.ts` and `src/sections/promo-banner.tsx`. See [Local development](/docs/themes/local-development) for the day-to-day workflow.

## Validate

```bash
$ node tools/create-theme/validate.mjs monsoon            # one theme
$ node tools/create-theme/validate.mjs monsoon aurora     # several
$ node tools/create-theme/validate.mjs --all              # every theme in /themes
$ pnpm --filter @pai-theme/monsoon validate               # the same, via the theme's script
```

The validator loads your theme through `tsx` and runs `validateTheme` from `@pai/theme-sdk` plus extra Theme Store checks. See [Validation](/docs/themes/validation) for every rule, the `--json` and `--strict` flags and exit codes.
