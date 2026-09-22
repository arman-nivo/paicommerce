/** Platform-level data: extra merchants, subscriptions & invoices, marketplace activity, support, leads, settings. */
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../index";
import {
  announcements,
  auditLogs,
  developers,
  leads,
  platformInvoices,
  platformSettings,
  storeMembers,
  storeThemes,
  stores,
  subscriptions,
  supportTickets,
  themePurchases,
  themeReviews,
  themes,
  users,
  type TicketMessage,
} from "../schema";
import { address, emailFor, personName, phone } from "./lib/bd";
import { Rng, uuid } from "./lib/rng";
import { addDays, DAY, daysAgo, insertMany, NOW, slugify, tk } from "./lib/util";
import type { PlanRef } from "./plans";
import type { SeededStore } from "./store";
import type { ThemeRef } from "./themes";
import type { CoreUsers } from "./users";

type Invoice = Omit<typeof platformInvoices.$inferInsert, "number"> & { createdAt: Date };
const invoiceQueue: Invoice[] = [];
const subRows: (typeof subscriptions.$inferInsert)[] = [];

/** Queue a subscription and its billing history. */
export function addSubscription(opts: {
  rng: Rng;
  storeId: string;
  plan: PlanRef;
  planCode: string;
  storeCreatedAt: Date;
  state: "trialing" | "active" | "past_due" | "cancelled" | "internal";
  interval?: "monthly" | "yearly";
  /** Stop billing N days ago (closed/suspended stores). */
  stoppedDaysAgo?: number;
}) {
  const { rng, plan } = opts;
  const id = uuid();
  const interval = opts.interval ?? "monthly";
  const trialEnd = addDays(opts.storeCreatedAt, 14);
  const periodDays = interval === "yearly" ? 365 : 30;
  const amount = interval === "yearly" ? plan.priceYearly : plan.priceMonthly;
  let periodStart = trialEnd;
  const status = opts.state === "internal" ? "active" : opts.state;

  if (opts.state === "trialing" || plan.priceMonthly === 0 || opts.state === "internal") {
    // No billing history.
    if (opts.state !== "trialing") {
      periodStart = opts.storeCreatedAt;
      while (addDays(periodStart, periodDays) < NOW) periodStart = addDays(periodStart, periodDays);
    } else periodStart = opts.storeCreatedAt;
  } else {
    const stopAt = opts.stoppedDaysAgo !== undefined ? daysAgo(opts.stoppedDaysAgo) : NOW;
    let t = trialEnd;
    const method = rng.weighted([["bkash", 45], ["card", 35], ["sslcommerz", 20]] as const);
    while (t <= stopAt) {
      const isLast = addDays(t, periodDays) > stopAt;
      let st: "paid" | "open" | "uncollectible" = "paid";
      if (isLast && opts.state === "past_due") st = "open";
      invoiceQueue.push({
        storeId: opts.storeId,
        subscriptionId: id,
        description: `${plan.name} plan — ${interval === "yearly" ? "annual" : "monthly"} subscription`,
        amount,
        currency: "BDT",
        status: st,
        dueAt: addDays(t, 3),
        paidAt: st === "paid" ? new Date(Math.min(NOW.getTime() - 60000, t.getTime() + rng.int(5, 60 * 48) * 60000)) : null,
        paymentMethod: st === "paid" ? method : null,
        createdAt: t,
      });
      periodStart = t;
      t = addDays(t, periodDays);
    }
    if (opts.state === "cancelled" && opts.stoppedDaysAgo !== undefined && opts.stoppedDaysAgo > 20) {
      invoiceQueue.push({ storeId: opts.storeId, subscriptionId: id, description: `${plan.name} plan — monthly subscription`, amount, currency: "BDT", status: "uncollectible", dueAt: addDays(t, 3), paidAt: null, paymentMethod: null, createdAt: t < NOW ? t : daysAgo(1) });
    }
  }
  subRows.push({
    id,
    storeId: opts.storeId,
    planId: plan.id,
    status,
    interval,
    currentPeriodStart: periodStart,
    currentPeriodEnd: opts.state === "trialing" ? trialEnd : addDays(periodStart, periodDays),
    cancelAtPeriodEnd: opts.state === "cancelled",
    provider: opts.state === "internal" ? "internal" : plan.priceMonthly === 0 ? null : rng.pick(["bkash", "sslcommerz", "stripe"]),
    providerRef: plan.priceMonthly === 0 || opts.state === "internal" ? null : `sub_${rng.alnum(14, "abcdefghijklmnopqrstuvwxyz0123456789")}`,
    createdAt: opts.storeCreatedAt,
    updatedAt: periodStart,
  });
  return id;
}

