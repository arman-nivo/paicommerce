/** Slim products before handing them to client islands. */
import type { SfProduct } from "@pai/theme-sdk";
import { stripHtml, truncate } from "@pai/theme-kit";
import type { BuyBoxProduct } from "../client/buy-box";

/** For the kit QuickAddButton / QuickView: short plain description and at most 4 images. */
export function slimProduct(p: SfProduct): SfProduct {
  return { ...p, description: truncate(stripHtml(p.description), 200), images: p.images.slice(0, 4) };
}

export function toBuyBox(p: SfProduct): BuyBoxProduct {
  return {
    id: p.id,
    title: p.title,
    url: p.url,
    image: p.featuredImage?.url ?? p.images[0]?.url ?? null,
    price: p.price,
    available: p.available,
    variants: p.variants.map((v) => ({ id: v.id, title: v.title, price: v.price, compareAtPrice: v.compareAtPrice, available: v.available })),
  };
}
