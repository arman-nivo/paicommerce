"use client";
import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button, cn, Dialog, Field, Input, Select, toast } from "@pai/ui";
import { aiProductDescription } from "../../actions";

const TONES = ["Friendly & trustworthy", "Premium & elegant", "Fun & energetic", "Simple & clear", "Professional"];

/** "✨ Write with AI" button + dialog. Calls `onApply(html, mode)`. */
export function AiDescriptionButton({ title, hasContent, onApply }: { title: string; hasContent: boolean; onApply: (html: string, mode: "replace" | "insert") => void }) {
  const [open, setOpen] = React.useState(false);
  const [language, setLanguage] = React.useState<"en" | "bn">("en");
  const [tone, setTone] = React.useState(TONES[0]!);
  const [keywords, setKeywords] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [html, setHtml] = React.useState("");

  const generate = async () => {
    if (!title.trim()) {
      toast.error("Add a product title first — AI uses it to write the description.");
      return;
    }
    setBusy(true);
    try {
      const r = await aiProductDescription({ title, language, tone, keywords });
      if (!r.ok) toast.error(r.error);
      else setHtml(r.data.html);
    } catch {
      toast.error("Couldn't reach the AI service — please try again.");
    } finally {
      setBusy(false);
    }
  };

  const apply = (mode: "replace" | "insert") => {
    onApply(html, mode);
    setOpen(false);
    setHtml("");
    toast.success(mode === "replace" ? "Description replaced" : "Added to description");
  };

  return (
    <>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(true)}
        className="ml-auto inline-flex h-7 items-center gap-1.5 rounded-md bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 px-2 text-xs font-medium text-violet-700 hover:from-violet-500/20 hover:to-fuchsia-500/20 dark:text-violet-300"
      >
        <Sparkles className="size-3.5" /> Write with AI
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title={
          <span className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-500" /> Write description with AI
          </span>
        }
        description={title ? `For “${title}”` : "Add a product title first."}
        footer={
          html ? (
            <>
              <Button variant="ghost" onClick={generate} loading={busy} className="mr-auto">
                Try again
              </Button>
              {hasContent && (
                <Button variant="outline" onClick={() => apply("insert")}>
                  Insert below
                </Button>
              )}
              <Button onClick={() => apply("replace")}>{hasContent ? "Replace description" : "Use this"}</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={generate} loading={busy} disabled={!title.trim()}>
                {!busy && <Sparkles />} Generate
              </Button>
            </>
          )
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Language">
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
                {(
                  [
                    ["en", "English"],
                    ["bn", "বাংলা"],
                  ] as const
                ).map(([v, l]) => (
                  <button key={v} type="button" onClick={() => setLanguage(v)} className={cn("h-7 rounded-md text-sm font-medium transition", language === v ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                    {l}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Tone">
              <Select value={tone} onChange={(e) => setTone(e.target.value)}>
                {TONES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Keywords (optional)" hint="Materials, features or selling points, e.g. “pure cotton, handmade, gift for Eid”.">
            <Input value={keywords} maxLength={300} onChange={(e) => setKeywords(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generate()} />
          </Field>
          {busy && !html && <div className="h-32 animate-pulse rounded-lg bg-muted" />}
          {html && (
            <div className="rounded-lg border border-violet-200 bg-violet-50/40 p-4 dark:border-violet-500/30 dark:bg-violet-500/5">
              <div className="prose-sm space-y-2 text-sm [&_li]:ml-5 [&_li]:list-disc" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}
