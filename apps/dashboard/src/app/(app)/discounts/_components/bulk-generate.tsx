"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, Download, ListPlus } from "lucide-react";
import { Button, Checkbox, Dialog, Field, Input } from "@pai/ui";
import { useStore } from "@/components/store-context";
import { run } from "@/lib/client";
import { toCsv } from "@/lib/csv";
import { bulkGenerateDiscounts } from "../actions";
import { normalizeCode } from "../_lib/shared";
import { DateFields, RequirementFields, settingsValid, TypeValueFields, type DiscountSettings } from "./fields";

const INITIAL: DiscountSettings & { prefix: string; count: number; title: string } = {
  prefix: "",
  count: 20,
  title: "",
  type: "percentage",
  value: 10,
  minSubtotal: null,
  usageLimit: 1,
  oncePerCustomer: true,
  startsAt: "",
  endsAt: "",
  active: true,
};

function download(filename: string, csv: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function BulkGenerateButton() {
  const router = useRouter();
  const { store } = useStore();
  const [open, setOpen] = React.useState(false);
  const [v, setV] = React.useState(INITIAL);
  const [saving, setSaving] = React.useState(false);
  const [codes, setCodes] = React.useState<string[] | null>(null);
  const patch = (p: Partial<typeof INITIAL>) => setV((s) => ({ ...s, ...p }));
  const countOk = v.count >= 1 && v.count <= 100;
  const valid = countOk && settingsValid(v);

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setCodes(null);
      setV(INITIAL);
    }, 200);
  };

  const csvFor = (list: string[]) =>
    toCsv([["Code"], ...list.map((c) => [c])]);

  const generate = async () => {
    if (!valid) return;
    setSaving(true);
    const res = await run(
      bulkGenerateDiscounts({
        prefix: v.prefix,
        count: v.count,
        title: v.title || (v.prefix ? `Bulk: ${v.prefix}` : "Bulk codes"),
        type: v.type,
        value: v.value,
        minSubtotal: v.minSubtotal,
        usageLimit: v.usageLimit,
        oncePerCustomer: v.oncePerCustomer,
        startsAt: v.startsAt || null,
        endsAt: v.endsAt || null,
        active: v.active,
      }),
      { success: (d) => `${d.codes.length} codes created` },
    );
    setSaving(false);
    if (res) {
      setCodes(res.codes);
      download(`discount-codes-${store.slug}-${v.prefix || "bulk"}.csv`, csvFor(res.codes));
      router.refresh();
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <ListPlus className="size-4" /> Bulk generate
      </Button>
      <Dialog
        open={open}
        onClose={close}
        size="lg"
        title={codes ? "Codes ready" : "Bulk generate codes"}
        description={codes ? undefined : "Create many unique codes with the same settings — great for influencers, giveaways or printed flyers."}
        footer={
          codes ? (
            <>
              <Button variant="outline" onClick={() => download(`discount-codes-${store.slug}-${v.prefix || "bulk"}.csv`, csvFor(codes))}>
                <Download className="size-4" /> Download CSV again
              </Button>
              <Button onClick={close}>Done</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={close} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={generate} loading={saving} disabled={!valid}>
                Generate {countOk ? v.count : ""} codes
              </Button>
            </>
          )
        }
      >
        {codes ? (
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm">
              <CircleCheck className="size-4 text-emerald-600" /> {codes.length} codes were created and downloaded as a CSV file.
            </p>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-sm scrollbar-thin">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                {codes.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Prefix (optional)" hint={`e.g. ${v.prefix ? v.prefix.replace(/[-_]$/, "") : "EID"}-7KQ2MX`}>
                <Input value={v.prefix} onChange={(e) => patch({ prefix: normalizeCode(e.target.value).slice(0, 20) })} placeholder="EID" className="font-mono uppercase" />
              </Field>
              <Field label="How many codes" error={!countOk ? "1 to 100 codes" : null}>
                <Input inputMode="numeric" value={v.count || ""} onChange={(e) => patch({ count: Math.min(100, Number(e.target.value.replace(/\D/g, "")) || 0) })} className="tabular-nums" />
              </Field>
              <Field label="Internal name">
                <Input value={v.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Influencer batch" />
              </Field>
            </div>
            <TypeValueFields value={v} onChange={patch} />
            <RequirementFields value={v} onChange={patch} usageLabel="Uses per code" />
            <DateFields value={v} onChange={patch} />
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <Checkbox checked={v.oncePerCustomer} onChange={(e) => patch({ oncePerCustomer: e.target.checked })} /> One use per customer
            </label>
          </div>
        )}
      </Dialog>
    </>
  );
}
