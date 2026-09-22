/**
 * Lumière's product page: the kit's "main-product" (zoom gallery, variants, buy buttons …) plus
 * two fine-jewellery blocks —
 *  - `certification`: hallmark / purity / certificate seals and a metal & stone spec sheet
 *    (filled automatically from tags such as `22k`, `18k`, `diamond`, `pearl`, `sapphire`)
 *  - `gift_message`: gift wrap, handwritten card and gift-receipt details
 */
import type { BlockSchema, SectionDefinition, SfProduct } from "@pai/theme-sdk";
import { Icon, bool, extendMainProduct, str, type ProductBlockProps } from "@pai/theme-kit";

const lines = (v: unknown) =>
  str(v)
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

export const certificationBlock: BlockSchema = {
  type: "certification",
  name: "Certification & details",
  limit: 1,
  settings: [
    { type: "text", id: "heading", label: "Heading", default: "Certified & hallmarked" },
    { type: "text", id: "metal", label: "Metal", info: "E.g. “22K yellow gold (916)”. Leave empty to detect from tags (22k, 18k, 14k, platinum, silver)." },
    { type: "text", id: "stones", label: "Stones", info: "E.g. “0.72 ct natural diamonds, VS1 · G”. Leave empty to detect from tags (diamond, pearl, sapphire …)." },
    { type: "text", id: "weight", label: "Approximate weight", default: "", info: "E.g. “18.4 g” — shown only when set." },
    { type: "text", id: "certificate", label: "Certificate", default: "Certificate of authenticity included" },
    { type: "text", id: "seals", label: "Seals", default: "BSTI hallmark, Lifetime exchange, Insured delivery", info: "Comma separated, up to 4." },
    { type: "checkbox", id: "show_specs", label: "Show metal & stone details", default: true },
  ],
};

const METALS: [string, string][] = [
  ["22k", "22K yellow gold · 916 hallmark"],
  ["21k", "21K yellow gold · 875 hallmark"],
  ["18k", "18K gold · 750 hallmark"],
  ["14k", "14K gold · 585 hallmark"],
  ["platinum", "Platinum 950"],
  ["silver", "Sterling silver 925"],
  ["watch", "Stainless steel case"],
];
const STONES: [string, string][] = [
  ["diamond", "Natural diamonds, certified"],
  ["solitaire", "Single natural diamond, certified"],
  ["pearl", "Cultured freshwater pearls"],
  ["sapphire", "Natural sapphires"],
  ["gemstone", "Natural gemstones"],
  ["ruby", "Natural rubies"],
  ["emerald", "Natural emeralds"],
];

function detect(product: SfProduct, table: [string, string][]): string {
  const hay = [...product.tags, product.title, product.productType ?? ""].join(" ").toLowerCase();
  return table.find(([k]) => hay.includes(k))?.[1] ?? "";
}

export function Certification({ block, product }: ProductBlockProps) {
  const s = block.settings;
  const metal = str(s.metal) || detect(product, METALS);
  const stones = str(s.stones) || detect(product, STONES);
  const weight = str(s.weight);
  const certificate = str(s.certificate);
  const seals = lines(s.seals).slice(0, 4);
  const specs = bool(s.show_specs, true)
    ? ([
        ["Metal", metal],
        ["Stones", stones],
        ["Weight", weight],
        ["Certificate", certificate],
      ].filter(([, v]) => v) as [string, string][])
    : [];
  if (!specs.length && !seals.length) return null;
  return (
    <div className="lumiere-cert border-y border-[var(--lumiere-rule)] py-6">
      <p className="lumiere-label mb-4">{str(s.heading, "Certified & hallmarked")}</p>
      {seals.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {seals.map((x) => (
            <li key={x} className="flex flex-col items-center gap-2 text-center">
              <span className="grid size-12 place-items-center rounded-full border border-[var(--lumiere-gold)] text-[var(--lumiere-gold)]">
                <Icon name={/hallmark|bsti|916|purity/i.test(x) ? "stamp" : /exchange|buy.?back/i.test(x) ? "repeat" : /insur|deliver/i.test(x) ? "shield-check" : "gem"} className="size-5" strokeWidth={1.1} />
              </span>
              <span className="text-[0.62rem] uppercase leading-snug tracking-[0.18em] opacity-75">{x}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {specs.length ? (
        <dl className="mt-6 divide-y divide-[var(--lumiere-rule)] text-sm">
          {specs.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-6 py-2.5">
              <dt className="text-[0.64rem] uppercase tracking-[0.22em] opacity-55">{k}</dt>
              <dd className="text-right font-heading text-[1.05rem]">{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

export const giftMessageBlock: BlockSchema = {
  type: "gift_message",
  name: "Gift messaging",
  limit: 1,
  settings: [
    { type: "text", id: "heading", label: "Heading", default: "Sent as a gift" },
    { type: "textarea", id: "text", label: "Text", default: "Every piece leaves the atelier in our ivory box, tied with a gold ribbon." },
    { type: "textarea", id: "perks", label: "What's included", default: "Signature box & gold ribbon\nHandwritten card with your message\nGift receipt — no prices inside", info: "One per line." },
    { type: "textarea", id: "how_to", label: "How to add a message", default: "Write your card message in the order note at checkout — our calligrapher will hand-write it. We can also deliver to a different address in any of the 64 districts." },
  ],
};

export function GiftMessage({ block }: ProductBlockProps) {
  const s = block.settings;
  const perks = str(s.perks)
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
  return (
    <div className="lumiere-gift bg-pai-card p-6">
      <div className="flex items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center border border-[var(--lumiere-gold)] text-[var(--lumiere-gold)]">
          <Icon name="gift" className="size-5" strokeWidth={1.1} />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-xl leading-tight">{str(s.heading, "Sent as a gift")}</p>
          {str(s.text) ? <p className="mt-1.5 text-sm leading-relaxed opacity-70">{str(s.text)}</p> : null}
        </div>
      </div>
      {perks.length ? (
        <ul className="mt-5 space-y-2 text-sm">
          {perks.map((x) => (
            <li key={x} className="flex items-center gap-3">
              <span aria-hidden className="size-1.5 shrink-0 rotate-45 bg-[var(--lumiere-gold)]" />
              {x}
            </li>
          ))}
        </ul>
      ) : null}
      {str(s.how_to) ? (
        <details className="lumiere-details mt-5 border-t border-[var(--lumiere-rule)] pt-4 text-sm">
          <summary className="cursor-pointer list-none text-[0.64rem] uppercase tracking-[0.24em] focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-current [&::-webkit-details-marker]:hidden">
            How to add your message <span aria-hidden className="lumiere-gold">+</span>
          </summary>
          <p className="mt-3 leading-relaxed opacity-75">{str(s.how_to)}</p>
        </details>
      ) : null}
    </div>
  );
}

export function lumiereMainProduct(base: SectionDefinition<any>): SectionDefinition<any> {
  return extendMainProduct(
    [
      { schema: certificationBlock, component: Certification },
      { schema: giftMessageBlock, component: GiftMessage },
    ],
    base,
  );
}
