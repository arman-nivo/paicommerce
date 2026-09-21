import type { PaymentProvider } from "./types";

const cod: PaymentProvider = {
  id: "cod",
  async init() {
    return { kind: "offline", message: "Pay with cash upon delivery." };
  },
};

const bkashManual: PaymentProvider = {
  id: "bkash_manual",
  async init() {
    return { kind: "offline", message: "We will verify your transaction ID and confirm your order." };
  },
};

/** SSLCommerz v4 — https://developer.sslcommerz.com/doc/v4/ */
const sslcommerz: PaymentProvider = {
  id: "sslcommerz",
  async init(cfg, i) {
    const base = cfg.sandbox ? "https://sandbox.sslcommerz.com" : "https://securepay.sslcommerz.com";
    const body = new URLSearchParams({
      store_id: String(cfg.storeId ?? ""),
      store_passwd: String(cfg.storePassword ?? ""),
      total_amount: (i.amount / 100).toFixed(2),
      currency: i.currency,
      tran_id: i.orderId,
      success_url: i.successUrl,
      fail_url: i.failUrl,
      cancel_url: i.cancelUrl,
      ipn_url: i.callbackUrl,
      cus_name: i.customer.name,
      cus_email: i.customer.email || "customer@example.com",
      cus_phone: i.customer.phone || "01700000000",
      cus_add1: i.customer.address || "N/A",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      shipping_method: "NO",
      product_name: `Order #${i.orderNumber}`,
      product_category: "ecommerce",
      product_profile: "general",
    });
    try {
      const res = await fetch(`${base}/gwprocess/v4/api.php`, { method: "POST", body });
      const data = (await res.json()) as { status?: string; GatewayPageURL?: string; failedreason?: string; sessionkey?: string };
      if (data.status === "SUCCESS" && data.GatewayPageURL) return { kind: "redirect", url: data.GatewayPageURL, reference: data.sessionkey };
      return { kind: "error", message: data.failedreason || "SSLCommerz initialisation failed" };
    } catch (e) {
      return { kind: "error", message: (e as Error).message };
    }
  },
  async verify(cfg, params) {
    const base = cfg.sandbox ? "https://sandbox.sslcommerz.com" : "https://securepay.sslcommerz.com";
    const qs = new URLSearchParams({ val_id: params.val_id ?? "", store_id: String(cfg.storeId), store_passwd: String(cfg.storePassword), format: "json" });
    const res = await fetch(`${base}/validator/api/validationserverAPI.php?${qs}`);
    const data = (await res.json()) as { status?: string; bank_tran_id?: string };
    return { paid: data.status === "VALID" || data.status === "VALIDATED", reference: data.bank_tran_id, raw: data };
  },
};

/** bKash Tokenized Checkout — https://developer.bka.sh */
async function bkashToken(cfg: Record<string, unknown>) {
  const base = cfg.sandbox ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta" : "https://tokenized.pay.bka.sh/v1.2.0-beta";
  const res = await fetch(`${base}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: { "Content-Type": "application/json", username: String(cfg.username), password: String(cfg.password) },
    body: JSON.stringify({ app_key: cfg.appKey, app_secret: cfg.appSecret }),
  });
  const data = (await res.json()) as { id_token?: string; statusMessage?: string };
  if (!data.id_token) throw new Error(data.statusMessage || "bKash token grant failed");
  return { base, token: data.id_token };
}

const bkash: PaymentProvider = {
  id: "bkash",
  async init(cfg, i) {
    try {
      const { base, token } = await bkashToken(cfg);
      const res = await fetch(`${base}/tokenized/checkout/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token, "X-APP-Key": String(cfg.appKey) },
        body: JSON.stringify({
          mode: "0011",
          payerReference: i.customer.phone || " ",
          callbackURL: i.callbackUrl,
          amount: (i.amount / 100).toFixed(2),
          currency: "BDT",
          intent: "sale",
          merchantInvoiceNumber: `${i.orderNumber}`,
        }),
      });
      const data = (await res.json()) as { bkashURL?: string; paymentID?: string; statusMessage?: string };
      if (data.bkashURL) return { kind: "redirect", url: data.bkashURL, reference: data.paymentID };
      return { kind: "error", message: data.statusMessage || "bKash create payment failed" };
    } catch (e) {
      return { kind: "error", message: (e as Error).message };
    }
  },
  async verify(cfg, params) {
    if (params.status !== "success" || !params.paymentID) return { paid: false, message: params.status };
    const { base, token } = await bkashToken(cfg);
    const res = await fetch(`${base}/tokenized/checkout/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token, "X-APP-Key": String(cfg.appKey) },
      body: JSON.stringify({ paymentID: params.paymentID }),
    });
    const data = (await res.json()) as { transactionStatus?: string; trxID?: string };
    return { paid: data.transactionStatus === "Completed", reference: data.trxID, raw: data };
  },
};

/** Stripe Checkout Sessions via REST (no SDK dependency). */
const stripe: PaymentProvider = {
  id: "stripe",
  async init(cfg, i) {
    const body = new URLSearchParams({
      mode: "payment",
      success_url: `${i.successUrl}${i.successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: i.cancelUrl,
      client_reference_id: i.orderId,
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": i.currency.toLowerCase(),
      "line_items[0][price_data][unit_amount]": String(i.amount),
      "line_items[0][price_data][product_data][name]": `Order #${i.orderNumber}`,
    });
    if (i.customer.email) body.set("customer_email", i.customer.email);
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.secretKey}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { url?: string; id?: string; error?: { message: string } };
    return data.url ? { kind: "redirect", url: data.url, reference: data.id } : { kind: "error", message: data.error?.message ?? "Stripe error" };
  },
  async verify(cfg, params) {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${params.session_id}`, { headers: { Authorization: `Bearer ${cfg.secretKey}` } });
    const data = (await res.json()) as { payment_status?: string; payment_intent?: string };
    return { paid: data.payment_status === "paid", reference: data.payment_intent };
  },
};

const unsupported = (id: string): PaymentProvider => ({
  id,
  async init() {
    return { kind: "error", message: `${id} is configured but its live API adapter requires merchant approval. Contact support to activate.` };
  },
});

export const PAYMENT_PROVIDERS: Record<string, PaymentProvider> = {
  cod,
  bkash_manual: bkashManual,
  bkash,
  sslcommerz,
  stripe,
  nagad: unsupported("nagad"),
  aamarpay: unsupported("aamarpay"),
  paypal: unsupported("paypal"),
};

export const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  bkash_manual: "bKash / Nagad (Send Money)",
  bkash: "bKash",
  nagad: "Nagad",
  sslcommerz: "Card / Mobile Banking (SSLCommerz)",
  aamarpay: "aamarPay",
  stripe: "Credit / Debit Card",
  paypal: "PayPal",
  manual: "Manual",
};

export type { PaymentProvider, PaymentInitInput, PaymentInitResult, PaymentVerifyResult } from "./types";
