#!/usr/bin/env node
/**
 * validate-pai-theme — load a theme's ThemeDefinition and run `validateTheme` from @pai/theme-sdk.
 *
 *   node tools/create-theme/validate.mjs <slug> [<slug> …]
 *   node tools/create-theme/validate.mjs --all
 *   node tools/create-theme/validate.mjs <slug> --json      (machine-readable output for CI)
 *
 * Themes are TypeScript/TSX, so the definition is loaded through `tsx` (already installed in the
 * monorepo — no extra dependency). Exit code: 0 = no errors (warnings allowed), 1 = errors or the
 * theme could not be loaded, 2 = usage error.
 */
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const THEMES_DIR = path.join(ROOT, "themes");
const SDK_UTILS = path.join(ROOT, "packages/theme-sdk/src/utils.ts");
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,40}$/;

const useColor = !process.env.NO_COLOR && (process.env.FORCE_COLOR || process.stdout.isTTY);
const paint = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const c = { bold: paint("1"), red: paint("31"), green: paint("32"), yellow: paint("33"), cyan: paint("36"), magenta: paint("35"), gray: paint("90") };

const HELP = `
${c.bold("validate-pai-theme")} — validate PaiCommerce themes

${c.bold("Usage")}
  node tools/create-theme/validate.mjs ${c.cyan("<slug> [<slug> …]")}
  node tools/create-theme/validate.mjs ${c.cyan("--all")}

${c.bold("Options")}
  --all        Validate every theme in /themes
  --json       Print raw JSON results (for CI)
  --strict     Treat warnings as errors
  -h, --help   Show this help
`;

/* ─────────────────────────── args ─────────────────────────── */

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("-")));
const slugsArg = args.filter((a) => !a.startsWith("-"));
if (flags.has("-h") || flags.has("--help")) {
  console.log(HELP);
  process.exit(0);
}
for (const f of flags) {
  if (!["--all", "--json", "--strict"].includes(f)) {
    console.error(`${c.red("✖")} Unknown option ${f}\n${HELP}`);
    process.exit(2);
  }
}
const JSON_OUT = flags.has("--json");
const STRICT = flags.has("--strict");

function allThemes() {
  return readdirSync(THEMES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(path.join(THEMES_DIR, d.name, "src/index.ts")))
    .map((d) => d.name)
    .sort();
}

const slugs = flags.has("--all") ? allThemes() : slugsArg;
if (!slugs.length) {
  console.error(`${c.red("✖")} Pass a theme slug or --all.\n${HELP}`);
  process.exit(2);
}
for (const s of slugs) {
  if (!SLUG_RE.test(s)) {
    console.error(`${c.red("✖")} Invalid slug "${s}".`);
    process.exit(2);
  }
  if (!existsSync(path.join(THEMES_DIR, s, "src/index.ts"))) {
    console.error(`${c.red("✖")} themes/${s}/src/index.ts not found.${allThemes().length ? c.gray(` Available: ${allThemes().join(", ")}`) : ""}`);
    process.exit(2);
  }
}

/* ─────────────────────────── locate tsx ─────────────────────────── */

