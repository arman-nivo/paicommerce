"use server";

import { z } from "zod";
import { and, db, eq, inArray, like, platformInvoices, sql, stores, subscriptions } from "@pai/db";
import { adminAction, fail } from "@/lib/action";
import { audit } from "@/lib/audit";

async function nextInvoiceNumber(): Promise<string> {
  const now = new Date();
  const prefix = `PC-${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}-`;
  const [row] = await db
    .select({ max: sql<string | null>`max(${platformInvoices.number})` })
    .from(platformInvoices)
    .where(like(platformInvoices.number, `${prefix}%`));
  const last = row?.max ? parseInt(row.max.slice(prefix.length), 10) || 0 : 0;
  return `${prefix}${String(last + 1).padStart(5, "0")}`;
}

export const createInvoice = adminAction(
  "billing.manage",
  z.object({
    storeId: z.string().uuid("Pick a store"),
    description: z.string().trim().min(3).max(300),
    amount: z.number().int().min(1, "Amount must be greater than zero").max(10_000_000_000),
    dueAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    status: z.enum(["draft", "open", "paid"]).default("open"),
    paymentMethod: z.string().trim().max(40).optional(),
    subscriptionId: z.string().uuid().optional(),
  }),
  async (input, admin) => {
    const store = await db.query.stores.findFirst({ where: eq(stores.id, input.storeId), columns: { id: true, slug: true } });
    if (!store) fail("Store not found");
    for (let attempt = 0; attempt < 3; attempt++) {
      const number = await nextInvoiceNumber();
      try {
        const [inv] = await db
          .insert(platformInvoices)
          .values({
            number,
            storeId: input.storeId,
            subscriptionId: input.subscriptionId ?? null,
            description: input.description,
            amount: input.amount,
            currency: "BDT",
            status: input.status,
            dueAt: input.dueAt ? new Date(`${input.dueAt}T23:59:59+06:00`) : null,
            paidAt: input.status === "paid" ? new Date() : null,
            paymentMethod: input.status === "paid" ? input.paymentMethod || "manual" : null,
          })
          .returning({ id: platformInvoices.id });
        await audit({ actorId: admin.id, storeId: input.storeId, action: "invoice.created", target: number, meta: { amount: input.amount, status: input.status } });
        return { message: `Invoice ${number} created`, data: { id: inv!.id } };
      } catch (e) {
        if (!/duplicate|unique/i.test(String(e)) || attempt === 2) throw e;
      }
    }
    fail("Could not allocate an invoice number");
  },
);

export const markInvoicesPaid = adminAction(
  "billing.manage",
  z.object({ ids: z.array(z.string().uuid()).min(1).max(200), paymentMethod: z.string().trim().min(1).max(40).default("manual") }),
  async ({ ids, paymentMethod }, admin) => {
    const rows = await db.select().from(platformInvoices).where(and(inArray(platformInvoices.id, ids), inArray(platformInvoices.status, ["draft", "open", "uncollectible"])));
    if (!rows.length) fail("No payable invoices selected");
    await db.update(platformInvoices).set({ status: "paid", paidAt: new Date(), paymentMethod }).where(inArray(platformInvoices.id, rows.map((r) => r.id)));
    for (const r of rows) await audit({ actorId: admin.id, storeId: r.storeId, action: "invoice.paid", target: r.number, meta: { amount: r.amount, paymentMethod } });
    return { message: `${rows.length} invoice${rows.length === 1 ? "" : "s"} marked paid` };
  },
);

export const voidInvoices = adminAction("billing.manage", z.object({ ids: z.array(z.string().uuid()).min(1).max(200) }), async ({ ids }, admin) => {
  const rows = await db.select().from(platformInvoices).where(and(inArray(platformInvoices.id, ids), inArray(platformInvoices.status, ["draft", "open", "uncollectible"])));
  if (!rows.length) fail("Only unpaid invoices can be voided");
  await db.update(platformInvoices).set({ status: "void" }).where(inArray(platformInvoices.id, rows.map((r) => r.id)));
  for (const r of rows) await audit({ actorId: admin.id, storeId: r.storeId, action: "invoice.void", target: r.number, meta: { amount: r.amount } });
  return { message: `${rows.length} invoice${rows.length === 1 ? "" : "s"} voided` };
});

export const markUncollectible = adminAction("billing.manage", z.object({ id: z.string().uuid() }), async ({ id }, admin) => {
  const inv = await db.query.platformInvoices.findFirst({ where: eq(platformInvoices.id, id) });
  if (!inv || inv.status !== "open") fail("Only open invoices can be marked uncollectible");
  await db.update(platformInvoices).set({ status: "uncollectible" }).where(eq(platformInvoices.id, id));
  await audit({ actorId: admin.id, storeId: inv.storeId, action: "invoice.uncollectible", target: inv.number });
  return { message: `${inv.number} marked uncollectible` };
});

export const updateSubscription = adminAction(
  "billing.manage",
  z.object({ id: z.string().uuid(), status: z.enum(["trialing", "active", "past_due", "cancelled"]).optional(), cancelAtPeriodEnd: z.boolean().optional(), extendDays: z.number().int().min(1).max(730).optional() }),
  async ({ id, status, cancelAtPeriodEnd, extendDays }, admin) => {
    const sub = await db.query.subscriptions.findFirst({ where: eq(subscriptions.id, id) });
    if (!sub) fail("Subscription not found");
    const patch: Partial<typeof subscriptions.$inferInsert> = {};
    if (status) patch.status = status;
    if (cancelAtPeriodEnd !== undefined) patch.cancelAtPeriodEnd = cancelAtPeriodEnd;
    if (extendDays) patch.currentPeriodEnd = new Date(Math.max(sub.currentPeriodEnd.getTime(), Date.now()) + extendDays * 86400_000);
    if (!Object.keys(patch).length) fail("Nothing to update");
    await db.update(subscriptions).set(patch).where(eq(subscriptions.id, id));
    // Keep the store status in step with its subscription.
    if (status === "past_due") await db.update(stores).set({ status: "past_due" }).where(and(eq(stores.id, sub.storeId), inArray(stores.status, ["active", "trial"])));
    if (status === "active") await db.update(stores).set({ status: "active", planId: sub.planId }).where(and(eq(stores.id, sub.storeId), inArray(stores.status, ["trial", "past_due"])));
    await audit({ actorId: admin.id, storeId: sub.storeId, action: "subscription.updated", target: sub.id, meta: { from: { status: sub.status, cancelAtPeriodEnd: sub.cancelAtPeriodEnd, currentPeriodEnd: sub.currentPeriodEnd }, patch } });
    return { message: "Subscription updated" };
  },
);
