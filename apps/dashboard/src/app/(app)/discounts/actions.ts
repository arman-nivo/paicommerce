"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, db, discounts, eq, inArray, ne, sql } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { ActionError } from "@/lib/errors";
import { optText, uuid } from "@/lib/zod";
import { CODE_RE, fromDhakaInput, normalizeCode, randomCode } from "./_lib/shared";

const PERM = { permission: "discounts.manage" as const };

const codeField = z
  .string()
  .transform(normalizeCode)
  .refine((v) => CODE_RE.test(v), "Codes must be 3–40 letters, numbers, dashes or underscores");

const settingsSchema = z.object({
  title: optText(120),
  type: z.enum(["percentage", "fixed", "free_shipping"]),
  value: z.coerce.number().int().min(0).max(100_000_000),
  minSubtotal: z.coerce.number().int().min(0).max(100_000_000).nullable().optional(),
  usageLimit: z.coerce.number().int().min(1).max(10_000_000).nullable().optional(),
  oncePerCustomer: z.boolean().default(false),
  startsAt: z.string().max(30).nullable().optional(),
  endsAt: z.string().max(30).nullable().optional(),
  active: z.boolean().default(true),
});

type Settings = z.output<typeof settingsSchema>;

function toValues(s: Settings) {
  if (s.type === "percentage" && (s.value < 1 || s.value > 100)) throw new ActionError("Percentage must be between 1 and 100.");
  if (s.type === "fixed" && s.value < 1) throw new ActionError("Enter the discount amount.");
  const startsAt = fromDhakaInput(s.startsAt);
  const endsAt = fromDhakaInput(s.endsAt);
  if (startsAt && endsAt && endsAt <= startsAt) throw new ActionError("The end date must be after the start date.");
  return {
    title: s.title,
    type: s.type,
    value: s.type === "free_shipping" ? 0 : s.value,
    minSubtotal: s.minSubtotal || null,
    usageLimit: s.usageLimit || null,
    oncePerCustomer: s.oncePerCustomer,
    startsAt,
    endsAt,
    active: s.active,
  };
}

async function assertCodeFree(storeId: string, code: string, exceptId?: string) {
  const dup = await db.query.discounts.findFirst({
    columns: { id: true },
    where: and(eq(discounts.storeId, storeId), sql`upper(${discounts.code}) = ${code.toUpperCase()}`, exceptId ? ne(discounts.id, exceptId) : undefined),
  });
  if (dup) throw new ActionError(`The code "${code}" already exists. Choose a different code.`);
}

function isUnique(e: unknown) {
  return (e as { code?: string })?.code === "23505";
}

export const saveDiscount = action(settingsSchema.extend({ id: uuid.optional().nullable(), code: codeField }), PERM, async (input, ctx) => {
  const values = toValues(input);
  await assertCodeFree(ctx.store.id, input.code, input.id ?? undefined);
  try {
    if (input.id) {
      const [row] = await db
        .update(discounts)
        .set({ ...values, code: input.code })
        .where(and(eq(discounts.id, input.id), eq(discounts.storeId, ctx.store.id)))
        .returning({ id: discounts.id });
      if (!row) throw new ActionError("Discount not found.");
      await audit(ctx, "discount.update", row.id, { code: input.code });
      revalidatePath("/discounts");
      revalidatePath(`/discounts/${row.id}`);
      return { id: row.id, created: false };
    }
    const [row] = await db
      .insert(discounts)
      .values({ ...values, code: input.code, storeId: ctx.store.id })
      .returning({ id: discounts.id });
    await audit(ctx, "discount.create", row!.id, { code: input.code });
    revalidatePath("/discounts");
    return { id: row!.id, created: true };
  } catch (e) {
    if (isUnique(e)) throw new ActionError(`The code "${input.code}" already exists. Choose a different code.`);
    throw e;
  }
});

