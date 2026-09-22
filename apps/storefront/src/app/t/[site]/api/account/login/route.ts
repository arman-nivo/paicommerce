import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@pai/core";
import { verifyPassword } from "@pai/core/auth";
import { startCustomerSession } from "@/lib/customer";
import { findCustomerByEmail, findCustomerByPhone } from "@/lib/customers";
import { clientIp, error, json, parseBody, siteFromParams, type SiteParams } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

const Body = z.object({ identifier: z.string().trim().min(3, "Enter your phone or email").max(200), password: z.string().min(1, "Enter your password").max(200) });

/** POST {base}/api/account/login { identifier (phone|email), password } */
export async function POST(req: Request, { params }: SiteParams) {
  const site = await siteFromParams(params);
  if (site instanceof NextResponse) return site;
  const limit = rateLimit(`login:${site.store.id}:${clientIp(req)}`, 10, 5 * 60_000);
  if (!limit.ok) return error(`Too many attempts — try again in ${Math.ceil(limit.retryAfter / 60)} min`, 429);
  const body = await parseBody(req, Body);
  if (!body.ok) return body.response;
  const { identifier, password } = body.data;
  const c = identifier.includes("@") ? await findCustomerByEmail(site.store.id, identifier) : await findCustomerByPhone(site.store.id, normalizePhone(identifier));
  const ok = c?.passwordHash ? await verifyPassword(password, c.passwordHash) : false;
  if (!c || !ok) return error("Incorrect phone/email or password", 401);
  if (c.blocked) return error("This account has been disabled. Please contact the store.", 403);
  await startCustomerSession(site, c.id);
  return json({ ok: true, customer: { id: c.id, name: c.name } });
}
