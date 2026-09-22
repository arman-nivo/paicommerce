"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Field, Switch, Textarea } from "@pai/ui";
import { SaveBar, useDirtyState } from "@/components/save-bar";
import { TagInput } from "@/components/tag-input";
import { run } from "@/lib/client";
import { updateCustomerProfile } from "../../actions";

type Profile = { note: string; tags: string[]; acceptsMarketing: boolean };

export function ProfileCard({ customerId, initial, tagSuggestions, canManage }: { customerId: string; initial: Profile; tagSuggestions: string[]; canManage: boolean }) {
  const router = useRouter();
  const { value, set, dirty, reset, commit } = useDirtyState<Profile>(initial);
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    const res = await run(updateCustomerProfile({ id: customerId, ...value }), { success: "Customer updated" });
    setSaving(false);
    if (res) {
      commit();
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader title="Notes & tags" description="Only visible to you and your staff." />
      <CardBody className="space-y-4">
        <Field label="Notes">
          <Textarea
            rows={4}
            value={value.note}
            disabled={!canManage}
            onChange={(e) => set("note", e.target.value)}
            placeholder="e.g. Prefers delivery after 5pm, always pays by bKash…"
          />
        </Field>
        <Field label="Tags" hint="Use tags to group customers — e.g. wholesale, VIP, Facebook.">
          {canManage ? (
            <TagInput value={value.tags} onChange={(t) => set("tags", t)} suggestions={tagSuggestions.filter((t) => !value.tags.includes(t))} />
          ) : (
            <p className="text-sm text-muted-foreground">{value.tags.join(", ") || "No tags"}</p>
          )}
        </Field>
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
          <span>
            <span className="block text-sm font-medium">Accepts marketing</span>
            <span className="block text-xs text-muted-foreground">Include this customer in SMS and email campaigns.</span>
          </span>
          <Switch checked={value.acceptsMarketing} disabled={!canManage} onChange={(e) => set("acceptsMarketing", e.target.checked)} />
        </label>
      </CardBody>
      {canManage && <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={reset} />}
    </Card>
  );
}
