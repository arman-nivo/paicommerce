import { FileCode2, SquareTerminal } from "lucide-react";
import { CopyButton } from "./copy-button";
import { TOKEN_CLASS, highlight, langLabel, normalizeLang } from "./highlight";

export function CodeBlock({ code, lang, title }: { code: string; lang?: string; title?: string }) {
  const lines = highlight(code, lang);
  const isTerminal = normalizeLang(lang) === "bash" && !title;
  const Icon = isTerminal ? SquareTerminal : FileCode2;
  const label = langLabel(lang);
  // Copy without shell prompts so pasted commands run as-is.
  const copyText = normalizeLang(lang) === "bash" ? code.replace(/^\$ /gm, "") : code;

  return (
    <figure className="docs-code not-prose group relative my-6 overflow-hidden rounded-xl border border-slate-800 bg-[#0b1020] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_12px_32px_-16px_rgba(11,16,32,0.5)]">
      <figcaption className="flex h-10 items-center justify-between gap-3 border-b border-white/[0.06] bg-white/[0.02] pl-4 pr-2">
        <div className="flex min-w-0 items-center gap-2 text-xs">
          <Icon className="size-3.5 shrink-0 text-slate-500" aria-hidden />
          {title ? (
            <span className="truncate font-mono text-slate-300">{title}</span>
          ) : (
            <span className="font-medium text-slate-400">{label}</span>
          )}
          {title && <span className="hidden rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:inline">{lang || "text"}</span>}
        </div>
        <CopyButton code={copyText} />
      </figcaption>
      <pre className="overflow-x-auto py-4 text-[13px] leading-[1.7]" tabIndex={0}>
        <code className="grid min-w-max font-mono">
          {lines.map((line, i) => (
            <span key={i} className="block px-4">
              {line.length === 0 ? "​" : line.map((t, j) => (
                <span key={j} className={TOKEN_CLASS[t.kind]}>
                  {t.text}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
