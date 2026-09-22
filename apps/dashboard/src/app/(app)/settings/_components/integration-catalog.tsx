"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Lock, Plug, Search, Sparkles } from "lucide-react";
import { Badge, Button, Card, EmptyState, Input, Switch, Tabs, cn, useConfirm } from "@pai/ui";
import { run } from "@/lib/client";
import { disconnectIntegration, setIntegrationEnabled } from "../_lib/integration-actions";
import type { IntegrationView } from "../_lib/integrations";
import { IntegrationLogo, StatusBadge } from "./integration-bits";
import { IntegrationDialog } from "./integration-dialog";

const TYPE_LABELS: Record<string, string> = { payment: "Payments", courier: "Couriers", analytics: "Analytics & pixels", marketing: "Marketing & sales channels", sms: "SMS", other: "Other" };

export function IntegrationCatalog({ items, groupByType, testable }: { items: IntegrationView[]; groupByType?: boolean; testable?: boolean }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [tab, setTab] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const current = items.find((i) => i.provider === open) ?? null;

  const connectedCount = items.filter((i) => i.connected || i.isDefault).length;
  const filtered = items.filter((i) => {
    if (tab === "connected" && !(i.connected || i.isDefault)) return false;
    if (tab === "bd" && i.region !== "BD") return false;
    if (q && !`${i.name} ${i.description}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  async function toggle(i: IntegrationView, enabled: boolean) {
    setBusy(i.provider);
    const res = await run(setIntegrationEnabled({ provider: i.provider, enabled }), { success: `${i.name} ${enabled ? "enabled" : "disabled"}` });
    setBusy(null);
    if (res) router.refresh();
  }

  async function disconnect(i: IntegrationView) {
    const ok = await confirm({
      title: `Disconnect ${i.name}?`,
      description: i.provider === "cod" ? "Your Cash on Delivery settings will be reset to the defaults." : "Saved credentials will be deleted. Customers won't see this option until you connect it again.",
      confirmLabel: "Disconnect",
      danger: true,
    });
    if (!ok) return;
    const res = await run(disconnectIntegration({ provider: i.provider }), { success: `${i.name} disconnected` });
    if (res) {
      setOpen(null);
      router.refresh();
    }
  }

  const groups: [string, IntegrationView[]][] = [];
  if (groupByType) {
    for (const i of filtered) {
      const g = groups.find(([t]) => t === i.type);
      if (g) g[1].push(i);
      else groups.push([i.type, [i]]);
    }
  } else groups.push(["all", filtered]);

  return (
    <div className="space-y-4">
      {dialog}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "all", label: "All", count: items.length },
            { value: "connected", label: "Active", count: connectedCount },
            ...(items.some((i) => i.region === "BD") ? [{ value: "bd", label: "Bangladesh" }] : []),
          ]}
        />
        {items.length > 6 && (
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9" />
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={<Plug />} title={tab === "connected" ? "Nothing connected yet" : "No matches"} description={tab === "connected" ? "Connect an integration from the All tab to get started." : "Try a different search."} action={tab !== "all" || q ? <Button variant="outline" onClick={() => { setTab("all"); setQ(""); }}>Show all</Button> : undefined} />
        </Card>
      ) : (
        groups.map(([type, list]) => (
          <section key={type} className="space-y-3">
            {groupByType && <h2 className="pt-2 text-sm font-semibold text-muted-foreground">{TYPE_LABELS[type] ?? type}</h2>}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {list.map((i) => (
                <Card key={i.provider} className={cn("flex flex-col p-5 transition", (i.connected || i.isDefault) && i.enabled && "border-emerald-300/60 dark:border-emerald-500/30")}>
                  <div className="flex items-start gap-3">
                    <IntegrationLogo name={i.name} color={i.color} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{i.name}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Badge tone={i.region === "BD" ? "green" : "blue"}>{i.region === "BD" ? "🇧🇩 BD" : "Global"}</Badge>
                        {i.popular && <Badge tone="brand">Popular</Badge>}
                        {i.plan && i.plan !== "free" && <Badge tone="purple">{i.plan === "pro" ? "Pro" : "Growth"}</Badge>}
                      </div>
                    </div>
                    {(i.connected || i.isDefault) && !i.locked && (
                      <Switch checked={i.enabled} disabled={busy === i.provider} onChange={(e) => toggle(i, e.target.checked)} aria-label={`Enable ${i.name}`} />
                    )}
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{i.description}</p>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    {i.locked ? (
                      <>
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Lock className="size-3.5" /> {i.plan === "pro" ? "Pro" : "Growth"} plan
                        </span>
                        <Link href="/settings/billing">
                          <Button size="sm">
                            <Sparkles /> Upgrade
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <StatusBadge i={i} />
                        <Button size="sm" variant={i.connected || i.isDefault ? "outline" : "default"} onClick={() => setOpen(i.provider)}>
                          {i.connected || i.isDefault ? "Manage" : "Connect"}
                        </Button>
                      </>
                    )}
                  </div>
                  {i.docsUrl && (
                    <a href={i.docsUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      Get your credentials <ExternalLink className="size-3" />
                    </a>
                  )}
                </Card>
              ))}
            </div>
          </section>
        ))
      )}

      {current && (
        <IntegrationDialog
          key={current.provider}
          item={current}
          testable={testable}
          onClose={() => setOpen(null)}
          onSaved={() => {
            setOpen(null);
            router.refresh();
          }}
          onDisconnect={() => disconnect(current)}
        />
      )}
    </div>
  );
}
