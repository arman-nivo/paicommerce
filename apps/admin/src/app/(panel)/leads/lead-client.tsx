"use client";

import { Download, Trash2 } from "lucide-react";
import { Button, toast, useConfirm } from "@pai/ui";
import { useRunAction } from "@/components/action-client";
import { BulkBar } from "@/components/selection";
import { deleteLeads } from "./actions";

export function LeadBulk({ canManage }: { canManage: boolean }) {
  const { run, pending } = useRunAction();
  const { confirm, dialog } = useConfirm();
  return (
    <>
      <BulkBar>
        {(ids, clear) => (
          <>
            <Button size="sm" variant="outline" onClick={() => window.open(`/leads/export?ids=${ids.join(",")}`, "_blank")}>
              <Download /> Export
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                const emails = Array.from(document.querySelectorAll<HTMLElement>("[data-lead-email]"))
                  .filter((el) => ids.includes(el.dataset.id ?? ""))
                  .map((el) => el.dataset.leadEmail)
                  .join(", ");
                await navigator.clipboard.writeText(emails);
                toast.success(`Copied ${ids.length} email${ids.length === 1 ? "" : "s"}`);
              }}
            >
              Copy emails
            </Button>
            {canManage && (
              <Button
                size="sm"
                variant="destructive"
                loading={pending}
                onClick={async () => {
                  if (await confirm({ title: `Delete ${ids.length} leads?`, description: "This permanently removes them (e.g. for GDPR / spam cleanup).", confirmLabel: "Delete", danger: true })) {
                    if ((await run(() => deleteLeads({ ids }))).ok) clear();
                  }
                }}
              >
                <Trash2 /> Delete
              </Button>
            )}
          </>
        )}
      </BulkBar>
      {dialog}
    </>
  );
}
