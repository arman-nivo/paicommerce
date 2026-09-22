"use client";

import * as React from "react";
import { Ban, CalendarPlus, ExternalLink, Layers, LogIn, MoreHorizontal, Play, ShieldCheck, ShieldOff } from "lucide-react";
import { Button, Dropdown, DropdownItem, useConfirm } from "@pai/ui";
import { useRunAction } from "@/components/action-client";
import { impersonateOwner, setDomainVerified, setStoreStatus } from "../actions";
import { ChangePlanDialog, ExtendTrialDialog, SuspendDialog } from "../store-dialogs";

type Plan = { id: string; name: string; priceMonthly: number; priceYearly: number; active: boolean };

export function StoreActions({
  store,
  plans,
  storefrontUrl,
  canManage,
  canImpersonate,
}: {
  store: { id: string; status: string; planId: string | null; customDomain: string | null; domainVerified: boolean; ownerEmail: string };
  plans: Plan[];
  storefrontUrl: string;
  canManage: boolean;
  canImpersonate: boolean;
}) {
  const [dialog, setDialog] = React.useState<null | "suspend" | "close" | "trial" | "plan">(null);
  const { run, pending } = useRunAction();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const suspended = store.status === "suspended" || store.status === "closed";

  const impersonate = async () => {
    const ok = await confirm({
      title: `Log in as ${store.ownerEmail}?`,
      description: "You'll be signed out of the admin panel and into the merchant dashboard as the store owner. This is recorded in the audit log. Use “Stop impersonating” on the admin login page to return.",
      confirmLabel: "Impersonate",
    });
    if (!ok) return;
    const res = await run(() => impersonateOwner({ id: store.id }), { refresh: false });
    if (res.ok && res.data) window.location.href = (res.data as { url: string }).url;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a href={storefrontUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-2 rounded-lg border border-input bg-card px-3 text-xs font-medium shadow-xs hover:bg-muted">
        <ExternalLink className="size-4" /> Storefront
      </a>
      {canImpersonate && (
        <Button size="sm" variant="outline" onClick={impersonate} loading={pending}>
          <LogIn /> Impersonate
        </Button>
      )}
      {canManage && (
        <>
          {suspended ? (
            <Button size="sm" variant="success" loading={pending} onClick={() => run(() => setStoreStatus({ ids: [store.id], status: "active" }))}>
              <Play /> Reactivate
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => setDialog("suspend")}>
              <Ban /> Suspend
            </Button>
          )}
          <Dropdown
            trigger={
              <Button size="icon-sm" variant="outline" aria-label="More actions">
                <MoreHorizontal />
              </Button>
            }
          >
            <DropdownItem icon={<Layers />} onClick={() => setDialog("plan")}>
              Change plan
            </DropdownItem>
            <DropdownItem icon={<CalendarPlus />} onClick={() => setDialog("trial")}>
              Extend trial
            </DropdownItem>
            {store.customDomain &&
              (store.domainVerified ? (
                <DropdownItem icon={<ShieldOff />} onClick={() => run(() => setDomainVerified({ id: store.id, verified: false }))}>
                  Mark domain unverified
                </DropdownItem>
              ) : (
                <DropdownItem icon={<ShieldCheck />} onClick={() => run(() => setDomainVerified({ id: store.id, verified: true }))}>
                  Verify domain manually
                </DropdownItem>
              ))}
            {!suspended && (
              <DropdownItem
                icon={<Ban />}
                danger
                onClick={() => setDialog("close")}
              >
                Close store
              </DropdownItem>
            )}
          </Dropdown>
        </>
      )}
      <SuspendDialog ids={[store.id]} open={dialog === "suspend"} onClose={() => setDialog(null)} />
      <SuspendDialog ids={[store.id]} mode="closed" open={dialog === "close"} onClose={() => setDialog(null)} />
      <ExtendTrialDialog ids={[store.id]} open={dialog === "trial"} onClose={() => setDialog(null)} />
      {dialog === "plan" && <ChangePlanDialog storeId={store.id} currentPlanId={store.planId} plans={plans} open onClose={() => setDialog(null)} />}
      {confirmDialog}
    </div>
  );
}

export function NoteForm({ storeId, action }: { storeId: string; action: (i: { id: string; note: string }) => Promise<{ ok: boolean; error?: string }> }) {
  const [note, setNote] = React.useState("");
  const { run, pending } = useRunAction();
  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const r = await run(() => action({ id: storeId, note }) as never, { success: "Note added" });
        if ((r as { ok: boolean }).ok) setNote("");
      }}
    >
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add an internal note (visible to the PaiCommerce team only)…"
        className="min-h-[72px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-xs focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/15"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) (e.currentTarget.form as HTMLFormElement).requestSubmit();
        }}
      />
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">⌘ + Enter to save</span>
        <Button size="sm" type="submit" loading={pending} disabled={!note.trim()}>
          Add note
        </Button>
      </div>
    </form>
  );
}
