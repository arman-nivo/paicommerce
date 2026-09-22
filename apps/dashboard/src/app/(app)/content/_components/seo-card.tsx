"use client";
import * as React from "react";
import { Card, CardBody, CardHeader, cn, Field, Input, Textarea } from "@pai/ui";

/** Google-style search result preview. */
export function SearchPreview({ url, title, description, className }: { url: string; title: string; description: string; className?: string }) {
  let host = url;
  let crumbs: string[] = [];
  try {
    const u = new URL(url);
    host = u.host;
    crumbs = u.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  } catch {
    /* keep raw */
  }
  return (
    <div className={cn("rounded-lg border border-border bg-background p-4", className)}>
      <div className="flex items-center gap-2 text-xs">
        <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">{host.slice(0, 1).toUpperCase()}</span>
        <div className="min-w-0">
          <div className="truncate text-foreground">{host}</div>
          <div className="truncate text-muted-foreground">{[url.split("/").slice(0, 3).join("/"), ...crumbs].join(" › ")}</div>
        </div>
      </div>
      <div className="mt-1.5 line-clamp-1 text-lg leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">{title || "Page title"}</div>
      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{description || "Add a description to control what customers see in Google search results."}</p>
    </div>
  );
}

function Counter({ n, max }: { n: number; max: number }) {
  return <span className={cn("tabular-nums", n > max ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>{n}/{max}</span>;
}

/** SEO editor card with live Google preview. Empty fields fall back to the content's title/description. */
export function SeoCard({
  title,
  description,
  onChange,
  fallbackTitle,
  fallbackDescription,
  url,
  storeName,
}: {
  title: string;
  description: string;
  onChange: (v: { title: string; description: string }) => void;
  fallbackTitle: string;
  fallbackDescription: string;
  url: string;
  storeName: string;
}) {
  const [open, setOpen] = React.useState(!!(title || description));
  const shownTitle = title || (fallbackTitle ? `${fallbackTitle} – ${storeName}` : "");
  const shownDesc = description || fallbackDescription;
  return (
    <Card>
      <CardHeader
        title="Search engine listing"
        description="How this appears on Google and when shared."
        action={
          <button type="button" onClick={() => setOpen((o) => !o)} className="text-sm font-medium text-primary hover:underline">
            {open ? "Hide" : "Edit"}
          </button>
        }
      />
      <CardBody className="space-y-4">
        <SearchPreview url={url} title={shownTitle} description={shownDesc} />
        {open && (
          <>
            <Field label="Page title" hint={<span className="flex justify-between"><span>Leave blank to use the title.</span><Counter n={title.length} max={70} /></span>}>
              <Input value={title} maxLength={120} placeholder={shownTitle || "SEO title"} onChange={(e) => onChange({ title: e.target.value, description })} />
            </Field>
            <Field label="Meta description" hint={<span className="flex justify-between"><span>Leave blank to use an excerpt of the content.</span><Counter n={description.length} max={160} /></span>}>
              <Textarea value={description} maxLength={320} rows={3} placeholder={fallbackDescription || "A short summary for search engines"} onChange={(e) => onChange({ title, description: e.target.value })} />
            </Field>
          </>
        )}
      </CardBody>
    </Card>
  );
}
