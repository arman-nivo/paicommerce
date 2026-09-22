import Link from "next/link";
import { notFound } from "next/navigation";
import { db, eq, plans, platformInvoices, stores, subscriptions, users } from "@pai/db";
import { STOREFRONT_ROOT_DOMAIN } from "@pai/core";
import { requireAdminPage } from "@/lib/auth";
import { bdt, fmtDate } from "@/lib/format";
import { PrintButton } from "./print-button";

export const metadata = { title: "Invoice" };

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const inv = await db.query.platformInvoices.findFirst({ where: eq(platformInvoices.id, id) });
  if (!inv) notFound();
  const store = await db.query.stores.findFirst({ where: eq(stores.id, inv.storeId) });
  const owner = store ? await db.query.users.findFirst({ where: eq(users.id, store.ownerId) }) : null;
  const sub = inv.subscriptionId ? await db.query.subscriptions.findFirst({ where: eq(subscriptions.id, inv.subscriptionId) }) : null;
  const plan = sub ? await db.query.plans.findFirst({ where: eq(plans.id, sub.planId) }) : null;
  const a = store?.address;
  const stamp = { paid: "PAID", void: "VOID", uncollectible: "UNCOLLECTIBLE", draft: "DRAFT", open: "DUE" }[inv.status];
  const stampColor = inv.status === "paid" ? "text-emerald-600 border-emerald-600" : inv.status === "open" ? "text-amber-600 border-amber-600" : "text-gray-500 border-gray-400";

  return (
    <div className="min-h-dvh bg-muted/50 py-8 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-3xl items-center justify-between px-4">
        <Link href="/billing?tab=invoices" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to invoices
        </Link>
        <PrintButton />
      </div>
      <article className="relative mx-auto max-w-3xl bg-white p-10 text-[#0b1020] shadow-xl print:max-w-none print:p-0 print:shadow-none">
        <div className={`absolute right-10 top-10 rotate-6 rounded-lg border-4 px-4 py-1 font-display text-2xl font-extrabold tracking-widest opacity-80 ${stampColor}`}>{stamp}</div>
        <header className="flex items-start justify-between border-b border-gray-200 pb-8">
          <div>
            <div className="font-display text-2xl font-extrabold text-[#2545eb]">PaiCommerce</div>
            <p className="mt-1 text-sm text-gray-500">
              PaiCommerce Ltd.
              <br />
              Gulshan Avenue, Dhaka 1212, Bangladesh
              <br />
              billing@paicommerce.com
            </p>
          </div>
        </header>
        <section className="mt-8 grid grid-cols-2 gap-8 text-sm">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Billed to</div>
            <div className="mt-2 font-semibold">{store?.name ?? "Deleted store"}</div>
            {owner && <div className="text-gray-600">{owner.name}</div>}
            <div className="text-gray-600">{store?.email ?? owner?.email}</div>
            {a && <div className="text-gray-600">{[a.line1, a.area, a.city, a.district, a.postalCode].filter(Boolean).join(", ")}</div>}
            {store && <div className="text-gray-600">{store.customDomain ?? `${store.slug}.${STOREFRONT_ROOT_DOMAIN}`}</div>}
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Invoice</div>
            <div className="mt-2 font-mono text-lg font-semibold">{inv.number}</div>
            <dl className="mt-2 space-y-0.5 text-gray-600">
              <div>Issued: {fmtDate(inv.createdAt)}</div>
              <div>Due: {fmtDate(inv.dueAt)}</div>
              {inv.paidAt && (
                <div>
                  Paid: {fmtDate(inv.paidAt)}
                  {inv.paymentMethod ? ` via ${inv.paymentMethod}` : ""}
                </div>
              )}
            </dl>
          </div>
        </section>
        <table className="mt-10 w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-4">
                <div className="font-medium">{inv.description}</div>
                {plan && sub && (
                  <div className="text-xs text-gray-500">
                    {plan.name} plan · {sub.interval} · {fmtDate(sub.currentPeriodStart)} – {fmtDate(sub.currentPeriodEnd)}
                  </div>
                )}
              </td>
              <td className="py-4 text-right tabular-nums">{bdt(inv.amount)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-4 text-right text-gray-500">Subtotal</td>
              <td className="pt-4 text-right tabular-nums">{bdt(inv.amount)}</td>
            </tr>
            <tr>
              <td className="pt-1 text-right text-gray-500">VAT (included)</td>
              <td className="pt-1 text-right tabular-nums">{bdt(0)}</td>
            </tr>
            <tr>
              <td className="pt-3 text-right font-semibold">Total ({inv.currency})</td>
              <td className="pt-3 text-right text-lg font-bold tabular-nums">{bdt(inv.amount)}</td>
            </tr>
          </tfoot>
        </table>
        <footer className="mt-16 border-t border-gray-200 pt-6 text-xs text-gray-500">
          Pay via bKash, Nagad, card (SSLCommerz) or bank transfer from your PaiCommerce dashboard → Settings → Billing. Questions? billing@paicommerce.com
        </footer>
      </article>
    </div>
  );
}
