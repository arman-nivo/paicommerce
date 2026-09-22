import { storeUrl, STOREFRONT_URL } from "@pai/core";
import { StoreProvider } from "@/components/store-context";
import { getCtx } from "@/lib/ctx";

/** Full-viewport, authenticated layout without the app shell (theme customizer & other editors). */
export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const { user, store, member } = await getCtx();
  return (
    <StoreProvider
      value={{
        store: { id: store.id, name: store.name, slug: store.slug, currency: store.currency, url: storeUrl(store), logoUrl: store.logoUrl, status: store.status },
        member: { role: member.role, permissions: member.permissions },
        user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
        storefrontUrl: STOREFRONT_URL,
      }}
    >
      <div className="h-dvh overflow-hidden bg-background text-foreground">{children}</div>
    </StoreProvider>
  );
}
