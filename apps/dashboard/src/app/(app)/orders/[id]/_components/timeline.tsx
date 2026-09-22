"use client";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Banknote, CircleCheck, MessageSquare, ShoppingBag, StickyNote, Truck, type LucideIcon } from "lucide-react";
import { Avatar, Button, Card, CardHeader, cn } from "@pai/ui";
import { useStore } from "@/components/store-context";
import { RelativeTime } from "@/components/time";
import { run } from "@/lib/client";
import { formatDateTime } from "@/lib/format";
import { addOrderNote } from "../../actions";

type Event = { id: string; type: string; message: string; createdAt: string; author: string | null };

const ICONS: Record<string, [LucideIcon, string]> = {
  created: [ShoppingBag, "bg-accent text-primary"],
  status: [CircleCheck, "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"],
  payment: [Banknote, "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"],
  courier: [Truck, "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300"],
  note: [StickyNote, "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"],
  email: [MessageSquare, "bg-muted text-muted-foreground"],
};

export function Timeline({ orderId, events, canManage, customerNote }: { orderId: string; events: Event[]; canManage: boolean; customerNote: string | null }) {
  const router = useRouter();
  const { user } = useStore();
  const [text, setText] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function post() {
    if (!text.trim()) return;
    setSaving(true);
    const res = await run(addOrderNote({ id: orderId, message: text.trim() }), { success: "Note added" });
    setSaving(false);
    if (res) {
      setText("");
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader title="Timeline" description="Every change to this order, and notes from your team." />
      {customerNote && (
        <div className="mx-5 mt-4 rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Note from customer</p>
          <p className="mt-0.5 whitespace-pre-wrap">{customerNote}</p>
        </div>
      )}
      {canManage && (
        <div className="flex gap-3 px-5 pt-4">
          <Avatar name={user.name} src={user.avatarUrl} size={32} />
          <div className="min-w-0 flex-1 rounded-lg border border-input bg-card shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/15">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) post();
              }}
              placeholder="Add a note for your team… (e.g. “Customer asked to deliver after 5pm”)"
              rows={2}
              maxLength={2000}
              className="block w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70"
            />
            <div className="flex items-center justify-between border-t border-border px-2 py-1.5">
              <span className="text-[11px] text-muted-foreground">Only visible to staff</span>
              <Button size="sm" onClick={post} loading={saving} disabled={!text.trim()}>
                Post
              </Button>
            </div>
          </div>
        </div>
      )}
      <ol className="relative px-5 py-4">
        {events.map((e, i) => {
          const [Icon, tone] = ICONS[e.type] ?? ICONS.status!;
          return (
            <li key={e.id} className="relative flex gap-3 pb-5 last:pb-0">
              {i < events.length - 1 && <span className="absolute left-4 top-8 -ml-px h-[calc(100%-2rem)] w-0.5 bg-border" aria-hidden />}
              <span className={cn("relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full", tone)}>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <p className={cn("text-sm", e.type === "note" && "whitespace-pre-wrap rounded-lg bg-muted/60 px-3 py-2")}>{e.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground" title={formatDateTime(e.createdAt)}>
                  {e.author ? `${e.author} · ` : e.type === "created" ? "Customer · " : ""}
                  <RelativeTime date={e.createdAt} />
                </p>
              </div>
            </li>
          );
        })}
        {!events.length && <li className="text-sm text-muted-foreground">No activity yet.</li>}
      </ol>
    </Card>
  );
}
