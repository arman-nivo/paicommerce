import { NextResponse } from "next/server";
import { z } from "zod";
import { customers, db } from "@pai/db";
import { findCustomerByEmail, tagCustomer } from "@/lib/customers";
import { clientIp, error, json, parseBody, siteFromParams, type SiteParams } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

const Body = z.object({ email: z.email("Enter a valid email address").trim().toLowerCase().max(200) });

/** POST {base}/api/newsletter { email } → subscribes (customer with acceptsMarketing + "newsletter" tag). */
export async function POST(req: Request, { params }: SiteParams) {
  const site = await siteFromParams(params);
  if (site instanceof NextResponse) return site;
  if (site.preview) return json({ ok: true, preview: true });
  if (!rateLimit(`nl:${site.store.id}:${clientIp(req)}`, 10, 60_000).ok) return error("Too many requests — please try again in a minute", 429);
  const body = await parseBody(req, Body);
  if (!body.ok) return body.response;
  const { email } = body.data;
  const existing = await findCustomerByEmail(site.store.id, email);
  if (existing) await tagCustomer(existing.id, site.store.id, "newsletter", undefined, { acceptsMarketing: true });
  else await db.insert(customers).values({ storeId: site.store.id, name: email.split("@")[0]!, email, acceptsMarketing: true, tags: ["newsletter"] });
  return json({ ok: true });
}
