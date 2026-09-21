/**
 * PaiCommerce database schema.
 *
 * Conventions
 * - Every tenant-owned table carries `storeId` and is indexed on it (row-level multi-tenancy).
 * - Money is stored as integers in minor units (poisha / cents). Use `formatMoney` from @pai/core.
 * - Column names are camelCase in TS and snake_case in Postgres (drizzle `casing: "snake_case"`).
 */
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const id = () => uuid().primaryKey().defaultRandom();
const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

/* ───────────────────────────── Enums ───────────────────────────── */

export const userRole = pgEnum("user_role", ["user", "support", "admin", "superadmin"]);
export const storeStatus = pgEnum("store_status", ["trial", "active", "past_due", "suspended", "closed"]);
export const memberRole = pgEnum("member_role", ["owner", "admin", "staff"]);
export const productStatus = pgEnum("product_status", ["draft", "active", "archived"]);
export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "authorized",
  "paid",
  "partially_refunded",
  "refunded",
  "failed",
]);
export const fulfillmentStatus = pgEnum("fulfillment_status", [
  "unfulfilled",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "returned",
  "cancelled",
]);
export const orderStatus = pgEnum("order_status", ["open", "completed", "cancelled", "archived"]);
export const discountType = pgEnum("discount_type", ["percentage", "fixed", "free_shipping"]);
export const themeStatus = pgEnum("theme_status", ["draft", "in_review", "approved", "rejected", "unlisted"]);
export const storeThemeRole = pgEnum("store_theme_role", ["live", "unpublished"]);
export const subscriptionStatus = pgEnum("subscription_status", ["trialing", "active", "past_due", "cancelled"]);
export const billingInterval = pgEnum("billing_interval", ["monthly", "yearly"]);
export const invoiceStatus = pgEnum("invoice_status", ["draft", "open", "paid", "void", "uncollectible"]);
export const integrationType = pgEnum("integration_type", ["payment", "courier", "analytics", "marketing", "sms", "other"]);
export const ticketStatus = pgEnum("ticket_status", ["open", "pending", "resolved", "closed"]);
export const payoutStatus = pgEnum("payout_status", ["pending", "processing", "paid", "failed"]);

/* ───────────────────────────── Shared JSON types ───────────────────────────── */

export type Address = {
  name?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  area?: string;
  district?: string;
  postalCode?: string;
  country?: string;
};

export type ProductImage = { url: string; alt?: string };
export type ProductOption = { name: string; values: string[] };
export type Seo = { title?: string; description?: string; image?: string };
export type MenuItem = { id: string; label: string; url: string; children?: MenuItem[] };

export type DeliveryZone = { id: string; name: string; charge: number; estimatedDays?: string };

export type StoreSettings = {
  checkout?: {
    requireEmail?: boolean;
    guestCheckout?: boolean;
    orderNote?: boolean;
    termsUrl?: string;
    minimumOrder?: number;
    /** Capture partially filled checkouts as "incomplete orders" for follow-up. */
    captureIncomplete?: boolean;
  };
  delivery?: { zones: DeliveryZone[]; freeShippingOver?: number | null };
  social?: Partial<Record<"facebook" | "instagram" | "youtube" | "tiktok" | "x" | "whatsapp" | "messenger", string>>;
  seo?: Seo;
  tracking?: { facebookPixelId?: string; ga4Id?: string; gtmId?: string; tiktokPixelId?: string };
  notifications?: { orderEmail?: boolean; orderSms?: boolean; lowStockThreshold?: number };
  fraud?: { blockPhones?: string[]; minCourierSuccessRate?: number };
  policies?: { refund?: string; privacy?: string; terms?: string; shipping?: string };
};

export type PlanLimits = {
  products: number | null; // null = unlimited
  ordersPerMonth: number | null;
  staff: number | null;
  customDomain: boolean;
  premiumThemes: boolean;
  transactionFeePct: number;
  storage: number; // MB
  apiAccess: boolean;
  removeBranding: boolean;
};

/* ───────────────────────────── Identity ───────────────────────────── */

