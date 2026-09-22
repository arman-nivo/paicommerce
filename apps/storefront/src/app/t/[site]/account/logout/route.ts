import { NextResponse } from "next/server";
import { endCustomerSession } from "@/lib/customer";
import { siteFromParams, type SiteParams } from "@/lib/http";
import { storeBaseUrl } from "@/lib/site";

async function logout(_req: Request, { params }: SiteParams) {
  const site = await siteFromParams(params);
  if (site instanceof NextResponse) return site;
  await endCustomerSession(site);
  // Absolute URL from the public host (req.url is the internal rewritten URL).
  return NextResponse.redirect(await storeBaseUrl(site) || "/", 303);
}

export const GET = logout;
export const POST = logout;
