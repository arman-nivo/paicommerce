"use client";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button, Card, CardBody, CardHeader, Field, Textarea } from "@pai/ui";
import { TagInput } from "@/components/tag-input";
import { run } from "@/lib/client";
import { saveOrderMeta } from "../../actions";

const SUGGESTIONS = ["VIP", "Urgent", "Gift", "Repeat customer", "Call before delivery", "Exchange", "Pre-order", "Fake risk"];

export function MetaCard({ orderId, canManage, staffNote, tags }: { orderId: string; canManage: boolean; staffNote: string | null; tags: string[] }) {
  const router = useRouter();
  const [note, setNote] = React.useState(staffNote ?? "");
  const [t, setT] = React.useState(tags);
  const [saving, setSaving] = React.useState(false);
  const dirty = note !== (staffNote ?? "") || t.join("|") !== tags.join("|");

  React.useEffect(() => {
    setNote(staffNote ?? "");
    setT(tags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffNote, tags.join("|")]);

  async function save() {
    setSaving(true);
    const res = await run(saveOrderMeta({ id: orderId, staffNote: note.trim() || null, tags: t }), { success: "Saved" });
    setSaving(false);
    if (res) router.refresh();
  }

  if (!canManage) {
    return (
      <Card>
        <CardHeader title="Staff note & tags" />
        <CardBody className="space-y-3 text-sm">
          <p className="whitespace-pre-wrap text-muted-foreground">{staffNote || "No staff note."}</p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((x) => (
                <span key={x} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                  {x}
                </span>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Staff note & tags" description="Private — customers never see these." />
      <CardBody className="space-y-4">
        <Field label="Staff note">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Customer wants the red one if blue is out of stock" maxLength={2000} className="min-h-20" />
        </Field>
        <Field label="Tags">
          <TagInput value={t} onChange={setT} suggestions={SUGGESTIONS} />
        </Field>
        {dirty && (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setNote(staffNote ?? "");
                setT(tags);
              }}
            >
              Discard
            </Button>
            <Button size="sm" loading={saving} onClick={save}>
              Save
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
