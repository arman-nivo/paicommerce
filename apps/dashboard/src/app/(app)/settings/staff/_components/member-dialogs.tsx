"use client";
import * as React from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";
import type { Permission } from "@pai/core";
import { Button, CopyButton, Dialog, Field, Input, cn } from "@pai/ui";
import { run } from "@/lib/client";
import { inviteMember, updateMember } from "../actions";
import { PermissionPicker } from "./permission-picker";
import type { MemberView } from "./staff-manager";

type Role = "admin" | "staff";
const DEFAULT_PERMS: Permission[] = ["orders.view", "orders.manage", "customers.view", "products.view"];

function RolePicker({ value, onChange, canAdmin }: { value: Role; onChange: (r: Role) => void; canAdmin: boolean }) {
  const opts: { value: Role; label: string; hint: string; disabled?: boolean }[] = [
    { value: "staff", label: "Staff", hint: "Only the permissions you choose" },
    { value: "admin", label: "Admin", hint: canAdmin ? "Full access except billing ownership" : "Only the owner can add admins", disabled: !canAdmin },
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {opts.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
            value === o.value ? "border-primary bg-accent ring-1 ring-primary" : "border-border hover:border-primary/40",
          )}
        >
          <span className="block text-sm font-medium">{o.label}</span>
          <span className="block text-xs text-muted-foreground">{o.hint}</span>
        </button>
      ))}
    </div>
  );
}

type Invited = { email: string; name: string; tempPassword: string | null; existingAccount: boolean; loginUrl: string };

export function InviteDialog({ open, onClose, canInviteAdmin }: { open: boolean; onClose: () => void; canInviteAdmin: boolean }) {
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState<Role>("staff");
  const [perms, setPerms] = React.useState<Permission[]>(DEFAULT_PERMS);
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState<Invited | null>(null);

  const reset = () => {
    setEmail("");
    setName("");
    setRole("staff");
    setPerms(DEFAULT_PERMS);
    setDone(null);
  };
  const close = () => {
    onClose();
    setTimeout(reset, 200);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await run(inviteMember({ email, name, role, permissions: role === "admin" ? [] : perms }));
    setSaving(false);
    if (res) setDone(res);
  }

  if (done) {
    const message = `Hi ${done.name}, you've been added to our store on PaiCommerce. Log in at ${done.loginUrl} with ${done.email}${done.tempPassword ? ` and temporary password ${done.tempPassword} (please change it after logging in)` : ""}.`;
    return (
      <Dialog open={open} onClose={close} title="Team member added" footer={<Button onClick={close}>Done</Button>}>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            <p className="text-sm">
              <span className="font-medium">{done.name}</span> ({done.email}) can now access your store.
              {done.existingAccount && " They already have a PaiCommerce account, so they can log in with their existing password."}
            </p>
          </div>
          {done.tempPassword && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
              <p className="flex items-center gap-2 text-sm font-medium text-amber-900 dark:text-amber-200">
                <TriangleAlert className="size-4" /> Temporary password — shown only once
              </p>
              <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-card px-3 py-2 font-mono text-sm">
                <span className="break-all">{done.tempPassword}</span>
                <CopyButton value={done.tempPassword} />
              </div>
              <p className="mt-2 text-xs text-amber-900/80 dark:text-amber-200/80">Share it privately. They should change it after first login.</p>
            </div>
          )}
          <div className="rounded-xl bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-medium text-foreground">Message to send (WhatsApp / SMS)</span>
              <CopyButton value={message} />
            </div>
            {message}
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Invite a team member"
      description="They'll get access to this store with the role you choose."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form="invite-form" loading={saving}>
            Add to team
          </Button>
        </>
      }
    >
      <form id="invite-form" onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahim Uddin" required maxLength={100} autoFocus />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rahim@example.com" required maxLength={200} />
          </Field>
        </div>
        <Field label="Role">
          <RolePicker value={role} onChange={setRole} canAdmin={canInviteAdmin} />
        </Field>
        {role === "staff" && <PermissionPicker value={perms} onChange={setPerms} />}
      </form>
    </Dialog>
  );
}

export function EditMemberDialog({ member, onClose, canSetAdmin }: { member: MemberView | null; onClose: () => void; canSetAdmin: boolean }) {
  const [role, setRole] = React.useState<Role>("staff");
  const [perms, setPerms] = React.useState<Permission[]>([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!member) return;
    setRole(member.role === "admin" ? "admin" : "staff");
    setPerms(member.permissions as Permission[]);
  }, [member]);

  async function save() {
    if (!member) return;
    setSaving(true);
    const res = await run(updateMember({ userId: member.userId, role, permissions: role === "admin" ? [] : perms }), { success: "Access updated" });
    setSaving(false);
    if (res) onClose();
  }

  return (
    <Dialog
      open={!!member}
      onClose={onClose}
      title={member ? `Edit access — ${member.name}` : ""}
      description={member?.email}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Role">
          <RolePicker value={role} onChange={setRole} canAdmin={canSetAdmin} />
        </Field>
        {role === "staff" && <PermissionPicker value={perms} onChange={setPerms} />}
      </div>
    </Dialog>
  );
}