export const users = pgTable(
  "users",
  {
    id: id(),
    email: text().notNull(),
    passwordHash: text(),
    name: text().notNull(),
    phone: text(),
    avatarUrl: text(),
    role: userRole().notNull().default("user"),
    emailVerifiedAt: timestamp({ withTimezone: true }),
    lastLoginAt: timestamp({ withTimezone: true }),
    disabled: boolean().notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("users_email_uq").on(sql`lower(${t.email})`)],
);

/* ───────────────────────────── Plans & billing ───────────────────────────── */

export const plans = pgTable("plans", {
  id: id(),
  code: text().notNull().unique(),
  name: text().notNull(),
  tagline: text(),
  priceMonthly: integer().notNull(), // minor units
  priceYearly: integer().notNull(),
  currency: text().notNull().default("BDT"),
  limits: jsonb().$type<PlanLimits>().notNull(),
  features: text().array().notNull().default(sql`'{}'::text[]`),
  highlighted: boolean().notNull().default(false),
  active: boolean().notNull().default(true),
  sort: integer().notNull().default(0),
  createdAt: createdAt(),
});

/* ───────────────────────────── Stores ───────────────────────────── */

export const stores = pgTable(
  "stores",
  {
    id: id(),
    ownerId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    name: text().notNull(),
    slug: text().notNull().unique(),
    customDomain: text().unique(),
    domainVerified: boolean().notNull().default(false),
    category: text().notNull().default("general"),
    description: text(),
    logoUrl: text(),
    faviconUrl: text(),
    email: text(),
    phone: text(),
    address: jsonb().$type<Address>(),
    currency: text().notNull().default("BDT"),
    locale: text().notNull().default("en"),
    timezone: text().notNull().default("Asia/Dhaka"),
    status: storeStatus().notNull().default("trial"),
    planId: uuid().references(() => plans.id),
    trialEndsAt: timestamp({ withTimezone: true }),
    settings: jsonb().$type<StoreSettings>().notNull().default({}),
    orderSeq: integer().notNull().default(1000),
    onboardingCompleted: boolean().notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("stores_owner_idx").on(t.ownerId), index("stores_status_idx").on(t.status)],
);

export const storeMembers = pgTable(
  "store_members",
  {
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: memberRole().notNull().default("staff"),
    /** Permission keys, see PERMISSIONS in @pai/core. Owners/admins implicitly have all. */
    permissions: text().array().notNull().default(sql`'{}'::text[]`),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.storeId, t.userId] }), index("store_members_user_idx").on(t.userId)],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: id(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    planId: uuid()
      .notNull()
      .references(() => plans.id),
    status: subscriptionStatus().notNull().default("trialing"),
    interval: billingInterval().notNull().default("monthly"),
    currentPeriodStart: timestamp({ withTimezone: true }).notNull().defaultNow(),
    currentPeriodEnd: timestamp({ withTimezone: true }).notNull(),
    cancelAtPeriodEnd: boolean().notNull().default(false),
    provider: text(),
    providerRef: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("subscriptions_store_idx").on(t.storeId)],
);