export async function flushBilling() {
  await insertMany(subscriptions, subRows);
  invoiceQueue.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const counters = new Map<string, number>();
  const rows = invoiceQueue.map((inv) => {
    const y = inv.createdAt.getUTCFullYear();
    const n = (counters.get(String(y)) ?? 0) + 1;
    counters.set(String(y), n);
    return { ...inv, number: `PAI-${y}-${String(n).padStart(5, "0")}` };
  });
  await insertMany(platformInvoices, rows);
  return { subscriptions: subRows.length, invoices: rows.length, paidRevenue: rows.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0) };
}

/* ─────────────────────────── Extra merchants ─────────────────────────── */

const MERCHANTS: [string, string][] = [
  ["Dhaka Denim Co.", "fashion"], ["Chattogram Spice House", "grocery"], ["Sylhet Tea Garden", "grocery"], ["Rangpur Handloom", "handicraft"], ["Bengal Organics", "grocery"],
  ["Mirpur Mobile Point", "electronics"], ["Gulshan Home Decor", "home"], ["Banani Bakes", "food"], ["Uttara Kids Zone", "kids"], ["Kashful Boutique", "fashion"],
  ["Shukhi Pet Care", "kids"], ["Nakshi Ghor", "handicraft"], ["Tech Bazar BD", "electronics"], ["Priyo Gadget", "electronics"], ["Sajgoj Beauty", "beauty"],
  ["Ghorer Bazar", "grocery"], ["Deshi Mart", "general"], ["Tangail Saree Kutir", "fashion"], ["Jamdani House", "fashion"], ["Cox's Bazar Dry Fish", "grocery"],
  ["Rajshahi Mango Hub", "grocery"], ["Barishal Hilsa Express", "grocery"], ["Khulna Craft Studio", "handicraft"], ["Bogura Doi Ghor", "food"], ["Chayanika Books", "books"],
  ["Book Nook BD", "books"], ["FitLife BD", "sports"], ["Gym Gear Dhaka", "sports"], ["Shopno Jewellers", "jewelry"], ["Rupkotha Fashion", "fashion"],
  ["Lalbagh Leather Works", "fashion"], ["Muslin Heritage", "fashion"], ["Glow Up BD", "beauty"], ["Organic Roots BD", "health"], ["Little Steps Kids", "kids"],
  ["Pawsome BD", "kids"], ["Kacchi Express", "food"], ["Dhanmondi Cake Studio", "food"], ["Urban Threads", "fashion"], ["Smart Home BD", "electronics"],
  ["Shasthya Pharmacy", "health"], ["Gadget Garage", "electronics"],
];
const THEME_FOR: Record<string, string[]> = {
  fashion: ["aurora", "aurora", "bazaar", "lumiere"], grocery: ["freshmart", "freshmart", "bazaar"], handicraft: ["artisan", "nest"], electronics: ["volt", "volt", "bazaar"],
  home: ["nest", "artisan"], food: ["savor"], kids: ["playhouse"], beauty: ["bloom", "aurora"], general: ["bazaar"], books: ["folio"], sports: ["stride", "aurora"], jewelry: ["lumiere"], health: ["pulse"],
};

