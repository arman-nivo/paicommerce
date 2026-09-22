import { formatMoney, timeAgo } from "@pai/core";

export { formatMoney, timeAgo };

export const bdt = (minor: number | null | undefined) => formatMoney(Math.round(minor ?? 0), "BDT");

export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Dhaka" });
}

export function fmtDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dhaka" });
}

export function fmtNum(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString("en-US");
}

export function pct(n: number, digits = 1): string {
  return `${Number.isFinite(n) ? n.toFixed(digits) : "0"}%`;
}

/** yyyy-mm-dd in Dhaka time. */
export function dayKey(d: Date): string {
  return new Date(d.getTime() + 6 * 3600 * 1000).toISOString().slice(0, 10);
}
