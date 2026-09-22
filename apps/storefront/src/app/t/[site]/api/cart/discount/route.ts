import { NextResponse } from "next/server";
import { z } from "zod";
import { discountError, findDiscount, priceCart } from "@pai/core/orders";
import { getCart, getOrCreateCart, saveCart } from "@/lib/cart";
import { cartResponse } from "@/lib/cart-api";
import { pricingStore } from "@/lib/commerce";
import { error, parseBody, siteFromParams, type SiteParams } from "@/lib/http";

const Body = z.object({ code: z.string().trim().min(1, "Enter a discount code").max(64) });

/** POST {base}/api/cart/discount { code } → { cart } | 422 { error } */
export async function POST(req: Request, { params }: SiteParams) {
  const site = await siteFromParams(params);
  if (site instanceof NextResponse) return site;
  const body = await parseBody(req, Body);
  if (!body.ok) return body.response;
  const row = await getOrCreateCart(site);
  const d = await findDiscount(site.store.id, body.data.code);
  const priced = await priceCart(pricingStore(site.store), row.lines, {});
  const err = discountError(d, priced.subtotal);
  if (err || !d) return error(err ?? "Discount code is invalid", 422);
  const saved = await saveCart(site, row.id, { discountCode: d.code });
  return cartResponse(site, saved);
}

/** DELETE {base}/api/cart/discount → { cart } */
export async function DELETE(_req: Request, { params }: SiteParams) {
  const site = await siteFromParams(params);
  if (site instanceof NextResponse) return site;
  const row = await getCart(site);
  if (!row) return cartResponse(site, null);
  return cartResponse(site, await saveCart(site, row.id, { discountCode: null }));
}
