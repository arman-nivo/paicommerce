"use server";
import { Resolver } from "node:dns/promises";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { STOREFRONT_ROOT_DOMAIN } from "@pai/core";
import { and, db, eq, ne, stores } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { getStorePlan } from "@/lib/ctx";
import { ActionError } from "@/lib/errors";
import { A_RECORD_IP, CNAME_TARGET, normalizeDomain } from "./_lib/dns";

function revalidate() {
  revalidatePath("/domains");
  revalidatePath("/", "layout");
}

export const connectDomain = action(z.object({ domain: z.string().max(300) }), { permission: "settings.manage" }, async (input, ctx) => {
  const { limits } = await getStorePlan(ctx.store);
  if (!limits.customDomain) throw new ActionError("Custom domains are available on the Growth plan and above. Upgrade to connect your own domain.");
  const parsed = normalizeDomain(input.domain);
  if (!parsed.ok) throw new ActionError(parsed.error);
  const domain = parsed.domain;
  const rootHost = STOREFRONT_ROOT_DOMAIN.replace(/:\d+$/, "");
  if (domain === rootHost || domain.endsWith(`.${rootHost}`)) throw new ActionError("Enter a domain you own — not a PaiCommerce address.");
  const taken = await db.query.stores.findFirst({ where: and(eq(stores.customDomain, domain), ne(stores.id, ctx.store.id)), columns: { id: true } });
  if (taken) throw new ActionError(`${domain} is already connected to another PaiCommerce store. If you own it, contact support and we'll help.`);
  if (ctx.store.customDomain === domain) return { domain };
  try {
    await db.update(stores).set({ customDomain: domain, domainVerified: false }).where(eq(stores.id, ctx.store.id));
  } catch (e) {
    if ((e as { code?: string })?.code === "23505") throw new ActionError(`${domain} is already connected to another store.`);
    throw e;
  }
  await audit(ctx, "domain.connected", domain, { previous: ctx.store.customDomain });
  revalidate();
  return { domain };
});

export type VerifyResult = { verified: boolean; wasVerified: boolean; domain: string; cname: string[]; a: string[]; error?: string };

async function withTimeout<T>(p: Promise<T>, ms = 5000): Promise<T> {
  let t: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([p, new Promise<never>((_, rej) => (t = setTimeout(() => rej(new Error("timeout")), ms)))]);
  } finally {
    if (t) clearTimeout(t);
  }
}

export const verifyDomain = action(z.object({}), { permission: "settings.manage" }, async (_input, ctx): Promise<VerifyResult> => {
  const store = await db.query.stores.findFirst({ where: eq(stores.id, ctx.store.id), columns: { customDomain: true, domainVerified: true } });
  const domain = store?.customDomain;
  if (!store || !domain) throw new ActionError("Connect a domain first.");
  // Use public resolvers so we don't read a stale local cache.
  const resolver = new Resolver({ timeout: 4000, tries: 2 });
  try {
    resolver.setServers(["1.1.1.1", "8.8.8.8"]);
  } catch {
    /* fall back to system resolvers */
  }
  const [cnameRes, aRes] = await Promise.allSettled([withTimeout(resolver.resolveCname(domain)), withTimeout(resolver.resolve4(domain))]);
  const cname = cnameRes.status === "fulfilled" ? cnameRes.value.map((c) => c.toLowerCase().replace(/\.$/, "")) : [];
  const a = aRes.status === "fulfilled" ? aRes.value : [];
  const verified = cname.includes(CNAME_TARGET) || a.includes(A_RECORD_IP);
  if (verified) {
    if (!store.domainVerified) {
      await db.update(stores).set({ domainVerified: true }).where(and(eq(stores.id, ctx.store.id), eq(stores.customDomain, domain)));
      await audit(ctx, "domain.verified", domain, { cname, a });
    }
    revalidate();
  }
  // Note: we never auto-unverify on a failed lookup — a DNS hiccup must not take a live store offline.
  const notFound = cname.length === 0 && a.length === 0;
  return { verified, wasVerified: store.domainVerified, domain, cname, a, error: notFound ? "No DNS records found for this domain yet." : undefined };
});

export const removeDomain = action(z.object({}), { permission: "settings.manage" }, async (_input, ctx) => {
  const previous = ctx.store.customDomain;
  await db.update(stores).set({ customDomain: null, domainVerified: false }).where(eq(stores.id, ctx.store.id));
  await audit(ctx, "domain.removed", previous ?? undefined);
  revalidate();
  return { ok: true };
});
