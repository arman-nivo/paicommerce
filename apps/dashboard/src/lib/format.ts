import { formatMoney } from "@pai/core";

export { formatMoney };

export function formatDate(d: Date | string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka", ...opts });
}

export function formatDateTime(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { timeZone: "Asia/Dhaka", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

export function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

export function pct(n: number, digits = 1) {
  return `${Number.isFinite(n) ? n.toFixed(digits) : "0"}%`;
}

/** Parse ?page= safely. */
export function pageParam(v: string | string[] | undefined, fallback = 1) {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : fallback;
}

export function str(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;
