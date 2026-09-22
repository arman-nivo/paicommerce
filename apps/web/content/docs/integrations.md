---
title: Payments, couriers & integrations
description: The integration catalogue — bKash, Nagad, SSLCommerz, COD and card gateways; Steadfast, Pathao and RedX courier booking; fraud checks with delivery success ratio; incomplete orders; Meta Pixel + CAPI, GA4, GTM and TikTok.
---

PaiCommerce ships the integrations Bangladeshi merchants need out of the box. Merchants connect them under **Settings → Payments**, **Settings → Couriers** and **Settings → Apps & integrations**; credentials are stored per store in `store_integrations.config` and are never exposed to themes or to the browser.

This page describes what's available and how it works — for integrators, agencies and contributors adding new providers.

## The integration catalogue

Every integration is declared once in `INTEGRATIONS` (`@pai/core/integrations`). The dashboard renders each settings form from the declared `fields`, so adding a provider to the catalogue is enough to make it configurable:

```ts title="packages/core/src/integrations.ts"
export type IntegrationField = {
  key: string;
  label: string;
  type: "text" | "password" | "toggle" | "textarea";
  placeholder?: string;
  help?: string;
  required?: boolean;
};

export type IntegrationDef = {
  provider: string; // stored in store_integrations.provider
  type: "payment" | "courier" | "analytics" | "marketing" | "sms" | "other";
  name: string;
  description: string;
  logo: string;
  color: string;
  region: "BD" | "Global";
  plan?: "free" | "growth" | "pro"; // minimum plan; omitted = every plan
  fields: IntegrationField[];
  docsUrl?: string;
  popular?: boolean;
};
```

Secrets (`password` fields) are masked in the UI with `maskSecret()` — `abcd••••wxyz`.

### Payments

| Provider | Name | Region | Plan | Configuration |
| --- | --- | --- | --- | --- |
| `cod` | Cash on Delivery | Global | All | Optional advance delivery charge, checkout note |
| `bkash` | bKash (Tokenized Checkout API) | BD | All | App key, app secret, username, password, sandbox |
| `bkash_manual` | bKash / Nagad / Rocket (Send Money) | BD | All | Wallet numbers and instructions — the customer enters the TrxID |
| `nagad` | Nagad (merchant API) | BD | Growth | Merchant ID & number, Nagad public key, merchant private key, sandbox |
| `sslcommerz` | SSLCommerz (cards, MFS, internet banking) | BD | All | Store ID, store password, sandbox |
| `aamarpay` | aamarPay | BD | Growth | Store ID, signature key, sandbox |
| `stripe` | Stripe | Global | Growth | Publishable key, secret key |
| `paypal` | PayPal | Global | Growth | Client ID, client secret, sandbox |

### Couriers

| Provider | Name | Configuration | Booking adapter |
| --- | --- | --- | --- |
| `steadfast` | Steadfast Courier | API key, secret key | Booking + status lookup |
| `pathao` | Pathao Courier | Client ID/secret, merchant email, password, Pathao store ID, sandbox | Booking |
| `redx` | RedX | API access token, sandbox | Booking |
| `paperfly` | Paperfly | Username, password, API key | Credentials only — no adapter yet (manual booking) |

### Analytics, marketing & SMS

| Provider | Name | Configuration |
| --- | --- | --- |
| `facebook_pixel` | Meta Pixel + Conversions API | Pixel ID, CAPI access token, test event code |
| `ga4` | Google Analytics 4 | Measurement ID (`G-XXXXXXX`) |
| `gtm` | Google Tag Manager | Container ID (`GTM-XXXX`) |
| `tiktok_pixel` | TikTok Pixel | Pixel ID |
| `google_merchant` | Google Merchant Center | Auto-generated product feed (Growth) |
| `facebook_catalog` | Facebook & Instagram Shop | Catalog sync (Growth) |
| `messenger_chat` | Messenger / WhatsApp chat button | Page username, WhatsApp number |
| `sms_bulksmsbd` | BulkSMSBD | API key, sender ID — order confirmations & OTP in Bangla/English |

## Payment providers

Online gateways implement `PaymentProvider` (`@pai/core/payments`):

```ts title="packages/core/src/payments/types.ts"
export type PaymentInitInput = {
  orderId: string;
  orderNumber: number;
  amount: number; // minor units
  currency: string;
  customer: { name: string; email?: string | null; phone?: string | null; address?: string };
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  callbackUrl: string; // server-to-server IPN / callback
};

export type PaymentInitResult =
  | { kind: "redirect"; url: string; reference?: string } // send the shopper to the gateway
  | { kind: "offline"; message: string } // COD / manual: order is placed, payment later
  | { kind: "error"; message: string };

export type PaymentVerifyResult = { paid: boolean; reference?: string; raw?: unknown; message?: string };

export interface PaymentProvider {
  id: string;
  init(config: Record<string, unknown>, input: PaymentInitInput): Promise<PaymentInitResult>;
  verify?(config: Record<string, unknown>, params: Record<string, string>): Promise<PaymentVerifyResult>;
}
```

The checkout flow is the same for every gateway:

1. `createOrder` creates the order with `paymentStatus: "pending"`.
2. The storefront calls `provider.init(config, input)` with the store's credentials.
3. For `redirect`, the shopper pays on the gateway's page and returns to `successUrl`, `failUrl` or `cancelUrl`. The gateway may also call `callbackUrl` (IPN) server-to-server.
4. The storefront calls `provider.verify(config, params)` with the returned parameters and **only** marks the order `paid` when verification succeeds — return URLs alone are never trusted.

