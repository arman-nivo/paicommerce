"use server";

import { z } from "zod";
import { db, eq, platformSettings } from "@pai/db";
import { adminAction, fail } from "@/lib/action";
import { audit } from "@/lib/audit";
import { KNOWN_KEYS, SETTING_SCHEMAS, type KnownKey } from "@/lib/settings";

async function upsert(key: string, value: unknown) {
  const before = await db.query.platformSettings.findFirst({ where: eq(platformSettings.key, key) });
  await db
    .insert(platformSettings)
    .values({ key, value: value as object })
    .onConflictDoUpdate({ target: platformSettings.key, set: { value: value as object, updatedAt: new Date() } });
  return before?.value ?? null;
}

export const saveKnownSetting = adminAction("settings.manage", z.object({ key: z.enum(KNOWN_KEYS as [KnownKey, ...KnownKey[]]), value: z.unknown() }), async ({ key, value }, admin) => {
  const parsed = SETTING_SCHEMAS[key].safeParse(value);
  if (!parsed.success) fail(`${key}: ${parsed.error.issues[0]?.message ?? "invalid value"}`);
  const before = await upsert(key, parsed.data);
  await audit({ actorId: admin.id, action: "settings.updated", target: key, meta: { before, after: parsed.data } });
  return { message: "Setting saved" };
});

export const saveRawSetting = adminAction(
  "settings.manage",
  z.object({ key: z.string().trim().regex(/^[a-z0-9][a-z0-9_.-]{1,63}$/, "Keys are lowercase letters, digits, _ . - (2–64 chars)"), json: z.string().max(50_000) }),
  async ({ key, json }, admin) => {
    let value: unknown;
    try {
      value = JSON.parse(json);
    } catch {
      fail("Value must be valid JSON (strings need quotes)");
    }
    if ((KNOWN_KEYS as string[]).includes(key)) {
      const parsed = SETTING_SCHEMAS[key as KnownKey].safeParse(value);
      if (!parsed.success) fail(`${key}: ${parsed.error.issues[0]?.message ?? "invalid value"}`);
    }
    const before = await upsert(key, value);
    await audit({ actorId: admin.id, action: "settings.updated", target: key, meta: { before, after: value } });
    return { message: `${key} saved` };
  },
);

export const deleteSetting = adminAction("settings.manage", z.object({ key: z.string().min(1).max(64) }), async ({ key }, admin) => {
  const [row] = await db.delete(platformSettings).where(eq(platformSettings.key, key)).returning();
  if (!row) fail("Setting not found");
  await audit({ actorId: admin.id, action: "settings.deleted", target: key, meta: { before: row.value } });
  return { message: `${key} reset to default` };
});
