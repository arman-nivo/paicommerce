/**
 * Pure config state for the customizer: an undoable reducer + immutable helpers for editing
 * section lists, sections and blocks of a ThemeConfig.
 */
import type { BlockInstance, SectionInstance, SectionList, ThemeConfig } from "@pai/theme-sdk";
import type { ListRef } from "./types";

export const HISTORY_LIMIT = 100;
/** Edits to the same field within this window are merged into one undo step. */
const COALESCE_MS = 1200;

export type EditorState = {
  config: ThemeConfig;
  past: ThemeConfig[];
  future: ThemeConfig[];
  /** Increments on every change of `config` (incl. undo/redo) — used to track saves. */
  version: number;
  lastKey: string | null;
  lastAt: number;
};

export type EditorAction =
  | { type: "update"; update: (c: ThemeConfig) => ThemeConfig; key?: string; at: number }
  | { type: "replace"; config: ThemeConfig; undoable: boolean }
  | { type: "undo" }
  | { type: "redo" };

export function initEditorState(config: ThemeConfig): EditorState {
  return { config, past: [], future: [], version: 0, lastKey: null, lastAt: 0 };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "update": {
      const next = action.update(state.config);
      if (next === state.config) return state;
      const coalesce = !!action.key && action.key === state.lastKey && action.at - state.lastAt < COALESCE_MS;
      const past = coalesce ? state.past : [...state.past, state.config].slice(-HISTORY_LIMIT);
      return { config: next, past, future: [], version: state.version + 1, lastKey: action.key ?? null, lastAt: action.at };
    }
    case "replace": {
      const past = action.undoable ? [...state.past, state.config].slice(-HISTORY_LIMIT) : [];
      return { config: action.config, past, future: action.undoable ? [] : [], version: state.version + 1, lastKey: null, lastAt: 0 };
    }
    case "undo": {
      const prev = state.past[state.past.length - 1];
      if (!prev) return state;
      return { config: prev, past: state.past.slice(0, -1), future: [state.config, ...state.future].slice(0, HISTORY_LIMIT), version: state.version + 1, lastKey: null, lastAt: 0 };
    }
    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return { config: next, past: [...state.past, state.config].slice(-HISTORY_LIMIT), future: state.future.slice(1), version: state.version + 1, lastKey: null, lastAt: 0 };
    }
  }
}

/* ─────────────────────────── list helpers ─────────────────────────── */

export const EMPTY_LIST: SectionList = { sections: {}, order: [] };

export function listKey(ref: ListRef) {
  return `${ref.kind}:${ref.key}`;
}

export function sameList(a: ListRef, b: ListRef) {
  return a.kind === b.kind && a.key === b.key;
}

export function getList(config: ThemeConfig, ref: ListRef): SectionList {
  const l = ref.kind === "group" ? config.groups[ref.key] : config.templates[ref.key];
  return l ?? EMPTY_LIST;
}

export function setList(config: ThemeConfig, ref: ListRef, list: SectionList): ThemeConfig {
  if (ref.kind === "group") return { ...config, groups: { ...config.groups, [ref.key]: list } };
  return { ...config, templates: { ...config.templates, [ref.key]: list } };
}

export function updateList(config: ThemeConfig, ref: ListRef, fn: (l: SectionList) => SectionList): ThemeConfig {
  return setList(config, ref, fn(getList(config, ref)));
}

export function updateSection(config: ThemeConfig, ref: ListRef, sectionId: string, fn: (s: SectionInstance) => SectionInstance): ThemeConfig {
  return updateList(config, ref, (l) => {
    const s = l.sections[sectionId];
    if (!s) return l;
    return { ...l, sections: { ...l.sections, [sectionId]: fn(s) } };
  });
}

export function updateBlock(config: ThemeConfig, ref: ListRef, sectionId: string, blockId: string, fn: (b: BlockInstance) => BlockInstance): ThemeConfig {
  return updateSection(config, ref, sectionId, (s) => ({ ...s, blocks: (s.blocks ?? []).map((b) => (b.id === blockId ? fn(b) : b)) }));
}

export function insertSection(config: ThemeConfig, ref: ListRef, id: string, inst: SectionInstance, index?: number): ThemeConfig {
  return updateList(config, ref, (l) => {
    const order = [...l.order];
    order.splice(index ?? order.length, 0, id);
    return { sections: { ...l.sections, [id]: inst }, order };
  });
}

export function removeSection(config: ThemeConfig, ref: ListRef, id: string): ThemeConfig {
  return updateList(config, ref, (l) => {
    const sections = { ...l.sections };
    delete sections[id];
    return { sections, order: l.order.filter((x) => x !== id) };
  });
}

export function moveInArray<T>(arr: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

export function reorderSections(config: ThemeConfig, ref: ListRef, from: number, to: number): ThemeConfig {
  return updateList(config, ref, (l) => ({ ...l, order: moveInArray(l.order, from, to) }));
}

export function reorderBlocks(config: ThemeConfig, ref: ListRef, sectionId: string, from: number, to: number): ThemeConfig {
  return updateSection(config, ref, sectionId, (s) => ({ ...s, blocks: moveInArray(s.blocks ?? [], from, to) }));
}

/** Deep-clone a section, giving each block a fresh id from `newBlockId`. */
export function cloneSection(inst: SectionInstance, newBlockId: () => string): SectionInstance {
  const copy = JSON.parse(JSON.stringify(inst)) as SectionInstance;
  if (copy.blocks) copy.blocks = copy.blocks.map((b) => ({ ...b, id: newBlockId() }));
  return copy;
}

/** A short, human subtitle for a section/block derived from common text settings. */
export function subtitleFrom(settings: Record<string, unknown> | undefined): string | null {
  if (!settings) return null;
  for (const k of ["heading", "title", "text", "label", "name", "question", "author", "caption", "subheading"]) {
    const v = settings[k];
    if (typeof v === "string" && v.trim()) {
      const plain = v.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
      if (plain) return plain.length > 48 ? `${plain.slice(0, 46)}…` : plain;
    }
  }
  return null;
}

/** Approximate JSON size in bytes. */
export function jsonSize(v: unknown) {
  return new Blob([JSON.stringify(v)]).size;
}
