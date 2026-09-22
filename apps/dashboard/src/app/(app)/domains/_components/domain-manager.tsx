"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { CircleAlert, CircleCheck, Clock, ExternalLink, Globe, Lock, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { Badge, Button, buttonVariants, Card, CardBody, CardHeader, CopyButton, Field, Input, useConfirm } from "@pai/ui";
import { run } from "@/lib/client";
import { connectDomain, removeDomain, verifyDomain, type VerifyResult } from "../actions";
import { requiredRecords } from "../_lib/dns";
import { RegistrarGuide } from "./registrar-guide";

export function DomainManager({ subdomain, subdomainUrl, customDomain, verified, allowed, planName, canBilling }: { subdomain: string; subdomainUrl: string; customDomain: string | null; verified: boolean; allowed: boolean; planName: string; canBilling: boolean }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [domain, setDomain] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [checking, setChecking] = React.useState(false);
  const [result, setResult] = React.useState<VerifyResult | null>(null);

  const connect = async () => {
    setSaving(true);
    const r = await run(connectDomain({ domain }), { success: (d) => `${d.domain} added — now update your DNS` });
    setSaving(false);
    if (r) {
      setDomain("");
      setResult(null);
      router.refresh();
    }
  };
  const verify = async () => {
    setChecking(true);
    const r = await run(verifyDomain({}));
    setChecking(false);
    if (r) {
      setResult(r);
      if (r.verified) router.refresh();
    }
  };
  const remove = async () => {
    const ok = await confirm({ title: `Remove ${customDomain}?`, description: "Customers will no longer reach your store at this domain. Your free address keeps working.", confirmLabel: "Remove domain", danger: true });
    if (!ok) return;
    if (await run(removeDomain({}), { success: "Domain removed" })) {
      setResult(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-5">
      {dialog}
      <Card>
        <CardHeader title="Your domains" description="Customers can visit your store at any of these addresses." />
        <ul className="divide-y divide-border">
          <li className="flex flex-wrap items-center gap-3 px-5 py-4">
            <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
              <Globe className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{subdomain}</div>
              <div className="text-xs text-muted-foreground">Free PaiCommerce address · always on</div>
            </div>
            <Badge tone="green" dot>
              Connected
            </Badge>
            {!(customDomain && verified) && <Badge tone="brand">Primary</Badge>}
            <a href={subdomainUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "ghost", size: "icon-sm" })} aria-label="Open">
              <ExternalLink />
            </a>
          </li>
          {customDomain && (
            <li className="flex flex-wrap items-center gap-3 px-5 py-4">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
                <Globe className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{customDomain}</div>
                <div className="text-xs text-muted-foreground">{verified ? "Custom domain · SSL certificate active" : "Custom domain · waiting for DNS"}</div>
              </div>
              {verified ? (
                <>
                  <Badge tone="green" dot>
                    Connected
                  </Badge>
                  <Badge tone="brand">Primary</Badge>
                  <Badge tone="green">
                    <ShieldCheck className="size-3" /> SSL
                  </Badge>
                </>
              ) : (
                <Badge tone="yellow" dot>
                  Pending verification
                </Badge>
              )}
              <Button variant="ghost" size="icon-sm" onClick={remove} aria-label="Remove domain" className="text-red-600">
                <Trash2 />
              </Button>
            </li>
          )}
        </ul>
      </Card>

      {!allowed && !customDomain ? (
        <Card>
          <CardBody className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10">
              <Lock className="size-5" />
            </span>
            <div className="flex-1">
              <div className="font-semibold">Use your own domain like yourbrand.com</div>
              <p className="text-sm text-muted-foreground">Custom domains (with free SSL) are included in the Growth plan and above. You're on {planName}.</p>
            </div>
            {canBilling && (
              <Link href="/settings/billing" className={buttonVariants()}>
                Upgrade plan
              </Link>
            )}
          </CardBody>
        </Card>
      ) : !customDomain ? (
        <Card>
          <CardHeader title="Connect a domain you own" description="Already bought a domain from a provider like Namecheap, GoDaddy or a BD registrar? Connect it here." />
          <CardBody>
            <form
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                if (domain.trim()) connect();
              }}
            >
              <Field label="Domain" hint="e.g. www.yourbrand.com or shop.yourbrand.com.bd" className="flex-1">
                <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="www.yourbrand.com" autoCapitalize="none" spellCheck={false} />
              </Field>
              <Button type="submit" loading={saving} disabled={!domain.trim()}>
                Connect domain
              </Button>
            </form>
          </CardBody>
        </Card>
      ) : null}

      {customDomain && !verified && (
        <Card>
          <CardHeader
            title="Point your domain to PaiCommerce"
            description="Add these records in your domain provider's DNS settings, then verify."
            action={
              <Button onClick={verify} loading={checking} size="sm">
                <RefreshCw /> Verify connection
              </Button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-2 text-left font-medium">Type</th>
                  <th className="px-5 py-2 text-left font-medium">Host / Name</th>
                  <th className="px-5 py-2 text-left font-medium">Value / Points to</th>
                </tr>
              </thead>
              <tbody>
                {requiredRecords(customDomain).map((r) => (
                  <tr key={r.type + r.host} className="border-t border-border align-top">
                    <td className="px-5 py-3 font-semibold">{r.type}</td>
                    <td className="px-5 py-3">
                      <span className="font-mono">{r.host}</span> <CopyButton value={r.host} />
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono">{r.value}</span> <CopyButton value={r.value} />
                      {r.note && <p className="mt-1 max-w-md text-xs text-muted-foreground">{r.note}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result && !result.verified && (
            <div className="mx-5 mb-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">{result.error ?? "Your DNS records don't point to PaiCommerce yet."}</p>
                {(result.cname.length > 0 || result.a.length > 0) && (
                  <p className="mt-1 text-xs">
                    We found: {[...result.cname.map((c) => `CNAME → ${c}`), ...result.a.map((a) => `A → ${a}`)].join(", ")}
                  </p>
                )}
                <p className="mt-1 flex items-center gap-1 text-xs">
                  <Clock className="size-3" /> DNS changes can take up to 48 hours to spread. Check again later.
                </p>
              </div>
            </div>
          )}
          {result?.verified && (
            <div className="mx-5 mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              <CircleCheck className="size-4" /> {result.domain} is connected!
            </div>
          )}
        </Card>
      )}

      {customDomain && !verified && <RegistrarGuide />}
    </div>
  );
}
