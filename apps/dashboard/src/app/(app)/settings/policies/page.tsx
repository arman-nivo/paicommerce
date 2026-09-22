import { Header } from "@/components/page";
import { getCtx } from "@/lib/ctx";
import { PoliciesForm } from "./_components/policies-form";

export const metadata = { title: "Policies" };

export default async function PoliciesPage() {
  const { store } = await getCtx("settings.manage");
  const p = store.settings?.policies ?? {};
  return (
    <div>
      <Header title="Policies" description="Clear policies build trust and reduce order cancellations. They're linked in your store footer and at checkout." />
      <PoliciesForm
        store={{ name: store.name, email: store.email, phone: store.phone }}
        initial={{ refund: p.refund ?? "", privacy: p.privacy ?? "", terms: p.terms ?? "", shipping: p.shipping ?? "" }}
      />
    </div>
  );
}
