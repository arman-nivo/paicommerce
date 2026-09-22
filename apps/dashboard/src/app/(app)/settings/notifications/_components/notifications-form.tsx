"use client";
import * as React from "react";
import Link from "next/link";
import { Mail, MessageSquare, Package } from "lucide-react";
import { Badge, Card, CardBody, CardHeader, Field, Input } from "@pai/ui";
import { EditLayout } from "@/components/page";
import { SaveBar, useDirtyState } from "@/components/save-bar";
import { run } from "@/lib/client";
import { Callout, ToggleRow } from "../../_components/ui";
import { saveNotifications } from "../actions";

type Values = { orderEmail: boolean; orderSms: boolean; lowStockThreshold: number };

export function NotificationsForm({ initial, email, phone, smsConnected }: { initial: Values; email: string | null; phone: string | null; smsConnected: boolean }) {
  const form = useDirtyState<Values>(initial);
  const v = form.value;
  const [saving, setSaving] = React.useState(false);

  async function save() {
    setSaving(true);
    const res = await run(saveNotifications(v), { success: "Notification settings saved" });
    setSaving(false);
    if (res) form.commit();
  }

  return (
    <>
      <EditLayout
        main={
          <>
            <Card>
              <CardHeader title="New order alerts" description="Get notified the moment a customer places an order." />
              <CardBody className="divide-y divide-border">
                <ToggleRow
                  label={
                    <span className="inline-flex items-center gap-2">
                      <Mail className="size-4 text-muted-foreground" /> Email me for every new order
                    </span>
                  }
                  description={email ? `Sent to ${email}` : "Add a store email in General settings to receive these."}
                  checked={v.orderEmail}
                  onChange={(x) => form.set("orderEmail", x)}
                  badge={!email ? <Badge tone="yellow">No email set</Badge> : undefined}
                />
                <ToggleRow
                  label={
                    <span className="inline-flex items-center gap-2">
                      <MessageSquare className="size-4 text-muted-foreground" /> SMS me for every new order
                    </span>
                  }
                  description={phone ? `Sent to ${phone} via your SMS provider.` : "Add a store phone number in General settings to receive these."}
                  checked={v.orderSms}
                  onChange={(x) => form.set("orderSms", x)}
                  badge={!smsConnected ? <Badge tone="yellow">SMS not connected</Badge> : undefined}
                />
              </CardBody>
            </Card>
            {v.orderSms && !smsConnected && (
              <Callout tone="warning" title="Connect an SMS provider">
                SMS alerts need an SMS gateway.{" "}
                <Link href="/settings/apps" className="font-medium underline">
                  Connect BulkSMSBD
                </Link>{" "}
                in Apps &amp; integrations — it also sends order confirmations to your customers.
              </Callout>
            )}
            <Card>
              <CardHeader title="Inventory alerts" />
              <CardBody>
                <Field label="Low stock threshold" hint="Products at or below this quantity are flagged as “Low stock” in your dashboard notifications and inventory page.">
                  <div className="flex max-w-[200px] items-center gap-2">
                    <Input type="number" min={0} max={100000} value={v.lowStockThreshold} onChange={(e) => form.set("lowStockThreshold", Math.max(0, Math.floor(Number(e.target.value) || 0)))} />
                    <span className="text-sm text-muted-foreground">units</span>
                  </div>
                </Field>
              </CardBody>
            </Card>
          </>
        }
        aside={
          <Card>
            <CardHeader title="Where notifications go" />
            <CardBody className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-medium">Store email</p>
                  <p className="truncate text-muted-foreground">{email || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">Store phone</p>
                  <p className="text-muted-foreground">{phone || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">Dashboard bell</p>
                  <p className="text-muted-foreground">New orders and low stock always show in the top bar.</p>
                </div>
              </div>
              <Link href="/settings/general" className="inline-block pt-1 font-medium text-primary hover:underline">
                Change contact details →
              </Link>
            </CardBody>
          </Card>
        }
      />
      <SaveBar dirty={form.dirty} saving={saving} onSave={save} onDiscard={form.reset} />
    </>
  );
}
