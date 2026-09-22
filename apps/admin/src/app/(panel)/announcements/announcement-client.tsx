"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, OctagonAlert, Pencil, Plus, Trash2 } from "lucide-react";
import { Button, cn, Dialog, Field, Input, Select, Switch, Textarea } from "@pai/ui";
import { ActionButton, useRunAction } from "@/components/action-client";
import { deleteAnnouncement, saveAnnouncement, toggleAnnouncement } from "./actions";

export type AnnouncementValue = { id?: string; title: string; body: string; level: string; audience: string; active: boolean };

const LEVEL_STYLE: Record<string, { cls: string; Icon: React.ComponentType<{ className?: string }> }> = {
  info: { cls: "border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-200", Icon: Info },
  success: { cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200", Icon: CheckCircle2 },
  warning: { cls: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200", Icon: AlertTriangle },
  critical: { cls: "border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200", Icon: OctagonAlert },
};

export function AnnouncementPreview({ title, body, level }: { title: string; body: string; level: string }) {
  const s = LEVEL_STYLE[level] ?? LEVEL_STYLE.info!;
  return (
    <div className={cn("flex gap-3 rounded-xl border px-4 py-3 text-sm", s.cls)}>
      <s.Icon className="mt-0.5 size-4 shrink-0" />
      <div>
        <div className="font-semibold">{title || "Announcement title"}</div>
        <p className="mt-0.5 whitespace-pre-wrap opacity-90">{body || "Message body shown in the merchant dashboard."}</p>
      </div>
    </div>
  );
}

function AnnouncementDialog({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: AnnouncementValue }) {
  const [v, setV] = React.useState<AnnouncementValue>(initial ?? { title: "", body: "", level: "info", audience: "merchants", active: true });
  const { run, pending } = useRunAction();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={v.id ? "Edit announcement" : "New announcement"}
      description="Active announcements appear as a banner in the merchant dashboard (and/or developer portal)."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={pending}
            onClick={async () => {
              const r = await run(() => saveAnnouncement({ ...v, level: v.level as "info", audience: v.audience as "all" }));
              if (r.ok) onClose();
            }}
          >
            {v.id ? "Save" : v.active ? "Publish" : "Save draft"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title">
          <Input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} placeholder="Scheduled maintenance on Friday 2 AM" autoFocus />
        </Field>
        <Field label="Message">
          <Textarea value={v.body} onChange={(e) => setV({ ...v, body: e.target.value })} placeholder="Storefronts stay online; the dashboard may be unavailable for ~10 minutes." />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Level">
            <Select value={v.level} onChange={(e) => setV({ ...v, level: e.target.value })}>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </Select>
          </Field>
          <Field label="Audience">
            <Select value={v.audience} onChange={(e) => setV({ ...v, audience: e.target.value })}>
              <option value="merchants">Merchants</option>
              <option value="developers">Developers</option>
              <option value="all">Everyone</option>
            </Select>
          </Field>
          <Field label="Active">
            <label className="flex h-9 items-center gap-2 text-sm">
              <Switch checked={v.active} onChange={(e) => setV({ ...v, active: e.target.checked })} /> {v.active ? "Live" : "Hidden"}
            </label>
          </Field>
        </div>
        <Field label="Preview">
          <AnnouncementPreview title={v.title} body={v.body} level={v.level} />
        </Field>
      </div>
    </Dialog>
  );
}

export function AnnouncementButton({ initial, canManage }: { initial?: AnnouncementValue; canManage: boolean }) {
  const [open, setOpen] = React.useState(false);
  if (!canManage) return null;
  return (
    <>
      {initial ? (
        <Button size="icon-sm" variant="ghost" onClick={() => setOpen(true)} aria-label="Edit">
          <Pencil />
        </Button>
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus /> New announcement
        </Button>
      )}
      {open && <AnnouncementDialog open onClose={() => setOpen(false)} initial={initial} />}
    </>
  );
}

export function AnnouncementRowActions({ a, canManage }: { a: AnnouncementValue & { id: string }; canManage: boolean }) {
  const { run } = useRunAction();
  if (!canManage) return null;
  return (
    <div className="flex items-center gap-1">
      <Switch checked={a.active} onChange={(e) => run(() => toggleAnnouncement({ id: a.id, active: e.target.checked }))} aria-label="Active" />
      <AnnouncementButton initial={a} canManage />
      <ActionButton
        size="icon-sm"
        variant="ghost"
        className="text-red-600"
        aria-label="Delete"
        action={() => deleteAnnouncement({ id: a.id })}
        confirm={{ title: "Delete announcement?", description: a.title, confirmLabel: "Delete", danger: true }}
      >
        <Trash2 />
      </ActionButton>
    </div>
  );
}
