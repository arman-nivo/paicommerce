/** Store commerce settings: delivery zones, payment methods, integrations (tracking/chat). */
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, db, eq, storeIntegrations, type DeliveryZone, type StoreSettings } from "@pai/db";
import { PAYMENT_LABELS } from "@pai/core/payments";
import { STORE_TAG, type SiteStore } from "./site";

export const DEFAULT_ZONES: DeliveryZone[] = [
  { id: "inside-dhaka", name: "Inside Dhaka", charge: 7000, estimatedDays: "1–2 days" },
  { id: "outside-dhaka", name: "Outside Dhaka", charge: 13000, estimatedDays: "3–5 days" },
];

export function deliveryZones(store: Pick<SiteStore, "settings">): DeliveryZone[] {
  const zones = store.settings?.delivery?.zones?.filter((z) => z?.id && z.name) ?? [];
  return zones.length ? zones : DEFAULT_ZONES;
}

/** True when the store has no zones configured and we use DEFAULT_ZONES. */
export function usesDefaultZones(store: Pick<SiteStore, "settings">): boolean {
  return !(store.settings?.delivery?.zones?.filter((z) => z?.id && z.name).length);
}

/** Store settings with delivery zones materialised (for priceCart). */
export function pricingStore(store: Pick<SiteStore, "id" | "settings">): { id: string; settings: StoreSettings } {
  return {
    id: store.id,
    settings: { ...store.settings, delivery: { zones: deliveryZones(store), freeShippingOver: store.settings?.delivery?.freeShippingOver ?? null } },
  };
}

export type IntegrationRow = { provider: string; type: string; config: Record<string, string | boolean | number> };

/** Enabled integrations for a store (cached briefly). Contains secrets — never send to the client as-is. */
export const getIntegrations = cache(async (storeId: string): Promise<IntegrationRow[]> =>
  unstable_cache(
    async () =>
      db
        .select({ provider: storeIntegrations.provider, type: storeIntegrations.type, config: storeIntegrations.config })
        .from(storeIntegrations)
        .where(and(eq(storeIntegrations.storeId, storeId), eq(storeIntegrations.enabled, true))),
    ["sf-integrations", storeId],
    { revalidate: 10, tags: [STORE_TAG(storeId), `integrations:${storeId}`] },
  )(),
);

export type PaymentMethod = {
  id: string;
  label: string;
  description: string;
  /** Redirect gateways (bKash API, SSLCommerz, Stripe …) send the customer to pay after placing the order. */
  kind: "offline" | "manual" | "redirect";
  /** Public details for manual MFS payments. */
  numbers?: { label: string; number: string }[];
  instructions?: string;
};

const DESCRIPTIONS: Record<string, string> = {
  cod: "Pay with cash when your order is delivered.",
  bkash_manual: "Send money with bKash / Nagad / Rocket, then enter the transaction ID.",
  bkash: "Pay securely with your bKash account.",
  nagad: "Pay with Nagad.",
  sslcommerz: "Cards, mobile banking and internet banking.",
  aamarpay: "Cards and mobile banking via aamarPay.",
  stripe: "Visa, Mastercard, Amex — processed securely by Stripe.",
  paypal: "Pay with your PayPal account.",
};

/** Payment methods available at checkout (COD when nothing is configured). */
export async function paymentMethods(storeId: string): Promise<PaymentMethod[]> {
  const rows = (await getIntegrations(storeId)).filter((r) => r.type === "payment");
  if (!rows.length) return [{ id: "cod", label: PAYMENT_LABELS.cod!, description: DESCRIPTIONS.cod!, kind: "offline" }];
  const order = ["cod", "bkash", "bkash_manual", "nagad", "sslcommerz", "aamarpay", "stripe", "paypal"];
  return rows
    .sort((a, b) => order.indexOf(a.provider) - order.indexOf(b.provider))
    .map((r): PaymentMethod => {
      const c = r.config ?? {};
      if (r.provider === "bkash_manual") {
        const numbers = [
          c.bkashNumber ? { label: "bKash", number: String(c.bkashNumber) } : null,
          c.nagadNumber ? { label: "Nagad", number: String(c.nagadNumber) } : null,
          c.rocketNumber ? { label: "Rocket", number: String(c.rocketNumber) } : null,
        ].filter(Boolean) as { label: string; number: string }[];
        return { id: r.provider, label: PAYMENT_LABELS.bkash_manual!, description: DESCRIPTIONS.bkash_manual!, kind: "manual", numbers, instructions: c.instructions ? String(c.instructions) : undefined };
      }
      if (r.provider === "cod") {
        return { id: "cod", label: PAYMENT_LABELS.cod!, description: c.instructions ? String(c.instructions) : DESCRIPTIONS.cod!, kind: "offline" };
      }
      return { id: r.provider, label: PAYMENT_LABELS[r.provider] ?? r.provider, description: DESCRIPTIONS[r.provider] ?? "", kind: "redirect" };
    });
}

export type TrackingConfig = {
  facebookPixelId?: string;
  ga4Id?: string;
  gtmId?: string;
  tiktokPixelId?: string;
  whatsapp?: string;
  messenger?: string;
};

/** Public tracking IDs & chat handles (integrations first, then store settings). */
export async function trackingConfig(store: Pick<SiteStore, "id" | "settings">): Promise<TrackingConfig> {
  const rows = await getIntegrations(store.id);
  const get = (provider: string, key: string) => {
    const v = rows.find((r) => r.provider === provider)?.config?.[key];
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
  };
  const t = store.settings?.tracking ?? {};
  const chat = rows.find((r) => r.provider === "messenger_chat");
  return {
    facebookPixelId: get("facebook_pixel", "pixelId") ?? t.facebookPixelId,
    ga4Id: get("ga4", "measurementId") ?? t.ga4Id,
    gtmId: get("gtm", "containerId") ?? t.gtmId,
    tiktokPixelId: get("tiktok_pixel", "pixelId") ?? t.tiktokPixelId,
    whatsapp: chat ? get("messenger_chat", "whatsappNumber") : undefined,
    messenger: chat ? get("messenger_chat", "messengerPageId") : undefined,
  };
}
