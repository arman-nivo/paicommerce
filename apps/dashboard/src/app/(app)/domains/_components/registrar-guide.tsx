"use client";
import * as React from "react";
import { Tabs } from "@pai/ui";

const GUIDES: { value: string; label: string; steps: React.ReactNode[] }[] = [
  {
    value: "bd",
    label: "BD registrars",
    steps: [
      <>Log in to your domain provider's client area (e.g. ExonHost, XeonBD, Hostever, Web Hosting BD, Alpha Net, or BTCL for .bd domains).</>,
      <>Go to <b>Domains → My Domains</b> and click <b>Manage</b> next to your domain.</>,
      <>Open <b>DNS Management</b> (sometimes called <b>Manage DNS</b>, <b>DNS Zone Editor</b> or in cPanel <b>Zone Editor</b>).</>,
      <>Delete any existing <b>A</b> record for <b>@</b> and any <b>CNAME</b>/<b>A</b> record for the same host you're adding — they conflict.</>,
      <>Add the records shown above exactly. Leave TTL as default (or 3600).</>,
      <>Save, come back here and click <b>Verify connection</b>. If your domain uses the provider's hosting nameservers, changes usually show within 1 hour.</>,
    ],
  },
  {
    value: "namecheap",
    label: "Namecheap",
    steps: [
      <>Sign in and open <b>Domain List</b> → <b>Manage</b> next to your domain.</>,
      <>Go to the <b>Advanced DNS</b> tab. Make sure Nameservers is set to <b>Namecheap BasicDNS</b>.</>,
      <>Remove the default <b>URL Redirect</b> and <b>parking page</b> records.</>,
      <>Click <b>Add new record</b> and add the records shown above (use <b>@</b> for the root domain).</>,
      <>Click the ✓ to save each record, then verify here.</>,
    ],
  },
  {
    value: "godaddy",
    label: "GoDaddy",
    steps: [
      <>Sign in and go to <b>My Products → Domains</b>, then choose <b>DNS</b> next to your domain.</>,
      <>Edit the existing <b>A</b> record named <b>@</b> (replace “Parked”) with the IP above.</>,
      <>Edit the <b>CNAME</b> record named <b>www</b> and set it to the value above.</>,
      <>Save and click <b>Verify connection</b> here.</>,
    ],
  },
  {
    value: "cloudflare",
    label: "Cloudflare",
    steps: [
      <>Open your domain in the Cloudflare dashboard and go to <b>DNS → Records</b>.</>,
      <>Add a <b>CNAME</b> record for <b>@</b> (Cloudflare flattens it automatically) or an <b>A</b> record with the IP above, plus the <b>www</b> CNAME.</>,
      <>Set the proxy status to <b>DNS only</b> (grey cloud) so we can issue your free SSL certificate.</>,
      <>Save and verify here.</>,
    ],
  },
];

export function RegistrarGuide() {
  const [tab, setTab] = React.useState("bd");
  const g = GUIDES.find((x) => x.value === tab)!;
  return (
    <div>
      <Tabs tabs={GUIDES.map((x) => ({ value: x.value, label: x.label }))} value={tab} onChange={setTab} />
      <ol className="mt-4 space-y-2.5">
        {g.steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-primary">{i + 1}</span>
            <span className="pt-0.5 text-muted-foreground [&_b]:font-medium [&_b]:text-foreground">{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
