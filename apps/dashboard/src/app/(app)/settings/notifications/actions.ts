"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { mergeStoreSettings } from "../_lib/store-settings";

export const saveNotifications = action(
  z.object({
    orderEmail: z.boolean(),
    orderSms: z.boolean(),
    lowStockThreshold: z.number().int("Use a whole number").min(0).max(100_000),
  }),
  { permission: "settings.manage" },
  async (input, ctx) => {
    await mergeStoreSettings(ctx.store.id, "notifications", input);
    await audit(ctx, "settings.notifications.update", ctx.store.id);
    revalidatePath("/settings/notifications");
    return { ok: true };
  },
);
