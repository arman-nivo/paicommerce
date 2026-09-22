"use client";
import * as React from "react";
import { Eye, EyeOff, Lock, LockOpen } from "lucide-react";
import { Badge, Card, CardBody, CardHeader, Field, Input, Label, Switch, Textarea } from "@pai/ui";
import { ImageField } from "@/components/media-picker";

export type PasswordValues = { enabled: boolean; password: string; message: string };

export function FaviconCard({ value, onChange, storeName, error }: { value: string | null; onChange: (v: string | null) => void; storeName: string; error?: string }) {
  return (
    <Card>
      <CardHeader title="Favicon" description="The small icon shown in browser tabs and bookmarks." />
      <CardBody className="space-y-4">
        <div className="flex items-start gap-4">
          <ImageField value={value} onChange={onChange} aspect="aspect-square" label="Upload" className="w-24 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Browser tab preview</div>
            <div className="flex max-w-full items-center gap-2 rounded-t-lg border border-b-0 border-border bg-background px-3 py-2">
              {value ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={value} alt="" className="size-4 shrink-0 rounded-sm object-cover" />
              ) : (
                <span className="flex size-4 shrink-0 items-center justify-center rounded-sm bg-muted text-[9px] font-bold text-muted-foreground">{storeName.slice(0, 1).toUpperCase()}</span>
              )}
              <span className="truncate text-xs">{storeName}</span>
            </div>
          </div>
        </div>
        {error ? <p className="text-xs text-red-600">{error}</p> : <p className="text-xs text-muted-foreground">Use a square PNG, at least 48 × 48 px (512 × 512 is ideal). Your logo mark works well.</p>}
      </CardBody>
    </Card>
  );
}

export function PasswordCard({ value, onChange, errors }: { value: PasswordValues; onChange: (v: PasswordValues) => void; errors: Record<string, string> }) {
  const [show, setShow] = React.useState(false);
  return (
    <Card>
      <CardHeader
        title="Password protection"
        description="Hide your store from the public while you set it up or run a private sale."
        action={value.enabled ? <Badge tone="yellow" dot>On</Badge> : <Badge tone="gray">Off</Badge>}
      />
      <CardBody className="space-y-4">
        <div className="flex items-start gap-3">
          <Switch id="pw-enabled" checked={value.enabled} onChange={(e) => onChange({ ...value, enabled: e.target.checked })} className="mt-0.5" />
          <Label htmlFor="pw-enabled" className="cursor-pointer leading-snug">
            <span className="flex items-center gap-1.5 font-medium">
              {value.enabled ? <Lock className="size-3.5" /> : <LockOpen className="size-3.5" />}
              Require a password to visit the store
            </span>
            <span className="mt-0.5 block text-xs font-normal text-muted-foreground">Only people with the password can browse and order.</span>
          </Label>
        </div>
        {value.enabled && (
          <>
            <Field label="Password" htmlFor="pw-value" error={errors["password.password"]} hint="Share it with the customers you want to let in.">
              <div className="relative">
                <Input
                  id="pw-value"
                  type={show ? "text" : "password"}
                  value={value.password}
                  maxLength={100}
                  autoComplete="new-password"
                  className="pr-10"
                  placeholder="At least 4 characters"
                  onChange={(e) => onChange({ ...value, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            <Field label="Message for visitors" error={errors["password.message"]} hint="Shown on the password page, e.g. launch date or how to get access.">
              <Textarea
                rows={3}
                maxLength={500}
                value={value.message}
                placeholder="We're opening soon! Follow us on Facebook for the launch date."
                onChange={(e) => onChange({ ...value, message: e.target.value })}
              />
            </Field>
          </>
        )}
        <p className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">Honored by your storefront where supported — visitors see a password page with your message.</p>
      </CardBody>
    </Card>
  );
}
