"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { mergeStoreSettings } from "../_lib/store-settings";

export const saveCheckoutSettings = action(
  z.object({
    guestCheckout: z.boolean(),
    requireEmail: z.boolean(),
    orderNote: z.boolean(),
    captureIncomplete: z.boolean(),
    minimumOrder: z.number().int().min(0).max(10_000_000_000).nullable(),
    termsUrl: z
      .string()
      .trim()
      .max(500)
      .refine((v) => !v || /^(https?:\/\/\S+|\/\S*)$/.test(v), "Use a full URL (https://…) or a path like /pages/terms"),
  }),
  { permission: "settings.manage" },
  async (input, ctx) => {
    await mergeStoreSettings(ctx.store.id, "checkout", {
      guestCheckout: input.guestCheckout,
      requireEmail: input.requireEmail,
      orderNote: input.orderNote,
      captureIncomplete: input.captureIncomplete,
      minimumOrder: input.minimumOrder ?? 0,
      termsUrl: input.termsUrl || undefined,
    });
    await audit(ctx, "settings.checkout.update", ctx.store.id);
    revalidatePath("/settings/checkout");
    return { ok: true };
  },
);
