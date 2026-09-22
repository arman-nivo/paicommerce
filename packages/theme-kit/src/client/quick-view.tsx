"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { Eye, LoaderCircle, Plus, X } from "lucide-react";
import type { SfProduct } from "@pai/theme-sdk";
import { cn, stripHtml, truncate } from "../lib/utils";
import { useCart } from "./cart";
import { AddToCartButton, BuyNowButton, ProductGallery, ProductPrice, ProductProvider, QuantitySelector, StockIndicator, VariantPicker } from "./product";

/** Modal with gallery, price, variant picker and add-to-cart for a product. */
export function QuickView({ product, open, onClose }: { product: SfProduct; open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 text-pai-fg sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={product.title}>
      <button type="button" aria-label="Close" onClick={onClose} className="animate-pai-fade absolute inset-0 bg-black/50" />
      <div className="animate-pai-pop relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-[calc(var(--pai-radius)+8px)] bg-pai-bg shadow-2xl sm:rounded-pai md:grid-cols-2">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-pai-bg/90 shadow">
          <X className="size-5" />
        </button>
        <ProductProvider product={product} syncUrl={false}>
          <div className="p-4 md:p-6">
            <ProductGallery zoom={false} />
          </div>
          <div className="flex flex-col gap-5 p-5 pt-0 md:p-8 md:pl-2">
            {product.vendor ? <p className="pai-eyebrow">{product.vendor}</p> : null}
            <h2 className="pai-h3">{product.title}</h2>
            <ProductPrice />
            {product.description ? <p className="text-sm opacity-75">{truncate(stripHtml(product.description), 220)}</p> : null}
            <VariantPicker />
            <StockIndicator />
            <div className="flex gap-3">
              <QuantitySelector />
              <div className="flex-1">
                <AddToCartButton size="md" />
              </div>
            </div>
            <BuyNowButton size="md" />
            <Link href={product.url} className="text-sm underline underline-offset-4 opacity-75 hover:opacity-100" onClick={onClose}>
              View full details
            </Link>
          </div>
        </ProductProvider>
      </div>
    </div>
  );
}

/**
 * Product-card quick add: adds single-variant products instantly, opens QuickView for products
 * with options. `mode="icon"` renders a round icon button, `mode="bar"` a full-width button,
 * `mode="auto"` a hover bar on desktop + icon on mobile (absolutely positioned inside the card media).
 */
export function QuickAddButton({ product, mode = "bar", label = "Quick add", className }: { product: SfProduct; mode?: "icon" | "bar" | "view" | "auto"; label?: string; className?: string }) {
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const needsOptions = product.variants.length > 1;
  const onClick = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.available) return;
    if (needsOptions || mode === "view") {
      setOpen(true);
      return;
    }
    setBusy(true);
    await cart.add({
      productId: product.id,
      variantId: product.variants[0]?.id ?? null,
      quantity: 1,
      optimistic: { title: product.title, imageUrl: product.featuredImage?.url, price: product.price, url: product.url },
    });
    setBusy(false);
  };
  const Icon = mode === "view" ? Eye : Plus;
  const bar = (extra?: string) => (
    <button
      type="button"
      onClick={onClick}
      disabled={!product.available || busy}
      className={cn("pai-btn pai-btn-sm w-full bg-pai-bg/95 text-pai-fg shadow-md backdrop-blur hover:bg-pai-fg hover:text-pai-bg", extra, className)}
    >
      {busy ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {!product.available ? "Sold out" : needsOptions ? "Choose options" : label}
    </button>
  );
  const icon = (extra?: string) => (
    <button
      type="button"
      onClick={onClick}
      disabled={!product.available || busy}
      aria-label={needsOptions || mode === "view" ? `Quick view ${product.title}` : `Add ${product.title} to cart`}
      className={cn("grid size-10 place-items-center rounded-full bg-pai-primary text-pai-primary-fg shadow-md transition hover:scale-105 disabled:opacity-40", extra, mode === "auto" ? undefined : className)}
    >
      {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Icon className="size-5" />}
    </button>
  );
  return (
    <>
      {mode === "bar" ? bar() : mode === "auto" ? (
        <>
          <div className="absolute inset-x-2.5 bottom-2.5 hidden translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block">{bar()}</div>
          <div className="absolute bottom-2.5 right-2.5 md:hidden">{icon("size-9")}</div>
        </>
      ) : icon()}
      {open ? <QuickView product={product} open={open} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
