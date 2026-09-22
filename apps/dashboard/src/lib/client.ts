"use client";
import { toast } from "@pai/ui";
import type { ActionResult } from "./types";

/**
 * Await a server action and toast the outcome. Returns the data on success, `undefined` on failure.
 *   const res = await run(saveProduct(input), { success: "Product saved" });
 */
export async function run<T>(p: Promise<ActionResult<T>>, opts: { success?: string | ((d: T) => string); loading?: string } = {}): Promise<T | undefined> {
  const id = opts.loading ? toast.loading(opts.loading) : undefined;
  try {
    const r = await p;
    if (!r.ok) {
      toast.error(r.error, { id });
      return undefined;
    }
    if (opts.success) toast.success(typeof opts.success === "function" ? opts.success(r.data) : opts.success, { id });
    else if (id) toast.dismiss(id);
    return r.data;
  } catch (e) {
    toast.error((e as Error)?.message || "Network error — please try again.", { id });
    return undefined;
  }
}
