const SYMBOLS: Record<string, string> = { BDT: "৳", USD: "$", EUR: "€", GBP: "£", INR: "₹", PKR: "Rs", AED: "AED ", MYR: "RM" };

/** Minor units → display string. formatMoney(125000, "BDT") → "৳1,250" */
export function formatMoney(amount: number, currency = "BDT", opts: { decimals?: boolean } = {}): string {
  const major = amount / 100;
  const showDecimals = opts.decimals ?? !Number.isInteger(major);
  const n = major.toLocaleString("en-US", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
  return `${SYMBOLS[currency] ?? currency + " "}${n}`;
}

/** Display major-unit input ("1250.50") → minor units (125050). */
export function toMinor(major: string | number): number {
  const n = typeof major === "number" ? major : parseFloat(String(major).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function toMajor(minor: number | null | undefined): number {
  return (minor ?? 0) / 100;
}

export function formatCompact(n: number): string {
  return Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function percentChange(current: number, previous: number): number {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
