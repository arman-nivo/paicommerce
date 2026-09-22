"use client";
import * as React from "react";
import { Film, RotateCcw, Upload, X } from "lucide-react";
import { fieldDefault, type SettingField } from "@pai/theme-sdk";
import { Button, cn, Input, Select, Switch, Textarea } from "@pai/ui";
import { ImageField, MediaPickerDialog } from "@/components/media-picker";
import { RichTextEditor } from "@/components/rich-text-editor";
import { FontPicker } from "./font-picker";
import { LinkInput, MenuPicker, ProductListPicker, SlugPicker } from "./pickers";

type ValueField = Exclude<SettingField, { type: "header" }>;

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function isDefault(field: ValueField, value: unknown) {
  const def = fieldDefault(field);
  if (value === undefined || value === null) return true;
  return JSON.stringify(value) === JSON.stringify(def);
}

/** One auto-generated settings control, with label, help text and "reset to default". */
export function SettingControl({ field, value, onChange }: { field: SettingField; value: unknown; onChange: (v: unknown) => void }) {
  if (field.type === "header") {
    return (
      <div className="-mx-4 mt-2 border-t border-border px-4 pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{field.label}</h4>
        {field.info && <p className="mt-1 text-xs text-muted-foreground">{field.info}</p>}
      </div>
    );
  }
  const id = `f-${field.id}`;
  const canReset = !isDefault(field, value);
  const reset = (
    <button
      type="button"
      onClick={() => onChange(fieldDefault(field))}
      className={cn("rounded p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground", !canReset && "invisible")}
      title="Reset to default"
      aria-label={`Reset ${field.label} to default`}
      tabIndex={canReset ? 0 : -1}
    >
      <RotateCcw className="size-3.5" />
    </button>
  );

  if (field.type === "checkbox") {
    return (
      <div className="group/field">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor={id} className="flex-1 cursor-pointer text-sm">
            {field.label}
          </label>
          {reset}
          <Switch id={id} checked={!!value} onChange={(e) => onChange(e.target.checked)} />
        </div>
        {field.info && <p className="mt-1 text-xs text-muted-foreground">{field.info}</p>}
      </div>
    );
  }

  return (
    <div className="group/field space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {field.label}
        </label>
        {reset}
      </div>
      <FieldInput id={id} field={field} value={value} onChange={onChange} />
      {field.info && <p className="text-xs leading-relaxed text-muted-foreground">{field.info}</p>}
    </div>
  );
}

