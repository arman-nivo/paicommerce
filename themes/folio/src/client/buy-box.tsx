"use client";
/**
 * Compact "choose a format, add to bag" control used by Folio's editorial sections (book of the
 * month, hero). Receives a slim product (no description / gallery) from the server.
 */
import { useState } from "react";
import { LoaderCircle, ShoppingBag } from "lucide-react";
import { useCart, useStorefront } from "@pai/theme-kit/client";

export type BuyBoxProduct = {
  id: string;
  title: string;
  url: string;
  image: string | null;
  variants: { id: string; title: string; price: number; compareAtPrice: number | null; available: boolean }[];
  price: number;
  available: boolean;
};

export function BuyBox({ product, label = "Add to bag", showFormats = true, className }: { product: BuyBoxProduct; label?: string; showFormats?: boolean; className?: string }) {
  const cart = useCart();
  const sf = useStorefront();
  const variants = product.variants;
  const firstAvailable = variants.find((v) => v.available) ?? variants[0];
  const [variantId, setVariantId] = useState<string | null>(firstAvailable?.id ?? null);
  const [busy, setBusy] = useState(false);
  const current = variants.find((v) => v.id === variantId) ?? null;
  const price = current?.price ?? product.price;
  const available = current ? current.available : product.available;
  const multi = variants.length > 1;

  return (
    <div className={className}>
      {showFormats && multi ? (
        <fieldset className="mb-4">
          <legend className="pai-eyebrow mb-2">Format</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <label
                key={v.id}
                className="folio-format relative flex cursor-pointer flex-col rounded-pai border border-pai-border px-3.5 py-2 text-left text-sm transition has-[:checked]:border-pai-fg has-[:checked]:bg-pai-fg/[0.04] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-pai-primary has-[:disabled]:opacity-45"
              >
                <input type="radio" name={`fmt-${product.id}`} value={v.id} checked={variantId === v.id} disabled={!v.available} onChange={() => setVariantId(v.id)} className="sr-only" />
                <span className="font-medium">{v.title}</span>
                <span className="text-xs opacity-70">{v.available ? sf.format(v.price) : "Out of stock"}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <p className="text-xl font-semibold" aria-live="polite">
          {sf.format(price)}
          {current?.compareAtPrice && current.compareAtPrice > price ? <s className="ml-2 text-sm font-normal opacity-50">{sf.format(current.compareAtPrice)}</s> : null}
        </p>
        <button
          type="button"
          disabled={!available || busy}
          onClick={async () => {
            setBusy(true);
            await cart.add({
              productId: product.id,
              variantId: variantId,
              quantity: 1,
              optimistic: { title: product.title, imageUrl: product.image, price, variantTitle: multi ? current?.title ?? null : null, url: product.url },
            });
            setBusy(false);
          }}
          className="pai-btn pai-btn-primary pai-btn-lg"
        >
          {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <ShoppingBag className="size-4" aria-hidden />}
          {available ? label : "Sold out"}
        </button>
      </div>
    </div>
  );
}
