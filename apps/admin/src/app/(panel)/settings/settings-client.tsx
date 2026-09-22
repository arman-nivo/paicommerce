"use client";

import * as React from "react";
import { Pencil, Plus, RotateCcw, Save, Trash2, UserPlus } from "lucide-react";
import { Button, Dialog, Field, Input, Select, Switch, Textarea } from "@pai/ui";
import { ActionButton, useRunAction } from "@/components/action-client";
import { GATEWAYS, type KnownSettings } from "@/lib/settings";
import { inviteTeamMember, setUserRole } from "../users/actions";
import { TempPasswordDialog } from "../users/user-actions";
import { deleteSetting, saveKnownSetting, saveRawSetting } from "./actions";

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 border-b border-border px-5 py-4 last:border-0 md:grid-cols-[1fr_1.3fr] md:gap-8">
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

export function KnownSettingsForm({ initial }: { initial: KnownSettings }) {
  const [v, setV] = React.useState(initial);
  const { run, pending } = useRunAction();
  const [savingKey, setSavingKey] = React.useState<string | null>(null);
  const save = async <K extends keyof KnownSettings>(key: K) => {
    setSavingKey(key);
    await run(() => saveKnownSetting({ key, value: v[key] }));
    setSavingKey(null);
  };
  const dirty = (k: keyof KnownSettings) => JSON.stringify(v[k]) !== JSON.stringify(initial[k]);
  const SaveBtn = ({ k }: { k: keyof KnownSettings }) => (
    <Button size="sm" variant={dirty(k) ? "default" : "outline"} disabled={!dirty(k)} loading={pending && savingKey === k} onClick={() => save(k)}>
      <Save /> Save
    </Button>
  );

  return (
    <div>
      <Row title="Maintenance banner" desc="Shown at the top of every merchant dashboard page. Use for incidents and planned downtime.">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={v.maintenance_banner.enabled} onChange={(e) => setV({ ...v, maintenance_banner: { ...v.maintenance_banner, enabled: e.target.checked } })} />
            {v.maintenance_banner.enabled ? "Banner is ON" : "Banner is off"}
          </label>
          <Textarea
            value={v.maintenance_banner.message}
            onChange={(e) => setV({ ...v, maintenance_banner: { ...v.maintenance_banner, message: e.target.value } })}
            placeholder="We're upgrading our servers tonight 2–3 AM (BST). Storefronts stay online."
            className="min-h-[64px]"
          />
          <div className="flex gap-2">
            <Select value={v.maintenance_banner.level} onChange={(e) => setV({ ...v, maintenance_banner: { ...v.maintenance_banner, level: e.target.value as "info" } })} className="w-40">
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </Select>
            <SaveBtn k="maintenance_banner" />
          </div>
        </div>
      </Row>
      <Row title="Merchant signups" desc="Turn off to temporarily stop new store registrations on paicommerce.com.">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={v.signup_enabled} onChange={(e) => setV({ ...v, signup_enabled: e.target.checked })} />
            {v.signup_enabled ? "Signups open" : "Signups closed"}
          </label>
          <span className="flex-1" />
          <SaveBtn k="signup_enabled" />
        </div>
      </Row>
      <Row title="Default trial length" desc="Days of free trial for new stores (0 disables trials).">
        <div className="flex items-center gap-2">
          <Input type="number" min={0} max={365} value={v.default_trial_days} onChange={(e) => setV({ ...v, default_trial_days: Math.max(0, parseInt(e.target.value, 10) || 0) })} className="w-28" />
          <span className="text-sm text-muted-foreground">days</span>
          <span className="flex-1" />
          <SaveBtn k="default_trial_days" />
        </div>
      </Row>
      <Row title="Theme revenue share (default)" desc="Developer share for new theme partners. Individual developers can be overridden on their page.">
        <div className="flex items-center gap-2">
          <Input type="number" min={0} max={100} value={v.theme_revenue_share_default} onChange={(e) => setV({ ...v, theme_revenue_share_default: Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)) })} className="w-28" />
          <span className="text-sm text-muted-foreground">% to developer · {100 - v.theme_revenue_share_default}% to PaiCommerce</span>
          <span className="flex-1" />
          <SaveBtn k="theme_revenue_share_default" />
        </div>
      </Row>
      <Row title="Platform billing gateways" desc="Payment methods merchants can use to pay their PaiCommerce subscription.">
        <div className="flex flex-wrap items-center gap-2">
          {GATEWAYS.map((g) => {
            const on = v.platform_billing_gateways.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => setV({ ...v, platform_billing_gateways: on ? v.platform_billing_gateways.filter((x) => x !== g) : [...v.platform_billing_gateways, g] })}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${on ? "border-primary bg-accent text-primary" : "border-border text-muted-foreground hover:border-input"}`}
              >
                {g.replace("_", " ")}
              </button>
            );
          })}
          <span className="flex-1" />
          <SaveBtn k="platform_billing_gateways" />
        </div>
      </Row>
      <Row title="Support contact" desc="Shown to merchants in the dashboard help menu and emails.">
        <div className="space-y-2">
          <Input value={v.support_contact.email} onChange={(e) => setV({ ...v, support_contact: { ...v.support_contact, email: e.target.value } })} placeholder="support@paicommerce.com" />
          <div className="grid grid-cols-2 gap-2">
            <Input value={v.support_contact.phone} onChange={(e) => setV({ ...v, support_contact: { ...v.support_contact, phone: e.target.value } })} placeholder="Phone" />
            <Input value={v.support_contact.whatsapp} onChange={(e) => setV({ ...v, support_contact: { ...v.support_contact, whatsapp: e.target.value } })} placeholder="WhatsApp" />
          </div>
          <div className="flex justify-end">
            <SaveBtn k="support_contact" />
          </div>
        </div>
      </Row>
    </div>
  );
}

export function RawSettingEditor({ initialKey, initialJson, triggerLabel }: { initialKey?: string; initialJson?: string; triggerLabel?: "add" | "edit" }) {
  const [open, setOpen] = React.useState(false);
  const [key, setKey] = React.useState(initialKey ?? "");
  const [json, setJson] = React.useState(initialJson ?? "");
  const { run, pending } = useRunAction();
  let valid = true;
  try {
    JSON.parse(json || "null");
  } catch {
    valid = false;
  }
  return (
    <>
      {triggerLabel === "edit" ? (
        <Button size="icon-sm" variant="ghost" onClick={() => setOpen(true)} aria-label="Edit">
          <Pencil />
        </Button>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus /> Add key
        </Button>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title={initialKey ? `Edit ${initialKey}` : "Add setting"}
        description="Raw JSON value. Well-known keys are validated against their schema."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={pending} disabled={!valid || !key} onClick={async () => (await run(() => saveRawSetting({ key, json }))).ok && setOpen(false)}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Key">
            <Input value={key} onChange={(e) => setKey(e.target.value)} disabled={!!initialKey} className="font-mono" placeholder="feature_flags" />
          </Field>
          <Field label="Value (JSON)" error={!valid ? "Invalid JSON" : undefined}>
            <Textarea value={json} onChange={(e) => setJson(e.target.value)} className="min-h-[220px] font-mono text-xs" placeholder='{"newCheckout": true}' spellCheck={false} />
          </Field>
        </div>
      </Dialog>
    </>
  );
}

export function DeleteSettingButton({ k }: { k: string }) {
  return (
    <ActionButton size="icon-sm" variant="ghost" className="text-red-600" aria-label="Delete" action={() => deleteSetting({ key: k })} confirm={{ title: `Delete ${k}?`, description: "Apps fall back to the built-in default.", confirmLabel: "Delete", danger: true }}>
      {k ? <Trash2 /> : <RotateCcw />}
    </ActionButton>
  );
}

export function InviteTeamMember() {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState<"support" | "admin" | "superadmin">("support");
  const [password, setPassword] = React.useState<string | null>(null);
  const { run, pending } = useRunAction();
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <UserPlus /> Add team member
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add team member"
        description="Existing accounts are promoted; new accounts get a temporary password shown once."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={pending}
              onClick={async () => {
                const r = await run(() => inviteTeamMember({ email, name, role }));
                if (r.ok) {
                  setOpen(false);
                  const pw = (r.data as { password: string | null } | undefined)?.password;
                  if (pw) setPassword(pw);
                  else {
                    setEmail("");
                    setName("");
                  }
                }
              }}
            >
              Add member
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@paicommerce.com" />
          </Field>
          <Field label="Full name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Role" hint="Support: read-only + tickets · Admin: operations · Super admin: everything">
            <Select value={role} onChange={(e) => setRole(e.target.value as "support")}>
              <option value="support">Support</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super admin</option>
            </Select>
          </Field>
        </div>
      </Dialog>
      <TempPasswordDialog
        password={password}
        email={email}
        onClose={() => {
          setPassword(null);
          setEmail("");
          setName("");
        }}
      />
    </>
  );
}

export function TeamRoleSelect({ id, role, isSelf }: { id: string; role: string; isSelf: boolean }) {
  const { run, pending } = useRunAction();
  if (isSelf) return <span className="text-xs text-muted-foreground">You</span>;
  return (
    <Select value={role} disabled={pending} onChange={(e) => run(() => setUserRole({ id, role: e.target.value as "user" }))} className="h-8 w-40 text-xs" aria-label="Role">
      <option value="support">Support</option>
      <option value="admin">Admin</option>
      <option value="superadmin">Super admin</option>
      <option value="user">Remove from team</option>
    </Select>
  );
}
