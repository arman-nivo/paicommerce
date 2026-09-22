/** Creates one fully-populated store (catalogue, content, settings, integrations, activity). */
import { eq } from "drizzle-orm";
import { db } from "../index";
import {
  analyticsDaily,
  blogPosts,
  carts,
  collections,
  customers,
  discounts,
  menus,
  orderEvents,
  orderItems,
  orders,
  pages,
  productCollections,
  productReviews,
  products,
  productVariants,
  storeIntegrations,
  storeMembers,
  storeThemes,
  stores,
  type Address,
  type StoreSettings,
} from "../schema";
import type { Catalog } from "./catalog";
import { buildCatalog } from "./catalog-rows";
import { buildBlog, buildMenus, buildPages } from "./content";
import { DELIVERY_ZONES } from "./lib/bd";
import { IMG, type ImgKey } from "./lib/images";
import { Rng, uuid } from "./lib/rng";
import { addDays, daysAgo, insertMany, NOW, tk } from "./lib/util";
import { generateActivity } from "./orders";

export type StoreSpec = {
  slug: string;
  name: string;
  category: string;
  catalog: Catalog;
  ownerId: string;
  planId: string;
  status?: "trial" | "active" | "past_due" | "suspended" | "closed";
  extended?: boolean;
  theme: { slug: string; name: string };
  libraryThemes?: { slug: string; name: string }[];
  description: string;
  email: string;
  phone: string;
  address: Address;
  logo?: ImgKey;
  createdDaysAgo: number;
  staff?: { userId: string; permissions: string[] }[];
  activity: { customers: number; orders: number; days: number; growth: number; carts: number; conversion?: number };
  customDomain?: string;
};

export type SeededStore = { id: string; slug: string; name: string; createdAt: Date; orderCount: number; revenue: number };

