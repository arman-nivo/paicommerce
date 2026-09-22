"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, Layers, SlidersHorizontal } from "lucide-react";
import { applyDefaults, generateId, instantiateSection, TEMPLATE_TYPES, type SectionSchema, type TemplateType, type ThemeConfig } from "@pai/theme-sdk";
import { isPreviewMessage, type EditorToPreview } from "@pai/theme-sdk/preview-protocol";
import { cn, toast, useConfirm } from "@pai/ui";
import { run } from "@/lib/client";
import { applyThemePreset, publishTheme, resetTheme, saveDraft } from "../actions";
import { AddSectionDialog } from "./add-section-dialog";
import { PresetsDialog, PublishDialog, ShortcutsDialog } from "./dialogs";
import { Inspector, type InspectorOps } from "./inspector";
import { PreviewFrame } from "./preview-frame";
import { SectionTree, type TreeOps } from "./section-tree";
import {
  cloneSection,
  editorReducer,
  getList,
  initEditorState,
  insertSection,
  moveInArray,
  removeSection,
  reorderBlocks,
  reorderSections,
  updateBlock,
  updateList,
  updateSection,
} from "./state";
import { TopBar } from "./top-bar";
import type { EditorData, ListRef, SaveStatus, Selection, Viewport } from "./types";

const SAVE_DEBOUNCE_MS = 400;
const NAV_FALLBACK_MS = 1500;
type MobileTab = "sections" | "settings" | "preview";

const HEADER: ListRef = { kind: "group", key: "header" };
const FOOTER: ListRef = { kind: "group", key: "footer" };

const isNarrow = () => typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;

