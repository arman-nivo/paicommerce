import bcrypt from "bcryptjs";
import { developerPayouts, developers, users } from "../schema";
import { uuid } from "./lib/rng";
import { addDays, daysAgo, insertMany, tk } from "./lib/util";

export const CREDENTIALS = [
  { key: "admin", email: "admin@paicommerce.com", password: "admin123", name: "Platform Admin", role: "superadmin" as const, note: "Platform admin (superadmin)" },
  { key: "support", email: "support@paicommerce.com", password: "support123", name: "Sumaiya Akter", role: "support" as const, note: "Support agent" },
  { key: "demo", email: "demo@paicommerce.com", password: "demo1234", name: "Rahim Uddin", role: "user" as const, note: "Merchant — owns `demo` + `demo-grocery`" },
  { key: "staff", email: "staff@paicommerce.com", password: "staff123", name: "Karim Hossain", role: "user" as const, note: "Staff on `demo` (orders permissions)" },
  { key: "studio", email: "studio@paicommerce.com", password: "studio123", name: "PaiCommerce Studio", role: "user" as const, note: "Owner of the 13 theme demo stores, developer 'PaiCommerce Studio'" },
  { key: "dev", email: "dev@paicommerce.com", password: "dev12345", name: "Nadia Rahman", role: "user" as const, note: "Theme developer 'Nova Themes'" },
] as const;

export type CoreUsers = Record<(typeof CREDENTIALS)[number]["key"], string>;

export async function seedUsers(): Promise<CoreUsers> {
  const ids = {} as CoreUsers;
  const rows = await Promise.all(
    CREDENTIALS.map(async (c, i) => {
      const id = uuid();
      ids[c.key] = id;
      const createdAt = daysAgo(c.key === "demo" ? 200 : c.key === "staff" ? 170 : 380 - i * 10);
      return {
        id,
        email: c.email,
        passwordHash: await bcrypt.hash(c.password, 10),
        name: c.name,
        phone: c.key === "demo" ? "01711223344" : c.key === "staff" ? "01819556677" : null,
        role: c.role,
        emailVerifiedAt: addDays(createdAt, 0),
        lastLoginAt: daysAgo(c.key === "demo" || c.key === "admin" ? 0.1 : 2),
        createdAt,
        updatedAt: createdAt,
      };
    }),
  );
  await insertMany(users, rows);
  return ids;
}

export async function seedDevelopers(u: CoreUsers) {
  const studio = uuid();
  const nova = uuid();
  await insertMany(developers, [
    { id: studio, userId: u.studio, displayName: "PaiCommerce Studio", slug: "paicommerce-studio", website: "https://paicommerce.com", bio: "The in-house design team behind PaiCommerce's official themes — built for speed, conversion and Bangladeshi shoppers.", payoutEmail: "studio@paicommerce.com", payoutMethod: "bank", revenueSharePct: 100, balance: 0, lifetimeEarnings: 0, verified: true, createdAt: daysAgo(380) },
    { id: nova, userId: u.dev, displayName: "Nova Themes", slug: "nova-themes", website: "https://novathemes.dev", bio: "An independent Dhaka-based studio crafting bold, conversion-focused storefronts.", payoutEmail: "payouts@novathemes.dev", payoutMethod: "bkash", revenueSharePct: 70, balance: tk(18450), lifetimeEarnings: tk(108800), verified: true, createdAt: daysAgo(300) },
  ]);
  await insertMany(developerPayouts, [
    { developerId: nova, amount: tk(21700), status: "paid", method: "bkash", reference: "BKP8H2K91LQ", createdAt: daysAgo(150), paidAt: daysAgo(148) },
    { developerId: nova, amount: tk(19250), status: "paid", method: "bkash", reference: "BKP9J3M22RT", createdAt: daysAgo(120), paidAt: daysAgo(118) },
    { developerId: nova, amount: tk(16800), status: "paid", method: "bkash", reference: "BKQ1A7N45WS", createdAt: daysAgo(90), paidAt: daysAgo(89) },
    { developerId: nova, amount: tk(20100), status: "paid", method: "bkash", reference: "BKQ4D2P67XU", createdAt: daysAgo(60), paidAt: daysAgo(58) },
    { developerId: nova, amount: tk(12500), status: "pending", method: "bkash", reference: null, createdAt: daysAgo(3), paidAt: null },
  ]);
  return { studio, nova };
}
