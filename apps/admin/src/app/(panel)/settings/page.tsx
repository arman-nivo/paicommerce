import Link from "next/link";
import { Avatar, Badge, Card, CardHeader, PageHeader } from "@pai/ui";
import { asc, db, inArray, platformSettings, users } from "@pai/db";
import { DataTable, EmptyRow, TD, TH, THead, TR } from "@/components/table";
import { requireAdminPage } from "@/lib/auth";
import { fmtDateTime, timeAgo } from "@/lib/format";
import { ADMIN_ROLES } from "@/lib/roles";
import { KNOWN_KEYS, SETTING_DEFAULTS, SETTING_SCHEMAS, type KnownKey, type KnownSettings } from "@/lib/settings";
import { DeleteSettingButton, InviteTeamMember, KnownSettingsForm, RawSettingEditor, TeamRoleSelect } from "./settings-client";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const admin = await requireAdminPage("settings.manage");
  const [rows, team] = await Promise.all([
    db.select().from(platformSettings).orderBy(asc(platformSettings.key)),
    db.select().from(users).where(inArray(users.role, ADMIN_ROLES)).orderBy(asc(users.role), asc(users.name)),
  ]);
  const stored = new Map(rows.map((r) => [r.key, r.value]));
  const known = Object.fromEntries(
    KNOWN_KEYS.map((k) => {
      const parsed = SETTING_SCHEMAS[k].safeParse(stored.get(k));
      return [k, parsed.success ? parsed.data : SETTING_DEFAULTS[k]];
    }),
  ) as KnownSettings;

  return (
    <div className="space-y-5">
      <PageHeader title="Platform settings" description="Global configuration read by the website, merchant dashboard and billing" />
      <Card>
        <CardHeader title="General" description="Changes take effect immediately and are audit-logged." />
        <KnownSettingsForm initial={known} />
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="PaiCommerce team" description="Accounts with access to this admin panel" action={<InviteTeamMember />} />
        <DataTable maxHeight="none">
          <THead>
            <TH>Member</TH>
            <TH>Role</TH>
            <TH>Status</TH>
            <TH>Last login</TH>
          </THead>
          <tbody>
            {team.map((u) => (
              <TR key={u.id}>
                <TD>
                  <Link href={`/users/${u.id}`} className="flex items-center gap-2.5">
                    <Avatar name={u.name} src={u.avatarUrl} size={28} />
                    <span>
                      <span className="block font-medium hover:underline">{u.name}</span>
                      <span className="block text-xs text-muted-foreground">{u.email}</span>
                    </span>
                  </Link>
                </TD>
                <TD>
                  <TeamRoleSelect id={u.id} role={u.role} isSelf={u.id === admin.id} />
                </TD>
                <TD>{u.disabled ? <Badge tone="red" dot>Disabled</Badge> : <Badge tone="green" dot>Active</Badge>}</TD>
                <TD className="text-xs">{u.lastLoginAt ? timeAgo(u.lastLoginAt) : "Never"}</TD>
              </TR>
            ))}
          </tbody>
        </DataTable>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="All keys" description="Raw platform_settings rows (advanced)" action={<RawSettingEditor triggerLabel="add" />} />
        <DataTable maxHeight="none">
          <THead>
            <TH>Key</TH>
            <TH>Value</TH>
            <TH>Updated</TH>
            <TH className="w-20" />
          </THead>
          <tbody>
            {rows.length === 0 && <EmptyRow colSpan={4} title="No stored settings" description="Everything uses built-in defaults." />}
            {rows.map((r) => (
              <TR key={r.key}>
                <TD>
                  <code className="text-xs font-medium">{r.key}</code>
                  {(KNOWN_KEYS as string[]).includes(r.key) && <Badge className="ml-2">known</Badge>}
                </TD>
                <TD className="max-w-[520px] truncate font-mono text-[11px] text-muted-foreground">{JSON.stringify(r.value)}</TD>
                <TD className="text-xs text-muted-foreground">{fmtDateTime(r.updatedAt)}</TD>
                <TD>
                  <div className="flex">
                    <RawSettingEditor triggerLabel="edit" initialKey={r.key} initialJson={JSON.stringify(r.value, null, 2)} />
                    <DeleteSettingButton k={r.key} />
                  </div>
                </TD>
              </TR>
            ))}
          </tbody>
        </DataTable>
      </Card>
      <p className="text-xs text-muted-foreground">Known keys: {(KNOWN_KEYS as KnownKey[]).join(", ")}.</p>
    </div>
  );
}
