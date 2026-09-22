/**
 * Small building blocks shared by Artisan's sections: handwritten accent words, stitched rules,
 * eyebrow labels, handwritten notes and a tag → craft region lookup for museum labels.
 */
import type { ReactNode } from "react";
import type { SfProduct } from "@pai/theme-sdk";
import { cn } from "@pai/theme-kit";

/**
 * Heading text where `*word*` is set in the handwritten accent font (Artisan's signature type
 * treatment — the font is the "Handwritten accent font" theme setting).
 */
export function Accent({ text }: { text: string }): ReactNode {
  if (!text.includes("*")) return text;
  return text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((p, i) =>
      p.startsWith("*") && p.endsWith("*") ? (
        <em key={i} className="artisan-hand artisan-hand-word">
          {p.slice(1, -1)}
        </em>
      ) : (
        <span key={i}>{p}</span>
      ),
    );
}

/** Plain text version of an accent heading (aria-labels, alt text). */
export const plain = (text: string) => text.replace(/\*/g, "");

/** Horizontal kantha running-stitch rule (hidden when stitches are turned off). */
export function Stitch({ className, tone = "accent" }: { className?: string; tone?: "accent" | "indigo" | "current" }) {
  return <span aria-hidden className={cn("artisan-stitch", tone === "indigo" && "artisan-stitch-indigo", tone === "current" && "artisan-stitch-current", className)} />;
}

/** Stitched divider with a small cross-stitch knot in the middle. */
export function StitchDivider({ className, label }: { className?: string; label?: string }) {
  return (
    <div aria-hidden={label ? undefined : true} className={cn("flex items-center gap-4", className)}>
      <Stitch className="flex-1" />
      {label ? <span className="artisan-hand shrink-0 text-2xl leading-none text-pai-accent">{label}</span> : <CrossKnot />}
      <Stitch className="flex-1" />
    </div>
  );
}

export function CrossKnot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={cn("size-3.5 shrink-0 text-pai-accent", className)}>
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Eyebrow: small caps with a leading stitch dash. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <p className={cn("artisan-eyebrow pai-eyebrow mb-4 inline-flex items-center gap-3 text-pai-accent", className)}>
      <span aria-hidden className="artisan-stitch w-7" />
      {children}
    </p>
  );
}

/** A handwritten note, optionally with a hand-drawn arrow. */
export function HandNote({ children, className, arrow }: { children: ReactNode; className?: string; arrow?: "left" | "down" | "none" }) {
  if (!children) return null;
  return (
    <p className={cn("artisan-hand inline-flex items-end gap-2 text-2xl leading-tight text-pai-accent", className)}>
      {arrow === "left" ? (
        <svg viewBox="0 0 48 24" aria-hidden className="mb-1 h-5 w-11 shrink-0">
          <path d="M46 6C34 18 18 20 4 14m0 0 7-6M4 14l8 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : null}
      <span>{children}</span>
      {arrow === "down" ? (
        <svg viewBox="0 0 32 40" aria-hidden className="h-9 w-7 shrink-0">
          <path d="M4 3c16 4 22 16 16 33m0 0-6-6m6 6 5-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : null}
    </p>
  );
}

export const RATIO: Record<string, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  tall: "aspect-[2/3]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
};

/** Product tags → the craft region printed on museum labels. */
const REGION_TAGS: [string[], string][] = [
  [["kantha", "nakshi-kantha"], "Jamalpur"],
  [["jamdani"], "Rupganj, Narayanganj"],
  [["shital-pati", "shitalpati", "pati"], "Sylhet"],
  [["copper", "brass", "bell-metal", "kansa"], "Dhamrai"],
  [["terracotta", "pottery", "clay"], "Bijoypur, Netrokona"],
  [["shataranji", "rug", "dhurrie"], "Rangpur"],
  [["jute"], "Mymensingh"],
  [["leather"], "Hazaribagh, Dhaka"],
];

export function regionOf(p: Pick<SfProduct, "tags">, fallback = "Bangladesh"): string {
  const tags = p.tags.map((t) => t.toLowerCase());
  for (const [keys, region] of REGION_TAGS) if (keys.some((k) => tags.includes(k))) return region;
  return fallback;
}

export const splitList = (v: unknown) =>
  (typeof v === "string" ? v : "")
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
