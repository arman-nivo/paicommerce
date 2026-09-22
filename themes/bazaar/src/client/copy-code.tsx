"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copy a voucher code to the clipboard with a short "Copied" confirmation. */
export function CopyCode({ code, className }: { code: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className={"inline-flex items-center gap-1.5 rounded-pai-btn px-2.5 py-1 text-xs font-bold transition " + (className ?? "")}
      aria-label={done ? `Code ${code} copied` : `Copy code ${code}`}
    >
      {done ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      <span aria-live="polite">{done ? "Copied" : "Copy"}</span>
    </button>
  );
}
