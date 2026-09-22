"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser, getMembership, setActiveStore } from "@pai/core/session";

export async function switchStore(storeId: string) {
  const id = z.string().uuid().parse(storeId);
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const m = await getMembership(user.id, id);
  if (!m) return { ok: false as const, error: "You don't have access to that store" };
  await setActiveStore(id);
  revalidatePath("/", "layout");
  redirect("/");
}
