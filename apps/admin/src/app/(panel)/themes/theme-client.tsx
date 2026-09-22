"use client";

import Link from "next/link";
import * as React from "react";
import { CheckCircle2, EyeOff, MoreHorizontal, Pencil, RefreshCw, Star, StarOff, XCircle, Eye, Plus, Trash2 } from "lucide-react";
import { Button, Dropdown, DropdownItem, Field, Input, Select, Switch, Textarea } from "@pai/ui";
import { useRunAction } from "@/components/action-client";
import { reviewTheme, setThemeFeatured, setThemeListed, syncRegistry, updateThemeListing } from "./actions";

export function ThemeRowActions({ id, status, featured, canManage }: { id: string; status: string; featured: boolean; canManage: boolean }) {
  const { run } = useRunAction();
  return (
    <Dropdown
      trigger={
        <Button size="icon-sm" variant="ghost" aria-label="Theme actions">
          <MoreHorizontal />
        </Button>
      }
    >
      <Link href={`/themes/${id}`} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted [&_svg]:size-4">
        <Pencil /> {canManage ? "Edit listing" : "View"}
      </Link>
      {canManage && status === "in_review" && (
        <Link href={`/themes/review#t-${id}`} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted [&_svg]:size-4">
          <CheckCircle2 /> Review
        </Link>
      )}
      {canManage && status === "approved" && (
        <DropdownItem icon={featured ? <StarOff /> : <Star />} onClick={() => run(() => setThemeFeatured({ id, featured: !featured }))}>
          {featured ? "Unfeature" : "Feature"}
        </DropdownItem>
      )}
      {canManage && status === "unlisted" && (
        <DropdownItem icon={<Eye />} onClick={() => run(() => setThemeListed({ id, listed: true }))}>
          Relist
        </DropdownItem>
      )}
      {canManage && status !== "unlisted" && (
        <DropdownItem icon={<EyeOff />} danger onClick={() => run(() => setThemeListed({ id, listed: false }))}>
          Unlist
        </DropdownItem>
      )}
    </Dropdown>
  );
}

export function ReviewForm({ id, hasErrors, compact }: { id: string; hasErrors: boolean; compact?: boolean }) {
  const [notes, setNotes] = React.useState("");
  const { run, pending } = useRunAction();
  const [decision, setDecision] = React.useState<null | "approve" | "reject">(null);
  const go = async (d: "approve" | "reject") => {
    if (d === "approve" && hasErrors && !window.confirm("The validator reported errors. Approve anyway?")) return;
    setDecision(d);
    const r = await run(() => reviewTheme({ id, decision: d, notes }));
    if (r.ok) setNotes("");
    setDecision(null);
  };
  return (
    <div className="space-y-2">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Review notes for the developer (required when rejecting)…"
        className={compact ? "min-h-[64px]" : "min-h-[96px]"}
      />
      <div className="flex flex-wrap justify-end gap-2">
        <Button size="sm" variant="destructive" loading={pending && decision === "reject"} disabled={pending} onClick={() => go("reject")}>
          <XCircle /> Reject
        </Button>
        <Button size="sm" variant="success" loading={pending && decision === "approve"} disabled={pending} onClick={() => go("approve")}>
          <CheckCircle2 /> Approve & publish
        </Button>
      </div>
    </div>
  );
}

function ListEditor({ label, values, onChange, placeholder, hint }: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string; hint?: string }) {
  const [draft, setDraft] = React.useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  return (
    <Field label={label} hint={hint}>
      <div className="space-y-1.5">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-1">
            <Input value={v} onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))} className="h-8 text-xs" />
            <Button type="button" size="icon-sm" variant="ghost" onClick={() => onChange(values.filter((_, j) => j !== i))} aria-label="Remove">
              <Trash2 />
            </Button>
          </div>
        ))}
        <div className="flex gap-1">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <Button type="button" size="sm" variant="outline" onClick={add}>
            <Plus /> Add
          </Button>
        </div>
      </div>
    </Field>
  );
}

export type ListingValue = {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  categories: string[];
  tags: string[];
  features: string[];
  price: number;
  thumbnailUrl: string | null;
  screenshots: string[];
  demoStoreSlug: string | null;
  repoUrl: string | null;
};

