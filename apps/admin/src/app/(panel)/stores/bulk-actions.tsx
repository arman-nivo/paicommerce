"use client";

import * as React from "react";
import { CalendarPlus, Download, Play, Ban } from "lucide-react";
import { Button } from "@pai/ui";
import { BulkBar } from "@/components/selection";
import { useRunAction } from "@/components/action-client";
import { setStoreStatus } from "./actions";
import { ExtendTrialDialog, SuspendDialog } from "./store-dialogs";

export function StoreBulkActions({ canManage }: { canManage: boolean }) {
  const [dialog, setDialog] = React.useState<null | { kind: "suspend" | "trial"; ids: string[]; clear: () => void }>(null);
  const { run, pending } = useRunAction();
  return (
    <>
      <BulkBar>
        {(ids, clear) => (
          <>
            <Button size="sm" variant="outline" onClick={() => window.open(`/stores/export?ids=${ids.join(",")}`, "_blank")}>
              <Download /> Export
            </Button>
            {canManage && (
              <>
                <Button size="sm" variant="outline" loading={pending} onClick={async () => (await run(() => setStoreStatus({ ids, status: "active" }))).ok && clear()}>
                  <Play /> Activate
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDialog({ kind: "trial", ids, clear })}>
                  <CalendarPlus /> Extend trial
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setDialog({ kind: "suspend", ids, clear })}>
                  <Ban /> Suspend
                </Button>
              </>
            )}
          </>
        )}
      </BulkBar>
      <SuspendDialog ids={dialog?.ids ?? []} open={dialog?.kind === "suspend"} onClose={() => setDialog(null)} onDone={() => dialog?.clear()} />
      <ExtendTrialDialog ids={dialog?.ids ?? []} open={dialog?.kind === "trial"} onClose={() => setDialog(null)} onDone={() => dialog?.clear()} />
    </>
  );
}
