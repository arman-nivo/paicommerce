/**
 * Minimal markdown → React renderer for the developer docs (server component, no deps).
 *
 * Supported: h2–h4 (slug ids + anchor links), paragraphs, **bold**, *italic*, `code`, [links](/x),
 * <kbd>, ~~strike~~, ordered/unordered lists (nested), GFM tables (with alignment),
 * blockquotes & callouts (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`), hr, and fenced code blocks
 * with language + optional title: ```ts title="src/manifest.ts".
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, Info, Lightbulb, Link2 } from "lucide-react";
import { slugifyHeading, stripInline, uniqueId } from "@/lib/docs";
import { CodeBlock } from "./code-block";

/* ─────────────────────────── AST ─────────────────────────── */

type Align = "left" | "center" | "right" | null;
type ListItem = { text: string; children: Block[] };
type CalloutKind = "note" | "tip" | "warning";

type Block =
  | { type: "heading"; depth: 2 | 3 | 4; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "code"; lang?: string; title?: string; code: string }
  | { type: "list"; ordered: boolean; start: number; items: ListItem[] }
  | { type: "table"; header: string[]; align: Align[]; rows: string[][] }
  | { type: "callout"; kind: CalloutKind; title?: string; blocks: Block[] }
  | { type: "quote"; blocks: Block[] }
  | { type: "hr" };

const RE_FENCE = /^(\s*)(`{3,}|~{3,})\s*([\w+#.-]*)\s*(.*)$/;
const RE_HEADING = /^(#{1,4})\s+(.+?)\s*#*\s*$/;
const RE_HR = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
const RE_LIST = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
const RE_TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

const indentOf = (s: string) => {
  let n = 0;
  for (const ch of s) {
    if (ch === " ") n++;
    else if (ch === "\t") n += 4;
    else break;
  }
  return n;
};

function dedent(line: string, n: number): string {
  let i = 0;
  let removed = 0;
  while (i < line.length && removed < n && (line[i] === " " || line[i] === "\t")) {
    removed += line[i] === "\t" ? 4 : 1;
    i++;
  }
  return line.slice(i);
}

function splitRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|") && !s.endsWith("\\|")) s = s.slice(0, -1);
  const cells: string[] = [];
  let cur = "";
  let inCode = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!;
    if (c === "\\" && s[i + 1] === "|") {
      cur += "|";
      i++;
      continue;
    }
    if (c === "`") inCode = !inCode;
    if (c === "|" && !inCode) {
      cells.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  cells.push(cur.trim());
  return cells;
}

function parseFenceInfo(rest: string): { title?: string } {
  const m = /title=(?:"([^"]*)"|'([^']*)'|(\S+))/.exec(rest);
  return { title: m ? (m[1] ?? m[2] ?? m[3]) : undefined };
}

