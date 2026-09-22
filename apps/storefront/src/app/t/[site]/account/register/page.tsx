import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { customerFor } from "@/lib/customer";
import { renderThemePage } from "@/lib/render";
import { siteUrl } from "@/lib/site";
import { pageMeta, readParams, safeReturnTo, siteOr404, type PageProps } from "@/lib/pages";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const site = await siteOr404(params);
  return pageMeta(site, "/account/register", { title: "Create account", noindex: true });
}

export default async function AccountRegisterPage({ params, searchParams }: PageProps) {
  const site = await siteOr404(params);
  const sp = await readParams(searchParams);
  const returnTo = safeReturnTo(sp.return_to);
  if (await customerFor(site)) redirect(siteUrl(site, returnTo));
  return renderThemePage(site, "account", { path: "/account/register", searchParams: sp, resources: { account: { view: "register", returnTo } } });
}
