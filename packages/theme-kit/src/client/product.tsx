"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, LoaderCircle, Minus, Plus, ShoppingBag, X, ZoomIn, Zap } from "lucide-react";
import type { SfProduct, SfVariant } from "@pai/theme-sdk";
import { cn, discountPercent } from "../lib/utils";
import { useCart } from "./cart";
import { trackEvent, useStorefront } from "./storefront-context";

/* ─────────────────────────── product form context ─────────────────────────── */

export type ProductFormState = {
  product: SfProduct;
  /** Currently selected option values, e.g. { Size: "M", Color: "Red" }. */
  selected: Record<string, string>;
  setOption: (name: string, value: string) => void;
  /** Variant matching `selected` (null for products without variants or incomplete selection). */
  variant: SfVariant | null;
  price: number;
  compareAtPrice: number | null;
  available: boolean;
  inventory: number;
  imageUrl: string | null;
  quantity: number;
  setQuantity: (q: number) => void;
  /** True when the product has variants but the selection doesn't match one. */
  needsSelection: boolean;
};

const Ctx = createContext<ProductFormState | null>(null);

function findVariant(product: SfProduct, selected: Record<string, string>): SfVariant | null {
  if (!product.variants.length) return null;
  return (
    product.variants.find((v) => product.options.every((o) => !selected[o.name] || v.options[o.name] === selected[o.name]) && product.options.every((o) => selected[o.name])) ?? null
  );
}

function initialSelection(product: SfProduct, variantId?: string | null): Record<string, string> {
  const v = (variantId && product.variants.find((x) => x.id === variantId)) || product.variants.find((x) => x.available) || product.variants[0];
  if (v) return { ...v.options };
  return Object.fromEntries(product.options.map((o) => [o.name, o.values[0] ?? ""]));
}

/**
 * Wrap a product form (price, variant picker, gallery, buttons) so all parts stay in sync.
 * Server-rendered children can freely interleave with the kit's client pieces.
 */
