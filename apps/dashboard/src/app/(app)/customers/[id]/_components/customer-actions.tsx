"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Ban, Ellipsis, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { isValidBdPhone } from "@pai/core";
import { Button, Checkbox, Dialog, Dropdown, DropdownItem, Field, Input, useConfirm } from "@pai/ui";
import { run } from "@/lib/client";
import { deleteCustomer, setCustomerBlocked, updateCustomerContact } from "../../actions";

type C = { id: string; name: string; phone: string | null; email: string | null; blocked: boolean };

export function CustomerActions({ customer, onBlockList }: { customer: C; onBlockList: boolean }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [editOpen, setEditOpen] = React.useState(false);
  const [blockOpen, setBlockOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const unblock = async () => {
    const ok = await confirm({
      title: `Unblock ${customer.name}?`,
      description: onBlockList ? "They'll be able to order again, and their phone number will be removed from your fraud block list." : "They'll be able to place orders again.",
      confirmLabel: "Unblock",
    });
    if (!ok) return;
    setBusy(true);
    const res = await run(setCustomerBlocked({ id: customer.id, blocked: false }), { success: "Customer unblocked" });
    setBusy(false);
    if (res) router.refresh();
  };

  const remove = async () => {
    const ok = await confirm({
      title: `Delete ${customer.name}?`,
      description: "The customer profile, notes and addresses will be deleted. Their past orders stay in your Orders list. This can't be undone.",
      confirmLabel: "Delete customer",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    const res = await run(deleteCustomer({ id: customer.id }), { success: "Customer deleted" });
    setBusy(false);
    if (res) {
      router.push("/customers");
      router.refresh();
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setEditOpen(true)}>
        <Pencil className="size-4" /> Edit
      </Button>
      {customer.blocked ? (
        <Button variant="outline" onClick={unblock} loading={busy}>
          <ShieldCheck className="size-4" /> Unblock
        </Button>
      ) : (
        <Button variant="outline" onClick={() => setBlockOpen(true)}>
          <Ban className="size-4" /> Block
        </Button>
      )}
      <Dropdown
        trigger={
          <Button variant="outline" size="icon" aria-label="More actions">
            <Ellipsis className="size-4" />
          </Button>
        }
      >
        <DropdownItem danger icon={<Trash2 className="size-4" />} onClick={remove}>
          Delete customer
        </DropdownItem>
      </Dropdown>

      <EditContactDialog open={editOpen} onClose={() => setEditOpen(false)} customer={customer} />
      <BlockDialog open={blockOpen} onClose={() => setBlockOpen(false)} customer={customer} alreadyListed={onBlockList} />
      {dialog}
    </>
  );
}

function EditContactDialog({ open, onClose, customer }: { open: boolean; onClose: () => void; customer: C }) {
  const router = useRouter();
  const [v, setV] = React.useState({ name: customer.name, phone: customer.phone ?? "", email: customer.email ?? "" });
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => {
    if (open) setV({ name: customer.name, phone: customer.phone ?? "", email: customer.email ?? "" });
  }, [open, customer]);
  const phoneError = v.phone && !isValidBdPhone(v.phone) ? "Enter a valid Bangladeshi mobile number" : null;
  const invalid = !v.name.trim() || !!phoneError || (!v.phone.trim() && !v.email.trim());

  const save = async () => {
    if (invalid) return;
    setSaving(true);
    const res = await run(updateCustomerContact({ id: customer.id, name: v.name, phone: v.phone || null, email: v.email || null }), { success: "Customer updated" });
    setSaving(false);
    if (res) {
      onClose();
      router.refresh();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Edit customer"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} disabled={invalid}>
            Save
          </Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Field label="Full name" error={!v.name.trim() ? "Name is required" : null}>
          <Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
        </Field>
        <Field label="Mobile number" error={phoneError} hint="Changing the phone also changes which orders are matched to this customer.">
          <Input value={v.phone} inputMode="tel" onChange={(e) => setV({ ...v, phone: e.target.value })} placeholder="01XXXXXXXXX" />
        </Field>
        <Field label="Email" error={!v.phone.trim() && !v.email.trim() ? "Add a phone number or an email" : null}>
          <Input type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
        </Field>
        <button type="submit" className="hidden" />
      </form>
    </Dialog>
  );
}

function BlockDialog({ open, onClose, customer, alreadyListed }: { open: boolean; onClose: () => void; customer: C; alreadyListed: boolean }) {
  const router = useRouter();
  const [fraudList, setFraudList] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const block = async () => {
    setSaving(true);
    const res = await run(setCustomerBlocked({ id: customer.id, blocked: true, fraudList: !!customer.phone && fraudList }), { success: "Customer blocked" });
    setSaving(false);
    if (res) {
      onClose();
      router.refresh();
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title={`Block ${customer.name}?`}
      description="Blocked customers can't check out on your store. You can unblock them any time."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={block} loading={saving}>
            Block customer
          </Button>
        </>
      }
    >
      {customer.phone && !alreadyListed ? (
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 text-sm">
          <Checkbox checked={fraudList} onChange={(e) => setFraudList(e.target.checked)} className="mt-0.5" />
          <span>
            <span className="block font-medium">Also add {customer.phone} to the fraud block list</span>
            <span className="block text-xs text-muted-foreground">Stops new orders from this phone number even with a different name or as a guest.</span>
          </span>
        </label>
      ) : (
        <p className="text-sm text-muted-foreground">{alreadyListed ? "This phone number is already on your fraud block list." : "This customer has no phone number to add to the fraud block list."}</p>
      )}
    </Dialog>
  );
}
