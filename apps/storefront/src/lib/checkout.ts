/** Checkout: order placement, payment initialisation and the "recent orders" cookie for thank-you pages. */
import { cookies } from "next/headers";
import { after } from "next/server";
import { and, customers, db, eq, orderEvents, orders, sql, storeIntegrations, type Address, type Order } from "@pai/db";
import { normalizePhone } from "@pai/core";
import { CheckoutError, createOrder, priceCart, trackDaily } from "@pai/core/orders";
import { PAYMENT_PROVIDERS } from "@pai/core/payments";
import { dispatchWebhook, serializeCustomerForApi, serializeOrderForApi } from "@pai/core/webhooks";
import { cookiePath, type CartRow } from "./cart";
import { deliveryZones, paymentMethods, pricingStore, usesDefaultZones } from "./commerce";
import { siteUrl, storeBaseUrl, type Site } from "./site";

/** Bangladesh districts (for the address form). */
export const BD_DISTRICTS = [
  "Dhaka", "Chattogram", "Gazipur", "Narayanganj", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh", "Cumilla", "Bogura",
  "Bagerhat", "Bandarban", "Barguna", "Bhola", "Brahmanbaria", "Chandpur", "Chapai Nawabganj", "Chuadanga", "Cox's Bazar", "Dinajpur",
  "Faridpur", "Feni", "Gaibandha", "Gopalganj", "Habiganj", "Jamalpur", "Jashore", "Jhalokathi", "Jhenaidah", "Joypurhat", "Khagrachhari",
  "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar",
  "Munshiganj", "Naogaon", "Narail", "Narsingdi", "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh", "Patuakhali",
  "Pirojpur", "Rajbari", "Rangamati", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Tangail", "Thakurgaon",
];

/* ─────────────────────────── recent orders cookie ─────────────────────────── */

const RECENT_COOKIE = "pai_orders";

export async function rememberOrder(site: Site, orderId: string) {
  const jar = await cookies();
  const ids = [orderId, ...(jar.get(RECENT_COOKIE)?.value.split(",") ?? []).filter((x) => x && x !== orderId)].slice(0, 5);
  jar.set(RECENT_COOKIE, ids.join(","), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: cookiePath(site), maxAge: 60 * 60 * 24 * 30 });
}

/** True when this browser placed the order (thank-you page access for guests). */
export async function isRecentOrder(orderId: string): Promise<boolean> {
  const jar = await cookies();
  return (jar.get(RECENT_COOKIE)?.value.split(",") ?? []).includes(orderId);
}

/* ─────────────────────────── place order ─────────────────────────── */

export type PlaceOrderInput = {
  name: string;
  phone: string;
  email?: string | null;
  address: Address;
  deliveryZoneId: string;
  paymentMethod: string;
  transactionId?: string | null;
  note?: string | null;
};

export type PlaceOrderResult = { order: Order; redirect: string };

function addressLine(a: Address) {
  return [a.line1, a.area, a.city, a.district].filter(Boolean).join(", ");
}

