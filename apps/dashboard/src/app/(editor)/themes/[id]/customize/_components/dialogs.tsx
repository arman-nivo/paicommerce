"use client";
import * as React from "react";
import { Check, Globe, Sparkles, TriangleAlert } from "lucide-react";
import { BUSINESS_CATEGORIES } from "@pai/theme-sdk";
import { Button, cn, Dialog, Kbd } from "@pai/ui";
import type { EditorPreset } from "./types";

export function PublishDialog({
  open,
  onClose,
  onConfirm,
  publishing,
  isLive,
  themeName,
  liveThemeName,
  storeUrl,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  publishing: boolean;
  isLive: boolean;
  themeName: string;
  liveThemeName: string | null;
  storeUrl: string;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title={isLive ? "Publish changes?" : `Publish “${themeName}”?`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={publishing}>
            Cancel
          </Button>
          <Button onClick={onConfirm} loading={publishing}>
            {isLive ? "Publish changes" : "Publish theme"}
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        {isLive ? (
          <p className="text-muted-foreground">Your customers will see these changes right away on your online store.</p>
        ) : (
          <>
            <p className="text-muted-foreground">
              This theme will replace {liveThemeName ? <strong className="text-foreground">“{liveThemeName}”</strong> : "your current live theme"} as the design of your online store. Customers will see it immediately.
            </p>
            {liveThemeName && (
              <div className="flex gap-2 rounded-lg border border-amber-300/60 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                <TriangleAlert className="mt-px size-3.5 shrink-0" />
                “{liveThemeName}” stays in your theme library, so you can switch back at any time.
              </div>
            )}
          </>
        )}
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Globe className="size-3.5 shrink-0" />
          <span className="truncate font-mono">{storeUrl.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    </Dialog>
  );
}

export function PresetsDialog({
  open,
  onClose,
  presets,
  currentId,
  onApply,
  applying,
}: {
  open: boolean;
  onClose: () => void;
  presets: EditorPreset[];
  currentId: string | null;
  onApply: (id: string) => void;
  applying: string | null;
}) {
  const label = (c: string) => BUSINESS_CATEGORIES.find((b) => b.id === c)?.label ?? c;
  return (
    <Dialog open={open} onClose={onClose} size="lg" title="Style presets" description="Start from a ready-made look for your kind of business. Applying a preset replaces your current customizations (you can undo).">
      <div className="grid gap-3 sm:grid-cols-2">
        {presets.map((p) => {
          const current = p.id === currentId;
          const swatches = ["color_background", "color_primary", "color_accent", "color_foreground"].map((k) => p.settings?.[k]).filter((v): v is string => typeof v === "string");
          return (
            <div key={p.id} className={cn("flex flex-col overflow-hidden rounded-xl border bg-card", current ? "border-primary ring-2 ring-primary/15" : "border-border")}>
              <div className="relative aspect-[16/9] bg-muted">
                {p.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.thumbnail} alt="" className="size-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex size-full items-center justify-center gap-1.5">
                    {swatches.length ? swatches.map((c, i) => <span key={i} className="size-8 rounded-full border border-black/10 shadow-sm" style={{ background: c }} />) : <Sparkles className="size-8 text-muted-foreground/50" />}
                  </div>
                )}
                {current && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-medium text-primary-foreground">
                    <Check className="size-3" /> Current
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-3">
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{label(p.category)}</div>
                {p.description && <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
                <Button size="sm" variant={current ? "outline" : "default"} className="mt-3 self-start" loading={applying === p.id} disabled={!!applying} onClick={() => onApply(p.id)}>
                  {current ? "Re-apply" : "Apply preset"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Dialog>
  );
}

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const rows: [string[], string][] = [
    [["⌘", "Z"], "Undo"],
    [["⇧", "⌘", "Z"], "Redo (also ⌘Y)"],
    [["⌘", "S"], "Save now"],
    [["Esc"], "Deselect / close settings"],
    [["Delete"], "Remove the selected section"],
  ];
  return (
    <Dialog open={open} onClose={onClose} size="sm" title="Keyboard shortcuts">
      <div className="divide-y divide-border">
        {rows.map(([keys, label]) => (
          <div key={label} className="flex items-center justify-between py-2 text-sm">
            <span>{label}</span>
            <span className="flex gap-1">
              {keys.map((k) => (
                <Kbd key={k}>{k}</Kbd>
              ))}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">On Windows use Ctrl instead of ⌘.</p>
    </Dialog>
  );
}
