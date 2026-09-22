/**
 * Opening-hours helpers shared by server sections and client islands (pure functions, no React).
 * Times are entered by merchants as "11:00", "23:30", "11 AM" or "11:30 pm".
 */

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

/** Parse a merchant time string into minutes after midnight, or null. */
export function parseTime(v: unknown): number | null {
  if (typeof v !== "string") return null;
  const m = v.trim().toLowerCase().match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  if (m[3] === "pm" && h < 12) h += 12;
  if (m[3] === "am" && h === 12) h = 0;
  if (h > 24 || min > 59) return null;
  return (h % 24) * 60 + min;
}

/** 690 → "11:30 AM". */
export function formatMinutes(total: number): string {
  const h24 = Math.floor(total / 60) % 24;
  const m = total % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}

/** "11:00" → "11:00 AM"; returns the input when it can't be parsed (e.g. "Noon"). */
export function prettyTime(v: unknown): string {
  const t = parseTime(v);
  return t === null ? (typeof v === "string" ? v : "") : formatMinutes(t);
}

/** "11:00 AM – 11:00 PM" from two merchant times. */
export function hoursRange(open: unknown, close: unknown): string {
  const a = prettyTime(open);
  const b = prettyTime(close);
  return a && b ? `${a} – ${b}` : a || b;
}

/** Day index (0 = Sunday) from "Fri", "friday", "শুক্র" is not supported — English names only. */
export function dayIndex(v: string): number {
  const s = v.trim().toLowerCase().slice(0, 3);
  return DAYS.findIndex((d) => d.toLowerCase().startsWith(s));
}

/** Comma-separated closed days → set of day indexes. */
export function closedDaySet(v: unknown): Set<number> {
  const out = new Set<number>();
  if (typeof v !== "string") return out;
  for (const part of v.split(",")) {
    const i = dayIndex(part);
    if (part.trim() && i >= 0) out.add(i);
  }
  return out;
}

export type DayHours = { day: number; open: number | null; close: number | null; closed: boolean };

/** Is a time (minutes) within an open window? Handles windows that pass midnight. */
export function withinWindow(now: number, open: number, close: number): boolean {
  if (open === close) return true; // 24 hours
  return close > open ? now >= open && now < close : now >= open || now < close;
}

/** Current weekday and minutes in a timezone (falls back to local time on bad zones). */
export function nowIn(timeZone: string): { day: number; minutes: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    return { day: dayIndex(get("weekday")), minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
  } catch {
    const d = new Date();
    return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
  }
}

export type OpenState = { open: boolean; label: string; detail: string };

/** Open / closed status with a friendly label for a weekly schedule. */
export function openState(week: DayHours[], timeZone: string): OpenState | null {
  if (!week.length) return null;
  const { day, minutes } = nowIn(timeZone);
  const today = week.find((d) => d.day === day);
  const yesterday = week.find((d) => d.day === (day + 6) % 7);
  // Late-night window from yesterday still running (e.g. 6 PM – 2 AM).
  if (yesterday && !yesterday.closed && yesterday.open !== null && yesterday.close !== null && yesterday.close < yesterday.open && minutes < yesterday.close) {
    return { open: true, label: "Open now", detail: `Closes ${formatMinutes(yesterday.close)}` };
  }
  if (today && !today.closed && today.open !== null && today.close !== null) {
    if (withinWindow(minutes, today.open, today.close) && !(today.close < today.open && minutes < today.close)) {
      return { open: true, label: "Open now", detail: today.open === today.close ? "Open 24 hours" : `Closes ${formatMinutes(today.close)}` };
    }
    if (minutes < today.open) return { open: false, label: "Closed", detail: `Opens ${formatMinutes(today.open)}` };
  }
  for (let i = 1; i <= 7; i++) {
    const next = week.find((d) => d.day === (day + i) % 7);
    if (next && !next.closed && next.open !== null) {
      return { open: false, label: "Closed", detail: `Opens ${i === 1 ? "tomorrow" : DAYS[next.day]!.slice(0, 3)} ${formatMinutes(next.open)}` };
    }
  }
  return { open: false, label: "Closed", detail: "" };
}

/** A uniform week from global settings (open/close + closed days). */
export function uniformWeek(open: unknown, close: unknown, closedDays: unknown): DayHours[] {
  const o = parseTime(open);
  const c = parseTime(close);
  if (o === null || c === null) return [];
  const closed = closedDaySet(closedDays);
  return DAYS.map((_, day) => ({ day, open: o, close: c, closed: closed.has(day) }));
}
