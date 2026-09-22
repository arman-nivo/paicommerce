"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { mergeStoreSettings } from "../_lib/store-settings";

const html = z.string().max(100_000, "Policy is too long");

export const savePolicies = action(
  z.object({ refund: html, privacy: html, terms: html, shipping: html }),
  { permission: "settings.manage" },
  async (input, ctx) => {
    const clean = (s: string) => (s.replace(/<[^>]*>/g, "").trim() ? s : "");
    await mergeStoreSettings(ctx.store.id, "policies", {
      refund: clean(input.refund),
      privacy: clean(input.privacy),
      terms: clean(input.terms),
      shipping: clean(input.shipping),
    });
    await audit(ctx, "settings.policies.update", ctx.store.id);
    revalidatePath("/settings/policies");
    return { ok: true };
  },
);
