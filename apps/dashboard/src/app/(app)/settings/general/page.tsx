import { storeUrl } from "@pai/core";
import { BUSINESS_CATEGORIES } from "@pai/theme-sdk";
import { Header } from "@/components/page";
import { getCtx } from "@/lib/ctx";
import { GeneralForm } from "./_components/general-form";

export const metadata = { title: "General settings" };

export default async function GeneralSettingsPage() {
  const { store } = await getCtx("settings.manage");
  const a = store.address ?? {};
  return (
    <div>
      <Header title="General" description="Your store's name, branding, contact details and regional settings." />
      <GeneralForm
        slug={store.slug}
        url={storeUrl(store)}
        categories={BUSINESS_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
        initial={{
          name: store.name,
          logoUrl: store.logoUrl ?? null,
          description: store.description ?? "",
          email: store.email ?? "",
          phone: store.phone ?? "",
          address: {
            line1: a.line1 ?? "",
            area: a.area ?? "",
            city: a.city ?? "",
            district: a.district ?? "",
            postalCode: a.postalCode ?? "",
            country: a.country ?? "Bangladesh",
          },
          currency: store.currency || "BDT",
          timezone: store.timezone || "Asia/Dhaka",
          locale: store.locale || "en",
          category: store.category || "general",
        }}
      />
    </div>
  );
}
