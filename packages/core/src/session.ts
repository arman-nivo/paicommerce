/**
 * Server-only session helpers for Next.js apps (dashboard, admin, web).
 * Sessions are stateless JWTs in an httpOnly cookie shared across *.paicommerce.com.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, db, eq, storeMembers, stores, users, type Store, type User } from "@pai/db";
import { ACTIVE_STORE_COOKIE, cookieOptions, SESSION_COOKIE, signToken, verifyToken, type SessionPayload } from "./auth";
import { hasPermission, type Permission } from "./permissions";

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const payload = await verifyToken(jar.get(SESSION_COOKIE)?.value);
  return payload?.kind === "user" ? payload : null;
}

export async function createSession(user: Pick<User, "id" | "role">, imp?: string) {
  const token = await signToken({ sub: user.id, role: user.role, kind: "user", ...(imp ? { imp } : {}) });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, cookieOptions());
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
}

export async function destroySession() {
  const jar = await cookies();
  const opts = cookieOptions(0);
  jar.set(SESSION_COOKIE, "", { ...opts, maxAge: 0 });
  jar.set(ACTIVE_STORE_COOKIE, "", { ...opts, maxAge: 0 });
}

export async function getCurrentUser(): Promise<(User & { impersonatorId?: string }) | null> {
  const s = await getSession();
  if (!s) return null;
  const user = await db.query.users.findFirst({ where: eq(users.id, s.sub) });
  if (!user || user.disabled) return null;
  return { ...user, impersonatorId: s.imp };
}

export async function requireUser(loginPath = "/login"): Promise<User & { impersonatorId?: string }> {
  const user = await getCurrentUser();
  if (!user) redirect(loginPath);
  return user;
}

export async function requireAdmin(loginPath = "/login"): Promise<User> {
  const user = await getCurrentUser();
  if (!user || !["admin", "superadmin", "support"].includes(user.role)) redirect(loginPath);
  return user;
}

export type StoreMembership = { role: "owner" | "admin" | "staff"; permissions: string[] };

/** All stores the user can access. */
export async function getUserStores(userId: string) {
  const rows = await db
    .select({ store: stores, role: storeMembers.role, permissions: storeMembers.permissions })
    .from(storeMembers)
    .innerJoin(stores, eq(stores.id, storeMembers.storeId))
    .where(eq(storeMembers.userId, userId));
  return rows;
}

export async function setActiveStore(storeId: string) {
  const jar = await cookies();
  jar.set(ACTIVE_STORE_COOKIE, storeId, { ...cookieOptions(365), httpOnly: false });
}

/**
 * Resolve the merchant's active store (cookie → first membership).
 * Redirects to onboarding when the user has no store yet.
 */
export async function requireStore(opts: { permission?: Permission; onboardingPath?: string; loginPath?: string } = {}): Promise<{
  user: User & { impersonatorId?: string };
  store: Store;
  member: StoreMembership;
}> {
  const user = await requireUser(opts.loginPath);
  const jar = await cookies();
  const activeId = jar.get(ACTIVE_STORE_COOKIE)?.value;
  const memberships = await getUserStores(user.id);
  if (!memberships.length) redirect(opts.onboardingPath ?? "/onboarding");
  const current = memberships.find((m) => m.store.id === activeId) ?? memberships[0]!;
  const member = { role: current.role, permissions: current.permissions };
  if (opts.permission && !hasPermission(member, opts.permission)) redirect("/?denied=" + opts.permission);
  return { user, store: current.store, member };
}

export async function getMembership(userId: string, storeId: string) {
  return db.query.storeMembers.findFirst({ where: and(eq(storeMembers.userId, userId), eq(storeMembers.storeId, storeId)) });
}
