/**
 * Small building blocks shared by Nest's sections.
 */
import type { ReactNode } from "react";
import type { StorefrontContext } from "@pai/theme-sdk";
import { ICON_OPTIONS, cn, num, str } from "@pai/theme-kit";

/** Eyebrow with a short thin rule in front — Nest's quiet, architectural label. */
export function Eyebrow({ children, className, light }: { children: ReactNode; className?: string; light?: boolean }) {
  if (!children) return null;
  return (
    <p className={cn("nest-eyebrow mb-4 inline-flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em]", light ? "text-white/85" : "text-pai-accent", className)}>
      <span aria-hidden className="h-px w-8 bg-current opacity-70" />
      {children}
    </p>
  );
}

/** Section heading block: eyebrow, h2, optional intro, optional right-aligned action. */
export function NestHeading({
  eyebrow,
  heading,
  text,
  align = "left",
  action,
  className,
}: {
  eyebrow?: string;
  heading?: string;
  text?: string;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}) {
  if (!eyebrow && !heading && !text && !action) return null;
  const center = align === "center";
  return (
    <div className={cn("mb-10 flex flex-col gap-6 md:mb-14", center ? "items-center text-center" : "md:flex-row md:items-end md:justify-between", className)}>
      <div className={cn("max-w-2xl", center && "mx-auto")}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        {heading ? <h2 className="pai-h2 nest-title">{heading}</h2> : null}
        {text ? <p className="mt-4 text-base leading-relaxed opacity-75 md:text-[1.05rem]">{text}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export const RATIO: Record<string, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  tall: "aspect-[2/3]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
  panorama: "aspect-[21/9]",
};

export const ratioOptions = (keys: string[]) =>
  keys.map((k) => ({
    value: k,
    label: { square: "Square", portrait: "Portrait", tall: "Tall", landscape: "Landscape (4:3)", wide: "Wide (16:9)", panorama: "Panorama (21:9)" }[k] ?? k,
  }));

/** "Label | /url" lines → links. */
export function parseLinks(v: unknown): { label: string; href: string }[] {
  return str(v)
    .split("\n")
    .map((line) => line.split("|").map((x) => x.trim()))
    .filter(([label]) => !!label)
    .map(([label, href]) => ({ label: label!, href: href || "" }));
}

/** EMI tenure and minimum price from global theme settings (with safe bounds). */
export function emiDefaults(context: StorefrontContext): { months: number; minPrice: number } {
  const months = Math.max(2, Math.min(60, Math.round(num(context.theme.emi_months, 12))));
  const minPrice = Math.max(0, num(context.theme.emi_min_price, 10000)) * 100;
  return { months, minPrice };
}

/** Monthly instalment in minor units, rounded up to a whole taka. */
export function monthly(priceMinor: number, months: number): number {
  if (!priceMinor || months <= 0) return 0;
  return Math.ceil(priceMinor / months / 100) * 100;
}

/** Number of pieces label. */
export const piecesLabel = (n: number) => `${n} ${n === 1 ? "piece" : "pieces"}`;

/** Kit icon choices plus furniture-specific ones. */
export const NEST_ICON_OPTIONS = [
  ...ICON_OPTIONS,
  { value: "wrench", label: "Wrench (assembly)" },
  { value: "hammer", label: "Hammer (craft)" },
  { value: "ruler", label: "Ruler (measure)" },
  { value: "sofa", label: "Sofa" },
  { value: "lamp", label: "Lamp" },
  { value: "bed-double", label: "Bed" },
  { value: "house", label: "House" },
  { value: "calendar-check", label: "Calendar" },
  { value: "percent", label: "Percent (EMI)" },
  { value: "trees", label: "Trees (timber)" },
  { value: "package-open", label: "Unboxing" },
];
