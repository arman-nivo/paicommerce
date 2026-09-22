"use client";
import * as React from "react";
import { Eye, EyeOff, ExternalLink, PlugZap } from "lucide-react";
import { Button, Dialog, Field, Input, Switch, Textarea, toast } from "@pai/ui";
import { run } from "@/lib/client";
import { saveIntegration, testIntegration } from "../_lib/integration-actions";
import type { IntegrationView } from "../_lib/integrations";
import { isSecretField } from "../_lib/secret";
import { IntegrationLogo, StatusBadge } from "./integration-bits";

function SecretInput({ value, onChange, placeholder, id }: { value: string; onChange: (v: string) => void; placeholder?: string; id: string }) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete="new-password" className="pr-9 font-mono" />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground" aria-label={show ? "Hide" : "Show"}>
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function IntegrationDialog({ item, onClose, onSaved, onDisconnect, testable }: { item: IntegrationView; onClose: () => void; onSaved: () => void; onDisconnect: () => void; testable?: boolean }) {
  const [values, setValues] = React.useState<Record<string, string | boolean>>(item.config);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const isCod = item.provider === "cod";
  const connected = item.connected || item.isDefault;

  async function save() {
    const e: Record<string, string> = {};
    for (const f of item.fields) {
      if (!f.required || f.type === "toggle") continue;
      const v = String(values[f.key] ?? "").trim();
      if (!v && !(isSecretField(f) && item.secrets[f.key]?.hasValue)) e[f.key] = `${f.label} is required`;
    }
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    const res = await run(saveIntegration({ provider: item.provider, config: values }), { success: connected ? `${item.name} updated` : `${item.name} connected` });
    setSaving(false);
    if (res) onSaved();
  }

  async function test() {
    setTesting(true);
    const res = await run(testIntegration({ provider: item.provider }));
    setTesting(false);
    if (res) toast.success(res.message);
  }

  return (
    <Dialog
      open
      onClose={onClose}
      size="md"
      title={
        <span className="flex items-center gap-3">
          <IntegrationLogo name={item.name} color={item.color} size={32} />
          {connected ? `Manage ${item.name}` : `Connect ${item.name}`}
        </span>
      }
      footer={
        <div className="flex w-full flex-wrap items-center gap-2">
          {item.connected && (
            <Button variant="ghost" className="mr-auto text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={onDisconnect}>
              {isCod ? "Reset" : "Disconnect"}
            </Button>
          )}
          {testable && item.connected && (
            <Button variant="outline" onClick={test} loading={testing}>
              <PlugZap /> Test connection
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className={item.connected ? "" : "ml-auto"}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            {connected ? "Save" : "Connect"}
          </Button>
        </div>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge i={item} />
          {item.docsUrl && (
            <a href={item.docsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Where do I find these? <ExternalLink className="size-3" />
            </a>
          )}
        </div>
        {item.fields.length === 0 && <p className="rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">No setup needed — click Connect and we&apos;ll handle the rest automatically.</p>}
        {item.fields.map((f) => {
          const id = `f-${item.provider}-${f.key}`;
          if (f.type === "toggle") {
            return (
              <label key={f.key} htmlFor={id} className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-border px-3 py-2.5">
                <span>
                  <span className="block text-sm font-medium">{f.label}</span>
                  {f.help && <span className="block text-xs text-muted-foreground">{f.help}</span>}
                </span>
                <Switch id={id} checked={values[f.key] === true} onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.checked }))} />
              </label>
            );
          }
          const secret = item.secrets[f.key];
          const label = (
            <>
              {f.label}
              {f.required && <span className="text-red-600"> *</span>}
            </>
          );
          const set = (v: string) => setValues((s) => ({ ...s, [f.key]: v }));
          return (
            <Field key={f.key} htmlFor={id} label={label} error={errors[f.key]} hint={isSecretField(f) && secret?.hasValue ? "Saved securely. Leave blank to keep the current value." : f.help}>
              {f.type === "password" ? (
                <SecretInput id={id} value={String(values[f.key] ?? "")} onChange={set} placeholder={secret?.hasValue ? secret.masked : f.placeholder} />
              ) : f.type === "textarea" ? (
                <Textarea id={id} placeholder={secret?.hasValue ? `${secret.masked} (saved — leave blank to keep)` : f.placeholder} rows={f.key.toLowerCase().includes("key") ? 5 : 3} value={String(values[f.key] ?? "")} onChange={(e) => set(e.target.value)} className={f.key.toLowerCase().includes("key") ? "font-mono text-xs" : undefined} />
              ) : (
                <Input id={id} value={String(values[f.key] ?? "")} onChange={(e) => set(e.target.value)} placeholder={f.placeholder} />
              )}
            </Field>
          );
        })}
        <button type="submit" hidden />
      </form>
    </Dialog>
  );
}
