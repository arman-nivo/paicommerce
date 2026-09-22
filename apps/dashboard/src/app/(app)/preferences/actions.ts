"use server";
import { revalidatePath } from "next/cache";
import { db, eq, stores, type StoreSettings } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { preferencesSchema, SOCIAL_KEYS, type StorePassword } from "./_lib/schema";

/** Drop empty-string values so cleared fields are removed from the JSON instead of stored as "". */
function compact<T extends Record<string, string | null | undefined>>(o: T): Partial<Record<keyof T, string>> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => typeof v === "string" && v !== "")) as Partial<Record<keyof T, string>>;
}

export const savePreferences = action(preferencesSchema, { permission: "settings.manage" }, async (input, ctx) => {
  await db.transaction(async (tx) => {
    // Re-read the latest settings under a row lock so saves from other settings pages are never clobbered.
    const [row] = await tx.select({ settings: stores.settings }).from(stores).where(eq(stores.id, ctx.store.id)).for("update");
    const current: StoreSettings = row?.settings ?? {};
    const prevPassword = ((current as Record<string, unknown>).password ?? {}) as StorePassword;

    const next: StoreSettings = {
      ...current,
      seo: {
        ...current.seo,
        title: undefined,
        description: undefined,
        image: undefined,
        ...compact({ title: input.seo.title, description: input.seo.description, image: input.seo.image }),
      },
      social: { ...current.social, ...Object.fromEntries(SOCIAL_KEYS.map((k) => [k, undefined])), ...compact(input.social) },
      tracking: { ...current.tracking, facebookPixelId: undefined, ga4Id: undefined, gtmId: undefined, tiktokPixelId: undefined, ...compact(input.tracking) },
    };
    // Password protection has no column/typed key yet — stored as an extra settings key.
    (next as Record<string, unknown>).password = {
      ...prevPassword,
      enabled: input.password.enabled,
      password: input.password.password,
      message: input.password.message,
    } satisfies StorePassword;

    // JSON serialisation drops the `undefined` placeholders used above to clear keys.
    await tx
      .update(stores)
      .set({ settings: JSON.parse(JSON.stringify(next)) as StoreSettings, faviconUrl: input.faviconUrl || null })
      .where(eq(stores.id, ctx.store.id));
  });

  await audit(ctx, "settings.preferences.update", ctx.store.id, {
    passwordEnabled: input.password.enabled,
    tracking: Object.keys(compact(input.tracking)),
  });
  revalidatePath("/preferences");
  return { social: input.social, tracking: input.tracking };
});
