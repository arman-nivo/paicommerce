"use server";

import { z } from "zod";
import { hashPassword } from "@pai/core/auth";
import { db, eq, sql, users } from "@pai/db";
import { adminAction, fail } from "@/lib/action";
import { audit } from "@/lib/audit";
import { isAdminRole } from "@/lib/roles";

function tempPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(14);
  crypto.getRandomValues(bytes);
  const core = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `${core.slice(0, 4)}-${core.slice(4, 9)}-${core.slice(9)}`;
}

async function loadTarget(id: string, actor: { id: string; role: string }) {
  const u = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!u) fail("User not found");
  if (isAdminRole(u.role) && actor.role !== "superadmin" && u.id !== actor.id) fail("Only super admins can manage staff accounts.");
  return u;
}

export const setUserDisabled = adminAction("users.manage", z.object({ id: z.string().uuid(), disabled: z.boolean() }), async ({ id, disabled }, admin) => {
  if (id === admin.id) fail("You can't disable your own account.");
  const u = await loadTarget(id, admin);
  await db.update(users).set({ disabled }).where(eq(users.id, id));
  await audit({ actorId: admin.id, action: disabled ? "user.disabled" : "user.enabled", target: u.email, meta: { userId: id } });
  return { message: disabled ? `${u.email} disabled — active sessions are rejected immediately` : `${u.email} enabled` };
});

export const resetUserPassword = adminAction("users.manage", z.object({ id: z.string().uuid() }), async ({ id }, admin) => {
  const u = await loadTarget(id, admin);
  const password = tempPassword();
  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, id));
  await audit({ actorId: admin.id, action: "user.password_reset", target: u.email, meta: { userId: id } });
  return { message: "Temporary password generated", data: { password } };
});

export const setUserRole = adminAction(
  "users.roles",
  z.object({ id: z.string().uuid(), role: z.enum(["user", "support", "admin", "superadmin"]) }),
  async ({ id, role }, admin) => {
    if (id === admin.id) fail("You can't change your own role.");
    const u = await db.query.users.findFirst({ where: eq(users.id, id) });
    if (!u) fail("User not found");
    if (u.role === role) return { message: "Role unchanged" };
    await db.update(users).set({ role }).where(eq(users.id, id));
    await audit({ actorId: admin.id, action: "user.role_changed", target: u.email, meta: { userId: id, from: u.role, to: role } });
    return { message: `${u.email} is now ${role === "user" ? "a regular user" : role}` };
  },
);

export const inviteTeamMember = adminAction(
  "users.roles",
  z.object({ email: z.string().trim().toLowerCase().email(), name: z.string().trim().min(2).max(80), role: z.enum(["support", "admin", "superadmin"]) }),
  async ({ email, name, role }, admin) => {
    const existing = await db.query.users.findFirst({ where: eq(sql`lower(${users.email})`, email) });
    if (existing) {
      if (existing.role === role) fail(`${email} already has the ${role} role.`);
      await db.update(users).set({ role }).where(eq(users.id, existing.id));
      await audit({ actorId: admin.id, action: "user.role_changed", target: email, meta: { userId: existing.id, from: existing.role, to: role } });
      return { message: `${email} promoted to ${role}`, data: { password: null as string | null } };
    }
    const password = tempPassword();
    const [u] = await db.insert(users).values({ email, name, role, passwordHash: await hashPassword(password) }).returning({ id: users.id });
    await audit({ actorId: admin.id, action: "user.invited", target: email, meta: { userId: u!.id, role } });
    return { message: `Account created for ${email}`, data: { password: password as string | null } };
  },
);
