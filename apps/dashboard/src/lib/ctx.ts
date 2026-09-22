/**
 * Request context helpers for pages and server actions.
 * Every tenant query MUST use `ctx.store.id` from here — never a storeId sent by the client.
 */
import { cookies } from "next/headers";
import { ACTIVE_STORE_COOKIE } from "@pai/core/auth";
import { getCurrentUser, getUserStores, requireStore } from "@pai/core/session";
import { hasPermission, type Permission } from "@pai/core";
import { db, eq, plans, type Plan, type Store } from "@pai/db";
import { ActionError } from "./errors";

export type Ctx = Awaited<ReturnType<typeof requireStore>>;

/** For pages: redirects to /login, /onboarding or / (denied) as needed. */
export function getCtx(permission?: Permission): Promise<Ctx> {
  return requireStore({ permission });
}

/** For server actions / route handlers: throws ActionError instead of redirecting. */
export async function getActionCtx(permission?: Permission): Promise<Ctx> {
  const user = await getCurrentUser();
  if (!user) throw new ActionError("Your session has expired. Please log in again.");
  const jar = await cookies();
  const activeId = jar.get(ACTIVE_STORE_COOKIE)?.value;
  const memberships = await getUserStores(user.id);
  if (!memberships.length) throw new ActionError("Create a store first.");
  const current = memberships.find((m) => m.store.id === activeId) ?? memberships[0]!;
  const member = { role: current.role, permissions: current.permissions };
  if (permission && !hasPermission(member, permission)) throw new ActionError("You don't have permission to do that.");
  return { user, store: current.store, member };
}

export function can(ctx: Pick<Ctx, "member">, p: Permission) {
  return hasPermission(ctx.member, p);
}

const FALLBACK_LIMITS: Plan["limits"] = {
  products: 25,
  ordersPerMonth: 50,
  staff: 1,
  customDomain: false,
  premiumThemes: false,
  transactionFeePct: 2,
  storage: 500,
  apiAccess: false,
  removeBranding: false,
};

/** The store's plan (falls back to the free plan / starter limits). */
export async function getStorePlan(store: Pick<Store, "planId">): Promise<{ plan: Plan | null; limits: Plan["limits"]; code: string; name: string }> {
  let plan: Plan | undefined;
  if (store.planId) plan = await db.query.plans.findFirst({ where: eq(plans.id, store.planId) });
  if (!plan) plan = await db.query.plans.findFirst({ where: eq(plans.code, "free") });
  return { plan: plan ?? null, limits: plan?.limits ?? FALLBACK_LIMITS, code: plan?.code ?? "free", name: plan?.name ?? "Starter" };
}
