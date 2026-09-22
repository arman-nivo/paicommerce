/**
 * Storefront password protection ("coming soon" mode), configured in the dashboard under
 * Preferences → `store.settings.password = { enabled, password, message }`.
 * Visitors who enter the password get a per-store cookie holding an HMAC of the password,
 * so changing the password logs everyone out.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { SiteStore } from "./site";

export type StorePassword = { enabled?: boolean; password?: string; message?: string };

export const passwordCookie = (storeId: string) => `pai_pw_${storeId.slice(0, 8)}`;

export function storePassword(store: SiteStore): StorePassword | null {
  const p = (store.settings as Record<string, unknown>).password as StorePassword | undefined;
  return p?.enabled && p.password ? p : null;
}

export function passwordDigest(storeId: string, password: string): string {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "dev").update(`${storeId}:${password}`).digest("hex");
}

export async function hasStoreAccess(store: SiteStore): Promise<boolean> {
  const p = storePassword(store);
  if (!p) return true;
  const got = (await cookies()).get(passwordCookie(store.id))?.value ?? "";
  const want = passwordDigest(store.id, p.password!);
  return got.length === want.length && timingSafeEqual(Buffer.from(got), Buffer.from(want));
}
