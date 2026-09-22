import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@pai/core";
import { customers, db } from "@pai/db";
import { findCustomerByEmail, tagCustomer } from "@/lib/customers";
import { clientIp, error, json, parseBody, siteFromParams, type SiteParams } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

const Body = z.object({
  name: z.string().trim().min(1, "Enter your name").max(120),
  email: z.email("Enter a valid email address").trim().toLowerCase().max(200),
  phone: z.string().trim().max(20).optional().default(""),
  message: z.string().trim().min(2, "Enter a message").max(4000),
});

/**
 * POST {base}/api/contact — the message is attached to the customer record (tag "contact-form",
 * appended to the customer note) so merchants see it under Customers in the dashboard.
 */
export async function POST(req: Request, { params }: SiteParams) {
  const site = await siteFromParams(params);
  if (site instanceof NextResponse) return site;
  if (site.preview) return json({ ok: true, preview: true });
  if (!rateLimit(`contact:${site.store.id}:${clientIp(req)}`, 5, 10 * 60_000).ok) return error("Too many messages — please try again later", 429);
  const body = await parseBody(req, Body);
  if (!body.ok) return body.response;
  const { name, email, message } = body.data;
  const phone = normalizePhone(body.data.phone) || null;
  const line = `[Contact form ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC] ${message}`;
  const existing = await findCustomerByEmail(site.store.id, email);
  if (existing) await tagCustomer(existing.id, site.store.id, "contact-form", line, phone && !existing.phone ? { phone } : {});
  else await db.insert(customers).values({ storeId: site.store.id, name, email, phone, tags: ["contact-form"], note: line });
  return json({ ok: true });
}
