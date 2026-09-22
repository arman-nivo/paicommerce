"use client";

import { useEffect, useRef } from "react";

/**
 * Keeps `--pai-header-h` on the enclosing <header> equal to its real height, so the transparent
 * header overlaps the cinematic hero exactly (logo size, tagline and menu wrapping all vary).
 * The theme CSS provides server-side fallbacks for the first paint.
 */
export function HeaderMeasure() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const header = ref.current?.closest("header");
    if (!header) return;
    const set = () => header.style.setProperty("--pai-header-h", `${Math.round(header.getBoundingClientRect().height)}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);
  return <span ref={ref} hidden />;
}