export async function seedMerchants(plans: Record<string, PlanRef>, themeRefs: ThemeRef[]) {
  const rng = new Rng("merchants");
  const hash = await bcrypt.hash("merchant123", 10);
  const userRows: (typeof users.$inferInsert)[] = [];
  const storeRows: (typeof stores.$inferInsert)[] = [];
  const memberRows: (typeof storeMembers.$inferInsert)[] = [];
  const themeRows: (typeof storeThemes.$inferInsert)[] = [];
  const out: { id: string; slug: string; name: string; ownerId: string; status: string; planCode: string; themeSlug: string; createdAt: Date }[] = [];

  const usedEmails = new Set<string>();
  MERCHANTS.forEach(([name, category], i) => {
    // Skewed to recent signups so the signup chart trends upward.
    const createdDays = Math.max(1, Math.floor(360 * (1 - Math.sqrt(rng.next()))));
    const createdAt = new Date(NOW.getTime() - createdDays * DAY - rng.int(0, 600) * 60000);
    const owner = personName(rng);
    const ownerId = uuid();
    let email = emailFor(rng, owner.name);
    while (usedEmails.has(email)) email = email.replace("@", `${rng.int(1, 9)}@`);
    usedEmails.add(email);
    userRows.push({ id: ownerId, email, passwordHash: hash, name: owner.name, phone: phone(rng), role: "user", emailVerifiedAt: createdAt, lastLoginAt: daysAgo(rng.float(0, Math.min(createdDays, 40))), createdAt, updatedAt: createdAt });

    const planCode = createdDays <= 14 ? rng.weighted([["growth", 70], ["free", 30]] as const) : rng.weighted([["free", 36], ["growth", 40], ["pro", 18], ["enterprise", 6]] as const);
    let status: "trial" | "active" | "past_due" | "suspended" | "closed" = createdDays <= 14 ? "trial" : "active";
    if (status === "active" && planCode !== "free") status = rng.weighted([["active", 84], ["past_due", 8], ["suspended", 5], ["closed", 3]] as const);
    if (status === "active" && planCode === "free" && rng.chance(0.06)) status = "suspended";
    // Guarantee at least a couple of each interesting state.
    if (i === 3 && planCode !== "free" && createdDays > 14) status = "past_due";
    if (i === 7 && createdDays > 14) status = "suspended";

    const id = uuid();
    const slug = slugify(name.replace("'", ""));
    const themeSlug = rng.pick(THEME_FOR[category] ?? ["bazaar"]);
    const themeName = themeRefs.find((t) => t.slug === themeSlug)?.name ?? themeSlug;
    const addr = address(rng, owner.name, "");
    storeRows.push({
      id,
      ownerId,
      name,
      slug,
      category,
      description: `${name} — shop online with cash on delivery across Bangladesh.`,
      email,
      phone: phone(rng),
      address: { line1: addr.line1, area: addr.area, city: addr.city, district: addr.district, country: "BD" },
      status,
      planId: plans[planCode]!.id,
      trialEndsAt: addDays(createdAt, 14),
      settings: { delivery: { zones: [{ id: "inside-dhaka", name: "Inside Dhaka", charge: 7000 }, { id: "outside-dhaka", name: "Outside Dhaka", charge: 13000 }], freeShippingOver: null } },
      onboardingCompleted: rng.chance(0.8),
      customDomain: planCode === "pro" || planCode === "enterprise" ? (rng.chance(0.6) ? `${slug.replace(/-/g, "")}.com.bd` : null) : null,
      domainVerified: planCode === "pro" || planCode === "enterprise",
      createdAt,
      updatedAt: createdAt,
    });
    memberRows.push({ storeId: id, userId: ownerId, role: "owner", permissions: [], createdAt });
    themeRows.push({ storeId: id, themeSlug, name: themeName, role: "live", publishedAt: createdAt, createdAt, updatedAt: createdAt });

    const subState = status === "trial" ? "trialing" : status === "past_due" ? "past_due" : status === "closed" ? "cancelled" : status === "suspended" ? "past_due" : "active";
    addSubscription({
      rng,
      storeId: id,
      plan: plans[planCode]!,
      planCode,
      storeCreatedAt: createdAt,
      state: subState,
      interval: planCode !== "free" && rng.chance(0.18) ? "yearly" : "monthly",
      stoppedDaysAgo: status === "closed" ? rng.int(20, 60) : status === "suspended" ? rng.int(35, 50) : undefined,
    });
    out.push({ id, slug, name, ownerId, status, planCode, themeSlug, createdAt });
  });

  // Fix domain verification for stores without a domain.
  for (const s of storeRows) if (!s.customDomain) s.domainVerified = false;

  await insertMany(users, userRows);
  await insertMany(stores, storeRows);
  await insertMany(storeMembers, memberRows);
  await insertMany(storeThemes, themeRows);
  return out;
}

