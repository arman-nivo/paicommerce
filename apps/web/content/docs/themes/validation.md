---
title: Validation
description: Every rule enforced by validateTheme and the Theme Store validator — manifest, sections, blocks, presets, settings and default config — plus the CLI flags, output and exit codes for local use and CI.
---

Themes are validated in two layers:

1. **`validateTheme(theme)`** from `@pai/theme-sdk` — structural checks on a `ThemeDefinition`. It's a plain function you can call anywhere (tests, CI, the admin review queue).
2. **`tools/create-theme/validate.mjs`** — loads your theme from source, runs `validateTheme`, and adds **Theme Store checks** (price, block types, presets, duplicate ids…).

A theme must have **zero errors** to be submitted. Warnings don't block submission, but reviewers read them.

## Running the validator

```bash
$ node tools/create-theme/validate.mjs monsoon            # one theme
$ node tools/create-theme/validate.mjs monsoon aurora     # several themes
$ node tools/create-theme/validate.mjs --all              # every theme in /themes
$ pnpm --filter @pai-theme/monsoon validate               # the theme's own script
```

| Flag | Description |
| --- | --- |
| `--all` | Validate every theme that has a `src/index.ts` in `/themes`. |
| `--json` | Print the raw results as JSON (for CI annotations and dashboards). |
| `--strict` | Treat warnings as errors. Recommended in CI before a submission. |
| `-h`, `--help` | Show help. |

**Exit codes:** `0` — no errors (warnings allowed unless `--strict`); `1` — errors, or a theme could not be loaded; `2` — usage error (unknown flag, invalid slug, theme not found).

Themes are TypeScript/TSX, so the validator runs them through `tsx`, which ships with the monorepo (`packages/db` dev dependency). If a theme fails to load, the validator prints the first lines of the error and a hint — most often "run `pnpm install`" for a freshly created theme.

### Example output

```text
◆ aurora themes/aurora
  theme      Aurora v1.0.0 · free · fashion, jewelry, general
  sections   37 (header 2, footer 1 in default config)
  templates  index(8) product(3) collection(1) collections(1) search(1) cart(2) page(1) blog(1) article(2) account(1) 404(1)
  settings   41 in 10 groups
  presets    Fashion & Apparel [fashion], Jewelry & Accessories [jewelry], General Store / Multi-category [general]
  ✔ valid

✔ 1 theme(s) valid
```

With problems:

```text
◆ monsoon themes/monsoon
  ✖ error   sections[38].blocks.perk duplicate block type
  ✖ error   defaultConfig.templates.index.order order references missing section "testimonials"
  ✖ error   manifest.price price must be a non-negative integer in BDT minor units
  ⚠ warning sections[39] (monsoon-lookbook) no presets — merchants can't add this section from the picker
  …
  ✖ 3 error(s), 1 warning(s)

✖ 1 of 1 theme(s) failed
```

## validateTheme rules

`validateTheme` returns a flat list of issues:

```ts
type ValidationIssue = { level: "error" | "warning"; path: string; message: string };
```

### Manifest

| Path | Level | Rule |
| --- | --- | --- |
| `manifest.slug` | error | Must match `/^[a-z0-9][a-z0-9-]{1,40}$/` — lowercase letters, digits and hyphens, starting with a letter or digit, 2–41 characters. |
| `manifest.name` | error | Required (non-empty). |
| `manifest.version` | error | Must start with `MAJOR.MINOR.PATCH` (`/^\d+\.\d+\.\d+/`). Pre-release suffixes like `1.2.0-beta.1` pass. |
| `manifest.categories` | error | At least one business category. |
| `manifest.thumbnail` | warning | Recommended for the Theme Store. |

### Sections

For each entry in `theme.sections` (reported as `sections[i]`):

| Path | Level | Rule |
| --- | --- | --- |
| `sections[i]` | error | `schema.type` is required (other checks for that section are skipped). |
| `sections[i]` | error | Section types must be unique across the theme — `duplicate section type "…"`. |
| `sections[i]` | error | `component` must be a function (a React function component, sync or async). |
| `sections[i].settings.<id>` | error | Setting ids must be unique within the section (`header` fields are ignored). |

### Default config

| Path | Level | Rule |
| --- | --- | --- |
| `defaultConfig.groups.header.order`, `defaultConfig.groups.footer.order`, `defaultConfig.templates.<t>.order` | error | Every id in `order` must exist in that list's `sections` — `order references missing section "…"`. |
| `….sections.<id>` | error | Every section instance must use a section `type` the theme defines — `unknown section type "…"`. |
| `defaultConfig.templates.index` / `.product` / `.collection` / `.cart` | error | These four templates are required. |

### Presets

| Path | Level | Rule |
| --- | --- | --- |
| `presets.<id>.templates.<t>.order` | error | `order` must reference existing section instances. |
| `presets.<id>.templates.<t>.sections.<id>` | error | Section types must exist in the theme. |

## Theme Store checks (validate.mjs)

On top of `validateTheme`, the CLI validator checks:

| Path | Level | Rule |
| --- | --- | --- |
| `manifest.slug` | error | Must match the theme's folder name. |
| `manifest.price` | error | Must be a non-negative **integer** in BDT minor units. |
| `manifest.thumbnail` | warning | Should be an `https://images.unsplash.com/photo-…` URL (or your own screenshot at review time); verify with `node tools/verify-images.mjs`. |
| `manifest.description` | warning | Recommended for the Theme Store. |
| `sections[i] (<type>)` | warning | A section with no `presets`, no `group` and no `templates` restriction can't be added from the "Add section" picker. |
| `sections[i].blocks.<type>` | error | Block types must be unique within a section. |
| `sections[i].presets[j]` | error | Section presets may only use block types the section declares. |
| `presets.<id>` | error | Theme preset ids must be unique. |
| `settingsSchema.<group>.<id>` | error | Global setting ids must be unique across all groups. |

## What validation does not cover

Validation is structural. It does **not** check:

- that a section instance's settings and blocks match its schema, or that `templates` / `group` / `limit` restrictions are respected by your configs;
- preset `groups` (only preset `templates` are checked);
- rendering, accessibility or performance.

Those are covered by the [performance & accessibility checklist](/docs/themes/checklist) and human review. A good habit is a small render test that renders every template of your default config and every preset against sample data (`SAMPLE_PRODUCTS` and friends from `@pai/theme-kit`).

## In tests and CI

```ts
import { validateTheme } from "@pai/theme-sdk";
import theme from "@pai-theme/monsoon";

const errors = validateTheme(theme).filter((i) => i.level === "error");
if (errors.length) throw new Error(errors.map((e) => `${e.path}: ${e.message}`).join("\n"));
```

```bash
# CI step
$ node tools/create-theme/validate.mjs monsoon --strict --json > validation.json
```
