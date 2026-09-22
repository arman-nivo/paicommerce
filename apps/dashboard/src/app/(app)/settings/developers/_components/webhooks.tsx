"use client";
import * as React from "react";
import { Plus, Trash2, Webhook } from "lucide-react";
import { Badge, Button, Card, CardHeader, CopyButton, Dialog, EmptyState, Field, Input, Select, Switch, useConfirm } from "@pai/ui";
import { run } from "@/lib/client";
import { formatDate } from "@/lib/format";
import { createWebhook, deleteWebhook, setWebhookActive } from "../actions";
import { WEBHOOK_TOPICS } from "../constants";
import { SecretReveal } from "./secret-reveal";

export type HookView = { id: string; topic: string; url: string; secret: string; active: boolean; createdAt: string };

const topicLabel = (t: string) => WEBHOOK_TOPICS.find((x) => x.value === t)?.label ?? t;

export function Webhooks({ hooks, locked }: { hooks: HookView[]; locked: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState<string | null>(null);
  const { confirm, dialog } = useConfirm();

  async function toggle(h: HookView, active: boolean) {
    setBusy(h.id);
    await run(setWebhookActive({ id: h.id, active }), { success: active ? "Webhook enabled" : "Webhook paused" });
    setBusy(null);
  }
  async function remove(h: HookView) {
    const ok = await confirm({ title: "Delete webhook?", description: `We'll stop sending ${topicLabel(h.topic).toLowerCase()} events to ${h.url}.`, confirmLabel: "Delete", danger: true });
    if (ok) await run(deleteWebhook({ id: h.id }), { success: "Webhook deleted" });
  }

  return (
    <Card>
      {dialog}
      <CardHeader
        title="Webhooks"
        description="We POST a JSON payload to your URL when something happens in your store."
        action={
          <Button size="sm" onClick={() => setOpen(true)} disabled={locked}>
            <Plus /> Add webhook
          </Button>
        }
      />
      {hooks.length === 0 ? (
        <EmptyState
          icon={<Webhook />}
          title="No webhooks"
          description={locked ? "Upgrade your plan to receive real-time events." : "Get notified instantly when orders come in or products change."}
          action={
            !locked && (
              <Button onClick={() => setOpen(true)}>
                <Plus /> Add webhook
              </Button>
            )
          }
        />
      ) : (
        <ul className="divide-y divide-border">
          {hooks.map((h) => (
            <li key={h.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="blue" className="font-mono text-[11px]">
                    {h.topic}
                  </Badge>
                  {!h.active && <Badge tone="gray">Paused</Badge>}
                </div>
                <p className="mt-1 truncate font-mono text-sm">{h.url}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  Added {formatDate(h.createdAt)} · Signing secret <code>{h.secret.slice(0, 10)}…</code>
                  <CopyButton value={h.secret} className="px-1.5 py-0.5" />
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  Active
                  <Switch checked={h.active} disabled={busy === h.id || (locked && !h.active)} onChange={(e) => toggle(h, e.target.checked)} aria-label="Toggle webhook" />
                </label>
                <Button size="icon-sm" variant="ghost" onClick={() => remove(h)} aria-label="Delete webhook">
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <CreateWebhookDialog open={open} onClose={() => setOpen(false)} />
    </Card>
  );
}

function CreateWebhookDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [topic, setTopic] = React.useState<string>(WEBHOOK_TOPICS[0].value);
  const [url, setUrl] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [secret, setSecret] = React.useState<string | null>(null);
  const urlError = url && !/^https:\/\/[^\s/]+\.[^\s]+/.test(url) ? "Must be an https:// URL" : undefined;

  const close = () => {
    onClose();
    setTimeout(() => {
      setSecret(null);
      setUrl("");
      setTopic(WEBHOOK_TOPICS[0].value);
    }, 200);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await run(createWebhook({ topic: topic as never, url }), { success: "Webhook added" });
    setSaving(false);
    if (res) setSecret(res.secret);
  }

  if (secret) {
    return (
      <Dialog open={open} onClose={close} title="Webhook signing secret" description="Use it to verify that requests really come from PaiCommerce." footer={<Button onClick={close}>Done</Button>}>
        <SecretReveal value={secret} warning="Copy this now and keep it private. You can copy it again from the webhook list later." />
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Add webhook"
      footer={
        <>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form="webhook-form" loading={saving} disabled={!url || !!urlError}>
            Add webhook
          </Button>
        </>
      }
    >
      <form id="webhook-form" onSubmit={submit} className="space-y-4">
        <Field label="Event">
          <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
            {WEBHOOK_TOPICS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label} ({t.value})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Endpoint URL" error={urlError} hint="We'll send a POST request with a JSON body.">
          <Input type="url" value={url} onChange={(e) => setUrl(e.target.value.trim())} placeholder="https://example.com/webhooks/pai" required autoFocus />
        </Field>
      </form>
    </Dialog>
  );
}
