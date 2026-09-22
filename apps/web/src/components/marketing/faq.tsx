import { Plus } from "lucide-react";
import { cn } from "@pai/ui";
import { JsonLd } from "@/components/site/json-ld";

export type FaqItem = { q: string; a: string };

export function Faq({ items, className, schema = true }: { items: FaqItem[]; className?: string; schema?: boolean }) {
  return (
    <div className={cn("divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white", className)}>
      {items.map((it) => (
        <details key={it.q} className="group px-5 sm:px-6 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-semibold text-slate-900">
            {it.q}
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-open:rotate-45 group-open:bg-brand-600 group-open:text-white">
              <Plus className="size-4" />
            </span>
          </summary>
          <p className="-mt-1 pb-5 pr-10 text-[0.95rem] leading-relaxed text-slate-600">{it.a}</p>
        </details>
      ))}
      {schema && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
          }}
        />
      )}
    </div>
  );
}
