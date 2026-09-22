import { NextResponse } from "next/server";
import { endCustomerSession } from "@/lib/customer";
import { siteFromParams, type SiteParams } from "@/lib/http";
import { siteUrl } from "@/lib/site";

async function logout(req: Request, { params }: SiteParams) {
  const site = await siteFromParams(params);
  if (site instanceof NextResponse) return site;
  await endCustomerSession(site);
  return NextResponse.redirect(new URL(siteUrl(site, "/"), req.url), 303);
}

export const GET = logout;
export const POST = logout;
