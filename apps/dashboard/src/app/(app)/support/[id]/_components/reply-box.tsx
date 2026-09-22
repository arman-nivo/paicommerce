"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { CircleX, Send } from "lucide-react";
import { Button, Kbd, Textarea, useConfirm } from "@pai/ui";
import { run } from "@/lib/client";
import { closeTicket, replyTicket } from "../../actions";

export function ReplyBox({ id, closed }: { id: string; closed: boolean }) {
  const router = useRouter();
  const [message, setMessage] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function send() {
    if (message.trim().length < 2 || saving) return;
    setSaving(true);
    const res = await run(replyTicket({ id, message }), { success: closed ? "Ticket reopened and reply sent" : "Reply sent" });
    setSaving(false);
    if (res) {
      setMessage("");
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      {closed && <p className="text-sm text-muted-foreground">This ticket is closed. Replying will reopen it.</p>}
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            void send();
          }
        }}
        rows={4}
        maxLength={5000}
        placeholder="Write a reply…"
        aria-label="Reply"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          <Kbd>⌘</Kbd> <Kbd>Enter</Kbd> to send
        </span>
        <Button onClick={send} loading={saving} disabled={message.trim().length < 2} className="ml-auto">
          <Send /> {closed ? "Reopen & send" : "Send reply"}
        </Button>
      </div>
    </div>
  );
}

export function CloseTicketButton({ id }: { id: string }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [busy, setBusy] = React.useState(false);
  async function close() {
    const ok = await confirm({ title: "Close this ticket?", description: "Mark it as solved. You can reopen it any time by replying.", confirmLabel: "Close ticket" });
    if (!ok) return;
    setBusy(true);
    const res = await run(closeTicket({ id }), { success: "Ticket closed" });
    setBusy(false);
    if (res) router.refresh();
  }
  return (
    <>
      {dialog}
      <Button variant="outline" onClick={close} loading={busy}>
        <CircleX /> Close ticket
      </Button>
    </>
  );
}
