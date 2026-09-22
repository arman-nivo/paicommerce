/**
 * Small building blocks shared by Bloom's sections.
 */
import type { ReactNode } from "react";
import { cn } from "@pai/theme-kit";

/**
 * Render heading text where `*word*` becomes an italic accent word (Bloom's signature type
 * treatment, toggled by the "Italic accent words" theme setting via CSS variables).
 */
export function Accent({ text }: { text: string }): ReactNode {
  if (!text.includes("*")) return text;
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return parts.map((p, i) =>
    p.startsWith("*") && p.endsWith("*") ? (
      <em key={i} className="bloom-em">
        {p.slice(1, -1)}
      </em>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

/** Plain text version of an accent heading (for aria-labels / alt text). */
export const plain = (text: string) => text.replace(/\*/g, "");

/** Blurred pastel shapes behind a section (hidden when the theme setting is off). */
export function Blobs({ className, tone = "accent" }: { className?: string; tone?: "accent" | "muted" }) {
  return (
    <div aria-hidden className={cn("bloom-blobs pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <span className={cn("absolute -left-24 -top-24 size-[26rem] rounded-full blur-3xl", tone === "accent" ? "bg-pai-accent/20" : "bg-pai-muted")} />
      <span className="absolute -bottom-32 right-[-6rem] size-[30rem] rounded-full bg-pai-muted blur-3xl" />
    </div>
  );
}

/** Eyebrow with a small petal mark. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <p className={cn("pai-eyebrow mb-3 inline-flex items-center gap-2 text-pai-accent", className)}>
      <svg viewBox="0 0 12 12" aria-hidden className="size-2.5 fill-current">
        <path d="M6 0c1 2.6 3.4 5 6 6-2.6 1-5 3.4-6 6-1-2.6-3.4-5-6-6 2.6-1 5-3.4 6-6Z" />
      </svg>
      {children}
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
