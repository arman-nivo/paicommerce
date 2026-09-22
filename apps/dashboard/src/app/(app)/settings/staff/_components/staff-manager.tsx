"use client";
import * as React from "react";
import Link from "next/link";
import { Crown, Ellipsis, Pencil, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { Avatar, Badge, Button, Card, CardHeader, cn, Dropdown, DropdownItem, useConfirm } from "@pai/ui";
import { RelativeTime } from "@/components/time";
import { run } from "@/lib/client";
import { formatDate } from "@/lib/format";
import { removeMember } from "../actions";
import { permissionSummary } from "./permission-picker";
import { InviteDialog, EditMemberDialog } from "./member-dialogs";

export type MemberView = {
  userId: string;
  role: "owner" | "admin" | "staff";
  permissions: string[];
  joinedAt: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  lastLoginAt: string | null;
};

const ROLE_BADGE = {
  owner: { tone: "brand", label: "Owner" },
  admin: { tone: "purple", label: "Admin" },
  staff: { tone: "gray", label: "Staff" },
} as const;

export function StaffManager({ members, limit, planName, currentUserId, myRole }: { members: MemberView[]; limit: number | null; planName: string; currentUserId: string; myRole: MemberView["role"] }) {
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MemberView | null>(null);
  const { confirm, dialog } = useConfirm();
  const used = members.length;
  const full = limit != null && used >= limit;
  const pctUsed = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  const canManage = (m: MemberView) => m.role !== "owner" && m.userId !== currentUserId && (m.role !== "admin" || myRole === "owner");

  async function remove(m: MemberView) {
    const ok = await confirm({
      title: `Remove ${m.name}?`,
      description: `${m.name} will immediately lose access to this store. Their account stays, so you can invite them again later.`,
      confirmLabel: "Remove",
      danger: true,
    });
    if (!ok) return;
    await run(removeMember({ userId: m.userId }), { success: `${m.name} removed` });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {dialog}
      <div className="space-y-5 lg:col-span-2">
        <Card>
          <CardHeader
            title="Team members"
            description={`${used} ${used === 1 ? "person has" : "people have"} access to this store`}
            action={
              <Button size="sm" onClick={() => setInviteOpen(true)} disabled={full}>
                <UserPlus /> Invite
              </Button>
            }
          />
          <ul className="divide-y divide-border">
            {members.map((m) => {
              const badge = ROLE_BADGE[m.role];
              const manageable = canManage(m);
              return (
                <li key={m.userId} className="flex items-start gap-3 px-5 py-4 sm:items-center">
                  <Avatar name={m.name} src={m.avatarUrl} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium">{m.name}</span>
                      {m.userId === currentUserId && <span className="text-xs text-muted-foreground">(you)</span>}
                      <Badge tone={badge.tone}>
                        {m.role === "owner" && <Crown className="size-3" />}
                        {badge.label}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground sm:hidden">{permissionSummary(m.role, m.permissions)}</p>
                  </div>
                  <div className="hidden w-48 shrink-0 text-xs sm:block">
                    <p className="truncate text-foreground/80">{permissionSummary(m.role, m.permissions)}</p>
                    <p className="mt-0.5 text-muted-foreground">
                      Joined {formatDate(m.joinedAt)}
                      {m.lastLoginAt ? (
                        <>
                          {" · active "}
                          <RelativeTime date={m.lastLoginAt} />
                        </>
                      ) : (
                        " · never logged in"
                      )}
                    </p>
                  </div>
                  <div className="w-9 shrink-0">
                    {manageable && (
                      <Dropdown
                        trigger={
                          <Button size="icon-sm" variant="ghost" aria-label={`Actions for ${m.name}`}>
                            <Ellipsis />
                          </Button>
                        }
                      >
                        <DropdownItem onClick={() => setEditing(m)}>
                          <Pencil /> Edit access
                        </DropdownItem>
                        <DropdownItem danger onClick={() => remove(m)}>
                          <Trash2 /> Remove from store
                        </DropdownItem>
                      </Dropdown>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="space-y-5">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
              <Users className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Seats</p>
              <p className="text-xs text-muted-foreground">{planName} plan</p>
            </div>
          </div>
          <p className="mt-4 font-display text-2xl font-semibold">
            {used} <span className="text-base font-normal text-muted-foreground">/ {limit == null ? "Unlimited" : limit} seats</span>
          </p>
          {limit != null && (
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full transition-all", full ? "bg-amber-500" : "bg-primary")} style={{ width: `${pctUsed}%` }} />
            </div>
          )}
          <p className="mt-2 text-xs text-muted-foreground">The owner counts as one seat.</p>
          {full && (
            <Link href="/settings/billing" className="mt-4 block">
              <Button className="w-full" variant="outline">
                Upgrade for more seats
              </Button>
            </Link>
          )}
        </Card>
        <Card className="space-y-3 p-5 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="size-4 text-primary" /> Roles explained
          </p>
          <div>
            <p className="font-medium">Owner</p>
            <p className="text-xs text-muted-foreground">Everything, including billing, closing the store and managing admins.</p>
          </div>
          <div>
            <p className="font-medium">Admin</p>
            <p className="text-xs text-muted-foreground">Full access to the store. Only the owner can add or remove admins.</p>
          </div>
          <div>
            <p className="font-medium">Staff</p>
            <p className="text-xs text-muted-foreground">Only what you tick — e.g. an order processor who can confirm and ship orders but can&apos;t see your settings.</p>
          </div>
        </Card>
      </div>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} canInviteAdmin={myRole === "owner"} />
      <EditMemberDialog member={editing} onClose={() => setEditing(null)} canSetAdmin={myRole === "owner"} />
    </div>
  );
}
