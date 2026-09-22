"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getIntegration, type IntegrationDef } from "@pai/core/integrations";
import { and, db, eq, storeIntegrations } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { getStorePlan, type Ctx } from "@/lib/ctx";
import { ActionError } from "@/lib/errors";
import { planAtLeast } from "./plan";
import { isSecretField } from "./secret";

const PAGE_FOR: Record<IntegrationDef["type"], string> = {
  payment: "/settings/payments",
  courier: "/settings/couriers",
  analytics: "/settings/apps",
  marketing: "/settings/apps",
  sms: "/settings/apps",
  other: "/settings/apps",
};

async function resolve(provider: string, ctx: Ctx, checkPlan = true) {
  const def = getIntegration(provider);
  if (!def) throw new ActionError("Unknown integration.");
  if (checkPlan && def.plan) {
    const plan = await getStorePlan(ctx.store);
    if (!planAtLeast(plan.code, def.plan)) throw new ActionError(`${def.name} is available on the ${def.plan === "pro" ? "Pro" : "Growth"} plan. Upgrade to connect it.`);
  }
  const row = await db.query.storeIntegrations.findFirst({ where: and(eq(storeIntegrations.storeId, ctx.store.id), eq(storeIntegrations.provider, provider)) });
  return { def, row };
}

function refresh(def: IntegrationDef) {
  revalidatePath(PAGE_FOR[def.type]);
  revalidatePath("/", "layout");
}

export const saveIntegration = action(
  z.object({
    provider: z.string().min(1).max(64),
    config: z.record(z.string(), z.union([z.string().max(10_000), z.boolean()])),
  }),
  { permission: "integrations.manage" },
  async (input, ctx) => {
    const { def, row } = await resolve(input.provider, ctx);
    const existing = row?.config ?? {};
    const config: Record<string, string | boolean> = {};
    const missing: string[] = [];
    for (const f of def.fields) {
      const v = input.config[f.key];
      if (f.type === "toggle") {
        config[f.key] = v === true;
        continue;
      }
      let s = typeof v === "string" ? v.trim() : "";
      // Secrets: blank means "keep the stored value".
      if (isSecretField(f) && !s && typeof existing[f.key] === "string") s = existing[f.key] as string;
      if (f.required && !s) missing.push(f.label);
      if (s) config[f.key] = s;
    }
    if (missing.length) throw new ActionError(`Please fill in: ${missing.join(", ")}`);

    await db
      .insert(storeIntegrations)
      .values({ storeId: ctx.store.id, provider: def.provider, type: def.type, config, enabled: true })
      .onConflictDoUpdate({
        target: [storeIntegrations.storeId, storeIntegrations.provider],
        set: { config, type: def.type, ...(row ? {} : { enabled: true }), updatedAt: new Date() },
      });
    await audit(ctx, row ? "integration.update" : "integration.connect", def.provider);
    refresh(def);
    return { connected: !row };
  },
);

export const setIntegrationEnabled = action(
  z.object({ provider: z.string().min(1).max(64), enabled: z.boolean() }),
  { permission: "integrations.manage" },
  async (input, ctx) => {
    const { def, row } = await resolve(input.provider, ctx, input.enabled);
    if (!row) {
      if (def.provider !== "cod") throw new ActionError(`Connect ${def.name} first.`);
      await db.insert(storeIntegrations).values({ storeId: ctx.store.id, provider: "cod", type: "payment", config: {}, enabled: input.enabled }).onConflictDoUpdate({
        target: [storeIntegrations.storeId, storeIntegrations.provider],
        set: { enabled: input.enabled, updatedAt: new Date() },
      });
    } else {
      await db.update(storeIntegrations).set({ enabled: input.enabled }).where(and(eq(storeIntegrations.id, row.id), eq(storeIntegrations.storeId, ctx.store.id)));
    }
    await audit(ctx, input.enabled ? "integration.enable" : "integration.disable", def.provider);
    refresh(def);
    return { enabled: input.enabled };
  },
);

export const disconnectIntegration = action(
  z.object({ provider: z.string().min(1).max(64) }),
  { permission: "integrations.manage" },
  async (input, ctx) => {
    const { def } = await resolve(input.provider, ctx, false);
    await db.delete(storeIntegrations).where(and(eq(storeIntegrations.storeId, ctx.store.id), eq(storeIntegrations.provider, def.provider)));
    await audit(ctx, "integration.disconnect", def.provider);
    refresh(def);
    return { ok: true };
  },
);

/** Checks the saved credentials are complete. (Live API calls to the provider happen at booking/payment time.) */
export const testIntegration = action(
  z.object({ provider: z.string().min(1).max(64) }),
  { permission: "integrations.manage" },
  async (input, ctx) => {
    const { def, row } = await resolve(input.provider, ctx, false);
    if (!row) throw new ActionError(`Connect ${def.name} first.`);
    const missing = def.fields.filter((f) => f.required && !row.config?.[f.key]).map((f) => f.label);
    if (missing.length) throw new ActionError(`Missing: ${missing.join(", ")}`);
    return { message: `${def.name} credentials look complete${row.config?.sandbox ? " (sandbox mode)" : ""}.` };
  },
);
