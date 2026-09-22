"use client";

import { useId, useState } from "react";

/**
 * Before/after comparison. The divider is driven by a native range input layered over the
 * images, so it works with touch, mouse and keyboard (arrow keys) and is announced by screen readers.
 */
export function CompareSlider({
  before,
  after,
  beforeAlt,
  afterAlt,
  beforeLabel,
  afterLabel,
  start = 50,
  ratio = "aspect-[4/5]",
  beforeFilter,
}: {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  beforeLabel: string;
  afterLabel: string;
  start?: number;
  ratio?: string;
  beforeFilter?: string;
}) {
  const [pos, setPos] = useState(start);
  const id = useId();
  return (
    <div className={`bloom-compare relative select-none overflow-hidden rounded-[calc(var(--pai-radius)*1.4)] bg-pai-muted ${ratio}`}>
      <img src={after} alt={afterAlt} loading="lazy" decoding="async" draggable={false} className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt={beforeAlt} loading="lazy" decoding="async" draggable={false} className="absolute inset-0 size-full object-cover" style={beforeFilter ? { filter: beforeFilter } : undefined} />
      </div>
      {beforeLabel ? <span className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">{beforeLabel}</span> : null}
      {afterLabel ? <span className="absolute right-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-900 backdrop-blur">{afterLabel}</span> : null}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgba(0,0,0,.3)]" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-neutral-900 shadow-lg">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
          </svg>
        </span>
      </div>
      <label htmlFor={id} className="sr-only">
        Drag to compare {beforeLabel || "before"} and {afterLabel || "after"}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-valuetext={`${pos}% ${beforeLabel || "before"}`}
        className="bloom-compare-input absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
