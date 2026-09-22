/**
 * Developer documentation — content loading, navigation and search index.
 *
 * Docs are plain markdown files in `apps/web/content/docs/**.md` with a tiny frontmatter
 * block (`title`, `description`). They are read with `fs` at build time by server components
 * and rendered by `@/components/docs/markdown`.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export type DocsNavItem = { slug: string; title: string };
export type DocsNavGroup = { title: string; items: DocsNavItem[] };

export const DOCS_NAV: DocsNavGroup[] = [
  {
    title: "Getting started",
    items: [
      { slug: "", title: "Introduction" },
      { slug: "quickstart", title: "Quickstart" },
      { slug: "architecture", title: "Architecture" },
    ],
  },
  {
    title: "Theme development",
    items: [
      { slug: "themes", title: "Overview & concepts" },
      { slug: "themes/cli", title: "Theme CLI" },
      { slug: "themes/structure", title: "Theme structure" },
      { slug: "themes/manifest", title: "Manifest" },
      { slug: "themes/settings", title: "Settings reference" },
      { slug: "themes/sections", title: "Sections" },
      { slug: "themes/blocks", title: "Blocks" },
      { slug: "themes/presets", title: "Presets" },
      { slug: "themes/context", title: "Storefront context & data" },
      { slug: "themes/theme-kit", title: "Theme Kit" },
      { slug: "themes/styling", title: "Styling & design tokens" },
      { slug: "themes/customizer", title: "Customizer integration" },
      { slug: "themes/local-development", title: "Local development" },
      { slug: "themes/validation", title: "Validation" },
      { slug: "themes/checklist", title: "Performance & a11y checklist" },
      { slug: "themes/submitting", title: "Submitting to the Theme Store" },
    ],
  },
  {
    title: "APIs",
    items: [
      { slug: "api", title: "REST API" },
      { slug: "webhooks", title: "Webhooks" },
      { slug: "integrations", title: "Payments & couriers" },
    ],
  },
  {
    title: "Operations",
    items: [{ slug: "deployment", title: "Deployment" }],
  },
];

const FLAT_NAV: (DocsNavItem & { group: string })[] = DOCS_NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.title })));

export const DOCS_GITHUB_EDIT_BASE = "https://github.com/paicommerce/paicommerce/edit/main/apps/web/content/docs/";

/** Every docs slug ("" = /docs). Used by generateStaticParams and the sitemap. */
export function getAllDocSlugs(): string[] {
  return FLAT_NAV.map((i) => i.slug);
}

export function docHref(slug: string): string {
  return slug ? `/docs/${slug}` : "/docs";
}

/* ─────────────────────────── content files ─────────────────────────── */

function contentRoot(): string {
  const candidates = [
    path.join(/*turbopackIgnore: true*/ process.cwd(), "content/docs"),
    path.join(/*turbopackIgnore: true*/ process.cwd(), "apps/web/content/docs"),
    path.join(/*turbopackIgnore: true*/ process.cwd(), "../../apps/web/content/docs"),
  ];
  return candidates.find((c) => existsSync(c)) ?? candidates[0]!;
}

/** Relative file path (inside content/docs) for a slug. */
function resolveFile(slug: string): string | null {
  const root = contentRoot();
  const options = slug ? [`${slug}.md`, `${slug}/index.md`] : ["index.md"];
  for (const rel of options) if (existsSync(path.join(/*turbopackIgnore: true*/ root, rel))) return rel;
  return null;
}

export type DocHeading = { depth: 2 | 3 | 4; text: string; id: string };

export type Doc = {
  slug: string;
  title: string;
  description: string;
  group: string;
  /** File path relative to content/docs, e.g. "themes/sections.md". */
  file: string;
  editUrl: string;
  body: string;
  headings: DocHeading[];
};

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) return { data: {}, body: raw };
  const data: Record<string, string> = {};
  for (const line of m[1]!.split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;
    let v = kv[2]!.trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    data[kv[1]!] = v;
  }
  return { data, body: raw.slice(m[0].length) };
}

/** Slugify heading text into an anchor id (GitHub-style). */
export function slugifyHeading(text: string): string {
  return (
    stripInline(text)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "section"
  );
}

/** Remove inline markdown syntax (code ticks, emphasis, links) → plain text. */
export function stripInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[^\w])[*_]([^*_]+)[*_](?=[^\w]|$)/g, "$1$2");
}

/**
 * Extract h2–h4 headings (outside fenced code) with de-duplicated ids.
 * The markdown renderer uses the exact same algorithm so ids always match the TOC.
 */
export function extractHeadings(body: string): DocHeading[] {
  const out: DocHeading[] = [];
  const seen = new Map<string, number>();
  let inFence = false;
  for (const line of body.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,4})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = m[2]!;
    out.push({ depth: m[1]!.length as 2 | 3 | 4, text: stripInline(text), id: uniqueId(slugifyHeading(text), seen) });
  }
  return out;
}

export function uniqueId(base: string, seen: Map<string, number>): string {
  const n = seen.get(base) ?? 0;
  seen.set(base, n + 1);
  return n === 0 ? base : `${base}-${n}`;
}

const cache = new Map<string, Doc | null>();

export function getDoc(slug: string): Doc | null {
  const key = slug.replace(/^\/+|\/+$/g, "");
  if (process.env.NODE_ENV === "production" && cache.has(key)) return cache.get(key)!;
  const nav = FLAT_NAV.find((i) => i.slug === key);
  const file = nav ? resolveFile(key) : null;
  let doc: Doc | null = null;
  if (nav && file) {
    const raw = readFileSync(path.join(/*turbopackIgnore: true*/ contentRoot(), file), "utf8");
    const { data, body } = parseFrontmatter(raw);
    doc = {
      slug: key,
      title: data.title || nav.title,
      description: data.description || "",
      group: nav.group,
      file,
      editUrl: DOCS_GITHUB_EDIT_BASE + file,
      body,
      headings: extractHeadings(body),
    };
  }
  cache.set(key, doc);
  return doc;
}

export function getPrevNext(slug: string): { prev: (DocsNavItem & { group: string }) | null; next: (DocsNavItem & { group: string }) | null } {
  const i = FLAT_NAV.findIndex((x) => x.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return { prev: FLAT_NAV[i - 1] ?? null, next: FLAT_NAV[i + 1] ?? null };
}

/* ─────────────────────────── search ─────────────────────────── */

export type DocSearchEntry = {
  slug: string;
  title: string;
  group: string;
  description: string;
  headings: { id: string; text: string }[];
  /** Plain-text excerpt of the page body (for matching & snippets). */
  text: string;
};

function plainText(body: string): string {
  return stripInline(
    body
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/^>\s*\[!(NOTE|TIP|WARNING)\]\s*$/gim, " ")
      .replace(/^[#>|\-*\d.\s]+/gm, "")
      .replace(/\|/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function getDocsSearchIndex(excerptLength = 700): DocSearchEntry[] {
  return getAllDocSlugs()
    .map((slug) => getDoc(slug))
    .filter((d): d is Doc => !!d)
    .map((d) => ({
      slug: d.slug,
      title: d.title,
      group: d.group,
      description: d.description,
      headings: d.headings.filter((h) => h.depth <= 3).map((h) => ({ id: h.id, text: h.text })),
      text: plainText(d.body).slice(0, excerptLength),
    }));
}