/** Validate against store settings, create the order, fire webhooks and start payment when needed. */
export async function placeOrder(site: Site, cart: CartRow, input: PlaceOrderInput, meta: { ip: string | null; userAgent: string | null; customerId: string | null }): Promise<PlaceOrderResult> {
  const settings = site.store.settings ?? {};
  if (settings.checkout?.requireEmail && !input.email) throw new CheckoutError("Email is required");
  if (settings.checkout?.guestCheckout === false && !meta.customerId) throw new CheckoutError("Please log in to place an order");

  const phone = normalizePhone(input.phone);
  const blocked = (settings.fraud?.blockPhones ?? []).map(normalizePhone);
  if (blocked.includes(phone)) throw new CheckoutError("We can't accept orders from this number. Please contact the store.");

  const zones = deliveryZones(site.store);
  const zone = zones.find((z) => z.id === input.deliveryZoneId);
  if (!zone) throw new CheckoutError("Please choose a delivery area");

  const methods = await paymentMethods(site.store.id);
  const method = methods.find((m) => m.id === input.paymentMethod);
  if (!method) throw new CheckoutError("Please choose a payment method");
  if (method.id === "bkash_manual" && !input.transactionId?.trim()) throw new CheckoutError("Enter the transaction ID of your payment");

  // Price with the storefront's zone list (includes the default zones when the merchant set none).
  const priced = await priceCart(pricingStore(site.store), cart.lines, { discountCode: cart.discountCode, deliveryZoneId: zone.id });
  if (!priced.lines.length) throw new CheckoutError("Your cart is empty");
  if (priced.errors.length) throw new CheckoutError(priced.errors[0]!);

  // Was there already a customer with this phone/email? (for the customer.created webhook)
  const email = input.email?.trim().toLowerCase() || null;
  const [existingCustomer] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(and(eq(customers.storeId, site.store.id), phone ? eq(customers.phone, phone) : sql`false`))
    .limit(1);
  const [existingByEmail] = !existingCustomer && email ? await db.select({ id: customers.id }).from(customers).where(and(eq(customers.storeId, site.store.id), eq(customers.email, email))).limit(1) : [];

  const address: Address = { ...input.address, name: input.name, phone, country: input.address.country ?? "Bangladesh" };
  const noteParts = [input.note?.trim(), method.id === "bkash_manual" && input.transactionId ? `Payment TrxID: ${input.transactionId.trim()}` : null].filter(Boolean);

  const order = await createOrder({
    storeId: site.store.id,
    lines: cart.lines,
    customer: { name: input.name, phone, email },
    shippingAddress: address,
    deliveryZoneId: zone.id,
    discountCode: cart.discountCode,
    paymentMethod: method.id,
    paymentRef: method.id === "bkash_manual" ? input.transactionId?.trim() || null : null,
    note: noteParts.join("\n") || null,
    source: "web",
    ip: meta.ip,
    userAgent: meta.userAgent?.slice(0, 400) ?? null,
    cartId: cart.id,
    customerId: meta.customerId,
    // createOrder prices shipping from the raw store settings; keep the storefront's zone pricing authoritative.
    shippingOverride: usesDefaultZones(site.store) ? priced.shippingTotal : null,
  });

  if (usesDefaultZones(site.store) && !order.deliveryZone) {
    await db.update(orders).set({ deliveryZone: zone.name }).where(and(eq(orders.id, order.id), eq(orders.storeId, site.store.id)));
  }

  await trackDaily(site.store.id, { checkouts: 1 }).catch(() => {});
  await rememberOrder(site, order.id);

  // Webhooks (fire-and-forget).
  after(async () => {
    const data = await serializeOrderForApi(order.id, { storeId: site.store.id });
    if (data) await dispatchWebhook(site.store.id, "order.created", data);
    if (!existingCustomer && !existingByEmail && !meta.customerId && order.customerId) {
      const c = await serializeCustomerForApi(order.customerId, site.store.id);
      if (c) await dispatchWebhook(site.store.id, "customer.created", c);
    }
  });

  const thankYou = siteUrl(site, `/checkout/thank-you/${order.id}`);
  if (method.kind !== "redirect") return { order, redirect: thankYou };

  // Online payment: initialise with the gateway and send the customer there.
  const provider = PAYMENT_PROVIDERS[method.id];
  const [integration] = await db
    .select({ config: storeIntegrations.config })
    .from(storeIntegrations)
    .where(and(eq(storeIntegrations.storeId, site.store.id), eq(storeIntegrations.provider, method.id), eq(storeIntegrations.enabled, true)))
    .limit(1);
  if (!provider || !integration) return { order, redirect: `${thankYou}?payment=unavailable` };
  const base = await storeBaseUrl(site);
  const cb = (action: string) => `${base}/api/payments/${method.id}/${action}?order=${order.id}`;
  const init = await provider.init(integration.config, {
    orderId: order.id,
    orderNumber: order.number,
    amount: order.total,
    currency: order.currency,
    customer: { name: order.name, email: order.email, phone: order.phone, address: addressLine(address) },
    successUrl: cb("success"),
    failUrl: cb("fail"),
    cancelUrl: cb("cancel"),
    callbackUrl: cb("callback"),
  });
  if (init.kind === "redirect") {
    if (init.reference) await db.update(orders).set({ paymentRef: init.reference }).where(and(eq(orders.id, order.id), eq(orders.storeId, site.store.id)));
    return { order, redirect: init.url };
  }
  await db.insert(orderEvents).values({ orderId: order.id, type: "payment", message: `Online payment could not start: ${init.message}` });
  return { order, redirect: `${thankYou}?payment=failed` };
}

/** Find an order of this store by id (payments callbacks). */
export async function storeOrder(site: Site, orderId: string) {
  const [o] = await db.select().from(orders).where(and(eq(orders.storeId, site.store.id), eq(orders.id, orderId))).limit(1);
  return o ?? null;
}