function findTsxCli() {
  const candidates = [path.join(ROOT, "packages/db"), ROOT, path.join(ROOT, "tools/create-theme")];
  for (const base of candidates) {
    try {
      const req = createRequire(path.join(base, "package.json"));
      const pkgPath = req.resolve("tsx/package.json");
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      const bin = typeof pkg.bin === "string" ? pkg.bin : pkg.bin?.tsx;
      if (bin) {
        const cli = path.join(path.dirname(pkgPath), bin);
        if (existsSync(cli)) return cli;
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

const tsxCli = findTsxCli();
if (!tsxCli) {
  console.error(`${c.red("✖")} Could not find tsx. It ships with packages/db (devDependency) — run ${c.cyan("pnpm install")} at the repo root.`);
  process.exit(1);
}

/* ─────────────────────────── runner ─────────────────────────── */

// The runner imports each theme's default export + validateTheme and prints one JSON line.
const RUNNER = `
const [utilsUrl, ...entries] = process.argv.slice(2);
const results = [];
let validateTheme;
try {
  ({ validateTheme } = await import(utilsUrl));
} catch (e) {
  console.log("__PAI_RESULT__" + JSON.stringify({ fatal: "Could not load @pai/theme-sdk validateTheme: " + (e && e.message) }));
  process.exit(0);
}
for (const entry of entries) {
  const [slug, url] = entry.split("=");
  try {
    const mod = await import(url);
    const theme = mod.default;
    if (!theme || typeof theme !== "object") {
      results.push({ slug, loadError: "src/index.ts has no default export (expected a ThemeDefinition from defineTheme()/createBaseTheme())." });
      continue;
    }
    const issues = validateTheme(theme);
    const extra = [];
    const m = theme.manifest || {};
    if (m.slug && m.slug !== slug) extra.push({ level: "error", path: "manifest.slug", message: 'manifest.slug "' + m.slug + '" must match the folder name "' + slug + '"' });
    if (m.thumbnail && !/^https:\\/\\/images\\.unsplash\\.com\\/photo-/.test(m.thumbnail)) extra.push({ level: "warning", path: "manifest.thumbnail", message: "use an images.unsplash.com/photo-… URL (verify with tools/verify-images.mjs)" });
    if (typeof m.price !== "number" || !Number.isInteger(m.price) || m.price < 0) extra.push({ level: "error", path: "manifest.price", message: "price must be a non-negative integer in BDT minor units" });
    if (!m.description) extra.push({ level: "warning", path: "manifest.description", message: "description is recommended for the Theme Store" });
    (theme.sections || []).forEach((s, i) => {
      const sc = s && s.schema;
      if (!sc || !sc.type) return;
      if (!sc.presets?.length && !sc.group && !(sc.templates && sc.templates.length)) extra.push({ level: "warning", path: "sections[" + i + "] (" + sc.type + ")", message: "no presets — merchants can't add this section from the picker" });
      const blockTypes = new Set();
      (sc.blocks || []).forEach((b) => {
        if (blockTypes.has(b.type)) extra.push({ level: "error", path: "sections[" + i + "].blocks." + b.type, message: "duplicate block type" });
        blockTypes.add(b.type);
      });
      (sc.presets || []).forEach((p, j) => (p.blocks || []).forEach((b) => {
        if (!blockTypes.has(b.type)) extra.push({ level: "error", path: "sections[" + i + "].presets[" + j + "]", message: 'preset uses unknown block type "' + b.type + '"' });
      }));
    });
    const presetIds = new Set();
    (theme.presets || []).forEach((p) => {
      if (presetIds.has(p.id)) extra.push({ level: "error", path: "presets." + p.id, message: "duplicate preset id" });
      presetIds.add(p.id);
    });
    const settingIds = new Set();
    (theme.settingsSchema || []).forEach((g) => (g.settings || []).forEach((f) => {
      if (f.type === "header") return;
      if (settingIds.has(f.id)) extra.push({ level: "error", path: "settingsSchema." + g.name + "." + f.id, message: "duplicate global setting id" });
      settingIds.add(f.id);
    }));
    const ORDER = ["index", "product", "collection", "collections", "search", "cart", "page", "blog", "article", "account", "404"];
    const rank = (t) => (ORDER.indexOf(t) === -1 ? 99 : ORDER.indexOf(t));
    const templates = Object.entries((theme.defaultConfig && theme.defaultConfig.templates) || {})
      .sort(([a], [b]) => rank(a) - rank(b))
      .map(([t, l]) => ({ id: t, sections: (l && l.order && l.order.length) || 0 }));
    results.push({
      slug,
      issues: [...issues, ...extra],
      summary: {
        name: m.name, version: m.version, categories: m.categories || [], price: m.price,
        sections: (theme.sections || []).length,
        sectionTypes: (theme.sections || []).map((s) => s && s.schema && s.schema.type).filter(Boolean),
        settingsGroups: (theme.settingsSchema || []).length,
        settings: settingIds.size,
        templates,
        header: theme.defaultConfig?.groups?.header?.order?.length || 0,
        footer: theme.defaultConfig?.groups?.footer?.order?.length || 0,
        presets: (theme.presets || []).map((p) => ({ id: p.id, name: p.name, category: p.category })),
        hasLayout: typeof theme.Layout === "function",
        css: typeof theme.css === "string" ? theme.css.length : 0,
      },
    });
  } catch (e) {
    results.push({ slug, loadError: (e && (e.stack || e.message)) || String(e) });
  }
}
console.log("__PAI_RESULT__" + JSON.stringify({ results }));
process.exit(0);
`;

function runValidation(list) {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "pai-validate-"));
  const runner = path.join(tmp, "runner.mjs");
  writeFileSync(runner, RUNNER);
  const entries = list.map((s) => `${s}=${pathToFileURL(path.join(THEMES_DIR, s, "src/index.ts")).href}`);
  // Use the first theme's tsconfig (all themes extend tsconfig.base.json → jsx: react-jsx).
  const tsconfig = path.join(THEMES_DIR, list[0], "tsconfig.json");
  const res = spawnSync(process.execPath, [tsxCli, "--tsconfig", tsconfig, runner, pathToFileURL(SDK_UTILS).href, ...entries], {
    cwd: path.join(THEMES_DIR, list[0]),
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV ?? "production", PAI_THEME_VALIDATE: "1" },
    timeout: 120_000,
  });
  rmSync(tmp, { recursive: true, force: true });
  const line = (res.stdout || "").split("\n").find((l) => l.startsWith("__PAI_RESULT__"));
  if (!line) {
    return { fatal: `The validator process failed (exit ${res.status ?? res.signal}).\n${(res.stderr || res.stdout || "").trim()}` };
  }
  return JSON.parse(line.slice("__PAI_RESULT__".length));
}

/* ─────────────────────────── output ─────────────────────────── */

function explainLoadError(msg) {
  const hints = [];
  const kit = /theme-kit/.test(msg) || /createBaseTheme/.test(msg);
  if (kit) hints.push("@pai/theme-kit failed to load or is incomplete — check that packages/theme-kit/src/index.ts exists and exports `createBaseTheme`.");
  if (!kit && /Cannot find (package|module) '([^']+)'/.test(msg)) {
    const mod = msg.match(/Cannot find (?:package|module) '([^']+)'/)[1];
    hints.push(`Module "${mod}" could not be resolved. New theme? Run ${c.cyan("pnpm install")} so its workspace dependencies get linked.`);
  }
  if (/is not a function/.test(msg)) hints.push("An import resolved to undefined — a helper your theme uses may not be exported (yet) by @pai/theme-kit or @pai/theme-sdk.");
  return hints;
}

