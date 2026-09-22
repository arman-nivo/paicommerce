import { Banknote, CreditCard, Smartphone } from "lucide-react";
import { Card } from "@pai/ui";
import { Header } from "@/components/page";
import { getCtx, getStorePlan } from "@/lib/ctx";
import { IntegrationCatalog } from "../_components/integration-catalog";
import { loadIntegrations } from "../_lib/integrations";

export const metadata = { title: "Payments" };

const HOW = [
  { icon: Banknote, title: "Cash on Delivery", body: "Customers pay the courier in cash. The courier sends the money to you, minus their charge." },
  { icon: Smartphone, title: "bKash, Nagad & Rocket", body: "Via gateway (instant confirmation) or Send Money — customer pays your number and enters the TrxID." },
  { icon: CreditCard, title: "Cards & online banking", body: "SSLCommerz, aamarPay or Stripe redirect customers to a secure payment page and confirm automatically." },
];

export default async function PaymentsPage() {
  const ctx = await getCtx("integrations.manage");
  const plan = await getStorePlan(ctx.store);
  const items = await loadIntegrations(ctx.store.id, plan.code, ["payment"]);
  const active = items.filter((i) => i.enabled).length;
  return (
    <div>
      <Header title="Payments" description={`Choose how customers pay you. ${active} method${active === 1 ? "" : "s"} active at checkout.`} />
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
      <IntegrationCatalog items={items} />
    </div>
  );
}
