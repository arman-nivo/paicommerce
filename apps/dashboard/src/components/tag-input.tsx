"use client";
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@pai/ui";

export function TagInput({ value, onChange, placeholder = "Add tag and press Enter", suggestions = [], className }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; suggestions?: string[]; className?: string }) {
  const [text, setText] = React.useState("");
  const add = (t: string) => {
    const v = t.trim().replace(/,$/, "");
    if (v && !value.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...value, v]);
    setText("");
  };
  const listId = React.useId();
  return (
    <div className={cn("flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-card px-2 py-1.5 shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/15", className)}>
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} className="text-muted-foreground hover:text-foreground" aria-label={`Remove ${t}`}>
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={text}
        list={suggestions.length ? listId : undefined}
        onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setText(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(text);
          } else if (e.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => text && add(text)}
        placeholder={value.length ? "" : placeholder}
        className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
      />
      {!!suggestions.length && (
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </div>
  );
}
