import { cache } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@pai/core/session";
import type { User } from "@pai/db";
import { can, isAdminRole, type AdminRole, type Capability } from "./roles";

export type AdminUser = User & { role: AdminRole };

/** Current admin (memoised per request) or null. Impersonation sessions never count as admin. */
export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  const user = await getCurrentUser();
  if (!user || user.impersonatorId || !isAdminRole(user.role)) return null;
  return user as AdminUser;
});

/** For pages/layouts: redirect to /login when not an admin, or to / when lacking a capability. */
export async function requireAdminPage(cap: Capability = "read"): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  if (!can(admin.role, cap)) redirect(`/?denied=${encodeURIComponent(cap)}`);
  return admin;
}

export class ActionError extends Error {}

/** For server actions / route handlers: throws instead of redirecting. */
export async function assertAdmin(cap: Capability = "read"): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) throw new ActionError("Your session has expired. Please sign in again.");
  if (!can(admin.role, cap)) throw new ActionError("You don't have permission to do that.");
  return admin;
}
