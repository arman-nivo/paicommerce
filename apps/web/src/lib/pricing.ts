import { TRIAL_DAYS } from "@pai/core";
import type { PricingPlan } from "@/components/marketing/pricing-cards";
import type { MarketingPlan } from "./data";
import { signupUrl } from "./site";

export function isEnterprise(p: { code: string }) {
  return p.code === "enterprise";
}

/** Server-side: attach CTA URLs (env-dependent) to plans for the client pricing component. */
export function toPricingPlans(plans: MarketingPlan[]): PricingPlan[] {
  return plans.map((p) => ({
    code: p.code,
    name: p.name,
    tagline: p.tagline,
    priceMonthly: p.priceMonthly,
    priceYearly: p.priceYearly,
    currency: p.currency,
    highlighted: p.highlighted,
    features: p.features,
    monthlyHref: isEnterprise(p) ? "/contact?topic=enterprise" : signupUrl({ plan: p.code, interval: "monthly" }),
    yearlyHref: isEnterprise(p) ? "/contact?topic=enterprise" : signupUrl({ plan: p.code, interval: "yearly" }),
    cta: isEnterprise(p) ? "Contact sales" : p.priceMonthly === 0 ? "Start for free" : `Start ${TRIAL_DAYS}-day trial`,
  }));
}