export function ListingEditor({ initial, categories, canManage }: { initial: ListingValue; categories: { id: string; label: string }[]; canManage: boolean }) {
  const [v, setV] = React.useState(initial);
  const [price, setPrice] = React.useState(String(initial.price / 100));
  const { run, pending } = useRunAction();
  const dirty = JSON.stringify(v) !== JSON.stringify(initial) || Math.round(parseFloat(price || "0") * 100) !== initial.price;
  const toggleCat = (id: string) => setV((p) => ({ ...p, categories: p.categories.includes(id) ? p.categories.filter((c) => c !== id) : [...p.categories, id] }));
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await run(() =>
          updateThemeListing({
            id: v.id,
            name: v.name,
            tagline: v.tagline ?? "",
            description: v.description ?? "",
            categories: v.categories,
            tags: v.tags,
            features: v.features,
            price: Math.round(parseFloat(price || "0") * 100),
            thumbnailUrl: v.thumbnailUrl ?? "",
            screenshots: v.screenshots.filter(Boolean),
            demoStoreSlug: v.demoStoreSlug ?? "",
            repoUrl: v.repoUrl ?? "",
          }),
        );
      }}
    >
      <fieldset disabled={!canManage} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name">
            <Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
          </Field>
          <Field label="Price (৳)" hint={Number(price) === 0 ? "Free theme" : "Premium — one-time purchase"}>
            <Input type="number" min={0} step="1" value={price} onChange={(e) => setPrice(e.target.value)} />
          </Field>
        </div>
        <Field label="Tagline">
          <Input value={v.tagline ?? ""} onChange={(e) => setV({ ...v, tagline: e.target.value })} />
        </Field>
        <Field label="Description">
          <Textarea value={v.description ?? ""} onChange={(e) => setV({ ...v, description: e.target.value })} className="min-h-[120px]" />
        </Field>
        <Field label="Categories">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => toggleCat(c.id)}
                className={`rounded-full border px-2.5 py-1 text-xs transition ${v.categories.includes(c.id) ? "border-primary bg-accent font-medium text-primary" : "border-border text-muted-foreground hover:border-input"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Demo store slug" hint="Store used for the “View demo” button">
            <Input value={v.demoStoreSlug ?? ""} onChange={(e) => setV({ ...v, demoStoreSlug: e.target.value.toLowerCase() })} placeholder="aurora-demo" className="font-mono" />
          </Field>
          <Field label="Repository / author URL">
            <Input value={v.repoUrl ?? ""} onChange={(e) => setV({ ...v, repoUrl: e.target.value })} placeholder="https://" />
          </Field>
        </div>
        <Field label="Thumbnail URL">
          <div className="flex gap-2">
            <Input value={v.thumbnailUrl ?? ""} onChange={(e) => setV({ ...v, thumbnailUrl: e.target.value })} placeholder="https://images.unsplash.com/…" />
            {v.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.thumbnailUrl} alt="" className="h-9 w-14 shrink-0 rounded border border-border object-cover" />
            )}
          </div>
        </Field>
        <ListEditor label={`Screenshots (${v.screenshots.length})`} values={v.screenshots} onChange={(screenshots) => setV({ ...v, screenshots })} placeholder="https://… image URL" />
        {v.screenshots.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {v.screenshots.map((s, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={s} alt="" className="h-20 w-32 shrink-0 rounded-lg border border-border object-cover" />
            ))}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <ListEditor label="Features" values={v.features} onChange={(features) => setV({ ...v, features })} placeholder="e.g. Mega menu" />
          <ListEditor label="Tags" values={v.tags} onChange={(tags) => setV({ ...v, tags })} placeholder="e.g. minimal" />
        </div>
      </fieldset>
      {canManage && (
        <div className="sticky bottom-0 -mx-5 flex items-center justify-end gap-2 border-t border-border bg-card px-5 py-3">
          {dirty && <span className="mr-auto text-xs text-amber-600">Unsaved changes</span>}
          <Button
            type="button"
            variant="outline"
            disabled={!dirty}
            onClick={() => {
              setV(initial);
              setPrice(String(initial.price / 100));
            }}
          >
            Discard
          </Button>
          <Button type="submit" loading={pending} disabled={!dirty}>
            Save listing
          </Button>
        </div>
      )}
    </form>
  );
}

export function SyncPanel({ missingCount }: { missingCount: number }) {
  const [newStatus, setNewStatus] = React.useState<"in_review" | "approved" | "draft">("in_review");
  const [overwrite, setOverwrite] = React.useState(false);
  const { run, pending } = useRunAction();
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
      <Field label="Status for new listings" className="lg:w-64">
        <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value as "in_review")}>
          <option value="in_review">In review (goes to review queue)</option>
          <option value="approved">Approved (publish immediately)</option>
          <option value="draft">Draft (hidden)</option>
        </Select>
      </Field>
      <label className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm lg:h-9 lg:py-0">
        <Switch checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} />
        Overwrite existing listing text, prices & images from manifests
      </label>
      <Button className="lg:ml-auto" loading={pending} onClick={() => run(() => syncRegistry({ newStatus, overwrite }))}>
        <RefreshCw /> Sync from code registry{missingCount ? ` (${missingCount} new)` : ""}
      </Button>
    </div>
  );
}
