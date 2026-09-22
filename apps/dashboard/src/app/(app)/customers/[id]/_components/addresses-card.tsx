"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import type { Address } from "@pai/db";
import { Badge, Button, Card, CardBody, CardHeader, Dialog, Field, Input, useConfirm } from "@pai/ui";
import { run } from "@/lib/client";
import { saveCustomerAddresses } from "../../actions";

const FIELDS: { key: keyof Address; label: string; placeholder?: string; span?: boolean }[] = [
  { key: "name", label: "Recipient name" },
  { key: "phone", label: "Phone", placeholder: "01XXXXXXXXX" },
  { key: "line1", label: "Street address", placeholder: "House, road, block", span: true },
  { key: "line2", label: "Apartment, landmark (optional)", span: true },
  { key: "area", label: "Area / Thana" },
  { key: "city", label: "City" },
  { key: "district", label: "District" },
  { key: "postalCode", label: "Postal code" },
];

export function formatAddress(a: Address) {
  return [a.line1, a.line2, a.area, a.city, a.district, a.postalCode].filter(Boolean).join(", ");
}

export function AddressesCard({ customerId, customerName, addresses, canManage }: { customerId: string; customerName: string; addresses: Address[]; canManage: boolean }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = React.useState<{ index: number | null; value: Address } | null>(null);
  const [saving, setSaving] = React.useState(false);

  const persist = async (next: Address[], success: string) => {
    setSaving(true);
    const res = await run(saveCustomerAddresses({ id: customerId, addresses: next.map((a) => ({ ...a })) }), { success });
    setSaving(false);
    if (res) router.refresh();
    return !!res;
  };

  const submit = async () => {
    if (!editing) return;
    const v = editing.value;
    if (!v.line1?.trim() && !v.area?.trim() && !v.city?.trim()) return;
    const next = [...addresses];
    if (editing.index == null) next.push(v);
    else next[editing.index] = v;
    if (await persist(next, editing.index == null ? "Address added" : "Address updated")) setEditing(null);
  };

  const remove = async (i: number) => {
    if (!(await confirm({ title: "Remove this address?", description: formatAddress(addresses[i]!), confirmLabel: "Remove", danger: true }))) return;
    await persist(
      addresses.filter((_, j) => j !== i),
      "Address removed",
    );
  };

  const makeDefault = (i: number) => persist([addresses[i]!, ...addresses.filter((_, j) => j !== i)], "Default address updated");

  const invalid = !!editing && !editing.value.line1?.trim() && !editing.value.area?.trim() && !editing.value.city?.trim();

  return (
    <Card>
      <CardHeader
        title="Addresses"
        action={
          canManage ? (
            <Button size="sm" variant="ghost" onClick={() => setEditing({ index: null, value: { name: customerName } })}>
              <Plus className="size-4" /> Add
            </Button>
          ) : undefined
        }
      />
      <CardBody className="space-y-3">
        {addresses.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" /> No saved addresses
          </p>
        ) : (
          addresses.map((a, i) => (
            <div key={i} className="group rounded-lg border border-border p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 font-medium">
                    {a.name || customerName}
                    {i === 0 && <Badge tone="brand">Default</Badge>}
                  </div>
                  {a.phone && <div className="text-muted-foreground tabular-nums">{a.phone}</div>}
                  <div className="text-muted-foreground">{formatAddress(a) || "—"}</div>
                </div>
                {canManage && (
                  <div className="flex shrink-0 gap-0.5">
                    {i > 0 && (
                      <button type="button" disabled={saving} onClick={() => makeDefault(i)} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Make default" title="Make default">
                        <Star className="size-3.5" />
                      </button>
                    )}
                    <button type="button" onClick={() => setEditing({ index: i, value: { ...a } })} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Edit address">
                      <Pencil className="size-3.5" />
                    </button>
                    <button type="button" disabled={saving} onClick={() => remove(i)} className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" aria-label="Remove address">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardBody>

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.index == null ? "Add address" : "Edit address"}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submit} loading={saving} disabled={invalid}>
              Save address
            </Button>
          </>
        }
      >
        {editing && (
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            {FIELDS.map((f) => (
              <Field key={f.key} label={f.label} className={f.span ? "sm:col-span-2" : undefined}>
                <Input
                  value={editing.value[f.key] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => setEditing((s) => (s ? { ...s, value: { ...s.value, [f.key]: e.target.value } } : s))}
                />
              </Field>
            ))}
            {invalid && <p className="text-xs text-muted-foreground sm:col-span-2">Add at least a street address, area or city.</p>}
            <button type="submit" className="hidden" />
          </form>
        )}
      </Dialog>
      {dialog}
    </Card>
  );
}
