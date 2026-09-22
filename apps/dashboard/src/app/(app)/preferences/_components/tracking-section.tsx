"use client";
import Link from "next/link";
import { ArrowRight, ChartColumn, CircleCheck, Info } from "lucide-react";
import { Card, CardBody, CardHeader, Field, Input } from "@pai/ui";
import { TRACKING_PATTERNS, type TrackingKey } from "../_lib/schema";

export type TrackingValues = Record<TrackingKey, string>;

const FIELDS: { key: TrackingKey; label: string; placeholder: string; hint: string; numeric?: boolean }[] = [
  { key: "facebookPixelId", label: "Meta (Facebook) Pixel ID", placeholder: "1234567890123456", hint: "Events Manager › Data sources › your pixel. Numbers only.", numeric: true },
  { key: "ga4Id", label: "Google Analytics 4 — Measurement ID", placeholder: "G-XXXXXXXXXX", hint: "GA4 › Admin › Data streams › Web. Starts with G-." },
  { key: "gtmId", label: "Google Tag Manager — Container ID", placeholder: "GTM-XXXXXXX", hint: "Shown at the top of your Tag Manager workspace. Starts with GTM-." },
  { key: "tiktokPixelId", label: "TikTok Pixel ID", placeholder: "C4ABCDEF12GHIJ345678", hint: "TikTok Ads Manager › Assets › Events › Web events." },
];

export function TrackingSection({ value, onChange, errors }: { value: TrackingValues; onChange: (v: TrackingValues) => void; errors: Record<string, string> }) {
  return (
    <Card>
      <CardHeader title="Tracking & analytics" description="Paste your IDs and we'll add the tracking code to every storefront page — no coding needed." />
      <CardBody className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => {
            const v = value[f.key];
            const valid = !!v.trim() && TRACKING_PATTERNS[f.key].re.test(v.trim());
            return (
              <Field key={f.key} htmlFor={`trk-${f.key}`} label={f.label} error={errors[`tracking.${f.key}`]} hint={f.hint}>
                <div className="relative">
                  <Input
                    id={`trk-${f.key}`}
                    value={v}
                    maxLength={40}
                    spellCheck={false}
                    autoComplete="off"
                    inputMode={f.numeric ? "numeric" : "text"}
                    placeholder={f.placeholder}
                    className="pr-9 font-mono text-[13px]"
                    onChange={(e) => onChange({ ...value, [f.key]: f.numeric ? e.target.value.replace(/\D/g, "") : e.target.value.toUpperCase().replace(/\s/g, "") })}
                  />
                  {valid && <CircleCheck className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" aria-label="Looks good" />}
                </div>
              </Field>
            );
          })}
        </div>
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-3 text-sm sm:flex-row sm:items-center">
          <Info className="size-4 shrink-0 text-muted-foreground" />
          <p className="flex-1 text-muted-foreground">
            These add browser-side pixels only. For server-side tracking (Meta Conversions API, TikTok Events API) — which keeps counting sales when ad blockers or iOS hide the pixel — connect them in Apps.
          </p>
          <Link href="/settings/apps" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline">
            <ChartColumn className="size-4" />
            Settings › Apps
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
