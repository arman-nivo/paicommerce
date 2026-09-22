import type { MenuItem } from "@pai/db/schema";

export const MAX_DEPTH = 2; // 0-based → 3 levels
export type FlatItem = { id: string; label: string; url: string; depth: number };

export function flatten(items: MenuItem[], depth = 0, out: FlatItem[] = []): FlatItem[] {
  for (const i of items) {
    out.push({ id: i.id, label: i.label, url: i.url, depth: Math.min(depth, MAX_DEPTH) });
    if (i.children?.length) flatten(i.children, depth + 1, out);
  }
  return out;
}

export function buildTree(flat: FlatItem[]): MenuItem[] {
  const root: MenuItem[] = [];
  const stack: { depth: number; item: MenuItem }[] = [];
  for (const f of normalize(flat)) {
    const item: MenuItem = { id: f.id, label: f.label, url: f.url };
    while (stack.length && stack[stack.length - 1]!.depth >= f.depth) stack.pop();
    const parent = stack[stack.length - 1];
    if (parent) (parent.item.children ??= []).push(item);
    else root.push(item);
    stack.push({ depth: f.depth, item });
  }
  return root;
}

/** Ensures each depth is at most previous depth + 1 and never exceeds MAX_DEPTH. */
export function normalize(flat: FlatItem[]): FlatItem[] {
  let prev = -1;
  return flat.map((f) => {
    const depth = Math.max(0, Math.min(f.depth, prev + 1, MAX_DEPTH));
    prev = depth;
    return depth === f.depth ? f : { ...f, depth };
  });
}

/** Index one past the last descendant of flat[i]. */
export function subtreeEnd(flat: FlatItem[], i: number): number {
  let j = i + 1;
  while (j < flat.length && flat[j]!.depth > flat[i]!.depth) j++;
  return j;
}

/** Move an item (with its children) to the position of `overId`. */
export function moveItem(flat: FlatItem[], activeId: string, overId: string): FlatItem[] {
  const ai = flat.findIndex((f) => f.id === activeId);
  const oi = flat.findIndex((f) => f.id === overId);
  if (ai < 0 || oi < 0 || ai === oi) return flat;
  const end = subtreeEnd(flat, ai);
  if (oi > ai && oi < end) return flat; // dropped onto its own child
  const block = flat.slice(ai, end);
  const rest = [...flat.slice(0, ai), ...flat.slice(end)];
  const over = rest.findIndex((f) => f.id === overId);
  const target = rest[over]!;
  const insertAt = oi > ai ? subtreeEnd(rest, over) : over;
  const delta = target.depth - block[0]!.depth;
  const moved = block.map((b) => ({ ...b, depth: b.depth + delta }));
  return normalize([...rest.slice(0, insertAt), ...moved, ...rest.slice(insertAt)]);
}

export function canIndent(flat: FlatItem[], i: number): boolean {
  if (i <= 0) return false;
  const item = flat[i]!;
  if (item.depth > flat[i - 1]!.depth) return false;
  const end = subtreeEnd(flat, i);
  const maxSub = Math.max(...flat.slice(i, end).map((f) => f.depth));
  return maxSub + 1 <= MAX_DEPTH;
}

export function shiftDepth(flat: FlatItem[], i: number, by: 1 | -1): FlatItem[] {
  const end = subtreeEnd(flat, i);
  return normalize(flat.map((f, idx) => (idx >= i && idx < end ? { ...f, depth: f.depth + by } : f)));
}
