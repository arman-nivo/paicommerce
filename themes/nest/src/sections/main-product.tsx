/**
 * Nest's product page: the kit's "main-product" plus three furniture blocks —
 *  - `dimensions`: a W × D × H table with a small line drawing; per-product sizes come from tags
 *    such as `dims:210x95x85`, `seat:45`, `weight:62kg`, otherwise from the block settings
 *  - `emi`: "or ৳X/month for 12 months at 0% EMI", following the selected variant's price
 *  - `delivery_estimate`: delivery & assembly date window inside / outside Dhaka
 */
import type { BlockSchema, SectionDefinition } from "@pai/theme-sdk";
import { Icon, bool, extendMainProduct, num, str, stripHtml, type ProductBlockProps } from "@pai/theme-kit";
import { EmiNote } from "../client/emi";
import { emiDefaults, parseLinks } from "./_nest";

/* ─────────────────────────── dimensions ─────────────────────────── */

export const dimensionsBlock: BlockSchema = {
  type: "dimensions",
  name: "Dimensions",
  limit: 1,
  settings: [
    { type: "text", id: "heading", label: "Heading", default: "Dimensions" },
    { type: "select", id: "unit", label: "Unit", default: "cm", options: [{ value: "cm", label: "Centimetres" }, { value: "in", label: "Inches" }] },
    { type: "text", id: "width", label: "Width", default: "", info: "Used when the product has no `dims:WxDxH` tag (e.g. dims:210x95x85). Otherwise a “W × D × H cm” line in the description is used." },
    { type: "text", id: "depth", label: "Depth", default: "" },
    { type: "text", id: "height", label: "Height", default: "" },
    { type: "textarea", id: "rows", label: "Extra rows", default: "", info: "One per line: Label | value, e.g. Seat height | 45 cm. Tags `seat:45` and `weight:62kg` add rows automatically." },
    { type: "checkbox", id: "show_drawing", label: "Show line drawing", default: true },
    { type: "checkbox", id: "hide_without_sizes", label: "Hide when the product has no sizes", default: true },
    { type: "text", id: "note", label: "Note", default: "Measure your doorway and lift — our crew can unpack pieces outside if needed." },
  ],
};

function tagValue(tags: string[], key: string): string {
  const t = tags.find((x) => x.toLowerCase().startsWith(`${key}:`));
  return t ? t.slice(key.length + 1).trim() : "";
}

