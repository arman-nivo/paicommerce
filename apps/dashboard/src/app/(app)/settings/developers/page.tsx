import { BookOpen, ExternalLink } from "lucide-react";
import { WEB_URL } from "@pai/core";
import { apiKeys, asc, db, desc, eq, plans, webhooks } from "@pai/db";
import { Button } from "@pai/ui";
import { Header } from "@/components/page";
import { getCtx, getStorePlan } from "@/lib/ctx";
import { UpgradeCard } from "../_components/ui";
import { ApiKeys } from "./_components/api-keys";
import { Webhooks } from "./_components/webhooks";

export const metadata = { title: "Developers" };

export default async function DevelopersPage() {
  const ctx = await getCtx("settings.manage");
  const plan = await getStorePlan(ctx.store);
  const locked = !plan.limits.apiAccess;
  const [keys, hooks, allPlans] = await Promise.all([
    db.select().from(apiKeys).where(eq(apiKeys.storeId, ctx.store.id)).orderBy(desc(apiKeys.createdAt)),
    db.select().from(webhooks).where(eq(webhooks.storeId, ctx.store.id)).orderBy(desc(webhooks.createdAt)),
    locked ? db.select({ name: plans.name, limits: plans.limits }).from(plans).where(eq(plans.active, true)).orderBy(asc(plans.sort)) : Promise.resolve([]),
  ]);
  const upgradeTo = allPlans.find((p) => p.limits.apiAccess)?.name ?? "Pro";

  return (
    <div className="space-y-5">
      <Header
        title="Developers"
        description="Connect your own tools, ERP or mobile app to your store with API keys and webhooks."
        actions={
          <a href={`${WEB_URL}/docs/api`} target="_blank" rel="noreferrer">
            <Button variant="outline">
              <BookOpen /> API docs <ExternalLink className="size-3.5" />
            </Button>
          </a>
        }
      />
      {locked && (
        <UpgradeCard
          title="API access is a paid feature"
          description={`Your ${plan.name} plan doesn't include API keys or webhooks. Upgrade to ${upgradeTo} to sync inventory, push orders to your ERP and more.`}
          plan={upgradeTo}
        />
      )}
      <ApiKeys
        locked={locked}
        keys={keys.map((k) => ({
          id: k.id,
          name: k.name,
          prefix: k.prefix,
          scopes: k.scopes,
          createdAt: k.createdAt.toISOString(),
          lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
          revokedAt: k.revokedAt?.toISOString() ?? null,
        }))}
      />
      <Webhooks
        locked={locked}
        hooks={hooks.map((h) => ({ id: h.id, topic: h.topic, url: h.url, secret: h.secret, active: h.active, createdAt: h.createdAt.toISOString() }))}
      />
    </div>
  );
}
