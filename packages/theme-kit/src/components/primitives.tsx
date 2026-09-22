/**
 * Server-safe presentational primitives. No hooks, no client state — usable from any section
 * (and inside client components too). All styling goes through the theme CSS variables.
 */
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { SettingValues, StorefrontContext } from "@pai/theme-sdk";
import { cn, discountPercent, formatMoney, sanitizeHtml, str, type CurrencyDisplay } from "../lib/utils";
import { schemeClass } from "../lib/css";

/* ─────────────────────────── links ─────────────────────────── */

/**
 * Resolve a merchant-entered link against the tenant base: "/collections/sale" → context.url(...),
 * absolute URLs, anchors, mailto: and tel: are returned untouched. Empty → fallback.
 */
export function resolveHref(context: Pick<StorefrontContext, "url">, href: unknown, fallback = ""): string {
  const h = str(href, fallback);
  if (!h) return "";
  if (/^(https?:|mailto:|tel:|#|\/\/)/.test(h)) return h;
  return context.url(h.startsWith("/") ? h : `/${h}`);
}

/** Link that uses next/link for internal URLs and a plain anchor (new tab) for external ones. */
export function SmartLink({ href, className, children, ariaLabel, style }: { href: string; className?: string; children: ReactNode; ariaLabel?: string; style?: CSSProperties }) {
  if (!href) return <span className={className}>{children}</span>;
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} className={className} aria-label={ariaLabel} style={style} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  if (/^(mailto:|tel:|#)/.test(href)) {
    return (
      <a href={href} className={className} aria-label={ariaLabel} style={style}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} aria-label={ariaLabel} style={style}>
      {children}
    </Link>
  );
}

/* ─────────────────────────── layout ─────────────────────────── */

export function Container({ children, className, width = "default" }: { children: ReactNode; className?: string; width?: "default" | "narrow" | "wide" | "full" }) {
  return (
    <div
      className={cn(
        width === "full" ? "w-full" : "pai-container",
        width === "narrow" && "max-w-3xl",
        width === "wide" && "max-w-[min(1600px,100%)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export type SectionPadding = "none" | "small" | "medium" | "large";

const PAD: Record<SectionPadding, string> = { none: "0", small: "0.5", medium: "1", large: "1.5" };

/**
 * Standard section wrapper: colour scheme, vertical padding (from `padding` setting), container.
 * Most base sections render `<Section settings={settings}>…</Section>`.
 */
export function Section({
  settings,
  children,
  className,
  containerClassName,
  container = true,
  width,
  as: Tag = "section",
  ariaLabel,
  style,
}: {
  settings?: SettingValues;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  container?: boolean;
  width?: "default" | "narrow" | "wide" | "full";
  as?: "section" | "div" | "aside" | "footer";
  ariaLabel?: string;
  style?: CSSProperties;
}) {
  const padding = (settings?.padding as SectionPadding) ?? "medium";
  const w = width ?? (settings?.full_width ? "full" : "default");
  return (
    <Tag
      aria-label={ariaLabel}
      className={cn("pai-section", schemeClass(settings?.color_scheme), className)}
      style={{ ...({ "--pai-section-pad": PAD[padding] ?? "1" } as CSSProperties), ...style }}
    >
      {container ? (
        <Container width={w} className={containerClassName}>
          {children}
        </Container>
      ) : (
        children
      )}
    </Tag>
  );
}

/** Eyebrow + heading + subheading + optional "view all" link. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  action,
  className,
  size = "h2",
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  align?: "left" | "center";
  action?: { label: string; href: string } | null;
  className?: string;
  size?: "h1" | "h2" | "h3";
}) {
  if (!title && !eyebrow && !subtitle && !action) return null;
  const H = size === "h1" ? "h1" : size === "h3" ? "h3" : "h2";
  return (
    <div className={cn("mb-8 flex flex-col gap-4 md:mb-10", align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between", className)}>
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <p className="pai-eyebrow mb-2">{eyebrow}</p> : null}
        {title ? <H className={cn(size === "h1" ? "pai-h1" : size === "h3" ? "pai-h3" : "pai-h2")}>{title}</H> : null}
        {subtitle ? <p className="mt-3 text-base opacity-75 md:text-lg">{subtitle}</p> : null}
      </div>
      {action?.label && action.href ? (
        <SmartLink href={action.href} className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline">
          {action.label}
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </SmartLink>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── buttons ─────────────────────────── */

export type ButtonVariant = "primary" | "secondary" | "outline" | "accent" | "light" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

function btnClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", block?: boolean, className?: string) {
  return cn("pai-btn", `pai-btn-${variant}`, size === "sm" && "pai-btn-sm", size === "lg" && "pai-btn-lg", block && "pai-btn-block", className);
}

export function Button({
  children,
  variant,
  size,
  block,
  className,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button type={type} disabled={disabled} className={btnClass(variant, size, block, className)}>
      {children}
    </button>
  );
}

/** Button-styled link. `href` should already be resolved (use `resolveHref`/`context.url`). */
export function ButtonLink({ href, children, variant, size, block, className }: { href: string; children: ReactNode; variant?: ButtonVariant; size?: ButtonSize; block?: boolean; className?: string }) {
  return (
    <SmartLink href={href} className={btnClass(variant, size, block, className)}>
      {children}
    </SmartLink>
  );
}

/* ─────────────────────────── media ─────────────────────────── */

/**
 * Plain `<img>` (merchant images come from arbitrary hosts) with lazy loading, async decoding
 * and an optional aspect-ratio box. Pass `priority` for above-the-fold images.
 */
export function Image({
  src,
  alt = "",
  className,
  wrapperClassName,
  ratio,
  priority,
  sizes,
  width,
  height,
  fit = "cover",
  position,
}: {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  wrapperClassName?: string;
  /** Tailwind aspect class, e.g. "aspect-square" (use `aspectClass(setting)`). */
  ratio?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  fit?: "cover" | "contain";
  position?: string;
}) {
  const img = src ? (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      sizes={sizes}
      width={width}
      height={height}
      className={cn(ratio ? "absolute inset-0 size-full" : "h-auto w-full", fit === "contain" ? "object-contain" : "object-cover", className)}
      style={position ? { objectPosition: position } : undefined}
    />
  ) : (
    <Placeholder kind="image" className={cn(ratio ? "absolute inset-0 size-full" : "aspect-[4/3] w-full", className)} />
  );
  if (!ratio) return img;
  return <div className={cn("relative overflow-hidden bg-pai-muted", ratio, wrapperClassName)}>{img}</div>;
}

/** Neutral SVG illustrations for empty states in the customizer preview. */
export function Placeholder({ kind = "image", className, label }: { kind?: "image" | "product" | "collection" | "lifestyle" | "logo"; className?: string; label?: string }) {
  const paths: Record<string, ReactNode> = {
    image: (
      <>
        <rect x="18" y="22" width="64" height="48" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="36" cy="38" r="6" fill="currentColor" />
        <path d="M22 66 44 46l12 10 10-8 14 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      </>
    ),
    product: (
      <>
        <path d="M30 30h40l6 44H24z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M40 34v-6a10 10 0 0 1 20 0v6" fill="none" stroke="currentColor" strokeWidth="2.5" />
      </>
    ),
    collection: (
      <>
        <rect x="16" y="24" width="30" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <rect x="54" y="24" width="30" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <rect x="16" y="60" width="68" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
      </>
    ),
    lifestyle: (
      <>
        <circle cx="50" cy="34" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M30 76c2-14 10-22 20-22s18 8 20 22" fill="none" stroke="currentColor" strokeWidth="2.5" />
      </>
    ),
    logo: <text x="50" y="56" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor">LOGO</text>,
  };
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 bg-pai-muted text-pai-fg/25", className)} aria-hidden={!label}>
      <svg viewBox="0 0 100 100" className="size-1/3 max-h-28 max-w-28">
        {paths[kind]}
      </svg>
      {label ? <span className="text-xs font-medium text-pai-fg/50">{label}</span> : null}
    </div>
  );
}

/* ─────────────────────────── commerce bits ─────────────────────────── */

/** Money formatting props derived from the storefront context. */
export function moneyOf(context: Pick<StorefrontContext, "store" | "theme">): { currency: string; display: CurrencyDisplay } {
  return { currency: context.store.currency, display: (context.theme.currency_display as CurrencyDisplay) ?? "symbol" };
}

/** Price with optional compare-at (strikethrough) and "from" ranges. */
export function Price({
  price,
  compareAt,
  priceMax,
  currency = "BDT",
  display = "symbol",
  className,
  size = "md",
  showBadge = false,
}: {
  price: number;
  compareAt?: number | null;
  priceMax?: number;
  currency?: string;
  display?: CurrencyDisplay;
  className?: string;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
}) {
  const off = discountPercent(price, compareAt);
  const fmt = (n: number) => formatMoney(n, currency, display);
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2", size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-[0.95rem]", className)}>
      <span className={cn("font-semibold", off && "text-pai-sale")}>
        {priceMax && priceMax > price ? <span className="font-normal opacity-70">From </span> : null}
        {fmt(price)}
      </span>
      {off ? <s className="text-[0.85em] opacity-50">{fmt(compareAt!)}</s> : null}
      {off && showBadge ? <span className="text-xs font-semibold text-pai-sale">−{off}%</span> : null}
    </span>
  );
}

/** Star rating (0–5, supports halves) with optional count. */
export function Rating({ value, count, className, size = 14, showValue = false }: { value: number; count?: number; className?: string; size?: number; showValue?: boolean }) {
  const v = Math.max(0, Math.min(5, value));
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} aria-label={`Rated ${v.toFixed(1)} out of 5`}>
      <span className="relative inline-flex" style={{ height: size }}>
        <span className="inline-flex text-pai-fg/20">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} style={{ width: size, height: size }} className="fill-current" strokeWidth={0} />
          ))}
        </span>
        <span className="absolute inset-0 inline-flex overflow-hidden text-amber-400" style={{ width: `${(v / 5) * 100}%` }}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} style={{ width: size, height: size }} className="shrink-0 fill-current" strokeWidth={0} />
          ))}
        </span>
      </span>
      {showValue ? <span className="text-xs font-semibold">{v.toFixed(1)}</span> : null}
      {count !== undefined ? <span className="text-xs opacity-60">({count})</span> : null}
    </span>
  );
}

