"use client";

import { useState, type MouseEvent } from "react";
import { Check, LoaderCircle, Plus, SlidersHorizontal } from "lucide-react";
import type { SfProduct } from "@pai/theme-sdk";
import { QuickView, useCart } from "@pai/theme-kit/client";

/**
 * Playhouse pill quick-add. Single-variant products go straight to the cart; products with options
 * open the kit QuickView so shoppers can pick a size/colour without leaving the page.
 */
export function PillQuickAdd({ product, className }: { product: SfProduct; className?: string }) {
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const needsOptions = product.variants.length > 1;

  const onClick = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.available || state === "busy") return;
    if (needsOptions) {
      setOpen(true);
      return;
    }
    setState("busy");
    await cart.add({
      productId: product.id,
      variantId: product.variants[0]?.id ?? null,
      quantity: 1,
      optimistic: { title: product.title, imageUrl: product.featuredImage?.url, price: product.price, url: product.url },
    });
    setState("done");
    setTimeout(() => setState("idle"), 1400);
  };

  const label = !product.available ? "Sold out" : needsOptions ? "Choose options" : state === "done" ? "Added!" : "Add to cart";
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={!product.available}
        aria-label={!product.available ? `${product.title} is sold out` : needsOptions ? `Choose options for ${product.title}` : `Add ${product.title} to cart`}
        className={
          "ph-pill-btn group/btn inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-pai-btn px-4 text-sm font-bold transition " +
          "bg-pai-primary text-pai-primary-fg shadow-[0_3px_0_color-mix(in_srgb,var(--pai-primary)_55%,black)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none " +
          "outline-none focus-visible:ring-2 focus-visible:ring-pai-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-pai-muted disabled:text-pai-fg/60 disabled:shadow-none " +
          (className ?? "")
        }
      >
        {state === "busy" ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
        ) : state === "done" ? (
          <Check className="size-4" aria-hidden />
        ) : needsOptions ? (
          <SlidersHorizontal className="size-4" aria-hidden />
        ) : product.available ? (
          <Plus className="size-4 transition-transform group-hover/btn:rotate-90" aria-hidden />
        ) : null}
        <span aria-live="polite">{label}</span>
      </button>
      {open ? <QuickView product={product} open={open} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
