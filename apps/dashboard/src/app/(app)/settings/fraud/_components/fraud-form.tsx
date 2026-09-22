"use client";
import * as React from "react";
import Link from "next/link";
import { Ban, ClipboardList, Gauge, Plus, ShieldCheck, Sparkles, Trash2, X } from "lucide-react";
import { Badge, Button, Card, CardBody, CardHeader, Dialog, EmptyState, Field, Input, Textarea, toast } from "@pai/ui";
import { isValidBdPhone, normalizePhone } from "@pai/core";
import { EditLayout } from "@/components/page";
import { SaveBar, useDirtyState } from "@/components/save-bar";
import { run } from "@/lib/client";
import { Callout } from "../../_components/ui";
import { saveFraudSettings } from "../actions";

type Values = { blockPhones: string[]; minCourierSuccessRate: number };

export function FraudForm({ initial, isPro }: { initial: Values; isPro: boolean }) {
  const form = useDirtyState<Values>(initial);
  const v = form.value;
  const [phone, setPhone] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState("");
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [bulk, setBulk] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  function addOne() {
    const n = normalizePhone(phone);
    if (!isValidBdPhone(n)) return setErr("Enter a valid Bangladeshi mobile number, e.g. 01712345678");
    if (v.blockPhones.includes(n)) return setErr("This number is already blocked");
    form.set("blockPhones", [n, ...v.blockPhones]);
    setPhone("");
    setErr(null);
  }

  function addBulk() {
    const parts = bulk.split(/[\s,;]+/).filter(Boolean);
    const valid = new Set<string>();
    let invalid = 0;
    for (const p of parts) {
      const n = normalizePhone(p);
      if (isValidBdPhone(n)) valid.add(n);
      else invalid++;
    }
    const fresh = [...valid].filter((n) => !v.blockPhones.includes(n));
    form.set("blockPhones", [...fresh, ...v.blockPhones]);
    toast.success(`Added ${fresh.length} number${fresh.length === 1 ? "" : "s"}${invalid ? ` · skipped ${invalid} invalid` : ""}`);
    setBulk("");
    setBulkOpen(false);
  }

  async function save() {
    setSaving(true);
    const res = await run(saveFraudSettings(v), { success: "Fraud settings saved" });
    setSaving(false);
    if (res) form.commit();
  }

  const shown = filter ? v.blockPhones.filter((p) => p.includes(filter.replace(/\D/g, ""))) : v.blockPhones;

  return (
    <>
      <EditLayout
        main={
          <>
            <Card>
              <CardHeader
                title="Blocked phone numbers"
                description="Orders from these numbers are rejected at checkout with a polite message."
                action={
                  <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}>
                    <ClipboardList /> Bulk paste
                  </Button>
                }
              />
              <CardBody className="space-y-4">
                <Field error={err}>
                  <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      addOne();
                    }}
                  >
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" aria-label="Phone number to block" />
                    <Button type="submit" variant="secondary">
                      <Plus /> Block
                    </Button>
                  </form>
                </Field>
                {v.blockPhones.length === 0 ? (
                  <EmptyState className="py-8" icon={<Ban />} title="No blocked numbers" description="Block customers who repeatedly refuse parcels or place fake orders." />
                ) : (
                  <>
                    {v.blockPhones.length > 10 && <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search blocked numbers…" />}
                    <div className="flex flex-wrap gap-2">
                      {shown.slice(0, 300).map((p) => (
                        <span key={p} className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 py-1 pl-2.5 pr-1 font-mono text-xs">
                          {p}
                          <button className="rounded p-0.5 text-muted-foreground hover:bg-background hover:text-red-600" onClick={() => form.set("blockPhones", v.blockPhones.filter((x) => x !== p))} aria-label={`Unblock ${p}`}>
                            <X className="size-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {v.blockPhones.length.toLocaleString()} blocked{shown.length > 300 && ` · showing first 300`}
                      </span>
                      <button className="inline-flex items-center gap-1 hover:text-red-600" onClick={() => form.set("blockPhones", [])}>
                        <Trash2 className="size-3.5" /> Clear all
                      </button>
                    </div>
                  </>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title={
                  <span className="inline-flex items-center gap-2">
                    Courier success rate check <Badge tone="purple">Pro</Badge>
                  </span>
                }
                description="Orders from customers below this courier delivery success rate will be flagged for review."
              />
              <CardBody className="space-y-4">
                <div className={isPro ? "" : "pointer-events-none opacity-50"}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Minimum success rate</span>
                    <span className="font-display text-lg font-bold tabular-nums">{v.minCourierSuccessRate === 0 ? "Off" : `${v.minCourierSuccessRate}%`}</span>
                  </div>
                  <input type="range" min={0} max={100} step={5} value={v.minCourierSuccessRate} onChange={(e) => form.set("minCourierSuccessRate", Number(e.target.value))} className="mt-2 w-full accent-[var(--primary)]" aria-label="Minimum courier success rate" disabled={!isPro} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0% (off)</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    We check the customer&apos;s phone number against delivery history across Steadfast, Pathao and RedX. A customer who received 7 out of 10 parcels has a 70% success rate. A good starting point is <strong>60–70%</strong>.
                  </p>
                </div>
                {!isPro && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-accent px-4 py-3">
                    <span className="text-sm">Courier ratio checks are available on the Pro plan.</span>
                    <Link href="/settings/billing">
                      <Button size="sm">
                        <Sparkles /> Upgrade to Pro
                      </Button>
                    </Link>
                  </div>
                )}
              </CardBody>
            </Card>
          </>
        }
        aside={
          <>
            <Card>
              <CardHeader title="How fraud checks work" />
              <CardBody className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">On every order page</span> you&apos;ll see a fraud check card with the customer&apos;s past orders, returns and courier success rate.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Gauge className="mt-0.5 size-4 shrink-0 text-amber-600" />
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Risky orders are flagged</span> so you can call to confirm, or ask for an advance delivery charge before shipping.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Ban className="mt-0.5 size-4 shrink-0 text-red-600" />
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Blocked numbers</span> can&apos;t place orders at all.
                  </p>
                </div>
              </CardBody>
            </Card>
            <Callout tone="success" title="Tip: ask for advance delivery charge">
              Turn on “Require delivery charge in advance” for Cash on Delivery in{" "}
              <Link href="/settings/payments" className="font-medium underline">
                Payments
              </Link>{" "}
              to discourage fake orders.
            </Callout>
          </>
        }
      />

      <Dialog
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Bulk block numbers"
        description="Paste phone numbers separated by new lines, commas or spaces. Invalid numbers are skipped."
        footer={
          <>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addBulk} disabled={!bulk.trim()}>
              Add numbers
            </Button>
          </>
        }
      >
        <Textarea rows={8} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={"01712345678\n+8801812345678\n01912-345678"} className="font-mono" />
      </Dialog>
      <SaveBar dirty={form.dirty} saving={saving} onSave={save} onDiscard={form.reset} />
    </>
  );
}
