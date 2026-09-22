"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Promo code chip with copy-to-clipboard. */
export function CopyCode({ code, className }: { code: string; className?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={done ? `Code ${code} copied` : `Copy code ${code}`}
      className={
        "inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-current px-3 py-1.5 font-mono text-sm font-bold tracking-wider transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current " +
        (className ?? "")
      }
    >
      {code}
      {done ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      <span aria-live="polite" className="sr-only">{done ? "Copied" : ""}</span>
    </button>
  );
}
