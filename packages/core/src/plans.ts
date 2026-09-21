import type { PlanLimits } from "@pai/db/schema";

/** Canonical plan catalogue (seeded into `plans`; admins can edit prices/limits later). */
export const DEFAULT_PLANS: {
  code: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  highlighted?: boolean;
  limits: PlanLimits;
  features: string[];
}[] = [
  {
    code: "free",
    name: "Starter",
    tagline: "Launch your first store — free forever",
    priceMonthly: 0,
    priceYearly: 0,
    limits: { products: 25, ordersPerMonth: 50, staff: 1, customDomain: false, premiumThemes: false, transactionFeePct: 2, storage: 500, apiAccess: false, removeBranding: false },
    features: ["25 products", "50 orders / month", "All free themes", "Cash on delivery + bKash", "yourstore.paicommerce.com subdomain", "Basic analytics"],
  },
  {
    code: "growth",
    name: "Growth",
    tagline: "For growing brands ready to scale",
    priceMonthly: 99900,
    priceYearly: 999000,
    highlighted: true,
    limits: { products: 1000, ordersPerMonth: 2000, staff: 5, customDomain: true, premiumThemes: true, transactionFeePct: 0, storage: 10000, apiAccess: true, removeBranding: true },
    features: ["1,000 products", "2,000 orders / month", "Custom domain + free SSL", "Premium themes", "All payment gateways", "Courier auto-booking", "Incomplete order recovery", "5 staff accounts", "0% transaction fee", "AI product writer"],
  },
  {
    code: "pro",
    name: "Pro",
    tagline: "Advanced tools for high-volume sellers",
    priceMonthly: 249900,
    priceYearly: 2499000,
    limits: { products: null, ordersPerMonth: null, staff: 20, customDomain: true, premiumThemes: true, transactionFeePct: 0, storage: 50000, apiAccess: true, removeBranding: true },
    features: ["Unlimited products & orders", "Everything in Growth", "Fraud check & courier success ratio", "Advanced analytics & reports", "Developer API & webhooks", "20 staff accounts", "Priority support"],
  },
  {
    code: "enterprise",
    name: "Enterprise",
    tagline: "Custom infrastructure, SLAs and dedicated success",
    priceMonthly: 999900,
    priceYearly: 9999000,
    limits: { products: null, ordersPerMonth: null, staff: null, customDomain: true, premiumThemes: true, transactionFeePct: 0, storage: 500000, apiAccess: true, removeBranding: true },
    features: ["Everything in Pro", "Unlimited staff", "Multi-store management", "99.99% uptime SLA", "Dedicated success manager", "Custom theme development", "SSO & audit logs"],
  },
];

export const TRIAL_DAYS = 14;
