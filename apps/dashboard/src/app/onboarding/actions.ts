"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser, setActiveStore } from "@pai/core/session";
import { db, eq, stores } from "@pai/db";
import { getManifest } from "@pai/theme-registry/manifests";
import { BUSINESS_CATEGORIES } from "@pai/theme-sdk";
import { createStoreForUser, slugProblem, toSlug } from "@/lib/store-setup";

export async function checkSlug(raw: string): Promise<{ slug: string; available: boolean; reason?: string; suggestion?: string }> {
  const slug = toSlug(String(raw ?? ""));
  const problem = slugProblem(slug);
  if (problem) return { slug, available: false, reason: problem };
  const taken = await db.query.stores.findFirst({ where: eq(stores.slug, slug), columns: { id: true } });
  if (!taken) return { slug, available: true };
  for (let i = 0; i < 20; i++) {
    const cand = `${slug.slice(0, 34)}-${i < 5 ? ["bd", "shop", "store", "online", "dhaka"][i] : Math.floor(Math.random() * 900 + 100)}`;
    const t = await db.query.stores.findFirst({ where: eq(stores.slug, cand), columns: { id: true } });
    if (!t) return { slug, available: false, reason: "That address is taken", suggestion: cand };
  }
  return { slug, available: false, reason: "That address is taken" };
}

const schema = z.object({
  name: z.string().trim().min(2, "Store name is too short").max(60),
  slug: z.string().trim().toLowerCase(),
  category: z.string().refine((c) => BUSINESS_CATEGORIES.some((b) => b.id === c), "Pick a category"),
  themeSlug: z.string().min(1),
});

export async function createStore(input: z.input<typeof schema>): Promise<{ ok: false; error: string } | undefined> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]!.message };
  const { name, slug, category, themeSlug } = parsed.data;
  const problem = slugProblem(slug);
  if (problem) return { ok: false, error: `Store address: ${problem}` };
  const manifest = getManifest(themeSlug);
  if (!manifest) return { ok: false, error: "Please choose a theme" };
  if (manifest.price > 0) return { ok: false, error: "Premium themes can be added from the Theme Store after setup" };

  // Pick the theme preset matching the business category, if the theme ships one.
  let presetId: string | null = null;
  try {
    const { loadTheme } = await import("@pai/theme-registry");
    const theme = await loadTheme(themeSlug);
    presetId = theme.presets?.find((p) => p.category === category)?.id ?? null;
  } catch (e) {
    console.warn("[onboarding] could not load theme presets", (e as Error).message);
  }

  let storeId: string;
  try {
    const store = await createStoreForUser({ user, name, slug, category, themeSlug, presetId, themeName: manifest.name });
    storeId = store.id;
  } catch (e) {
    if ((e as { code?: string }).code === "23505") return { ok: false, error: "That store address was just taken — please pick another." };
    console.error("[onboarding]", e);
    return { ok: false, error: "We couldn't create your store. Please try again." };
  }
  await setActiveStore(storeId);
  redirect("/?welcome=1");
}
