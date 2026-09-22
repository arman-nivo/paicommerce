import { storeUrl, STOREFRONT_URL } from "@pai/core";
import { getUserStores } from "@pai/core/session";
import { AppShell } from "@/components/shell/app-shell";
import { StoreProvider } from "@/components/store-context";
import { getCtx, getStorePlan } from "@/lib/ctx";
import { getNavCounts, getNotifications } from "@/lib/shell-data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getCtx();
  const { user, store, member } = ctx;
  const [counts, notifications, memberships, plan] = await Promise.all([getNavCounts(store.id), getNotifications(store), getUserStores(user.id), getStorePlan(store)]);
  const url = storeUrl(store);
  const trialDaysLeft = store.status === "trial" && store.trialEndsAt ? Math.ceil((store.trialEndsAt.getTime() - Date.now()) / 86400_000) : null;

  return (
    <StoreProvider
      value={{
        store: { id: store.id, name: store.name, slug: store.slug, currency: store.currency, url, logoUrl: store.logoUrl, status: store.status },
        member: { role: member.role, permissions: member.permissions },
        user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
        storefrontUrl: STOREFRONT_URL,
      }}
    >
      <AppShell
        counts={counts}
        notifications={notifications}
        stores={memberships.map((m) => ({ id: m.store.id, name: m.store.name, slug: m.store.slug, logoUrl: m.store.logoUrl, role: m.role }))}
        impersonating={!!user.impersonatorId}
        banner={{ status: store.status, trialDaysLeft, planName: plan.name, planCode: plan.code }}
      >
        {children}
      </AppShell>
    </StoreProvider>
  );
}
