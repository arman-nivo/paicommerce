"use client";
import { ExternalLink } from "lucide-react";
import { Card, CardBody, CardHeader, cn, Field, Input } from "@pai/ui";
import { normalizeSocial, SOCIAL_KEYS, type SocialKey } from "../_lib/schema";
import { BrandIcon, SOCIAL_META } from "./brand-icons";

export type SocialValues = Record<SocialKey, string>;

export function SocialSection({ value, onChange, errors }: { value: SocialValues; onChange: (v: SocialValues) => void; errors: Record<string, string> }) {
  const filled = SOCIAL_KEYS.filter((k) => value[k].trim()).length;
  return (
    <Card>
      <CardHeader
        title="Social links"
        description="Shown in your store's footer and contact page so customers can follow and message you."
        action={<span className="shrink-0 text-xs text-muted-foreground">{filled}/{SOCIAL_KEYS.length} added</span>}
      />
      <CardBody className="grid gap-4 sm:grid-cols-2">
        {SOCIAL_KEYS.map((k) => {
          const meta = SOCIAL_META[k];
          const raw = value[k];
          const resolved = raw.trim() ? normalizeSocial(k, raw) : "";
          const error = errors[`social.${k}`];
          return (
            <Field
              key={k}
              htmlFor={`social-${k}`}
              label={meta.label}
              error={error}
              hint={
                resolved ? (
                  <a href={resolved} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1 text-primary hover:underline">
                    <span className="truncate">{resolved.replace(/^https?:\/\//, "")}</span>
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                ) : resolved === null ? (
                  <span className="text-amber-600 dark:text-amber-400">We couldn&apos;t recognise this — paste the full link.</span>
                ) : (
                  meta.hint
                )
              }
            >
              <div className="relative">
                <BrandIcon name={k} color={meta.color || undefined} className={cn("pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2", !meta.color && "text-foreground")} />
                <Input
                  id={`social-${k}`}
                  value={raw}
                  maxLength={300}
                  inputMode={k === "whatsapp" ? "tel" : "url"}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={meta.placeholder}
                  className="pl-9"
                  onChange={(e) => onChange({ ...value, [k]: e.target.value })}
                />
              </div>
            </Field>
          );
        })}
      </CardBody>
    </Card>
  );
}
