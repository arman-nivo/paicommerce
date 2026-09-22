"use client";
import * as React from "react";
import { KeyRound, Plus } from "lucide-react";
import { Badge, Button, Card, CardHeader, Checkbox, Dialog, EmptyState, Field, Input, Table, TBody, TD, TH, THead, TR, useConfirm } from "@pai/ui";
import { RelativeTime } from "@/components/time";
import { run } from "@/lib/client";
import { formatDate } from "@/lib/format";
import { createApiKey, revokeApiKey } from "../actions";
import { API_SCOPES } from "../constants";
import { SecretReveal } from "./secret-reveal";

export type KeyView = { id: string; name: string; prefix: string; scopes: string[]; createdAt: string; lastUsedAt: string | null; revokedAt: string | null };

export function ApiKeys({ keys, locked }: { keys: KeyView[]; locked: boolean }) {
  const [open, setOpen] = React.useState(false);
  const { confirm, dialog } = useConfirm();

  async function revoke(k: KeyView) {
    const ok = await confirm({
      title: `Revoke "${k.name}"?`,
      description: "Any app using this key will stop working immediately. This can't be undone.",
      confirmLabel: "Revoke key",
      danger: true,
    });
    if (ok) await run(revokeApiKey({ id: k.id }), { success: "API key revoked" });
  }

  return (
    <Card>
      {dialog}
      <CardHeader
        title="API keys"
        description="Secret keys that let your own software read and update this store."
        action={
          <Button size="sm" onClick={() => setOpen(true)} disabled={locked}>
            <Plus /> Create key
          </Button>
        }
      />
      {keys.length === 0 ? (
        <EmptyState
          icon={<KeyRound />}
          title="No API keys yet"
          description={locked ? "Upgrade your plan to create API keys." : "Create a key to connect an ERP, inventory tool or custom app."}
          action={
            !locked && (
              <Button onClick={() => setOpen(true)}>
                <Plus /> Create your first key
              </Button>
            )
          }
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Key</TH>
              <TH>Scopes</TH>
              <TH>Created</TH>
              <TH>Last used</TH>
              <TH />
            </TR>
          </THead>
          <TBody>
            {keys.map((k) => (
              <TR key={k.id} className={k.revokedAt ? "opacity-60" : undefined}>
                <TD className="font-medium">
                  <span className="flex items-center gap-2">
                    {k.name}
                    {k.revokedAt && <Badge tone="red">Revoked</Badge>}
                  </span>
                </TD>
                <TD className="whitespace-nowrap font-mono text-xs text-muted-foreground">{k.prefix}…</TD>
                <TD>
                  <div className="flex max-w-xs flex-wrap gap-1">
                    {k.scopes.map((s) => (
                      <Badge key={s} tone="gray" className="font-mono text-[11px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </TD>
                <TD className="whitespace-nowrap">{formatDate(k.createdAt)}</TD>
                <TD className="whitespace-nowrap text-muted-foreground">{k.lastUsedAt ? <RelativeTime date={k.lastUsedAt} /> : "Never"}</TD>
                <TD className="text-right">
                  {!k.revokedAt && (
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 dark:text-red-400" onClick={() => revoke(k)}>
                      Revoke
                    </Button>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
      <CreateKeyDialog open={open} onClose={() => setOpen(false)} />
    </Card>
  );
}

function CreateKeyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = React.useState("");
  const [scopes, setScopes] = React.useState<string[]>(["read_products", "read_orders"]);
  const [saving, setSaving] = React.useState(false);
  const [key, setKey] = React.useState<string | null>(null);

  const close = () => {
    onClose();
    setTimeout(() => {
      setKey(null);
      setName("");
      setScopes(["read_products", "read_orders"]);
    }, 200);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await run(createApiKey({ name, scopes: scopes as never }), { success: "API key created" });
    setSaving(false);
    if (res) setKey(res.key);
  }

  if (key) {
    return (
      <Dialog open={open} onClose={close} title="Copy your API key" description="Store it somewhere safe, like a password manager." footer={<Button onClick={close}>I&apos;ve copied it</Button>}>
        <SecretReveal value={key} warning="This is the only time you'll see the full key. If you lose it, revoke it and create a new one." />
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Create API key"
      footer={
        <>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form="api-key-form" loading={saving} disabled={!name.trim() || !scopes.length}>
            Create key
          </Button>
        </>
      }
    >
      <form id="api-key-form" onSubmit={submit} className="space-y-4">
        <Field label="Name" hint="So you remember what it's for, e.g. “Inventory sync”">
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoFocus required />
        </Field>
        <Field label="Scopes" hint="Only give the access the app needs.">
          <div className="grid gap-1 sm:grid-cols-2">
            {API_SCOPES.map((s) => (
              <label key={s.value} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
                <Checkbox checked={scopes.includes(s.value)} onChange={(e) => setScopes((cur) => (e.target.checked ? [...cur, s.value] : cur.filter((x) => x !== s.value)))} />
                <span>{s.label}</span>
                <code className="ml-auto text-[11px] text-muted-foreground">{s.value}</code>
              </label>
            ))}
          </div>
        </Field>
      </form>
    </Dialog>
  );
}
