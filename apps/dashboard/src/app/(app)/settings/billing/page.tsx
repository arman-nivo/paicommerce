import { and, asc, count, db, desc, eq, inArray, media, orders, plans, platformInvoices, products, sql, storeMembers, subscriptions } from "@pai/db";
import { Header } from "@/components/page";
import { getCtx, getStorePlan } from "@/lib/ctx";
import { CurrentPlanCard, UsageCard } from "./_components/overview";
import { PlanGrid, type PlanView } from "./_components/plan-grid";
import { InvoiceTable } from "./_components/invoice-table";

export const metadata = { title: "Plan & billing" };

export default async function BillingPage() {
  const ctx = await getCtx("billing.manage");
  const sid = ctx.store.id;
  const current = await getStorePlan(ctx.store);

  const [allPlans, sub, invoices, [p], [o], [s], [m]] = await Promise.all([
    db.select().from(plans).where(eq(plans.active, true)).orderBy(asc(plans.sort)),
    db.query.subscriptions.findFirst({
      where: and(eq(subscriptions.storeId, sid), inArray(subscriptions.status, ["active", "trialing", "past_due"])),
      orderBy: desc(subscriptions.createdAt),
    }),
    db.select().from(platformInvoices).where(eq(platformInvoices.storeId, sid)).orderBy(desc(platformInvoices.createdAt)).limit(50),
    db.select({ n: count() }).from(products).where(eq(products.storeId, sid)),
    db
      .select({ n: count() })
      .from(orders)
      .where(and(eq(orders.storeId, sid), sql`${orders.createdAt} >= (date_trunc('month', now() at time zone 'Asia/Dhaka') at time zone 'Asia/Dhaka')`)),
    db.select({ n: count() }).from(storeMembers).where(eq(storeMembers.storeId, sid)),
    db.select({ bytes: sql<number>`coalesce(sum(${media.size}), 0)::bigint` }).from(media).where(eq(media.storeId, sid)),
  ]);

  const status = ctx.store.status;
  const trialDaysLeft =
    status === "trial" && ctx.store.trialEndsAt ? Math.max(0, Math.ceil((ctx.store.trialEndsAt.getTime() - Date.now()) / 86_400_000)) : null;
  const storageMb = Math.round((Number(m?.bytes ?? 0) / (1024 * 1024)) * 10) / 10;
  const limits = current.limits;

  const planViews: PlanView[] = allPlans.map((pl) => ({
    id: pl.id,
    code: pl.code,
    name: pl.name,
    tagline: pl.tagline,
    priceMonthly: pl.priceMonthly,
    priceYearly: pl.priceYearly,
    currency: pl.currency,
    features: pl.features,
    highlighted: pl.highlighted,
    limits: pl.limits,
  }));

  const usage = { products: p?.n ?? 0, orders: o?.n ?? 0, staff: s?.n ?? 0, storageMb };

  return (
    <div className="space-y-6">
      <Header title="Plan & billing" description="Your plan, what you're using, and your invoices." />
      <div className="grid gap-5 lg:grid-cols-3">
        <CurrentPlanCard
          name={current.name}
          price={sub?.interval === "yearly" ? (current.plan?.priceYearly ?? 0) : (current.plan?.priceMonthly ?? 0)}
          currency={current.plan?.currency ?? "BDT"}
          interval={sub?.interval ?? "monthly"}
          status={status}
          trialDaysLeft={trialDaysLeft}
          trialEndsAt={ctx.store.trialEndsAt?.toISOString() ?? null}
          renewsAt={sub?.currentPeriodEnd.toISOString() ?? null}
          transactionFeePct={limits.transactionFeePct}
        />
        <UsageCard className="lg:col-span-2" usage={usage} limits={limits} />
      </div>
      <PlanGrid plans={planViews} currentPlanId={current.plan?.id ?? null} currentInterval={sub?.interval ?? "monthly"} isTrial={status === "trial"} usage={usage} />
      <InvoiceTable
        invoices={invoices.map((i) => ({
          id: i.id,
          number: i.number,
          createdAt: i.createdAt.toISOString(),
          description: i.description,
          amount: i.amount,
          currency: i.currency,
          status: i.status,
          paymentMethod: i.paymentMethod,
          dueAt: i.dueAt?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