export const platformInvoices = pgTable(
  "platform_invoices",
  {
    id: id(),
    number: text().notNull().unique(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    subscriptionId: uuid().references(() => subscriptions.id),
    description: text().notNull(),
    amount: integer().notNull(),
    currency: text().notNull().default("BDT"),
    status: invoiceStatus().notNull().default("open"),
    dueAt: timestamp({ withTimezone: true }),
    paidAt: timestamp({ withTimezone: true }),
    paymentMethod: text(),
    createdAt: createdAt(),
  },
  (t) => [index("platform_invoices_store_idx").on(t.storeId), index("platform_invoices_status_idx").on(t.status)],
);

/* ───────────────────────────── Catalog ───────────────────────────── */

export const products = pgTable(
  "products",
  {
    id: id(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    title: text().notNull(),
    slug: text().notNull(),
    description: text(), // HTML
    status: productStatus().notNull().default("active"),
    vendor: text(),
    productType: text(),
    tags: text().array().notNull().default(sql`'{}'::text[]`),
    images: jsonb().$type<ProductImage[]>().notNull().default([]),
    price: integer().notNull().default(0),
    compareAtPrice: integer(),
    costPrice: integer(),
    sku: text(),
    barcode: text(),
    trackInventory: boolean().notNull().default(true),
    inventory: integer().notNull().default(0),
    allowBackorder: boolean().notNull().default(false),
    weightGrams: integer(),
    options: jsonb().$type<ProductOption[]>().notNull().default([]),
    seo: jsonb().$type<Seo>(),
    featured: boolean().notNull().default(false),
    ratingAvg: real().notNull().default(0),
    ratingCount: integer().notNull().default(0),
    salesCount: integer().notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("products_store_slug_uq").on(t.storeId, t.slug),
    index("products_store_status_idx").on(t.storeId, t.status),
    index("products_store_created_idx").on(t.storeId, t.createdAt),
  ],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: id(),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    title: text().notNull(), // e.g. "M / Red"
    options: jsonb().$type<Record<string, string>>().notNull().default({}),
    price: integer().notNull(),
    compareAtPrice: integer(),
    sku: text(),
    inventory: integer().notNull().default(0),
    imageUrl: text(),
    position: integer().notNull().default(0),
  },
  (t) => [index("variants_product_idx").on(t.productId), index("variants_store_idx").on(t.storeId)],
);

export const collections = pgTable(
  "collections",
  {
    id: id(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    title: text().notNull(),
    slug: text().notNull(),
    description: text(),
    imageUrl: text(),
    published: boolean().notNull().default(true),
    sortOrder: text().notNull().default("manual"), // manual | newest | price-asc | price-desc | best-selling
    seo: jsonb().$type<Seo>(),
    position: integer().notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("collections_store_slug_uq").on(t.storeId, t.slug)],
);

export const productCollections = pgTable(
  "product_collections",
  {
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    collectionId: uuid()
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    position: integer().notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.productId, t.collectionId] }), index("pc_collection_idx").on(t.collectionId)],
);

