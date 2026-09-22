import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { customerOrders } from "@/lib/account";
import { customerFor } from "@/lib/customer";
import { renderThemePage } from "@/lib/render";
import { siteUrl } from "@/lib/site";
import { pageMeta, readParams, siteOr404, type PageProps } from "@/lib/pages";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const site = await siteOr404(params);
  return pageMeta(site, "/account", { title: "My account", noindex: true });
}

export default async function AccountPage({ params, searchParams }: PageProps) {
  const site = await siteOr404(params);
  const customer = await customerFor(site);
  if (!customer) redirect(siteUrl(site, "/account/login"));
  const orders = await customerOrders(site.store.id, customer.id);
  return renderThemePage(site, "account", { path: "/account", searchParams: await readParams(searchParams), resources: { account: { view: "overview", orders } } });
}