export const setDiscountActive = action(z.object({ id: uuid, active: z.boolean() }), PERM, async (input, ctx) => {
  const [row] = await db
    .update(discounts)
    .set({ active: input.active })
    .where(and(eq(discounts.id, input.id), eq(discounts.storeId, ctx.store.id)))
    .returning({ id: discounts.id, code: discounts.code });
  if (!row) throw new ActionError("Discount not found.");
  await audit(ctx, input.active ? "discount.enable" : "discount.disable", row.id, { code: row.code });
  revalidatePath("/discounts");
  revalidatePath(`/discounts/${row.id}`);
  return { active: input.active };
});

export const deleteDiscount = action(z.object({ id: uuid }), PERM, async (input, ctx) => {
  const [row] = await db
    .delete(discounts)
    .where(and(eq(discounts.id, input.id), eq(discounts.storeId, ctx.store.id)))
    .returning({ id: discounts.id, code: discounts.code });
  if (!row) throw new ActionError("Discount not found.");
  await audit(ctx, "discount.delete", row.id, { code: row.code });
  revalidatePath("/discounts");
  return { id: row.id };
});

export const duplicateDiscount = action(z.object({ id: uuid }), PERM, async (input, ctx) => {
  const src = await db.query.discounts.findFirst({ where: and(eq(discounts.id, input.id), eq(discounts.storeId, ctx.store.id)) });
  if (!src) throw new ActionError("Discount not found.");
  const base = src.code.slice(0, 30);
  for (let i = 0; i < 6; i++) {
    const code = i === 0 ? `${base}-COPY` : `${base}-${randomCode(4)}`;
    try {
      const [row] = await db
        .insert(discounts)
        .values({
          storeId: ctx.store.id,
          code,
          title: src.title ? `${src.title} (copy)` : null,
          type: src.type,
          value: src.value,
          minSubtotal: src.minSubtotal,
          usageLimit: src.usageLimit,
          oncePerCustomer: src.oncePerCustomer,
          startsAt: src.startsAt,
          endsAt: src.endsAt,
          active: false,
        })
        .returning({ id: discounts.id });
      await audit(ctx, "discount.duplicate", row!.id, { from: src.code, code });
      revalidatePath("/discounts");
      return { id: row!.id, code };
    } catch (e) {
      if (!isUnique(e)) throw e;
    }
  }
  throw new ActionError("Couldn't create a unique code. Please try again.");
});

export const bulkGenerateDiscounts = action(
  settingsSchema.extend({
    prefix: z
      .string()
      .transform(normalizeCode)
      .refine((v) => v.length <= 20, "Prefix can be at most 20 characters"),
    count: z.coerce.number().int().min(1, "Generate at least 1 code").max(100, "You can generate up to 100 codes at a time"),
    length: z.coerce.number().int().min(4).max(12).default(6),
  }),
  PERM,
  async (input, ctx) => {
    const values = toValues(input);
    const prefix = input.prefix ? (input.prefix.endsWith("-") || input.prefix.endsWith("_") ? input.prefix : `${input.prefix}-`) : "";
    const created: string[] = [];
    for (let attempt = 0; attempt < 5 && created.length < input.count; attempt++) {
      const want = input.count - created.length;
      const batch = new Set<string>();
      while (batch.size < want) batch.add(prefix + randomCode(input.length));
      const codes = [...batch];
      // Skip codes that already exist (case-insensitive).
      const existing = await db
        .select({ code: discounts.code })
        .from(discounts)
        .where(and(eq(discounts.storeId, ctx.store.id), inArray(sql`upper(${discounts.code})`, codes)));
      const taken = new Set(existing.map((r) => r.code.toUpperCase()));
      const fresh = codes.filter((c) => !taken.has(c));
      if (!fresh.length) continue;
      const rows = await db
        .insert(discounts)
        .values(fresh.map((code) => ({ ...values, code, storeId: ctx.store.id })))
        .onConflictDoNothing()
        .returning({ code: discounts.code });
      created.push(...rows.map((r) => r.code));
    }
    if (!created.length) throw new ActionError("Couldn't generate codes. Try a different prefix.");
    await audit(ctx, "discount.bulk_create", undefined, { count: created.length, prefix });
    revalidatePath("/discounts");
    return { codes: created };
  },
);
