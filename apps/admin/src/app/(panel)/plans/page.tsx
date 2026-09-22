import { Check, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { Badge, Card, PageHeader } from "@pai/ui";
import { asc, count, db, eq, plans, sql, stores, subscriptions } from "@pai/db";
import { ActionButton } from "@/components/action-client";
import { requireAdminPage } from "@/lib/auth";
import { bdt, fmtNum } from "@/lib/format";
import { deletePlan, togglePlanActive } from "./actions";
import { PlanFormButton } from "./plan-form";

export const metadata = { title: "Plans" };

const lim = (v: number | null) => (v === null ? "Unlimited" : fmtNum(v));

export default async function PlansPage() {
  await requireAdminPage("plans.manage");
  const [rows, storeCounts, subCounts] = await Promise.all([
    db.select().from(plans).orderBy(asc(plans.sort), asc(plans.priceMonthly)),
    db.select({ planId: stores.planId, n: count() }).from(stores).groupBy(stores.planId),
    db
      .select({
        planId: subscriptions.planId,
        active: sql<number>`count(*) filter (where ${subscriptions.status} = 'active')`.mapWith(Number),
        trialing: sql<number>`count(*) filter (where ${subscriptions.status} = 'trialing')`.mapWith(Number),
        yearly: sql<number>`count(*) filter (where ${subscriptions.status} = 'active' and ${subscriptions.interval} = 'yearly')`.mapWith(Number),
      })
      .from(subscriptions)
      .groupBy(subscriptions.planId),
  ]);
  const sc = new Map(storeCounts.map((r) => [r.planId, r.n]));
  const subc = new Map(subCounts.map((r) => [r.planId, r]));

  return (
    <div>
      <PageHeader
        title="Plans"
        description="Subscription tiers, prices (BDT) and limits enforced across the platform"
        actions={
          <PlanFormButton>
            <Plus /> New plan
          </PlanFormButton>
        }
      />
      {rows.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">No plans yet — create the first one.</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {rows.map((p) => {
            const subs = subc.get(p.id);
            const mrr = (subs ? subs.active - subs.yearly : 0) * p.priceMonthly + (subs?.yearly ?? 0) * (p.priceYearly / 12);
            return (
              <Card key={p.id} className={`flex flex-col ${p.highlighted ? "ring-2 ring-primary/50" : ""} ${p.active ? "" : "opacity-70"}`}>
                <div className="border-b border-border p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-bold">{p.name}</h3>
                        {p.highlighted && (
                          <Badge tone="brand">
                            <Star className="size-3" /> Popular
                          </Badge>
                        )}
                        {!p.active && <Badge tone="gray">Inactive</Badge>}
                      </div>
                      <code className="text-xs text-muted-foreground">{p.code}</code>
                    </div>
                    <span className="text-xs text-muted-foreground">#{p.sort}</span>
                  </div>
                  {p.tagline && <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>}
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-display text-2xl font-bold">{bdt(p.priceMonthly)}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                    <span className="ml-auto text-xs text-muted-foreground">{bdt(p.priceYearly)}/yr</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 divide-x divide-border border-b border-border text-center">
                  <div className="p-3">
                    <div className="font-display text-lg font-bold tabular-nums">{fmtNum(sc.get(p.id) ?? 0)}</div>
                    <div className="text-[11px] text-muted-foreground">stores</div>
                  </div>
                  <div className="p-3">
                    <div className="font-display text-lg font-bold tabular-nums">{fmtNum(subs?.active ?? 0)}</div>
                    <div className="text-[11px] text-muted-foreground">paying{subs?.trialing ? ` · ${subs.trialing} trial` : ""}</div>
                  </div>
                  <div className="p-3">
                    <div className="font-display text-lg font-bold tabular-nums">{bdt(mrr)}</div>
                    <div className="text-[11px] text-muted-foreground">MRR</div>
                  </div>
                </div>
                <div className="flex-1 space-y-3 p-5 text-sm">
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    <dt className="text-muted-foreground">Products</dt>
                    <dd className="text-right font-medium">{lim(p.limits.products)}</dd>
                    <dt className="text-muted-foreground">Orders / month</dt>
                    <dd className="text-right font-medium">{lim(p.limits.ordersPerMonth)}</dd>
                    <dt className="text-muted-foreground">Staff</dt>
                    <dd className="text-right font-medium">{lim(p.limits.staff)}</dd>
                    <dt className="text-muted-foreground">Storage</dt>
                    <dd className="text-right font-medium">{p.limits.storage >= 1000 ? `${p.limits.storage / 1000} GB` : `${p.limits.storage} MB`}</dd>
                    <dt className="text-muted-foreground">Transaction fee</dt>
                    <dd className="text-right font-medium">{p.limits.transactionFeePct}%</dd>
                  </dl>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        ["Custom domain", p.limits.customDomain],
                        ["Premium themes", p.limits.premiumThemes],
                        ["API", p.limits.apiAccess],
                        ["No branding", p.limits.removeBranding],
                      ] as const
                    ).map(([l, on]) => (
                      <Badge key={l} tone={on ? "green" : "gray"}>
                        {on ? <Check className="size-3" /> : <X className="size-3" />} {l}
                      </Badge>
                    ))}
                  </div>
                  {p.features.length > 0 && (
                    <ul className="space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex gap-1.5">
                          <Check className="mt-0.5 size-3 shrink-0 text-emerald-600" /> {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 border-t border-border p-3">
                  <PlanFormButton variant="outline" initial={{ ...p }}>
                    <Pencil /> Edit
                  </PlanFormButton>
                  <ActionButton size="sm" variant="ghost" action={togglePlanActive.bind(null, { id: p.id, active: !p.active })}>
                    {p.active ? "Deactivate" : "Activate"}
                  </ActionButton>
                  <ActionButton
                    size="icon-sm"
                    variant="ghost"
                    className="ml-auto text-red-600"
                    aria-label="Delete plan"
                    action={deletePlan.bind(null, { id: p.id })}
                    confirm={{ title: `Delete ${p.name}?`, description: "Only plans with no stores or subscriptions can be deleted.", confirmLabel: "Delete", danger: true }}
                  >
                    <Trash2 />
                  </ActionButton>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
