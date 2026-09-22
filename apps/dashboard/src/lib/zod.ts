import { z } from "zod";

export const uuid = z.string().uuid();
export const uuids = z.array(z.string().uuid()).min(1).max(500);
/** Money entered in major units (e.g. "1250.50") → minor units integer. */
export const moneyMajor = z.coerce.number().min(0).max(100_000_000).transform((n) => Math.round(n * 100));
export const optMoneyMajor = z
  .union([z.literal(""), z.null(), z.undefined(), z.coerce.number().min(0).max(100_000_000)])
  .transform((n) => (n === "" || n == null ? null : Math.round(Number(n) * 100)));
export const optText = (max = 500) => z.string().trim().max(max).optional().nullable().transform((v) => (v ? v : null));
export const slugStr = z.string().trim().toLowerCase().regex(/^[a-z0-9ঀ-৿]+(?:-[a-z0-9ঀ-৿]+)*$/, "Use lowercase letters, numbers and dashes").max(80);
