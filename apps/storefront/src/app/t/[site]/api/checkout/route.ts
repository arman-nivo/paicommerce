import { NextResponse } from "next/server";
import { CheckoutError } from "@pai/core/orders";
import { getCart } from "@/lib/cart";
import { placeOrder } from "@/lib/checkout";
import { customerFor } from "@/lib/customer";
import { clientIp, error, json, parseBody, siteFromParams, type SiteParams } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { CheckoutSchema } from "./schema";

/** POST {base}/api/checkout → { orderId, orderNumber, redirect } */
export async function POST(req: Request, { params }: SiteParams) {
  const site = await siteFromParams(params);
  if (site instanceof NextResponse) return site;
  if (site.preview) return error("Checkout is disabled in the theme preview", 403);
  const ip = clientIp(req);
  if (!rateLimit(`checkout:${site.store.id}:${ip}`, 8, 10 * 60_000).ok) return error("Too many orders from this network — please wait a few minutes", 429);
  const body = await parseBody(req, CheckoutSchema);
  if (!body.ok) return body.response;
  const cart = await getCart(site);
  if (!cart || !cart.lines.length) return error("Your cart is empty", 409);
  const customer = await customerFor(site);
  try {
    const { order, redirect } = await placeOrder(
      site,
      cart,
      { ...body.data, email: body.data.email || null, address: body.data.address },
      { ip, userAgent: req.headers.get("user-agent"), customerId: customer?.id ?? null },
    );
    return json({ orderId: order.id, orderNumber: order.number, total: order.total, currency: order.currency, redirect }, 201);
  } catch (e) {
    if (e instanceof CheckoutError) return error(e.message, 409);
    console.error("[checkout] failed", e);
    return error("We couldn't place your order. Please try again.", 500);
  }
}
