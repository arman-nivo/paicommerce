"use client";
import * as React from "react";
import {
  ArrowLeft,
  Check,
  CloudAlert,
  Ellipsis,
  ExternalLink,
  Eye,
  Keyboard,
  LoaderCircle,
  Monitor,
  Redo2,
  RotateCcw,
  Smartphone,
  Sparkles,
  Store,
  Tablet,
  Undo2,
  Upload,
} from "lucide-react";
import { TEMPLATE_TYPES, type TemplateType } from "@pai/theme-sdk";
import { Badge, Button, cn, Dropdown, DropdownItem, DropdownLabel, Select, Tooltip } from "@pai/ui";
import type { SaveStatus, Viewport } from "./types";

const TEMPLATE_GROUPS: { label: string; ids: TemplateType[] }[] = [
  { label: "Pages", ids: ["index", "page", "404"] },
  { label: "Shopping", ids: ["product", "collection", "collections", "search", "cart"] },
  { label: "Blog", ids: ["blog", "article"] },
  { label: "Customers", ids: ["account"] },
];

export function TemplatePicker({ value, onChange, counts, className }: { value: TemplateType; onChange: (t: TemplateType) => void; counts: Partial<Record<TemplateType, number>>; className?: string }) {
  const label = (id: TemplateType) => {
    const t = TEMPLATE_TYPES.find((x) => x.id === id);
    const n = counts[id];
    return `${t?.label ?? id}${n != null ? ` · ${n} section${n === 1 ? "" : "s"}` : ""}`;
  };
  const known = new Set(TEMPLATE_GROUPS.flatMap((g) => g.ids));
  const others = TEMPLATE_TYPES.filter((t) => !known.has(t.id));
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value as TemplateType)} className={cn("h-8 font-medium", className)} aria-label="Page template to edit">
      {TEMPLATE_GROUPS.map((g) => (
        <optgroup key={g.label} label={g.label}>
          {g.ids.map((id) => (
            <option key={id} value={id}>
              {label(id)}
            </option>
          ))}
        </optgroup>
      ))}
      {others.map((t) => (
        <option key={t.id} value={t.id}>
          {label(t.id)}
        </option>
      ))}
    </Select>
  );
}

export function SaveIndicator({ status, onRetry, compact }: { status: SaveStatus; onRetry: () => void; compact?: boolean }) {
  const map = {
    saved: { icon: <Check className="size-3.5" />, text: "All changes saved", cls: "text-muted-foreground" },
    saving: { icon: <LoaderCircle className="size-3.5 animate-spin" />, text: "Saving…", cls: "text-muted-foreground" },
    unsaved: { icon: <span className="size-1.5 rounded-full bg-amber-500" />, text: "Unsaved", cls: "text-amber-700 dark:text-amber-400" },
    error: { icon: <CloudAlert className="size-3.5" />, text: "Couldn't save", cls: "text-red-600" },
  }[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap text-xs", map.cls)} role="status" aria-live="polite">
      <span className="flex size-3.5 items-center justify-center">{map.icon}</span>
      {!compact && map.text}
      {status === "error" && (
        <button type="button" onClick={onRetry} className="font-medium underline underline-offset-2">
          Retry
        </button>
      )}
    </span>
  );
}

