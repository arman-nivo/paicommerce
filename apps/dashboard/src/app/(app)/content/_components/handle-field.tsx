"use client";
import { slugify } from "@pai/core";
import { Field } from "@pai/ui";

/** URL handle input with the store URL shown as a prefix. */
export function HandleField({ value, onChange, prefix, auto, hint }: { value: string; onChange: (v: string, touched: boolean) => void; prefix: string; auto?: boolean; hint?: string }) {
  return (
    <Field label="URL handle" hint={hint ?? (auto ? "Generated from the title. Edit it to customise the link." : "Lowercase letters, numbers and dashes. If it's taken, we'll add -2.")}>
      <div className="flex min-w-0 items-center overflow-hidden rounded-lg border border-input bg-card shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/15">
        <span className="max-w-[55%] shrink-0 truncate border-r border-border bg-muted px-2.5 py-2 text-xs text-muted-foreground" title={prefix}>
          {prefix}
        </span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/\s+/g, "-"), true)}
          onBlur={() => value && onChange(slugify(value), true)}
          className="h-9 min-w-0 flex-1 bg-transparent px-2.5 text-sm outline-none"
          placeholder="my-page"
        />
      </div>
    </Field>
  );
}
