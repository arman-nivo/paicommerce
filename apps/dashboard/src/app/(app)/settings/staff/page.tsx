import { asc, db, eq, storeMembers, users } from "@pai/db";
import { Header } from "@/components/page";
import { getCtx, getStorePlan } from "@/lib/ctx";
import { StaffManager, type MemberView } from "./_components/staff-manager";

export const metadata = { title: "Staff & permissions" };

const ROLE_ORDER = { owner: 0, admin: 1, staff: 2 } as const;

export default async function StaffPage() {
  const ctx = await getCtx("staff.manage");
  const plan = await getStorePlan(ctx.store);
  const rows = await db
    .select({
      userId: storeMembers.userId,
      role: storeMembers.role,
      permissions: storeMembers.permissions,
      joinedAt: storeMembers.createdAt,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      lastLoginAt: users.lastLoginAt,
    })
    .from(storeMembers)
    .innerJoin(users, eq(users.id, storeMembers.userId))
    .where(eq(storeMembers.storeId, ctx.store.id))
    .orderBy(asc(storeMembers.createdAt));

  const members: MemberView[] = rows
    .map((r) => ({ ...r, joinedAt: r.joinedAt.toISOString(), lastLoginAt: r.lastLoginAt?.toISOString() ?? null }))
    .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]);

  return (
    <div>
      <Header title="Staff & permissions" description="Invite your team and choose exactly what each person can see and do." />
      <StaffManager members={members} limit={plan.limits.staff} planName={plan.name} currentUserId={ctx.user.id} myRole={ctx.member.role} />
    </div>
  );
}
