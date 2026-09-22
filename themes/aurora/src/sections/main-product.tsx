/**
 * Aurora's product page: the kit's "main-product" section extended with a `size_guide` block that
 * opens a modal size chart next to the variant picker. Every kit block keeps its schema and
 * renderer — `extendMainProduct` only adds ours.
 */
import type { BlockSchema, SectionDefinition } from "@pai/theme-sdk";
import { extendMainProduct, str, type ProductBlockProps } from "@pai/theme-kit";
import { SizeGuideDialog } from "../client/size-guide-dialog";
import { DEFAULT_MEASURE_TIPS, DEFAULT_SIZE_TABLE, SizeGuideBody, parseTable } from "./size-guide";

export const sizeGuideBlock: BlockSchema = {
  type: "size_guide",
  name: "Size guide",
  limit: 1,
  settings: [
    { type: "text", id: "label", label: "Link label", default: "Size guide" },
    { type: "text", id: "heading", label: "Pop-up heading", default: "Find your size" },
    { type: "textarea", id: "intro", label: "Intro", default: "Measurements refer to your body. Our pieces are cut for a relaxed fit." },
    {
      type: "textarea",
      id: "table",
      label: "Size chart",
      default: DEFAULT_SIZE_TABLE,
      info: "First line = column headings, one size per line. Separate cells with commas or |.",
    },
    { type: "text", id: "note", label: "Note", default: "All measurements in centimetres." },
    { type: "richtext", id: "tips", label: "How to measure", default: DEFAULT_MEASURE_TIPS },
    {
      type: "text",
      id: "only_option",
      label: "Only show for products with option",
      default: "",
      info: "E.g. “Size”. Leave empty to show on every product.",
    },
  ],
};

/** Renders the size guide link + dialog (hidden when the product lacks the configured option). */
export function SizeGuideProductBlock({ block, product }: ProductBlockProps) {
  const s = block.settings;
  const only = str(s.only_option).toLowerCase();
  if (only && !product.options.some((o) => o.name.toLowerCase() === only)) return null;
  const { head, rows } = parseTable(str(s.table, DEFAULT_SIZE_TABLE));
  if (!rows.length) return null;
  const heading = str(s.heading, "Find your size");
  return (
    <div className="-mt-2">
      <SizeGuideDialog label={str(s.label, "Size guide")} title={heading}>
        <SizeGuideBody intro={str(s.intro)} head={head} rows={rows} note={str(s.note)} tips={str(s.tips)} caption={`${heading} — ${product.title}`} />
      </SizeGuideDialog>
    </div>
  );
}

/** Used as `overrideSections: { "main-product": auroraMainProduct }`. */
export function auroraMainProduct(base: SectionDefinition<any>): SectionDefinition<any> {
  return extendMainProduct([{ schema: sizeGuideBlock, component: SizeGuideProductBlock }], base);
}
