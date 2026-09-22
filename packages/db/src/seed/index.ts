/**
 * PaiCommerce database seed.
 *
 *   pnpm db:seed            # no-op if the demo data already exists
 *   pnpm db:seed --force    # wipe all data and re-seed
 *   pnpm db:reset           # drop schema → push → seed
 *
 * Output is deterministic (seeded PRNG + stable UUIDs); dates are relative to "now".
 */
import { sql } from "drizzle-orm";
import { db, pg } from "../index";
import { CATALOGS } from "./catalog";
import { Rng } from "./lib/rng";
import { formatTk } from "./lib/util";
import { addSubscription, flushBilling, seedMarketplace, seedMerchants, seedOps } from "./platform";
import { seedPlans } from "./plans";
import { seedStore, type SeededStore } from "./store";
import { DEMO_STORES, seedThemes } from "./themes";
import { CREDENTIALS, seedDevelopers, seedUsers } from "./users";

const STOREFRONT = (slug: string) => `http://${slug}.localhost:3003`;

async function alreadySeeded(): Promise<boolean> {
  try {
    const rows = await db.execute<{ n: number }>(sql`select count(*)::int as n from users where lower(email) = 'demo@paicommerce.com'`);
    return Number(rows[0]?.n ?? 0) > 0;
  } catch {
    return false;
  }
}

async function wipe() {
  const rows = await db.execute<{ tablename: string }>(sql`select tablename from pg_tables where schemaname = 'public'`);
  const names = rows.map((r) => `"public"."${r.tablename}"`).filter((n) => !n.includes("__drizzle"));
  if (names.length) await db.execute(sql.raw(`TRUNCATE TABLE ${names.join(", ")} RESTART IDENTITY CASCADE`));
}

