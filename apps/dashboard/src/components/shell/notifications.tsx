"use client";
import Link from "next/link";
import * as React from "react";
import { Bell, Megaphone, PackageX, ShoppingBag } from "lucide-react";
import { cn } from "@pai/ui";
import { timeAgo } from "@pai/core";
import type { Notification } from "@/lib/shell-data";

export function NotificationsMenu({ items }: { items: Notification[] }) {
  const [open, setOpen] = React.useState(false);
  const [lastSeen, setLastSeen] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    try {
      setLastSeen(localStorage.getItem("pai-notif-seen") ?? "");
    } catch {}
  }, []);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const unread = lastSeen === null ? 0 : items.filter((i) => i.at > lastSeen).length;
  const toggle = () => {
    setOpen((o) => !o);
    const now = new Date().toISOString();
    try {
      localStorage.setItem("pai-notif-seen", now);
    } catch {}
    setTimeout(() => setLastSeen(now), 1500);
  };
  return (
    <div ref={ref} className="relative">
      <button onClick={toggle} className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Notifications">
        <Bell className="size-[18px]" />
        {unread > 0 && <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="fixed inset-x-2 top-14 z-50 animate-fade-in rounded-xl border border-border bg-card shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-1.5 sm:w-96">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            <span className="text-xs text-muted-foreground">{items.length} item{items.length === 1 ? "" : "s"}</span>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-1.5 scrollbar-thin">
            {!items.length && (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                <Bell className="mx-auto mb-2 size-6 opacity-40" />
                You're all caught up.
              </div>
            )}
            {items.map((n) => {
              const icon =
                n.kind === "order" ? <ShoppingBag /> : n.kind === "stock" ? <PackageX /> : <Megaphone />;
              const tone =
                n.kind === "order" ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10" : n.kind === "stock" ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10" : n.level === "critical" || n.level === "warning" ? "bg-red-50 text-red-600 dark:bg-red-500/10" : "bg-violet-50 text-violet-600 dark:bg-violet-500/10";
              const body = (
                <div className={cn("flex gap-3 rounded-lg px-2.5 py-2.5 hover:bg-muted", lastSeen !== null && n.at > lastSeen && "bg-accent/60")}>
                  <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4", tone)}>{icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{n.title}</div>
                    {n.body && <div className="line-clamp-2 text-xs text-muted-foreground">{n.body}</div>}
                    <div className="mt-0.5 text-[11px] text-muted-foreground/80">{timeAgo(n.at)}</div>
                  </div>
                </div>
              );
              return n.href ? (
                <Link key={n.id} href={n.href} onClick={() => setOpen(false)} className="block">
                  {body}
                </Link>
              ) : (
                <div key={n.id}>{body}</div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
