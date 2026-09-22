/**
 * Bazaar's product page: the kit's `main-product` (every kit block keeps working) plus two
 * marketplace blocks — a store voucher strip and a "Sold by" seller card.
 */
import type { SectionDefinition } from "@pai/theme-sdk";
import { SmartLink, extendMainProduct, str, type ProductBlockExtension } from "@pai/theme-kit";
import { BadgeCheck, Store, Ticket, Truck } from "lucide-react";
import { CopyCode } from "../client/copy-code";

export const voucherBlock: ProductBlockExtension = {
  schema: {
    type: "voucher",
    name: "Store voucher",
    limit: 1,
    settings: [
      { type: "text", id: "title", label: "Offer", default: "৳100 off on orders over ৳1,500" },
      { type: "text", id: "code", label: "Voucher code", default: "BAZAAR100" },
      { type: "text", id: "note", label: "Note", default: "Apply at checkout · Limited time" },
    ],
  },
  component: ({ block }) => {
    const s = block.settings;
    if (!str(s.title)) return null;
    return (
      <div className="bz-voucher flex items-center gap-3 rounded-pai p-3">
        <Ticket className="size-6 shrink-0 text-pai-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">{str(s.title)}</p>
          {str(s.note) ? <p className="mt-0.5 text-xs opacity-60">{str(s.note)}</p> : null}
        </div>
        {str(s.code) ? (
          <div className="flex shrink-0 items-center gap-2">
            <code className="rounded border border-dashed border-pai-primary px-2 py-1 text-xs font-bold tracking-wider text-pai-primary">{str(s.code)}</code>
            <CopyCode code={str(s.code)} className="bg-pai-primary text-pai-primary-fg hover:brightness-110" />
          </div>
        ) : null}
      </div>
    );
  },
};

export const sellerBlock: ProductBlockExtension = {
  schema: {
    type: "seller",
    name: "Seller card",
    limit: 1,
    settings: [
      { type: "text", id: "label", label: "Label", default: "Sold by" },
      { type: "text", id: "seller", label: "Seller name", info: "Defaults to the product vendor, then your store name." },
      { type: "text", id: "badge", label: "Badge", default: "Verified seller" },
      { type: "text", id: "stat_1", label: "Stat 1", default: "96% positive ratings" },
      { type: "text", id: "stat_2", label: "Stat 2", default: "Ships within 24 hours" },
      { type: "text", id: "link_label", label: "Link label", default: "Visit store" },
    ],
  },
  component: ({ block, product, context }) => {
    const s = block.settings;
    const seller = str(s.seller) || product.vendor || context.store.name;
    const href = product.vendor ? context.url(`/search?q=${encodeURIComponent(product.vendor)}`) : context.url("/collections/all");
    const stats = [str(s.stat_1), str(s.stat_2)].filter(Boolean);
    return (
      <div className="rounded-pai border border-pai-border bg-pai-card p-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-pai-primary/10 text-pai-primary">
            <Store className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.7rem] uppercase tracking-wider opacity-60">{str(s.label, "Sold by")}</p>
            <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
              {seller}
              {str(s.badge) ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  <BadgeCheck className="size-3" aria-hidden /> {str(s.badge)}
                </span>
              ) : null}
            </p>
          </div>
          {str(s.link_label) ? (
            <SmartLink href={href} className="shrink-0 text-xs font-semibold text-pai-primary hover:underline">
              {str(s.link_label)} →
            </SmartLink>
          ) : null}
        </div>
        {stats.length ? (
          <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 border-t border-pai-border pt-2.5 text-xs opacity-75">
            {stats.map((t, i) => (
              <li key={t} className="inline-flex items-center gap-1">
                {i === 0 ? <BadgeCheck className="size-3.5 text-pai-primary" aria-hidden /> : <Truck className="size-3.5 text-pai-primary" aria-hidden />}
                {t}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  },
};

export const bazaarMainProduct = (base: SectionDefinition<any>) => extendMainProduct([voucherBlock, sellerBlock], base);
