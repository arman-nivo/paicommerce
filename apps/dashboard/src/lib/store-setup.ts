/**
 * Creates a new store with sensible Bangladesh-first defaults:
 * trial on the free plan, owner membership, live theme, menus, policy pages,
 * delivery zones (Inside Dhaka ৳70 / Outside Dhaka ৳130) and Cash on Delivery enabled.
 */
import { TRIAL_DAYS } from "@pai/core";
import { db, eq, menus, pages, plans, storeIntegrations, storeMembers, stores, storeThemes, subscriptions, type StoreSettings } from "@pai/db";

export const RESERVED_SLUGS = new Set([
  "www", "app", "api", "admin", "dashboard", "mail", "email", "help", "support", "docs", "blog", "shop", "store", "stores", "cdn", "static", "assets",
  "status", "billing", "account", "accounts", "login", "signup", "auth", "dev", "staging", "test", "paicommerce", "pai", "preview", "s", "themes", "developer", "developers",
]);

export function slugProblem(slug: string): string | null {
  if (slug.length < 3) return "Use at least 3 characters";
  if (slug.length > 40) return "Use 40 characters or fewer";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return "Use lowercase letters, numbers and single dashes";
  if (RESERVED_SLUGS.has(slug)) return "This name is reserved";
  return null;
}

export function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

function defaultPages(storeName: string, email: string | null, phone: string | null) {
  const contact = [email && `Email: <a href="mailto:${email}">${email}</a>`, phone && `Phone / WhatsApp: ${phone}`].filter(Boolean).join("<br>");
  return [
    {
      title: "About us",
      slug: "about",
      content: `<h2>Welcome to ${storeName}</h2><p>We started ${storeName} with a simple idea: great products, honest prices and friendly service delivered to your doorstep anywhere in Bangladesh.</p><p>Every order is carefully checked and packed by our team. Have a question? We're just a message away.</p>`,
    },
    {
      title: "Contact us",
      slug: "contact",
      content: `<p>We'd love to hear from you. Reach us any day from 10am to 8pm.</p><p>${contact || "Add your email and phone number in Settings › General."}</p>`,
    },
    {
      title: "Privacy policy",
      slug: "privacy-policy",
      content: `<p>${storeName} respects your privacy. We collect only the information needed to process your orders — your name, phone number, email and delivery address — and never sell it to third parties.</p><h3>How we use your information</h3><ul><li>To deliver your orders and keep you updated</li><li>To provide customer support</li><li>To improve our store (anonymous analytics)</li></ul><p>You can ask us to delete your data at any time by contacting us.</p>`,
    },
    {
      title: "Refund & return policy",
      slug: "refund-policy",
      content: `<p>If something isn't right, we'll make it right.</p><ul><li>Check your parcel in front of the delivery person. If a product is damaged or wrong, you may return it immediately.</li><li>Returns are accepted within <strong>7 days</strong> of delivery for unused products in original packaging.</li><li>Refunds are sent via bKash/Nagad or bank transfer within 3–5 working days after we receive the product.</li><li>Delivery charges are non-refundable unless the mistake was ours.</li></ul>`,
    },
    {
      title: "Terms of service",
      slug: "terms-of-service",
      content: `<p>By placing an order with ${storeName} you agree to these terms.</p><ul><li>Prices are in Bangladeshi Taka (BDT) and may change without notice.</li><li>Orders are confirmed by phone or SMS before dispatch.</li><li>Cash on delivery orders must be paid in full to the delivery person.</li><li>We may cancel orders that look fraudulent or that we cannot fulfil.</li></ul>`,
    },
  ];
}

export async function createStoreForUser(input: {
  user: { id: string; email: string; phone: string | null };
  name: string;
  slug: string;
  category: string;
  themeSlug: string;
  presetId: string | null;
  themeName: string;
}) {
  const freePlan = await db.query.plans.findFirst({ where: eq(plans.code, "free") });
  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 86400_000);
  const settings: StoreSettings = {
    checkout: { guestCheckout: true, requireEmail: false, orderNote: true, captureIncomplete: true },
    delivery: {
      zones: [
        { id: "inside-dhaka", name: "Inside Dhaka", charge: 7000, estimatedDays: "1–2 days" },
        { id: "outside-dhaka", name: "Outside Dhaka", charge: 13000, estimatedDays: "3–5 days" },
      ],
      freeShippingOver: null,
    },
    notifications: { orderEmail: true, orderSms: false, lowStockThreshold: 5 },
    fraud: { blockPhones: [] },
  };

  return db.transaction(async (tx) => {
    const [store] = await tx
      .insert(stores)
      .values({
        ownerId: input.user.id,
        name: input.name,
        slug: input.slug,
        category: input.category,
        email: input.user.email,
        phone: input.user.phone,
        address: { country: "Bangladesh", city: "Dhaka" },
        status: "trial",
        planId: freePlan?.id ?? null,
        trialEndsAt,
        settings,
      })
      .returning();
    const s = store!;
    await tx.insert(storeMembers).values({ storeId: s.id, userId: input.user.id, role: "owner" });
    if (freePlan) {
      await tx.insert(subscriptions).values({ storeId: s.id, planId: freePlan.id, status: "trialing", currentPeriodEnd: trialEndsAt, provider: "trial" });
    }
    await tx.insert(storeThemes).values({ storeId: s.id, themeSlug: input.themeSlug, name: input.themeName, role: "live", presetId: input.presetId, publishedAt: new Date() });
    await tx.insert(pages).values(defaultPages(input.name, input.user.email, input.user.phone).map((p) => ({ ...p, storeId: s.id })));
    const id = () => crypto.randomUUID();
    await tx.insert(menus).values([
      {
        storeId: s.id,
        handle: "main",
        title: "Main menu",
        items: [
          { id: id(), label: "Home", url: "/" },
          { id: id(), label: "Shop", url: "/collections/all" },
          { id: id(), label: "About", url: "/pages/about" },
          { id: id(), label: "Contact", url: "/pages/contact" },
        ],
      },
      {
        storeId: s.id,
        handle: "footer",
        title: "Footer menu",
        items: [
          { id: id(), label: "About us", url: "/pages/about" },
          { id: id(), label: "Contact", url: "/pages/contact" },
          { id: id(), label: "Privacy policy", url: "/pages/privacy-policy" },
          { id: id(), label: "Refund policy", url: "/pages/refund-policy" },
          { id: id(), label: "Terms of service", url: "/pages/terms-of-service" },
        ],
      },
    ]);
    await tx.insert(storeIntegrations).values({ storeId: s.id, provider: "cod", type: "payment", enabled: true, config: { instructions: "Pay in cash when you receive your order." } });
    return s;
  });
}
