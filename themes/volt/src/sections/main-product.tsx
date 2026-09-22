/**
 * Volt's product page: the kit's `main-product` (every kit block keeps working) plus an
 * "Assurance" block — warranty / replacement / EMI promises in a bordered panel under the buy buttons.
 */
import type { SectionDefinition } from "@pai/theme-sdk";
import { ICON_OPTIONS, Icon, extendMainProduct, str, type ProductBlockExtension } from "@pai/theme-kit";

export const assuranceBlock: ProductBlockExtension = {
  schema: {
    type: "assurance",
    name: "Warranty & assurance",
    limit: 1,
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Buy with confidence" },
      { type: "select", id: "icon_1", label: "Icon 1", default: "shield-check", options: ICON_OPTIONS },
      { type: "text", id: "title_1", label: "Title 1", default: "1-year official warranty" },
      { type: "text", id: "text_1", label: "Text 1", default: "Brand service centres nationwide" },
      { type: "select", id: "icon_2", label: "Icon 2", default: "rotate-ccw", options: ICON_OPTIONS },
      { type: "text", id: "title_2", label: "Title 2", default: "7-day replacement" },
      { type: "text", id: "text_2", label: "Text 2", default: "For manufacturing defects" },
      { type: "select", id: "icon_3", label: "Icon 3", default: "credit-card", options: ICON_OPTIONS },
      { type: "text", id: "title_3", label: "Title 3", default: "Easy payment" },
      { type: "text", id: "text_3", label: "Text 3", default: "Cash on delivery, bKash, Nagad & cards" },
    ],
  },
  component: ({ block }) => {
    const s = block.settings;
    const rows = [1, 2, 3].map((n) => ({ icon: str(s[`icon_${n}`]), title: str(s[`title_${n}`]), text: str(s[`text_${n}`]) })).filter((r) => r.title);
    if (!rows.length) return null;
    return (
      <div className="rounded-pai border border-pai-border bg-pai-muted/50 p-4">
        {str(s.heading) ? <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] opacity-60">{str(s.heading)}</p> : null}
        <ul className="grid gap-3 sm:grid-cols-3">
          {rows.map((r, i) => (
            <li key={i} className="flex gap-2.5">
              <Icon name={r.icon || "shield-check"} className="mt-0.5 size-5 shrink-0 text-pai-primary" />
              <span className="text-sm">
                <span className="block font-semibold leading-tight">{r.title}</span>
                {r.text ? <span className="mt-0.5 block text-xs opacity-60">{r.text}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  },
};

export const voltMainProduct = (base: SectionDefinition<any>) => extendMainProduct([assuranceBlock], base);
