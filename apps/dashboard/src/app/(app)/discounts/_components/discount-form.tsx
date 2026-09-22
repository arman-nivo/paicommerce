"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Badge, Button, Card, CardBody, CardHeader, Checkbox, Field, Input, Switch } from "@pai/ui";
import { EditLayout } from "@/components/page";
import { SaveBar, useDirtyState } from "@/components/save-bar";
import { useMoney } from "@/components/store-context";
import { run } from "@/lib/client";
import { saveDiscount } from "../actions";
import { CODE_RE, describeDiscount, discountStatus, fromDhakaInput, normalizeCode, randomCode, STATUS_META } from "../_lib/shared";
import { DateFields, RequirementFields, settingsValid, TypeValueFields, type DiscountSettings } from "./fields";

export type DiscountFormValue = DiscountSettings & { code: string; title: string };

export function DiscountForm({ id, initial, usedCount = 0, extraAside }: { id?: string; initial: DiscountFormValue; usedCount?: number; extraAside?: React.ReactNode }) {
  const router = useRouter();
  const money = useMoney();
  const { value: v, set, setValue, dirty, reset, commit } = useDirtyState<DiscountFormValue>(initial);
  const [saving, setSaving] = React.useState(false);
  const [showErrors, setShowErrors] = React.useState(false);
  const [created, setCreated] = React.useState(false);
  const patch = (p: Partial<DiscountFormValue>) => setValue((s) => ({ ...s, ...p }));

  const codeOk = CODE_RE.test(v.code);
  const valid = codeOk && settingsValid(v);
  const isNew = !id;

  const save = async () => {
    if (saving) return;
    setShowErrors(true);
    if (!valid) return;
    setSaving(true);
    const res = await run(
      saveDiscount({
        id: id ?? null,
        code: v.code,
        title: v.title,
        type: v.type,
        value: v.value,
        minSubtotal: v.minSubtotal,
        usageLimit: v.usageLimit,
        oncePerCustomer: v.oncePerCustomer,
        startsAt: v.startsAt || null,
        endsAt: v.endsAt || null,
        active: v.active,
      }),
      { success: isNew ? "Discount created" : "Discount saved" },
    );
    setSaving(false);
    if (!res) return;
    commit();
    if (res.created) setCreated(true);
    if (res.created) router.replace(`/discounts/${res.id}`);
    else router.refresh();
  };

  const summary = describeDiscount(
    { ...v, startsAt: fromDhakaInput(v.startsAt), endsAt: fromDhakaInput(v.endsAt) },
    money,
  );
  const status = discountStatus({ active: v.active, startsAt: fromDhakaInput(v.startsAt), endsAt: fromDhakaInput(v.endsAt), usageLimit: v.usageLimit, usedCount });

  return (
    <>
      <EditLayout
        main={
          <>
            <Card>
              <CardHeader title="Discount code" description="Customers enter this code at checkout." />
              <CardBody className="space-y-4">
                <Field label="Code" error={showErrors && !codeOk ? "Use 3–40 letters, numbers, dashes or underscores" : null} hint="Letters are saved in UPPERCASE. Codes aren't case-sensitive at checkout.">
                  <div className="flex gap-2">
                    <Input
                      value={v.code}
                      onChange={(e) => set("code", normalizeCode(e.target.value))}
                      placeholder="e.g. EID20"
                      className="font-mono text-base uppercase tracking-wider"
                      maxLength={40}
                      autoFocus={isNew}
                    />
                    <Button type="button" variant="outline" onClick={() => set("code", randomCode(8))}>
                      <Sparkles className="size-4" /> Generate
                    </Button>
                  </div>
                </Field>
                <Field label="Internal name (optional)" hint="Only your team sees this — e.g. “Eid campaign — Facebook”.">
                  <Input value={v.title} onChange={(e) => set("title", e.target.value)} maxLength={120} />
                </Field>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Type & value" />
              <CardBody>
                <TypeValueFields value={v} onChange={patch} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Requirements & limits" />
              <CardBody className="space-y-4">
                <RequirementFields value={v} onChange={patch} />
                <label className="flex cursor-pointer items-start gap-3">
                  <Checkbox checked={v.oncePerCustomer} onChange={(e) => set("oncePerCustomer", e.target.checked)} className="mt-0.5" />
                  <span>
                    <span className="block text-sm font-medium">Limit to one use per customer</span>
                    <span className="block text-xs text-muted-foreground">Matched by phone number.</span>
                  </span>
                </label>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Active dates" description="Times are in Bangladesh time (GMT+6)." />
              <CardBody>
                <DateFields value={v} onChange={patch} />
              </CardBody>
            </Card>
          </>
        }
        aside={
          <>
            <Card className="lg:sticky lg:top-20">
              <CardHeader title="Summary" action={<Badge tone={STATUS_META[status].tone} dot>{STATUS_META[status].label}</Badge>} />
              <CardBody className="space-y-4">
                <div className="rounded-xl border border-dashed border-primary/40 bg-accent/60 px-4 py-3 text-center">
                  <div className="font-mono text-lg font-bold tracking-widest text-primary">{v.code || "YOURCODE"}</div>
                  {v.title && <div className="mt-0.5 text-xs text-muted-foreground">{v.title}</div>}
                </div>
                <ul className="space-y-1.5 text-sm">
                  {summary.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      <span className={i === 0 ? "font-medium" : "text-muted-foreground"}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                    </li>
                  ))}
                </ul>
                <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-border pt-4">
                  <span>
                    <span className="block text-sm font-medium">Active</span>
                    <span className="block text-xs text-muted-foreground">Turn off to pause this code without deleting it.</span>
                  </span>
                  <Switch checked={v.active} onChange={(e) => set("active", e.target.checked)} />
                </label>
                {isNew && (
                  <Button className="w-full" onClick={save} loading={saving}>
                    Create discount
                  </Button>
                )}
              </CardBody>
            </Card>
            {extraAside}
          </>
        }
      />
      <SaveBar dirty={!created && (isNew ? v.code !== "" || dirty : dirty)} saving={saving} onSave={save} onDiscard={isNew ? undefined : reset} saveLabel={isNew ? "Create discount" : "Save"} />
    </>
  );
}
