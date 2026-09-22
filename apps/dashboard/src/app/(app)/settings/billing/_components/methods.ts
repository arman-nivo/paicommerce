export const PAY_METHODS = [
  { value: "bkash", label: "bKash", color: "#E2136E" },
  { value: "sslcommerz", label: "SSLCommerz", color: "#1f5aa6" },
  { value: "card", label: "Card", color: "#111827" },
] as const;

export type PayMethod = (typeof PAY_METHODS)[number]["value"];

export function methodLabel(m: string | null | undefined) {
  if (!m) return "—";
  return PAY_METHODS.find((x) => x.value === m)?.label ?? m;
}