export async function seedStore(spec: StoreSpec): Promise<SeededStore> {
  const rng = new Rng(`store:${spec.slug}`);
  const id = uuid();
  const createdAt = daysAgo(spec.createdDaysAgo);
  const cat = spec.catalog;
  const addressLine = [spec.address.line1, spec.address.area, spec.address.city].filter(Boolean).join(", ");
  const handle = spec.slug.replace(/-demo$/, "").replace(/-/g, "");

  const settings: StoreSettings = {
    checkout: { requireEmail: false, guestCheckout: true, orderNote: true, captureIncomplete: true, termsUrl: "/pages/terms" },
    delivery: { zones: DELIVERY_ZONES.map((z) => ({ ...z })), freeShippingOver: cat.freeShippingOver === null ? null : tk(cat.freeShippingOver) },
    social: { facebook: `https://facebook.com/${handle}bd`, instagram: `https://instagram.com/${handle}.bd`, youtube: `https://youtube.com/@${handle}bd`, whatsapp: `+88${spec.phone}` },
    seo: { title: `${spec.name} — ${spec.description.split(".")[0]}`, description: spec.description, image: IMG[cat.collections[0]!.img] },
    notifications: { orderEmail: true, orderSms: true, lowStockThreshold: 5 },
    fraud: { blockPhones: [], minCourierSuccessRate: 60 },
    tracking: {},
  };

  await insertMany(stores, [
    {
      id,
      ownerId: spec.ownerId,
      name: spec.name,
      slug: spec.slug,
      customDomain: spec.customDomain ?? null,
      domainVerified: !!spec.customDomain,
      category: spec.category,
      description: spec.description,
      logoUrl: null,
      email: spec.email,
      phone: spec.phone,
      address: spec.address,
      currency: "BDT",
      locale: "en",
      timezone: "Asia/Dhaka",
      status: spec.status ?? "active",
      planId: spec.planId,
      trialEndsAt: addDays(createdAt, 14),
      settings,
      orderSeq: 1000,
      onboardingCompleted: true,
      createdAt,
      updatedAt: createdAt,
    },
  ]);
  await insertMany(storeMembers, [
    { storeId: id, userId: spec.ownerId, role: "owner", permissions: [], createdAt },
    ...(spec.staff ?? []).map((s) => ({ storeId: id, userId: s.userId, role: "staff" as const, permissions: s.permissions, createdAt: addDays(createdAt, 20) })),
  ]);
  await insertMany(storeThemes, [
    { storeId: id, themeSlug: spec.theme.slug, name: spec.theme.name, role: "live", presetId: null, config: null, draftConfig: null, publishedAt: createdAt, createdAt, updatedAt: createdAt },
    ...(spec.libraryThemes ?? []).map((t) => ({ storeId: id, themeSlug: t.slug, name: t.name, role: "unpublished" as const, config: null, draftConfig: null, createdAt: addDays(createdAt, 30), updatedAt: addDays(createdAt, 30) })),
  ]);

  const info = { id, name: spec.name, email: spec.email, phone: spec.phone, addressLine, createdAt };
  await insertMany(menus, buildMenus(info, cat).map((m) => ({ ...m, updatedAt: createdAt })));
  await insertMany(pages, buildPages(info, cat));
  await insertMany(blogPosts, buildBlog(info, cat, rng));

  const bkashNo = `01${rng.pick(["7", "8", "9", "6", "3"])}${rng.digits(8)}`;
  await insertMany(storeIntegrations, [
    { storeId: id, provider: "cod", type: "payment", enabled: true, config: { advanceDeliveryCharge: false, instructions: "Pay in cash when you receive your order. Please check the parcel in front of the rider." }, createdAt, updatedAt: createdAt },
    { storeId: id, provider: "bkash_manual", type: "payment", enabled: true, config: { bkashNumber: bkashNo, nagadNumber: `01${rng.pick(["7", "8", "9"])}${rng.digits(8)}`, rocketNumber: "", instructions: `Send Money to ${bkashNo} (personal) and enter the TrxID below. We'll confirm your order within 30 minutes.` }, createdAt, updatedAt: createdAt },
    { storeId: id, provider: "bkash", type: "payment", enabled: true, config: { appKey: `sandbox_${rng.hex(16)}`, appSecret: rng.hex(32), username: "sandboxTokenizedUser02", password: rng.hex(12), sandbox: true }, createdAt, updatedAt: createdAt },
    { storeId: id, provider: "sslcommerz", type: "payment", enabled: true, config: { storeId: `${handle.slice(0, 8)}${rng.digits(4)}`, storePassword: `${handle.slice(0, 8)}${rng.digits(4)}@ssl`, sandbox: true }, createdAt, updatedAt: createdAt },
    { storeId: id, provider: "steadfast", type: "courier", enabled: true, config: { apiKey: rng.alnum(32, "abcdefghijklmnopqrstuvwxyz0123456789"), secretKey: rng.alnum(24, "abcdefghijklmnopqrstuvwxyz0123456789") }, createdAt, updatedAt: createdAt },
    { storeId: id, provider: "pathao", type: "courier", enabled: rng.chance(0.6), config: { clientId: rng.alnum(10, "abcdefghijklmnopqrstuvwxyz0123456789"), clientSecret: rng.hex(40), username: spec.email, password: rng.hex(10), storeId: rng.digits(6), sandbox: true }, createdAt, updatedAt: createdAt },
    { storeId: id, provider: "facebook_pixel", type: "analytics", enabled: true, config: { pixelId: rng.digits(15), accessToken: "", testEventCode: "" }, createdAt, updatedAt: createdAt },
  ]);

  // Discounts
  const discountRows = [
    { id: uuid(), storeId: id, code: "WELCOME10", title: "10% off your first order", type: "percentage" as const, value: 10, minSubtotal: null, usageLimit: null, usedCount: 0, oncePerCustomer: true, startsAt: createdAt, endsAt: null, active: true, createdAt },
    { id: uuid(), storeId: id, code: "EID500", title: "৳500 off Eid orders over ৳3,000", type: "fixed" as const, value: tk(500), minSubtotal: tk(3000), usageLimit: 500, usedCount: 0, oncePerCustomer: false, startsAt: daysAgo(60), endsAt: addDays(NOW, 20), active: true, createdAt },
    { id: uuid(), storeId: id, code: "FREESHIP", title: "Free delivery over ৳1,500", type: "free_shipping" as const, value: 0, minSubtotal: tk(1500), usageLimit: null, usedCount: 0, oncePerCustomer: false, startsAt: createdAt, endsAt: null, active: true, createdAt },
    { id: uuid(), storeId: id, code: "FLASH15", title: "Flash sale 15% (expired)", type: "percentage" as const, value: 15, minSubtotal: tk(1000), usageLimit: 200, usedCount: 0, oncePerCustomer: false, startsAt: daysAgo(85), endsAt: daysAgo(78), active: false, createdAt },
  ];

  // Catalogue + activity (activity mutates product salesCount & discount usage before insert)
  const built = buildCatalog(id, createdAt, cat, { extended: !!spec.extended, rng, skuPrefix: handle.slice(0, 3).toUpperCase() });
  const act = generateActivity({
    storeId: id,
    rng,
    products: built.products,
    customerCount: spec.activity.customers,
    orderCount: spec.activity.orders,
    days: spec.activity.days,
    growth: spec.activity.growth,
    freeShippingOver: cat.freeShippingOver,
    discounts: discountRows,
    actorUserId: spec.staff?.[0]?.userId ?? spec.ownerId,
    qty: cat.qty,
    cartCount: spec.activity.carts,
    conversion: spec.activity.conversion,
  });

  await insertMany(discounts, discountRows);
  await insertMany(collections, built.collections);
  await insertMany(products, built.products.map((p) => p.row));
  await insertMany(productVariants, built.products.flatMap((p) => p.variants));
  await insertMany(productCollections, built.links);
  await insertMany(productReviews, built.reviews);
  await insertMany(customers, act.customers);
  await insertMany(orders, act.orders);
  await insertMany(orderItems, act.items, 1000);
  await insertMany(orderEvents, act.events, 1000);
  await insertMany(analyticsDaily, act.analytics);
  await insertMany(carts, act.carts);

  // Order sequence: strictly above the highest order number.
  await db.update(stores).set({ orderSeq: act.lastNumber + 1 }).where(eq(stores.id, id));

  return { id, slug: spec.slug, name: spec.name, createdAt, orderCount: act.orders.length, revenue: act.orders.reduce((s, o) => s + o.total, 0) };
}