function FieldInput({ id, field, value, onChange }: { id: string; field: ValueField; value: unknown; onChange: (v: unknown) => void }) {
  const str = typeof value === "string" ? value : value == null ? "" : String(value);
  switch (field.type) {
    case "text":
      return <Input id={id} value={str} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />;
    case "textarea":
      return <Textarea id={id} value={str} placeholder={field.placeholder} rows={4} onChange={(e) => onChange(e.target.value)} />;
    case "richtext":
      return <RichTextEditor value={str} onChange={(html) => onChange(html)} minHeight={110} />;
    case "url":
      return <LinkInput value={str} onChange={onChange} placeholder={field.placeholder} />;
    case "image":
      return <ImageField value={str || null} onChange={(u) => onChange(u ?? "")} aspect="aspect-[16/9]" label="Select image" />;
    case "video":
      return <VideoInput id={id} value={str} onChange={onChange} />;
    case "color":
      return <ColorInput id={id} value={str} onChange={onChange} />;
    case "range":
      return <RangeInput id={id} field={field} value={typeof value === "number" ? value : Number(value ?? field.min)} onChange={onChange} />;
    case "number":
      return <NumberInput id={id} min={field.min} max={field.max} value={typeof value === "number" ? value : value == null || value === "" ? null : Number(value)} onChange={onChange} />;
    case "select":
      return (
        <Select id={id} value={str} onChange={(e) => onChange(e.target.value)}>
          {!field.options.some((o) => o.value === str) && <option value={str}>{str || "—"}</option>}
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      );
    case "radio":
      return (
        <div role="radiogroup" id={id} className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
          {field.options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={o.value === str}
              onClick={() => onChange(o.value)}
              className={cn(
                "min-w-0 flex-1 truncate whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition",
                o.value === str ? "bg-card text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      );
    case "font":
      return <FontPicker value={str} onChange={onChange} options={field.options} />;
    case "product":
      return <SlugPicker kind="products" value={str} onChange={onChange} />;
    case "collection":
      return <SlugPicker kind="collections" value={str} onChange={onChange} />;
    case "product_list":
      return <ProductListPicker value={Array.isArray(value) ? (value as string[]).filter((v) => typeof v === "string") : []} onChange={onChange} limit={field.limit} />;
    case "menu":
      return <MenuPicker value={str} onChange={onChange} />;
    case "datetime":
      return <Input id={id} type="datetime-local" value={str.slice(0, 16)} onChange={(e) => onChange(e.target.value)} />;
    case "checkbox":
      return null;
  }
}

/* ─────────────────────────── color ─────────────────────────── */

function ColorInput({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = React.useState(value);
  React.useEffect(() => setText(value), [value]);
  const valid = !text || HEX_RE.test(text);
  const full = HEX_RE.test(value) ? (value.length === 4 ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}` : value) : "#000000";
  return (
    <div>
      <div className={cn("flex h-9 items-center gap-2 rounded-lg border bg-card pl-1 pr-2 shadow-xs focus-within:ring-3 focus-within:ring-ring/15", valid ? "border-input focus-within:border-ring" : "border-red-500")}>
        <label className="relative size-7 shrink-0 cursor-pointer overflow-hidden rounded-md border border-black/10 dark:border-white/15" style={{ background: value || "transparent" }} title="Pick a color">
          {!value && <span className="absolute inset-0 bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%),linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%)] bg-[length:8px_8px] bg-[position:0_0,4px_4px]" />}
          <input type="color" value={full.toLowerCase()} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Color picker" />
        </label>
        <input
          id={id}
          value={text}
          spellCheck={false}
          maxLength={7}
          placeholder="#000000"
          onChange={(e) => {
            let v = e.target.value.trim();
            if (v && !v.startsWith("#")) v = `#${v}`;
            setText(v);
            if (!v || HEX_RE.test(v)) onChange(v.toLowerCase());
          }}
          onBlur={() => !valid && setText(value)}
          className="min-w-0 flex-1 bg-transparent font-mono text-sm uppercase outline-none"
        />
      </div>
      {!valid && <p className="mt-1 text-xs text-red-600">Use a hex color like #1a2b3c.</p>}
    </div>
  );
}

/* ─────────────────────────── range / number ─────────────────────────── */

function RangeInput({ id, field, value, onChange }: { id: string; field: Extract<SettingField, { type: "range" }>; value: number; onChange: (v: number) => void }) {
  const step = field.step ?? 1;
  const clamp = (n: number) => Math.min(field.max, Math.max(field.min, Math.round(n / step) * step));
  const [text, setText] = React.useState(String(value));
  React.useEffect(() => setText(String(value)), [value]);
  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        type="range"
        min={field.min}
        max={field.max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-5 min-w-0 flex-1 cursor-pointer accent-[var(--primary)]"
        aria-valuetext={`${value}${field.unit ?? ""}`}
      />
      <div className="flex h-8 w-[84px] shrink-0 items-center rounded-lg border border-input bg-card pr-2 shadow-xs focus-within:border-ring">
        <input
          value={text}
          inputMode="decimal"
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            const n = Number(text);
            if (Number.isFinite(n) && text !== "") onChange(clamp(n));
            else setText(String(value));
          }}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          className="w-full min-w-0 bg-transparent px-2 text-right text-sm tabular-nums outline-none"
          aria-label="Value"
        />
        {field.unit && <span className="text-xs text-muted-foreground">{field.unit}</span>}
      </div>
    </div>
  );
}

function NumberInput({ id, min, max, value, onChange }: { id: string; min?: number; max?: number; value: number | null; onChange: (v: number) => void }) {
  const [text, setText] = React.useState(value == null || Number.isNaN(value) ? "" : String(value));
  React.useEffect(() => setText(value == null || Number.isNaN(value) ? "" : String(value)), [value]);
  const commit = (raw: string) => {
    const n = Number(raw);
    if (raw === "" || !Number.isFinite(n)) return;
    let v = n;
    if (min != null) v = Math.max(min, v);
    if (max != null) v = Math.min(max, v);
    onChange(v);
  };
  const out = text !== "" && ((min != null && Number(text) < min) || (max != null && Number(text) > max));
  return (
    <div>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value !== "" && Number.isFinite(n) && (min == null || n >= min) && (max == null || n <= max)) onChange(n);
        }}
        onBlur={() => {
          commit(text);
          if (text === "" && value != null) setText(String(value));
        }}
      />
      {out && (
        <p className="mt-1 text-xs text-amber-600">
          Allowed range: {min ?? "−∞"} – {max ?? "∞"}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────── video ─────────────────────────── */

function youtubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  return m?.[1] ?? null;
}

function VideoInput({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const yt = value ? youtubeId(value) : null;
  const vimeo = value && /vimeo\.com/.test(value);
  return (
    <div className="space-y-2">
      {value && (
        <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-black">
          {yt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`https://img.youtube.com/vi/${yt}/hqdefault.jpg`} alt="" className="size-full object-cover" />
          ) : vimeo ? (
            <div className="flex size-full items-center justify-center gap-2 text-sm text-white/80">
              <Film className="size-4" /> Vimeo video
            </div>
          ) : (
            <video src={value} className="size-full object-cover" muted controls preload="metadata" />
          )}
          <button type="button" onClick={() => onChange("")} className="absolute right-1.5 top-1.5 rounded-md bg-black/60 p-1 text-white hover:bg-black/80" aria-label="Remove video">
            <X className="size-3.5" />
          </button>
        </div>
      )}
      <div className="flex gap-1.5">
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value.trim())} placeholder="YouTube, Vimeo or .mp4 URL" />
        <Button type="button" variant="outline" size="icon" onClick={() => setOpen(true)} title="Upload or choose from library" aria-label="Upload video">
          <Upload />
        </Button>
      </div>
      <MediaPickerDialog open={open} onClose={() => setOpen(false)} onSelect={(u) => u[0] && onChange(u[0])} accept="video/*" />
    </div>
  );
}
