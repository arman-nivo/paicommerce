/**
 * Payment gateway return / callback: `{base}/api/payments/{provider}/{success|fail|cancel|callback}?order={id}`.
 * The payment is always verified server-to-server with the gateway before an order is marked paid.
 */
import { NextResponse, after } from "next/server";
import { and, db, eq, orderEvents, orders, storeIntegrations } from "@pai/db";
import { PAYMENT_PROVIDERS } from "@pai/core/payments";
import { dispatchWebhook, serializeOrderForApi } from "@pai/core/webhooks";
import { storeOrder } from "@/lib/checkout";
import { resolveSite, siteUrl } from "@/lib/site";

type Ctx = { params: Promise<{ site: string; provider: string; action: string }> };

async function handle(req: Request, { params }: Ctx) {
  const { site: key, provider: providerId, action } = await params;
  const site = await resolveSite(key);
  if (!site) return new NextResponse("Store not found", { status: 404 });
  const url = new URL(req.url);
  const p: Record<string, string> = {};
  url.searchParams.forEach((v, k) => (p[k] = v));
  if (req.method === "POST") {
    const ct = req.headers.get("content-type") ?? "";
    try {
      if (ct.includes("application/json")) Object.assign(p, (await req.json()) as Record<string, string>);
      else if (ct.includes("form")) (await req.formData()).forEach((v, k) => typeof v === "string" && (p[k] = v));
    } catch {
      /* ignore malformed bodies */
    }
  }
  const orderId = p.order || p.tran_id || p.client_reference_id || "";
  const order = /^[0-9a-f-]{36}$/i.test(orderId) ? await storeOrder(site, orderId) : null;
  const redirectTo = (q: string) => NextResponse.redirect(new URL(siteUrl(site, order ? `/checkout/thank-you/${order.id}?payment=${q}` : "/"), req.url), 303);
  if (!order || order.paymentMethod !== providerId) return redirectTo("failed");
  if (order.paymentStatus === "paid") return action === "callback" && req.method === "POST" ? NextResponse.json({ ok: true }) : redirectTo("paid");
  if (action === "cancel") return redirectTo("cancelled");

  const provider = PAYMENT_PROVIDERS[providerId];
  const [integration] = await db
    .select({ config: storeIntegrations.config })
    .from(storeIntegrations)
    .where(and(eq(storeIntegrations.storeId, site.store.id), eq(storeIntegrations.provider, providerId)))
    .limit(1);
  if (!provider?.verify || !integration) return redirectTo("failed");

  let paid = false;
  let reference: string | undefined;
  try {
    // bKash reports the outcome via `status`; SSLCommerz via val_id; Stripe via session_id.
    const r = await provider.verify(integration.config, action === "fail" ? { ...p, status: p.status ?? "failure" } : p);
    paid = r.paid;
    reference = r.reference;
  } catch (e) {
    console.error(`[payments] ${providerId} verify failed`, e);
  }

  if (paid) {
    const updated = await db
      .update(orders)
      .set({ paymentStatus: "paid", paymentRef: reference ?? order.paymentRef })
      .where(and(eq(orders.id, order.id), eq(orders.storeId, site.store.id), eq(orders.paymentStatus, order.paymentStatus)))
      .returning({ id: orders.id });
    if (updated.length) {
      await db.insert(orderEvents).values({ orderId: order.id, type: "payment", message: `Payment received via ${providerId}${reference ? ` (ref ${reference})` : ""}` });
      after(async () => {
        const d = await serializeOrderForApi(order.id, { storeId: site.store.id });
        if (d) await dispatchWebhook(site.store.id, "order.updated", d);
      });
    }
  } else if (action !== "callback") {
    await db.update(orders).set({ paymentStatus: "failed" }).where(and(eq(orders.id, order.id), eq(orders.storeId, site.store.id), eq(orders.paymentStatus, "pending")));
    await db.insert(orderEvents).values({ orderId: order.id, type: "payment", message: `Online payment via ${providerId} was not completed` });
  }

  if (action === "callback" && req.method === "POST") return NextResponse.json({ ok: paid });
  return redirectTo(paid ? "paid" : "failed");
}

export const GET = handle;
export const POST = handle;
