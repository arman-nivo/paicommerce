/**
 * Shared Playhouse building blocks: playful colour helpers, wavy dividers, blobs, badges logic and
 * the tiny global keyframes stylesheet (theme CSS is nested under `.pai-theme-playhouse`, where
 * `@keyframes` are not allowed, so keyframes ship as a deduplicated React 19 `<style>`).
 */
import type { CSSProperties } from "react";
import type { SettingField, SfProduct, StorefrontContext } from "@pai/theme-sdk";
import { cn, num, str } from "@pai/theme-kit";

/* ─────────────────────────── colours ─────────────────────────── */

export const FUN_KEYS = ["sunshine", "bubblegum", "sky", "grape", "mint"] as const;
export type FunKey = (typeof FUN_KEYS)[number];

const FUN_VAR: Record<string, string> = {
  sunshine: "var(--ph-c1)",
  bubblegum: "var(--ph-c2)",
  sky: "var(--ph-c3)",
  grape: "var(--ph-c4)",
  mint: "var(--ph-c5)",
  primary: "var(--pai-primary)",
  accent: "var(--pai-accent)",
};

/** Resolve a colour setting (a playful colour key, "primary"/"accent" or a hex) to a CSS colour. */
export function funColor(value: unknown, fallbackIndex = 0): string {
  const v = str(value).trim();
  if (FUN_VAR[v]) return FUN_VAR[v]!;
  if (/^#[0-9a-f]{3,8}$/i.test(v)) return v;
  return FUN_VAR[FUN_KEYS[((fallbackIndex % 5) + 5) % 5]!]!;
}

/** The n-th playful colour (rotates through the five). */
export const funAt = (i: number) => FUN_VAR[FUN_KEYS[((i % 5) + 5) % 5]!]!;

/** `color-mix` tint of a CSS colour with white (for soft backdrops). */
export const tint = (c: string, pct = 22) => `color-mix(in srgb, ${c} ${pct}%, white)`;

/** Stable 0..n-1 index from a string (used to rotate card backdrops). */
export function hashIndex(s: string, n = 5): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % n;
}

/** Select field for a playful colour. */
export function funColorField(id: string, label: string, def: string = "sunshine", extra: { value: string; label: string }[] = []): SettingField {
  return {
    type: "select",
    id,
    label,
    default: def,
    options: [
      { value: "sunshine", label: "Sunshine" },
      { value: "bubblegum", label: "Bubblegum" },
      { value: "sky", label: "Sky" },
      { value: "grape", label: "Grape" },
      { value: "mint", label: "Mint" },
      { value: "primary", label: "Primary colour" },
      { value: "accent", label: "Accent colour" },
      ...extra,
    ],
  };
}

/** Section background selector used by the signature sections. */
export function backgroundField(def = "none"): SettingField {
  return funColorField("background", "Background", def, [
    { value: "none", label: "Page background" },
    { value: "muted", label: "Muted" },
  ]);
}

/** Style for a section `background` setting (tinted playful colour, muted, or nothing). */
export function backgroundStyle(value: unknown, pct = 20): CSSProperties | undefined {
  const v = str(value, "none");
  if (v === "none" || !v) return undefined;
  if (v === "muted") return { background: "var(--pai-muted)" };
  return { background: tint(funColor(v), pct) };
}

/* ─────────────────────────── decorative svg ─────────────────────────── */

/** Wavy edge. Fill with `currentColor`, e.g. `<Wave className="text-pai-muted" />`. */
export function Wave({ className, flip = false, variant = 0 }: { className?: string; flip?: boolean; variant?: number }) {
  const paths = [
    "M0 24 C 120 0 240 0 360 20 S 600 44 720 24 S 960 0 1080 20 S 1320 44 1440 24 V48 H0 Z",
    "M0 30 C 160 6 320 6 480 26 S 800 46 960 26 S 1280 6 1440 22 V48 H0 Z",
  ];
  return (
    <svg aria-hidden viewBox="0 0 1440 48" preserveAspectRatio="none" className={cn("block h-6 w-full md:h-10", flip && "rotate-180", className)}>
      <path d={paths[variant % paths.length]} fill="currentColor" />
    </svg>
  );
}

