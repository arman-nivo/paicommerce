"use client";
import Link from "next/link";
import { ExternalLink, Package, Plus, Share2 } from "lucide-react";
import { buttonVariants, Card, CopyButton, EmptyState } from "@pai/ui";
import { useStore } from "@/components/store-context";

export function OrdersEmpty({ canCreate }: { canCreate: boolean }) {
  const { store } = useStore();
  return (
    <Card>
      <EmptyState
        icon={<Package />}
        title="Your orders will show up here"
        description="When customers buy from your store — or you take an order over the phone or Facebook — it lands here, ready to confirm and ship."
        action={
          canCreate ? (
            <Link href="/orders/new" className={buttonVariants()}>
              <Plus /> Create order
            </Link>
          ) : undefined
        }
      />
      <div className="mx-auto mb-10 max-w-md rounded-xl border border-dashed border-border bg-muted/40 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
            <Share2 className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Share your store link to get your first order</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Post it on your Facebook page, Instagram bio or WhatsApp status.</p>
            <div className="mt-2 flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1">
              <span className="min-w-0 flex-1 truncate text-sm">{store.url.replace(/^https?:\/\//, "")}</span>
              <CopyButton value={store.url} />
              <a href={store.url} target="_blank" rel="noreferrer" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Open store">
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
