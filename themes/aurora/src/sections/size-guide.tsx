import { defineSection } from "@pai/theme-sdk";
import { RichText, Section, cn, paddingField, schemeField, str } from "@pai/theme-kit";
import { SizeGuideDialog } from "../client/size-guide-dialog";

/* ─────────────────────────── shared table ─────────────────────────── */

/** Split a row of cells written as "S, 86, 68" or "S | 86 | 68". */
export function splitCells(line: string): string[] {
  const sep = line.includes("|") ? "|" : line.includes("\t") ? "\t" : ",";
  return line.split(sep).map((c) => c.trim());
}

/** Parse a textarea table: first line = header, following lines = rows. */
export function parseTable(text: string): { head: string[]; rows: string[][] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const [head = "", ...rest] = lines;
  return { head: splitCells(head), rows: rest.map(splitCells) };
}

export const DEFAULT_SIZE_TABLE = ["Size, Bust (cm), Waist (cm), Hips (cm)", "XS, 80–84, 62–66, 88–92", "S, 84–88, 66–70, 92–96", "M, 88–94, 70–76, 96–102", "L, 94–100, 76–82, 102–108", "XL, 100–106, 82–88, 108–114"].join("\n");

export const DEFAULT_MEASURE_TIPS =
  "<p><strong>Bust</strong> — measure around the fullest part of your chest.<br/><strong>Waist</strong> — measure around your natural waistline.<br/><strong>Hips</strong> — measure around the widest part of your hips.</p><p>Between sizes? Size up for a relaxed fit.</p>";

export function SizeTable({ head, rows, caption, className }: { head: string[]; rows: string[][]; caption?: string; className?: string }) {
  if (!rows.length) return null;
  const cols = Math.max(head.length, ...rows.map((r) => r.length));
  return (
    <div className={cn("overflow-x-auto rounded-pai border border-pai-border", className)}>
      <table className="w-full min-w-[420px] border-collapse text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {head.some(Boolean) ? (
          <thead className="bg-pai-muted">
            <tr>
              {Array.from({ length: cols }, (_, i) => (
                <th key={i} scope="col" className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em]">
                  {head[i] ?? ""}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-t border-pai-border">
              {Array.from({ length: cols }, (_, ci) =>
                ci === 0 ? (
                  <th key={ci} scope="row" className="whitespace-nowrap px-4 py-3 font-semibold">
                    {r[ci] ?? ""}
                  </th>
                ) : (
                  <td key={ci} className="whitespace-nowrap px-4 py-3 tabular-nums opacity-85">
                    {r[ci] ?? ""}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Full size-guide body: intro, table, unit note and measuring tips. */
export function SizeGuideBody({ intro, head, rows, note, tips, caption }: { intro?: string; head: string[]; rows: string[][]; note?: string; tips?: string; caption?: string }) {
  return (
    <div className="space-y-5">
      {intro ? <p className="text-sm opacity-80">{intro}</p> : null}
      <SizeTable head={head} rows={rows} caption={caption} />
      {note ? <p className="text-xs opacity-60">{note}</p> : null}
      {tips ? (
        <div className="rounded-pai bg-pai-muted p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em]">How to measure</p>
          <RichText html={tips} className="text-sm opacity-85" />
        </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── section ─────────────────────────── */

export const sizeGuide = defineSection({
  schema: {
    type: "size-guide",
    name: "Size guide",
    category: "content",
    icon: "ruler",
    description: "A size chart shown inline, as a disclosure or in a pop-up. Each block is a row.",
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Size guide" },
      { type: "textarea", id: "intro", label: "Intro", default: "Our pieces are cut for a relaxed, easy fit. Measurements refer to your body, not the garment." },
      { type: "text", id: "columns", label: "Column headings", default: "Size, Bust (cm), Waist (cm), Hips (cm)", info: "Comma separated. The first column is the size name." },
      { type: "text", id: "note", label: "Note under the table", default: "All measurements in centimetres." },
      { type: "richtext", id: "tips", label: "How to measure", default: DEFAULT_MEASURE_TIPS },
      {
        type: "select",
        id: "display",
        label: "Display",
        default: "disclosure",
        options: [
          { value: "inline", label: "Always visible" },
          { value: "disclosure", label: "Expandable (click to open)" },
          { value: "dialog", label: "Button that opens a pop-up" },
        ],
      },
      { type: "text", id: "button_label", label: "Button / disclosure label", default: "View size guide" },
      schemeField("default"),
      paddingField("small"),
    ],
    blocks: [
      {
        type: "row",
        name: "Size row",
        limit: 20,
        settings: [
          { type: "text", id: "size", label: "Size", default: "M" },
          { type: "text", id: "values", label: "Measurements", default: "88–94, 70–76, 96–102", info: "Comma separated, in the same order as the column headings." },
        ],
      },
    ],
    maxBlocks: 20,
    presets: [
      {
        name: "Size guide",
        blocks: [
          { type: "row", settings: { size: "XS", values: "80–84, 62–66, 88–92" } },
          { type: "row", settings: { size: "S", values: "84–88, 66–70, 92–96" } },
          { type: "row", settings: { size: "M", values: "88–94, 70–76, 96–102" } },
          { type: "row", settings: { size: "L", values: "94–100, 76–82, 102–108" } },
          { type: "row", settings: { size: "XL", values: "100–106, 82–88, 108–114" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks }) => {
    const rows = blocks.filter((b) => b.type === "row").map((b) => [str(b.settings.size), ...splitCells(str(b.settings.values))]);
    if (!rows.length) return null;
    const heading = str(s.heading, "Size guide");
    const body = <SizeGuideBody intro={str(s.intro)} head={splitCells(str(s.columns))} rows={rows} note={str(s.note)} tips={str(s.tips)} caption={heading} />;
    const display = str(s.display, "disclosure");
    const label = str(s.button_label, "View size guide");
    return (
      <Section settings={s} width="narrow" ariaLabel={heading}>
        {display === "inline" ? (
          <>
            <h2 className="pai-h3 mb-5">{heading}</h2>
            {body}
          </>
        ) : display === "dialog" ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="pai-h4">{heading}</h2>
            <SizeGuideDialog label={label} title={heading}>
              {body}
            </SizeGuideDialog>
          </div>
        ) : (
          <details className="group border-y border-pai-border">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
              <span>
                <span className="pai-h4 block">{heading}</span>
                <span className="text-sm opacity-65">{label}</span>
              </span>
              <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full border border-pai-border text-lg leading-none transition group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="pb-6">{body}</div>
          </details>
        )}
      </Section>
    );
  },
});
