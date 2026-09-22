"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Dialog, Field, Input } from "@pai/ui";
import { run } from "@/lib/client";
import { renameTheme } from "../actions";

export function RenameDialog({ open, onClose, id, name }: { open: boolean; onClose: () => void; id: string; name: string }) {
  const router = useRouter();
  const [value, setValue] = React.useState(name);
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => {
    if (open) setValue(name);
  }, [open, name]);

  async function save(e?: React.FormEvent) {
    e?.preventDefault();
    if (!value.trim()) return;
    setSaving(true);
    const res = await run(renameTheme({ id, name: value }), { success: "Theme renamed" });
    setSaving(false);
    if (res) {
      onClose();
      router.refresh();
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Rename theme"
      description="Only you and your staff see this name — it helps you tell theme copies apart."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => save()} loading={saving} disabled={!value.trim()}>
            Save
          </Button>
        </>
      }
    >
      <form onSubmit={save}>
        <Field label="Theme name">
          <Input value={value} onChange={(e) => setValue(e.target.value)} maxLength={80} autoFocus />
        </Field>
      </form>
    </Dialog>
  );
}