export const productReviews = pgTable(
  "product_reviews",
  {
    id: id(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    customerName: text().notNull(),
    rating: integer().notNull(),
    title: text(),
    body: text(),
    approved: boolean().notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("reviews_product_idx").on(t.productId)],
);

/* ───────────────────────────── Customers, carts & orders ───────────────────────────── */

export const customers = pgTable(
  "customers",
  {
    id: id(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    name: text().notNull(),
    email: text(),
    phone: text(),
    passwordHash: text(),
    addresses: jsonb().$type<Address[]>().notNull().default([]),
    tags: text().array().notNull().default(sql`'{}'::text[]`),
    note: text(),
    acceptsMarketing: boolean().notNull().default(false),
    ordersCount: integer().notNull().default(0),
    totalSpent: integer().notNull().default(0),
    blocked: boolean().notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("customers_store_idx").on(t.storeId),
    index("customers_store_phone_idx").on(t.storeId, t.phone),
    index("customers_store_email_idx").on(t.storeId, t.email),
  ],
);

export type CartLine = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

export type CheckoutSnapshot = {
  name?: string;
  phone?: string;
  email?: string;
  address?: Address;
  deliveryZoneId?: string;
  note?: string;
  step?: "contact" | "shipping" | "payment";
};

export const carts = pgTable(
  "carts",
  {
    id: id(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    token: text().notNull().unique(),
    customerId: uuid().references(() => customers.id, { onDelete: "set null" }),
    lines: jsonb().$type<CartLine[]>().notNull().default([]),
    discountCode: text(),
    /** Partial checkout info — powers incomplete order / abandoned cart recovery. */
    checkout: jsonb().$type<CheckoutSnapshot>(),
    recoveredOrderId: uuid(),
    recoveryContactedAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("carts_store_updated_idx").on(t.storeId, t.updatedAt)],
);

export type CourierInfo = {
  provider: string; // steadfast | pathao | redx | manual
  consignmentId?: string;
  trackingCode?: string;
  trackingUrl?: string;
  status?: string;
  bookedAt?: string;
};

export const orders = pgTable(
  "orders",
  {
    id: id(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    number: integer().notNull(),
    customerId: uuid().references(() => customers.id, { onDelete: "set null" }),
    name: text().notNull(),
    email: text(),
    phone: text(),
    shippingAddress: jsonb().$type<Address>(),
    subtotal: integer().notNull(),
    discountTotal: integer().notNull().default(0),
    shippingTotal: integer().notNull().default(0),
    taxTotal: integer().notNull().default(0),
    total: integer().notNull(),
    currency: text().notNull().default("BDT"),
    discountCode: text(),
    deliveryZone: text(),
    paymentMethod: text().notNull().default("cod"), // cod | bkash | nagad | sslcommerz | stripe | manual
    paymentStatus: paymentStatus().notNull().default("pending"),
    paymentRef: text(),
    fulfillmentStatus: fulfillmentStatus().notNull().default("unfulfilled"),
    status: orderStatus().notNull().default("open"),
    courier: jsonb().$type<CourierInfo>(),
    note: text(),
    staffNote: text(),
    tags: text().array().notNull().default(sql`'{}'::text[]`),
    source: text().notNull().default("web"), // web | manual | facebook | landing | pos | api
    ip: text(),
    userAgent: text(),
    cancelledAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("orders_store_number_uq").on(t.storeId, t.number),
    index("orders_store_created_idx").on(t.storeId, t.createdAt),
    index("orders_store_status_idx").on(t.storeId, t.fulfillmentStatus),
    index("orders_store_phone_idx").on(t.storeId, t.phone),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: id(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid().references(() => products.id, { onDelete: "set null" }),
    variantId: uuid().references(() => productVariants.id, { onDelete: "set null" }),
    title: text().notNull(),
    variantTitle: text(),
    sku: text(),
    imageUrl: text(),
    price: integer().notNull(),
    quantity: integer().notNull(),
    total: integer().notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

export const orderEvents = pgTable(
  "order_events",
  {
    id: id(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    type: text().notNull(), // created | status | payment | note | courier | email
    message: text().notNull(),
    userId: uuid().references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [index("order_events_order_idx").on(t.orderId)],
);

export const discounts = pgTable(
  "discounts",
  {
    id: id(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    code: text().notNull(),
    title: text(),
    type: discountType().notNull().default("percentage"),
    value: integer().notNull().default(0), // percentage (0-100) or minor units
    minSubtotal: integer(),
    usageLimit: integer(),
    usedCount: integer().notNull().default(0),
    oncePerCustomer: boolean().notNull().default(false),
    startsAt: timestamp({ withTimezone: true }),
    endsAt: timestamp({ withTimezone: true }),
    active: boolean().notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("discounts_store_code_uq").on(t.storeId, sql`upper(${t.code})`)],
);

/* ───────────────────────────── Content ───────────────────────────── */

export const pages = pgTable(
  "pages",
  {
    id: id(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    title: text().notNull(),
    slug: text().notNull(),
    content: text(), // HTML
    published: boolean().notNull().default(true),
    seo: jsonb().$type<Seo>(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("pages_store_slug_uq").on(t.storeId, t.slug)],
);

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: id(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    title: text().notNull(),
    slug: text().notNull(),
    excerpt: text(),
    content: text(),
    coverUrl: text(),
    author: text(),
    tags: text().array().notNull().default(sql`'{}'::text[]`),
    published: boolean().notNull().default(true),
    publishedAt: timestamp({ withTimezone: true }).defaultNow(),
    seo: jsonb().$type<Seo>(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("blog_posts_store_slug_uq").on(t.storeId, t.slug)],
);

export const menus = pgTable(
  "menus",
  {
    id: id(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    handle: text().notNull(), // main | footer | ...
    title: text().notNull(),
    items: jsonb().$type<MenuItem[]>().notNull().default([]),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("menus_store_handle_uq").on(t.storeId, t.handle)],
);

export const media = pgTable(
  "media",
  {
    id: id(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    url: text().notNull(),
    alt: text(),
    mime: text(),
    size: integer(),
    width: integer(),
    height: integer(),
    createdAt: createdAt(),
  },
  (t) => [index("media_store_idx").on(t.storeId)],
);

/* ───────────────────────────── Themes & marketplace ───────────────────────────── */

export const developers = pgTable("developers", {
  id: id(),
  userId: uuid()
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: text().notNull(),
  slug: text().notNull().unique(),
  website: text(),
  bio: text(),
  avatarUrl: text(),
  payoutEmail: text(),
  payoutMethod: text().default("bank"), // bank | bkash | paypal | wise
  revenueSharePct: integer().notNull().default(70),
  balance: integer().notNull().default(0),
  lifetimeEarnings: integer().notNull().default(0),
  verified: boolean().notNull().default(false),
  createdAt: createdAt(),
});

/** Theme Store catalogue. Code lives in /themes/<slug>; this row is the listing. */
export const themes = pgTable(
  "themes",
  {
    id: id(),
    slug: text().notNull().unique(),
    name: text().notNull(),
    developerId: uuid().references(() => developers.id, { onDelete: "set null" }),
    tagline: text(),
    description: text(),
    categories: text().array().notNull().default(sql`'{}'::text[]`),
    tags: text().array().notNull().default(sql`'{}'::text[]`),
    price: integer().notNull().default(0), // 0 = free, minor units in BDT
    version: text().notNull().default("1.0.0"),
    thumbnailUrl: text(),
    screenshots: text().array().notNull().default(sql`'{}'::text[]`),
    demoStoreSlug: text(),
    features: text().array().notNull().default(sql`'{}'::text[]`),
    status: themeStatus().notNull().default("draft"),
    featured: boolean().notNull().default(false),
    ratingAvg: real().notNull().default(0),
    ratingCount: integer().notNull().default(0),
    installs: integer().notNull().default(0),
    repoUrl: text(),
    reviewNotes: text(),
    submittedAt: timestamp({ withTimezone: true }),
    approvedAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("themes_status_idx").on(t.status)],
);

export const themeVersions = pgTable(
  "theme_versions",
  {
    id: id(),
    themeId: uuid()
      .notNull()
      .references(() => themes.id, { onDelete: "cascade" }),
    version: text().notNull(),
    changelog: text(),
    status: themeStatus().notNull().default("in_review"),
    reviewNotes: text(),
    submittedAt: createdAt(),
    reviewedAt: timestamp({ withTimezone: true }),
    reviewerId: uuid().references(() => users.id),
  },
  (t) => [index("theme_versions_theme_idx").on(t.themeId)],
);

export const themePurchases = pgTable(
  "theme_purchases",
  {
    id: id(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    themeId: uuid()
      .notNull()
      .references(() => themes.id, { onDelete: "restrict" }),
    amount: integer().notNull(),
    developerShare: integer().notNull(),
    platformShare: integer().notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("theme_purchases_uq").on(t.storeId, t.themeId)],
);

export const themeReviews = pgTable("theme_reviews", {
  id: id(),
  themeId: uuid()
    .notNull()
    .references(() => themes.id, { onDelete: "cascade" }),
  storeId: uuid()
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  rating: integer().notNull(),
  body: text(),
  createdAt: createdAt(),
});

export const developerPayouts = pgTable("developer_payouts", {
  id: id(),
  developerId: uuid()
    .notNull()
    .references(() => developers.id, { onDelete: "cascade" }),
  amount: integer().notNull(),
  status: payoutStatus().notNull().default("pending"),
  method: text(),
  reference: text(),
  createdAt: createdAt(),
  paidAt: timestamp({ withTimezone: true }),
});

/**
 * A theme installed in a store's library. `config` is the published ThemeConfig
 * (see @pai/theme-sdk); `draftConfig` holds unsaved customizer edits.
 * A null config means "use the theme's default config / preset".
 */
export const storeThemes = pgTable(
  "store_themes",
  {
    id: id(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    themeSlug: text().notNull(),
    name: text().notNull(),
    role: storeThemeRole().notNull().default("unpublished"),
    presetId: text(),
    config: jsonb().$type<Record<string, unknown>>(),
    draftConfig: jsonb().$type<Record<string, unknown>>(),
    publishedAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("store_themes_store_idx").on(t.storeId, t.role)],
);

/* ───────────────────────────── Integrations & developer API ───────────────────────────── */

export const storeIntegrations = pgTable(
  "store_integrations",
  {
    id: id(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    provider: text().notNull(), // bkash | nagad | sslcommerz | stripe | cod | steadfast | pathao | redx | facebook_pixel | ...
    type: integrationType().notNull(),
    enabled: boolean().notNull().default(false),
    config: jsonb().$type<Record<string, string | boolean | number>>().notNull().default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("integrations_store_provider_uq").on(t.storeId, t.provider)],
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: id(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    name: text().notNull(),
    prefix: text().notNull(),
    keyHash: text().notNull().unique(),
    scopes: text().array().notNull().default(sql`'{}'::text[]`),
    lastUsedAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
    revokedAt: timestamp({ withTimezone: true }),
  },
  (t) => [index("api_keys_store_idx").on(t.storeId)],
);

export const webhooks = pgTable(
  "webhooks",
  {
    id: id(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    topic: text().notNull(), // order.created | order.updated | product.updated | customer.created
    url: text().notNull(),
    secret: text().notNull(),
    active: boolean().notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("webhooks_store_idx").on(t.storeId)],
);

/* ───────────────────────────── Analytics ───────────────────────────── */

export const analyticsDaily = pgTable(
  "analytics_daily",
  {
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    day: date().notNull(),
    pageViews: integer().notNull().default(0),
    visitors: integer().notNull().default(0),
    productViews: integer().notNull().default(0),
    addToCarts: integer().notNull().default(0),
    checkouts: integer().notNull().default(0),
    orders: integer().notNull().default(0),
    revenue: integer().notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.storeId, t.day] })],
);

/* ───────────────────────────── Platform ops ───────────────────────────── */

export const announcements = pgTable("announcements", {
  id: id(),
  title: text().notNull(),
  body: text().notNull(),
  level: text().notNull().default("info"), // info | success | warning | critical
  audience: text().notNull().default("merchants"), // merchants | developers | all
  active: boolean().notNull().default(true),
  createdAt: createdAt(),
});

export type TicketMessage = { from: "merchant" | "support"; authorName: string; body: string; at: string };

export const supportTickets = pgTable(
  "support_tickets",
  {
    id: id(),
    storeId: uuid().references(() => stores.id, { onDelete: "cascade" }),
    userId: uuid().references(() => users.id, { onDelete: "set null" }),
    subject: text().notNull(),
    priority: text().notNull().default("normal"), // low | normal | high | urgent
    status: ticketStatus().notNull().default("open"),
    messages: jsonb().$type<TicketMessage[]>().notNull().default([]),
    assigneeId: uuid().references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("tickets_status_idx").on(t.status)],
);

export const leads = pgTable("leads", {
  id: id(),
  name: text().notNull(),
  email: text().notNull(),
  phone: text(),
  company: text(),
  message: text(),
  source: text().notNull().default("contact"), // contact | demo | enterprise | newsletter
  createdAt: createdAt(),
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: id(),
    actorId: uuid().references(() => users.id, { onDelete: "set null" }),
    storeId: uuid().references(() => stores.id, { onDelete: "cascade" }),
    action: text().notNull(),
    target: text(),
    meta: jsonb().$type<Record<string, unknown>>(),
    ip: text(),
    createdAt: createdAt(),
  },
  (t) => [index("audit_store_idx").on(t.storeId, t.createdAt), index("audit_created_idx").on(t.createdAt)],
);

export const platformSettings = pgTable("platform_settings", {
  key: text().primaryKey(),
  value: jsonb().notNull(),
  updatedAt: updatedAt(),
});

/* ───────────────────────────── Relations ───────────────────────────── */

export const usersRelations = relations(users, ({ many, one }) => ({
  memberships: many(storeMembers),
  ownedStores: many(stores),
  developer: one(developers, { fields: [users.id], references: [developers.userId] }),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, { fields: [stores.ownerId], references: [users.id] }),
  plan: one(plans, { fields: [stores.planId], references: [plans.id] }),
  members: many(storeMembers),
  products: many(products),
  orders: many(orders),
  themes: many(storeThemes),
  integrations: many(storeIntegrations),
}));

export const storeMembersRelations = relations(storeMembers, ({ one }) => ({
  store: one(stores, { fields: [storeMembers.storeId], references: [stores.id] }),
  user: one(users, { fields: [storeMembers.userId], references: [users.id] }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, { fields: [products.storeId], references: [stores.id] }),
  variants: many(productVariants),
  collections: many(productCollections),
  reviews: many(productReviews),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));

export const collectionsRelations = relations(collections, ({ many }) => ({
  products: many(productCollections),
}));

export const productCollectionsRelations = relations(productCollections, ({ one }) => ({
  product: one(products, { fields: [productCollections.productId], references: [products.id] }),
  collection: one(collections, { fields: [productCollections.collectionId], references: [collections.id] }),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, { fields: [productReviews.productId], references: [products.id] }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  store: one(stores, { fields: [orders.storeId], references: [stores.id] }),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  items: many(orderItems),
  events: many(orderEvents),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] }),
  user: one(users, { fields: [orderEvents.userId], references: [users.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  store: one(stores, { fields: [subscriptions.storeId], references: [stores.id] }),
  plan: one(plans, { fields: [subscriptions.planId], references: [plans.id] }),
}));

export const platformInvoicesRelations = relations(platformInvoices, ({ one }) => ({
  store: one(stores, { fields: [platformInvoices.storeId], references: [stores.id] }),
}));

export const developersRelations = relations(developers, ({ one, many }) => ({
  user: one(users, { fields: [developers.userId], references: [users.id] }),
  themes: many(themes),
  payouts: many(developerPayouts),
}));

export const themesRelations = relations(themes, ({ one, many }) => ({
  developer: one(developers, { fields: [themes.developerId], references: [developers.id] }),
  versions: many(themeVersions),
  purchases: many(themePurchases),
  reviews: many(themeReviews),
}));

export const themeVersionsRelations = relations(themeVersions, ({ one }) => ({
  theme: one(themes, { fields: [themeVersions.themeId], references: [themes.id] }),
}));

export const themePurchasesRelations = relations(themePurchases, ({ one }) => ({
  theme: one(themes, { fields: [themePurchases.themeId], references: [themes.id] }),
  store: one(stores, { fields: [themePurchases.storeId], references: [stores.id] }),
}));

export const themeReviewsRelations = relations(themeReviews, ({ one }) => ({
  theme: one(themes, { fields: [themeReviews.themeId], references: [themes.id] }),
  store: one(stores, { fields: [themeReviews.storeId], references: [stores.id] }),
}));

export const developerPayoutsRelations = relations(developerPayouts, ({ one }) => ({
  developer: one(developers, { fields: [developerPayouts.developerId], references: [developers.id] }),
}));

export const storeThemesRelations = relations(storeThemes, ({ one }) => ({
  store: one(stores, { fields: [storeThemes.storeId], references: [stores.id] }),
}));

export const storeIntegrationsRelations = relations(storeIntegrations, ({ one }) => ({
  store: one(stores, { fields: [storeIntegrations.storeId], references: [stores.id] }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  store: one(stores, { fields: [supportTickets.storeId], references: [stores.id] }),
  user: one(users, { fields: [supportTickets.userId], references: [users.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, { fields: [auditLogs.actorId], references: [users.id] }),
  store: one(stores, { fields: [auditLogs.storeId], references: [stores.id] }),
}));

/* ───────────────────────────── Inferred types ───────────────────────────── */

export type User = typeof users.$inferSelect;
export type Store = typeof stores.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Cart = typeof carts.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Discount = typeof discounts.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type Menu = typeof menus.$inferSelect;
export type Theme = typeof themes.$inferSelect;
export type StoreTheme = typeof storeThemes.$inferSelect;
export type Developer = typeof developers.$inferSelect;
export type StoreIntegration = typeof storeIntegrations.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
