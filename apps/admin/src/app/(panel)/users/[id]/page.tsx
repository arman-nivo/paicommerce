import Link from "next/link";
import { notFound } from "next/navigation";
import { Code2 } from "lucide-react";
import { Avatar, Badge, Card, CardBody, CardHeader } from "@pai/ui";
import { auditLogs, db, desc, developers, eq, or, storeMembers, stores, supportTickets, users, and } from "@pai/db";
import { RoleBadge, StatusBadge, label } from "@/components/badges";
import { BackLink, DL } from "@/components/link-tabs";
import { DataTable, EmptyRow, TD, TH, THead, TR } from "@/components/table";
import { requireAdminPage } from "@/lib/auth";
import { describeAction } from "@/lib/audit-labels";
import { bdt, fmtDate, fmtDateTime, timeAgo } from "@/lib/format";
import { can } from "@/lib/roles";
import { UserActions } from "../user-actions";

export const metadata = { title: "User" };

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminPage();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) notFound();
  const [memberships, dev, activity, tickets] = await Promise.all([
    db
      .select({ role: storeMembers.role, store: stores })
      .from(storeMembers)
      .innerJoin(stores, eq(stores.id, storeMembers.storeId))
      .where(eq(storeMembers.userId, id))
      .orderBy(desc(stores.createdAt)),
    db.query.developers.findFirst({ where: eq(developers.userId, id) }),
    db
      .select({ a: auditLogs, actorName: users.name })
      .from(auditLogs)
      .leftJoin(users, eq(users.id, auditLogs.actorId))
      .where(or(eq(auditLogs.actorId, id), and(eq(auditLogs.target, user.email))))
      .orderBy(desc(auditLogs.createdAt))
      .limit(25),
    db.select().from(supportTickets).where(eq(supportTickets.userId, id)).orderBy(desc(supportTickets.createdAt)).limit(10),
  ]);
  const isStaffTarget = user.role !== "user";
  const canManage = can(admin.role, "users.manage") && (!isStaffTarget || admin.role === "superadmin");

  return (
    <div className="space-y-5">
      <div>
        <BackLink href="/users">Users</BackLink>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} src={user.avatarUrl} size={48} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight">{user.name}</h1>
                <RoleBadge role={user.role} />
                {user.disabled ? <Badge tone="red" dot>Disabled</Badge> : <Badge tone="green" dot>Active</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                {user.email} · joined {fmtDate(user.createdAt)}
              </p>
            </div>
          </div>
          <UserActions user={{ id: user.id, email: user.email, disabled: user.disabled, role: user.role }} canManage={canManage} canRoles={can(admin.role, "users.roles")} isSelf={user.id === admin.id} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="Account" />
          <CardBody>
            <DL
              items={[
                ["Email", user.email],
                ["Email verified", user.emailVerifiedAt ? fmtDate(user.emailVerifiedAt) : "No"],
                ["Phone", user.phone ?? "—"],
                ["Role", <RoleBadge key="r" role={user.role} />],
                ["Password", user.passwordHash ? "Set" : "Not set (social / invite)"],
                ["Last login", user.lastLoginAt ? `${timeAgo(user.lastLoginAt)}` : "Never"],
                ["Updated", fmtDateTime(user.updatedAt)],
                ["User ID", <code key="id" className="text-[11px]">{user.id}</code>],
              ]}
            />
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Stores" description="Stores this user owns or is a member of" />
          <DataTable maxHeight="none">
            <THead>
              <TH>Store</TH>
              <TH>Membership</TH>
              <TH>Status</TH>
              <TH>Created</TH>
            </THead>
            <tbody>
              {memberships.length === 0 && <EmptyRow colSpan={4} title="No stores" description="This user isn't linked to any store." />}
              {memberships.map(({ role, store }) => (
                <TR key={store.id}>
                  <TD>
                    <Link href={`/stores/${store.id}`} className="font-medium hover:underline">
                      {store.name}
                    </Link>
                    <span className="ml-2 text-xs text-muted-foreground">{store.slug}</span>
                  </TD>
                  <TD>
                    <Badge tone={role === "owner" ? "brand" : "gray"}>{label(role)}</Badge>
                  </TD>
                  <TD>
                    <StatusBadge status={store.status} />
                  </TD>
                  <TD className="text-xs text-muted-foreground">{fmtDate(store.createdAt)}</TD>
                </TR>
              ))}
            </tbody>
          </DataTable>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="Developer profile" action={dev && <Link href={`/developers/${dev.id}`} className="text-xs text-primary hover:underline">Open</Link>} />
          <CardBody>
            {dev ? (
              <DL
                items={[
                  ["Display name", <span key="n" className="inline-flex items-center gap-1"><Code2 className="size-3.5" /> {dev.displayName}</span>],
                  ["Verified", dev.verified ? "Yes" : "No"],
                  ["Revenue share", `${dev.revenueSharePct}%`],
                  ["Balance", bdt(dev.balance)],
                  ["Lifetime earnings", bdt(dev.lifetimeEarnings)],
                ]}
              />
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">Not a theme developer</p>
            )}
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Support tickets" />
          {tickets.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No tickets</p>
          ) : (
            <ul className="divide-y divide-border">
              {tickets.map((t) => (
                <li key={t.id}>
                  <Link href={`/tickets/${t.id}`} className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-muted/40">
                    <span className="flex-1 truncate font-medium">{t.subject}</span>
                    <StatusBadge status={t.priority} />
                    <StatusBadge status={t.status} />
                    <span className="w-24 text-right text-xs text-muted-foreground">{timeAgo(t.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Activity" description="Actions by or about this user" />
        <DataTable maxHeight="420px">
          <THead>
            <TH>When</TH>
            <TH>Actor</TH>
            <TH>Action</TH>
            <TH>Target</TH>
          </THead>
          <tbody>
            {activity.length === 0 && <EmptyRow colSpan={4} title="No activity" description="Nothing logged yet." />}
            {activity.map(({ a, actorName }) => (
              <TR key={a.id}>
                <TD className="text-xs text-muted-foreground">{fmtDateTime(a.createdAt)}</TD>
                <TD className="text-sm">{actorName ?? "System"}</TD>
                <TD className="text-sm">{describeAction(a.action)}</TD>
                <TD className="text-xs text-muted-foreground">{a.target ?? "—"}</TD>
              </TR>
            ))}
          </tbody>
        </DataTable>
      </Card>
    </div>
  );
}
