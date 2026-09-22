import { NextResponse } from "next/server";
import { z } from "zod";
import { setLineQuantity } from "@/lib/cart-api";
import { parseBody, siteFromParams, type SiteParams } from "@/lib/http";

const Body = z.object({ key: z.string().min(3).max(80), quantity: z.coerce.number().int().min(0).max(999) });

/** POST {base}/api/cart/update { key, quantity } → { cart } (quantity 0 removes the line) */
export async function POST(req: Request, { params }: SiteParams) {
  const site = await siteFromParams(params);
  if (site instanceof NextResponse) return site;
  const body = await parseBody(req, Body);
  if (!body.ok) return body.response;
  return setLineQuantity(site, body.data.key, body.data.quantity);
}
