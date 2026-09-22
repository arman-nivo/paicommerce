import { z } from "zod";
import { TRIAL_DAYS } from "@pai/core";

/**
 * Well-known `platform_settings` keys. Other apps read these (merchant dashboard banner,
 * signup flow, billing checkout). Values are stored as JSON.
 */
export const GATEWAYS = ["bkash", "nagad", "sslcommerz", "stripe", "bank_transfer"] as const;

export const SETTING_SCHEMAS = {
  maintenance_banner: z.object({ enabled: z.boolean(), message: z.string().trim().max(500), level: z.enum(["info", "warning", "critical"]) }),
  signup_enabled: z.boolean(),
  default_trial_days: z.number().int().min(0).max(365),
  theme_revenue_share_default: z.number().int().min(0).max(100),
  platform_billing_gateways: z.array(z.enum(GATEWAYS)),
  support_contact: z.object({ email: z.union([z.string().trim().email(), z.literal("")]), phone: z.string().trim().max(30), whatsapp: z.string().trim().max(30) }),
} as const;

export type KnownKey = keyof typeof SETTING_SCHEMAS;
export const KNOWN_KEYS = Object.keys(SETTING_SCHEMAS) as KnownKey[];

export const SETTING_DEFAULTS: { [K in KnownKey]: z.infer<(typeof SETTING_SCHEMAS)[K]> } = {
  maintenance_banner: { enabled: false, message: "", level: "warning" },
  signup_enabled: true,
  default_trial_days: TRIAL_DAYS,
  theme_revenue_share_default: 70,
  platform_billing_gateways: ["bkash", "nagad", "sslcommerz"],
  support_contact: { email: "support@paicommerce.com", phone: "", whatsapp: "" },
};

export type KnownSettings = typeof SETTING_DEFAULTS;
