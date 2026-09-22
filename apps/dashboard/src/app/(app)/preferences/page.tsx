import { ExternalLink } from "lucide-react";
import { storeUrl } from "@pai/core";
import { buttonVariants } from "@pai/ui";
import { Header } from "@/components/page";
import { getCtx } from "@/lib/ctx";
import { PreferencesForm } from "./_components/preferences-form";
import { SOCIAL_KEYS, type SocialKey, type StorePassword } from "./_lib/schema";

export const metadata = { title: "Preferences" };

export default async function PreferencesPage() {
  const { store } = await getCtx("settings.manage");
  const s = store.settings ?? {};
  const pw = ((s as Record<string, unknown>).password ?? {}) as StorePassword;
  const url = storeUrl(store);

  return (
    <div>
      <Header
        title="Preferences"
        description="Search engine listing, favicon, social links, tracking pixels and password protection for your online store."
        actions={
          <a href={url} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ExternalLink />
            View store
          </a>
        }
      />
      <PreferencesForm
        url={url}
        storeName={store.name}
        fallbackDescription={store.description ?? ""}
        initial={{
          seo: { title: s.seo?.title ?? "", description: s.seo?.description ?? "", image: s.seo?.image ?? null },
          faviconUrl: store.faviconUrl ?? null,
          social: Object.fromEntries(SOCIAL_KEYS.map((k) => [k, s.social?.[k] ?? ""])) as Record<SocialKey, string>,
          tracking: {
            facebookPixelId: s.tracking?.facebookPixelId ?? "",
            ga4Id: s.tracking?.ga4Id ?? "",
            gtmId: s.tracking?.gtmId ?? "",
            tiktokPixelId: s.tracking?.tiktokPixelId ?? "",
          },
          password: { enabled: !!pw.enabled, password: pw.password ?? "", message: pw.message ?? "" },
        }}
      />
    </div>
  );
}
