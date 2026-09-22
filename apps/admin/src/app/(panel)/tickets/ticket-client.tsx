"use client";

import * as React from "react";
import { CheckCircle2, Send, UserPlus } from "lucide-react";
import { Button, Field, Select } from "@pai/ui";
import { useRunAction } from "@/components/action-client";
import { BulkBar } from "@/components/selection";
import { replyTicket, updateTickets } from "./actions";

type Staff = { id: string; name: string };

export function ReplyBox({ id, currentStatus }: { id: string; currentStatus: string }) {
  const [body, setBody] = React.useState("");
  const [status, setStatus] = React.useState<"pending" | "resolved" | "open">("pending");
  const { run, pending } = useRunAction();
  const send = async () => {
    const r = await run(() => replyTicket({ id, body, status }));
    if (r.ok) setBody("");
  };
  const templates = [
    ["Greeting", "Hi there,\n\nThanks for reaching out to PaiCommerce support. "],
    ["Need info", "Could you share your store URL, the order number and a screenshot of the issue so we can look into this?"],
    ["Resolved", "This should now be fixed on our side — please refresh your dashboard and let us know if anything still looks off."],
  ] as const;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {templates.map(([l, t]) => (
          <button key={l} type="button" onClick={() => setBody((b) => (b ? b + "\n\n" : "") + t)} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
            + {l}
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            send();
          }
        }}
        placeholder="Write a reply to the merchant…"
        className="min-h-[140px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-xs focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/15"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">⌘ + Enter to send</span>
        <div className="flex items-center gap-2">
          <Select value={status} onChange={(e) => setStatus(e.target.value as "pending")} className="h-8 w-auto text-xs" aria-label="Status after reply">
            <option value="pending">Send & mark pending (await merchant)</option>
            <option value="resolved">Send & resolve</option>
            <option value="open">Send & keep open</option>
          </Select>
          <Button size="sm" loading={pending} onClick={send} disabled={!body.trim()}>
            <Send /> Send reply
          </Button>
        </div>
      </div>
      {currentStatus === "closed" && <p className="text-xs text-amber-600">This ticket is closed — replying will reopen it.</p>}
    </div>
  );
}

export function TicketProps({ id, status, priority, assigneeId, staff, meId }: { id: string; status: string; priority: string; assigneeId: string | null; staff: Staff[]; meId: string }) {
  const { run, pending } = useRunAction();
  const upd = (p: Parameters<typeof updateTickets>[0]) => run(() => updateTickets(p));
  return (
    <div className="space-y-3">
      <Field label="Status">
        <Select value={status} disabled={pending} onChange={(e) => upd({ ids: [id], status: e.target.value as "open" })}>
          {["open", "pending", "resolved", "closed"].map((s) => (
            <option key={s} value={s}>
              {s[0]!.toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Priority">
        <Select value={priority} disabled={pending} onChange={(e) => upd({ ids: [id], priority: e.target.value as "low" })}>
          {["low", "normal", "high", "urgent"].map((s) => (
            <option key={s} value={s}>
              {s[0]!.toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Assignee">
        <div className="flex gap-2">
          <Select value={assigneeId ?? ""} disabled={pending} onChange={(e) => upd({ ids: [id], assigneeId: e.target.value || null })}>
            <option value="">Unassigned</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.id === meId ? " (me)" : ""}
              </option>
            ))}
          </Select>
          {assigneeId !== meId && (
            <Button size="icon" variant="outline" onClick={() => upd({ ids: [id], assigneeId: meId })} title="Assign to me" aria-label="Assign to me">
              <UserPlus />
            </Button>
          )}
        </div>
      </Field>
    </div>
  );
}

export function TicketBulk({ meId }: { meId: string }) {
  const { run, pending } = useRunAction();
  return (
    <BulkBar>
      {(ids, clear) => (
        <>
          <Button size="sm" variant="outline" loading={pending} onClick={async () => (await run(() => updateTickets({ ids, assigneeId: meId }))).ok && clear()}>
            <UserPlus /> Assign to me
          </Button>
          <Button size="sm" variant="outline" loading={pending} onClick={async () => (await run(() => updateTickets({ ids, priority: "high" }))).ok && clear()}>
            Mark high priority
          </Button>
          <Button size="sm" variant="success" loading={pending} onClick={async () => (await run(() => updateTickets({ ids, status: "resolved" }))).ok && clear()}>
            <CheckCircle2 /> Resolve
          </Button>
          <Button size="sm" variant="outline" loading={pending} onClick={async () => (await run(() => updateTickets({ ids, status: "closed" }))).ok && clear()}>
            Close
          </Button>
        </>
      )}
    </BulkBar>
  );
}
