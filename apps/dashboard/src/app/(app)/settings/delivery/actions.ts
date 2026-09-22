"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { mergeStoreSettings } from "../_lib/store-settings";

export const saveDelivery = action(
  z.object({
    zones: z
      .array(
        z.object({
          id: z.string().trim().min(1).max(64),
          name: z.string().trim().min(1, "Every zone needs a name").max(80),
          charge: z.number().int().min(0).max(100_000_000),
          estimatedDays: z.string().trim().max(40).optional(),
        }),
      )
      .max(50, "Up to 50 delivery zones"),
    freeShippingOver: z.number().int().min(0).max(10_000_000_000).nullable(),
  }),
  { permission: "settings.manage" },
  async (input, ctx) => {
    const ids = new Set<string>();
    const zones = input.zones.map((z) => {
      const id = ids.has(z.id) ? `${z.id}-${ids.size}` : z.id;
      ids.add(id);
      return { id, name: z.name, charge: z.charge, ...(z.estimatedDays ? { estimatedDays: z.estimatedDays } : {}) };
    });
    await mergeStoreSettings(ctx.store.id, "delivery", { zones, freeShippingOver: input.freeShippingOver && input.freeShippingOver > 0 ? input.freeShippingOver : null });
    await audit(ctx, "settings.delivery.update", ctx.store.id, { zones: zones.length });
    revalidatePath("/settings/delivery");
    return { ok: true };
  },
);
