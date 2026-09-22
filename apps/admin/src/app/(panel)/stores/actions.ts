"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { ACTIVE_STORE_COOKIE, cookieOptions } from "@pai/core/auth";
import { createSession } from "@pai/core/session";
import { DASHBOARD_URL } from "@pai/core";
import { and, db, desc, eq, inArray, ne, plans, stores, subscriptions, users } from "@pai/db";
import { adminAction, fail } from "@/lib/action";
import { audit } from "@/lib/audit";
import { isAdminRole } from "@/lib/roles";

const ids = z.array(z.string().uuid()).min(1, "Select at least one store").max(500);
const DAY = 86400_000;

export const setStoreStatus = adminAction(
  "stores.manage",
  z.object({ ids, status: z.enum(["active", "suspended", "closed"]), reason: z.string().trim().max(500).optional() }),
  async ({ ids, status, reason }, admin) => {
    if (status !== "active" && (!reason || reason.length < 3)) fail("Please give a reason (at least 3 characters).");
    const rows = await db.select().from(stores).where(inArray(stores.id, ids));
    const activeSubs = await db
      .select({ storeId: subscriptions.storeId })
      .from(subscriptions)
      .where(and(inArray(subscriptions.storeId, ids), eq(subscriptions.status, "active")));
    const paid = new Set(activeSubs.map((s) => s.storeId));
    let changed = 0;
    for (const s of rows) {
      // Reactivation goes back to trial when the trial is still running and nothing is paid yet.
      const next = status === "active" && !paid.has(s.id) && s.trialEndsAt && s.trialEndsAt.getTime() > Date.now() ? "trial" : status;
      if (s.status === next) continue;
      await db.update(stores).set({ status: next }).where(eq(stores.id, s.id));
      await audit({
        actorId: admin.id,
        storeId: s.id,
        action: status === "suspended" ? "store.suspended" : status === "active" ? "store.reactivated" : "store.status_changed",
        target: s.slug,
        meta: { from: s.status, to: next, reason: reason || undefined },
      });
      changed++;
    }
    const verb = status === "suspended" ? "suspended" : status === "active" ? "reactivated" : "closed";
    return { message: `${changed} store${changed === 1 ? "" : "s"} ${verb}` };
  },
);

export const extendTrial = adminAction("stores.manage", z.object({ ids, days: z.coerce.number().int().min(1).max(365) }), async ({ ids, days }, admin) => {
  const rows = await db.select().from(stores).where(inArray(stores.id, ids));
  for (const s of rows) {
    const base = Math.max(Date.now(), s.trialEndsAt?.getTime() ?? 0);
    const trialEndsAt = new Date(base + days * DAY);
    const status = s.status === "past_due" || s.status === "trial" ? "trial" : s.status;
    await db.update(stores).set({ trialEndsAt, status }).where(eq(stores.id, s.id));
    await audit({ actorId: admin.id, storeId: s.id, action: "store.trial_extended", target: s.slug, meta: { days, from: s.trialEndsAt, to: trialEndsAt } });
  }
  return { message: `Trial extended by ${days} day${days === 1 ? "" : "s"} for ${rows.length} store${rows.length === 1 ? "" : "s"}` };
});

export const changePlan = adminAction(
  "stores.manage",
  z.object({ id: z.string().uuid(), planId: z.string().uuid(), interval: z.enum(["monthly", "yearly"]).default("monthly"), activate: z.boolean().default(false) }),
  async ({ id, planId, interval, activate }, admin) => {
    const store = await db.query.stores.findFirst({ where: eq(stores.id, id) });
    if (!store) fail("Store not found");
    const plan = await db.query.plans.findFirst({ where: eq(plans.id, planId) });
    if (!plan) fail("Plan not found");
    const oldPlan = store.planId ? await db.query.plans.findFirst({ where: eq(plans.id, store.planId) }) : null;

    await db.transaction(async (tx) => {
      const nextStatus = activate && (store.status === "trial" || store.status === "past_due") ? "active" : store.status;
      await tx.update(stores).set({ planId, status: nextStatus }).where(eq(stores.id, id));
      const [sub] = await tx
        .select()
        .from(subscriptions)
        .where(and(eq(subscriptions.storeId, id), ne(subscriptions.status, "cancelled")))
        .orderBy(desc(subscriptions.createdAt))
        .limit(1);
      const periodEnd = new Date(Date.now() + (interval === "yearly" ? 365 : 30) * DAY);
      if (sub) {
        await tx
          .update(subscriptions)
          .set({ planId, interval, ...(activate ? { status: "active" as const, currentPeriodStart: new Date(), currentPeriodEnd: periodEnd } : {}) })
          .where(eq(subscriptions.id, sub.id));
      } else {
        await tx.insert(subscriptions).values({
          storeId: id,
          planId,
          interval,
          status: activate || store.status === "active" ? "active" : "trialing",
          currentPeriodEnd: store.status === "trial" && store.trialEndsAt && !activate ? store.trialEndsAt : periodEnd,
          provider: "manual",
        });
      }
    });
    await audit({ actorId: admin.id, storeId: id, action: "store.plan_changed", target: store.slug, meta: { from: oldPlan?.code ?? null, to: plan.code, interval, activate } });
    return { message: `Plan changed to ${plan.name}` };
  },
);

export const setDomainVerified = adminAction("stores.manage", z.object({ id: z.string().uuid(), verified: z.boolean() }), async ({ id, verified }, admin) => {
  const store = await db.query.stores.findFirst({ where: eq(stores.id, id) });
  if (!store) fail("Store not found");
  if (!store.customDomain) fail("This store has no custom domain");
  await db.update(stores).set({ domainVerified: verified }).where(eq(stores.id, id));
  await audit({ actorId: admin.id, storeId: id, action: verified ? "store.domain_verified" : "store.domain_unverified", target: store.customDomain, meta: { manual: true } });
  return { message: verified ? `${store.customDomain} marked as verified` : `${store.customDomain} marked as unverified` };
});

export const addStoreNote = adminAction("tickets", z.object({ id: z.string().uuid(), note: z.string().trim().min(1, "Note can't be empty").max(2000) }), async ({ id, note }, admin) => {
  const store = await db.query.stores.findFirst({ where: eq(stores.id, id), columns: { id: true, slug: true } });
  if (!store) fail("Store not found");
  await audit({ actorId: admin.id, storeId: id, action: "store.note", target: store.slug, meta: { note } });
  return { message: "Note added" };
});

/** Log in as the store owner (session carries `imp` = admin id) and hand back the dashboard URL. */
export const impersonateOwner = adminAction("stores.impersonate", z.object({ id: z.string().uuid() }), async ({ id }, admin) => {
  const store = await db.query.stores.findFirst({ where: eq(stores.id, id) });
  if (!store) fail("Store not found");
  const owner = await db.query.users.findFirst({ where: eq(users.id, store.ownerId) });
  if (!owner) fail("Owner not found");
  if (owner.disabled) fail("The owner account is disabled — enable it first.");
  if (isAdminRole(owner.role)) fail("Impersonating platform staff accounts is not allowed.");
  await audit({ actorId: admin.id, storeId: id, action: "store.impersonated", target: owner.email, meta: { ownerId: owner.id } });
  await createSession(owner, admin.id);
  (await cookies()).set(ACTIVE_STORE_COOKIE, store.id, { ...cookieOptions(365), httpOnly: false });
  return { message: `Signed in as ${owner.email}`, data: { url: DASHBOARD_URL } };
});
