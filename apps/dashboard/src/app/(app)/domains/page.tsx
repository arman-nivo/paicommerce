import { storeUrl } from "@pai/core";
import { Header } from "@/components/page";
import { can, getCtx, getStorePlan } from "@/lib/ctx";
import { DomainManager } from "./_components/domain-manager";
import { PLATFORM_DOMAIN } from "./_lib/dns";

export const metadata = { title: "Domains" };

export default async function DomainsPage() {
  const ctx = await getCtx("settings.manage");
  const { store } = ctx;
  const { limits, name } = await getStorePlan(store);
  return (
    <>
      <Header title="Domains" description="The web addresses customers use to visit your store." />
      <DomainManager
        subdomain={`${store.slug}.${PLATFORM_DOMAIN}`}
        subdomainUrl={storeUrl({ slug: store.slug })}
        customDomain={store.customDomain}
        verified={store.domainVerified}
        allowed={limits.customDomain}
        planName={name}
        canBilling={can(ctx, "billing.manage")}
      />
    </>
  );
}
