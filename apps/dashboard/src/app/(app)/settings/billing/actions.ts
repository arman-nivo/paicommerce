"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomToken } from "@pai/core";
import { and, db, eq, inArray, plans, platformInvoices, stores, subscriptions } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { getStorePlan } from "@/lib/ctx";
import { ActionError } from "@/lib/errors";

const method = z.enum(["bkash", "sslcommerz", "card"]);

function invoiceNumber() {
  const d = new Date();
  const ym = d.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit" }).replace("-", "");
  return `INV-${ym}-${randomToken(3).toUpperCase()}`;
}

export const changePlan = action(
  z.object({ planId: z.uuid(), interval: z.enum(["monthly", "yearly"]), method }),
  { permission: "billing.manage" },
  async (input, ctx) => {
    const plan = await db.query.plans.findFirst({ where: and(eq(plans.id, input.planId), eq(plans.active, true)) });
    if (!plan) throw new ActionError("That plan is no longer available.");
    const current = await getStorePlan(ctx.store);
    const activeSub = await db.query.subscriptions.findFirst({
      where: and(eq(subscriptions.storeId, ctx.store.id), inArray(subscriptions.status, ["active", "trialing"])),
    });
    if (current.plan?.id === plan.id && ctx.store.status === "active" && (plan.priceMonthly === 0 || activeSub?.interval === input.interval)) {
      throw new ActionError(`You're already on the ${plan.name} plan.`);
    }

    const amount = input.interval === "yearly" ? plan.priceYearly : plan.priceMonthly;
    const now = new Date();
    const end = new Date(now);
    if (input.interval === "yearly") end.setFullYear(end.getFullYear() + 1);
    else end.setMonth(end.getMonth() + 1);

    const invoice = await db.transaction(async (tx) => {
      await tx
        .update(subscriptions)
        .set({ status: "cancelled", cancelAtPeriodEnd: false })
        .where(and(eq(subscriptions.storeId, ctx.store.id), inArray(subscriptions.status, ["active", "trialing"])));
      const [sub] = await tx
        .insert(subscriptions)
        .values({ storeId: ctx.store.id, planId: plan.id, status: "active", interval: input.interval, currentPeriodStart: now, currentPeriodEnd: end, provider: input.method })
        .returning({ id: subscriptions.id });
      let inv: { number: string } | undefined;
      if (amount > 0) {
        [inv] = await tx
          .insert(platformInvoices)
          .values({
            number: invoiceNumber(),
            storeId: ctx.store.id,
            subscriptionId: sub!.id,
            description: `${plan.name} plan (${input.interval})`,
            amount,
            currency: plan.currency,
            status: "paid",
            paidAt: now,
            paymentMethod: input.method,
          })
          .returning({ number: platformInvoices.number });
      }
      await tx.update(stores).set({ planId: plan.id, status: "active", trialEndsAt: null }).where(eq(stores.id, ctx.store.id));
      return inv ?? null;
    });

    await audit(ctx, "billing.plan_change", plan.code, { from: current.code, to: plan.code, interval: input.interval, amount, method: input.method, invoice: invoice?.number });
    revalidatePath("/", "layout");
    return { planName: plan.name, invoice: invoice?.number ?? null };
  },
);

/** Payment stub: marks an open invoice as paid. */
export const payInvoice = action(z.object({ id: z.uuid(), method }), { permission: "billing.manage" }, async (input, ctx) => {
  const inv = await db.query.platformInvoices.findFirst({ where: and(eq(platformInvoices.id, input.id), eq(platformInvoices.storeId, ctx.store.id)) });
  if (!inv) throw new ActionError("Invoice not found.");
  if (inv.status !== "open") throw new ActionError("This invoice doesn't need payment.");
  await db
    .update(platformInvoices)
    .set({ status: "paid", paidAt: new Date(), paymentMethod: input.method })
    .where(and(eq(platformInvoices.id, inv.id), eq(platformInvoices.storeId, ctx.store.id)));
  if (ctx.store.status === "past_due") await db.update(stores).set({ status: "active" }).where(eq(stores.id, ctx.store.id));
  await audit(ctx, "billing.invoice_paid", inv.number, { amount: inv.amount, method: input.method });
  revalidatePath("/", "layout");
  return { number: inv.number };
});
