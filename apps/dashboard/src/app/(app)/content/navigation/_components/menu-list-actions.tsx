"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles } from "lucide-react";
import { slugify } from "@pai/core";
import { Button, Dialog, Field, Input } from "@pai/ui";
import { run } from "@/lib/client";
import { createDefaultMenus, createMenu } from "../actions";

export function CreateMenuButton({ variant = "default" }: { variant?: "default" | "outline" }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [handle, setHandle] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    const res = await run(createMenu({ title, handle }), { success: "Menu created" });
    setSaving(false);
    if (res) {
      setOpen(false);
      router.push(`/content/navigation/${res.id}`);
    }
  };

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        <Plus /> Add menu
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add menu"
        description="Custom menus can be shown by theme sections that support them (e.g. a sidebar or mega-menu)."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => submit()} loading={saving} disabled={!title.trim()}>
              Create menu
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Menu name">
            <Input
              autoFocus
              value={title}
              maxLength={80}
              placeholder="e.g. Sidebar menu"
              onChange={(e) => {
                setTitle(e.target.value);
                if (!touched) setHandle(slugify(e.target.value) === "item" ? "" : slugify(e.target.value));
              }}
            />
          </Field>
          <Field label="Handle" hint="Themes use the handle to find this menu. Lowercase letters, numbers and dashes.">
            <Input
              value={handle}
              maxLength={60}
              placeholder="sidebar-menu"
              onChange={(e) => {
                setTouched(true);
                setHandle(e.target.value.toLowerCase().replace(/\s+/g, "-"));
              }}
            />
          </Field>
          <button type="submit" hidden />
        </form>
      </Dialog>
    </>
  );
}

export function CreateDefaultMenusButton() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  return (
    <Button
      loading={busy}
      onClick={async () => {
        setBusy(true);
        const res = await run(createDefaultMenus({}), { success: "Default menus created" });
        setBusy(false);
        if (res) router.refresh();
      }}
    >
      <Sparkles /> Create default menus
    </Button>
  );
}
