"use client";
import { TriangleAlert } from "lucide-react";
import { CopyButton } from "@pai/ui";

/** Shows a freshly created secret with a copy button and a "shown once" warning. */
export function SecretReveal({ value, warning }: { value: string; warning: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2.5">
        <code className="min-w-0 flex-1 break-all font-mono text-sm">{value}</code>
        <CopyButton value={value} className="shrink-0 border border-border bg-card" />
      </div>
      <p className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
        <TriangleAlert className="mt-px size-4 shrink-0" />
        {warning}
      </p>
    </div>
  );
}