export function ProductProvider({
  product,
  initialVariantId,
  syncUrl = true,
  children,
}: {
  product: SfProduct;
  initialVariantId?: string | null;
  /** Mirror the selected variant in `?variant=` (disable for quick view / embedded forms). */
  syncUrl?: boolean;
  children: ReactNode;
}) {
  const [selected, setSelected] = useState<Record<string, string>>(() => initialSelection(product, initialVariantId));
  const [quantity, setQuantityRaw] = useState(1);
  const variant = useMemo(() => findVariant(product, selected), [product, selected]);
  const needsSelection = product.variants.length > 0 && !variant;
  const inventory = variant ? variant.inventory : product.inventory;
  const available = variant ? variant.available : product.variants.length ? false : product.available;
  const setQuantity = useCallback((q: number) => setQuantityRaw(Math.max(1, Math.min(999, Math.floor(q) || 1))), []);
  const setOption = useCallback((name: string, value: string) => setSelected((s) => ({ ...s, [name]: value })), []);

  // Reflect the selected variant in the URL (?variant=) without navigation, so it can be shared.
  useEffect(() => {
    if (!syncUrl || !variant || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("variant") === variant.id) return;
    url.searchParams.set("variant", variant.id);
    window.history.replaceState(window.history.state, "", url.toString());
  }, [variant, syncUrl]);

  const value = useMemo<ProductFormState>(
    () => ({
      product,
      selected,
      setOption,
      variant,
      price: variant?.price ?? product.price,
      compareAtPrice: variant ? variant.compareAtPrice : product.compareAtPrice,
      available,
      inventory,
      imageUrl: variant?.imageUrl ?? null,
      quantity,
      setQuantity,
      needsSelection,
    }),
    [product, selected, setOption, variant, available, inventory, quantity, setQuantity, needsSelection],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Read the enclosing product form state (null outside a ProductProvider). */
export function useProductForm(): ProductFormState | null {
  return useContext(Ctx);
}

/* ─────────────────────────── price ─────────────────────────── */

/** Price that follows the selected variant. */
export function ProductPrice({ className, size = "lg", showSaveBadge = true }: { className?: string; size?: "sm" | "md" | "lg"; showSaveBadge?: boolean }) {
  const form = useProductForm();
  const { format } = useStorefront();
  if (!form) return null;
  const off = discountPercent(form.price, form.compareAtPrice);
  const range = !form.variant && form.product.priceMin !== form.product.priceMax;
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-1", className)}>
      <span className={cn("font-semibold", size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-base", off ? "text-pai-sale" : "")}>
        {range ? `${format(form.product.priceMin)} – ${format(form.product.priceMax)}` : format(form.price)}
      </span>
      {off ? <s className={cn("opacity-55", size === "lg" ? "text-lg" : "text-sm")}>{format(form.compareAtPrice!)}</s> : null}
      {off && showSaveBadge ? (
        <span className="rounded-full bg-pai-sale px-2.5 py-0.5 text-xs font-semibold text-white">Save {off}%</span>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── variant picker ─────────────────────────── */

const COLOR_RE = /^(colou?r|shade|রং)$/i;

function isCssColor(v: string) {
  if (typeof CSS === "undefined" || !CSS.supports) return false;
  return CSS.supports("color", v.toLowerCase().replace(/\s+/g, ""));
}

export type VariantPickerProps = {
  /** "buttons" (pills), "dropdown" (selects) or "swatch" (colour options as swatches, others as pills). */
  style?: "buttons" | "dropdown" | "swatch";
  className?: string;
};

/** Option pickers (size/colour/…) that resolve to a variant; greyed out when a combination is unavailable. */
export function VariantPicker({ style = "swatch", className }: VariantPickerProps) {
  const form = useProductForm();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!form || !form.product.options.length || !form.product.variants.length) return null;
  const { product, selected, setOption } = form;

  const valueAvailable = (name: string, value: string) =>
    product.variants.some((v) => v.available && v.options[name] === value && product.options.every((o) => o.name === name || !selected[o.name] || v.options[o.name] === selected[o.name]));

  return (
    <div className={cn("space-y-4", className)}>
      {product.options.map((opt) => {
        const isColor = style === "swatch" && COLOR_RE.test(opt.name);
        if (style === "dropdown") {
          return (
            <label key={opt.name} className="block">
              <span className="pai-label">{opt.name}</span>
              <select className="pai-input" value={selected[opt.name] ?? ""} onChange={(e) => setOption(opt.name, e.target.value)}>
                {opt.values.map((v) => (
                  <option key={v} value={v}>
                    {v}
                    {valueAvailable(opt.name, v) ? "" : " — sold out"}
                  </option>
                ))}
              </select>
            </label>
          );
        }
        return (
          <fieldset key={opt.name}>
            <legend className="mb-2 text-sm">
              <span className="font-semibold">{opt.name}:</span> <span className="opacity-70">{selected[opt.name]}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {opt.values.map((v) => {
                const active = selected[opt.name] === v;
                const avail = valueAvailable(opt.name, v);
                if (isColor && mounted && isCssColor(v)) {
                  return (
                    <button
                      key={v}
                      type="button"
                      title={v}
                      aria-label={v}
                      aria-pressed={active}
                      onClick={() => setOption(opt.name, v)}
                      className={cn(
                        "relative size-9 rounded-full border border-pai-border p-0.5 transition",
                        active ? "ring-2 ring-pai-fg ring-offset-2 ring-offset-pai-bg" : "hover:scale-105",
                        !avail && "opacity-40",
                      )}
                    >
                      <span className="block size-full rounded-full border border-black/10" style={{ background: v.toLowerCase().replace(/\s+/g, "") }} />
                      {!avail ? <span className="absolute inset-0 m-auto h-px w-full rotate-45 bg-pai-fg" /> : null}
                    </button>
                  );
                }
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setOption(opt.name, v)}
                    className={cn(
                      "min-w-12 rounded-pai-btn border px-4 py-2 text-sm font-medium transition",
                      active ? "border-pai-fg bg-pai-fg text-pai-bg" : "border-pai-border hover:border-pai-fg",
                      !avail && !active && "text-pai-fg/40 line-through decoration-1",
                    )}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── stock ─────────────────────────── */

/** "In stock / Only N left / Sold out" indicator for the selected variant. */
export function StockIndicator({ lowStockThreshold = 5, className }: { lowStockThreshold?: number; className?: string }) {
  const form = useProductForm();
  if (!form) return null;
  const { available, inventory, needsSelection } = form;
  if (needsSelection) return <p className={cn("text-sm opacity-70", className)}>Select options to check availability</p>;
  const low = available && inventory > 0 && inventory <= lowStockThreshold;
  return (
    <p className={cn("flex items-center gap-2 text-sm", className)}>
      <span className={cn("relative flex size-2.5 rounded-full", !available ? "bg-pai-sale" : low ? "bg-amber-500" : "bg-emerald-500")}>
        {available ? <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", low ? "bg-amber-500" : "bg-emerald-500")} /> : null}
      </span>
      {!available ? "Sold out" : low ? `Hurry — only ${inventory} left in stock` : "In stock, ready to ship"}
    </p>
  );
}

/* ─────────────────────────── quantity ─────────────────────────── */

export type QuantitySelectorProps = {
  value?: number;
  onChange?: (q: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
};

/** Quantity stepper. Controlled via value/onChange, or bound to the enclosing ProductProvider. */
export function QuantitySelector({ value, onChange, min = 1, max = 999, size = "md", className, disabled }: QuantitySelectorProps) {
  const form = useProductForm();
  const q = value ?? form?.quantity ?? 1;
  const set = (n: number) => {
    const v = Math.max(min, Math.min(max, n));
    if (onChange) onChange(v);
    else form?.setQuantity(v);
  };
  const h = size === "sm" ? "h-9" : "h-12";
  return (
    <div className={cn("inline-flex items-center rounded-pai-btn border border-pai-border", h, className)}>
      <button type="button" aria-label="Decrease quantity" disabled={disabled || q <= min} onClick={() => set(q - 1)} className={cn("grid place-items-center disabled:opacity-40", size === "sm" ? "w-8" : "w-11")}>
        <Minus className="size-4" />
      </button>
      <input
        aria-label="Quantity"
        inputMode="numeric"
        value={q}
        disabled={disabled}
        onChange={(e) => set(parseInt(e.target.value.replace(/\D/g, "") || String(min), 10))}
        className={cn("h-full bg-transparent text-center font-medium outline-none", size === "sm" ? "w-8 text-sm" : "w-10")}
      />
      <button type="button" aria-label="Increase quantity" disabled={disabled || q >= max} onClick={() => set(q + 1)} className={cn("grid place-items-center disabled:opacity-40", size === "sm" ? "w-8" : "w-11")}>
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/* ─────────────────────────── buttons ─────────────────────────── */

export type AddToCartButtonProps = {
  /** Explicit product (outside a ProductProvider). */
  product?: Pick<SfProduct, "id" | "title" | "featuredImage" | "price" | "available" | "url"> & { variants?: SfVariant[] };
  variantId?: string | null;
  quantity?: number;
  label?: string;
  soldOutLabel?: string;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "accent";
  size?: "sm" | "md" | "lg";
  block?: boolean;
  showIcon?: boolean;
  /** Override the theme's cart type for this button. */
  openDrawer?: boolean;
  id?: string;
};

/** Add to cart. Inside a ProductProvider it uses the selected variant & quantity. */
export function AddToCartButton({
  product,
  variantId,
  quantity,
  label = "Add to cart",
  soldOutLabel = "Sold out",
  className,
  variant = "primary",
  size = "lg",
  block = true,
  showIcon = true,
  openDrawer,
  id,
}: AddToCartButtonProps) {
  const form = useProductForm();
  const cart = useCart();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const p = form?.product ?? product;
  if (!p) return null;
  const vId = form ? form.variant?.id ?? null : variantId ?? (product?.variants?.length === 1 ? product.variants[0]!.id : null);
  const available = form ? form.available : p.available;
  const needsSelection = form?.needsSelection ?? false;
  const disabled = !available || needsSelection || busy;

  const onClick = async () => {
    setBusy(true);
    const ok = await cart.add(
      {
        productId: p.id,
        variantId: vId,
        quantity: quantity ?? form?.quantity ?? 1,
        optimistic: {
          title: p.title,
          imageUrl: form?.imageUrl ?? p.featuredImage?.url ?? null,
          price: form?.price ?? p.price,
          variantTitle: form?.variant?.title ?? null,
          url: p.url,
        },
      },
      { openDrawer },
    );
    setBusy(false);
    if (ok) {
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    }
  };

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-pai-atc
      className={cn("pai-btn", `pai-btn-${variant}`, size === "lg" ? "pai-btn-lg" : size === "sm" ? "pai-btn-sm" : "", block && "pai-btn-block", className)}
    >
      {busy ? <LoaderCircle className="size-4 animate-spin" /> : done ? <Check className="size-4" /> : showIcon ? <ShoppingBag className="size-4" /> : null}
      {!available ? soldOutLabel : needsSelection ? "Select options" : done ? "Added" : label}
    </button>
  );
}

/** Adds the item and goes straight to checkout (or opens the cart when the theme disables direct checkout). */
export function BuyNowButton({
  label = "Buy it now",
  className,
  variant = "secondary",
  size = "lg",
  block = true,
  product,
  variantId,
}: Omit<AddToCartButtonProps, "soldOutLabel" | "openDrawer" | "showIcon" | "id">) {
  const form = useProductForm();
  const cart = useCart();
  const sf = useStorefront();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const p = form?.product ?? product;
  if (!p) return null;
  const available = form ? form.available : p.available;
  const disabled = !available || (form?.needsSelection ?? false) || busy;
  const onClick = async () => {
    setBusy(true);
    const ok = await cart.add(
      { productId: p.id, variantId: form ? form.variant?.id ?? null : variantId ?? null, quantity: form?.quantity ?? 1 },
      { silent: sf.buyNowCheckout, openDrawer: !sf.buyNowCheckout },
    );
    if (ok && sf.buyNowCheckout) router.push(sf.url("/checkout"));
    else setBusy(false);
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn("pai-btn", `pai-btn-${variant}`, size === "lg" ? "pai-btn-lg" : size === "sm" ? "pai-btn-sm" : "", block && "pai-btn-block", className)}
    >
      {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Zap className="size-4" />}
      {label}
    </button>
  );
}

/* ─────────────────────────── gallery ─────────────────────────── */

export type ProductGalleryProps = {
  images?: { url: string; alt?: string }[];
  layout?: "thumbnails-bottom" | "thumbnails-left" | "grid" | "stacked";
  ratio?: string; // tailwind aspect class
  zoom?: boolean;
  className?: string;
  badge?: ReactNode;
};

/** Product image gallery with thumbnails, swipe (scroll-snap), zoom lightbox and variant image sync. */
export function ProductGallery({ images: imagesProp, layout = "thumbnails-bottom", ratio = "aspect-[4/5]", zoom = true, className, badge }: ProductGalleryProps) {
  const form = useProductForm();
  const images = useMemo(() => {
    const base = imagesProp ?? form?.product.images ?? [];
    const extra = (form?.product.variants ?? []).map((v) => v.imageUrl).filter((u): u is string => !!u && !base.some((i) => i.url === u));
    return [...base, ...[...new Set(extra)].map((url) => ({ url, alt: form?.product.title }))];
  }, [imagesProp, form?.product]);
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Jump to the selected variant's image.
  const variantImage = form?.imageUrl;
  useEffect(() => {
    if (!variantImage) return;
    const i = images.findIndex((im) => im.url === variantImage);
    if (i >= 0) go(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantImage]);

  const go = (i: number) => {
    const n = (i + images.length) % Math.max(1, images.length);
    setIndex(n);
    const el = trackRef.current;
    if (el) el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
    if (i !== index) setIndex(i);
  };

  if (!images.length) {
    return <div className={cn("grid place-items-center rounded-pai bg-pai-muted text-sm opacity-60", ratio, className)}>No image</div>;
  }

  if (layout === "grid" || layout === "stacked") {
    return (
      <div className={cn("grid gap-3", layout === "grid" ? "md:grid-cols-2" : "", className)}>
        {images.map((img, i) => (
          <button
            key={img.url + i}
            type="button"
            onClick={() => {
              setIndex(i);
              if (zoom) setLightbox(true);
            }}
            className={cn("relative overflow-hidden rounded-pai bg-pai-muted", ratio, layout === "grid" && i === 0 && images.length % 2 === 1 ? "md:col-span-2" : "")}
          >
            <img src={img.url} alt={img.alt ?? ""} loading={i < 2 ? "eager" : "lazy"} className="pai-img-cover" />
            {i === 0 ? badge : null}
          </button>
        ))}
        {lightbox ? <Lightbox images={images} index={index} onClose={() => setLightbox(false)} onIndex={setIndex} /> : null}
      </div>
    );
  }

  const thumbs =
    images.length > 1 ? (
      <div className={cn("pai-no-scrollbar flex gap-2 overflow-auto", layout === "thumbnails-left" ? "md:order-first md:max-h-[640px] md:w-20 md:flex-col" : "")}>
        {images.map((img, i) => (
          <button
            key={img.url + i}
            type="button"
            aria-label={`Show image ${i + 1}`}
            onClick={() => go(i)}
            className={cn("relative aspect-square w-16 shrink-0 overflow-hidden rounded-[min(var(--pai-radius),8px)] border-2 transition md:w-20", i === index ? "border-pai-fg" : "border-transparent opacity-70 hover:opacity-100")}
          >
            <img src={img.url} alt="" loading="lazy" className="pai-img-cover" />
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div className={cn("flex flex-col gap-3", layout === "thumbnails-left" && "md:flex-row", className)}>
      <div className="relative min-w-0 flex-1">
        <div ref={trackRef} onScroll={onScroll} className={cn("pai-no-scrollbar pai-snap-x flex overflow-x-auto rounded-pai bg-pai-muted", ratio)}>
          {images.map((img, i) => (
            <div key={img.url + i} className="pai-snap-start relative h-full w-full shrink-0">
              <img src={img.url} alt={img.alt ?? ""} loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : undefined} className="pai-img-cover" />
            </div>
          ))}
        </div>
        {badge}
        {images.length > 1 ? (
          <>
            <button type="button" aria-label="Previous image" onClick={() => go(index - 1)} className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-neutral-900 shadow md:grid">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" aria-label="Next image" onClick={() => go(index + 1)} className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-neutral-900 shadow md:grid">
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden">
              {images.map((_, i) => (
                <span key={i} className={cn("h-1.5 rounded-full bg-white/90 shadow transition-all", i === index ? "w-5" : "w-1.5 opacity-60")} />
              ))}
            </div>
          </>
        ) : null}
        {zoom ? (
          <button type="button" aria-label="Zoom image" onClick={() => setLightbox(true)} className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white/90 text-neutral-900 shadow">
            <ZoomIn className="size-5" />
          </button>
        ) : null}
      </div>
      {thumbs}
      {lightbox ? <Lightbox images={images} index={index} onClose={() => setLightbox(false)} onIndex={go} /> : null}
    </div>
  );
}

function Lightbox({ images, index, onClose, onIndex }: { images: { url: string; alt?: string }[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % images.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, images.length, onClose, onIndex]);
  const img = images[index]!;
  return (
    <div role="dialog" aria-modal="true" aria-label="Image zoom" className="animate-pai-fade fixed inset-0 z-[90] flex items-center justify-center bg-black/90">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
        <X className="size-6" />
      </button>
      {images.length > 1 ? (
        <>
          <button type="button" aria-label="Previous" onClick={() => onIndex((index - 1 + images.length) % images.length)} className="absolute left-4 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <ChevronLeft className="size-6" />
          </button>
          <button type="button" aria-label="Next" onClick={() => onIndex((index + 1) % images.length)} className="absolute right-4 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <ChevronRight className="size-6" />
          </button>
        </>
      ) : null}
      <div
        className={cn("relative h-full max-h-[90vh] w-full max-w-5xl overflow-hidden", zoomed ? "cursor-zoom-out" : "cursor-zoom-in")}
        onClick={() => setZoomed((z) => !z)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
        }}
      >
        <img
          src={img.url}
          alt={img.alt ?? ""}
          className="size-full object-contain transition-transform duration-300"
          style={{ transform: zoomed ? "scale(2.2)" : "none", transformOrigin: origin }}
        />
      </div>
      <p className="absolute bottom-4 text-sm text-white/70">
        {index + 1} / {images.length}
      </p>
    </div>
  );
}

/* ─────────────────────────── sticky add to cart ─────────────────────────── */

/**
 * Bottom bar with price + add to cart that appears once the main add-to-cart button
 * (`[data-pai-atc]` inside `watchSelector`) scrolls out of view. Mobile-first.
 */
export function StickyAddToCart({ watchSelector = "[data-pai-main-atc]" }: { watchSelector?: string }) {
  const form = useProductForm();
  const { format } = useStorefront();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = document.querySelector(watchSelector);
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(!e!.isIntersecting && e!.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [watchSelector]);
  if (!form) return null;
  const img = form.imageUrl ?? form.product.featuredImage?.url;
  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-pai-border bg-pai-bg/95 backdrop-blur transition-transform duration-300",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="pai-container flex items-center gap-3 py-3">
        {img ? <img src={img} alt="" className="hidden size-12 rounded-[min(var(--pai-radius),8px)] object-cover sm:block" /> : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{form.product.title}</p>
          <p className="text-sm opacity-80">
            {format(form.price)}
            {form.variant ? <span className="ml-2 opacity-70">· {form.variant.title}</span> : null}
          </p>
        </div>
        <div className="w-40 sm:w-56">
          <AddToCartButton size="md" />
        </div>
      </div>
    </div>
  );
}

/** Fire the ViewContent tracking event once for a product (render anywhere on the product page). */
export function TrackProductView({ product }: { product: Pick<SfProduct, "id" | "title" | "price"> }) {
  const { currency } = useStorefront();
  useEffect(() => {
    trackEvent({ event: "ViewContent", value: product.price / 100, currency, contentIds: [product.id], contentName: product.title });
  }, [product.id, product.price, product.title, currency]);
  return null;
}