export function Dimensions({ block, product }: ProductBlockProps) {
  const s = block.settings;
  const unit = str(s.unit, "cm");
  const fromTag = tagValue(product.tags, "dims").split(/[x×*]/i).map((x) => x.trim()).filter(Boolean);
  // Fallback: a "213 × 88 × 84 cm" style line in the product description.
  const fromText = stripHtml(product.description).match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*(cm|in|inch|mm)?/i);
  const [w, d, h] =
    fromTag.length === 3
      ? fromTag
      : str(s.width) || str(s.depth) || str(s.height)
        ? [str(s.width), str(s.depth), str(s.height)]
        : fromText
          ? [fromText[1]!, fromText[2]!, fromText[3]!].map((x) => (fromText[4] && fromText[4].toLowerCase() !== unit ? `${x} ${fromText[4]}` : x))
          : ["", "", ""];
  const rows = [
    ...(tagValue(product.tags, "seat") ? [{ label: "Seat height", href: `${tagValue(product.tags, "seat")} ${unit}` }] : []),
    ...(tagValue(product.tags, "weight") ? [{ label: "Weight", href: tagValue(product.tags, "weight") }] : []),
    ...parseLinks(s.rows),
  ];
  const has = !!(w || d || h);
  if (!has && !rows.length && bool(s.hide_without_sizes, true)) return null;
  const val = (v: string | undefined) => (v ? (/[a-z"]/i.test(v) ? v : `${v} ${unit}`) : "—");
  return (
    <div className="nest-dimensions border-t border-pai-border pt-5">
      <p className="mb-4 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] opacity-70">
        <Icon name="ruler" className="size-4" /> {str(s.heading, "Dimensions")}
      </p>
      <div className="flex items-center gap-6">
        {has && bool(s.show_drawing, true) ? (
          <svg viewBox="0 0 120 80" aria-hidden className="h-20 w-28 shrink-0 text-pai-fg/60" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M20 30 L70 30 L100 18 L50 18 Z" />
            <path d="M20 30 L20 62 L70 62 L70 30" />
            <path d="M70 62 L100 50 L100 18" />
            <path d="M20 70 L70 70" strokeDasharray="2 2" />
            <path d="M74 70 L104 58" strokeDasharray="2 2" />
            <path d="M108 18 L108 50" strokeDasharray="2 2" />
            <text x="40" y="78" fontSize="7" fill="currentColor" stroke="none">W</text>
            <text x="92" y="70" fontSize="7" fill="currentColor" stroke="none">D</text>
            <text x="111" y="37" fontSize="7" fill="currentColor" stroke="none">H</text>
          </svg>
        ) : null}
        <dl className="grid flex-1 grid-cols-3 divide-x divide-pai-border rounded-pai border border-pai-border text-center">
          {[
            ["Width", w],
            ["Depth", d],
            ["Height", h],
          ].map(([label, v]) => (
            <div key={label} className="px-2 py-3">
              <dt className="text-[0.65rem] uppercase tracking-[0.16em] opacity-55">{label}</dt>
              <dd className="mt-1 font-heading text-lg leading-none">{val(v)}</dd>
            </div>
          ))}
        </dl>
      </div>
      {rows.length ? (
        <dl className="mt-4 divide-y divide-pai-border text-sm">
          {rows.map((r, i) => (
            <div key={i} className="flex justify-between gap-4 py-2">
              <dt className="opacity-65">{r.label}</dt>
              <dd className="font-medium">{r.href}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {str(s.note) ? <p className="mt-3 text-xs opacity-60">{str(s.note)}</p> : null}
    </div>
  );
}

/* ─────────────────────────── EMI ─────────────────────────── */

export const emiBlock: BlockSchema = {
  type: "emi",
  name: "EMI instalments",
  limit: 1,
  settings: [
    { type: "text", id: "text", label: "Text", default: "Or {amount}/month for {months} months at 0% EMI", info: "Use {amount} and {months}." },
    { type: "text", id: "detail", label: "Detail line", default: "On City, BRAC, EBL, DBBL & Standard Chartered credit cards — choose EMI at checkout." },
    { type: "range", id: "months", label: "Tenure", min: 0, max: 36, step: 3, unit: " mo", default: 0, info: "0 = use the theme's default EMI tenure." },
  ],
};

export function EmiBlock({ block, product, context }: ProductBlockProps) {
  const { months: globalMonths, minPrice } = emiDefaults(context);
  const months = num(block.settings.months, 0) || globalMonths;
  return <EmiNote months={months} minPrice={minPrice} text={str(block.settings.text, "Or {amount}/month for {months} months at 0% EMI")} detail={str(block.settings.detail)} fallbackPrice={product.price} />;
}

/* ─────────────────────────── delivery estimate ─────────────────────────── */

export const deliveryEstimateBlock: BlockSchema = {
  type: "delivery_estimate",
  name: "Delivery & assembly estimate",
  limit: 1,
  settings: [
    { type: "text", id: "inside_label", label: "Inside city label", default: "Inside Dhaka" },
    { type: "range", id: "inside_min", label: "Inside city: from (days)", min: 0, max: 30, step: 1, default: 2 },
    { type: "range", id: "inside_max", label: "Inside city: to (days)", min: 1, max: 45, step: 1, default: 4 },
    { type: "text", id: "outside_label", label: "Outside label", default: "Other districts" },
    { type: "range", id: "outside_min", label: "Outside: from (days)", min: 0, max: 30, step: 1, default: 5 },
    { type: "range", id: "outside_max", label: "Outside: to (days)", min: 1, max: 45, step: 1, default: 9 },
    { type: "text", id: "assembly_text", label: "Assembly line", default: "Free white-glove assembly included" },
  ],
};

const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Dhaka" });
const addDays = (n: number) => new Date(Date.now() + Math.max(0, n) * 86400000);

export function DeliveryEstimate({ block }: ProductBlockProps) {
  const s = block.settings;
  const rows = [
    { label: str(s.inside_label, "Inside Dhaka"), a: num(s.inside_min, 2), b: num(s.inside_max, 4) },
    { label: str(s.outside_label, "Other districts"), a: num(s.outside_min, 5), b: num(s.outside_max, 9) },
  ].filter((r) => r.label);
  if (!rows.length) return null;
  return (
    <div className="rounded-pai bg-pai-muted px-4 py-4 text-sm">
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.label} className="flex items-start gap-3">
            <Icon name="truck" className="mt-0.5 size-4 shrink-0 opacity-70" />
            <span>
              <span className="font-medium">{r.label}:</span> <span className="opacity-80">delivered {fmtDate(addDays(r.a))} – {fmtDate(addDays(Math.max(r.a, r.b)))}</span>
            </span>
          </li>
        ))}
        {str(s.assembly_text) ? (
          <li className="flex items-start gap-3">
            <Icon name="wrench" className="mt-0.5 size-4 shrink-0 opacity-70" />
            <span className="opacity-80">{str(s.assembly_text)}</span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}

export function nestMainProduct(base: SectionDefinition<any>): SectionDefinition<any> {
  return extendMainProduct(
    [
      { schema: dimensionsBlock, component: Dimensions },
      { schema: emiBlock, component: EmiBlock },
      { schema: deliveryEstimateBlock, component: DeliveryEstimate },
    ],
    base,
  );
}
