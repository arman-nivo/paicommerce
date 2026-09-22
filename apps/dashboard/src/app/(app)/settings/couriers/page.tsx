import { MousePointerClick, RefreshCw, Wallet } from "lucide-react";
import { Card } from "@pai/ui";
import { Header } from "@/components/page";
import { getCtx, getStorePlan } from "@/lib/ctx";
import { IntegrationCatalog } from "../_components/integration-catalog";
import { loadIntegrations } from "../_lib/integrations";

export const metadata = { title: "Couriers" };

const HOW = [
  { icon: MousePointerClick, title: "One-click booking", body: "Open any order and click “Book courier”. Name, phone, address and COD amount are sent automatically." },
  { icon: RefreshCw, title: "Automatic status sync", body: "Tracking numbers and delivery status update on the order, so you always know where a parcel is." },
  { icon: Wallet, title: "COD reconciliation", body: "See which parcels are delivered and how much cash the courier owes you." },
];

export default async function CouriersPage() {
  const ctx = await getCtx("integrations.manage");
  const plan = await getStorePlan(ctx.store);
  const items = await loadIntegrations(ctx.store.id, plan.code, ["courier"]);
  return (
    <div>
      <Header title="Couriers" description="Connect your courier accounts to book deliveries straight from your orders." />
      <Card className="mb-6 grid gap-5 p-5 sm:grid-cols-3">
        {HOW.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
              <Icon className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </div>
        ))}
      </Card>
      <IntegrationCatalog items={items} testable />
    </div>
  );
}
