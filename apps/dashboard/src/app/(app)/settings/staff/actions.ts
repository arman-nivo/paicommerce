"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ALL_PERMISSIONS, DASHBOARD_URL, randomToken, type Permission } from "@pai/core";
import { hashPassword } from "@pai/core/auth";
import { and, count, db, eq, sql, storeMembers, users } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { getStorePlan, type Ctx } from "@/lib/ctx";
import { ActionError } from "@/lib/errors";

const permissionList = z
  .array(z.string())
  .max(50)
  .transform((a) => [...new Set(a)].filter((p): p is Permission => (ALL_PERMISSIONS as string[]).includes(p)));

const role = z.enum(["admin", "staff"]);

function cleanPermissions(r: "admin" | "staff", perms: Permission[]) {
  if (r === "admin") return [];
  if (!perms.length) throw new ActionError("Pick at least one permission for this staff member.");
  return perms;
}

async function getMember(ctx: Ctx, userId: string) {
  const m = await db.query.storeMembers.findFirst({ where: and(eq(storeMembers.storeId, ctx.store.id), eq(storeMembers.userId, userId)) });
  if (!m) throw new ActionError("That team member no longer exists.");
  return m;
}

export const inviteMember = action(
  z.object({
    email: z.email("Enter a valid email").max(200),
    name: z.string().trim().min(1, "Name is required").max(100),
    role,
    permissions: permissionList,
  }),
  { permission: "staff.manage" },
  async (input, ctx) => {
    if (input.role === "admin" && ctx.member.role !== "owner") throw new ActionError("Only the store owner can add admins.");
    const permissions = cleanPermissions(input.role, input.permissions);
    const email = input.email.trim().toLowerCase();

    const { limits, name: planName } = await getStorePlan(ctx.store);
    const [{ n } = { n: 0 }] = await db.select({ n: count() }).from(storeMembers).where(eq(storeMembers.storeId, ctx.store.id));
    if (limits.staff != null && n >= limits.staff) {
      throw new ActionError(`Your ${planName} plan includes ${limits.staff} seat${limits.staff === 1 ? "" : "s"}. Upgrade your plan to add more people.`);
    }

    let user = await db.query.users.findFirst({ where: sql`lower(${users.email}) = ${email}` });
    let tempPassword: string | null = null;
    if (user) {
      const existing = await db.query.storeMembers.findFirst({ where: and(eq(storeMembers.storeId, ctx.store.id), eq(storeMembers.userId, user.id)) });
      if (existing) throw new ActionError(`${user.email} is already on your team.`);
      if (user.disabled) throw new ActionError("That account is disabled. Please contact support.");
    } else {
      tempPassword = randomToken(5);
      [user] = await db.insert(users).values({ email, name: input.name, passwordHash: await hashPassword(tempPassword) }).returning();
    }
    if (!user) throw new ActionError("Could not create the account. Please try again.");

    await db.insert(storeMembers).values({ storeId: ctx.store.id, userId: user.id, role: input.role, permissions });

    // Email delivery stub — replace with the transactional mailer when it lands.
    console.log(
      `[invite-email] to=${email} store="${ctx.store.name}" role=${input.role} login=${DASHBOARD_URL}/login` + (tempPassword ? ` tempPassword=${tempPassword}` : " (existing account)"),
    );

    await audit(ctx, "staff.invite", user.id, { email, role: input.role, permissions });
    revalidatePath("/settings/staff");
    return { email, name: user.name, tempPassword, existingAccount: !tempPassword, loginUrl: `${DASHBOARD_URL}/login` };
  },
);

export const updateMember = action(
  z.object({ userId: z.uuid(), role, permissions: permissionList }),
  { permission: "staff.manage" },
  async (input, ctx) => {
    if (input.userId === ctx.user.id) throw new ActionError("You can't change your own role.");
    const m = await getMember(ctx, input.userId);
    if (m.role === "owner") throw new ActionError("The store owner's access can't be changed.");
    if ((m.role === "admin" || input.role === "admin") && ctx.member.role !== "owner") throw new ActionError("Only the store owner can manage admins.");
    const permissions = cleanPermissions(input.role, input.permissions);
    await db
      .update(storeMembers)
      .set({ role: input.role, permissions })
      .where(and(eq(storeMembers.storeId, ctx.store.id), eq(storeMembers.userId, input.userId)));
    await audit(ctx, "staff.update", input.userId, { role: input.role, permissions });
    revalidatePath("/settings/staff");
    return { ok: true };
  },
);

export const removeMember = action(z.object({ userId: z.uuid() }), { permission: "staff.manage" }, async (input, ctx) => {
  if (input.userId === ctx.user.id) throw new ActionError("You can't remove yourself.");
  const m = await getMember(ctx, input.userId);
  if (m.role === "owner") throw new ActionError("The store owner can't be removed.");
  if (m.role === "admin" && ctx.member.role !== "owner") throw new ActionError("Only the store owner can remove admins.");
  await db.delete(storeMembers).where(and(eq(storeMembers.storeId, ctx.store.id), eq(storeMembers.userId, input.userId)));
  await audit(ctx, "staff.remove", input.userId);
  revalidatePath("/settings/staff");
  return { ok: true };
});
