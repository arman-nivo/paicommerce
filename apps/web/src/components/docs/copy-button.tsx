"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

export function CopyButton({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // Fallback for insecure contexts
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
      } finally {
        ta.remove();
      }
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy code"}
      className={
        "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-brand-400 " +
        (className ?? "")
      }
    >
      {copied ? <Check className="size-3.5 text-emerald-400" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      <span>{copied ? "Copied" : "Copy"}</span>
      <span className="sr-only" aria-live="polite">
        {copied ? "Code copied to clipboard" : ""}
      </span>
    </button>
  );
}
