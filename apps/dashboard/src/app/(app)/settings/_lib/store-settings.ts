import { db, eq, stores, type StoreSettings } from "@pai/db";

/**
 * Shallow-merge one sub-object of `stores.settings` without clobbering other keys.
 * Reads the latest row inside a transaction (row lock) so concurrent saves from other
 * settings pages never overwrite each other.
 */
export async function mergeStoreSettings<K extends keyof StoreSettings>(storeId: string, key: K, patch: Partial<NonNullable<StoreSettings[K]>>) {
  await db.transaction(async (tx) => {
    const [row] = await tx.select({ settings: stores.settings }).from(stores).where(eq(stores.id, storeId)).for("update");
    const current: StoreSettings = row?.settings ?? {};
    const next: StoreSettings = { ...current, [key]: { ...((current[key] as object | undefined) ?? {}), ...patch } };
    await tx.update(stores).set({ settings: next }).where(eq(stores.id, storeId));
  });
}
