import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserStores, requireUser } from "@pai/core/session";
import { STOREFRONT_ROOT_DOMAIN } from "@pai/core";
import { manifests } from "@pai/theme-registry/manifests";
import { BUSINESS_CATEGORIES } from "@pai/theme-sdk";
import { Wizard } from "./wizard";

export const metadata: Metadata = { title: "Set up your store" };

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const stores = await getUserStores(user.id);
  if (stores.length && !sp.new) redirect("/");
  const domain = STOREFRONT_ROOT_DOMAIN.startsWith("localhost") ? "paicommerce.com" : STOREFRONT_ROOT_DOMAIN;
  return (
    <Wizard
      userName={user.name.split(" ")[0] ?? user.name}
      hasStores={stores.length > 0}
      domain={domain}
      categories={BUSINESS_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
      themes={manifests.map((m) => ({ slug: m.slug, name: m.name, tagline: m.tagline, thumbnail: m.thumbnail, categories: [...m.categories], price: m.price, features: m.features ?? [] }))}
    />
  );
}
