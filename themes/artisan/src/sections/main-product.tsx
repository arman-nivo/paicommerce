/**
 * Artisan's product page: the kit's "main-product" plus two craft blocks —
 *  - `maker`: "Made by … in …" card with a small portrait, region and time taken
 *  - `made_to_order`: lead time, a "each piece is unique" note and care instructions
 */
import type { BlockSchema, SectionDefinition } from "@pai/theme-sdk";
import { Icon, SmartLink, extendMainProduct, resolveHref, str, type ProductBlockProps } from "@pai/theme-kit";
import { regionOf } from "./_artisan";

export const makerBlock: BlockSchema = {
  type: "maker",
  name: "Maker",
  limit: 1,
  settings: [
    { type: "text", id: "label", label: "Label", default: "made by" },
    { type: "text", id: "name", label: "Maker name", default: "", info: "Leave empty to use the product's vendor." },
    { type: "text", id: "region", label: "Region", default: "", info: "Leave empty to derive it from tags (kantha → Jamalpur, copper → Dhamrai, jute → Mymensingh …)." },
    { type: "text", id: "time_taken", label: "Time taken", default: "About 3 days, start to finish" },
    { type: "image", id: "portrait", label: "Portrait", info: "Small round photo of the maker or their hands." },
    { type: "text", id: "portrait_alt", label: "Portrait description (alt text)", default: "" },
    { type: "text", id: "link_label", label: "Link label", default: "Meet the makers" },
    { type: "url", id: "link", label: "Link", default: "/pages/about" },
  ],
};

export function Maker({ block, product, context }: ProductBlockProps) {
  const s = block.settings;
  const name = str(s.name) || product.vendor || context.store.name;
  const region = str(s.region) || regionOf(product);
  const href = resolveHref(context, s.link);
  return (
    <div className="artisan-maker-block flex items-center gap-4 p-4">
      <span className="artisan-maker-avatar relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-pai-muted">
        {str(s.portrait) ? <img src={str(s.portrait)} alt={str(s.portrait_alt)} loading="lazy" className="absolute inset-0 size-full object-cover" /> : <Icon name="hand" className="size-6 text-pai-accent" strokeWidth={1.4} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="artisan-hand text-xl leading-none text-pai-accent">{str(s.label, "made by")}</p>
        <p className="mt-1 font-heading text-lg leading-tight">
          {name} <span className="opacity-60">in</span> {region}
        </p>
        {str(s.time_taken) ? (
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs opacity-70">
            <Icon name="hourglass" className="size-3.5" /> {str(s.time_taken)}
          </p>
        ) : null}
      </div>
      {href && str(s.link_label) ? (
        <SmartLink href={href} className="hidden shrink-0 text-xs font-medium underline decoration-dashed underline-offset-4 sm:inline">
          {str(s.link_label)}
        </SmartLink>
      ) : null}
    </div>
  );
}

export const madeToOrderBlock: BlockSchema = {
  type: "made_to_order",
  name: "Made to order",
  limit: 1,
  settings: [
    { type: "text", id: "only_tag", label: "Only show for products tagged", default: "", info: "E.g. “made-to-order”. Leave empty to show on every product." },
    { type: "text", id: "lead_time", label: "Lead time", default: "Made to order — ready in 3–4 weeks" },
    { type: "textarea", id: "lead_note", label: "Lead-time note", default: "Your piece is made after you order. We'll message you photos from the workshop before it ships." },
    { type: "textarea", id: "unique_note", label: "Uniqueness note", default: "Each piece is one of a kind. Small variations in colour, glaze and stitch are the maker's hand — not flaws." },
    { type: "text", id: "care_heading", label: "Care heading", default: "Caring for your piece" },
    { type: "textarea", id: "care", label: "Care instructions", default: "Wipe clean with a soft, damp cloth.\nKeep out of harsh, direct sun.\nHand-wash textiles cold; dry in shade.", info: "One instruction per line." },
  ],
};

export function MadeToOrder({ block, product }: ProductBlockProps) {
  const s = block.settings;
  const tag = str(s.only_tag).toLowerCase();
  if (tag && !product.tags.some((t) => t.toLowerCase() === tag)) return null;
  const care = str(s.care)
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
  return (
    <div className="artisan-mto space-y-4">
      {str(s.lead_time) ? (
        <div className="artisan-stitch-box flex gap-3 p-4">
          <Icon name="clock" className="mt-0.5 size-5 shrink-0 text-pai-accent" />
          <div>
            <p className="font-medium">{str(s.lead_time)}</p>
            {str(s.lead_note) ? <p className="mt-1 text-sm opacity-70">{str(s.lead_note)}</p> : null}
          </div>
        </div>
      ) : null}
      {str(s.unique_note) ? (
        <p className="flex gap-3 text-sm opacity-80">
          <Icon name="gem" className="mt-0.5 size-4 shrink-0 text-pai-accent" />
          <span>{str(s.unique_note)}</span>
        </p>
      ) : null}
      {care.length ? (
        <details className="artisan-care group border-y border-dashed border-pai-border py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pai-accent [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              <Icon name="leaf" className="size-4" /> {str(s.care_heading, "Caring for your piece")}
            </span>
            <Icon name="plus" className="size-4 transition group-open:rotate-45" />
          </summary>
          <ul className="mt-3 space-y-1.5 text-sm opacity-80">
            {care.map((c, i) => (
              <li key={i} className="flex gap-2.5">
                <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-current opacity-60" />
                {c}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

export function artisanMainProduct(base: SectionDefinition<any>): SectionDefinition<any> {
  return extendMainProduct(
    [
      { schema: makerBlock, component: Maker },
      { schema: madeToOrderBlock, component: MadeToOrder },
    ],
    base,
  );
}
