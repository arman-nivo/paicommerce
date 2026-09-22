#!/usr/bin/env node
/**
 * create-pai-theme — scaffold a new PaiCommerce theme and register it.
 *
 *   pnpm theme:new [slug] [--name "My Theme"] [--categories fashion,beauty] [--price 0]
 *                         [--author "Name"] [--tagline "..."] [--dry-run] [--yes] [--no-register]
 *
 * Only Node built-ins are used (no dependencies). See `--help`.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const TEMPLATE_DIR = path.join(HERE, "template");
const THEMES_DIR = path.join(ROOT, "themes");
const REGISTRY = {
  index: path.join(ROOT, "packages/theme-registry/src/index.ts"),
  manifests: path.join(ROOT, "packages/theme-registry/src/manifests.ts"),
  pkg: path.join(ROOT, "packages/theme-registry/package.json"),
};
const SDK_TYPES = path.join(ROOT, "packages/theme-sdk/src/types.ts");

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,40}$/;
const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80";

/* ─────────────────────────── colours ─────────────────────────── */

const useColor = !process.env.NO_COLOR && (process.env.FORCE_COLOR || process.stdout.isTTY);
const paint = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const c = {
  bold: paint("1"),
  dim: paint("2"),
  red: paint("31"),
  green: paint("32"),
  yellow: paint("33"),
  blue: paint("34"),
  magenta: paint("35"),
  cyan: paint("36"),
  gray: paint("90"),
};

/* ─────────────────────────── categories ─────────────────────────── */

const FALLBACK_CATEGORIES = [
  ["fashion", "Fashion & Apparel"],
  ["electronics", "Electronics & Gadgets"],
  ["grocery", "Grocery & Supermarket"],
  ["beauty", "Beauty & Cosmetics"],
  ["home", "Home, Furniture & Decor"],
  ["food", "Food, Restaurant & Bakery"],
  ["jewelry", "Jewelry & Accessories"],
  ["health", "Health, Pharmacy & Wellness"],
  ["kids", "Kids, Baby & Toys"],
  ["sports", "Sports, Fitness & Outdoor"],
  ["books", "Books, Stationery & Education"],
  ["digital", "Digital Products & Courses"],
  ["handicraft", "Handicrafts & Art"],
  ["automotive", "Automotive & Tools"],
  ["pets", "Pet Supplies"],
  ["gifts", "Gifts & Flowers"],
  ["general", "General Store / Multi-category"],
].map(([id, label]) => ({ id, label }));

/** Parse BUSINESS_CATEGORIES from the SDK source so the CLI never drifts; fall back to a copy. */
function loadCategories() {
  try {
    const src = readFileSync(SDK_TYPES, "utf8");
    const block = src.match(/BUSINESS_CATEGORIES\s*=\s*\[([\s\S]*?)\]\s*as const/);
    if (block) {
      const cats = [...block[1].matchAll(/\{\s*id:\s*"([^"]+)"\s*,\s*label:\s*"([^"]+)"\s*\}/g)].map((m) => ({ id: m[1], label: m[2] }));
      if (cats.length) return cats;
    }
  } catch {
    /* fall through */
  }
  return FALLBACK_CATEGORIES;
}
const CATEGORIES = loadCategories();
const CATEGORY_IDS = new Set(CATEGORIES.map((x) => x.id));

/* ─────────────────────────── args ─────────────────────────── */