export function Customizer({ data }: { data: EditorData }) {
  const router = useRouter();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [state, dispatch] = React.useReducer(editorReducer, data.config, initEditorState);
  const config = state.config;
  const schemas = React.useMemo(() => Object.fromEntries(data.sectionSchemas.map((s) => [s.type, s])) as Record<string, SectionSchema>, [data.sectionSchemas]);

  const [template, setTemplate] = React.useState<TemplateType>("index");
  const [selection, setSelection] = React.useState<Selection>(null);
  const [viewport, setViewport] = React.useState<Viewport>("desktop");
  const [mobileTab, setMobileTab] = React.useState<MobileTab>("sections");
  const [storeTheme, setStoreTheme] = React.useState(data.storeTheme);
  const [status, setStatus] = React.useState<SaveStatus>("saved");
  const [publishing, setPublishing] = React.useState(false);
  const [publishOpen, setPublishOpen] = React.useState(false);
  const [presetsOpen, setPresetsOpen] = React.useState(false);
  const [applyingPreset, setApplyingPreset] = React.useState<string | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const [addTarget, setAddTarget] = React.useState<ListRef | null>(null);

  /* ─────────────── preview frame ─────────────── */

  const previewBase = `${data.storefrontUrl}/preview/${data.previewToken}`;
  const srcFor = React.useCallback((path: string) => previewBase + (path === "/" ? "" : path), [previewBase]);
  const [frame, setFrame] = React.useState(() => ({ src: srcFor(data.templatePaths.index), loaded: false, readyMsg: false, reloadKey: 0 }));
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const protocolAlive = React.useRef(false);
  const navAck = React.useRef(true);
  const navTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const origin = React.useMemo(() => {
    try {
      return new URL(data.storefrontUrl).origin;
    } catch {
      return "*";
    }
  }, [data.storefrontUrl]);

  const post = React.useCallback(
    (msg: EditorToPreview) => {
      try {
        iframeRef.current?.contentWindow?.postMessage(msg, origin);
      } catch {
        /* frame not ready / different origin (error page) */
      }
    },
    [origin],
  );

  const loadPath = React.useCallback((path: string) => setFrame((f) => ({ src: srcFor(path), loaded: false, readyMsg: false, reloadKey: f.reloadKey + 1 })), [srcFor]);

  /* ─────────────── latest values for async callbacks ─────────────── */

  const latest = React.useRef({ state, selection, template });
  latest.current = { state, selection, template };

  /* ─────────────── saving ─────────────── */

  const savedVersion = React.useRef(0);
  const markSaved = React.useRef(-1);
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inflight = React.useRef<Promise<boolean> | null>(null);
  const lastError = React.useRef<string | null>(null);

  const selectedSectionId = (sel: Selection) => (sel && (sel.kind === "section" || sel.kind === "block") ? sel.sectionId : null);

  const flush = React.useCallback((): Promise<boolean> => {
    clearTimeout(saveTimer.current);
    if (inflight.current) {
      // Chain: once the running save finishes, save whatever changed in the meantime.
      return inflight.current.then((ok) => (ok && latest.current.state.version !== savedVersion.current ? flush() : ok));
    }
    if (latest.current.state.version === savedVersion.current) return Promise.resolve(true);
    const p = (async () => {
      try {
        while (latest.current.state.version !== savedVersion.current) {
          const { config: cfg, version } = latest.current.state;
          setStatus("saving");
          let res: Awaited<ReturnType<typeof saveDraft>>;
          try {
            res = await saveDraft({ storeThemeId: data.storeTheme.id, config: cfg });
          } catch (e) {
            res = { ok: false, error: (e as Error)?.message || "Network error — check your connection." };
          }
          if (!res.ok) {
            if (lastError.current !== res.error) toast.error(`Couldn't save: ${res.error}`);
            lastError.current = res.error;
            setStatus("error");
            return false;
          }
          lastError.current = null;
          savedVersion.current = version;
          setStoreTheme((s) => (s.hasDraft ? s : { ...s, hasDraft: true }));
          post({ source: "pai-editor", type: "refresh" });
          post({ source: "pai-editor", type: "select-section", sectionId: selectedSectionId(latest.current.selection) });
        }
        setStatus("saved");
        return true;
      } finally {
        inflight.current = null;
      }
    })();
    inflight.current = p;
    return p;
  }, [data.storeTheme.id, post]);

  React.useEffect(() => {
    if (state.version === markSaved.current) {
      savedVersion.current = state.version;
      setStatus("saved");
      return;
    }
    if (state.version === savedVersion.current) return;
    setStatus((s) => (s === "saving" ? s : "unsaved"));
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void flush(), SAVE_DEBOUNCE_MS);
  }, [state.version, flush]);

  React.useEffect(() => () => clearTimeout(saveTimer.current), []);

  // Warn before closing the tab with unsaved changes.
  React.useEffect(() => {
    if (status === "saved") return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [status]);

  /** Replace the whole config with one the server already stored (reset / preset). */
  const replaceConfig = React.useCallback((cfg: ThemeConfig) => {
    clearTimeout(saveTimer.current);
    markSaved.current = latest.current.state.version + 1;
    dispatch({ type: "replace", config: cfg, undoable: true });
  }, []);

  /* ─────────────── editing helpers ─────────────── */

  const update = React.useCallback((fn: (c: ThemeConfig) => ThemeConfig, key?: string) => dispatch({ type: "update", update: fn, key, at: Date.now() }), []);
  const undo = React.useCallback(() => dispatch({ type: "undo" }), []);
  const redo = React.useCallback(() => dispatch({ type: "redo" }), []);

  const select = React.useCallback((sel: Selection) => {
    setSelection(sel);
    if (sel && isNarrow()) setMobileTab("settings");
  }, []);

  // Keep the preview's highlighted section in sync with the selection.
  const selId = selectedSectionId(selection);
  React.useEffect(() => {
    post({ source: "pai-editor", type: "select-section", sectionId: selId });
  }, [selId, post]);

  // Drop a selection that no longer exists (e.g. after undo).
  React.useEffect(() => {
    if (!selection || selection.kind === "theme") return;
    const inst = getList(config, selection.list).sections[selection.sectionId];
    if (!inst) setSelection(null);
    else if (selection.kind === "block" && !inst.blocks?.some((b) => b.id === selection.blockId)) setSelection({ kind: "section", list: selection.list, sectionId: selection.sectionId });
  }, [config, selection]);

  const sectionName = (list: ListRef, id: string) => {
    const inst = getList(latest.current.state.config, list).sections[id];
    return (inst && schemas[inst.type]?.name) || "this section";
  };

  const confirmRemoveSection = React.useCallback(
    async (list: ListRef, id: string) => {
      const ok = await confirm({ title: `Remove “${sectionName(list, id)}”?`, description: "The section and its content will be removed from this page. You can undo with ⌘Z.", confirmLabel: "Remove", danger: true });
      if (!ok) return;
      update((c) => removeSection(c, list, id));
      setSelection((s) => (s && s.kind !== "theme" && s.sectionId === id ? null : s));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [confirm, update],
  );

  const changeTemplate = React.useCallback(
    (t: TemplateType, fromPreview = false) => {
      setTemplate(t);
      setSelection((s) => (s && s.kind !== "theme" && s.list.kind === "template" && s.list.key !== t ? null : s));
      if (fromPreview) return;
      const path = data.templatePaths[t] ?? "/";
      clearTimeout(navTimer.current);
      if (protocolAlive.current) {
        navAck.current = false;
        post({ source: "pai-editor", type: "navigate", path });
        navTimer.current = setTimeout(() => !navAck.current && loadPath(path), NAV_FALLBACK_MS);
      } else {
        loadPath(path);
      }
    },
    [data.templatePaths, post, loadPath],
  );

  /** Select a section by id wherever it lives (used for clicks inside the preview). */
  const selectById = React.useCallback(
    (id: string, group?: string) => {
      const { state: st, template: tpl } = latest.current;
      const c = st.config;
      const candidates: ListRef[] = [];
      if (group === "header" || group === "footer") candidates.push({ kind: "group", key: group });
      candidates.push(HEADER, FOOTER, { kind: "template", key: tpl });
      for (const t of TEMPLATE_TYPES) if (t.id !== tpl) candidates.push({ kind: "template", key: t.id });
      const hit = candidates.find((ref) => !!getList(c, ref).sections[id]);
      if (!hit) return;
      if (hit.kind === "template" && hit.key !== tpl) changeTemplate(hit.key, true);
      select({ kind: "section", list: hit, sectionId: id });
    },
    [changeTemplate, select],
  );

  /* ─────────────── preview messages ─────────────── */

  React.useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (origin !== "*" && e.origin !== origin) return;
      if (iframeRef.current && e.source !== iframeRef.current.contentWindow) return;
      if (!isPreviewMessage(e.data)) return;
      protocolAlive.current = true;
      const m = e.data;
      const known = (t: string): t is TemplateType => TEMPLATE_TYPES.some((x) => x.id === t);
      if (m.type === "ready") {
        navAck.current = true;
        setFrame((f) => ({ ...f, loaded: true, readyMsg: true }));
        if (known(m.template) && m.template !== latest.current.template) changeTemplate(m.template, true);
        post({ source: "pai-editor", type: "select-section", sectionId: selectedSectionId(latest.current.selection) });
      } else if (m.type === "navigated") {
        navAck.current = true;
        if (known(m.template) && m.template !== latest.current.template) changeTemplate(m.template, true);
      } else if (m.type === "section-click") {
        selectById(m.sectionId, m.group);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [origin, post, changeTemplate, selectById]);

  /* ─────────────── tree & inspector operations ─────────────── */

  const treeOps: TreeOps = {
    select,
    hover: (id) => post({ source: "pai-editor", type: "hover-section", sectionId: id }),
    reorderSections: (list, from, to) => update((c) => reorderSections(c, list, from, to)),
    toggleSection: (list, id) => update((c) => updateSection(c, list, id, (s) => ({ ...s, disabled: !s.disabled }))),
    duplicateSection: (list, id) => {
      const l = getList(config, list);
      const inst = l.sections[id];
      if (!inst) return;
      const newId = generateId("s");
      const copy = cloneSection(inst, () => generateId("b"));
      update((c) => insertSection(c, list, newId, copy, getList(c, list).order.indexOf(id) + 1));
      select({ kind: "section", list, sectionId: newId });
      toast.success("Section duplicated");
    },
    removeSection: (list, id) => void confirmRemoveSection(list, id),
    moveSection: (list, id, dir) =>
      update((c) => {
        const i = getList(c, list).order.indexOf(id);
        return updateList(c, list, (l) => ({ ...l, order: moveInArray(l.order, i, i + dir) }));
      }),
    addBlock: (list, sectionId, type) => {
      const inst = getList(config, list).sections[sectionId];
      const bs = inst && schemas[inst.type]?.blocks?.find((b) => b.type === type);
      if (!bs) return;
      const block = { id: generateId("b"), type, settings: applyDefaults(bs.settings, {}) };
      update((c) => updateSection(c, list, sectionId, (s) => ({ ...s, blocks: [...(s.blocks ?? []), block] })));
      select({ kind: "block", list, sectionId, blockId: block.id });
    },
    toggleBlock: (list, sectionId, blockId) => update((c) => updateBlock(c, list, sectionId, blockId, (b) => ({ ...b, disabled: !b.disabled }))),
    removeBlock: (list, sectionId, blockId) => {
      update((c) => updateSection(c, list, sectionId, (s) => ({ ...s, blocks: (s.blocks ?? []).filter((b) => b.id !== blockId) })));
      setSelection((s) => (s?.kind === "block" && s.blockId === blockId ? { kind: "section", list, sectionId } : s));
      toast("Block removed", { action: { label: "Undo", onClick: () => dispatch({ type: "undo" }) } });
    },
    reorderBlocks: (list, sectionId, from, to) => update((c) => reorderBlocks(c, list, sectionId, from, to)),
    openAddSection: (list) => setAddTarget(list),
    openThemeSettings: () => select({ kind: "theme", group: 0 }),
  };

  const selList = selection && selection.kind !== "theme" ? selection.list : null;
  const inspectorOps: InspectorOps = {
    close: () => {
      setSelection(null);
      if (isNarrow()) setMobileTab("sections");
    },
    select,
    setThemeSetting: (id, v) => update((c) => ({ ...c, settings: { ...c.settings, [id]: v } }), `theme:${id}`),
    setSectionSetting: (sid, id, v) => selList && update((c) => updateSection(c, selList, sid, (s) => ({ ...s, settings: { ...s.settings, [id]: v } })), `s:${sid}:${id}`),
    setBlockSetting: (sid, bid, id, v) => selList && update((c) => updateBlock(c, selList, sid, bid, (b) => ({ ...b, settings: { ...b.settings, [id]: v } })), `b:${bid}:${id}`),
    resetSection: (sid) => {
      if (!selList) return;
      const inst = getList(config, selList).sections[sid];
      const schema = inst && schemas[inst.type];
      if (!schema) return;
      update((c) => updateSection(c, selList, sid, (s) => ({ ...s, settings: applyDefaults(schema.settings, {}) })));
      toast("Section settings reset to defaults", { action: { label: "Undo", onClick: () => dispatch({ type: "undo" }) } });
    },
    toggleSection: (sid) => selList && treeOps.toggleSection(selList, sid),
    removeSection: (sid) => selList && void confirmRemoveSection(selList, sid),
    toggleBlock: (sid, bid) => selList && treeOps.toggleBlock(selList, sid, bid),
    removeBlock: (sid, bid) => selList && treeOps.removeBlock(selList, sid, bid),
  };

  const addSection = (schema: SectionSchema, presetIndex: number) => {
    const list = addTarget;
    if (!list) return;
    const id = generateId("s");
    const inst = instantiateSection(schema, presetIndex);
    update((c) => insertSection(c, list, id, inst));
    select({ kind: "section", list, sectionId: id });
  };

  /* ─────────────── publish / reset / presets / exit ─────────────── */

  const publish = async () => {
    setPublishing(true);
    await flush();
    const { config: cfg, version } = latest.current.state;
    const res = await run(publishTheme({ storeThemeId: storeTheme.id, config: cfg }));
    setPublishing(false);
    if (!res) return;
    if (latest.current.state.version === version) {
      savedVersion.current = version;
      setStatus("saved");
    }
    setStoreTheme((s) => ({ ...s, role: "live", publishedAt: res.publishedAt, hasPublishedConfig: true, hasDraft: false }));
    setPublishOpen(false);
    toast.success(res.wasLive ? "Changes published" : `“${storeTheme.name}” is now live!`, {
      description: "Your customers can see it on your store right now.",
      action: { label: "View store", onClick: () => window.open(data.storeUrl, "_blank", "noopener") },
    });
  };

  const reset = async (mode: "defaults" | "published") => {
    const ok = await confirm(
      mode === "defaults"
        ? {
            title: "Reset to theme defaults?",
            description: "All sections and settings go back to the theme's original design. Your live store doesn't change until you publish.",
            confirmLabel: "Reset theme",
            danger: true,
          }
        : { title: "Discard unpublished changes?", description: "Go back to the version that's currently live on your store.", confirmLabel: "Discard changes", danger: true },
    );
    if (!ok) return;
    await flush();
    const res = await run(resetTheme({ storeThemeId: storeTheme.id, mode }), { success: mode === "defaults" ? "Theme reset to defaults" : "Unpublished changes discarded" });
    if (!res) return;
    replaceConfig(res.config);
    setSelection(null);
    setStoreTheme((s) => ({ ...s, hasDraft: mode === "defaults" ? s.hasPublishedConfig : false }));
    post({ source: "pai-editor", type: "refresh" });
  };

  const applyPreset = async (presetId: string) => {
    const preset = data.presets.find((p) => p.id === presetId);
    const ok = await confirm({
      title: `Apply “${preset?.name ?? "preset"}”?`,
      description: "This replaces your current customizations — colors, fonts and page sections. You can undo right after.",
      confirmLabel: "Apply preset",
    });
    if (!ok) return;
    setApplyingPreset(presetId);
    await flush();
    const res = await run(applyThemePreset({ storeThemeId: storeTheme.id, presetId }), { success: `“${preset?.name}” preset applied` });
    setApplyingPreset(null);
    if (!res) return;
    replaceConfig(res.config);
    setSelection(null);
    setStoreTheme((s) => ({ ...s, presetId: res.presetId, hasDraft: true }));
    setPresetsOpen(false);
    post({ source: "pai-editor", type: "refresh" });
  };

  const exit = async () => {
    if (status !== "saved") {
      const ok = await flush();
      if (!ok) {
        const leave = await confirm({ title: "Leave without saving?", description: "Some changes couldn't be saved and will be lost.", confirmLabel: "Leave anyway", danger: true });
        if (!leave) return;
      }
    }
    router.push("/themes");
  };

  /* ─────────────── keyboard shortcuts ─────────────── */

  const keyHandler = React.useRef<(e: KeyboardEvent) => void>(() => {});
  keyHandler.current = (e: KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey;
    const target = e.target as HTMLElement | null;
    const inRichText = !!target?.isContentEditable;
    const inField = !!target?.closest?.("input, textarea, select, [contenteditable='true'], [contenteditable='']");
    const dialogOpen = !!document.querySelector('[role="dialog"]');
    const k = e.key.toLowerCase();
    if (mod && k === "s") {
      e.preventDefault();
      void flush();
      return;
    }
    if (dialogOpen) return;
    if (mod && k === "z" && !inRichText) {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
      return;
    }
    if (mod && k === "y" && !inRichText) {
      e.preventDefault();
      redo();
      return;
    }
    if (e.key === "Escape") {
      if (inField) {
        target?.blur();
        return;
      }
      if (selection?.kind === "block") setSelection({ kind: "section", list: selection.list, sectionId: selection.sectionId });
      else setSelection(null);
      return;
    }
    if ((e.key === "Delete" || e.key === "Backspace") && !inField && !mod && selection?.kind === "section") {
      e.preventDefault();
      void confirmRemoveSection(selection.list, selection.sectionId);
    }
  };
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => keyHandler.current(e);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ─────────────── derived view data ─────────────── */

  const templateMeta = TEMPLATE_TYPES.find((t) => t.id === template);
  const templateRef: ListRef = { kind: "template", key: template };
  const lists = [
    { ref: HEADER, title: "Header" },
    { ref: templateRef, title: templateMeta?.label ?? template, hint: "Use “Add section” below to build this page." },
    { ref: FOOTER, title: "Footer" },
  ];
  const templateCounts = Object.fromEntries(TEMPLATE_TYPES.map((t) => [t.id, config.templates[t.id]?.order.length ?? 0])) as Partial<Record<TemplateType, number>>;
  const isLive = storeTheme.role === "live";
  const listTitle = (ref: ListRef | null) => (!ref ? "" : ref.kind === "group" ? (ref.key === "header" ? "the header" : "the footer") : (TEMPLATE_TYPES.find((t) => t.id === ref.key)?.label ?? ref.key).toLowerCase());
  const sectionCount = getList(config, templateRef).order.length;
  const hiddenCount = getList(config, templateRef).order.filter((id) => getList(config, templateRef).sections[id]?.disabled).length;

  return (
    <div className="flex h-dvh flex-col">
      <TopBar
        name={storeTheme.name}
        live={isLive}
        hasUnpublished={isLive && (storeTheme.hasDraft || status !== "saved")}
        status={status}
        template={template}
        onTemplate={(t) => changeTemplate(t)}
        templateCounts={templateCounts}
        viewport={viewport}
        onViewport={(v) => {
          setViewport(v);
          if (isNarrow()) setMobileTab("preview");
        }}
        canUndo={state.past.length > 0}
        canRedo={state.future.length > 0}
        onUndo={undo}
        onRedo={redo}
        onSave={() => void flush()}
        onPublish={() => setPublishOpen(true)}
        publishing={publishing}
        onExit={() => void exit()}
        onPresets={data.presets.length ? () => setPresetsOpen(true) : null}
        previewUrl={srcFor(data.templatePaths[template] ?? "/")}
        storeUrl={data.storeUrl}
        onDiscard={storeTheme.hasPublishedConfig && (storeTheme.hasDraft || status !== "saved") ? () => void reset("published") : null}
        onResetDefaults={() => void reset("defaults")}
        onShortcuts={() => setShortcutsOpen(true)}
      />

      {/* Mobile: one panel at a time */}
      <nav className="flex shrink-0 border-b border-border bg-card lg:hidden" aria-label="Editor panels">
        {(
          [
            { v: "sections", label: "Sections", icon: <Layers /> },
            { v: "settings", label: "Settings", icon: <SlidersHorizontal /> },
            { v: "preview", label: "Preview", icon: <Eye /> },
          ] as { v: MobileTab; label: string; icon: React.ReactNode }[]
        ).map((t) => (
          <button
            key={t.v}
            type="button"
            onClick={() => setMobileTab(t.v)}
            className={cn(
              "-mb-px flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-sm font-medium [&_svg]:size-4",
              mobileTab === t.v ? "border-primary text-foreground" : "border-transparent text-muted-foreground",
            )}
          >
            {t.icon}
            {t.label}
            {t.v === "settings" && selection && <span className="size-1.5 rounded-full bg-primary" />}
          </button>
        ))}
      </nav>

      <div className="relative flex min-h-0 flex-1">
        <aside className={cn("min-h-0 w-full flex-col border-border bg-card lg:flex lg:w-80 lg:shrink-0 lg:border-r", mobileTab === "sections" ? "flex" : "hidden")}>
          <div className="flex shrink-0 items-baseline justify-between gap-2 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold">{templateMeta?.label ?? template}</h2>
              <p className="text-xs text-muted-foreground">
                {sectionCount} section{sectionCount === 1 ? "" : "s"}
                {hiddenCount ? ` · ${hiddenCount} hidden` : ""}
              </p>
            </div>
            <span className="truncate font-mono text-[11px] text-muted-foreground" title="Preview page">
              {data.templatePaths[template]}
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <SectionTree config={config} lists={lists} schemas={schemas} selection={selection} ops={treeOps} settingsGroups={data.settingsSchema.map((g) => g.name)} />
          </div>
        </aside>

        <main className={cn("min-h-0 min-w-0 flex-1 flex-col bg-muted/70 lg:flex", mobileTab === "preview" ? "flex" : "hidden")}>
          <div className={cn("min-h-0 flex-1", viewport === "desktop" && "lg:p-3")}>
            <div className={cn("h-full overflow-hidden", viewport === "desktop" && "lg:rounded-xl lg:border lg:border-border lg:shadow-sm")}>
              <PreviewFrame
                src={frame.src}
                viewport={viewport}
                iframeRef={iframeRef}
                loaded={frame.loaded}
                readyMsg={frame.readyMsg}
                onLoaded={() => setFrame((f) => ({ ...f, loaded: true }))}
                storefrontUrl={data.storefrontUrl}
                reloadKey={frame.reloadKey}
                onReload={() => setFrame((f) => ({ ...f, loaded: false, readyMsg: false, reloadKey: f.reloadKey + 1 }))}
              />
            </div>
          </div>
        </main>

        <aside
          className={cn(
            "min-h-0 w-full flex-col border-border bg-card",
            mobileTab === "settings" ? "flex" : "hidden",
            selection ? "lg:absolute lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-80 lg:animate-fade-in lg:border-r lg:shadow-xl" : "lg:hidden",
            "xl:static xl:z-auto xl:flex xl:w-[340px] xl:shrink-0 xl:animate-none xl:border-l xl:border-r-0 xl:shadow-none",
          )}
          aria-label="Settings"
        >
          <Inspector config={config} selection={selection} schemas={schemas} settingsSchema={data.settingsSchema} ops={inspectorOps} />
        </aside>
      </div>

      <AddSectionDialog
        open={!!addTarget}
        onClose={() => setAddTarget(null)}
        listRef={addTarget}
        listTitle={listTitle(addTarget)}
        list={addTarget ? getList(config, addTarget) : null}
        schemas={data.sectionSchemas}
        onAdd={addSection}
      />
      <PublishDialog
        open={publishOpen}
        onClose={() => !publishing && setPublishOpen(false)}
        onConfirm={() => void publish()}
        publishing={publishing}
        isLive={isLive}
        themeName={storeTheme.name}
        liveThemeName={isLive ? null : data.liveThemeName}
        storeUrl={data.storeUrl}
      />
      <PresetsDialog open={presetsOpen} onClose={() => setPresetsOpen(false)} presets={data.presets} currentId={storeTheme.presetId} onApply={(id) => void applyPreset(id)} applying={applyingPreset} />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      {confirmDialog}
    </div>
  );
}
