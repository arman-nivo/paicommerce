"use client";
import * as React from "react";
import { ArrowLeft, ChevronDown, CircleDot, Eye, EyeOff, MousePointerClick, Palette, RotateCcw, Trash2, TriangleAlert, X } from "lucide-react";
import { fieldDefault, type SectionSchema, type SettingField, type SettingsGroup, type SettingValues, type ThemeConfig } from "@pai/theme-sdk";
import { Button, cn, Kbd } from "@pai/ui";
import { sectionIcon } from "./icons";
import { SettingControl } from "./setting-field";
import { getList, subtitleFrom } from "./state";
import type { Selection } from "./types";

export type InspectorOps = {
  close: () => void;
  select: (sel: Selection) => void;
  setThemeSetting: (id: string, v: unknown) => void;
  setSectionSetting: (sectionId: string, id: string, v: unknown) => void;
  setBlockSetting: (sectionId: string, blockId: string, id: string, v: unknown) => void;
  resetSection: (sectionId: string) => void;
  toggleSection: (sectionId: string) => void;
  removeSection: (sectionId: string) => void;
  toggleBlock: (sectionId: string, blockId: string) => void;
  removeBlock: (sectionId: string, blockId: string) => void;
};

function Fields({ fields, values, onChange }: { fields: SettingField[]; values: SettingValues; onChange: (id: string, v: unknown) => void }) {
  if (!fields.length) return <p className="py-6 text-center text-sm text-muted-foreground">This has no settings to customize.</p>;
  return (
    <div className="space-y-5">
      {fields.map((f, i) =>
        f.type === "header" ? (
          <SettingControl key={`h${i}`} field={f} value={undefined} onChange={() => {}} />
        ) : (
          <SettingControl key={f.id} field={f} value={values[f.id] ?? fieldDefault(f)} onChange={(v) => onChange(f.id, v)} />
        ),
      )}
    </div>
  );
}

