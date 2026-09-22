import { Header } from "@/components/page";
import { getCtx, getStorePlan } from "@/lib/ctx";
import { IntegrationCatalog } from "../_components/integration-catalog";
import { loadIntegrations } from "../_lib/integrations";

export const metadata = { title: "Apps & integrations" };

export default async function AppsPage() {
  const ctx = await getCtx("integrations.manage");
  const plan = await getStorePlan(ctx.store);
  const items = await loadIntegrations(ctx.store.id, plan.code, ["analytics", "marketing", "sms", "other"]);
  return (
    <div>
      <Header title="Apps & integrations" description="Track ads, sell on Facebook & Google, chat with customers and send SMS." />
      <IntegrationCatalog items={items} groupByType />
    </div>
  );
}