const result = runValidation(slugs);

if (JSON_OUT) {
  console.log(JSON.stringify(result, null, 2));
  const bad = result.fatal || result.results.some((r) => r.loadError || r.issues.some((i) => i.level === "error" || (STRICT && i.level === "warning")));
  process.exit(bad ? 1 : 0);
}

if (result.fatal) {
  console.error(`${c.red("✖")} ${result.fatal}`);
  for (const h of explainLoadError(result.fatal)) console.error(`  ${c.yellow("hint")} ${h}`);
  process.exit(1);
}

let failed = 0;
let totalWarnings = 0;
for (const r of result.results) {
  console.log(`\n${c.magenta("◆")} ${c.bold(r.slug)} ${c.gray(`themes/${r.slug}`)}`);
  if (r.loadError) {
    failed++;
    const first = r.loadError.split("\n").slice(0, 6).join("\n    ");
    console.log(`  ${c.red("✖ Could not load the theme:")}\n    ${c.gray(first)}`);
    for (const h of explainLoadError(r.loadError)) console.log(`  ${c.yellow("hint")} ${h}`);
    continue;
  }
  const errors = r.issues.filter((i) => i.level === "error");
  const warnings = r.issues.filter((i) => i.level === "warning");
  totalWarnings += warnings.length;
  for (const i of errors) console.log(`  ${c.red("✖ error  ")} ${c.cyan(i.path)} ${i.message}`);
  for (const i of warnings) console.log(`  ${c.yellow("⚠ warning")} ${c.cyan(i.path)} ${i.message}`);
  const s = r.summary;
  const price = s.price === 0 ? "free" : typeof s.price === "number" ? `৳${(s.price / 100).toLocaleString("en-US")}` : "?";
  console.log(`  ${c.gray("theme     ")} ${s.name ?? "?"} v${s.version ?? "?"} · ${price} · ${s.categories.join(", ") || "no categories"}`);
  console.log(`  ${c.gray("sections  ")} ${s.sections} ${c.gray(`(header ${s.header}, footer ${s.footer} in default config)`)}`);
  console.log(`  ${c.gray("templates ")} ${s.templates.map((t) => `${t.id}${c.gray(`(${t.sections})`)}`).join(" ") || c.red("none")}`);
  console.log(`  ${c.gray("settings  ")} ${s.settings} in ${s.settingsGroups} groups`);
  console.log(`  ${c.gray("presets   ")} ${s.presets.length ? s.presets.map((p) => `${p.name}${c.gray(` [${p.category}]`)}`).join(", ") : "none"}`);
  const bad = errors.length || (STRICT && warnings.length);
  if (bad) failed++;
  console.log(`  ${bad ? c.red(`✖ ${errors.length} error(s), ${warnings.length} warning(s)`) : c.green(`✔ valid${warnings.length ? c.yellow(` (${warnings.length} warning${warnings.length > 1 ? "s" : ""})`) : ""}`)}`);
}

console.log(
  `\n${failed ? c.red(`✖ ${failed} of ${result.results.length} theme(s) failed`) : c.green(`✔ ${result.results.length} theme(s) valid`)}${totalWarnings ? c.gray(`, ${totalWarnings} warning(s)`) : ""}${STRICT ? c.gray(" [strict]") : ""}\n`,
);
process.exit(failed ? 1 : 0);