const HELP = `
${c.bold("create-pai-theme")} — scaffold a new PaiCommerce theme

${c.bold("Usage")}
  pnpm theme:new ${c.cyan("[slug]")} [options]
  node tools/create-theme/index.mjs ${c.cyan("[slug]")} [options]

${c.bold("Options")}
  --name <name>            Display name (default: Title Case of the slug)
  --categories <ids>       Comma-separated business categories (first one = primary)
  --price <taka>           Theme Store price in BDT (major units, e.g. 3900). 0 = free (default)
  --author <name>          Author / studio name (default: git user.name)
  --tagline <text>         One-line Theme Store tagline
  --dry-run                Print the files and registry diffs without writing anything
  -y, --yes                Don't ask for confirmation; use defaults for anything missing
  --no-register            Don't add the theme to packages/theme-registry
  --interactive            Prompt for missing values even when stdin is not a TTY
  -h, --help               Show this help

${c.bold("Rules")}
  slug        ${SLUG_RE}  (must not already exist in /themes)
  categories  ${CATEGORIES.map((x) => x.id).join(", ")}

${c.bold("Examples")}
  pnpm theme:new
  pnpm theme:new sunrise --name "Sunrise" --categories fashion,beauty --price 2900 --author "Acme Studio"
  pnpm theme:new sunrise --categories grocery --dry-run
`;

function parseArgs(argv) {
  const opts = { _: [], register: true, dryRun: false, yes: false, help: false, interactive: false };
  const valueFlags = new Set(["name", "categories", "price", "author", "tagline"]);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") opts.help = true;
    else if (a === "-y" || a === "--yes") opts.yes = true;
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--no-register") opts.register = false;
    else if (a === "--interactive") opts.interactive = true;
    else if (a.startsWith("--")) {
      let [key, val] = a.slice(2).split(/=(.*)/s, 2);
      if (!valueFlags.has(key)) throw new UsageError(`Unknown option ${a}`);
      if (val === undefined) {
        val = argv[++i];
        if (val === undefined || (val.startsWith("--") && val.length > 2)) throw new UsageError(`Option --${key} needs a value`);
      }
      opts[key] = val;
    } else if (a.startsWith("-") && a.length > 1) throw new UsageError(`Unknown option ${a}`);
    else opts._.push(a);
  }
  if (opts._.length > 1) throw new UsageError(`Expected one slug, got: ${opts._.join(" ")}`);
  opts.slug = opts._[0];
  return opts;
}

class UsageError extends Error {}

/* ─────────────────────────── validation ─────────────────────────── */

