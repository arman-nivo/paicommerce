/** Pure discount helpers — safe to import from client and server code. */

export type DiscountType = "percentage" | "fixed" | "free_shipping";
export type DiscountStatus = "active" | "scheduled" | "expired" | "disabled" | "limit";

export const TYPE_LABELS: Record<DiscountType, string> = {
  percentage: "Percentage",
  fixed: "Fixed amount",
  free_shipping: "Free shipping",
};

export const STATUS_META: Record<DiscountStatus, { label: string; tone: "green" | "blue" | "gray" | "yellow" | "red" }> = {
  active: { label: "Active", tone: "green" },
  scheduled: { label: "Scheduled", tone: "blue" },
  expired: { label: "Expired", tone: "gray" },
  disabled: { label: "Disabled", tone: "yellow" },
  limit: { label: "Limit reached", tone: "red" },
};

export function discountStatus(d: { active: boolean; startsAt: Date | string | null; endsAt: Date | string | null; usageLimit: number | null; usedCount: number }, now = Date.now()): DiscountStatus {
  if (!d.active) return "disabled";
  if (d.endsAt && new Date(d.endsAt).getTime() < now) return "expired";
  if (d.startsAt && new Date(d.startsAt).getTime() > now) return "scheduled";
  if (d.usageLimit != null && d.usedCount >= d.usageLimit) return "limit";
  return "active";
}

/** No 0/O, 1/I/L — easy to read out loud over the phone. */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function randomCode(len = 8): string {
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => ALPHABET[n % ALPHABET.length]).join("");
}

export function normalizeCode(v: string): string {
  return v
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9_-]/g, "");
}

export const CODE_RE = /^[A-Z0-9_-]{3,40}$/;

const DHAKA_OFFSET = 6 * 3600_000;

/** Date → "YYYY-MM-DDTHH:mm" in Asia/Dhaka (for datetime-local inputs). */
export function toDhakaInput(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Date(new Date(d).getTime() + DHAKA_OFFSET).toISOString().slice(0, 16);
}

/** "YYYY-MM-DDTHH:mm" typed in Asia/Dhaka → Date. */
export function fromDhakaInput(v: string | null | undefined): Date | null {
  if (!v) return null;
  const d = new Date(`${v.length === 16 ? v + ":00" : v}+06:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function shortDate(d: Date | string, withYear = false) {
  return new Date(d).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka", day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) });
}

/** Human summary: "20% off orders over ৳1,000 · limited to 100 uses · ends 31 Dec". */
export function describeDiscount(
  d: { type: DiscountType; value: number; minSubtotal: number | null; usageLimit: number | null; oncePerCustomer: boolean; startsAt: Date | string | null; endsAt: Date | string | null },
  money: (minor: number) => string,
): string[] {
  const parts: string[] = [];
  const what = d.type === "percentage" ? `${d.value || 0}% off` : d.type === "fixed" ? `${money(d.value || 0)} off` : "Free shipping on";
  const scope = d.minSubtotal ? `orders over ${money(d.minSubtotal)}` : d.type === "free_shipping" ? "all orders" : "the entire order";
  parts.push(`${what} ${scope}`);
  if (d.usageLimit) parts.push(`limited to ${d.usageLimit.toLocaleString()} use${d.usageLimit === 1 ? "" : "s"}`);
  if (d.oncePerCustomer) parts.push("one use per customer");
  const now = Date.now();
  if (d.startsAt && new Date(d.startsAt).getTime() > now) parts.push(`starts ${shortDate(d.startsAt, true)}`);
  if (d.endsAt) parts.push(`${new Date(d.endsAt).getTime() < now ? "ended" : "ends"} ${shortDate(d.endsAt, new Date(d.endsAt).getFullYear() !== new Date().getFullYear())}`);
  return parts;
}
