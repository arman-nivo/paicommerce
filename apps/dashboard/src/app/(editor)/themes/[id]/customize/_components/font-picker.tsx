"use client";
import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { FONT_CHOICES, googleFontsUrl } from "@pai/theme-sdk";
import { cn, Input } from "@pai/ui";

const loaded = new Set<string>();

/** Inject Google Fonts stylesheets (once per URL) so font names can be previewed in their own face. */
export function useGoogleFonts(families: string[], enabled = true) {
  const key = families.join("|");
  React.useEffect(() => {
    if (!enabled || !key) return;
    const list = key.split("|");
    // Chunk to keep URLs reasonably short.
    for (let i = 0; i < list.length; i += 12) {
      const url = googleFontsUrl(list.slice(i, i + 12));
      if (!url || loaded.has(url)) continue;
      loaded.add(url);
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.dataset.paiFonts = "1";
      document.head.appendChild(link);
    }
  }, [key, enabled]);
}

export function FontPicker({ value, onChange, options }: { value: string; onChange: (v: string) => void; options?: string[] }) {
  const fonts = options?.length ? options : FONT_CHOICES;
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);
  useGoogleFonts(value ? [value] : []);
  useGoogleFonts(fonts, open);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const filtered = fonts.filter((f) => f.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center gap-3 rounded-lg border border-input bg-card px-3 text-left shadow-xs transition hover:bg-muted/50 focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/15"
      >
        <span className="text-xl leading-none" style={{ fontFamily: `"${value}", system-ui` }}>
          Aa
        </span>
        <span className="flex-1 truncate text-sm" style={{ fontFamily: `"${value}", system-ui` }}>
          {value || "System default"}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-40 mt-1 animate-fade-in rounded-xl border border-border bg-card p-1 shadow-xl">
          <div className="relative p-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search fonts" className="h-8 pl-8" />
          </div>
          <div className="max-h-72 overflow-y-auto scrollbar-thin" role="listbox">
            {filtered.map((f) => (
              <button
                key={f}
                type="button"
                role="option"
                aria-selected={f === value}
                onClick={() => {
                  onChange(f);
                  setOpen(false);
                  setQ("");
                }}
                className={cn("flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-muted", f === value && "bg-accent")}
              >
                <span className="flex-1 truncate text-[15px]" style={{ fontFamily: `"${f}", system-ui` }}>
                  {f}
                </span>
                {f === value && <Check className="size-4 text-primary" />}
              </button>
            ))}
            {!filtered.length && <div className="px-3 py-4 text-sm text-muted-foreground">No fonts match “{q}”.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
