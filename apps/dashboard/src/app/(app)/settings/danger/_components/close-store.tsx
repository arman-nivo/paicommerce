"use client";
import * as React from "react";
import { DoorClosed, TriangleAlert } from "lucide-react";
import { Button, Card, CardHeader, Dialog, Field, Input } from "@pai/ui";
import { run } from "@/lib/client";
import { closeStore } from "../actions";

export function CloseStoreCard({ storeName, slug, closed }: { storeName: string; slug: string; closed: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [typed, setTyped] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const match = typed.trim().toLowerCase() === slug.toLowerCase();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!match) return;
    setSaving(true);
    await run(closeStore({ confirmSlug: typed }));
    setSaving(false);
  }

  return (
    <Card className="border-red-200 dark:border-red-500/30">
      <CardHeader title={<span className="text-red-600 dark:text-red-400">Close store</span>} description="Take your store offline and stop billing." />
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <ul className="flex-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Your storefront goes offline and customers can no longer place orders.</li>
          <li>Your subscription is cancelled — you won&apos;t be charged again.</li>
          <li>Orders, products and customer data are kept for your records.</li>
        </ul>
        <Button variant="destructive" onClick={() => setOpen(true)} disabled={closed}>
          <DoorClosed /> {closed ? "Store closed" : "Close store"}
        </Button>
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Close ${storeName}?`}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" type="submit" form="close-store-form" disabled={!match} loading={saving}>
              Close store permanently
            </Button>
          </>
        }
      >
        <form id="close-store-form" onSubmit={submit} className="space-y-4">
          <p className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-900 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            This takes your store offline immediately and cancels your plan. To reopen it later you&apos;ll need to contact support.
          </p>
          <Field label={<>Type <code className="rounded bg-muted px-1 font-mono">{slug}</code> to confirm</>}>
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" autoFocus placeholder={slug} />
          </Field>
        </form>
      </Dialog>
    </Card>
  );
}