function titleCase(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function registeredSlugs() {
  try {
    const src = readFileSync(REGISTRY.index, "utf8");
    return new Set([...src.matchAll(/import\("@pai-theme\/([a-z0-9-]+)"\)/g)].map((m) => m[1]));
  } catch {
    return new Set();
  }
}

function checkSlug(slug) {
  if (!slug) return "A slug is required.";
  if (!SLUG_RE.test(slug)) return `"${slug}" is not a valid slug — use 2–41 lowercase letters, digits and dashes, starting with a letter or digit.`;
  if (slug.endsWith("-")) return "Slug must not end with a dash.";
  if (existsSync(path.join(THEMES_DIR, slug))) return `themes/${slug} already exists — pick another slug.`;
  if (registeredSlugs().has(slug)) return `"${slug}" is already registered in packages/theme-registry.`;
  return null;
}

function parseCategories(input) {
  const raw = String(input ?? "")
    .split(/[\s,]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const out = [];
  const bad = [];
  for (const r of raw) {
    let id = r;
    if (/^\d+$/.test(r)) id = CATEGORIES[Number(r) - 1]?.id ?? r; // allow picking by number
    if (!CATEGORY_IDS.has(id)) bad.push(r);
    else if (!out.includes(id)) out.push(id);
  }
  if (bad.length) return { error: `Unknown categor${bad.length > 1 ? "ies" : "y"}: ${bad.join(", ")}. Valid: ${[...CATEGORY_IDS].join(", ")}` };
  if (!out.length) return { error: "Pick at least one category." };
  return { value: out };
}

function parsePrice(input) {
  const s = String(input ?? "").replace(/[৳,\s]/g, "").replace(/^bdt/i, "");
  if (s === "") return { value: 0 };
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return { error: `Invalid price "${input}" — use a number of taka, e.g. 0 or 3900.` };
  const minor = Math.round(Number(s) * 100);
  if (minor > 10_000_000) return { error: "Price looks too high (max ৳100,000)." };
  return { value: minor };
}

function gitUserName() {
  try {
    return execFileSync("git", ["config", "user.name"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || null;
  } catch {
    return null;
  }
}

const formatTaka = (minor) => (minor === 0 ? "Free" : `৳${(minor / 100).toLocaleString("en-US")} (${minor} minor units)`);

/* ─────────────────────────── prompting ─────────────────────────── */

/**
 * Line-queue based prompter. Unlike rl.question it also works when answers are piped in
 * (all lines may arrive before the first question is asked).
 */
function createPrompter() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: !!process.stdin.isTTY });
  const queue = [];
  const waiters = [];
  let closed = false;
  rl.on("line", (line) => (waiters.length ? waiters.shift()(line) : queue.push(line)));
  rl.on("close", () => {
    closed = true;
    while (waiters.length) waiters.shift()(null);
  });
  const next = () => (queue.length ? Promise.resolve(queue.shift()) : closed ? Promise.resolve(null) : new Promise((r) => waiters.push(r)));
  return {
    async ask(question, { def, validate } = {}) {
      for (let attempt = 0; attempt < 5; attempt++) {
        process.stdout.write(`${c.cyan("?")} ${c.bold(question)}${def !== undefined && def !== "" ? c.gray(` (${def})`) : ""} ${c.gray("›")} `);
        let line = await next();
        if (!process.stdin.isTTY) process.stdout.write(`${line ?? ""}\n`); // echo piped answers
        if (line === null) {
          if (def !== undefined) line = "";
          else throw new UsageError("Input ended before all questions were answered.");
        }
        const answer = line.trim() === "" && def !== undefined ? String(def) : line.trim();
        const res = validate ? validate(answer) : { value: answer };
        if (!res.error) return res.value;
        console.log(`  ${c.red("✖")} ${res.error}`);
        if (line === null || closed) throw new UsageError(res.error);
      }
      throw new UsageError("Too many invalid answers.");
    },
    close() {
      rl.close();
    },
  };
}

async function collectOptions(opts) {
  const canPrompt = !opts.yes && (process.stdin.isTTY || opts.interactive);
  const prompter = canPrompt ? createPrompter() : null;
  try {
    // slug
    let slug = opts.slug?.trim().toLowerCase();
    if (slug) {
      const err = checkSlug(slug);
      if (err) throw new UsageError(err);
    } else if (prompter) {
      slug = await prompter.ask("Theme slug (kebab-case, e.g. sunrise)", {
        validate: (v) => {
          const s = v.toLowerCase();
          const err = checkSlug(s);
          return err ? { error: err } : { value: s };
        },
      });
    } else throw new UsageError("Missing theme slug. Usage: pnpm theme:new <slug> [options] (see --help)");

    // name
    let name = opts.name?.trim();
    if (!name) {
      name = prompter ? await prompter.ask("Theme name", { def: titleCase(slug), validate: (v) => (v.length > 60 ? { error: "Keep it under 60 characters." } : { value: v }) }) : titleCase(slug);
    }

    // categories
    let categories;
    if (opts.categories) {
      const res = parseCategories(opts.categories);
      if (res.error) throw new UsageError(res.error);
      categories = res.value;
    } else if (prompter) {
      console.log(c.gray("  Business categories:"));
      const w = String(CATEGORIES.length).length;
      CATEGORIES.forEach((cat, i) => console.log(c.gray(`   ${String(i + 1).padStart(w)}. ${cat.id.padEnd(12)} ${cat.label}`)));
      categories = await prompter.ask("Categories (ids or numbers, comma-separated; first = primary)", { def: "general", validate: parseCategories });
    } else categories = ["general"];

    // price
    let price;
    if (opts.price !== undefined) {
      const res = parsePrice(opts.price);
      if (res.error) throw new UsageError(res.error);
      price = res.value;
    } else if (prompter) price = await prompter.ask("Price in BDT (0 = free)", { def: "0", validate: parsePrice });
    else price = 0;

    // author
    let author = opts.author?.trim();
    if (!author) {
      const def = gitUserName() ?? "Your Name";
      author = prompter ? await prompter.ask("Author / studio name", { def }) : def;
    }

    const tagline = opts.tagline?.trim() || `A fast, flexible theme for ${categories.map((id) => CATEGORIES.find((x) => x.id === id).label.split(/[,&/]/)[0].trim().toLowerCase()).join(", ")} stores`;

    const answers = { slug, name, categories, price, author, tagline };

    if (prompter && !opts.dryRun) {
      printSummary(answers, opts);
      const ok = await prompter.ask("Create this theme? (Y/n)", { def: "Y", validate: (v) => (/^(y|yes|n|no)$/i.test(v) ? { value: /^y/i.test(v) } : { error: "Answer y or n." }) });
      if (!ok) {
        console.log(c.yellow("Aborted — nothing was written."));
        process.exit(0);
      }
    }
    return answers;
  } finally {
    prompter?.close();
  }
}

function printSummary(a, opts) {
  console.log();
  console.log(`  ${c.gray("slug")}        ${c.bold(a.slug)}  ${c.gray(`→ themes/${a.slug}, @pai-theme/${a.slug}`)}`);
  console.log(`  ${c.gray("name")}        ${a.name}`);
  console.log(`  ${c.gray("tagline")}     ${a.tagline}`);
  console.log(`  ${c.gray("categories")}  ${a.categories.join(", ")}`);
  console.log(`  ${c.gray("price")}       ${formatTaka(a.price)}`);
  console.log(`  ${c.gray("author")}      ${a.author}`);
  console.log(`  ${c.gray("register")}    ${opts.register ? "yes (packages/theme-registry)" : "no"}`);
  console.log();
}

/* ─────────────────────────── template rendering ─────────────────────────── */

function camelIdent(slug) {
  let id = slug.replace(/-([a-z0-9])/g, (_, ch) => ch.toUpperCase()).replace(/[^A-Za-z0-9_$]/g, "");
  if (/^\d/.test(id)) id = `theme${id[0].toUpperCase()}${id.slice(1)}`;
  const reserved = new Set(["manifest", "manifests", "getManifest", "ThemeManifest", "import", "export", "default", "new", "class", "function", "var", "let", "const", "delete", "in", "do", "if", "for", "while", "with", "case", "void", "this", "true", "false", "null", "typeof", "return", "switch", "try", "catch", "finally", "throw", "yield", "await", "enum", "super", "extends", "static", "package", "public", "private"]);
  return reserved.has(id) ? `${id}Theme` : id;
}

function placeholders(a) {
  const primary = a.categories[0];
  const camel = camelIdent(a.slug);
  const pascal = camel[0].toUpperCase() + camel.slice(1);
  const description = `${a.name} is a flexible, fast PaiCommerce theme built for ${a.categories
    .map((id) => CATEGORIES.find((x) => x.id === id).label.toLowerCase())
    .join(", ")} stores. Mix and match sections, pick a preset and make it yours in the customizer — no code required.`;
  return {
    __SLUG__: a.slug,
    __NAME__: a.name,
    __CAMEL__: camel,
    __PASCAL__: pascal,
    __TAGLINE__: a.tagline,
    __AUTHOR__: a.author,
    __PRICE__: String(a.price),
    __PRICE_LABEL__: formatTaka(a.price),
    __PRIMARY_CATEGORY__: primary,
    __CATEGORIES_LIST__: a.categories.join(", "),
    __YEAR__: String(new Date().getFullYear()),
    __THUMBNAIL__: DEFAULT_THUMBNAIL,
    // JSON-escaped variants for use inside TS/JSON source (include the quotes).
    __NAME_JSON__: JSON.stringify(a.name),
    __TAGLINE_JSON__: JSON.stringify(a.tagline),
    __DESCRIPTION_JSON__: JSON.stringify(description),
    __AUTHOR_JSON__: JSON.stringify(a.author),
    __CATEGORIES_JSON__: `[${a.categories.map((x) => JSON.stringify(x)).join(", ")}]`,
    __DESCRIPTION_PKG__: JSON.stringify(`${a.name} — ${a.tagline}`),
  };
}

function render(text, vars) {
  // Longest keys first so __NAME_JSON__ isn't clobbered by __NAME__.
  const keys = Object.keys(vars).sort((x, y) => y.length - x.length);
  let out = text;
  for (const k of keys) out = out.split(k).join(vars[k]);
  const left = out.match(/__[A-Z][A-Z_]*__/);
  if (left) throw new Error(`Template placeholder ${left[0]} was not replaced`);
  return out;
}

function listTemplate(dir = TEMPLATE_DIR, rel = "") {
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    const abs = path.join(dir, entry);
    const r = rel ? `${rel}/${entry}` : entry;
    if (statSync(abs).isDirectory()) out.push(...listTemplate(abs, r));
    else out.push(r);
  }
  return out;
}