function startsBlock(line: string, next: string | undefined): boolean {
  return (
    RE_FENCE.test(line) && /^(\s*)(`{3,}|~{3,})/.test(line)
  ) || RE_HEADING.test(line) || RE_HR.test(line) || /^\s*>/.test(line) || RE_LIST.test(line) || (line.includes("|") && !!next && RE_TABLE_SEP.test(next));
}

export function parseMarkdown(src: string, seen: Map<string, number> = new Map()): Block[] {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    if (line.trim() === "") {
      i++;
      continue;
    }

    // Fenced code
    const fence = /^(\s*)(`{3,}|~{3,})/.test(line) ? RE_FENCE.exec(line) : null;
    if (fence) {
      const indent = fence[1]!.length;
      const marker = fence[2]!;
      const lang = fence[3] || undefined;
      const { title } = parseFenceInfo(fence[4] ?? "");
      const body: string[] = [];
      i++;
      while (i < lines.length && !new RegExp(`^\\s*${marker[0] === "`" ? "`" : "~"}{${marker.length},}\\s*$`).test(lines[i]!)) {
        body.push(dedent(lines[i]!, indent));
        i++;
      }
      i++; // closing fence
      blocks.push({ type: "code", lang, title, code: body.join("\n").replace(/\s+$/, "") });
      continue;
    }

    // Headings (h1 is rendered by the page, so "#" is treated as h2)
    const h = RE_HEADING.exec(line);
    if (h) {
      const depth = Math.max(2, h[1]!.length) as 2 | 3 | 4;
      const text = h[2]!;
      blocks.push({ type: "heading", depth, text, id: uniqueId(slugifyHeading(text), seen) });
      i++;
      continue;
    }

    if (RE_HR.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Blockquote / callout
    if (/^\s*>/.test(line)) {
      const inner: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i]!)) {
        inner.push(lines[i]!.replace(/^\s*>\s?/, ""));
        i++;
      }
      const m = /^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*(.*)$/i.exec(inner[0] ?? "");
      if (m) {
        const k = m[1]!.toUpperCase();
        const kind: CalloutKind = k === "TIP" ? "tip" : k === "WARNING" || k === "CAUTION" ? "warning" : "note";
        blocks.push({ type: "callout", kind, title: m[2] || undefined, blocks: parseMarkdown(inner.slice(1).join("\n"), new Map()) });
      } else blocks.push({ type: "quote", blocks: parseMarkdown(inner.join("\n"), new Map()) });
      continue;
    }

    // Table
    if (line.includes("|") && i + 1 < lines.length && RE_TABLE_SEP.test(lines[i + 1]!)) {
      const header = splitRow(line);
      const align: Align[] = splitRow(lines[i + 1]!).map((c) => {
        const l = c.startsWith(":");
        const r = c.endsWith(":");
        return l && r ? "center" : r ? "right" : l ? "left" : null;
      });
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i]!.trim() !== "" && lines[i]!.includes("|")) {
        rows.push(splitRow(lines[i]!));
        i++;
      }
      blocks.push({ type: "table", header, align, rows });
      continue;
    }

    // Lists
    const lm = RE_LIST.exec(line);
    if (lm) {
      const baseIndent = indentOf(lm[1]!);
      const ordered = /\d/.test(lm[2]!);
      const start = ordered ? parseInt(lm[2]!, 10) : 1;
      const items: { text: string[]; sub: string[] }[] = [];
      let contentIndent = baseIndent + lm[2]!.length + 1;
      let sawBlank = false;
      let inFence = false;

      while (i < lines.length) {
        const l = lines[i]!;
        const cur = items[items.length - 1];

        if (inFence) {
          cur!.sub.push(dedent(l, contentIndent));
          if (/^\s*(`{3,}|~{3,})\s*$/.test(l)) inFence = false;
          i++;
          continue;
        }

        if (l.trim() === "") {
          // Continue the list only if the next non-blank line belongs to it.
          let j = i + 1;
          while (j < lines.length && lines[j]!.trim() === "") j++;
          const nxt = lines[j];
          if (nxt === undefined) break;
          const nm = RE_LIST.exec(nxt);
          const belongs = indentOf(nxt) > baseIndent || (nm && indentOf(nm[1]!) === baseIndent && /\d/.test(nm[2]!) === ordered);
          if (!belongs) break;
          if (cur && cur.sub.length) cur.sub.push("");
          sawBlank = true;
          i++;
          continue;
        }

        const m2 = RE_LIST.exec(l);
        const ind = indentOf(l);
        if (m2 && ind <= baseIndent + 1) {
          if (/\d/.test(m2[2]!) !== ordered) break;
          items.push({ text: [m2[3]!], sub: [] });
          contentIndent = ind + m2[2]!.length + 1;
          sawBlank = false;
          i++;
          continue;
        }
        if (!cur) break;
        if (ind > baseIndent) {
          const d = dedent(l, Math.min(contentIndent, ind));
          if (m2 || cur.sub.length || sawBlank || /^(`{3,}|~{3,})/.test(d.trim())) {
            if (/^(`{3,}|~{3,})/.test(d.trim())) inFence = true;
            cur.sub.push(d);
          } else cur.text.push(l.trim());
          i++;
          continue;
        }
        // Lazy continuation (unindented, no blank line before)
        if (!sawBlank && !startsBlock(l, lines[i + 1])) {
          cur.text.push(l.trim());
          i++;
          continue;
        }
        break;
      }

      blocks.push({
        type: "list",
        ordered,
        start,
        items: items.map((it) => ({ text: it.text.join(" "), children: it.sub.length ? parseMarkdown(it.sub.join("\n"), new Map()) : [] })),
      });
      continue;
    }

    // Paragraph
    const para: string[] = [line.trim()];
    i++;
    while (i < lines.length && lines[i]!.trim() !== "" && !startsBlock(lines[i]!, lines[i + 1])) {
      para.push(lines[i]!.trim());
      i++;
    }
    blocks.push({ type: "paragraph", text: para.join(" ") });
  }
  return blocks;
}

/* ─────────────────────────── inline ─────────────────────────── */

function isExternal(href: string) {
  return /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");
}

function A({ href, children }: { href: string; children: ReactNode }) {
  if (isExternal(href))
    return (
      <a href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
        {children}
      </a>
    );
  return <Link href={href}>{children}</Link>;
}

function findClosing(s: string, from: number, token: string): number {
  let i = from;
  while (i < s.length) {
    if (s[i] === "\\") {
      i += 2;
      continue;
    }
    if (s[i] === "`") {
      const end = s.indexOf("`", i + 1);
      if (end === -1) return -1;
      i = end + 1;
      continue;
    }
    if (s.startsWith(token, i)) return i;
    i++;
  }
  return -1;
}

export function renderInline(text: string, key = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  let buf = "";
  let n = 0;
  const flush = () => {
    if (buf) out.push(buf);
    buf = "";
  };
  let i = 0;
  while (i < text.length) {
    const c = text[i]!;

    if (c === "\\" && i + 1 < text.length && /[\\`*_{}[\]()#+\-.!|<>~]/.test(text[i + 1]!)) {
      buf += text[i + 1];
      i += 2;
      continue;
    }

    if (c === "`") {
      let run = 1;
      while (text[i + run] === "`") run++;
      const fence = "`".repeat(run);
      const end = text.indexOf(fence, i + run);
      if (end !== -1) {
        flush();
        let code = text.slice(i + run, end);
        if (run > 1) code = code.replace(/^ | $/g, "");
        out.push(<code key={`${key}-${n++}`}>{code}</code>);
        i = end + run;
        continue;
      }
    }

    if (text.startsWith("<kbd>", i)) {
      const end = text.indexOf("</kbd>", i);
      if (end !== -1) {
        flush();
        out.push(
          <kbd key={`${key}-${n++}`} className="rounded border border-border bg-white px-1.5 py-0.5 font-mono text-[0.8em] text-foreground shadow-[0_1px_0_var(--border)]">
            {text.slice(i + 5, end)}
          </kbd>,
        );
        i = end + 6;
        continue;
      }
    }

    if (text.startsWith("<br>", i) || text.startsWith("<br/>", i) || text.startsWith("<br />", i)) {
      flush();
      out.push(<br key={`${key}-${n++}`} />);
      i = text.indexOf(">", i) + 1;
      continue;
    }

    if (c === "<" && /^<https?:\/\/[^>\s]+>/.test(text.slice(i))) {
      const end = text.indexOf(">", i);
      const href = text.slice(i + 1, end);
      flush();
      out.push(
        <A key={`${key}-${n++}`} href={href}>
          {href}
        </A>,
      );
      i = end + 1;
      continue;
    }

    if (text.startsWith("**", i) || text.startsWith("__", i)) {
      const tok = text.slice(i, i + 2);
      const end = findClosing(text, i + 2, tok);
      if (end > i + 2) {
        flush();
        out.push(<strong key={`${key}-${n++}`}>{renderInline(text.slice(i + 2, end), `${key}-${n}`)}</strong>);
        i = end + 2;
        continue;
      }
    }

    if (text.startsWith("~~", i)) {
      const end = findClosing(text, i + 2, "~~");
      if (end > i + 2) {
        flush();
        out.push(<del key={`${key}-${n++}`}>{renderInline(text.slice(i + 2, end), `${key}-${n}`)}</del>);
        i = end + 2;
        continue;
      }
    }

    if ((c === "*" || c === "_") && text[i + 1] !== c && text[i + 1] !== " ") {
      const prev = text[i - 1];
      const okStart = c === "*" || !prev || !/\w/.test(prev);
      if (okStart) {
        const end = findClosing(text, i + 1, c);
        const after = text[end + 1];
        if (end > i + 1 && text[end - 1] !== " " && (c === "*" || !after || !/\w/.test(after))) {
          flush();
          out.push(<em key={`${key}-${n++}`}>{renderInline(text.slice(i + 1, end), `${key}-${n}`)}</em>);
          i = end + 1;
          continue;
        }
      }
    }

    if (c === "[") {
      // find matching ]
      let depth = 0;
      let j = i;
      for (; j < text.length; j++) {
        if (text[j] === "`") {
          const e = text.indexOf("`", j + 1);
          if (e === -1) break;
          j = e;
          continue;
        }
        if (text[j] === "[") depth++;
        else if (text[j] === "]") {
          depth--;
          if (depth === 0) break;
        }
      }
      if (j < text.length && text[j + 1] === "(") {
        const close = text.indexOf(")", j + 2);
        if (close !== -1) {
          const label = text.slice(i + 1, j);
          const href = text.slice(j + 2, close).trim().split(/\s+/)[0]!;
          flush();
          out.push(
            <A key={`${key}-${n++}`} href={href}>
              {renderInline(label, `${key}-${n}`)}
            </A>,
          );
          i = close + 1;
          continue;
        }
      }
    }

    buf += c;
    i++;
  }
  flush();
  return out;
}

/* ─────────────────────────── blocks → React ─────────────────────────── */

const CALLOUT = {
  note: { Icon: Info, label: "Note", box: "border-brand-200 bg-brand-50/60", icon: "text-brand-600", title: "text-brand-900" },
  tip: { Icon: Lightbulb, label: "Tip", box: "border-emerald-200 bg-emerald-50/70", icon: "text-emerald-600", title: "text-emerald-900" },
  warning: { Icon: AlertTriangle, label: "Warning", box: "border-amber-200 bg-amber-50/80", icon: "text-amber-600", title: "text-amber-900" },
} as const;

function Heading({ depth, id, text }: { depth: 2 | 3 | 4; id: string; text: string }) {
  const Tag = `h${depth}` as "h2" | "h3" | "h4";
  return (
    <Tag id={id} className="docs-heading group relative scroll-mt-24">
      <a href={`#${id}`} className="docs-anchor" aria-label={`Link to “${stripInline(text)}”`}>
        <Link2 className="size-4" aria-hidden />
      </a>
      {renderInline(text, id)}
    </Tag>
  );
}

function renderBlocks(blocks: Block[], keyPrefix = "b"): ReactNode[] {
  return blocks.map((b, idx) => {
    const key = `${keyPrefix}-${idx}`;
    switch (b.type) {
      case "heading":
        return <Heading key={key} depth={b.depth} id={b.id} text={b.text} />;
      case "paragraph":
        return <p key={key}>{renderInline(b.text, key)}</p>;
      case "hr":
        return <hr key={key} />;
      case "code":
        return <CodeBlock key={key} code={b.code} lang={b.lang} title={b.title} />;
      case "quote":
        return <blockquote key={key}>{renderBlocks(b.blocks, key)}</blockquote>;
      case "callout": {
        const s = CALLOUT[b.kind];
        return (
          <div key={key} role="note" className={`docs-callout not-prose my-6 flex gap-3 rounded-xl border px-4 py-3.5 ${s.box}`}>
            <s.Icon className={`mt-0.5 size-[18px] shrink-0 ${s.icon}`} aria-hidden />
            <div className="min-w-0 flex-1 text-[0.94rem] leading-relaxed text-slate-700">
              <p className={`font-semibold ${s.title}`}>{b.title ? renderInline(b.title, key) : s.label}</p>
              <div className="docs-callout-body mt-1">{renderBlocks(b.blocks, key)}</div>
            </div>
          </div>
        );
      }
      case "list": {
        const isTaskList = b.items.length > 0 && b.items.every((it) => /^\[[ xX]\]\s/.test(it.text));
        const items = b.items.map((it, j) => {
          const task = /^\[([ xX])\]\s+/.exec(it.text);
          if (task) {
            const checked = task[1] !== " ";
            return (
              <li key={`${key}-${j}`} className="docs-task flex gap-2.5">
                <span
                  aria-hidden
                  className={`mt-[0.3em] grid size-4 shrink-0 place-items-center rounded border ${checked ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white"}`}
                >
                  {checked && (
                    <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2.5 6.5l2.2 2.2 4.8-5" />
                    </svg>
                  )}
                </span>
                <span className="min-w-0">
                  {renderInline(it.text.slice(task[0].length), `${key}-${j}`)}
                  {it.children.length > 0 && renderBlocks(it.children, `${key}-${j}`)}
                </span>
              </li>
            );
          }
          return (
            <li key={`${key}-${j}`}>
              {renderInline(it.text, `${key}-${j}`)}
              {it.children.length > 0 && renderBlocks(it.children, `${key}-${j}`)}
            </li>
          );
        });
        return b.ordered ? (
          <ol key={key} start={b.start !== 1 ? b.start : undefined}>
            {items}
          </ol>
        ) : (
          <ul key={key} className={isTaskList ? "docs-tasklist" : undefined}>
            {items}
          </ul>
        );
      }
      case "table":
        return (
          <div key={key} className="docs-table overflow-x-auto">
            <table>
              <thead>
                <tr>
                  {b.header.map((h, j) => (
                    <th key={j} style={b.align[j] ? { textAlign: b.align[j]! } : undefined}>
                      {renderInline(h, `${key}-h${j}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r, ri) => (
                  <tr key={ri}>
                    {b.header.map((_, j) => (
                      <td key={j} style={b.align[j] ? { textAlign: b.align[j]! } : undefined}>
                        {renderInline(r[j] ?? "", `${key}-${ri}-${j}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  });
}

export function Markdown({ source, className }: { source: string; className?: string }) {
  const blocks = parseMarkdown(source);
  return <div className={`prose-pai docs-prose ${className ?? ""}`}>{renderBlocks(blocks)}</div>;
}
