"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button, toast, useConfirm, type ButtonProps } from "@pai/ui";

export type ActionResult<T = unknown> = { ok: true; data?: T; message?: string } | { ok: false; error: string };

/** Runs a server action, shows a toast and refreshes the route on success. */
export function useRunAction() {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [busy, setBusy] = React.useState(false);
  const run = React.useCallback(
    async <T,>(fn: () => Promise<ActionResult<T>>, opts: { success?: string; refresh?: boolean } = {}): Promise<ActionResult<T>> => {
      setBusy(true);
      try {
        const res = await fn();
        if (res.ok) {
          toast.success(res.message ?? opts.success ?? "Saved");
          if (opts.refresh !== false) startTransition(() => router.refresh());
        } else {
          toast.error(res.error);
        }
        return res;
      } catch {
        toast.error("Network error — please retry.");
        return { ok: false, error: "Network error" };
      } finally {
        setBusy(false);
      }
    },
    [router],
  );
  return { run, pending: pending || busy };
}

/** A button that (optionally confirms and) runs a server action. */
export function ActionButton<T>({
  action,
  confirm,
  success,
  children,
  onDone,
  ...props
}: Omit<ButtonProps, "onClick" | "action"> & {
  action: () => Promise<ActionResult<T>>;
  confirm?: { title: string; description?: string; confirmLabel?: string; danger?: boolean };
  success?: string;
  onDone?: (res: ActionResult<T>) => void;
}) {
  const { run, pending } = useRunAction();
  const { confirm: ask, dialog } = useConfirm();
  return (
    <>
      <Button
        {...props}
        loading={pending}
        onClick={async () => {
          if (confirm && !(await ask(confirm))) return;
          const res = await run(action, { success });
          onDone?.(res);
        }}
      >
        {children}
      </Button>
      {dialog}
    </>
  );
}