const BLOBS = [
  "M44.7,-58.6C57.2,-49.9,66,-35.3,70.4,-19.2C74.8,-3.1,74.8,14.5,67.6,28.3C60.4,42.1,46,52.2,30.5,59.6C15,67,-1.6,71.8,-18.4,69.1C-35.2,66.4,-52.2,56.2,-62.3,41.4C-72.4,26.6,-75.5,7.2,-71.6,-10.2C-67.7,-27.6,-56.8,-43,-42.8,-51.4C-28.8,-59.8,-11.7,-61.2,3.2,-65.1C18.1,-69,32.2,-67.3,44.7,-58.6Z",
  "M39.9,-51.2C52.8,-43.7,64.9,-32.4,69.9,-18.1C74.9,-3.8,72.8,13.5,65.1,27.4C57.4,41.3,44,51.8,29.2,58.7C14.4,65.6,-1.8,68.9,-18.6,66.2C-35.4,63.5,-52.8,54.8,-62.5,40.6C-72.2,26.4,-74.2,6.7,-69.6,-10.4C-65,-27.5,-53.8,-42,-40.3,-49.4C-26.8,-56.8,-13.4,-57.1,0.6,-57.9C14.6,-58.7,29.2,-58.6,39.9,-51.2Z",
  "M47.3,-61.2C60.4,-51.3,69.2,-35.6,72.6,-19C76,-2.4,74,15.1,66.3,29.3C58.6,43.5,45.3,54.4,30.3,61.6C15.3,68.8,-1.4,72.3,-17.7,69.1C-34,65.9,-49.9,56,-60.6,41.8C-71.3,27.6,-76.8,9.1,-73.9,-7.9C-71,-24.9,-59.7,-40.4,-45.6,-50.1C-31.5,-59.8,-15.8,-63.7,0.9,-64.8C17.5,-65.9,34.2,-71.1,47.3,-61.2Z",
];

/** Organic blob shape (decorative). */
export function Blob({ className, color, variant = 0, style }: { className?: string; color?: string; variant?: number; style?: CSSProperties }) {
  return (
    <svg aria-hidden viewBox="-80 -80 160 160" className={cn("pointer-events-none", className)} style={style}>
      <path d={BLOBS[variant % BLOBS.length]} fill={color ?? "currentColor"} />
    </svg>
  );
}

