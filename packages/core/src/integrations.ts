/**
 * Integration catalogue — drives the "Apps & integrations" UI in the merchant dashboard.
 * Each entry declares its config fields; values are stored in `store_integrations.config`.
 */
export type IntegrationField = {
  key: string;
  label: string;
  type: "text" | "password" | "toggle" | "textarea";
  placeholder?: string;
  help?: string;
  required?: boolean;
};

export type IntegrationDef = {
  provider: string;
  type: "payment" | "courier" | "analytics" | "marketing" | "sms" | "other";
  name: string;
  description: string;
  logo: string; // path under /integrations/*.svg or a URL; UI falls back to initials
  color: string;
  region: "BD" | "Global";
  plan?: "free" | "growth" | "pro";
  fields: IntegrationField[];
  docsUrl?: string;
  popular?: boolean;
};

const sandbox: IntegrationField = { key: "sandbox", label: "Sandbox / test mode", type: "toggle" };

export const INTEGRATIONS: IntegrationDef[] = [
  /* ─── Payments ─── */
  { provider: "cod", type: "payment", name: "Cash on Delivery", description: "Collect payment when the parcel is delivered. Optional advance delivery charge.", logo: "", color: "#16a34a", region: "Global", popular: true,
    fields: [{ key: "advanceDeliveryCharge", label: "Require delivery charge in advance", type: "toggle" }, { key: "instructions", label: "Checkout note", type: "textarea", placeholder: "Pay in cash when you receive your order." }] },
  { provider: "bkash", type: "payment", name: "bKash", description: "Accept bKash via tokenized checkout (API) with instant confirmation.", logo: "", color: "#e2136e", region: "BD", popular: true, docsUrl: "https://developer.bka.sh",
    fields: [{ key: "appKey", label: "App key", type: "text", required: true }, { key: "appSecret", label: "App secret", type: "password", required: true }, { key: "username", label: "Username", type: "text", required: true }, { key: "password", label: "Password", type: "password", required: true }, sandbox] },
  { provider: "bkash_manual", type: "payment", name: "bKash / Nagad / Rocket (Send Money)", description: "Customers send money to your personal/merchant number and enter the transaction ID. No API needed.", logo: "", color: "#f97316", region: "BD", popular: true,
    fields: [{ key: "bkashNumber", label: "bKash number", type: "text" }, { key: "nagadNumber", label: "Nagad number", type: "text" }, { key: "rocketNumber", label: "Rocket number", type: "text" }, { key: "instructions", label: "Instructions", type: "textarea", placeholder: "Send money to the number above and enter the TrxID." }] },
  { provider: "nagad", type: "payment", name: "Nagad", description: "Nagad online payment gateway (merchant API).", logo: "", color: "#f6921e", region: "BD", plan: "growth",
    fields: [{ key: "merchantId", label: "Merchant ID", type: "text", required: true }, { key: "merchantNumber", label: "Merchant number", type: "text", required: true }, { key: "publicKey", label: "Nagad public key", type: "textarea", required: true }, { key: "privateKey", label: "Merchant private key", type: "textarea", required: true }, sandbox] },
  { provider: "sslcommerz", type: "payment", name: "SSLCommerz", description: "Cards, mobile banking & internet banking — 30+ methods in one gateway.", logo: "", color: "#1d4ed8", region: "BD", popular: true, docsUrl: "https://developer.sslcommerz.com",
    fields: [{ key: "storeId", label: "Store ID", type: "text", required: true }, { key: "storePassword", label: "Store password", type: "password", required: true }, sandbox] },
  { provider: "aamarpay", type: "payment", name: "aamarPay", description: "Local cards and MFS through aamarPay.", logo: "", color: "#0ea5e9", region: "BD", plan: "growth",
    fields: [{ key: "storeId", label: "Store ID", type: "text", required: true }, { key: "signatureKey", label: "Signature key", type: "password", required: true }, sandbox] },
  { provider: "stripe", type: "payment", name: "Stripe", description: "International cards, Apple Pay & Google Pay.", logo: "", color: "#635bff", region: "Global", plan: "growth",
    fields: [{ key: "publishableKey", label: "Publishable key", type: "text", required: true }, { key: "secretKey", label: "Secret key", type: "password", required: true }] },
  { provider: "paypal", type: "payment", name: "PayPal", description: "Accept PayPal from international customers.", logo: "", color: "#003087", region: "Global", plan: "growth",
    fields: [{ key: "clientId", label: "Client ID", type: "text", required: true }, { key: "clientSecret", label: "Client secret", type: "password", required: true }, sandbox] },

  /* ─── Couriers ─── */
  { provider: "steadfast", type: "courier", name: "Steadfast Courier", description: "Book parcels in one click, sync status and COD automatically.", logo: "", color: "#0f766e", region: "BD", popular: true, docsUrl: "https://steadfast.com.bd",
    fields: [{ key: "apiKey", label: "API key", type: "text", required: true }, { key: "secretKey", label: "Secret key", type: "password", required: true }] },
  { provider: "pathao", type: "courier", name: "Pathao Courier", description: "Nationwide delivery with live tracking.", logo: "", color: "#e11d48", region: "BD", popular: true,
    fields: [{ key: "clientId", label: "Client ID", type: "text", required: true }, { key: "clientSecret", label: "Client secret", type: "password", required: true }, { key: "username", label: "Merchant email", type: "text", required: true }, { key: "password", label: "Password", type: "password", required: true }, { key: "storeId", label: "Pathao store ID", type: "text", required: true }, sandbox] },
  { provider: "redx", type: "courier", name: "RedX", description: "Fast delivery across 64 districts.", logo: "", color: "#dc2626", region: "BD",
    fields: [{ key: "accessToken", label: "API access token", type: "password", required: true }, sandbox] },
  { provider: "paperfly", type: "courier", name: "Paperfly", description: "E-commerce logistics & warehousing.", logo: "", color: "#7c3aed", region: "BD",
    fields: [{ key: "username", label: "Username", type: "text", required: true }, { key: "password", label: "Password", type: "password", required: true }, { key: "apiKey", label: "API key", type: "password", required: true }] },

  /* ─── Analytics & marketing ─── */
  { provider: "facebook_pixel", type: "analytics", name: "Meta Pixel + Conversions API", description: "Track ViewContent, AddToCart, Purchase — browser + server-side.", logo: "", color: "#1877f2", region: "Global", popular: true,
    fields: [{ key: "pixelId", label: "Pixel ID", type: "text", required: true }, { key: "accessToken", label: "Conversions API token", type: "password", help: "Enables server-side events (recommended for iOS 14+)." }, { key: "testEventCode", label: "Test event code", type: "text" }] },
  { provider: "ga4", type: "analytics", name: "Google Analytics 4", description: "E-commerce events for GA4.", logo: "", color: "#f59e0b", region: "Global",
    fields: [{ key: "measurementId", label: "Measurement ID", type: "text", placeholder: "G-XXXXXXX", required: true }] },
  { provider: "gtm", type: "analytics", name: "Google Tag Manager", description: "Load any tag through GTM with a rich dataLayer.", logo: "", color: "#2563eb", region: "Global",
    fields: [{ key: "containerId", label: "Container ID", type: "text", placeholder: "GTM-XXXX", required: true }] },
  { provider: "tiktok_pixel", type: "analytics", name: "TikTok Pixel", description: "Track conversions from TikTok ads.", logo: "", color: "#111827", region: "Global",
    fields: [{ key: "pixelId", label: "Pixel ID", type: "text", required: true }] },
  { provider: "google_merchant", type: "marketing", name: "Google Merchant Center", description: "Product feed for Google Shopping (auto-generated XML feed).", logo: "", color: "#4285f4", region: "Global", plan: "growth", fields: [] },
  { provider: "facebook_catalog", type: "marketing", name: "Facebook & Instagram Shop", description: "Sync your catalog to Meta Commerce Manager.", logo: "", color: "#e1306c", region: "Global", plan: "growth", fields: [] },
  { provider: "messenger_chat", type: "marketing", name: "Messenger / WhatsApp chat", description: "Floating chat button on your storefront.", logo: "", color: "#25d366", region: "Global",
    fields: [{ key: "messengerPageId", label: "Facebook page username", type: "text" }, { key: "whatsappNumber", label: "WhatsApp number", type: "text" }] },

  /* ─── SMS ─── */
  { provider: "sms_bulksmsbd", type: "sms", name: "BulkSMSBD", description: "Order confirmation & OTP SMS in Bangla/English.", logo: "", color: "#0891b2", region: "BD",
    fields: [{ key: "apiKey", label: "API key", type: "password", required: true }, { key: "senderId", label: "Sender ID", type: "text", required: true }] },
];

export function getIntegration(provider: string) {
  return INTEGRATIONS.find((i) => i.provider === provider);
}

/** Mask secrets for display: "abcd••••wxyz". */
export function maskSecret(v: string): string {
  if (!v) return "";
  if (v.length <= 8) return "••••••••";
  return `${v.slice(0, 4)}••••${v.slice(-4)}`;
}
