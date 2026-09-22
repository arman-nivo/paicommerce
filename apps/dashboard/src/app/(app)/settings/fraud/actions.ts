"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isValidBdPhone, normalizePhone } from "@pai/core";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { ActionError } from "@/lib/errors";
import { getStorePlan } from "@/lib/ctx";
import { planAtLeast } from "../_lib/plan";
import { mergeStoreSettings } from "../_lib/store-settings";

export const saveFraudSettings = action(
  z.object({
    blockPhones: z.array(z.string().max(30)).max(5000, "Up to 5,000 blocked numbers"),
    minCourierSuccessRate: z.number().int().min(0).max(100),
  }),
  { permission: "settings.manage" },
  async (input, ctx) => {
    const invalid = input.blockPhones.filter((p) => !isValidBdPhone(p));
    if (invalid.length) throw new ActionError(`Invalid phone number: ${invalid[0]}`);
    const blockPhones = [...new Set(input.blockPhones.map(normalizePhone))];
    const plan = await getStorePlan(ctx.store);
    const current = ctx.store.settings?.fraud?.minCourierSuccessRate ?? 0;
    const minCourierSuccessRate = planAtLeast(plan.code, "pro") ? input.minCourierSuccessRate : current;
    await mergeStoreSettings(ctx.store.id, "fraud", { blockPhones, minCourierSuccessRate });
    await audit(ctx, "settings.fraud.update", ctx.store.id, { blocked: blockPhones.length, minCourierSuccessRate });
    revalidatePath("/settings/fraud");
    return { ok: true };
  },
);
