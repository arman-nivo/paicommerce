"use client";
import { Card, CardBody, CardHeader, cn, Field, Input, Textarea } from "@pai/ui";
import { ImageField } from "@/components/media-picker";
import { SearchPreview } from "../../content/_components/seo-card";

export type SeoValues = { title: string; description: string; image: string | null };

function Counter({ n, max }: { n: number; max: number }) {
  return <span className={cn("shrink-0 tabular-nums", n > max ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>{n}/{max}</span>;
}

function Hint({ text, n, max }: { text: string; n: number; max: number }) {
  return (
    <span className="flex justify-between gap-3">
      <span>{n > max ? "Search engines may cut this off — try to shorten it." : text}</span>
      <Counter n={n} max={max} />
    </span>
  );
}

/** Facebook / WhatsApp style link share card. */
function ShareCard({ url, title, description, image, storeName }: { url: string; title: string; description: string; image: string | null; storeName: string }) {
  let host = url;
  try {
    host = new URL(url).host;
  } catch {
    /* keep raw */
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex aspect-[1.91/1] items-center justify-center bg-muted">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="size-full object-cover" />
        ) : (
          <span className="px-6 text-center text-sm text-muted-foreground">Add a social image — links without one get far fewer clicks.</span>
        )}
      </div>
      <div className="space-y-0.5 border-t border-border bg-muted/50 px-3 py-2.5">
        <div className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">{host}</div>
        <div className="line-clamp-1 text-sm font-semibold">{title || storeName}</div>
        <div className="line-clamp-1 text-xs text-muted-foreground">{description || "Add a description to tell people what you sell."}</div>
      </div>
    </div>
  );
}

export function SeoSection({
  value,
  onChange,
  errors,
  url,
  storeName,
  fallbackDescription,
}: {
  value: SeoValues;
  onChange: (v: SeoValues) => void;
  errors: Record<string, string>;
  url: string;
  storeName: string;
  fallbackDescription: string;
}) {
  const title = value.title || storeName;
  const description = value.description || fallbackDescription;
  return (
    <Card>
      <CardHeader title="Homepage SEO" description="What people see when your store shows up on Google or is shared on Facebook, WhatsApp and Messenger." />
      <CardBody className="space-y-5">
        <Field label="Homepage title" error={errors["seo.title"]} hint={<Hint text={`Leave blank to use "${storeName}". Include what you sell, e.g. "${storeName} – Handmade Sarees in Dhaka".`} n={value.title.length} max={60} />}>
          <Input value={value.title} maxLength={120} placeholder={storeName} onChange={(e) => onChange({ ...value, title: e.target.value })} />
        </Field>
        <Field label="Meta description" error={errors["seo.description"]} hint={<Hint text="One or two sentences about your store, delivery areas and payment options (COD, bKash…)." n={value.description.length} max={155} />}>
          <Textarea
            value={value.description}
            rows={3}
            maxLength={320}
            placeholder={fallbackDescription || "e.g. Shop authentic Jamdani sarees with cash on delivery all over Bangladesh. 7-day easy returns."}
            onChange={(e) => onChange({ ...value, description: e.target.value })}
          />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Google search preview</div>
            <SearchPreview url={url} title={title} description={description} />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Social share preview</div>
            <ShareCard url={url} title={title} description={description} image={value.image} storeName={storeName} />
          </div>
        </div>

        <Field label="Social sharing image" error={errors["seo.image"]} hint="Shown when your store link is shared. Best size 1200 × 630 px (JPG or PNG).">
          <ImageField value={value.image} onChange={(u) => onChange({ ...value, image: u })} aspect="aspect-[1.91/1]" label="Choose share image" className="max-w-md" />
        </Field>
      </CardBody>
    </Card>
  );
}
