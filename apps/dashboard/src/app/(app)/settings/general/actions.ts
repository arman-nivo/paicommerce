"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isValidBdPhone, normalizePhone } from "@pai/core";
import { db, eq, stores } from "@pai/db";
import { BUSINESS_CATEGORIES } from "@pai/theme-sdk";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { optText } from "@/lib/zod";
import { CURRENCIES, LOCALES, TIMEZONES } from "./options";

const categoryIds = BUSINESS_CATEGORIES.map((c) => c.id) as string[];

export const saveGeneral = action(
  z.object({
    name: z.string().trim().min(2, "Store name is too short").max(80),
    logoUrl: optText(1000),
    description: optText(1000),
    email: z.union([z.literal(""), z.email("Enter a valid email")]).optional().nullable(),
    phone: z
      .string()
      .trim()
      .max(30)
      .optional()
      .nullable()
      .refine((v) => !v || /^\+?[\d\s-]{6,20}$/.test(v), "Enter a valid phone number"),
    address: z.object({
      line1: optText(200),
      area: optText(100),
      city: optText(100),
      district: optText(100),
      postalCode: optText(20),
      country: optText(80),
    }),
    currency: z.enum(CURRENCIES.map((c) => c.code) as [string, ...string[]]),
    timezone: z.enum(TIMEZONES.map((t) => t.value) as [string, ...string[]]),
    locale: z.enum(LOCALES.map((l) => l.value) as [string, ...string[]]),
    category: z.string().refine((v) => categoryIds.includes(v), "Choose a business category"),
  }),
  { permission: "settings.manage" },
  async (input, ctx) => {
    const phone = input.phone ? (isValidBdPhone(input.phone) ? normalizePhone(input.phone) : input.phone.trim()) : null;
    const address = Object.fromEntries(Object.entries({ ...input.address, country: input.address.country ?? "Bangladesh" }).filter(([, v]) => v)) as Record<string, string>;
    await db
      .update(stores)
      .set({
        name: input.name,
        logoUrl: input.logoUrl,
        description: input.description,
        email: input.email || null,
        phone,
        address,
        currency: input.currency,
        timezone: input.timezone,
        locale: input.locale,
        category: input.category,
      })
      .where(eq(stores.id, ctx.store.id));
    await audit(ctx, "settings.general.update", ctx.store.id, { name: input.name, currency: input.currency });
    revalidatePath("/", "layout");
    return { ok: true };
  },
);
