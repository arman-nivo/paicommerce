"use client";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Ban, CircleCheck, Ellipsis, PackageCheck, Truck, Undo2, Zap, type LucideIcon } from "lucide-react";
import { Button, Card, Checkbox, cn, Dialog, Dropdown, DropdownItem, useConfirm } from "@pai/ui";
import { run } from "@/lib/client";
import { changeOrderStatus } from "../../actions";

type Fs = "unfulfilled" | "confirmed" | "processing" | "shipped" | "delivered" | "returned" | "cancelled";

// Mirrors FULFILLMENT_FLOW from @pai/core/orders (validated again on the server).
const FLOW: Record<Fs, Fs[]> = {
  unfulfilled: ["confirmed", "cancelled"],
  confirmed: ["processing", "shipped", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  returned: [],
  cancelled: [],
};

const ACTIONS: Record<Fs, { label: string; icon: LucideIcon; done: string }> = {
  unfulfilled: { label: "Reopen", icon: Undo2, done: "Order reopened" },
  confirmed: { label: "Confirm order", icon: CircleCheck, done: "Order confirmed" },
  processing: { label: "Start processing", icon: Zap, done: "Marked as processing" },
  shipped: { label: "Mark as shipped", icon: Truck, done: "Marked as shipped" },
  delivered: { label: "Mark as delivered", icon: PackageCheck, done: "Marked as delivered" },
  returned: { label: "Mark as returned", icon: Undo2, done: "Marked as returned — items restocked" },
  cancelled: { label: "Cancel order", icon: Ban, done: "Order cancelled — items restocked" },
};

const HINTS: Record<Fs, string> = {
  unfulfilled: "Call or message the customer to verify the order, then confirm it.",
  confirmed: "Pack the items, then book a courier or mark it as shipped.",
  processing: "Once the parcel is handed to the courier, mark it as shipped.",
  shipped: "On the way. Mark as delivered when the courier confirms delivery.",
  delivered: "Delivered. If the customer sends it back, mark it as returned.",
  returned: "This order was returned and its items were put back in stock.",
  cancelled: "This order was cancelled and its items were put back in stock.",
};

export type StatusOrder = { id: string; number: number; fulfillmentStatus: string; paymentMethod: string; paymentStatus: string; hasCourier: boolean };

export function StatusActions({ order, layout }: { order: StatusOrder; layout: "card" | "bar" }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [busy, setBusy] = React.useState<Fs | null>(null);
  const [deliverOpen, setDeliverOpen] = React.useState(false);
  const unpaid = order.paymentStatus !== "paid" && order.paymentStatus !== "refunded";
  const [markPaid, setMarkPaid] = React.useState(order.paymentMethod === "cod");

  const current = order.fulfillmentStatus as Fs;
  const next = FLOW[current] ?? [];
  const primary = next.find((s) => s !== "cancelled" && s !== "returned") ?? null;
  const others = next.filter((s) => s !== primary);

  async function go(to: Fs, paid?: boolean) {
    if (to === "cancelled") {
      const ok = await confirm({
        title: `Cancel order #${order.number}?`,
        description: "The items go back into stock. The customer isn't charged or notified automatically. This can't be undone.",
        confirmLabel: "Cancel order",
        danger: true,
      });
      if (!ok) return;
    }
    if (to === "returned") {
      const ok = await confirm({
        title: `Mark order #${order.number} as returned?`,
        description: "Use this when the parcel comes back to you. Items are restocked automatically. This can't be undone.",
        confirmLabel: "Mark as returned",
        danger: true,
      });
      if (!ok) return;
    }
    if (to === "delivered" && unpaid && paid === undefined) {
      setDeliverOpen(true);
      return;
    }
    setBusy(to);
    const res = await run(changeOrderStatus({ id: order.id, to, markPaid: paid }), { success: ACTIONS[to].done + (paid ? " & paid" : "") });
    setBusy(null);
    setDeliverOpen(false);
    if (res) router.refresh();
  }

  const deliverDialog = (
    <Dialog
      open={deliverOpen}
      onClose={() => setDeliverOpen(false)}
      size="sm"
      title={`Mark #${order.number} as delivered`}
      description="Great — the parcel reached the customer."
      footer={
        <>
          <Button variant="outline" onClick={() => setDeliverOpen(false)}>
            Cancel
          </Button>
          <Button variant="success" loading={busy === "delivered"} onClick={() => go("delivered", markPaid)}>
            <PackageCheck /> Mark delivered
          </Button>
        </>
      }
    >
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
        <Checkbox className="mt-0.5" checked={markPaid} onChange={(e) => setMarkPaid(e.target.checked)} />
        <span className="text-sm">
          <span className="font-medium">{order.paymentMethod === "cod" ? "Cash collected — mark payment as paid" : "Also mark payment as paid"}</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {order.paymentMethod === "cod" ? "Tick this if the courier collected the COD amount." : "Only tick this if you have received the money."}
          </span>
        </span>
      </label>
    </Dialog>
  );

  if (!next.length && layout === "bar") return null;

  if (layout === "bar") {
    return (
      <div className="flex items-center gap-2">
        {primary ? (
          <Button className="h-11 flex-1" loading={busy === primary} onClick={() => go(primary)} variant={primary === "delivered" ? "success" : "default"}>
            {React.createElement(ACTIONS[primary].icon)} {ACTIONS[primary].label}
          </Button>
        ) : (
          others.map((s) => (
            <Button key={s} className="h-11 flex-1" variant="outline" loading={busy === s} onClick={() => go(s)}>
              {React.createElement(ACTIONS[s].icon)} {ACTIONS[s].label}
            </Button>
          ))
        )}
        {primary && others.length > 0 && (
          <Dropdown
            align="end"
            className="bottom-full mb-2 mt-0"
            trigger={
              <Button variant="outline" size="icon" className="size-11" aria-label="More actions">
                <Ellipsis />
              </Button>
            }
          >
            {others.map((s) => (
              <DropdownItem key={s} danger={s === "cancelled" || s === "returned"} icon={React.createElement(ACTIONS[s].icon)} onClick={() => go(s)}>
                {ACTIONS[s].label}
              </DropdownItem>
            ))}
          </Dropdown>
        )}
        {dialog}
        {deliverDialog}
      </div>
    );
  }

  return (
    <Card className={cn("flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between", !next.length && "bg-muted/40")}>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{next.length ? "Next step" : "Order closed"}</p>
        <p className="text-sm text-muted-foreground">{HINTS[current]}</p>
      </div>
      {next.length > 0 && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {others.map((s) => (
            <Button key={s} variant={s === "cancelled" || s === "returned" ? "ghost" : "outline"} className={cn((s === "cancelled" || s === "returned") && "text-red-600 hover:text-red-700")} loading={busy === s} onClick={() => go(s)}>
              {React.createElement(ACTIONS[s].icon)} {ACTIONS[s].label}
            </Button>
          ))}
          {primary && (
            <Button loading={busy === primary} onClick={() => go(primary)} variant={primary === "delivered" ? "success" : "default"}>
              {React.createElement(ACTIONS[primary].icon)} {ACTIONS[primary].label}
            </Button>
          )}
        </div>
      )}
      {dialog}
      {deliverDialog}
    </Card>
  );
}
