/**
 * Small building blocks shared by Lumière's sections: the gold-ruled eyebrow, the ornament
 * divider, a serif section heading and the product fallback loader.
 */
import type { ReactNode } from "react";
import type { SfProduct, StorefrontContext } from "@pai/theme-sdk";
import { cn, list, str } from "@pai/theme-kit";

/** Eyebrow flanked by short gold hairlines: ——  THE BRIDAL EDIT  —— */
export function Eyebrow({ children, className, align = "center", light }: { children: ReactNode; className?: string; align?: "left" | "center"; light?: boolean }) {
  if (!children) return null;
  return (
    <p className={cn("lumiere-eyebrow mb-5 flex items-center gap-4", align === "center" ? "justify-center" : "justify-start", light && "text-white", className)}>
      {align === "center" ? <span aria-hidden className="lumiere-eyebrow-rule" /> : null}
      <span>{children}</span>
      <span aria-hidden className="lumiere-eyebrow-rule" />
    </p>
  );
}

/** A thin gold rule with a small lozenge in the middle. */
export function Ornament({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("lumiere-ornament flex items-center justify-center gap-3", className)}>
      <span className="h-px w-14 bg-[var(--lumiere-rule-strong)]" />
      <span className="size-1.5 rotate-45 border border-[var(--lumiere-gold)]" />
      <span className="h-px w-14 bg-[var(--lumiere-rule-strong)]" />
    </div>
  );
}

/** Serif section heading block (eyebrow, h2, intro). */
export function Heading({
  eyebrow,
  heading,
  text,
  align = "center",
  className,
}: {
  eyebrow?: string;
  heading?: string;
  text?: string;
  align?: "left" | "center";
  className?: string;
}) {
  if (!eyebrow && !heading && !text) return null;
  return (
    <div className={cn("mb-12 max-w-2xl md:mb-16", align === "center" ? "mx-auto text-center" : "", className)}>
      {eyebrow ? <Eyebrow align={align}>{eyebrow}</Eyebrow> : null}
      {heading ? <h2 className="pai-h2 lumiere-display-2">{heading}</h2> : null}
      {text ? <p className={cn("mt-5 text-[0.98rem] leading-relaxed opacity-70", align === "center" && "mx-auto max-w-xl")}>{text}</p> : null}
    </div>
  );
}

/** Roman numerals for chapter markers (1–39). */
export function roman(n: number): string {
  const map: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  let x = Math.max(1, Math.min(39, Math.round(n)));
  for (const [v, s] of map) {
    while (x >= v) {
      out += s;
      x -= v;
    }
  }
  return out;
}

/**
 * Products for a block/section: picked products → collection → tag → price range → best sellers
 * (the last step only when `fallback` is true). Never throws.
 */
export async function loadProducts(
  context: StorefrontContext,
  s: Record<string, unknown>,
  limit: number,
  fallback = true,
): Promise<{ products: SfProduct[]; via: "products" | "collection" | "tag" | "price" | "fallback" | "none" }> {
  try {
    const slugs = list(s.products);
    if (slugs.length) {
      const r = await context.data.getProducts({ slugs, limit: slugs.length });
      const order = new Map(slugs.map((x, i) => [x, i]));
      const found = r.items.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
      if (found.length) return { products: found.slice(0, limit), via: "products" };
    }
    const col = str(s.collection);
    if (col) {
      const r = await context.data.getProducts({ collection: col, limit });
      if (r.items.length) return { products: r.items, via: "collection" };
    }
    const tag = str(s.tag);
    if (tag) {
      const r = await context.data.getProducts({ tag, limit });
      if (r.items.length) return { products: r.items, via: "tag" };
    }
    const min = Number(s.min_price) || 0;
    const max = Number(s.max_price) || 0;
    if (min > 0 || max > 0) {
      const r = await context.data.getProducts({ minPrice: min > 0 ? min * 100 : undefined, maxPrice: max > 0 ? max * 100 : undefined, sort: "best-selling", limit });
      if (r.items.length) return { products: r.items, via: "price" };
    }
    if (!fallback) return { products: [], via: "none" };
    return { products: (await context.data.getProducts({ sort: "best-selling", limit })).items, via: "fallback" };
  } catch {
    return { products: [], via: "none" };
  }
}

export const RATIO: Record<string, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  tall: "aspect-[2/3]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
};

export const digits = (v: string) => v.replace(/[^0-9]/g, "");

/** wa.me link from a phone number (Bangladeshi 01… numbers get the 880 country code). */
export function whatsappHref(phone: string, message?: string): string {
  let d = digits(phone);
  if (!d) return "";
  if (d.startsWith("0")) d = "88" + d;
  return `https://wa.me/${d}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