/* ─────────────────────────── Marketplace (purchases & reviews) ─────────────────────────── */

const THEME_REVIEW_BODIES = [
  "Set up our store in one afternoon. The mobile layout converts really well for Facebook traffic.",
  "Beautiful design and super fast. Our bounce rate dropped after switching.",
  "Customizer is easy to use — changed colours and sections without any developer.",
  "Great theme. Would love a few more header options.",
  "Our customers keep complimenting the new look. Worth it.",
  "Clean code and quick support from the team.",
  "Perfect for our category. Sections are well thought out.",
  "Good theme but took a while to get product images looking right.",
];

export async function seedMarketplace(themeRefs: ThemeRef[], merchantStores: { id: string; themeSlug: string; createdAt: Date }[], extra: { storeId: string; themeSlug: string; at: Date }[], studioDevId: string) {
  const rng = new Rng("marketplace");
  const purchases: (typeof themePurchases.$inferInsert)[] = [];
  const seen = new Set<string>();
  const addPurchase = (storeId: string, slug: string, at: Date) => {
    const t = themeRefs.find((x) => x.slug === slug);
    if (!t || !t.price || seen.has(`${storeId}:${t.id}`)) return;
    seen.add(`${storeId}:${t.id}`);
    purchases.push({ storeId, themeId: t.id, amount: t.price, developerShare: t.price, platformShare: 0, createdAt: at });
  };
  for (const s of merchantStores) addPurchase(s.id, s.themeSlug, s.createdAt);
  for (const e of extra) addPurchase(e.storeId, e.themeSlug, e.at);
  await insertMany(themePurchases, purchases);
  const studioEarnings = purchases.reduce((s, p) => s + p.developerShare, 0);
  await db.update(developers).set({ lifetimeEarnings: studioEarnings, balance: 0 }).where(eq(developers.id, studioDevId));

  const reviews: (typeof themeReviews.$inferInsert)[] = [];
  for (const t of themeRefs.filter((x) => !["horizon", "mosaic"].includes(x.slug))) {
    const n = rng.int(3, 8);
    const reviewers = rng.sample(merchantStores, n);
    let sum = 0;
    for (const r of reviewers) {
      const rating = rng.weighted([[5, 65], [4, 28], [3, 7]] as const);
      sum += rating;
      reviews.push({ themeId: t.id, storeId: r.id, rating, body: rng.pick(THEME_REVIEW_BODIES), createdAt: new Date(Math.max(r.createdAt.getTime() + 5 * DAY, NOW.getTime() - rng.int(1, 200) * DAY)) });
    }
    const rs = reviews.filter((x) => x.themeId === t.id);
    await db.update(themes).set({ ratingAvg: Math.round((sum / rs.length) * 10) / 10, ratingCount: rs.length }).where(eq(themes.id, t.id));
  }
  for (const r of reviews) if (r.createdAt! > NOW) r.createdAt = daysAgo(1);
  await insertMany(themeReviews, reviews);
  return { purchases: purchases.length, reviews: reviews.length };
}

/* ─────────────────────────── Support, audit, leads, announcements, settings ─────────────────────────── */

const msg = (from: TicketMessage["from"], authorName: string, body: string, at: Date): TicketMessage => ({ from, authorName, body, at: at.toISOString() });

