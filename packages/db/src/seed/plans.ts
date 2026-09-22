import { plans } from "../schema";
import { DEFAULT_PLANS } from "../../../core/src/plans";
import { uuid } from "./lib/rng";
import { daysAgo, insertMany } from "./lib/util";

export type PlanRef = { id: string; priceMonthly: number; priceYearly: number; name: string };

export async function seedPlans() {
  const rows = DEFAULT_PLANS.map((p, i) => ({
    id: uuid(),
    code: p.code,
    name: p.name,
    tagline: p.tagline,
    priceMonthly: p.priceMonthly,
    priceYearly: p.priceYearly,
    currency: "BDT",
    limits: p.limits,
    features: p.features,
    highlighted: !!p.highlighted,
    active: true,
    sort: i,
    createdAt: daysAgo(400),
  }));
  await insertMany(plans, rows);
  return Object.fromEntries(rows.map((r) => [r.code, { id: r.id, priceMonthly: r.priceMonthly, priceYearly: r.priceYearly, name: r.name }])) as Record<string, PlanRef>;
}