/** Hand-drawn squiggle underline (decorative). */
export function Squiggle({ className, color }: { className?: string; color?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 14" preserveAspectRatio="none" className={cn("pointer-events-none", className)}>
      <path d="M2 9 C 20 1, 36 13, 54 7 S 88 1, 106 7 S 140 13, 158 7 S 186 2, 198 6" fill="none" stroke={color ?? "currentColor"} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** Little 4-point sparkle (decorative). */
export function Sparkle({ className, color, style }: { className?: string; color?: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn("pointer-events-none", className)} style={style}>
      <path d="M12 0 C13 7 17 11 24 12 C17 13 13 17 12 24 C11 17 7 13 0 12 C7 11 11 7 12 0Z" fill={color ?? "currentColor"} />
    </svg>
  );
}

/* ─────────────────────────── global keyframes ─────────────────────────── */

const KEYFRAMES = `
@keyframes ph-wiggle{0%,100%{transform:rotate(0)}20%{transform:rotate(-5deg)}40%{transform:rotate(4deg)}60%{transform:rotate(-3deg)}80%{transform:rotate(2deg)}}
@keyframes ph-float{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-12px) rotate(3deg)}}
@keyframes ph-spin{to{transform:rotate(360deg)}}
`;

/** Global keyframes for the theme (deduplicated by React via `href`). */
export function PlayhouseStyles() {
  return (
    <style href="playhouse-keyframes" precedence="default">
      {KEYFRAMES}
    </style>
  );
}

/* ─────────────────────────── product badges ─────────────────────────── */

function rangeLabel(a: number, b: number, unit: string) {
  const u = /^m/i.test(unit) ? "m" : " yrs";
  return a === b ? `${a}${u}` : `${a}–${b}${u}`;
}

/**
 * Age badge from tags ("age-3+", "3-5y", "ages:0-12m", "newborn"), the title ("3+ yrs", "(3-5 years)")
 * or Age/Size option values ("2–3Y", "0–3M"). Returns null when nothing age-like is found.
 */
export function ageBadge(p: Pick<SfProduct, "tags" | "title" | "options">): string | null {
  for (const raw of p.tags ?? []) {
    const t = raw.toLowerCase().trim();
    let m = t.match(/^(?:ages?[-:\s]*)?(\d{1,2})\s*\+\s*(y|yr|yrs|years?|m|mo|months?)?$/);
    if (m && (t.startsWith("age") || m[2])) return `${m[1]}+${m[2] && /^m/.test(m[2]) ? " m" : " yrs"}`;
    m = t.match(/^(?:ages?[-:\s]*)?(\d{1,2})\s*[-–to]+\s*(\d{1,2})\s*(y|yr|yrs|years?|m|mo|months?)$/);
    if (m) return rangeLabel(Number(m[1]), Number(m[2]), m[3]!);
    if (t === "newborn") return "Newborn";
  }
  const title = p.title ?? "";
  let m = title.match(/\b(\d{1,2})\s*\+\s*(?:yrs?|years?|y)\b/i) ?? title.match(/\bages?\s*(\d{1,2})\s*\+/i);
  if (m) return `${m[1]}+ yrs`;
  m = title.match(/\b(\d{1,2})\s*[-–]\s*(\d{1,2})\s*(yrs?|years?|m|months?)\b/i);
  if (m) return rangeLabel(Number(m[1]), Number(m[2]), m[3]!);
  const opt = (p.options ?? []).find((o) => /^(age|size)$/i.test(o.name));
  if (opt) {
    let lo = Infinity;
    let hi = -Infinity;
    let unit = "";
    for (const v of opt.values) {
      const r = v.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})\s*([ym])\b/i);
      if (!r) continue;
      if (unit && unit !== r[3]!.toLowerCase()) return null;
      unit = r[3]!.toLowerCase();
      lo = Math.min(lo, Number(r[1]));
      hi = Math.max(hi, Number(r[2]));
    }
    if (unit && Number.isFinite(lo)) return rangeLabel(lo, hi, unit);
  }
  if ((p.tags ?? []).some((t) => t.toLowerCase() === "baby")) return "Baby";
  return null;
}

export function isBestseller(p: Pick<SfProduct, "tags" | "rating">, context: Pick<StorefrontContext, "theme">): boolean {
  const tag = str(context.theme.bestseller_tag, "bestseller").toLowerCase().trim();
  if (tag && p.tags.some((t) => t.toLowerCase() === tag || t.toLowerCase() === "best-seller")) return true;
  return p.rating.count >= 25 && p.rating.average >= 4.6;
}

export function isNewProduct(p: Pick<SfProduct, "createdAt">, context: Pick<StorefrontContext, "theme">): boolean {
  const t = new Date(p.createdAt).getTime();
  if (!(t > 0)) return false;
  return Date.now() - t < num(context.theme.new_badge_days, 30) * 86_400_000;
}

/* ─────────────────────────── misc ─────────────────────────── */

/** `store.address` may be a JSON-ish string; render it as one readable line. */
export function formatAddress(address: string | null | undefined): string | null {
  const a = (address ?? "").trim();
  if (!a) return null;
  if (a.startsWith("{")) {
    try {
      const o = JSON.parse(a) as Record<string, unknown>;
      const parts = ["line1", "line2", "area", "city", "postalCode"].map((k) => (typeof o[k] === "string" ? (o[k] as string).trim() : "")).filter(Boolean);
      return parts.length ? parts.join(", ") : null;
    } catch {
      return null;
    }
  }
  return a;
}

/** Visible focus ring shared by Playhouse links/buttons. */
export const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-pai-primary focus-visible:ring-offset-2 focus-visible:ring-offset-pai-bg";