function buildFiles(a) {
  const vars = placeholders(a);
  return listTemplate().map((rel) => {
    const target = render(rel.replace(/\.tpl$/, ""), vars);
    return { rel: target, content: render(readFileSync(path.join(TEMPLATE_DIR, rel), "utf8"), vars) };
  });
}

/* ─────────────────────────── registry edits (text-based, formatting-preserving) ─────────────────────────── */

function editIndex(src, slug) {
  if (src.includes(`import("@pai-theme/${slug}")`)) return src; // idempotent
  const m = src.match(/(export const themeLoaders\b[^;]*?=\s*\{)([\s\S]*?)(\n\};)/);
  if (!m) throw new Error("Could not find `export const themeLoaders = { … };` in theme-registry/src/index.ts");
  const body = m[2];
  const indent = body.match(/\n([ \t]+)\S/)?.[1] ?? "  ";
  const key = /^[a-z_$][a-z0-9_$]*$/i.test(slug) ? slug : JSON.stringify(slug);
  let newBody = body.replace(/\s*$/, "");
  if (newBody.trim() && !newBody.trim().endsWith(",")) newBody += ",";
  newBody += `\n${indent}${key}: () => import("@pai-theme/${slug}").then((m) => m.default),`;
  return src.slice(0, m.index) + m[1] + newBody + m[3] + src.slice(m.index + m[0].length);
}

