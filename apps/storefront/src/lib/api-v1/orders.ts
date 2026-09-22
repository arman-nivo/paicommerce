/** Order schemas & helpers for the REST API. */
import type { Address } from "@pai/db";
import { z } from "zod";

const optText = (max: number) => z.string().trim().max(max).nullable().optional();

export const addressInput = z
  .object({
    name: optText(120),
    phone: optText(40),
    address: optText(300),
    line1: optText(300),
    line2: optText(300),
    area: optText(120),
    city: optText(120),
    district: optText(120),
    postalCode: optText(20),
    country: optText(60),
  })
  .strict();

export function toAddress(a: z.output<typeof addressInput>): Address {
  const out: Address = {};
  const line1 = a.line1 || a.address;
  if (a.name) out.name = a.name;
  if (a.phone) out.phone = a.phone;
  if (line1) out.line1 = line1;
  if (a.line2) out.line2 = a.line2;
  if (a.area) out.area = a.area;
  if (a.city) out.city = a.city;
  if (a.district) out.district = a.district;
  if (a.postalCode) out.postalCode = a.postalCode;
  if (a.country) out.country = a.country;
  return out;
}

export const orderCreateSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1, "Name is required").max(120),
    phone: z.string().trim().min(5, "Invalid phone number").max(40).nullable().optional(),
    email: z.email("Invalid email").max(200).nullable().optional(),
  }),
  shippingAddress: addressInput.optional(),
  deliveryZoneId: z.string().trim().min(1).max(100).nullable().optional(),
  discountCode: z.string().trim().min(1).max(60).nullable().optional(),
  paymentMethod: z.string().trim().min(1).max(40).default("cod"),
  paymentStatus: z.enum(["pending", "authorized", "paid", "partially_refunded", "refunded", "failed"]).optional(),
  paymentRef: optText(200),
  note: optText(2000),
  tags: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
  lines: z
    .array(
      z
        .object({
          productId: z.uuid("Must be a product id").optional(),
          variantId: z.uuid("Must be a variant id").optional(),
          quantity: z.number().int("Must be a whole number").min(1, "Must be at least 1").max(999, "Must be at most 999"),
        })
        .refine((l) => l.productId || l.variantId, { message: "Provide productId and/or variantId", path: ["productId"] }),
    )
    .min(1, "At least one line is required")
    .max(100),
});

export const orderUpdateSchema = z
  .object({
    status: z.enum(["open", "completed", "cancelled", "archived"]),
    paymentStatus: z.enum(["pending", "authorized", "paid", "partially_refunded", "refunded", "failed"]),
    fulfillmentStatus: z.enum(["unfulfilled", "confirmed", "processing", "shipped", "delivered", "returned", "cancelled"]),
    paymentRef: z.string().trim().max(200).nullable(),
    note: z.string().trim().max(2000).nullable(),
    staffNote: z.string().trim().max(5000).nullable(),
    tags: z.array(z.string().trim().min(1).max(60)).max(30),
    courier: z
      .object({
        provider: z.string().trim().min(1).max(40),
        consignmentId: z.string().trim().max(100).optional(),
        trackingCode: z.string().trim().max(100).optional(),
        trackingUrl: z.url().optional(),
        status: z.string().trim().max(60).optional(),
      })
      .nullable(),
  })
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Provide at least one field to update");

export const FS_LABELS: Record<string, string> = {
  unfulfilled: "New",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
};
