"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Check, EyeOff, ImageOff, Star, Trash2, X } from "lucide-react";
import { Badge, Button, Checkbox, cn, useConfirm } from "@pai/ui";
import { RelativeTime } from "@/components/time";
import { run } from "@/lib/client";
import type { ActionResult } from "@/lib/types";
import { deleteReviews, setReviewsApproved } from "../actions";

export type ReviewRow = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  customerName: string;
  approved: boolean;
  createdAt: string;
  productId: string;
  productTitle: string;
  image: string | null;
};

export function Stars({ n, className }: { n: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("size-3.5", i <= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
      ))}
    </span>
  );
}

export function ReviewsTable({ rows, canManage }: { rows: ReviewRow[]; canManage: boolean }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [selected, setSelected] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState<string | null>(null);
  React.useEffect(() => setSelected((s) => s.filter((id) => rows.some((r) => r.id === id))), [rows]);

  const exec = async <T,>(key: string, p: Promise<ActionResult<T>>, success: string) => {
    setBusy(key);
    const r = await run(p, { success });
    setBusy(null);
    if (r !== undefined) {
      setSelected([]);
      router.refresh();
    }
  };
  const approve = (ids: string[], approved: boolean, key = "bulk") =>
    exec(key, setReviewsApproved({ ids, approved }), approved ? `${ids.length > 1 ? `${ids.length} reviews` : "Review"} published` : `${ids.length > 1 ? `${ids.length} reviews` : "Review"} unpublished`);
  const remove = async (ids: string[], key = "bulk") => {
    const ok = await confirm({ title: ids.length > 1 ? `Delete ${ids.length} reviews?` : "Delete this review?", description: "This can't be undone.", confirmLabel: "Delete", danger: true });
    if (ok) await exec(key, deleteReviews({ ids }), "Deleted");
  };
  const allOn = rows.length > 0 && selected.length === rows.length;

  return (
    <>
      {dialog}
      {canManage && (
        <div className={cn("flex flex-wrap items-center gap-2 border-b border-border px-4 py-2", selected.length ? "bg-accent/60" : "bg-muted/30")}>
          <Checkbox aria-label="Select all" checked={allOn} onChange={() => setSelected(allOn ? [] : rows.map((r) => r.id))} />
          {selected.length ? (
            <>
              <span className="mr-1 text-sm font-medium">{selected.length} selected</span>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => approve(selected, true)}>
                <Check /> Publish
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => approve(selected, false)}>
                <EyeOff /> Unpublish
              </Button>
              <Button size="sm" variant="outline" className="text-red-600" disabled={!!busy} onClick={() => remove(selected)}>
                <Trash2 /> Delete
              </Button>
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSelected([])}>
                <X /> Clear
              </Button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Select reviews to publish or delete several at once.</span>
          )}
        </div>
      )}
      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={r.id} className={cn("flex gap-3 px-4 py-4", selected.includes(r.id) && "bg-accent/40")}>
            {canManage && (
              <Checkbox className="mt-1" aria-label="Select review" checked={selected.includes(r.id)} onChange={() => setSelected((s) => (s.includes(r.id) ? s.filter((x) => x !== r.id) : [...s, r.id]))} />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Stars n={r.rating} />
                {r.approved ? (
                  <Badge tone="green" dot>
                    Published
                  </Badge>
                ) : (
                  <Badge tone="yellow" dot>
                    Pending
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{r.customerName}</span> · <RelativeTime date={r.createdAt} />
                </span>
              </div>
              {r.title && <p className="mt-1.5 font-medium">{r.title}</p>}
              {r.body && <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{r.body}</p>}
              <Link href={`/products/${r.productId}`} className="mt-2 inline-flex max-w-full items-center gap-2 rounded-lg border border-border bg-muted/40 py-1 pl-1 pr-2.5 text-xs hover:bg-muted">
                <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                  {r.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.image} alt="" className="size-full object-cover" />
                  ) : (
                    <ImageOff className="size-3 text-muted-foreground/60" />
                  )}
                </span>
                <span className="truncate">{r.productTitle}</span>
              </Link>
            </div>
            {canManage && (
              <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-start">
                {r.approved ? (
                  <Button size="sm" variant="outline" loading={busy === r.id} disabled={!!busy} onClick={() => approve([r.id], false, r.id)}>
                    <EyeOff /> <span className="hidden sm:inline">Unpublish</span>
                  </Button>
                ) : (
                  <Button size="sm" variant="success" loading={busy === r.id} disabled={!!busy} onClick={() => approve([r.id], true, r.id)}>
                    <Check /> <span className="hidden sm:inline">Approve</span>
                  </Button>
                )}
                <Button size="icon-sm" variant="ghost" disabled={!!busy} onClick={() => remove([r.id], r.id)} aria-label="Delete review">
                  <Trash2 className="text-muted-foreground" />
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