function editManifests(src, slug) {
  if (src.includes(`"@pai-theme/${slug}/manifest"`)) return src; // idempotent
  let ident = camelIdent(slug);
  const taken = new Set([...src.matchAll(/\b([A-Za-z_$][\w$]*)\b/g)].map((m) => m[1]));
  while (taken.has(ident)) ident += "Theme";
  const importLine = `import { manifest as ${ident} } from "@pai-theme/${slug}/manifest";`;

  const imports = [...src.matchAll(/^import [^\n]*from "@pai-theme\/[^"]+\/manifest";[ \t]*$/gm)];
  const anyImports = [...src.matchAll(/^import [^\n]*;[ \t]*$/gm)];
  const last = imports.at(-1) ?? anyImports.at(-1);
  if (!last) throw new Error("Could not find import statements in theme-registry/src/manifests.ts");
  const at = last.index + last[0].length;
  let out = src.slice(0, at) + "\n" + importLine + src.slice(at);

  const arr = out.match(/(export const manifests\s*:\s*ThemeManifest\[\]\s*=\s*\[)([\s\S]*?)(\];)/);
  if (!arr) throw new Error("Could not find `export const manifests: ThemeManifest[] = [ … ];` in theme-registry/src/manifests.ts");
  let body = arr[2];
  if (body.includes("\n")) {
    // multi-line array: one entry per line
    const indent = body.match(/\n([ \t]+)\S/)?.[1] ?? "  ";
    const trimmed = body.replace(/\s*$/, "");
    const sep = trimmed.trim() && !trimmed.trim().endsWith(",") ? "," : "";
    body = `${trimmed}${sep}\n${indent}${ident},\n`;
  } else {
    const trimmed = body.trim().replace(/,$/, "");
    body = trimmed ? `${trimmed}, ${ident}` : ident;
  }
  out = out.slice(0, arr.index) + arr[1] + body + arr[3] + out.slice(arr.index + arr[0].length);
  return out;
}

function editRegistryPkg(src, slug) {
  const name = `@pai-theme/${slug}`;
  const json = JSON.parse(src);
  if (json.dependencies?.[name]) return src; // idempotent
  const m = src.match(/("dependencies"\s*:\s*\{)([\s\S]*?)(\n?[ \t]*\})/);
  if (!m) throw new Error('Could not find "dependencies" in theme-registry/package.json');
  const body = m[2];
  const indent = body.match(/\n([ \t]+)"/)?.[1] ?? "    ";
  const trimmed = body.replace(/\s*$/, "");
  const entry = `${JSON.stringify(name)}: "workspace:*"`;
  const newBody = trimmed.trim() ? `${trimmed},\n${indent}${entry}` : `\n${indent}${entry}`;
  const out = src.slice(0, m.index) + m[1] + newBody + m[3] + src.slice(m.index + m[0].length);
  JSON.parse(out); // must stay valid JSON
  return out;
}

function registryChanges(slug) {
  return [
    { file: REGISTRY.index, edit: editIndex },
    { file: REGISTRY.manifests, edit: editManifests },
    { file: REGISTRY.pkg, edit: editRegistryPkg },
  ].map(({ file, edit }) => {
    const before = readFileSync(file, "utf8");
    const after = edit(before, slug);
    return { file, before, after, changed: before !== after };
  });
}

/* ─────────────────────────── tiny line diff for --dry-run ─────────────────────────── */

function diffLines(a, b) {
  const x = a.split("\n");
  const y = b.split("\n");
  const n = x.length;
  const m = y.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (x[i] === y[j]) ops.push([" ", x[i++], j++]);
    else if (dp[i + 1][j] >= dp[i][j + 1]) ops.push(["-", x[i++]]);
    else ops.push(["+", y[j++]]);
  }
  while (i < n) ops.push(["-", x[i++]]);
  while (j < m) ops.push(["+", y[j++]]);
  // keep 2 lines of context around changes
  const keep = ops.map(() => false);
  ops.forEach((op, k) => {
    if (op[0] !== " ") for (let d = -2; d <= 2; d++) if (ops[k + d]) keep[k + d] = true;
  });
  const lines = [];
  let skipped = false;
  ops.forEach((op, k) => {
    if (!keep[k]) {
      if (!skipped) lines.push(c.gray("  …"));
      skipped = true;
      return;
    }
    skipped = false;
    const text = op[1].length > 160 ? op[1].slice(0, 157) + "…" : op[1];
    lines.push(op[0] === "+" ? c.green(`+ ${text}`) : op[0] === "-" ? c.red(`- ${text}`) : c.gray(`  ${text}`));
  });
  return lines.join("\n");
}

function printTree(slug, files) {
  const rels = files.map((f) => f.rel).sort((p, q) => {
    const dp = p.split("/").length;
    const dq = q.split("/").length;
    return p.localeCompare(q) || dp - dq;
  });
  console.log(c.bold(`themes/${slug}/`));
  const printed = new Set();
  for (const rel of rels) {
    const parts = rel.split("/");
    for (let d = 0; d < parts.length; d++) {
      const key = parts.slice(0, d + 1).join("/");
      if (printed.has(key)) continue;
      printed.add(key);
      const isFile = d === parts.length - 1;
      const size = isFile ? c.gray(` ${Buffer.byteLength(files.find((f) => f.rel === rel).content)} B`) : "";
      console.log(`${"  ".repeat(d + 1)}${isFile ? c.cyan(parts[d]) : c.bold(parts[d] + "/")}${size}`);
    }
  }
}

/* ─────────────────────────── main ─────────────────────────── */

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    if (e instanceof UsageError) {
      console.error(`${c.red("✖")} ${e.message}\n${c.gray("Run with --help for usage.")}`);
      process.exit(1);
    }
    throw e;
  }
  if (opts.help) {
    console.log(HELP);
    return;
  }
  if (!existsSync(TEMPLATE_DIR)) throw new Error(`Template folder missing: ${TEMPLATE_DIR}`);

  console.log(`\n${c.magenta("◆")} ${c.bold("PaiCommerce theme scaffolder")}${opts.dryRun ? c.yellow("  [dry run]") : ""}\n`);

  let answers;
  try {
    answers = await collectOptions(opts);
  } catch (e) {
    if (e instanceof UsageError) {
      console.error(`${c.red("✖")} ${e.message}`);
      process.exit(1);
    }
    throw e;
  }

  const { slug } = answers;
  const files = buildFiles(answers);
  const changes = opts.register ? registryChanges(slug) : [];
  const themeDir = path.join(THEMES_DIR, slug);

  if (opts.dryRun) {
    printSummary(answers, opts);
    console.log(c.bold("Files that would be created:\n"));
    printTree(slug, files);
    if (opts.register) {
      console.log(`\n${c.bold("Registry changes:")}`);
      for (const ch of changes) {
        console.log(`\n${c.bold(path.relative(ROOT, ch.file))}${ch.changed ? "" : c.gray("  (already registered — unchanged)")}`);
        if (ch.changed) console.log(diffLines(ch.before, ch.after));
      }
    }
    console.log(`\n${c.yellow("Dry run — nothing was written.")} Re-run without --dry-run to create the theme.\n`);
    return;
  }

  // Write files. If anything fails, roll back so we never leave a half-made theme.
  const written = [];
  try {
    mkdirSync(themeDir, { recursive: false });
    for (const f of files) {
      const abs = path.join(themeDir, f.rel);
      mkdirSync(path.dirname(abs), { recursive: true });
      writeFileSync(abs, f.content);
    }
    for (const ch of changes) {
      if (!ch.changed) continue;
      writeFileSync(ch.file, ch.after);
      written.push(ch);
    }
  } catch (e) {
    rmSync(themeDir, { recursive: true, force: true });
    for (const ch of written) writeFileSync(ch.file, ch.before);
    console.error(`${c.red("✖")} Failed to create the theme — changes were rolled back.\n  ${e.message}`);
    process.exit(1);
  }

  console.log(`${c.green("✔")} Created ${c.bold(`themes/${slug}`)} ${c.gray(`(${files.length} files)`)}`);
  for (const f of files) console.log(`  ${c.gray("+")} ${f.rel}`);
  if (opts.register) {
    for (const ch of changes) console.log(`${ch.changed ? c.green("✔") : c.gray("•")} ${ch.changed ? "Updated" : "Already up to date:"} ${path.relative(ROOT, ch.file)}`);
  } else console.log(`${c.yellow("!")} Skipped registry (--no-register). Add it later to packages/theme-registry (src/index.ts, src/manifests.ts, package.json).`);

  const step = (n, cmd, note) => console.log(`  ${c.magenta(`${n}.`)} ${c.cyan(cmd)}${note ? c.gray(`  ${note}`) : ""}`);
  console.log(`\n${c.bold("Next steps")}`);
  step(1, "pnpm install", "link the new @pai-theme/" + slug + " workspace package");
  step(2, `node tools/create-theme/validate.mjs ${slug}`, "check sections, templates & presets");
  step(3, "pnpm dev", "start all apps");
  step(4, "open http://localhost:3001", "→ Themes → add “" + answers.name + "” and customize");
  step(5, "read http://localhost:3000/docs/themes", "theme developer docs (also docs/THEME_GUIDE.md)");
  console.log(`\n${c.gray(`Edit themes/${slug}/src — start with settings.ts, presets.ts and sections/promo-banner.tsx.`)}\n`);
}

main().catch((e) => {
  console.error(`${c.red("✖")} ${e?.stack ?? e}`);
  process.exit(1);
});
