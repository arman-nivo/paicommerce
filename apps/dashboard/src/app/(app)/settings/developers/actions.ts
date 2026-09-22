"use server";
import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomToken } from "@pai/core";
import { and, apiKeys, count, db, eq, isNull, webhooks } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { getStorePlan, type Ctx } from "@/lib/ctx";
import { ActionError } from "@/lib/errors";
import { API_SCOPES, WEBHOOK_TOPICS } from "./constants";

const scopeValues = API_SCOPES.map((s) => s.value) as [string, ...string[]];
const topicValues = WEBHOOK_TOPICS.map((t) => t.value) as [string, ...string[]];

async function requireApiAccess(ctx: Ctx) {
  const plan = await getStorePlan(ctx.store);
  if (!plan.limits.apiAccess) throw new ActionError(`API access isn't included in the ${plan.name} plan. Upgrade to use API keys and webhooks.`);
}

const done = () => revalidatePath("/settings/developers");

export const createApiKey = action(
  z.object({
    name: z.string().trim().min(1, "Give the key a name").max(60),
    scopes: z.array(z.enum(scopeValues)).min(1, "Pick at least one scope"),
  }),
  { permission: "settings.manage" },
  async (input, ctx) => {
    await requireApiAccess(ctx);
    const [{ n } = { n: 0 }] = await db.select({ n: count() }).from(apiKeys).where(and(eq(apiKeys.storeId, ctx.store.id), isNull(apiKeys.revokedAt)));
    if (n >= 20) throw new ActionError("You can have up to 20 active API keys. Revoke one you no longer use.");
    const key = `pai_sk_${randomToken(24)}`;
    const keyHash = createHash("sha256").update(key).digest("hex");
    const [row] = await db
      .insert(apiKeys)
      .values({ storeId: ctx.store.id, name: input.name, prefix: key.slice(0, 12), keyHash, scopes: [...new Set(input.scopes)] })
      .returning({ id: apiKeys.id });
    await audit(ctx, "api_key.create", row!.id, { name: input.name, scopes: input.scopes });
    done();
    return { key };
  },
);

export const revokeApiKey = action(z.object({ id: z.uuid() }), { permission: "settings.manage" }, async (input, ctx) => {
  const [row] = await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, input.id), eq(apiKeys.storeId, ctx.store.id), isNull(apiKeys.revokedAt)))
    .returning({ id: apiKeys.id });
  if (!row) throw new ActionError("That key was already revoked.");
  await audit(ctx, "api_key.revoke", row.id);
  done();
  return { ok: true };
});

export const createWebhook = action(
  z.object({
    topic: z.enum(topicValues),
    url: z
      .string()
      .trim()
      .max(500)
      .refine((u) => {
        try {
          const x = new URL(u);
          return x.protocol === "https:" && !!x.hostname;
        } catch {
          return false;
        }
      }, "Enter a valid https:// URL"),
  }),
  { permission: "settings.manage" },
  async (input, ctx) => {
    await requireApiAccess(ctx);
    const [{ n } = { n: 0 }] = await db.select({ n: count() }).from(webhooks).where(eq(webhooks.storeId, ctx.store.id));
    if (n >= 25) throw new ActionError("You can have up to 25 webhooks.");
    const secret = `whsec_${randomToken(16)}`;
    const [row] = await db.insert(webhooks).values({ storeId: ctx.store.id, topic: input.topic, url: input.url, secret }).returning({ id: webhooks.id });
    await audit(ctx, "webhook.create", row!.id, { topic: input.topic, url: input.url });
    done();
    return { secret };
  },
);

export const setWebhookActive = action(z.object({ id: z.uuid(), active: z.boolean() }), { permission: "settings.manage" }, async (input, ctx) => {
  if (input.active) await requireApiAccess(ctx);
  const [row] = await db
    .update(webhooks)
    .set({ active: input.active })
    .where(and(eq(webhooks.id, input.id), eq(webhooks.storeId, ctx.store.id)))
    .returning({ id: webhooks.id });
  if (!row) throw new ActionError("Webhook not found.");
  await audit(ctx, input.active ? "webhook.enable" : "webhook.disable", row.id);
  done();
  return { active: input.active };
});

export const deleteWebhook = action(z.object({ id: z.uuid() }), { permission: "settings.manage" }, async (input, ctx) => {
  const [row] = await db.delete(webhooks).where(and(eq(webhooks.id, input.id), eq(webhooks.storeId, ctx.store.id))).returning({ id: webhooks.id });
  if (!row) throw new ActionError("Webhook not found.");
  await audit(ctx, "webhook.delete", row.id);
  done();
  return { ok: true };
});
