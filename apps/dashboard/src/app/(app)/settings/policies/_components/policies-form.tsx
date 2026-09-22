"use client";
import * as React from "react";
import { CircleCheck, WandSparkles } from "lucide-react";
import { Button, Card, CardBody, CardHeader, Tabs, useConfirm } from "@pai/ui";
import { RichTextEditor } from "@/components/rich-text-editor";
import { SaveBar, useDirtyState } from "@/components/save-bar";
import { run } from "@/lib/client";
import { savePolicies } from "../actions";
import { POLICY_META, policyTemplate, type PolicyKey } from "../templates";

type Values = Record<PolicyKey, string>;
const hasText = (html: string) => html.replace(/<[^>]*>/g, "").trim().length > 0;

export function PoliciesForm({ initial, store }: { initial: Values; store: { name: string; email: string | null; phone: string | null } }) {
  const form = useDirtyState<Values>(initial);
  const v = form.value;
  const [tab, setTab] = React.useState<PolicyKey>("refund");
  const [saving, setSaving] = React.useState(false);
  const { confirm, dialog } = useConfirm();
  const meta = POLICY_META.find((m) => m.key === tab)!;

  async function generate() {
    if (hasText(v[tab])) {
      const ok = await confirm({ title: "Replace current text?", description: `This replaces your ${meta.label.toLowerCase()} policy with our template. You can still discard before saving.`, confirmLabel: "Replace" });
      if (!ok) return;
    }
    form.set(tab, policyTemplate(tab, store));
  }

  async function save() {
    setSaving(true);
    const res = await run(savePolicies(v), { success: "Policies saved" });
    setSaving(false);
    if (res) form.commit();
  }

  return (
    <>
      {dialog}
      <Card>
        <Tabs
          className="px-3"
          value={tab}
          onChange={(t) => setTab(t as PolicyKey)}
          tabs={POLICY_META.map((m) => ({
            value: m.key,
            label: (
              <span className="inline-flex items-center gap-1.5">
                {m.label}
                {hasText(v[m.key]) && <CircleCheck className="size-3.5 text-emerald-600" />}
              </span>
            ),
          }))}
        />
        <CardHeader
          className="border-b-0 pb-0"
          title={`${meta.label} policy`}
          description={meta.description}
          action={
            <Button size="sm" variant="outline" onClick={generate}>
              <WandSparkles /> Generate template
            </Button>
          }
        />
        <CardBody>
          <RichTextEditor key={tab} value={v[tab]} onChange={(html) => form.set(tab, html)} minHeight={360} placeholder={`Write your ${meta.label.toLowerCase()} policy, or click “Generate template” to start from a Bangladesh-ready draft.`} />
          <p className="mt-2 text-xs text-muted-foreground">Templates are a starting point, not legal advice — review them and adjust to how your business works.</p>
        </CardBody>
      </Card>
      <SaveBar dirty={form.dirty} saving={saving} onSave={save} onDiscard={form.reset} />
    </>
  );
}
