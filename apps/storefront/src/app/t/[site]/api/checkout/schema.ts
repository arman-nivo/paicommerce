import { z } from "zod";
import { isValidBdPhone } from "@pai/core";

const text = (max: number) => z.string().trim().max(max);

export const AddressSchema = z.object({
  line1: text(200).min(3, "Enter your full address"),
  area: text(100).optional().default(""),
  city: text(100).optional().default(""),
  district: text(60).optional().default(""),
  postalCode: text(12).optional().default(""),
});

export const CheckoutSchema = z.object({
  name: text(120).min(2, "Enter your full name"),
  phone: z.string().trim().refine(isValidBdPhone, "Enter a valid mobile number (01XXXXXXXXX)"),
  email: z.union([z.literal(""), z.email("Enter a valid email address").trim().toLowerCase().max(200)]).optional().nullable(),
  address: AddressSchema,
  deliveryZoneId: text(80).min(1, "Choose a delivery area"),
  paymentMethod: text(40).min(1, "Choose a payment method"),
  transactionId: text(60).optional().nullable(),
  note: text(1000).optional().nullable(),
});

/** Partial snapshot saved while the customer types (powers incomplete-order recovery). */
export const DraftSchema = z.object({
  name: text(120).optional(),
  phone: text(20).optional(),
  email: text(200).optional(),
  address: z.object({ line1: text(200).optional(), area: text(100).optional(), city: text(100).optional(), district: text(60).optional() }).partial().optional(),
  deliveryZoneId: text(80).optional(),
  note: text(1000).optional(),
});
