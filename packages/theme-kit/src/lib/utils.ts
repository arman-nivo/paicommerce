import { clsx, type ClassValue } from "clsx";

/** Join class names (clsx). */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/* ─────────────────────────── settings readers ─────────────────────────── */

/** Read a string setting with a fallback (empty strings fall back too). */
export function str(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim() !== "" ? v : fallback;
}
/** Read a numeric setting with a fallback. */
export function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : typeof v === "string" && v !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}
/** Read a boolean setting with a fallback. */
export function bool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}
/** Read a string[] setting. */
export function list(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && !!x) : [];
}

/* ─────────────────────────── money ─────────────────────────── */

const SYMBOLS: Record<string, string> = { BDT: "৳", USD: "$", EUR: "€", GBP: "£", INR: "₹", PKR: "Rs ", AED: "AED ", MYR: "RM" };

export type CurrencyDisplay = "symbol" | "code" | "symbol_code";

/**
 * Format minor units for display. `formatMoney(125000, "BDT")` → "৳1,250".
 * Mirrors `formatMoney` in @pai/core so client components don't need the server package.
 */
export function formatMoney(amount: number, currency = "BDT", display: CurrencyDisplay = "symbol"): string {
  const major = (amount ?? 0) / 100;
  const decimals = !Number.isInteger(major);
  const n = major.toLocaleString("en-US", { minimumFractionDigits: decimals ? 2 : 0, maximumFractionDigits: decimals ? 2 : 0 });
  const sym = SYMBOLS[currency] ?? currency + " ";
  if (display === "code") return `${currency} ${n}`;
  if (display === "symbol_code") return `${sym}${n} ${currency}`;
  return `${sym}${n}`;
}

export function discountPercent(price: number, compareAt: number | null | undefined): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/* ─────────────────────────── html ─────────────────────────── */

/**
 * Conservative HTML sanitiser for merchant-authored rich text: removes script/style/iframe/object
 * elements, inline event handlers and `javascript:` URLs. Merchant content is trusted-ish (it comes
 * from the store owner), this is defence-in-depth against pasted markup.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form)[^>]*\/?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src|xlink:href)\s*=\s*(["']?)\s*(javascript|vbscript|data):[^"'\s>]*\2/gi, '$1="#"');
}

/** Plain text from HTML (for excerpts / meta descriptions). */
export function stripHtml(html: string | null | undefined): string {
  return (html ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

/* ─────────────────────────── layout helpers ─────────────────────────── */

/** Tailwind aspect-ratio class for an image ratio setting ("square" | "portrait" | "landscape" | "tall" | "natural"). */
export function aspectClass(ratio: unknown): string {
  switch (ratio) {
    case "portrait":
      return "aspect-[4/5]";
    case "tall":
      return "aspect-[2/3]";
    case "landscape":
      return "aspect-[4/3]";
    case "wide":
      return "aspect-[16/9]";
    case "natural":
      return "";
    default:
      return "aspect-square";
  }
}

/** Responsive grid-cols classes for a desktop column count (1–6). Mobile columns: 1 or 2. */
export function gridColsClass(desktop: number, mobile = 2): string {
  const m = mobile === 1 ? "grid-cols-1" : "grid-cols-2";
  const d: Record<number, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-3 lg:grid-cols-4",
    5: "md:grid-cols-3 lg:grid-cols-5",
    6: "md:grid-cols-4 lg:grid-cols-6",
  };
  return `${m} ${d[Math.min(6, Math.max(1, desktop))]}`;
}

export function textAlignClass(align: unknown): string {
  return align === "center" ? "text-center items-center" : align === "right" ? "text-right items-end" : "text-left items-start";
}

/** Is this URL a video file (mp4/webm) rather than a YouTube/Vimeo page? */
export function isVideoFile(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

/** Turn a YouTube / Vimeo URL into an embeddable URL. Returns null for unknown hosts. */
export function embedUrl(url: string, opts: { autoplay?: boolean; muted?: boolean; loop?: boolean } = {}): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) {
    const id = yt[1];
    const p = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1" });
    if (opts.autoplay) p.set("autoplay", "1");
    if (opts.muted) p.set("mute", "1");
    if (opts.loop) {
      p.set("loop", "1");
      p.set("playlist", id!);
    }
    return `https://www.youtube-nocookie.com/embed/${id}?${p}`;
  }
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    const p = new URLSearchParams();
    if (opts.autoplay) p.set("autoplay", "1");
    if (opts.muted) p.set("muted", "1");
    if (opts.loop) p.set("loop", "1");
    return `https://player.vimeo.com/video/${vimeo[1]}?${p}`;
  }
  return null;
}
