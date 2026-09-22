import { NextResponse } from "next/server";
import { normalizePhone } from "@pai/core";
import { getOrCreateCart, saveCart } from "@/lib/cart";
import { cartResponse } from "@/lib/cart-api";
import { deliveryZones } from "@/lib/commerce";
import { customerFor } from "@/lib/customer";
import { parseBody, siteFromParams, type SiteParams } from "@/lib/http";
import { DraftSchema } from "../schema";

/**
 * POST {base}/api/checkout/draft — save the partially filled checkout on the cart (incomplete
 * order capture) and return the cart re-priced for the chosen delivery zone.
 */
export async function POST(req: Request, { params }: SiteParams) {
  const site = await siteFromParams(params);
  if (site instanceof NextResponse) return site;
  const body = await parseBody(req, DraftSchema);
  if (!body.ok) return body.response;
  const d = body.data;
  const row = await getOrCreateCart(site);
  const zoneId = d.deliveryZoneId && deliveryZones(site.store).some((z) => z.id === d.deliveryZoneId) ? d.deliveryZoneId : row.checkout?.deliveryZoneId;
  const capture = site.store.settings?.checkout?.captureIncomplete !== false && !site.preview;
  const customer = await customerFor(site);
  const checkout = {
    ...(row.checkout ?? {}),
    ...(capture
      ? {
          name: d.name ?? row.checkout?.name,
          phone: d.phone ? normalizePhone(d.phone) : row.checkout?.phone,
          email: d.email ?? row.checkout?.email,
          address: d.address ? { ...(row.checkout?.address ?? {}), ...d.address } : row.checkout?.address,
          note: d.note ?? row.checkout?.note,
        }
      : {}),
    deliveryZoneId: zoneId,
    step: "shipping" as const,
  };
  const saved = await saveCart(site, row.id, { checkout, ...(customer && !row.customerId ? { customerId: customer.id } : {}) });
  return cartResponse(site, saved);
}
