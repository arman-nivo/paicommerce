/** Deterministic PRNG helpers so every seed run produces the same data. */

export class Rng {
  private s: number;
  constructor(seed: number | string) {
    this.s = typeof seed === "number" ? seed >>> 0 : hashString(seed);
  }
  /** mulberry32 */
  next(): number {
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }
  float(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)]!;
  }
  /** Pick by weights: [[value, weight], ...] */
  weighted<T>(entries: readonly (readonly [T, number])[]): T {
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let r = this.next() * total;
    for (const [v, w] of entries) {
      r -= w;
      if (r <= 0) return v;
    }
    return entries[entries.length - 1]![0];
  }
  /** Pick an index given an array of weights. */
  weightedIndex(weights: readonly number[]): number {
    const total = weights.reduce((s, w) => s + w, 0);
    let r = this.next() * total;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i]!;
      if (r <= 0) return i;
    }
    return weights.length - 1;
  }
  shuffle<T>(arr: readonly T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  }
  sample<T>(arr: readonly T[], n: number): T[] {
    return this.shuffle(arr).slice(0, Math.min(n, arr.length));
  }
  /** Approximately normal (Irwin–Hall). */
  normal(mean: number, sd: number): number {
    let s = 0;
    for (let i = 0; i < 6; i++) s += this.next();
    return mean + (s - 3) * sd * Math.SQRT2;
  }
  hex(len: number): string {
    let out = "";
    for (let i = 0; i < len; i++) out += Math.floor(this.next() * 16).toString(16);
    return out;
  }
  alnum(len: number, alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"): string {
    let out = "";
    for (let i = 0; i < len; i++) out += alphabet[Math.floor(this.next() * alphabet.length)];
    return out;
  }
  digits(len: number): string {
    let out = "";
    for (let i = 0; i < len; i++) out += Math.floor(this.next() * 10);
    return out;
  }
}

export function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic v4-shaped UUIDs (stable ids across re-seeds keep dev cookies valid). */
const idRng = new Rng("paicommerce-ids");
export function uuid(): string {
  const h = idRng.hex(32).split("");
  h[12] = "4";
  h[16] = "89ab"[parseInt(h[16]!, 16) % 4]!;
  const s = h.join("");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}
