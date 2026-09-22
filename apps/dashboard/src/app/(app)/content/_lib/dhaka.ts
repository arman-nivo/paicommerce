/** Asia/Dhaka is UTC+6 with no DST, so conversions are a fixed offset. */
const OFFSET_MS = 6 * 60 * 60 * 1000;

/** Date/ISO → "YYYY-MM-DDTHH:mm" in Dhaka time (for <input type="datetime-local">). */
export function toDhakaInput(d: Date | string | null | undefined): string {
  if (!d) return "";
  const t = new Date(d).getTime();
  if (Number.isNaN(t)) return "";
  return new Date(t + OFFSET_MS).toISOString().slice(0, 16);
}

/** "YYYY-MM-DDTHH:mm" (Dhaka) → ISO string, or null when empty/invalid. */
export function fromDhakaInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(`${v}:00+06:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
