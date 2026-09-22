import { Header } from "@/components/page";
import { getCtx, getStorePlan } from "@/lib/ctx";
import { planAtLeast } from "../_lib/plan";
import { FraudForm } from "./_components/fraud-form";

export const metadata = { title: "Fraud prevention" };

export default async function FraudPage() {
  const ctx = await getCtx("settings.manage");
  const plan = await getStorePlan(ctx.store);
  const f = ctx.store.settings?.fraud ?? {};
  return (
    <div>
      <Header title="Fraud prevention" description="Stop fake orders and repeat parcel refusals before they cost you delivery charges." />
      <FraudForm isPro={planAtLeast(plan.code, "pro")} initial={{ blockPhones: f.blockPhones ?? [], minCourierSuccessRate: f.minCourierSuccessRate ?? 0 }} />
    </div>
  );
}
