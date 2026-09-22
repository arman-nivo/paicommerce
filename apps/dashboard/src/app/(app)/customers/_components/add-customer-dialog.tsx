"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { isValidBdPhone } from "@pai/core";
import { Button, Dialog, Field, Input, Switch, Textarea } from "@pai/ui";
import { TagInput } from "@/components/tag-input";
import { run } from "@/lib/client";
import { createCustomer } from "../actions";

const EMPTY = { name: "", phone: "", email: "", line1: "", area: "", city: "", district: "", note: "", tags: [] as string[], acceptsMarketing: false };

export function AddCustomerButton({ tagSuggestions, label = "Add customer" }: { tagSuggestions: string[]; label?: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="size-4" /> {label}
      </Button>
      <AddCustomerDialog open={open} onClose={() => setOpen(false)} tagSuggestions={tagSuggestions} />
    </>
  );
}

function AddCustomerDialog({ open, onClose, tagSuggestions }: { open: boolean; onClose: () => void; tagSuggestions: string[] }) {
  const router = useRouter();
  const [v, setV] = React.useState(EMPTY);
  const [saving, setSaving] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const set = <K extends keyof typeof EMPTY>(k: K, val: (typeof EMPTY)[K]) => setV((s) => ({ ...s, [k]: val }));

  const phoneError = v.phone && !isValidBdPhone(v.phone) ? "Enter a valid Bangladeshi mobile number (e.g. 01712345678)" : null;
  const nameError = touched && !v.name.trim() ? "Name is required" : null;
  const contactError = touched && !v.phone.trim() && !v.email.trim() ? "Add a phone number or an email" : null;

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setTouched(true);
    if (!v.name.trim() || phoneError || (!v.phone.trim() && !v.email.trim())) return;
    setSaving(true);
    const res = await run(
      createCustomer({
        name: v.name,
        phone: v.phone || null,
        email: v.email || null,
        address: { line1: v.line1, area: v.area, city: v.city, district: v.district },
        note: v.note,
        tags: v.tags,
        acceptsMarketing: v.acceptsMarketing,
      }),
      { success: "Customer added" },
    );
    setSaving(false);
    if (res) {
      setV(EMPTY);
      setTouched(false);
      onClose();
      router.push(`/customers/${res.id}`);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add customer"
      description="Save a customer's details for phone, Facebook or walk-in orders."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => submit()} loading={saving}>
            Add customer
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name" error={nameError}>
          <Input autoFocus value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Rahima Akter" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mobile number" error={phoneError ?? contactError} hint="We use this to match their orders.">
            <Input value={v.phone} onChange={(e) => set("phone", e.target.value)} inputMode="tel" placeholder="01XXXXXXXXX" />
          </Field>
          <Field label="Email (optional)">
            <Input type="email" value={v.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" />
          </Field>
        </div>
        <fieldset className="space-y-3 rounded-lg border border-border p-3">
          <legend className="px-1 text-xs font-medium text-muted-foreground">Address (optional)</legend>
          <Field label="Street address">
            <Input value={v.line1} onChange={(e) => set("line1", e.target.value)} placeholder="House, road, area" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Area / Thana">
              <Input value={v.area} onChange={(e) => set("area", e.target.value)} />
            </Field>
            <Field label="City">
              <Input value={v.city} onChange={(e) => set("city", e.target.value)} />
            </Field>
            <Field label="District">
              <Input value={v.district} onChange={(e) => set("district", e.target.value)} />
            </Field>
          </div>
        </fieldset>
        <Field label="Tags" hint="e.g. wholesale, VIP, facebook">
          <TagInput value={v.tags} onChange={(t) => set("tags", t)} suggestions={tagSuggestions} />
        </Field>
        <Field label="Note">
          <Textarea rows={2} value={v.note} onChange={(e) => set("note", e.target.value)} placeholder="Anything your team should know" />
        </Field>
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
          <span>
            <span className="block text-sm font-medium">Accepts marketing</span>
            <span className="block text-xs text-muted-foreground">Customer agreed to receive offers by SMS or email.</span>
          </span>
          <Switch checked={v.acceptsMarketing} onChange={(e) => set("acceptsMarketing", e.target.checked)} />
        </label>
        <button type="submit" className="hidden" />
      </form>
    </Dialog>
  );
}
