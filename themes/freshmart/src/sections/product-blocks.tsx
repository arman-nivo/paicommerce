/** FreshMart main-product blocks: a delivery ETA card and a freshness guarantee. */
import type { BlockSchema } from "@pai/theme-sdk";
import { Icon, str, type ProductBlockProps } from "@pai/theme-kit";

const deliverySchema: BlockSchema = {
  type: "fm_delivery",
  name: "Delivery promise",
  limit: 1,
  settings: [
    { type: "text", id: "title", label: "Title", default: "Delivery in 60 minutes" },
    { type: "text", id: "text", label: "Text", default: "Across Dhaka city, 7 AM – 11 PM. Free on baskets over ৳999." },
    { type: "text", id: "line_2", label: "Second line", default: "Cash on delivery · bKash · Nagad · Cards" },
    { type: "text", id: "line_3", label: "Third line", default: "Not fresh? Hand it back to the rider for a full refund." },
  ],
};

function Delivery({ block }: ProductBlockProps) {
  const s = block.settings;
  const rows: [string, string][] = [
    ["zap", str(s.text)],
    ["wallet", str(s.line_2)],
    ["leaf", str(s.line_3)],
  ];
  return (
    <div className="rounded-pai border border-pai-border bg-[color-mix(in_srgb,var(--pai-primary)_6%,var(--pai-bg))] p-4">
      <p className="flex items-center gap-2 font-bold text-pai-primary">
        <Icon name="bike" className="size-5" strokeWidth={2} />
        {str(s.title, "Fast delivery")}
      </p>
      <ul className="mt-2.5 space-y-1.5 text-sm">
        {rows
          .filter(([, t]) => t)
          .map(([icon, t]) => (
            <li key={icon} className="flex gap-2 opacity-85">
              <Icon name={icon} className="mt-0.5 size-4 shrink-0" />
              {t}
            </li>
          ))}
      </ul>
    </div>
  );
}

export const productBlocks = [{ schema: deliverySchema, component: Delivery }];
