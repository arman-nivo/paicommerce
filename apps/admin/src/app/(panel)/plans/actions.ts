"use server";

import { z } from "zod";
import { count, db, eq, plans, stores, subscriptions } from "@pai/db";
import { adminAction, fail } from "@/lib/action";
import { audit } from "@/lib/audit";

const limit = z.union([z.number().int().min(0).max(100_000_000), z.null()]);
const planSchema = z.object({
  id: z.string().uuid().optional(),
  code: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9_-]{1,30}$/, "Code must be 2–31 chars: lowercase letters, numbers, - or _"),
  name: z.string().trim().min(2).max(60),
  tagline: z.string().trim().max(160).optional().default(""),
  priceMonthly: z.number().int().min(0).max(1_000_000_000),
  priceYearly: z.number().int().min(0).max(10_000_000_000),
  limits: z.object({
    products: limit,
    ordersPerMonth: limit,
    staff: limit,
    customDomain: z.boolean(),
    premiumThemes: z.boolean(),
    transactionFeePct: z.number().min(0).max(100),
    storage: z.number().int().min(0).max(100_000_000),
    apiAccess: z.boolean(),
    removeBranding: z.boolean(),
  }),
  features: z.array(z.string().trim().min(1).max(120)).max(40),
  highlighted: z.boolean(),
  active: z.boolean(),
  sort: z.number().int().min(-1000).max(1000),
});

export const savePlan = adminAction("plans.manage", planSchema, async (input, admin) => {
  const { id, ...values } = input;
  const data = { ...values, tagline: values.tagline || null };
  if (id) {
    const before = await db.query.plans.findFirst({ where: eq(plans.id, id) });
    if (!before) fail("Plan not found");
    await db.update(plans).set(data).where(eq(plans.id, id));
    await audit({ actorId: admin.id, action: "plan.updated", target: values.code, meta: { planId: id, before: { priceMonthly: before.priceMonthly, priceYearly: before.priceYearly, limits: before.limits, active: before.active }, after: { priceMonthly: values.priceMonthly, priceYearly: values.priceYearly, limits: values.limits, active: values.active } } });
    return { message: `${values.name} updated` };
  }
  const [row] = await db.insert(plans).values(data).returning({ id: plans.id });
  await audit({ actorId: admin.id, action: "plan.created", target: values.code, meta: { planId: row!.id } });
  return { message: `${values.name} created` };
});

export const deletePlan = adminAction("plans.manage", z.object({ id: z.string().uuid() }), async ({ id }, admin) => {
  const plan = await db.query.plans.findFirst({ where: eq(plans.id, id) });
  if (!plan) fail("Plan not found");
  const [[s], [sub]] = await Promise.all([
    db.select({ n: count() }).from(stores).where(eq(stores.planId, id)),
    db.select({ n: count() }).from(subscriptions).where(eq(subscriptions.planId, id)),
  ]);
  if ((s?.n ?? 0) + (sub?.n ?? 0) > 0) fail(`${plan.name} is used by ${s?.n ?? 0} stores / ${sub?.n ?? 0} subscriptions — deactivate it instead.`);
  await db.delete(plans).where(eq(plans.id, id));
  await audit({ actorId: admin.id, action: "plan.deleted", target: plan.code, meta: { planId: id } });
  return { message: `${plan.name} deleted` };
});

export const togglePlanActive = adminAction("plans.manage", z.object({ id: z.string().uuid(), active: z.boolean() }), async ({ id, active }, admin) => {
  const plan = await db.query.plans.findFirst({ where: eq(plans.id, id) });
  if (!plan) fail("Plan not found");
  await db.update(plans).set({ active }).where(eq(plans.id, id));
  await audit({ actorId: admin.id, action: "plan.updated", target: plan.code, meta: { planId: id, active } });
  return { message: `${plan.name} ${active ? "activated" : "hidden from new signups"}` };
});
