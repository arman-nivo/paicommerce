import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { orderDetail } from "@/lib/account";
import { customerFor } from "@/lib/customer";
import { renderThemePage } from "@/lib/render";
import { siteUrl } from "@/lib/site";
import { pageMeta, readParams, siteOr404, type PageProps } from "@/lib/pages";

type P = PageProps<{ id: string }>;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const site = await siteOr404(params);
  return pageMeta(site, "/account", { title: "Order details", noindex: true });
}

export default async function AccountOrderPage({ params, searchParams }: P) {
  const site = await siteOr404(params);
  const { id } = await params;
  const customer = await customerFor(site);
  if (!customer) redirect(siteUrl(site, `/account/login?return_to=${encodeURIComponent(`/account/orders/${id}`)}`));
  if (!UUID.test(id)) notFound();
  const order = await orderDetail(site.store.id, { id });
  // Customers only ever see their own orders.
  if (!order || order.customerId !== customer.id) notFound();
  const { customerId: _c, phone: _p, email: _e, ...detail } = order;
  void _c, void _p, void _e;
  return renderThemePage(site, "account", { path: `/account/orders/${id}`, searchParams: await readParams(searchParams), resources: { account: { view: "order", order: detail } } });
}
