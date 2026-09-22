/** Storefront customer sessions (cookie `pai_customer`, token kind "customer" scoped to a store). */
import { cache } from "react";
import { cookies } from "next/headers";
import { and, customers, db, eq } from "@pai/db";
import { signToken, verifyToken } from "@pai/core/auth";
import type { SfCustomer } from "@pai/theme-sdk";
import { cookiePath } from "./cart";
import type { Site } from "./site";

export const CUSTOMER_COOKIE = "pai_customer";

export function customerCookieOptions(site: Pick<Site, "base">, maxAgeDays = 30) {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: cookiePath(site), maxAge: maxAgeDays * 86400 };
}

/** Logged-in customer for this store (null for guests). */
export const getCustomer = cache(async (siteKey: string, storeId: string): Promise<(SfCustomer & { addresses: unknown[] }) | null> => {
  void siteKey;
  const jar = await cookies();
  const payload = await verifyToken(jar.get(CUSTOMER_COOKIE)?.value);
  if (!payload || payload.kind !== "customer" || payload.sid !== storeId) return null;
  const [c] = await db.select().from(customers).where(and(eq(customers.id, payload.sub), eq(customers.storeId, storeId))).limit(1);
  if (!c || c.blocked) return null;
  return { id: c.id, name: c.name, email: c.email, phone: c.phone, addresses: c.addresses ?? [] };
});

export async function customerFor(site: Site) {
  return getCustomer(site.key, site.store.id);
}

export async function startCustomerSession(site: Site, customerId: string) {
  const token = await signToken({ sub: customerId, kind: "customer", sid: site.store.id });
  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, token, customerCookieOptions(site));
}

export async function endCustomerSession(site: Site) {
  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, "", { ...customerCookieOptions(site), maxAge: 0 });
}
