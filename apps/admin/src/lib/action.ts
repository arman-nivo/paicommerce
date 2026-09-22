import { z } from "zod";
import { ActionError, assertAdmin, type AdminUser } from "./auth";
import type { Capability } from "./roles";

export type ActionResult<T = unknown> = { ok: true; data?: T; message?: string } | { ok: false; error: string };

/**
 * Wrap a server action: checks the admin capability, validates input with zod and
 * normalises errors into an ActionResult (never throws to the client).
 */
export function adminAction<S extends z.ZodType, R>(
  cap: Capability,
  schema: S,
  fn: (input: z.output<S>, admin: AdminUser) => Promise<R | { message: string; data?: R }>,
) {
  return async (raw: z.input<S>): Promise<ActionResult<R>> => {
    try {
      const admin = await assertAdmin(cap);
      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        const where = issue?.path?.length ? `${issue.path.join(".")}: ` : "";
        return { ok: false, error: `${where}${issue?.message ?? "Invalid input"}` };
      }
      const out = await fn(parsed.data, admin);
      if (out && typeof out === "object" && "message" in (out as object)) {
        const o = out as { message: string; data?: R };
        return { ok: true, message: o.message, data: o.data };
      }
      return { ok: true, data: out as R };
    } catch (e) {
      if (e instanceof ActionError) return { ok: false, error: e.message };
      // Surface unique-violation errors in a friendly way.
      const msg = e instanceof Error ? e.message : String(e);
      if (/duplicate key|unique/i.test(msg)) return { ok: false, error: "That value is already in use." };
      console.error("[admin action]", e);
      return { ok: false, error: "Something went wrong. Please try again." };
    }
  };
}

export function fail(message: string): never {
  throw new ActionError(message);
}

export const uuid = z.string().uuid();