async function main() {
  const started = Date.now();
  const force = process.argv.includes("--force");
  if (await alreadySeeded()) {
    if (!force) {
      console.log("✓ Demo data already present — nothing to do. (Run `pnpm db:seed --force` to wipe and re-seed, or `pnpm db:reset`.)");
      return;
    }
    console.log("• --force: wiping existing data…");
    await wipe();
  }

  const log = (m: string) => console.log(`• ${m} (${((Date.now() - started) / 1000).toFixed(1)}s)`);

  const plans = await seedPlans();
  const u = await seedUsers();
  const dev = await seedDevelopers(u);
  const themeRefs = await seedThemes(dev, u.admin);
  log("plans, users, developers, themes");

  // 1) Theme demo stores
  const rngDemo = new Rng("demo-stores");
  const demoStores: SeededStore[] = [];
  for (const [i, d] of DEMO_STORES.entries()) {
    const theme = themeRefs.find((t) => t.slug === d.theme)!;
    const s = await seedStore({
      slug: `${d.theme}-demo`,
      name: d.name,
      category: d.category,
      catalog: d.catalog,
      ownerId: u.studio,
      planId: plans.growth!.id,
      theme: { slug: theme.slug, name: theme.name },
      description: d.description,
      email: `hello@${d.theme}-demo.paicommerce.com`,
      phone: `0170${String(1000000 + i * 7919).slice(-7)}`,
      address: { line1: `House ${12 + i}, Road ${3 + i}`, area: ["Gulshan", "Banani", "Dhanmondi", "Uttara"][i % 4], city: "Dhaka", district: "Dhaka", postalCode: "1212", country: "BD" },
      createdDaysAgo: 330 - i * 12,
      activity: { customers: 24, orders: rngDemo.int(28, 34), days: 60, growth: 0.6, carts: 6 },
    });
    addSubscription({ rng: rngDemo, storeId: s.id, plan: plans.growth!, planCode: "growth", storeCreatedAt: s.createdAt, state: "internal" });
    demoStores.push(s);
  }
  log(`${demoStores.length} theme demo stores`);

  // 2) Merchant demo account
  const rngM = new Rng("merchant-demo");
  const fashion = CATALOGS.fashion!;
  const demo = await seedStore({
    slug: "demo",
    name: "Rahim's Fashion",
    category: "fashion",
    catalog: { ...fashion, vendor: "Rahim's Fashion" },
    extended: true,
    ownerId: u.demo,
    planId: plans.growth!.id,
    theme: { slug: "aurora", name: "Aurora" },
    libraryThemes: [{ slug: "volt", name: "Volt" }],
    description: "Trendy clothing, ethnic wear and accessories for men and women — cash on delivery all over Bangladesh.",
    email: "hello@rahimsfashion.com",
    phone: "01711223344",
    address: { line1: "Shop 42, Level 3, Bashundhara City", area: "Panthapath", city: "Dhaka", district: "Dhaka", postalCode: "1205", country: "BD" },
    createdDaysAgo: 94,
    staff: [{ userId: u.staff, permissions: ["orders.view", "orders.manage", "customers.view", "products.view"] }],
    activity: { customers: 150, orders: 400, days: 90, growth: 0.9, carts: 25, conversion: 0.024 },
  });
  addSubscription({ rng: rngM, storeId: demo.id, plan: plans.growth!, planCode: "growth", storeCreatedAt: demo.createdAt, state: "active" });
  const demoGrocery = await seedStore({
    slug: "demo-grocery",
    name: "Rahim's Fresh Bazar",
    category: "grocery",
    catalog: CATALOGS.grocery!,
    extended: true,
    ownerId: u.demo,
    planId: plans.free!.id,
    theme: { slug: "freshmart", name: "FreshMart" },
    description: "Fresh fruits, vegetables and daily groceries delivered in Dhaka.",
    email: "bazar@rahimsfashion.com",
    phone: "01711223355",
    address: { line1: "House 8, Road 2", area: "Mohammadpur", city: "Dhaka", district: "Dhaka", postalCode: "1207", country: "BD" },
    createdDaysAgo: 45,
    activity: { customers: 30, orders: 34, days: 40, growth: 1.2, carts: 5 },
  });
  addSubscription({ rng: rngM, storeId: demoGrocery.id, plan: plans.free!, planCode: "free", storeCreatedAt: demoGrocery.createdAt, state: "active" });
  log("merchant demo stores (demo, demo-grocery)");

  // 3) Platform
  const merchants = await seedMerchants(plans, themeRefs);
  const billing = await flushBilling();
  const market = await seedMarketplace(themeRefs, merchants, [{ storeId: demo.id, themeSlug: "volt", at: new Date(demo.createdAt.getTime() + 30 * 86_400_000) }], dev.studio);
  const ops = await seedOps(u, demo, merchants);
  log(`${merchants.length} merchants, ${billing.subscriptions} subscriptions, ${billing.invoices} invoices, ${market.reviews} theme reviews`);

  const secs = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`\n✅ PaiCommerce seed complete in ${secs}s\n`);
  console.log("Logins (dashboard http://localhost:3001 · admin http://localhost:3002):");
  for (const c of CREDENTIALS) console.log(`  ${c.email.padEnd(26)} ${c.password.padEnd(11)} ${c.note}`);
  console.log(`  (extra merchant owners use password "merchant123")`);
  console.log("\nMerchant demo stores:");
  console.log(`  ${STOREFRONT("demo").padEnd(40)} Rahim's Fashion — ${demo.orderCount} orders, ${formatTk(demo.revenue)} GMV`);
  console.log(`  ${STOREFRONT("demo-grocery").padEnd(40)} Rahim's Fresh Bazar — ${demoGrocery.orderCount} orders`);
  console.log("\nTheme demo stores:");
  for (const s of demoStores) console.log(`  ${STOREFRONT(s.slug).padEnd(40)} ${s.name}`);
  console.log(`\nPlatform: ${merchants.length} extra merchants · ${billing.invoices} invoices (${formatTk(billing.paidRevenue)} collected) · ${market.purchases} theme purchases · ${ops.tickets} tickets · ${ops.leads} leads`);
}

main()
  .catch((e) => {
    console.error("✗ Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(() => pg.end());