function PanelHeader({ icon, title, subtitle, onBack, backLabel, actions }: { icon: React.ReactNode; title: string; subtitle?: string | null; onBack?: () => void; backLabel?: string; actions?: React.ReactNode }) {
  return (
    <div className="shrink-0 border-b border-border px-3 py-2.5">
      {onBack && (
        <button type="button" onClick={onBack} className="mb-1 inline-flex items-center gap-1 rounded px-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3" /> {backLabel ?? "Back"}
        </button>
      )}
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary [&_svg]:size-4">{icon}</span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold">{title}</h2>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}

export function Inspector({
  config,
  selection,
  schemas,
  settingsSchema,
  ops,
}: {
  config: ThemeConfig;
  selection: Selection;
  schemas: Record<string, SectionSchema>;
  settingsSchema: SettingsGroup[];
  ops: InspectorOps;
}) {
  const closeBtn = (
    <button type="button" onClick={ops.close} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close settings" title="Close (Esc)">
      <X className="size-4" />
    </button>
  );

  if (!selection) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
          <MousePointerClick className="size-6" />
        </div>
        <h3 className="text-sm font-semibold">Select a section to customize</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Click a section in the sidebar or directly in the preview. Changes save automatically and only go live when you publish.</p>
        <div className="mt-5 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-1.5">
            <Kbd>⌘</Kbd>
            <Kbd>Z</Kbd> undo · <Kbd>⇧</Kbd>
            <Kbd>⌘</Kbd>
            <Kbd>Z</Kbd> redo
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Kbd>⌘</Kbd>
            <Kbd>S</Kbd> save now · <Kbd>Esc</Kbd> deselect
          </div>
        </div>
      </div>
    );
  }

  if (selection.kind === "theme") {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <PanelHeader icon={<Palette />} title="Theme settings" subtitle="Colors, fonts and layout used across your store" actions={closeBtn} />
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          {settingsSchema.map((g, i) => (
            <SettingsAccordion key={g.name} group={g} defaultOpen={i === selection.group} values={config.settings} onChange={ops.setThemeSetting} />
          ))}
          {!settingsSchema.length && <p className="p-6 text-center text-sm text-muted-foreground">This theme has no global settings.</p>}
        </div>
      </div>
    );
  }

  const list = getList(config, selection.list);
  const inst = list.sections[selection.sectionId];
  if (!inst) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
        This section no longer exists.
        <Button variant="link" onClick={ops.close}>
          Close
        </Button>
      </div>
    );
  }
  const schema = schemas[inst.type];
  const Icon = schema ? sectionIcon(schema.icon, schema.category) : TriangleAlert;

  if (selection.kind === "block") {
    const block = inst.blocks?.find((b) => b.id === selection.blockId);
    const bs = schema?.blocks?.find((b) => b.type === block?.type);
    if (!block) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
          This block no longer exists.
          <Button variant="link" onClick={() => ops.select({ kind: "section", list: selection.list, sectionId: selection.sectionId })}>
            Back to section
          </Button>
        </div>
      );
    }
    return (
      <div className="flex h-full min-h-0 flex-col">
        <PanelHeader
          icon={<CircleDot />}
          title={bs?.name ?? block.type}
          subtitle={subtitleFrom(block.settings)}
          onBack={() => ops.select({ kind: "section", list: selection.list, sectionId: selection.sectionId })}
          backLabel={schema?.name ?? "Section"}
          actions={
            <>
              <button
                type="button"
                onClick={() => ops.toggleBlock(selection.sectionId, block.id)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                title={block.disabled ? "Show block" : "Hide block"}
                aria-label={block.disabled ? "Show block" : "Hide block"}
              >
                {block.disabled ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
              {closeBtn}
            </>
          }
        />
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
          {block.disabled && <HiddenNotice what="block" onShow={() => ops.toggleBlock(selection.sectionId, block.id)} />}
          {bs ? (
            <Fields fields={bs.settings} values={block.settings} onChange={(id, v) => ops.setBlockSetting(selection.sectionId, block.id, id, v)} />
          ) : (
            <p className="text-sm text-muted-foreground">This block type isn&apos;t supported by the theme anymore. You can remove it.</p>
          )}
        </div>
        <div className="shrink-0 border-t border-border p-2">
          <Button variant="ghost" size="sm" className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10" onClick={() => ops.removeBlock(selection.sectionId, block.id)}>
            <Trash2 /> Remove block
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PanelHeader
        icon={<Icon />}
        title={schema?.name ?? "Unknown section"}
        subtitle={subtitleFrom(inst.settings) ?? schema?.description}
        actions={
          <>
            <button
              type="button"
              onClick={() => ops.toggleSection(selection.sectionId)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              title={inst.disabled ? "Show section" : "Hide section"}
              aria-label={inst.disabled ? "Show section" : "Hide section"}
            >
              {inst.disabled ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
            {closeBtn}
          </>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
        {inst.disabled && <HiddenNotice what="section" onShow={() => ops.toggleSection(selection.sectionId)} />}
        {schema ? (
          <Fields fields={schema.settings} values={inst.settings} onChange={(id, v) => ops.setSectionSetting(selection.sectionId, id, v)} />
        ) : (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            The section type “{inst.type}” isn&apos;t part of this theme, so it won&apos;t show on your store. You can safely remove it.
          </div>
        )}
        {!!inst.blocks?.length && schema?.blocks?.length ? (
          <div className="mt-6 border-t border-border pt-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Blocks ({inst.blocks.length})</h4>
            <div className="space-y-1">
              {inst.blocks.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => ops.select({ kind: "block", list: selection.list, sectionId: selection.sectionId, blockId: b.id })}
                  className={cn("flex w-full items-center gap-2 rounded-lg border border-border px-2.5 py-2 text-left text-sm hover:bg-muted", b.disabled && "opacity-55")}
                >
                  <CircleDot className="size-3.5 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{subtitleFrom(b.settings) ?? schema.blocks?.find((x) => x.type === b.type)?.name ?? b.type}</span>
                  <ChevronDown className="size-3.5 -rotate-90 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex shrink-0 gap-1 border-t border-border p-2">
        {schema && (
          <Button variant="ghost" size="sm" className="flex-1" onClick={() => ops.resetSection(selection.sectionId)} title="Reset all settings of this section to their defaults">
            <RotateCcw /> Reset
          </Button>
        )}
        <Button variant="ghost" size="sm" className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10" onClick={() => ops.removeSection(selection.sectionId)}>
          <Trash2 /> Remove section
        </Button>
      </div>
    </div>
  );
}

function HiddenNotice({ what, onShow }: { what: string; onShow: () => void }) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
      <EyeOff className="size-3.5 shrink-0" />
      <span className="flex-1">This {what} is hidden on your store.</span>
      <button type="button" onClick={onShow} className="font-medium text-primary hover:underline">
        Show
      </button>
    </div>
  );
}

function SettingsAccordion({ group, defaultOpen, values, onChange }: { group: SettingsGroup; defaultOpen: boolean; values: SettingValues; onChange: (id: string, v: unknown) => void }) {
  const [open, setOpen] = React.useState(defaultOpen);
  React.useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);
  const colors = group.settings.filter((f) => f.type === "color").slice(0, 6);
  return (
    <div className="border-b border-border">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium hover:bg-muted/50" aria-expanded={open}>
        <span className="flex-1">{group.name}</span>
        {!open && colors.length > 0 && (
          <span className="flex -space-x-1">
            {colors.map((c) => (
              <span key={c.id} className="size-4 rounded-full border-2 border-card" style={{ background: String(values[c.id!] ?? (c.type === "color" ? c.default : "") ?? "#fff") }} />
            ))}
          </span>
        )}
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-4 pb-5 pt-1">
          <Fields fields={group.settings} values={values} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
