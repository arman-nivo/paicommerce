"use client";
import * as React from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Badge, Card, CardBody, CardHeader, Field, Input } from "@pai/ui";
import { EditLayout } from "@/components/page";
import { MoneyInput } from "@/components/money-input";
import { SaveBar, useDirtyState } from "@/components/save-bar";
import { useMoney } from "@/components/store-context";
import { run } from "@/lib/client";
import { Callout, ToggleRow } from "../../_components/ui";
import { saveCheckoutSettings } from "../actions";

type Values = { guestCheckout: boolean; requireEmail: boolean; orderNote: boolean; captureIncomplete: boolean; minimumOrder: number | null; termsUrl: string };

export function CheckoutForm({ initial, canRecover }: { initial: Values; canRecover: boolean }) {
  const form = useDirtyState<Values>(initial);
  const v = form.value;
  const money = useMoney();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function save() {
    if (v.termsUrl && !/^(https?:\/\/\S+|\/\S*)$/.test(v.termsUrl)) {
      setError("Use a full URL (https://…) or a path like /pages/terms");
      return;
    }
    setError(null);
    setSaving(true);
    const res = await run(saveCheckoutSettings(v), { success: "Checkout settings saved" });
    setSaving(false);
    if (res) form.commit();
  }

  return (
    <>
      <EditLayout
        main={
          <>
            <Card>
              <CardHeader title="Customer information" description="Most Bangladeshi shoppers check out with just a name, phone and address — keep it short to sell more." />
              <CardBody className="divide-y divide-border">
                <ToggleRow label="Guest checkout" description="Customers can order without creating an account. Recommended." checked={v.guestCheckout} onChange={(x) => form.set("guestCheckout", x)} badge={<Badge tone="green">Recommended</Badge>} />
                <ToggleRow label="Require email address" description="When off, email is optional and phone number is the main contact." checked={v.requireEmail} onChange={(x) => form.set("requireEmail", x)} />
                <ToggleRow label="Order note" description="Let customers add delivery instructions or gift messages." checked={v.orderNote} onChange={(x) => form.set("orderNote", x)} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Incomplete orders" description="Recover sales from customers who started checkout but didn't finish." />
              <CardBody className="space-y-4">
                <ToggleRow
                  label="Capture incomplete orders"
                  description="As soon as a customer types their phone number at checkout, we save their cart. If they leave, it appears under Orders → Incomplete orders so you can call them and convert it to a real order."
                  checked={v.captureIncomplete}
                  onChange={(x) => form.set("captureIncomplete", x)}
                />
                {v.captureIncomplete && (
                  <Callout tone="success" title="Tip: call within 1 hour">
                    A quick, friendly call recovers many abandoned checkouts. Find them in{" "}
                    <Link href="/orders/incomplete" className="font-medium underline">
                      Incomplete orders
                    </Link>
                    .{!canRecover && " Upgrade to Growth for one-click conversion and bulk follow-up."}
                  </Callout>
                )}
              </CardBody>
            </Card>
          </>
        }
        aside={
          <>
            <Card>
              <CardHeader title="Order rules" />
              <CardBody className="space-y-4">
                <Field label="Minimum order amount" hint={v.minimumOrder ? `Carts below ${money(v.minimumOrder)} can't check out.` : "Leave empty for no minimum."}>
                  <MoneyInput value={v.minimumOrder} onChange={(m) => form.set("minimumOrder", m)} allowEmpty />
                </Field>
                <Field label="Terms & conditions link" error={error} hint="Shown as “I agree to the terms” at checkout. Leave empty to hide.">
                  <Input value={v.termsUrl} onChange={(e) => form.set("termsUrl", e.target.value)} placeholder="/pages/terms" />
                </Field>
                <Link href="/settings/policies" className="text-sm font-medium text-primary hover:underline">
                  Write your policies →
                </Link>
              </CardBody>
            </Card>
            <Callout icon={<ShoppingCart />} title="Payment & delivery options">
              Payment methods are set in{" "}
              <Link href="/settings/payments" className="font-medium underline">
                Payments
              </Link>{" "}
              and delivery charges in{" "}
              <Link href="/settings/delivery" className="font-medium underline">
                Delivery
              </Link>
              .
            </Callout>
          </>
        }
      />
      <SaveBar dirty={form.dirty} saving={saving} onSave={save} onDiscard={form.reset} />
    </>
  );
}
