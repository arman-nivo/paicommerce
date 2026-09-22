import type { PgInsertValue, PgTable } from "drizzle-orm/pg-core";
import { db } from "../../index";

/** Reference "now" for the whole run (rounded to the minute). */
export const NOW = new Date(Math.floor(Date.now() / 60000) * 60000);
export const DAY = 86_400_000;

export function daysAgo(days: number, from: Date = NOW): Date {
  return new Date(from.getTime() - days * DAY);
}
export function addMinutes(d: Date, m: number): Date {
  return new Date(d.getTime() + m * 60000);
}
export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * DAY);
}
export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}
export function minDate(a: Date, b: Date): Date {
  return a < b ? a : b;
}

/** BDT (major units) → poisha. */
export const tk = (major: number) => Math.round(major * 100);

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatTk(poisha: number): string {
  return "৳" + Math.round(poisha / 100).toLocaleString("en-IN");
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Batched insert (keeps each statement well below Postgres' 65k parameter limit). */
export async function insertMany<T extends PgTable>(table: T, rows: PgInsertValue<T>[], size = 500): Promise<void> {
  for (let i = 0; i < rows.length; i += size) {
    await db.insert(table).values(rows.slice(i, i + size));
  }
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
