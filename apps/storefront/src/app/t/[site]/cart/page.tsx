import type { Metadata } from "next";
import { renderThemePage } from "@/lib/render";
import { pageMeta, readParams, siteOr404, type PageProps } from "@/lib/pages";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const site = await siteOr404(params);
  return pageMeta(site, "/cart", { title: "Your cart", noindex: true });
}

export default async function CartPage({ params, searchParams }: PageProps) {
  const site = await siteOr404(params);
  return renderThemePage(site, "cart", { path: "/cart", searchParams: await readParams(searchParams) });
}