export type BadgeTone = "sale" | "soldout" | "new" | "accent" | "neutral" | "primary";

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  const tones: Record<BadgeTone, string> = {
    sale: "bg-pai-sale text-white",
    soldout: "bg-pai-fg/80 text-pai-bg",
    new: "bg-pai-bg text-pai-fg",
    accent: "bg-pai-accent text-white",
    neutral: "bg-pai-muted text-pai-fg",
    primary: "bg-pai-primary text-pai-primary-fg",
  };
  return <span className={cn("inline-flex items-center rounded-[min(var(--pai-radius),6px)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide", tones[tone], className)}>{children}</span>;
}

/* ─────────────────────────── content ─────────────────────────── */

/** Merchant rich text (sanitised). */
export function RichText({ html, className }: { html: string | null | undefined; className?: string }) {
  if (!html) return null;
  // Plain text (no tags) → paragraphs.
  const content = /<[a-z][\s\S]*>/i.test(html)
    ? sanitizeHtml(html)
    : html
        .split(/\n{2,}/)
        .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br/>")}</p>`)
        .join("");
  return <div className={cn("pai-rte", className)} dangerouslySetInnerHTML={{ __html: content }} />;
}

export function EmptyState({ title, description, action, icon, className }: { title: string; description?: string; action?: { label: string; href: string }; icon?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-pai border border-dashed border-pai-border px-6 py-16 text-center", className)}>
      {icon ? <div className="grid size-14 place-items-center rounded-full bg-pai-muted">{icon}</div> : null}
      <p className="font-heading text-lg font-semibold">{title}</p>
      {description ? <p className="max-w-md text-sm opacity-70">{description}</p> : null}
      {action ? (
        <ButtonLink href={action.href} className="mt-2">
          {action.label}
        </ButtonLink>
      ) : null}
    </div>
  );
}

