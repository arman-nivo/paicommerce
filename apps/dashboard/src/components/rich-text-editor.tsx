"use client";
import * as React from "react";
import { Bold, Code, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Pilcrow, Quote, RemoveFormatting, Underline } from "lucide-react";
import { cn } from "@pai/ui";
import { MediaPickerDialog } from "./media-picker";

/**
 * Lightweight rich-text editor (contentEditable + execCommand) producing HTML.
 * Uncontrolled internally; call sites pass `value` (initial / external replacement) and receive `onChange(html)`.
 */
export function RichTextEditor({ value, onChange, placeholder = "Write something…", minHeight = 180, className, toolbarExtra }: { value: string; onChange: (html: string) => void; placeholder?: string; minHeight?: number; className?: string; toolbarExtra?: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const last = React.useRef<string>(value);
  const [source, setSource] = React.useState(false);
  const [picker, setPicker] = React.useState(false);
  const savedRange = React.useRef<Range | null>(null);

  // Sync external value changes (e.g. AI generated text, discard) without clobbering the caret during typing.
  React.useEffect(() => {
    if (ref.current && value !== last.current) {
      ref.current.innerHTML = value || "";
      last.current = value;
    }
  }, [value]);
  React.useEffect(() => {
    if (ref.current) ref.current.innerHTML = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const emit = () => {
    const html = ref.current?.innerHTML ?? "";
    const clean = html === "<br>" || html === "<p><br></p>" ? "" : html;
    last.current = clean;
    onChange(clean);
  };

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && ref.current?.contains(sel.anchorNode)) savedRange.current = sel.getRangeAt(0).cloneRange();
  };
  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const Btn = ({ onClick, title, children, active }: { onClick: () => void; title: string; children: React.ReactNode; active?: boolean }) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn("rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-4", active && "bg-muted text-foreground")}
    >
      {children}
    </button>
  );

  return (
    <div className={cn("overflow-hidden rounded-lg border border-input bg-card shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/15", className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-1.5 py-1">
        {!source && (
          <>
            <Btn title="Paragraph" onClick={() => exec("formatBlock", "<p>")}>
              <Pilcrow />
            </Btn>
            <Btn title="Heading" onClick={() => exec("formatBlock", "<h2>")}>
              <Heading2 />
            </Btn>
            <Btn title="Subheading" onClick={() => exec("formatBlock", "<h3>")}>
              <Heading3 />
            </Btn>
            <span className="mx-1 h-5 w-px bg-border" />
            <Btn title="Bold (⌘B)" onClick={() => exec("bold")}>
              <Bold />
            </Btn>
            <Btn title="Italic (⌘I)" onClick={() => exec("italic")}>
              <Italic />
            </Btn>
            <Btn title="Underline (⌘U)" onClick={() => exec("underline")}>
              <Underline />
            </Btn>
            <span className="mx-1 h-5 w-px bg-border" />
            <Btn title="Bullet list" onClick={() => exec("insertUnorderedList")}>
              <List />
            </Btn>
            <Btn title="Numbered list" onClick={() => exec("insertOrderedList")}>
              <ListOrdered />
            </Btn>
            <Btn title="Quote" onClick={() => exec("formatBlock", "<blockquote>")}>
              <Quote />
            </Btn>
            <Btn
              title="Link"
              onClick={() => {
                const url = window.prompt("Link URL (https://… or /pages/…)");
                if (url) exec("createLink", url);
              }}
            >
              <Link2 />
            </Btn>
            <Btn
              title="Insert image"
              onClick={() => {
                saveSelection();
                setPicker(true);
              }}
            >
              <ImagePlus />
            </Btn>
            <Btn title="Clear formatting" onClick={() => exec("removeFormat")}>
              <RemoveFormatting />
            </Btn>
          </>
        )}
        <span className="ml-auto flex items-center gap-1">
          {toolbarExtra}
          <Btn title={source ? "Visual editor" : "HTML source"} onClick={() => setSource((s) => !s)} active={source}>
            <Code />
          </Btn>
        </span>
      </div>
      {source ? (
        <textarea
          value={value}
          onChange={(e) => {
            last.current = e.target.value;
            onChange(e.target.value);
          }}
          className="block w-full resize-y bg-card p-3 font-mono text-xs outline-none"
          style={{ minHeight }}
          spellCheck={false}
        />
      ) : (
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={emit}
          onBlur={emit}
          onPaste={(e) => {
            // Paste as plain text to avoid dragging in foreign styles.
            const text = e.clipboardData.getData("text/plain");
            if (text && !e.clipboardData.getData("text/html")) return;
            e.preventDefault();
            document.execCommand("insertText", false, text);
          }}
          className="prose-editor max-h-[520px] overflow-y-auto px-3.5 py-3 outline-none scrollbar-thin"
          style={{ minHeight }}
        />
      )}
      <MediaPickerDialog
        open={picker}
        onClose={() => setPicker(false)}
        onSelect={(urls) => {
          ref.current?.focus();
          restoreSelection();
          for (const u of urls) document.execCommand("insertImage", false, u);
          emit();
        }}
      />
    </div>
  );
}