export function ViewportToggle({ value, onChange }: { value: Viewport; onChange: (v: Viewport) => void }) {
  const items: { v: Viewport; icon: React.ReactNode; label: string }[] = [
    { v: "desktop", icon: <Monitor />, label: "Desktop" },
    { v: "tablet", icon: <Tablet />, label: "Tablet" },
    { v: "mobile", icon: <Smartphone />, label: "Mobile" },
  ];
  return (
    <div className="flex items-center rounded-lg bg-muted p-0.5" role="radiogroup" aria-label="Preview size">
      {items.map((i) => (
        <Tooltip key={i.v} label={i.label} side="bottom">
          <button
            type="button"
            role="radio"
            aria-checked={value === i.v}
            aria-label={i.label}
            onClick={() => onChange(i.v)}
            className={cn("flex h-7 w-8 items-center justify-center rounded-md transition [&_svg]:size-4", value === i.v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            {i.icon}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}

export type TopBarProps = {
  name: string;
  live: boolean;
  hasUnpublished: boolean;
  status: SaveStatus;
  template: TemplateType;
  onTemplate: (t: TemplateType) => void;
  templateCounts: Partial<Record<TemplateType, number>>;
  viewport: Viewport;
  onViewport: (v: Viewport) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onPublish: () => void;
  publishing: boolean;
  onExit: () => void;
  onPresets: (() => void) | null;
  previewUrl: string;
  storeUrl: string;
  onDiscard: (() => void) | null;
  onResetDefaults: () => void;
  onShortcuts: () => void;
};

export function TopBar(p: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-2 sm:px-3">
      <Button variant="ghost" size="sm" onClick={p.onExit} className="shrink-0 px-2" aria-label="Exit editor">
        <ArrowLeft /> <span className="hidden sm:inline">Exit</span>
      </Button>
      <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
      <div className="flex min-w-0 items-center gap-2">
        <span className="hidden max-w-[180px] truncate text-sm font-semibold md:inline" title={p.name}>
          {p.name}
        </span>
        <Badge tone={p.live ? "green" : "gray"} dot className="hidden sm:inline-flex">
          {p.live ? "Live" : "Draft"}
        </Badge>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-1">
        <TemplatePicker value={p.template} onChange={p.onTemplate} counts={p.templateCounts} className="w-full max-w-[240px]" />
        <div className="hidden lg:block">
          <ViewportToggle value={p.viewport} onChange={p.onViewport} />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <div className="hidden items-center md:flex">
          <Tooltip label="Undo (⌘Z)" side="bottom">
            <Button variant="ghost" size="icon-sm" onClick={p.onUndo} disabled={!p.canUndo} aria-label="Undo">
              <Undo2 />
            </Button>
          </Tooltip>
          <Tooltip label="Redo (⇧⌘Z)" side="bottom">
            <Button variant="ghost" size="icon-sm" onClick={p.onRedo} disabled={!p.canRedo} aria-label="Redo">
              <Redo2 />
            </Button>
          </Tooltip>
        </div>
        <div className="mx-1 hidden xl:block">
          <SaveIndicator status={p.status} onRetry={p.onSave} />
        </div>
        <div className="mx-1 xl:hidden">
          <SaveIndicator status={p.status} onRetry={p.onSave} compact />
        </div>
        <Dropdown
          trigger={
            <Button variant="ghost" size="icon-sm" aria-label="More actions">
              <Ellipsis />
            </Button>
          }
          className="w-64"
        >
          <div className="md:hidden">
            <DropdownItem icon={<Undo2 />} onClick={p.onUndo} disabled={!p.canUndo} className="disabled:opacity-40">
              Undo
            </DropdownItem>
            <DropdownItem icon={<Redo2 />} onClick={p.onRedo} disabled={!p.canRedo} className="disabled:opacity-40">
              Redo
            </DropdownItem>
            <div className="my-1 h-px bg-border" />
          </div>
          <div className="lg:hidden">
            <DropdownLabel>Preview size</DropdownLabel>
            <DropdownItem icon={<Monitor />} onClick={() => p.onViewport("desktop")}>
              Desktop {p.viewport === "desktop" && <Check className="ml-auto" />}
            </DropdownItem>
            <DropdownItem icon={<Tablet />} onClick={() => p.onViewport("tablet")}>
              Tablet {p.viewport === "tablet" && <Check className="ml-auto" />}
            </DropdownItem>
            <DropdownItem icon={<Smartphone />} onClick={() => p.onViewport("mobile")}>
              Mobile {p.viewport === "mobile" && <Check className="ml-auto" />}
            </DropdownItem>
            <div className="my-1 h-px bg-border" />
          </div>
          {p.onPresets && (
            <DropdownItem icon={<Sparkles />} onClick={p.onPresets}>
              Change style preset…
            </DropdownItem>
          )}
          <DropdownItem icon={<Eye />} onClick={() => window.open(p.previewUrl, "_blank", "noopener")}>
            Open preview in new tab <ExternalLink className="ml-auto opacity-50" />
          </DropdownItem>
          <DropdownItem icon={<Store />} onClick={() => window.open(p.storeUrl, "_blank", "noopener")}>
            View live store <ExternalLink className="ml-auto opacity-50" />
          </DropdownItem>
          <DropdownItem icon={<Keyboard />} onClick={p.onShortcuts}>
            Keyboard shortcuts
          </DropdownItem>
          <div className="my-1 h-px bg-border" />
          {p.onDiscard && (
            <DropdownItem icon={<RotateCcw />} onClick={p.onDiscard}>
              Discard unpublished changes
            </DropdownItem>
          )}
          <DropdownItem icon={<RotateCcw />} danger onClick={p.onResetDefaults}>
            Reset to theme defaults
          </DropdownItem>
        </Dropdown>
        <Button variant="outline" size="sm" onClick={p.onSave} disabled={p.status === "saved" || p.status === "saving"} className="hidden sm:inline-flex">
          Save
        </Button>
        <Button size="sm" onClick={p.onPublish} loading={p.publishing} className="relative">
          {!p.publishing && <Upload className="sm:hidden" />}
          <span className="hidden sm:inline">Publish</span>
          {p.hasUnpublished && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-card bg-amber-500" title="Unpublished changes" />}
        </Button>
      </div>
    </header>
  );
}
