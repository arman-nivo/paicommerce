"use client";
import * as React from "react";
import { Sparkles } from "lucide-react";
import { stripHtml, truncate } from "@pai/core";
import { Button, Card, CardBody, CardHeader, cn, Field, Input, Textarea } from "@pai/ui";
import { run } from "@/lib/client";
import { aiProductSeo } from "../../actions";
import type { FieldErrors, ProductFormValue } from "./types";

type Props = {
  value: ProductFormValue;
  set: <K extends keyof ProductFormValue>(k: K, v: ProductFormValue[K]) => void;
  errors: FieldErrors;
  storeUrl: string;
  onSlugTouched: () => void;
  canAi: boolean;
};

function Counter({ n, max }: { n: number; max: number }) {
  return <span className={cn("tabular-nums", n > max ? "text-red-600" : n > max * 0.9 ? "text-amber-600" : "text-muted-foreground")}>{n}/{max}</span>;
}

export function SeoCard({ value, set, errors, storeUrl, onSlugTouched, canAi }: Props) {
  const [busy, setBusy] = React.useState(false);
  const title = value.seoTitle || value.title || "Product title";
  const desc = value.seoDescription || truncate(stripHtml(value.description), 155) || "Add a description to show how this product appears in search results.";
  const host = storeUrl.replace(/^https?:\/\//, "");
  const suggest = async () => {
    setBusy(true);
    const r = await run(aiProductSeo({ title: value.title, description: value.description }), { success: "SEO suggestions added" });
    setBusy(false);
    if (r) {
      set("seoTitle", r.title);
      set("seoDescription", r.description);
    }
  };
  return (
    <Card>
      <CardHeader
        title="Search engine listing"
        description="How this product shows up on Google and when shared."
        action={
          canAi ? (
            <Button type="button" size="sm" variant="outline" onClick={suggest} loading={busy} disabled={!value.title.trim()}>
              {!busy && <Sparkles className="text-violet-500" />} Suggest with AI
            </Button>
          ) : undefined
        }
      />
      <CardBody className="space-y-4">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="truncate text-xs text-muted-foreground">
            {host} › products › {value.slug || "…"}
          </div>
          <div className="mt-1 truncate text-lg leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">{truncate(title, 65)}</div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{desc}</p>
        </div>
        <Field label={<span className="flex w-full justify-between">Page title <Counter n={value.seoTitle.length} max={60} /></span>} error={errors.seoTitle}>
          <Input value={value.seoTitle} maxLength={120} placeholder={value.title} onChange={(e) => set("seoTitle", e.target.value)} />
        </Field>
        <Field label={<span className="flex w-full justify-between">Meta description <Counter n={value.seoDescription.length} max={155} /></span>} error={errors.seoDescription}>
          <Textarea value={value.seoDescription} maxLength={320} rows={3} onChange={(e) => set("seoDescription", e.target.value)} placeholder="A short, compelling summary for search results." />
        </Field>
        <Field label="URL handle" error={errors.slug} hint={`${storeUrl}/products/${value.slug || "…"}`}>
          <div className="flex items-center overflow-hidden rounded-lg border border-input bg-card shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/15">
            <span className="hidden shrink-0 border-r border-border bg-muted px-2.5 py-2 text-xs text-muted-foreground sm:block">/products/</span>
            <input
              value={value.slug}
              maxLength={80}
              onChange={(e) => {
                onSlugTouched();
                set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9ঀ-৿-]/g, ""));
              }}
              onBlur={() => set("slug", value.slug.replace(/-+/g, "-").replace(/^-|-$/g, ""))}
              className="h-9 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
              aria-label="URL handle"
            />
          </div>
        </Field>
      </CardBody>
    </Card>
  );
}
