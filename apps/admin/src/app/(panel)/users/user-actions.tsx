"use client";

import * as React from "react";
import { KeyRound, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { Button, CopyButton, Dialog, Field, Select } from "@pai/ui";
import { ActionButton, useRunAction } from "@/components/action-client";
import { resetUserPassword, setUserDisabled, setUserRole } from "./actions";

export function TempPasswordDialog({ password, email, onClose }: { password: string | null; email: string; onClose: () => void }) {
  return (
    <Dialog open={!!password} onClose={onClose} size="sm" title="Temporary password" description={`Share this with ${email} over a secure channel. It won't be shown again.`} footer={<Button onClick={onClose}>Done</Button>}>
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted px-3 py-2">
        <code className="font-mono text-base font-semibold tracking-wide">{password}</code>
        <CopyButton value={password ?? ""} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Ask the user to change it after signing in.</p>
    </Dialog>
  );
}

export function UserActions({ user, canManage, canRoles, isSelf }: { user: { id: string; email: string; disabled: boolean; role: string }; canManage: boolean; canRoles: boolean; isSelf: boolean }) {
  const [password, setPassword] = React.useState<string | null>(null);
  const [roleOpen, setRoleOpen] = React.useState(false);
  const [role, setRole] = React.useState(user.role);
  const { run, pending } = useRunAction();
  return (
    <div className="flex flex-wrap gap-2">
      {canManage && !isSelf && (
        <>
          <ActionButton
            size="sm"
            variant="outline"
            action={() => resetUserPassword({ id: user.id })}
            confirm={{ title: "Reset password?", description: "A new temporary password will be generated and the current one will stop working.", confirmLabel: "Reset password" }}
            onDone={(r) => r.ok && setPassword((r.data as { password: string }).password)}
          >
            <KeyRound /> Reset password
          </ActionButton>
          {user.disabled ? (
            <ActionButton size="sm" variant="success" action={() => setUserDisabled({ id: user.id, disabled: false })}>
              <UserCheck /> Enable
            </ActionButton>
          ) : (
            <ActionButton
              size="sm"
              variant="destructive"
              action={() => setUserDisabled({ id: user.id, disabled: true })}
              confirm={{ title: `Disable ${user.email}?`, description: "They'll be signed out everywhere and can't log in until re-enabled.", confirmLabel: "Disable", danger: true }}
            >
              <UserX /> Disable
            </ActionButton>
          )}
        </>
      )}
      {canRoles && !isSelf && (
        <Button size="sm" variant="outline" onClick={() => setRoleOpen(true)}>
          <ShieldCheck /> Change role
        </Button>
      )}
      <TempPasswordDialog password={password} email={user.email} onClose={() => setPassword(null)} />
      <Dialog
        open={roleOpen}
        onClose={() => setRoleOpen(false)}
        size="sm"
        title="Change platform role"
        description="Staff roles grant access to this admin panel."
        footer={
          <>
            <Button variant="outline" onClick={() => setRoleOpen(false)}>
              Cancel
            </Button>
            <Button loading={pending} onClick={async () => (await run(() => setUserRole({ id: user.id, role: role as "user" }))).ok && setRoleOpen(false)}>
              Save role
            </Button>
          </>
        }
      >
        <Field label="Role" hint="Support: read-only + tickets · Admin: day-to-day operations · Super admin: everything incl. plans, settings & team">
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User (merchant / developer)</option>
            <option value="support">Support</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super admin</option>
          </Select>
        </Field>
      </Dialog>
    </div>
  );
}
