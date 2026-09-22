/** Date-range helpers for analytics. All days are calendar days in Asia/Dhaka (UTC+6, no DST). */

export const TZ = "Asia/Dhaka";
const OFFSET_MS = 6 * 3600_000;
const DAY_MS = 86400_000;

export const PRESETS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "year", label: "This year" },
  { value: "custom", label: "Custom range" },
] as const;

export type Preset = (typeof PRESETS)[number]["value"];
export type Bucket = "day" | "week";

export type Range = {
  preset: Preset;
  from: string; // YYYY-MM-DD inclusive
  to: string; // YYYY-MM-DD inclusive
  days: number;
  start: Date; // instant, inclusive
  end: Date; // instant, exclusive
  prevFrom: string;
  prevTo: string;
  prevStart: Date;
  prevEnd: Date;
  bucket: Bucket;
  compare: boolean;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** YYYY-MM-DD ↔ UTC-midnight Date (pure calendar arithmetic). */
const d2 = (s: string) => new Date(`${s}T00:00:00Z`);
const s2 = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (s: string, n: number) => s2(new Date(d2(s).getTime() + n * DAY_MS));
export const diffDays = (a: string, b: string) => Math.round((d2(b).getTime() - d2(a).getTime()) / DAY_MS);

export function dhakaToday(): string {
  return new Date(Date.now() + OFFSET_MS).toISOString().slice(0, 10);
}

/** Start of a Dhaka calendar day as an instant. */
export function dayStart(s: string): Date {
  return new Date(d2(s).getTime() - OFFSET_MS);
}

function valid(s: string | undefined): s is string {
  return !!s && DATE_RE.test(s) && !Number.isNaN(d2(s).getTime());
}

export function resolveRange(sp: Record<string, string | string[] | undefined>): Range {
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const today = dhakaToday();
  let preset = (PRESETS.some((p) => p.value === get("range")) ? get("range") : "30d") as Preset;
  let from = today;
  let to = today;
  const [y, m] = today.split("-").map(Number) as [number, number];
  switch (preset) {
    case "today":
      break;
    case "7d":
      from = addDays(today, -6);
      break;
    case "90d":
      from = addDays(today, -89);
      break;
    case "month":
      from = `${today.slice(0, 7)}-01`;
      break;
    case "last_month": {
      const first = new Date(Date.UTC(y, m - 2, 1));
      from = s2(first);
      to = addDays(`${today.slice(0, 7)}-01`, -1);
      break;
    }
    case "year":
      from = `${y}-01-01`;
      break;
    case "custom": {
      const f = get("from");
      const t = get("to");
      if (valid(f) && valid(t)) {
        from = f <= t ? f : t;
        to = f <= t ? t : f;
        if (to > today) to = today;
        if (from > to) from = to;
        if (diffDays(from, to) > 3 * 366) from = addDays(to, -3 * 366);
      } else {
        preset = "30d";
        from = addDays(today, -29);
      }
      break;
    }
    default:
      from = addDays(today, -29);
  }
  const days = diffDays(from, to) + 1;
  const prevTo = addDays(from, -1);
  const prevFrom = addDays(prevTo, -(days - 1));
  return {
    preset,
    from,
    to,
    days,
    start: dayStart(from),
    end: dayStart(addDays(to, 1)),
    prevFrom,
    prevTo,
    prevStart: dayStart(prevFrom),
    prevEnd: dayStart(addDays(prevTo, 1)),
    bucket: days > 90 ? "week" : "day",
    compare: get("compare") !== "off",
  };
}

/** Monday of the ISO week containing `s` (matches Postgres date_trunc('week')). */
function weekStart(s: string) {
  const dow = (d2(s).getUTCDay() + 6) % 7; // Mon=0
  return addDays(s, -dow);
}

/** Ordered bucket keys covering [from, to] — used to fill missing days with zeros. */
export function bucketKeys(from: string, to: string, bucket: Bucket): string[] {
  const keys: string[] = [];
  if (bucket === "day") {
    for (let d = from; d <= to; d = addDays(d, 1)) keys.push(d);
  } else {
    for (let d = weekStart(from); d <= to; d = addDays(d, 7)) keys.push(d);
  }
  return keys;
}

export function formatDay(s: string, withYear = false) {
  return d2(s).toLocaleDateString("en-GB", { timeZone: "UTC", day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) });
}

export function rangeLabel(from: string, to: string) {
  const sameYear = from.slice(0, 4) === to.slice(0, 4);
  if (from === to) return formatDay(from, true);
  return `${formatDay(from, !sameYear)} – ${formatDay(to, true)}`;
}
