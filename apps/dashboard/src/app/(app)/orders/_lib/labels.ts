/** Client-safe display labels for orders. */
export const METHOD_SHORT: Record<string, string> = {
  cod: "COD",
  bkash_manual: "bKash (Send Money)",
  bkash: "bKash",
  nagad: "Nagad",
  sslcommerz: "SSLCommerz",
  aamarpay: "aamarPay",
  stripe: "Card",
  paypal: "PayPal",
  manual: "Manual",
};

export const SOURCE_SHORT: Record<string, string> = {
  web: "Online store",
  manual: "Manual",
  facebook: "Facebook",
  landing: "Landing page",
  pos: "POS",
  api: "API",
};

export const COURIER_LABELS: Record<string, string> = { steadfast: "Steadfast", pathao: "Pathao", redx: "RedX", manual: "Manual" };

export function courierName(c: { provider: string; status?: string } | null | undefined) {
  if (!c) return "";
  // Manual shipments keep the courier's display name in `status`.
  if (c.provider === "manual") return c.status || "Manual";
  return COURIER_LABELS[c.provider] ?? c.provider;
}

/** 01712345678 → 8801712345678 for wa.me links. */
export function waNumber(phone: string | null | undefined) {
  const d = (phone ?? "").replace(/\D/g, "");
  if (d.startsWith("880")) return d;
  if (d.startsWith("0")) return `88${d}`;
  return d;
}
