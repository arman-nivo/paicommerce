import { NextResponse } from "next/server";
import { z } from "zod";
import { addLine } from "@/lib/cart-api";
import { parseBody, siteFromParams, type SiteParams } from "@/lib/http";

const Body = z.object({
  productId: z.uuid(),
  variantId: z.uuid().nullish(),
  quantity: z.coerce.number().int().min(1).max(999).default(1),
});

/** POST {base}/api/cart/add { productId, variantId?, quantity? } → { cart } */
export async function POST(req: Request, { params }: SiteParams) {
  const site = await siteFromParams(params);
  if (site instanceof NextResponse) return site;
  const body = await parseBody(req, Body);
  if (!body.ok) return body.response;
  return addLine(site, { productId: body.data.productId, variantId: body.data.variantId ?? null, quantity: body.data.quantity });
}