export function Breadcrumbs({ items, className }: { items: { label: string; href?: string }[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-xs", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 opacity-70">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 ? <ChevronRight className="size-3 opacity-60" /> : null}
            {it.href && i < items.length - 1 ? (
              <Link href={it.href} className="hover:underline">
                {it.label}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined} className="line-clamp-1">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Numbered pagination. `hrefFor(page)` builds each link (keep existing query params). */
export function Pagination({ page, pageCount, hrefFor, className }: { page: number; pageCount: number; hrefFor: (page: number) => string; className?: string }) {
  if (pageCount <= 1) return null;
  const pages: (number | "…")[] = [];
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  const cell = "grid h-10 min-w-10 place-items-center rounded-pai-btn px-3 text-sm font-medium";
  return (
    <nav aria-label="Pagination" className={cn("mt-12 flex items-center justify-center gap-1.5", className)}>
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={cn(cell, "border border-pai-border hover:border-pai-fg")} aria-label="Previous page">
          <ChevronLeft className="size-4" />
        </Link>
      ) : null}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 opacity-50">
            …
          </span>
        ) : (
          <Link key={p} href={hrefFor(p)} aria-current={p === page ? "page" : undefined} className={cn(cell, p === page ? "bg-pai-fg text-pai-bg" : "border border-pai-border hover:border-pai-fg")}>
            {p}
          </Link>
        ),
      )}
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} className={cn(cell, "border border-pai-border hover:border-pai-fg")} aria-label="Next page">
          <ChevronRight className="size-4" />
        </Link>
      ) : null}
    </nav>
  );
}

/** Build a URL for the current path with some query params replaced (server-side helper). */
export function withQuery(context: Pick<StorefrontContext, "url" | "path" | "searchParams">, patch: Record<string, string | number | null | undefined>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(context.searchParams)) if (v !== undefined && v !== "") params.set(k, v);
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === undefined || v === "" || v === 1 && k === "page") params.delete(k);
    else params.set(k, String(v));
  }
  const qs = params.toString();
  return context.url(context.path) + (qs ? `?${qs}` : "");
}
