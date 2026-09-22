"use server";

import { z } from "zod";
import { db, developerPayouts, developers, eq, sql } from "@pai/db";
import { adminAction, fail } from "@/lib/action";
import { audit } from "@/lib/audit";

export const updateDeveloper = adminAction(
  "developers.manage",
  z.object({
    id: z.string().uuid(),
    revenueSharePct: z.number().int().min(0).max(100),
    payoutMethod: z.enum(["bank", "bkash", "nagad", "paypal", "wise"]),
    payoutEmail: z.union([z.string().trim().email(), z.literal("")]),
  }),
  async ({ id, revenueSharePct, payoutMethod, payoutEmail }, admin) => {
    const dev = await db.query.developers.findFirst({ where: eq(developers.id, id) });
    if (!dev) fail("Developer not found");
    await db.update(developers).set({ revenueSharePct, payoutMethod, payoutEmail: payoutEmail || null }).where(eq(developers.id, id));
    await audit({ actorId: admin.id, action: "developer.updated", target: dev.slug, meta: { developerId: id, revenueSharePct: { from: dev.revenueSharePct, to: revenueSharePct }, payoutMethod } });
    return { message: "Developer updated" };
  },
);

export const setDeveloperVerified = adminAction("developers.manage", z.object({ id: z.string().uuid(), verified: z.boolean() }), async ({ id, verified }, admin) => {
  const dev = await db.query.developers.findFirst({ where: eq(developers.id, id) });
  if (!dev) fail("Developer not found");
  await db.update(developers).set({ verified }).where(eq(developers.id, id));
  await audit({ actorId: admin.id, action: verified ? "developer.verified" : "developer.unverified", target: dev.slug, meta: { developerId: id } });
  return { message: verified ? `${dev.displayName} now has the verified badge` : `Verification removed from ${dev.displayName}` };
});

export const createPayout = adminAction(
  "developers.manage",
  z.object({ developerId: z.string().uuid(), amount: z.number().int().min(100, "Minimum payout is ৳1"), method: z.string().trim().min(2).max(40), reference: z.string().trim().max(120).optional() }),
  async ({ developerId, amount, method, reference }, admin) => {
    const payout = await db.transaction(async (tx) => {
      // Atomically reserve the amount from the balance.
      const [dev] = await tx
        .update(developers)
        .set({ balance: sql`${developers.balance} - ${amount}` })
        .where(sql`${developers.id} = ${developerId} and ${developers.balance} >= ${amount}`)
        .returning({ id: developers.id, slug: developers.slug, balance: developers.balance });
      if (!dev) fail("Insufficient balance for this payout.");
      const [p] = await tx.insert(developerPayouts).values({ developerId, amount, method, reference: reference || null, status: "pending" }).returning();
      return { p: p!, dev };
    });
    await audit({ actorId: admin.id, action: "payout.created", target: payout.dev.slug, meta: { payoutId: payout.p.id, amount, method, balanceAfter: payout.dev.balance } });
    return { message: "Payout created — balance reserved" };
  },
);

export const setPayoutStatus = adminAction(
  "developers.manage",
  z.object({ id: z.string().uuid(), status: z.enum(["processing", "paid", "failed"]), reference: z.string().trim().max(120).optional() }),
  async ({ id, status, reference }, admin) => {
    const p = await db.query.developerPayouts.findFirst({ where: eq(developerPayouts.id, id) });
    if (!p) fail("Payout not found");
    if (p.status === "paid" || p.status === "failed") fail(`Payout is already ${p.status}.`);
    await db.transaction(async (tx) => {
      await tx
        .update(developerPayouts)
        .set({ status, ...(reference ? { reference } : {}), ...(status === "paid" ? { paidAt: new Date() } : {}) })
        .where(eq(developerPayouts.id, id));
      if (status === "failed") await tx.update(developers).set({ balance: sql`${developers.balance} + ${p.amount}` }).where(eq(developers.id, p.developerId));
    });
    await audit({ actorId: admin.id, action: status === "paid" ? "payout.paid" : status === "failed" ? "payout.failed" : "payout.processing", target: id, meta: { developerId: p.developerId, amount: p.amount, reference } });
    return { message: status === "failed" ? "Payout failed — amount returned to balance" : `Payout marked ${status}` };
  },
);
