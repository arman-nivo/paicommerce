import { Check, Minus } from "lucide-react";
import { cn } from "@pai/ui";
import { COMPARISON, type CompareValue } from "@/lib/content";
import { LogoMark } from "@/components/site/logo";

function Cell({ v, highlight }: { v: CompareValue; highlight?: boolean }) {
  if (v === true)
    return (
      <span className={cn("inline-flex size-6 items-center justify-center rounded-full", highlight ? "bg-brand-600 text-white" : "bg-emerald-50 text-emerald-600")}>
        <Check className="size-3.5" strokeWidth={3} />
        <span className="sr-only">Yes</span>
      </span>
    );
  if (v === false)
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Minus className="size-3.5" />
        <span className="sr-only">No</span>
      </span>
    );
  return <span className="text-xs font-medium text-slate-500">{v}</span>;
}

export function ComparisonTable() {
  const cols = [
    { key: "pai", label: "PaiCommerce" },
    { key: "shopify", label: "Shopify" },
    { key: "woo", label: "WooCommerce" },
    { key: "local", label: "Typical local builders" },
  ] as const;
  return (
    <div className="relative overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-left text-sm">
        <caption className="sr-only">PaiCommerce compared with Shopify, WooCommerce and local store builders</caption>
        <thead>
          <tr className="border-b border-slate-200">
            <th scope="col" className="w-[34%] px-6 py-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Capability</th>
            {cols.map((c) => (
              <th key={c.key} scope="col" className={cn("px-4 py-5 text-center font-semibold", c.key === "pai" ? "bg-brand-50/60 text-brand-700" : "text-slate-700")}>
                {c.key === "pai" ? (
                  <span className="inline-flex items-center gap-2">
                    <LogoMark className="size-6" /> {c.label}
                  </span>
                ) : (
                  c.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON.map((row) => (
            <tr key={row.feature} className="border-b border-slate-100 last:border-0">
              <th scope="row" className="px-6 py-3.5 font-medium text-slate-700">{row.feature}</th>
              {cols.map((c) => (
                <td key={c.key} className={cn("px-4 py-3.5 text-center", c.key === "pai" && "bg-brand-50/60")}>
                  <Cell v={row[c.key]} highlight={c.key === "pai"} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
