import { and, db, eq, storeIntegrations } from "@pai/db";
import { Header } from "@/components/page";
import { getCtx } from "@/lib/ctx";
import { NotificationsForm } from "./_components/notifications-form";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const { store } = await getCtx("settings.manage");
  const n = store.settings?.notifications ?? {};
  const sms = await db.query.storeIntegrations.findFirst({
    where: and(eq(storeIntegrations.storeId, store.id), eq(storeIntegrations.type, "sms"), eq(storeIntegrations.enabled, true)),
    columns: { provider: true },
  });
  return (
    <div>
      <Header title="Notifications" description="Choose how you hear about new orders and low stock." />
      <NotificationsForm
        email={store.email}
        phone={store.phone}
        smsConnected={!!sms}
        initial={{ orderEmail: n.orderEmail ?? true, orderSms: n.orderSms ?? false, lowStockThreshold: n.lowStockThreshold ?? 5 }}
      />
    </div>
  );
}
