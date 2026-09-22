"use client";
import * as React from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, TriangleAlert, Truck } from "lucide-react";
import { Button, Card, CardBody, CardHeader, EmptyState, Field, Input, Switch } from "@pai/ui";
import { EditLayout } from "@/components/page";
import { MoneyInput } from "@/components/money-input";
import { SaveBar, useDirtyState } from "@/components/save-bar";
import { useMoney } from "@/components/store-context";
import { run } from "@/lib/client";
import { Callout } from "../../_components/ui";
import { saveDelivery } from "../actions";

type Zone = { id: string; name: string; charge: number; estimatedDays: string };
type Values = { zones: Zone[]; freeShippingOver: number | null };

const PRESETS: Omit<Zone, "id">[] = [
  { name: "Inside Dhaka", charge: 7000, estimatedDays: "1-2 days" },
  { name: "Dhaka sub-area", charge: 10000, estimatedDays: "2-3 days" },
  { name: "Outside Dhaka", charge: 13000, estimatedDays: "3-5 days" },
];

const newId = () => `z_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function DeliveryForm({ initial }: { initial: Values }) {
  const form = useDirtyState<Values>(initial);
  const v = form.value;
  const money = useMoney();
  const [saving, setSaving] = React.useState(false);
  const [showErrors, setShowErrors] = React.useState(false);

  const setZones = (zones: Zone[]) => form.set("zones", zones);
  const update = (i: number, patch: Partial<Zone>) => setZones(v.zones.map((z, j) => (j === i ? { ...z, ...patch } : z)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...v.zones];
    const t = next[i + d];
    if (!t) return;
    next[i + d] = next[i]!;
    next[i] = t;
    setZones(next);
  };
  const add = (p?: Omit<Zone, "id">) => setZones([...v.zones, { id: newId(), name: p?.name ?? "", charge: p?.charge ?? 0, estimatedDays: p?.estimatedDays ?? "" }]);
  const missingPresets = PRESETS.filter((p) => !v.zones.some((z) => z.name.trim().toLowerCase() === p.name.toLowerCase()));

  async function save() {
    if (v.zones.some((z) => !z.name.trim())) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    const res = await run(saveDelivery({ zones: v.zones.map((z) => ({ ...z, name: z.name.trim(), estimatedDays: z.estimatedDays.trim() || undefined })), freeShippingOver: v.freeShippingOver }), { success: "Delivery settings saved" });
    setSaving(false);
    if (res) form.commit();
  }

  return (
    <>
      <EditLayout
        main={
          <>
            {v.zones.length === 0 && (
              <Callout tone="warning" icon={<TriangleAlert />} title="Add at least one delivery zone">
                Without a delivery zone, customers won&apos;t be charged for delivery and can&apos;t choose where they are. Use the quick-add buttons below to get started in one click.
              </Callout>
            )}
            <Card>
              <CardHeader
                title="Delivery zones"
                description="Customers choose one of these at checkout. The first zone is selected by default."
                action={
                  <Button size="sm" variant="outline" onClick={() => add()}>
                    <Plus /> Add zone
                  </Button>
                }
              />
              {v.zones.length === 0 ? (
                <EmptyState icon={<Truck />} title="No delivery zones yet" description="Most Bangladeshi stores charge one price inside Dhaka and another outside Dhaka." action={<Button onClick={() => setZones(PRESETS.map((p) => ({ ...p, id: newId() })))}><Plus /> Add recommended zones</Button>} />
              ) : (
                <CardBody className="space-y-3">
                  <div className="hidden grid-cols-[1fr_140px_130px_auto] gap-3 px-1 text-xs font-medium text-muted-foreground md:grid">
                    <span>Zone name</span>
                    <span>Charge</span>
                    <span>Delivery time</span>
                    <span className="w-[104px]" />
                  </div>
                  {v.zones.map((z, i) => (
                    <div key={z.id} className="grid grid-cols-2 gap-3 rounded-xl border border-border p-3 md:grid-cols-[1fr_140px_130px_auto] md:items-center md:border-0 md:p-0">
                      <div className="col-span-2 md:col-span-1">
                        <Input value={z.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="e.g. Inside Dhaka" aria-label="Zone name" aria-invalid={showErrors && !z.name.trim()} className={showErrors && !z.name.trim() ? "border-red-500" : undefined} />
                      </div>
                      <MoneyInput value={z.charge} onChange={(m) => update(i, { charge: m ?? 0 })} aria-label="Delivery charge" />
                      <Input value={z.estimatedDays} onChange={(e) => update(i, { estimatedDays: e.target.value })} placeholder="1-2 days" aria-label="Estimated delivery time" />
                      <div className="col-span-2 flex justify-end gap-1 md:col-span-1">
                        <Button size="icon-sm" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                          <ArrowUp />
                        </Button>
                        <Button size="icon-sm" variant="ghost" onClick={() => move(i, 1)} disabled={i === v.zones.length - 1} aria-label="Move down">
                          <ArrowDown />
                        </Button>
                        <Button size="icon-sm" variant="ghost" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => setZones(v.zones.filter((_, j) => j !== i))} aria-label="Remove zone">
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {showErrors && v.zones.some((z) => !z.name.trim()) && <p className="text-xs text-red-600">Every zone needs a name.</p>}
                </CardBody>
              )}
              {missingPresets.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3">
                  <span className="text-xs font-medium text-muted-foreground">Quick add:</span>
                  {missingPresets.map((p) => (
                    <Button key={p.name} size="sm" variant="secondary" onClick={() => add(p)}>
                      <Plus /> {p.name} · {money(p.charge)}
                    </Button>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <CardHeader title="Free delivery" description="Encourage bigger orders by waiving the delivery charge above an amount." />
              <CardBody className="space-y-4">
                <label className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium">Offer free delivery on large orders</span>
                  <Switch checked={v.freeShippingOver != null} onChange={(e) => form.set("freeShippingOver", e.target.checked ? (initial.freeShippingOver ?? 300000) : null)} />
                </label>
                {v.freeShippingOver != null && (
                  <Field label="Free delivery when the order subtotal is at least" hint={`Orders of ${money(v.freeShippingOver)} or more ship free to every zone.`}>
                    <MoneyInput value={v.freeShippingOver} onChange={(m) => form.set("freeShippingOver", m ?? 0)} className="max-w-xs" />
                  </Field>
                )}
              </CardBody>
            </Card>
          </>
        }
        aside={
          <>
            <Card>
              <CardHeader title="Checkout preview" description="How customers see delivery options." />
              <CardBody className="space-y-2">
                {v.zones.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No zones yet.</p>
                ) : (
                  v.zones.map((z, i) => (
                    <div key={z.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm">
                      <span className={`size-4 shrink-0 rounded-full border-2 ${i === 0 ? "border-[5px] border-primary" : "border-input"}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{z.name || "Untitled zone"}</span>
                        {z.estimatedDays && <span className="block text-xs text-muted-foreground">{z.estimatedDays}</span>}
                      </span>
                      <span className="font-medium tabular-nums">{z.charge ? money(z.charge) : "Free"}</span>
                    </div>
                  ))
                )}
                {v.freeShippingOver != null && v.zones.length > 0 && <p className="pt-1 text-xs text-emerald-700 dark:text-emerald-400">Free delivery on orders over {money(v.freeShippingOver)}</p>}
              </CardBody>
            </Card>
            <Callout icon={<Truck />} title="Book couriers in one click">
              Connect Steadfast, Pathao or RedX in{" "}
              <a href="/settings/couriers" className="font-medium underline">
                Couriers
              </a>{" "}
              to send parcels straight from the order page.
            </Callout>
          </>
        }
      />
      <SaveBar dirty={form.dirty} saving={saving} onSave={save} onDiscard={form.reset} />
    </>
  );
}
