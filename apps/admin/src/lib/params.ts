export type SearchParams = Record<string, string | string[] | undefined>;

export function str(params: SearchParams, key: string): string | undefined {
  const v = params[key];
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.trim() ? s.trim() : undefined;
}

export function oneOf<T extends string>(params: SearchParams, key: string, allowed: readonly T[]): T | undefined {
  const v = str(params, key);
  return v && (allowed as readonly string[]).includes(v) ? (v as T) : undefined;
}

export function dateParam(params: SearchParams, key: string, endOfDay = false): Date | undefined {
  const v = str(params, key);
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return undefined;
  const d = new Date(`${v}T${endOfDay ? "23:59:59.999" : "00:00:00"}+06:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export const PAGE_SIZES = [25, 50, 100] as const;

export function listParams<S extends string>(params: SearchParams, sorts: readonly S[], defaultSort: S, defaultDir: "asc" | "desc" = "desc") {
  const page = Math.max(1, parseInt(str(params, "page") ?? "1", 10) || 1);
  const sizeRaw = parseInt(str(params, "size") ?? "25", 10);
  const size = (PAGE_SIZES as readonly number[]).includes(sizeRaw) ? sizeRaw : 25;
  const sort = oneOf(params, "sort", sorts) ?? defaultSort;
  const dir = (str(params, "dir") === "asc" ? "asc" : str(params, "dir") === "desc" ? "desc" : defaultDir) as "asc" | "desc";
  return { page, size, offset: (page - 1) * size, sort, dir };
}

/** Build an href from the current params with some keys replaced (undefined/"" removes a key). */
export function hrefWith(base: string, params: SearchParams, updates: Record<string, string | number | undefined | null>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    const s = Array.isArray(v) ? v[0] : v;
    if (s) q.set(k, s);
  }
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined || v === null || v === "") q.delete(k);
    else q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

export function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (m) => "\\" + m);
}
