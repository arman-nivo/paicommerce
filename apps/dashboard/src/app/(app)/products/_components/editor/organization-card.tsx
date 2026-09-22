"use client";
import Link from "next/link";
import * as React from "react";
import { Search } from "lucide-react";
import { Card, CardBody, CardHeader, Checkbox, cn, Field, Input, Select, Switch } from "@pai/ui";
import { TagInput } from "@/components/tag-input";
import { STATUS_HELP } from "../../_lib/shared";
import type { EditorMeta, FieldErrors, ProductFormValue } from "./types";

type Props = { value: ProductFormValue; set: <K extends keyof ProductFormValue>(k: K, v: ProductFormValue[K]) => void; errors: FieldErrors; meta: EditorMeta };

export function StatusCard({ value, set }: Props) {
  return (
    <Card>
      <CardHeader title="Status" />
      <CardBody className="space-y-2">
        <Select value={value.status} onChange={(e) => set("status", e.target.value as ProductFormValue["status"])} aria-label="Product status">
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </Select>
        <p className="text-xs text-muted-foreground">{STATUS_HELP[value.status]}</p>
        <label className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <span>
            <span className="block text-sm font-medium">Featured product</span>
            <span className="block text-xs text-muted-foreground">Highlight it on your homepage where your theme supports it.</span>
          </span>
          <Switch checked={value.featured} onChange={(e) => set("featured", e.target.checked)} aria-label="Featured" />
        </label>
      </CardBody>
    </Card>
  );
}

export function OrganizationCard({ value, set, errors, meta }: Props) {
  const [q, setQ] = React.useState("");
  const cols = meta.collections.filter((c) => !q || c.title.toLowerCase().includes(q.toLowerCase()));
  const selectedFirst = [...cols].sort((a, b) => Number(value.collectionIds.includes(b.id)) - Number(value.collectionIds.includes(a.id)));
  return (
    <Card>
      <CardHeader title="Organization" />
      <CardBody className="space-y-4">
        <Field label="Product type" hint="e.g. Saree, T-shirt, Skincare" error={errors.productType}>
          <Input value={value.productType} list="pai-product-types" maxLength={120} onChange={(e) => set("productType", e.target.value)} />
          <datalist id="pai-product-types">
            {meta.types.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </Field>
        <Field label="Vendor / brand" error={errors.vendor}>
          <Input value={value.vendor} list="pai-vendors" maxLength={120} onChange={(e) => set("vendor", e.target.value)} />
          <datalist id="pai-vendors">
            {meta.vendors.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </Field>
        <Field label="Collections">
          {meta.collections.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
              No collections yet.{" "}
              <Link href="/products/collections/new" className="font-medium text-primary hover:underline">
                Create one
              </Link>{" "}
              to group products (e.g. “Eid Collection”).
            </p>
          ) : (
            <div className="rounded-lg border border-border">
              {meta.collections.length > 6 && (
                <div className="relative border-b border-border">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search collections" className="h-8 w-full bg-transparent pl-8 pr-2 text-sm outline-none" />
                </div>
              )}
              <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin">
                {selectedFirst.map((c) => {
                  const on = value.collectionIds.includes(c.id);
                  return (
                    <label key={c.id} className={cn("flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted", on && "font-medium")}>
                      <Checkbox checked={on} onChange={() => set("collectionIds", on ? value.collectionIds.filter((x) => x !== c.id) : [...value.collectionIds, c.id])} />
                      <span className="truncate">{c.title}</span>
                    </label>
                  );
                })}
                {!cols.length && <p className="px-2 py-2 text-xs text-muted-foreground">No matches</p>}
              </div>
            </div>
          )}
        </Field>
        <Field label="Tags" hint="Help customers find it in search, e.g. eid, cotton, gift." error={errors.tags}>
          <TagInput value={value.tags} onChange={(v) => set("tags", v.slice(0, 50))} suggestions={meta.tags.filter((t) => !value.tags.includes(t))} />
        </Field>
      </CardBody>
    </Card>
  );
}
