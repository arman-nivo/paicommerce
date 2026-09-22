import { Header } from "@/components/page";
import { getCtx } from "@/lib/ctx";
import { DeliveryForm } from "./_components/delivery-form";

export const metadata = { title: "Delivery settings" };

export default async function DeliverySettingsPage() {
  const { store } = await getCtx("settings.manage");
  const d = store.settings?.delivery;
  return (
    <div>
      <Header title="Delivery" description="Set delivery charges by area. Customers pick their zone at checkout and the charge is added to the order." />
      <DeliveryForm
        initial={{
          zones: (d?.zones ?? []).map((z) => ({ id: z.id, name: z.name, charge: z.charge, estimatedDays: z.estimatedDays ?? "" })),
          freeShippingOver: d?.freeShippingOver ?? null,
        }}
      />
    </div>
  );
}
