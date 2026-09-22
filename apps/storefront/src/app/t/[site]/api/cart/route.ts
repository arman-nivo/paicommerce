import { NextResponse } from "next/server";
import { getCart } from "@/lib/cart";
import { cartResponse } from "@/lib/cart-api";
import { siteFromParams, type SiteParams } from "@/lib/http";

export const dynamic = "force-dynamic";

/** GET {base}/api/cart → { cart } */
export async function GET(_req: Request, { params }: SiteParams) {
  const site = await siteFromParams(params);
  if (site instanceof NextResponse) return site;
  return cartResponse(site, await getCart(site));
}
