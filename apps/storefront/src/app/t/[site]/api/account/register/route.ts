import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidBdPhone, normalizePhone } from "@pai/core";
import { hashPassword } from "@pai/core/auth";
import { and, customers, db, eq } from "@pai/db";
import { startCustomerSession } from "@/lib/customer";
import { findCustomerByEmail, findCustomerByPhone } from "@/lib/customers";
import { clientIp, error, json, parseBody, siteFromParams, type SiteParams } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

const Body = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z.string().trim().refine(isValidBdPhone, "Enter a valid mobile number (01XXXXXXXXX)"),
  email: z.union([z.literal(""), z.email("Enter a valid email address").trim().toLowerCase().max(200)]).optional(),
  password: z.string().min(6, "Password must be at least 6 characters").max(200),
});

/**
 * POST {base}/api/account/register. A customer record created earlier by a guest checkout
 * (same phone, no password yet) is upgraded to an account instead of duplicated.
 */
export async function POST(req: Request, { params }: SiteParams) {
  const site = await siteFromParams(params);
  if (site instanceof NextResponse) return site;
  if (!rateLimit(`register:${site.store.id}:${clientIp(req)}`, 5, 10 * 60_000).ok) return error("Too many attempts — please try again later", 429);
  const body = await parseBody(req, Body);
  if (!body.ok) return body.response;
  const phone = normalizePhone(body.data.phone);
  const email = body.data.email || null;
  const passwordHash = await hashPassword(body.data.password);

  const byPhone = await findCustomerByPhone(site.store.id, phone);
  if (byPhone?.passwordHash) return error("An account with this mobile number already exists — please log in", 409);
  if (email) {
    const byEmail = await findCustomerByEmail(site.store.id, email);
    if (byEmail && byEmail.id !== byPhone?.id && byEmail.passwordHash) return error("An account with this email already exists — please log in", 409);
  }

  let id: string;
  if (byPhone) {
    if (byPhone.blocked) return error("This account has been disabled. Please contact the store.", 403);
    await db
      .update(customers)
      .set({ name: body.data.name, passwordHash, email: byPhone.email ?? email })
      .where(and(eq(customers.id, byPhone.id), eq(customers.storeId, site.store.id)));
    id = byPhone.id;
  } else {
    const [c] = await db.insert(customers).values({ storeId: site.store.id, name: body.data.name, phone, email, passwordHash }).returning({ id: customers.id });
    id = c!.id;
  }
  await startCustomerSession(site, id);
  return json({ ok: true, customer: { id, name: body.data.name } }, 201);
}
