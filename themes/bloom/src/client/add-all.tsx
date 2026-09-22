"use client";

import { useState } from "react";
import { LoaderCircle, ShoppingBag } from "lucide-react";
import { useCart } from "@pai/theme-kit/client";

export type AddAllItem = { productId: string; variantId: string | null; title: string; imageUrl: string | null; price: number; url: string };

/** Adds several products (a routine or a look) to the cart in one go, then opens the cart. */
export function AddAllButton({ items, label = "Add all to bag", className }: { items: AddAllItem[]; label?: string; className?: string }) {
  const cart = useCart();
  const [busy, setBusy] = useState(false);
  if (!items.length) return null;
  const onClick = async () => {
    setBusy(true);
    for (const it of items) {
      await cart.add(
        { productId: it.productId, variantId: it.variantId, quantity: 1, optimistic: { title: it.title, imageUrl: it.imageUrl, price: it.price, url: it.url } },
        { openDrawer: false, silent: true },
      );
    }
    setBusy(false);
    cart.openDrawer();
  };
  return (
    <button type="button" onClick={onClick} disabled={busy} className={"pai-btn pai-btn-primary pai-btn-block " + (className ?? "")}>
      {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <ShoppingBag className="size-4" aria-hidden />}
      {busy ? "Adding…" : label}
    </button>
  );
}