export async function seedOps(u: CoreUsers, demo: SeededStore, merchants: { id: string; ownerId: string; name: string; status: string }[]) {
  const rng = new Rng("ops");
  const sup = "Sumaiya (PaiCommerce Support)";
  const m = (i: number) => merchants[i % merchants.length]!;
  const pastDue = merchants.find((x) => x.status === "past_due") ?? m(5);
  const t = (d: number, h = 0) => new Date(NOW.getTime() - d * DAY + h * 3600_000);
  const tickets: (typeof supportTickets.$inferInsert)[] = [
    { storeId: demo.id, userId: u.demo, subject: "Steadfast booking fails for Outside Dhaka orders", priority: "high", status: "open", assigneeId: u.support, createdAt: t(1), updatedAt: t(0, -3),
      messages: [msg("merchant", "Rahim Uddin", "Hi, when I click 'Book courier' on orders going to Chattogram it shows 'Invalid recipient address'. Inside Dhaka works fine. Order #1392 for example.", t(1)), msg("support", sup, "Thanks Rahim! We're checking with Steadfast. It looks like their API now requires the district in a separate field. Could you confirm the order's address includes the district?", t(0, -20)), msg("merchant", "Rahim Uddin", "Yes, district is Chattogram. Still failing.", t(0, -3))] },
    { storeId: demo.id, userId: u.demo, subject: "How do I connect my own domain rahimsfashion.com?", priority: "normal", status: "resolved", assigneeId: u.support, createdAt: t(26), updatedAt: t(25),
      messages: [msg("merchant", "Rahim Uddin", "I bought rahimsfashion.com from Namecheap. How do I connect it to my store?", t(26)), msg("support", sup, "Great choice! Go to Settings → Domains, add the domain, then create a CNAME record for www pointing to stores.paicommerce.com and an A record for @ pointing to 76.76.21.21. SSL is issued automatically within 30 minutes.", t(26, 2)), msg("merchant", "Rahim Uddin", "Done, it's working now. Thank you!", t(25))] },
    { storeId: m(2).id, userId: m(2).ownerId, subject: "bKash payment successful but order shows 'pending'", priority: "urgent", status: "pending", assigneeId: u.support, createdAt: t(0, -9), updatedAt: t(0, -6),
      messages: [msg("merchant", m(2).name, "A customer paid via bKash (TrxID BK7F3K2L9Q) but the order is still pending payment.", t(0, -9)), msg("support", sup, "We've found the callback was delayed by bKash. We've re-synced it — can you refresh and confirm?", t(0, -6))] },
    { storeId: m(9).id, userId: m(9).ownerId, subject: "Upgrade to Pro — need VAT invoice", priority: "normal", status: "open", assigneeId: null, createdAt: t(0, -2), updatedAt: t(0, -2),
      messages: [msg("merchant", m(9).name, "We want to upgrade to the Pro plan yearly. Can you issue an invoice with our BIN number for VAT purposes?", t(0, -2))] },
    { storeId: m(14).id, userId: m(14).ownerId, subject: "Theme customizer not saving section order", priority: "normal", status: "closed", assigneeId: u.support, createdAt: t(12), updatedAt: t(10),
      messages: [msg("merchant", m(14).name, "When I drag sections in the customizer and click save, the order resets.", t(12)), msg("support", sup, "Thanks for reporting — this was a bug in the drag handle on Safari. A fix has been deployed, please try again.", t(11)), msg("merchant", m(14).name, "Works now 👍", t(10))] },
    { storeId: pastDue.id, userId: pastDue.ownerId, subject: "Subscription payment failed — card declined", priority: "high", status: "open", assigneeId: u.support, createdAt: t(3), updatedAt: t(2),
      messages: [msg("merchant", pastDue.name, "My card got declined for this month's subscription. Can I pay with bKash instead?", t(3)), msg("support", sup, "Absolutely. Go to Billing → Pay invoice and choose bKash. Your store stays live during the 7-day grace period.", t(2))] },
  ];
  await insertMany(supportTickets, tickets);

  const audit: (typeof auditLogs.$inferInsert)[] = [];
  const ip = () => `103.${rng.int(100, 230)}.${rng.int(0, 255)}.${rng.int(1, 254)}`;
  const demoActions: [string, string, Record<string, unknown>][] = [
    ["auth.login", "user", {}], ["product.update", "product", { field: "price" }], ["product.create", "product", {}], ["order.update", "order", { fulfillmentStatus: "shipped" }],
    ["order.courier_booked", "order", { provider: "steadfast" }], ["discount.create", "discount", { code: "EID500" }], ["theme.publish", "theme", { theme: "aurora" }],
    ["theme.install", "theme", { theme: "volt" }], ["settings.update", "settings", { section: "delivery" }], ["staff.invite", "user", { email: "staff@paicommerce.com" }],
    ["integration.update", "integration", { provider: "steadfast" }], ["collection.update", "collection", {}], ["page.update", "page", { slug: "about" }],
  ];
  for (let i = 0; i < 45; i++) {
    const [action, target, meta] = rng.pick(demoActions);
    const actor = action.startsWith("order") && rng.chance(0.6) ? u.staff : u.demo;
    audit.push({ actorId: actor, storeId: demo.id, action, target: `${target}:${uuid().slice(0, 8)}`, meta, ip: ip(), createdAt: new Date(NOW.getTime() - rng.int(10, 60 * 24 * 60) * 60000) });
  }
  const adminActions: [string, string][] = [["theme.approve", "theme"], ["theme.reject", "theme"], ["store.suspend", "store"], ["plan.update", "plan"], ["user.impersonate", "user"], ["announcement.create", "announcement"], ["settings.update", "platform"]];
  for (let i = 0; i < 20; i++) {
    const [action, target] = rng.pick(adminActions);
    const s = rng.pick(merchants);
    audit.push({ actorId: rng.chance(0.7) ? u.admin : u.support, storeId: target === "store" ? s.id : null, action, target: `${target}:${target === "store" ? s.id.slice(0, 8) : uuid().slice(0, 8)}`, meta: target === "store" ? { store: s.name } : {}, ip: ip(), createdAt: new Date(NOW.getTime() - rng.int(60, 120 * 24 * 60) * 60000) });
  }
  await insertMany(auditLogs, audit);

  await insertMany(announcements, [
    { title: "New: Pathao courier auto-booking is live", body: "You can now book Pathao parcels in one click from any order and track status automatically. Enable it under Apps → Pathao Courier.", level: "success", audience: "merchants", active: true, createdAt: daysAgo(4) },
    { title: "Scheduled maintenance on Friday 2:00–3:00 AM", body: "We'll be upgrading our database cluster this Friday between 2:00 and 3:00 AM (Dhaka time). Storefronts stay online; the dashboard may be briefly unavailable.", level: "warning", audience: "all", active: true, createdAt: daysAgo(1) },
  ]);

  const leadRows: (typeof leads.$inferInsert)[] = [];
  const companies = ["Nirvana Retail Ltd", "Shuktara Crafts", "Padma Footwear", "Meghna Electronics", "Kanchon Clothing Co.", "Green Basket BD", "Anchor Fashion House", "Ruposhi Kraft", "Boi Ghor Publishers", "Sonali Foods Distribution", "Mirpur Traders", "Gentleman's Row"];
  const sources = ["contact", "demo", "enterprise", "newsletter"] as const;
  const messages = [
    "We have 3 physical outlets and want to launch online with inventory sync.", "Looking for a demo of the Pro plan and courier integrations.", "Can you migrate our 2,000 products from WooCommerce?",
    "Interested in Enterprise with multi-store and custom theme.", "Do you support Nagad and bKash tokenized checkout?", "We run a Facebook page with 200k followers — need a proper store.",
  ];
  for (let i = 0; i < 12; i++) {
    const p = personName(rng);
    const src = rng.pick(sources);
    leadRows.push({ name: p.name, email: emailFor(rng, p.name), phone: phone(rng), company: companies[i]!, message: src === "newsletter" ? null : rng.pick(messages), source: src, createdAt: new Date(NOW.getTime() - rng.int(1, 45 * 24 * 60) * 60000) });
  }
  await insertMany(leads, leadRows);

  await insertMany(platformSettings, [
    { key: "signup_enabled", value: true, updatedAt: daysAgo(30) },
    { key: "default_trial_days", value: 14, updatedAt: daysAgo(30) },
    { key: "theme_revenue_share", value: 70, updatedAt: daysAgo(30) },
    { key: "maintenance_banner", value: "", updatedAt: daysAgo(30) },
  ]);
  return { tickets: tickets.length, audit: audit.length, leads: leadRows.length };
}

export { tk };
