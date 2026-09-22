"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isValidBdPhone, normalizePhone } from "@pai/core";
import { and, customers, db, eq, ne, stores, type Address } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { ActionError } from "@/lib/errors";
import { optText, uuid } from "@/lib/zod";

const phoneField = z
  .string()
  .trim()
  .max(30)
  .optional()
  .nullable()
  .transform((v) => (v ? normalizePhone(v) : null))
  .refine((v) => v == null || isValidBdPhone(v), "Enter a valid Bangladeshi mobile number (e.g. 01712345678)");

const emailField = z
  .union([z.literal(""), z.null(), z.undefined(), z.string().trim().toLowerCase().email("Enter a valid email address").max(200)])
  .transform((v) => (v ? v : null));

const tagsField = z.array(z.string().trim().min(1).max(40)).max(30).default([]);

const addressSchema = z.object({
  name: optText(120),
  phone: optText(30),
  line1: optText(200),
  line2: optText(200),
  area: optText(100),
  city: optText(100),
  district: optText(100),
  postalCode: optText(20),
  country: optText(60),
});

function cleanAddress(a: z.output<typeof addressSchema>): Address {
  const out: Address = {};
  for (const [k, v] of Object.entries(a)) if (v) (out as Record<string, string>)[k] = k === "phone" ? normalizePhone(v) : v;
  return out;
}

async function assertPhoneFree(storeId: string, phone: string | null, exceptId?: string) {
  if (!phone) return;
  const dup = await db.query.customers.findFirst({
    columns: { id: true, name: true },
    where: and(eq(customers.storeId, storeId), eq(customers.phone, phone), exceptId ? ne(customers.id, exceptId) : undefined),
  });
  if (dup) throw new ActionError(`A customer with this phone already exists (${dup.name}).`);
}

async function getOwned(storeId: string, id: string) {
  const c = await db.query.customers.findFirst({ where: and(eq(customers.id, id), eq(customers.storeId, storeId)) });
  if (!c) throw new ActionError("Customer not found.");
  return c;
}

export const createCustomer = action(
  z
    .object({
      name: z.string().trim().min(1, "Name is required").max(120),
      phone: phoneField,
      email: emailField,
      address: addressSchema.optional().nullable(),
      note: optText(2000),
      tags: tagsField,
      acceptsMarketing: z.boolean().default(false),
    })
    .refine((v) => v.phone || v.email, { message: "Add a phone number or an email", path: ["phone"] }),
  { permission: "customers.manage" },
  async (input, ctx) => {
    await assertPhoneFree(ctx.store.id, input.phone);
    const address = input.address ? cleanAddress(input.address) : null;
    const hasAddress = address && (address.line1 || address.city || address.area || address.district);
    const [row] = await db
      .insert(customers)
      .values({
        storeId: ctx.store.id,
        name: input.name,
        phone: input.phone,
        email: input.email,
        note: input.note,
        tags: input.tags,
        acceptsMarketing: input.acceptsMarketing,
        addresses: hasAddress ? [{ name: input.name, phone: input.phone ?? undefined, ...address }] : [],
      })
      .returning({ id: customers.id });
    await audit(ctx, "customer.create", row!.id, { name: input.name });
    revalidatePath("/customers");
    return { id: row!.id };
  },
);

export const updateCustomerContact = action(
  z
    .object({ id: uuid, name: z.string().trim().min(1, "Name is required").max(120), phone: phoneField, email: emailField })
    .refine((v) => v.phone || v.email, { message: "Add a phone number or an email", path: ["phone"] }),
  { permission: "customers.manage" },
  async (input, ctx) => {
    await getOwned(ctx.store.id, input.id);
    await assertPhoneFree(ctx.store.id, input.phone, input.id);
    await db
      .update(customers)
      .set({ name: input.name, phone: input.phone, email: input.email })
      .where(and(eq(customers.id, input.id), eq(customers.storeId, ctx.store.id)));
    await audit(ctx, "customer.update", input.id);
    revalidatePath(`/customers/${input.id}`);
    revalidatePath("/customers");
    return { id: input.id };
  },
);

export const updateCustomerProfile = action(
  z.object({ id: uuid, note: optText(5000), tags: tagsField, acceptsMarketing: z.boolean() }),
  { permission: "customers.manage" },
  async (input, ctx) => {
    await getOwned(ctx.store.id, input.id);
    await db
      .update(customers)
      .set({ note: input.note, tags: input.tags, acceptsMarketing: input.acceptsMarketing })
      .where(and(eq(customers.id, input.id), eq(customers.storeId, ctx.store.id)));
    revalidatePath(`/customers/${input.id}`);
    revalidatePath("/customers");
    return { id: input.id };
  },
);

export const saveCustomerAddresses = action(
  z.object({ id: uuid, addresses: z.array(addressSchema).max(20) }),
  { permission: "customers.manage" },
  async (input, ctx) => {
    await getOwned(ctx.store.id, input.id);
    const addresses = input.addresses.map(cleanAddress).filter((a) => Object.keys(a).length > 0);
    await db
      .update(customers)
      .set({ addresses })
      .where(and(eq(customers.id, input.id), eq(customers.storeId, ctx.store.id)));
    revalidatePath(`/customers/${input.id}`);
    return { count: addresses.length };
  },
);

export const setCustomerBlocked = action(
  z.object({ id: uuid, blocked: z.boolean(), fraudList: z.boolean().default(false) }),
  { permission: "customers.manage" },
  async (input, ctx) => {
    const c = await getOwned(ctx.store.id, input.id);
    await db
      .update(customers)
      .set({ blocked: input.blocked })
      .where(and(eq(customers.id, input.id), eq(customers.storeId, ctx.store.id)));

    // Keep the store's fraud block list in sync with the customer's phone.
    let listChanged = false;
    const phone = normalizePhone(c.phone);
    if (phone && (input.fraudList || !input.blocked)) {
      const store = await db.query.stores.findFirst({ columns: { settings: true }, where: eq(stores.id, ctx.store.id) });
      const settings = store?.settings ?? {};
      const list = (settings.fraud?.blockPhones ?? []).map(normalizePhone).filter(Boolean);
      let next = list;
      if (input.blocked && input.fraudList && !list.includes(phone)) next = [...list, phone];
      if (!input.blocked && list.includes(phone)) next = list.filter((p) => p !== phone);
      if (next !== list) {
        listChanged = true;
        await db
          .update(stores)
          .set({ settings: { ...settings, fraud: { ...settings.fraud, blockPhones: next } } })
          .where(eq(stores.id, ctx.store.id));
      }
    }
    await audit(ctx, input.blocked ? "customer.block" : "customer.unblock", input.id, { fraudList: listChanged });
    revalidatePath(`/customers/${input.id}`);
    revalidatePath("/customers");
    return { blocked: input.blocked, listChanged };
  },
);

export const deleteCustomer = action(z.object({ id: uuid }), { permission: "customers.manage" }, async (input, ctx) => {
  const c = await getOwned(ctx.store.id, input.id);
  await db.delete(customers).where(and(eq(customers.id, input.id), eq(customers.storeId, ctx.store.id)));
  await audit(ctx, "customer.delete", input.id, { name: c.name, phone: c.phone });
  revalidatePath("/customers");
  return { id: input.id };
});
