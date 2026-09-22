import { Header } from "@/components/page";
import { getCtx, getStorePlan } from "@/lib/ctx";
import { planAtLeast } from "../_lib/plan";
import { CheckoutForm } from "./_components/checkout-form";

export const metadata = { title: "Checkout settings" };

export default async function CheckoutSettingsPage() {
  const ctx = await getCtx("settings.manage");
  const plan = await getStorePlan(ctx.store);
  const c = ctx.store.settings?.checkout ?? {};
  return (
    <div>
      <Header title="Checkout" description="Control what customers fill in at checkout and how you capture abandoned orders." />
      <CheckoutForm
        canRecover={planAtLeast(plan.code, "growth")}
        initial={{
          guestCheckout: c.guestCheckout ?? true,
          requireEmail: c.requireEmail ?? false,
          orderNote: c.orderNote ?? true,
          captureIncomplete: c.captureIncomplete ?? true,
          minimumOrder: c.minimumOrder ? c.minimumOrder : null,
          termsUrl: c.termsUrl ?? "",
        }}
      />
    </div>
  );
}