Registered providers live in `PAYMENT_PROVIDERS`: `cod`, `bkash_manual`, `bkash` (tokenized checkout: grant token → create → execute), `sslcommerz` (v4 session + validation API) and `stripe` (Checkout Sessions). `nagad`, `aamarpay` and `paypal` can be configured, but their live adapters are activated per merchant after gateway approval — until then `init` returns an error asking the merchant to contact support.

> [!NOTE]
> Amounts are passed to `init` in minor units. Adapters convert to what each gateway expects — SSLCommerz, for example, receives `(amount / 100).toFixed(2)`.

### Adding a payment provider

1. Add an `IntegrationDef` with `type: "payment"` to `INTEGRATIONS`.
2. Implement `PaymentProvider` in `packages/core/src/payments/` and register it in `PAYMENT_PROVIDERS` and `PAYMENT_LABELS`.
3. Make `verify` idempotent: gateways retry IPNs and shoppers refresh return pages.
4. Test against the gateway's sandbox (`sandbox: true` in the config).

## Courier adapters

Courier integrations implement `CourierAdapter` (`@pai/core/couriers`):

```ts title="packages/core/src/couriers/index.ts"
export type CourierParcel = {
  invoice: string; // the order number
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number; // major units (BDT) — 0 for prepaid orders
  note?: string;
  weightKg?: number;
  itemCount?: number;
};

export type CourierBooking =
  | { ok: true; consignmentId: string; trackingCode?: string; trackingUrl?: string; status: string }
  | { ok: false; error: string };

export interface CourierAdapter {
  id: string;
  name: string;
  book(cfg: Record<string, unknown>, p: CourierParcel): Promise<CourierBooking>;
  status?(cfg: Record<string, unknown>, consignmentId: string): Promise<string | null>;
}

export const COURIERS: Record<string, CourierAdapter> = { steadfast, redx, pathao };
```

Merchants book a parcel with one click from an order, or in bulk from the orders list. A successful booking:

- saves `provider`, `consignmentId`, `trackingCode`, `trackingUrl`, `status` and `bookedAt` on `orders.courier`;
- adds a timeline event ("Booked with Steadfast · CN 123456 · COD 1,250");
- moves the order to `shipped` (confirming it first if it was still `unfulfilled`).

The COD amount is the order's outstanding balance — `0` for orders already paid online — converted from poisha to taka before it is sent to the courier.

### Adding a courier

Implement `CourierAdapter` in `packages/core/src/couriers/`, add it to `COURIERS`, and add an `IntegrationDef` with `type: "courier"` to the catalogue. Return `{ ok: false, error }` with a human-readable message rather than throwing — the error is shown to the merchant verbatim.

## Fraud check & delivery success ratio

Cash on delivery dominates Bangladeshi e-commerce, and so do fake or refused orders. On order and customer pages, merchants see the customer's **delivery success ratio** in their store:

```text
ratio = delivered / (delivered + cancelled + returned) × 100
```

It is computed over previous orders from the same (normalised) phone number, excluding the current order, and turned into a verdict:

| Verdict | Ratio |
| --- | --- |
| `new` | No delivered, cancelled or returned orders yet |
| `trusted` | 80% or more |
| `caution` | 50 – 79% |
| `risky` | Below 50% |

Under **Settings → Fraud prevention**, merchants can:

- **block phone numbers** (`settings.fraud.blockPhones`) — orders from blocked numbers are flagged;
- set a **minimum courier success rate** (`settings.fraud.minCourierSuccessRate`, default 70%) — customers below it are highlighted, with a suggestion to ask for an advance delivery charge before shipping.

The COD integration's **advance delivery charge** option lets merchants require the delivery fee up front before a COD order ships.

## Incomplete orders

When `settings.checkout.captureIncomplete` is on (the default), the storefront saves a snapshot of partially filled checkouts on the cart (`carts.checkout`) once the shopper has entered a phone number. They appear under **Orders → Incomplete orders**, where staff can call the customer and convert the checkout into a real order with one click. Converted carts record `recoveredOrderId`, so a checkout can only be recovered once, and `recoveryContactedAt` tracks follow-ups.

## Pixels, Conversions API, GA4 & GTM

Tracking integrations are injected by the storefront — **themes must not add their own tracking scripts**. The storefront reports the standard e-commerce funnel:

| Step | Meta | GA4 / GTM `dataLayer` | TikTok |
| --- | --- | --- | --- |
| Product viewed | `ViewContent` | `view_item` | `ViewContent` |
| Added to cart | `AddToCart` | `add_to_cart` | `AddToCart` |
| Checkout started | `InitiateCheckout` | `begin_checkout` | `InitiateCheckout` |
| Order placed | `Purchase` | `purchase` | `CompletePayment` |

With a **Conversions API** access token configured, purchases are also sent server-side with the same `event_id` as the browser event, so Meta de-duplicates them. This recovers conversions lost to iOS tracking prevention and ad blockers. Use the **test event code** to verify events in Meta Events Manager before going live.

Merchants can also paste IDs directly under **Online store → Preferences** (`settings.tracking`: `facebookPixelId`, `ga4Id`, `gtmId`, `tiktokPixelId`) for a quick setup without CAPI.
