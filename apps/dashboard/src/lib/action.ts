/**
 * Typed, zod-validated, tenant-scoped server action factory.
 *
 *   "use server";
 *   export const saveThing = action(z.object({...}), { permission: "products.manage" }, async (input, ctx) => {...});
 *
 * The returned function resolves to ActionResult — never throws to the client (except Next redirects).
 */
import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";
import type { Permission } from "@pai/core";
import { getActionCtx, type Ctx } from "./ctx";
import { ActionError } from "./errors";
import type { ActionResult } from "./types";

export function action<S extends z.ZodType, R>(
  schema: S,
  opts: { permission?: Permission },
  fn: (input: z.output<S>, ctx: Ctx) => Promise<R>,
): (input: z.input<S>) => Promise<ActionResult<R>> {
  return async (input) => {
    try {
      const parsed = schema.safeParse(input);
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        for (const i of parsed.error.issues) {
          const k = i.path.join(".") || "_";
          if (!fieldErrors[k]) fieldErrors[k] = i.message;
        }
        const first = parsed.error.issues[0];
        const where = first?.path.length ? `${String(first.path[first.path.length - 1])}: ` : "";
        return { ok: false, error: `${where}${first?.message ?? "Invalid input"}`, fieldErrors };
      }
      const ctx = await getActionCtx(opts.permission);
      const data = await fn(parsed.data, ctx);
      return { ok: true, data };
    } catch (e) {
      unstable_rethrow(e);
      if (e instanceof ActionError) return { ok: false, error: e.message };
      const pg = e as { code?: string; constraint_name?: string };
      if (pg?.code === "23505") return { ok: false, error: "That value is already in use — please choose another." };
      console.error("[action]", e);
      return { ok: false, error: "Something went wrong. Please try again." };
    }
  };
}
