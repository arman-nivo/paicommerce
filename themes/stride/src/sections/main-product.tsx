/**
 * Stride's product page: the kit's `main-product` (every kit block keeps working) plus a
 * "Fit & feel" block — up to three labelled 5-step scales (fit, cushioning, support …) and a
 * sizing note, the way sportswear brands show how a shoe or garment wears.
 */
import type { SectionDefinition } from "@pai/theme-sdk";
import { extendMainProduct, num, str, type ProductBlockExtension } from "@pai/theme-kit";
import { Ruler } from "lucide-react";

const scale = (n: number, label: string, left: string, right: string, value: number) => [
  { type: "text" as const, id: `label_${n}`, label: `Scale ${n} label`, default: label },
  { type: "text" as const, id: `left_${n}`, label: `Scale ${n} left end`, default: left },
  { type: "text" as const, id: `right_${n}`, label: `Scale ${n} right end`, default: right },
  { type: "range" as const, id: `value_${n}`, label: `Scale ${n} value`, min: 1, max: 5, step: 1, default: value },
];

export const fitFeelBlock: ProductBlockExtension = {
  schema: {
    type: "fit_feel",
    name: "Fit & feel",
    limit: 1,
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Fit & feel" },
      ...scale(1, "Fit", "Snug", "Roomy", 3),
      ...scale(2, "Cushioning", "Firm", "Plush", 4),
      ...scale(3, "Support", "Flexible", "Structured", 2),
      { type: "textarea", id: "note", label: "Sizing note", default: "True to size. Wide feet? Go half a size up. Free size exchange within 7 days." },
    ],
  },
  component: ({ block }) => {
    const s = block.settings;
    const rows = [1, 2, 3]
      .map((n) => ({ n, label: str(s[`label_${n}`]), left: str(s[`left_${n}`]), right: str(s[`right_${n}`]), value: Math.min(5, Math.max(1, num(s[`value_${n}`], 3))) }))
      .filter((r) => r.label);
    if (!rows.length && !str(s.note)) return null;
    return (
      <div className="stride-fit border border-pai-border p-4 md:p-5">
        {str(s.heading) ? <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em]">{str(s.heading)}</p> : null}
        <dl className="space-y-4">
          {rows.map((r) => (
            <div key={r.n}>
              <dt className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="font-semibold">{r.label}</span>
                <span className="sr-only">
                  : {r.value} out of 5 ({r.left} to {r.right})
                </span>
              </dt>
              <dd>
                <div aria-hidden className="grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className={i === r.value ? "h-1.5 bg-pai-accent" : i < r.value ? "h-1.5 bg-pai-fg/70" : "h-1.5 bg-pai-fg/12"} />
                  ))}
                </div>
                <div aria-hidden className="mt-1 flex justify-between text-[11px] uppercase tracking-wider opacity-55">
                  <span>{r.left}</span>
                  <span>{r.right}</span>
                </div>
              </dd>
            </div>
          ))}
        </dl>
        {str(s.note) ? (
          <p className="mt-4 flex gap-2 border-t border-pai-border pt-3 text-sm opacity-80">
            <Ruler className="mt-0.5 size-4 shrink-0 text-pai-accent" aria-hidden />
            {str(s.note)}
          </p>
        ) : null}
      </div>
    );
  },
};

export const strideMainProduct = (base: SectionDefinition<any>) => extendMainProduct([fitFeelBlock], base);
