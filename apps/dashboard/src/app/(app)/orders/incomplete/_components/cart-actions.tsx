"use client";
import { useRouter } from "next/navigation";
import * as React from "react";
import { CircleCheck, MessageCircle, Phone, ShoppingBag, Trash2, Undo2 } from "lucide-react";
import { Button, buttonVariants, useConfirm } from "@pai/ui";
import { normalizePhone } from "@pai/core";
import { run } from "@/lib/client";
import { convertCartToOrder, deleteIncompleteCart, markCartContacted } from "../actions";

export function CartActions({ id, canManage, phone, name, storeName, valueText, contacted, convertible }: { id: string; canManage: boolean; phone: string; name: string; storeName: string; valueText: string; contacted: boolean; convertible: boolean }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [busy, setBusy] = React.useState<string | null>(null);
  const p = normalizePhone(phone);
  const wa = p.startsWith("0") ? `88${p}` : p.replace(/^\+/, "");
  const msg = `আসসালামু আলাইকুম${name ? ` ${name}` : ""}! ${storeName} থেকে বলছি। আপনার কার্টে ${valueText} মূল্যের পণ্য রয়ে গেছে — অর্ডারটি কনফার্ম করতে চাইলে এই মেসেজের রিপ্লাই দিন।\n\nHi${name ? ` ${name}` : ""}! This is ${storeName}. You left items worth ${valueText} in your cart — reply to this message and we'll confirm your order with cash on delivery.`;

  const doRun = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap items-start gap-2 lg:w-44 lg:flex-col lg:items-stretch">
      {dialog}
      <a href={`tel:${p}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
        <Phone /> Call
      </a>
      <a
        href={`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`}
        target="_blank"
        rel="noreferrer"
        className={buttonVariants({ variant: "outline", size: "sm" })}
        onClick={() => canManage && !contacted && markCartContacted({ id, contacted: true }).then(() => router.refresh())}
      >
        <MessageCircle /> WhatsApp
      </a>
      {canManage && (
        <>
          <Button
            size="sm"
            variant="ghost"
            loading={busy === "contact"}
            onClick={() => doRun("contact", () => run(markCartContacted({ id, contacted: !contacted }), { success: contacted ? "Marked as not contacted" : "Marked as contacted" }))}
          >
            {contacted ? <Undo2 /> : <CircleCheck />} {contacted ? "Undo contacted" : "Mark contacted"}
          </Button>
          {convertible && (
            <Button
              size="sm"
              loading={busy === "convert"}
              onClick={() =>
                doRun("convert", async () => {
                  const ok = await confirm({ title: "Convert to order?", description: "This creates a Cash on Delivery order from this cart with the shopper's details. Stock will be reserved.", confirmLabel: "Create order" });
                  if (!ok) return;
                  const r = await run(convertCartToOrder({ id }), { success: (d) => `Order #${d.number} created` });
                  if (r) router.push(`/orders/${r.id}`);
                })
              }
            >
              <ShoppingBag /> Convert to order
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700"
            loading={busy === "delete"}
            onClick={() =>
              doRun("delete", async () => {
                const ok = await confirm({ title: "Remove this incomplete order?", description: "It will disappear from this list. The shopper's cart is not affected.", confirmLabel: "Remove", danger: true });
                if (ok) await run(deleteIncompleteCart({ id }), { success: "Removed" });
              })
            }
          >
            <Trash2 /> Remove
          </Button>
        </>
      )}
    </div>
  );
}
